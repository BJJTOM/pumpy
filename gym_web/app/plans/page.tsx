'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'

type Plan = {
  id?: number
  name: string
  category: string
  price: number
  original_price?: number
  duration_days?: number
  duration_months?: number
  visits?: number
  period_type: string
  discount_rate: number
  includes_uniform: boolean
  includes_rashguard: boolean
  includes_locker: boolean
  description: string
  is_active: boolean
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [formData, setFormData] = useState<Plan>({
    name: '',
    category: '일반',
    price: 0,
    original_price: 0,
    duration_days: 0,
    duration_months: 0,
    visits: 0,
    period_type: '일반',
    discount_rate: 0,
    includes_uniform: false,
    includes_rashguard: false,
    includes_locker: false,
    description: '',
    is_active: true
  })

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    setLoading(true)
    try {
      const apiBase = getApiUrl()
      const res = await axios.get(`${apiBase}/plans/`, { timeout: 30000 })
      setPlans(res.data)
    } catch (err) {
      console.error('Plans loading failed:', err)
      setPlans([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const apiBase = getApiUrl()
      
      if (editingPlan?.id) {
        // 수정
        await axios.put(`${apiBase}/plans/${editingPlan.id}/`, formData)
        alert('상품이 수정되었습니다.')
      } else {
        // 추가
        await axios.post(`${apiBase}/plans/`, formData)
        alert('상품이 추가되었습니다.')
      }
      
      setShowForm(false)
      setEditingPlan(null)
      resetForm()
      loadPlans()
    } catch (err) {
      console.error('Failed to save plan:', err)
      alert('저장에 실패했습니다.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    
    try {
      const apiBase = getApiUrl()
      await axios.delete(`${apiBase}/plans/${id}/`)
      alert('삭제되었습니다.')
      loadPlans()
    } catch (err) {
      console.error('Failed to delete plan:', err)
      alert('삭제에 실패했습니다.')
    }
  }

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan)
    setFormData(plan)
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: '일반',
      price: 0,
      original_price: 0,
      duration_days: 0,
      duration_months: 0,
      visits: 0,
      period_type: '일반',
      discount_rate: 0,
      includes_uniform: false,
      includes_rashguard: false,
      includes_locker: false,
      description: '',
      is_active: true
    })
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <p>로딩 중...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: 800 }}>💼 상품 관리</h1>
          <p style={{ margin: 0, color: 'var(--text-sub)', fontSize: '15px' }}>
            전체 <strong style={{ color: 'var(--pri)' }}>{plans.length}개</strong> 상품
          </p>
        </div>
        <button
          onClick={() => {
            setEditingPlan(null)
            resetForm()
            setShowForm(true)
          }}
          className="btn btn-primary"
          style={{ padding: '14px 28px', fontSize: '16px', fontWeight: 700 }}
        >
          ➕ 상품 추가
        </button>
      </div>

      {/* 상품 추가/수정 폼 */}
      {showForm && (
        <div className="card" style={{ padding: '30px', marginBottom: '30px', backgroundColor: 'var(--bg2)' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 700 }}>
            {editingPlan ? '✏️ 상품 수정' : '➕ 새 상품 추가'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>상품명 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>카테고리 *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                  style={{ width: '100%' }}
                >
                  <option value="일반">일반 회원권</option>
                  <option value="다이어트">다이어트 프로그램</option>
                  <option value="실전반">실전반</option>
                  <option value="하드트레이닝">하드 트레이닝</option>
                  <option value="키즈">키즈 클래스</option>
                  <option value="PT">개인 레슨</option>
                  <option value="그룹">그룹 수업</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>가격 *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>정가</label>
                <input
                  type="number"
                  value={formData.original_price || ''}
                  onChange={(e) => setFormData({...formData, original_price: Number(e.target.value) || 0})}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>기간 (일)</label>
                <input
                  type="number"
                  value={formData.duration_days || ''}
                  onChange={(e) => setFormData({...formData, duration_days: Number(e.target.value) || 0})}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>기간 (개월)</label>
                <input
                  type="number"
                  value={formData.duration_months || ''}
                  onChange={(e) => setFormData({...formData, duration_months: Number(e.target.value) || 0})}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>총 횟수</label>
                <input
                  type="number"
                  value={formData.visits || ''}
                  onChange={(e) => setFormData({...formData, visits: Number(e.target.value) || 0})}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>수련 주기</label>
                <select
                  value={formData.period_type}
                  onChange={(e) => setFormData({...formData, period_type: e.target.value})}
                  style={{ width: '100%' }}
                >
                  <option value="일반">일반 (횟수 제한 없음)</option>
                  <option value="횟수제">횟수제</option>
                  <option value="주_2회">주 2회 기준</option>
                  <option value="주_3회">주 3회 기준</option>
                  <option value="주_4-6회">주 4-6회 (매일)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>할인율 (%)</label>
                <input
                  type="number"
                  value={formData.discount_rate}
                  onChange={(e) => setFormData({...formData, discount_rate: Number(e.target.value)})}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>상세 설명</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={formData.includes_uniform}
                  onChange={(e) => setFormData({...formData, includes_uniform: e.target.checked})}
                />
                도복 포함
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={formData.includes_rashguard}
                  onChange={(e) => setFormData({...formData, includes_rashguard: e.target.checked})}
                />
                레시가드 포함
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={formData.includes_locker}
                  onChange={(e) => setFormData({...formData, includes_locker: e.target.checked})}
                />
                락커 포함
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                />
                활성화
              </label>
            </div>

            <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                {editingPlan ? '✅ 수정 완료' : '➕ 추가'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingPlan(null)
                  resetForm()
                }}
                className="btn btn-secondary"
                style={{ padding: '12px 24px' }}
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 상품 목록 */}
      {plans.length === 0 ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>📦</div>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: 700 }}>
            등록된 상품이 없습니다
          </h3>
          <p style={{ margin: 0, color: 'var(--text-sub)' }}>
            상품을 추가하여 회원권을 관리하세요
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {plans.map(plan => (
            <div key={plan.id} className="card" style={{ padding: '24px', position: 'relative' }}>
              {!plan.is_active && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  padding: '4px 10px',
                  backgroundColor: 'var(--text-disabled)',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  비활성
                </div>
              )}
              
              <div style={{ marginBottom: '12px' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  backgroundColor: 'var(--pill)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--pri)'
                }}>
                  {plan.category}
                </span>
              </div>

              <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 800 }}>
                {plan.name}
              </h3>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--pri)' }}>
                  {Number(plan.price).toLocaleString()}원
                </div>
                {plan.original_price && plan.original_price > plan.price && (
                  <div style={{ fontSize: '14px', color: 'var(--text-sub)', textDecoration: 'line-through' }}>
                    정가: {Number(plan.original_price).toLocaleString()}원
                  </div>
                )}
              </div>

              {plan.description && (
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-sub)', lineHeight: '1.6' }}>
                  {plan.description}
                </p>
              )}

              <div style={{ marginBottom: '16px', fontSize: '13px', color: 'var(--text-sub)' }}>
                {plan.duration_days && <div>📅 {plan.duration_days}일</div>}
                {plan.duration_months && <div>📅 {plan.duration_months}개월</div>}
                {plan.visits && <div>🎫 {plan.visits}회</div>}
                {plan.period_type !== '일반' && <div>📊 {plan.period_type}</div>}
              </div>

              {(plan.includes_uniform || plan.includes_rashguard || plan.includes_locker) && (
                <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {plan.includes_uniform && <span style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: 'var(--ok)', color: 'white', borderRadius: '4px' }}>도복</span>}
                  {plan.includes_rashguard && <span style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: 'var(--ok)', color: 'white', borderRadius: '4px' }}>레시가드</span>}
                  {plan.includes_locker && <span style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: 'var(--ok)', color: 'white', borderRadius: '4px' }}>락커</span>}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                <button
                  onClick={() => handleEdit(plan)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '10px' }}
                >
                  ✏️ 수정
                </button>
                <button
                  onClick={() => plan.id && handleDelete(plan.id)}
                  className="btn"
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: 'var(--danger)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  🗑️ 삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
