'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [filteredPlans, setFilteredPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('?�체')
  const [formData, setFormData] = useState({
    name: '',
    category: '?�반',
    price: '',
    original_price: '',
    duration_months: '',
    duration_days: '',
    visits: '',
    weekly_limit: '',
    discount_rate: '',
    includes_uniform: false,
    includes_rashguard: false,
    includes_locker: false,
    includes_towel: false,
    includes_gear: false,
    is_popular: false,
    description: '',
    notes: ''
  })

  const categories = ['?�체', '?�반', '?�이?�트', '?�전�?, '?�드?�레?�닝', '?�즈', 'PT', '그룹']

  useEffect(() => {
    loadPlans()
  }, [])

  useEffect(() => {
    if (selectedCategory === '?�체') {
      setFilteredPlans(plans)
    } else {
      setFilteredPlans(plans.filter(p => p.category === selectedCategory))
    }
  }, [selectedCategory, plans])

  const loadPlans = async () => {
    setLoading(true)
    try {
      const apiBase = getApiUrl()
      const res = await axios.get(`${apiBase}/plans/`, { timeout: 30000 })
      setPlans(res.data)
      setFilteredPlans(res.data)
      console.log('???�품 ?�이??로드 ?�공')
    } catch (err) {
      console.error('???�품 ?�이??로드 ?�패:', err)
      setPlans([])
      setFilteredPlans([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const data = {
      name: formData.name,
      category: formData.category,
      price: Number(formData.price),
      original_price: formData.original_price ? Number(formData.original_price) : null,
      duration_months: formData.duration_months ? Number(formData.duration_months) : null,
      duration_days: formData.duration_days ? Number(formData.duration_days) : null,
      visits: formData.visits ? Number(formData.visits) : null,
      weekly_limit: formData.weekly_limit ? Number(formData.weekly_limit) : null,
      discount_rate: formData.discount_rate ? Number(formData.discount_rate) : 0,
      includes_uniform: formData.includes_uniform,
      includes_rashguard: formData.includes_rashguard,
      includes_locker: formData.includes_locker,
      includes_towel: formData.includes_towel,
      includes_gear: formData.includes_gear,
      is_popular: formData.is_popular,
      description: formData.description,
      notes: formData.notes
    }

    const request = editingPlan
      ? axios.put(`${getApiUrl()}/plans/${editingPlan.id}/`, data)
      : axios.post(`${getApiUrl()}/plans/`, data)

    request
      .then(() => {
        alert(editingPlan ? '???�정?�었?�니?? : '???�록?�었?�니??)
        setShowModal(false)
        setEditingPlan(null)
        resetForm()
        loadPlans()
      })
      .catch(err => alert('???�패: ' + (err.response?.data?.detail || '?�류가 발생?�습?�다')))
  }

  const handleDelete = (id: number) => {
    if (!confirm('?�말 ??��?�시겠습?�까?')) return

    axios.delete(`${getApiUrl()}/plans/${id}/`)
      .then(() => {
        alert('??��?�었?�니??)
        loadPlans()
      })
      .catch(err => alert('??�� ?�패'))
  }

  const handleEdit = (plan: any) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      category: plan.category || '?�반',
      price: plan.price,
      original_price: plan.original_price || '',
      duration_months: plan.duration_months || '',
      duration_days: plan.duration_days || '',
      visits: plan.visits || '',
      weekly_limit: plan.weekly_limit || '',
      discount_rate: plan.discount_rate || '',
      includes_uniform: plan.includes_uniform || false,
      includes_rashguard: plan.includes_rashguard || false,
      includes_locker: plan.includes_locker || false,
      includes_towel: plan.includes_towel || false,
      includes_gear: plan.includes_gear || false,
      is_popular: plan.is_popular || false,
      description: plan.description || '',
      notes: plan.notes || ''
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: '?�반',
      price: '',
      original_price: '',
      duration_months: '',
      duration_days: '',
      visits: '',
      weekly_limit: '',
      discount_rate: '',
      includes_uniform: false,
      includes_rashguard: false,
      includes_locker: false,
      includes_towel: false,
      includes_gear: false,
      is_popular: false,
      description: '',
      notes: ''
    })
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text)' }}>
        <div style={{ fontSize: '48px', marginBottom: 16 }}>??/div>
        <p>로딩 �?..</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2xl)', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: 'var(--text)' }}>
            ?�� ?�품 관�?          </h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-sub)' }}>
            �?{plans.length}�??�품 ??{filteredPlans.length}�??�시
          </p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn btn-primary">
          + ?�품 추�?
        </button>
      </div>

      {/* 카테고리 ?�터 */}
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="btn btn-sm"
              style={{
                backgroundColor: selectedCategory === cat ? 'var(--pri)' : 'var(--pill)',
                color: selectedCategory === cat ? 'white' : 'var(--text)',
                border: 'none'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ?�품 그리??*/}
      {filteredPlans.length === 0 ? (
        <div className="card" style={{ padding: 'var(--spacing-4xl)', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: 16 }}>?��</div>
          <p style={{ color: 'var(--text-sub)' }}>?�록???�품???�습?�다</p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: 16 }}>
            �??�품 추�??�기
          </button>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: 'var(--spacing-lg)' 
        }}>
          {filteredPlans.map(plan => (
            <div key={plan.id} className="card" style={{ padding: 'var(--spacing-xl)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>
                    {plan.name}
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                  {plan.is_popular && <span className="badge danger">?�기</span>}
                  {plan.category && <span className="badge success">{plan.category}</span>}
                </div>
              </div>

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--pri)' }}>
                  ??Number(plan.price).toLocaleString()}
                </div>
                {plan.original_price && Number(plan.original_price) > Number(plan.price) && (
                  <div style={{ fontSize: '14px', color: 'var(--text-disabled)', textDecoration: 'line-through' }}>
                    ??Number(plan.original_price).toLocaleString()}
                  </div>
                )}
                {plan.discount_rate > 0 && (
                  <span className="badge danger" style={{ marginTop: 4 }}>
                    {plan.discount_rate}% ?�인
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gap: 'var(--spacing-sm)', fontSize: '14px', marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md)', backgroundColor: 'var(--pill)', borderRadius: 'var(--radius-lg)' }}>
                {plan.duration_months && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-sub)' }}>기간</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{plan.duration_months}개월</span>
                  </div>
                )}
                {plan.duration_days && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-sub)' }}>?�수</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{plan.duration_days}??/span>
                  </div>
                )}
                {plan.visits && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-sub)' }}>?�수</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{plan.visits}??/span>
                  </div>
                )}
                {plan.weekly_limit && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-sub)' }}>주당</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{plan.weekly_limit}??/span>
                  </div>
                )}
              </div>

              {(plan.includes_uniform || plan.includes_rashguard || plan.includes_locker || plan.includes_towel || plan.includes_gear) && (
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', marginBottom: 'var(--spacing-xs)' }}>
                    ?�함 ?�항
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
                    {plan.includes_uniform && <span className="pill" style={{ fontSize: '12px' }}>?�복</span>}
                    {plan.includes_rashguard && <span className="pill" style={{ fontSize: '12px' }}>?�쉬가??/span>}
                    {plan.includes_locker && <span className="pill" style={{ fontSize: '12px' }}>?�커</span>}
                    {plan.includes_towel && <span className="pill" style={{ fontSize: '12px' }}>?�건</span>}
                    {plan.includes_gear && <span className="pill" style={{ fontSize: '12px' }}>?�비</span>}
                  </div>
                </div>
              )}

              {plan.description && (
                <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginBottom: 'var(--spacing-lg)', lineHeight: 1.5 }}>
                  {plan.description}
                </p>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)', marginTop: 'auto' }}>
                <button onClick={() => handleEdit(plan)} className="btn btn-secondary btn-sm">
                  ?�정
                </button>
                <button onClick={() => handleDelete(plan.id)} className="btn btn-sm" style={{ 
                  backgroundColor: 'transparent',
                  border: '1px solid var(--line)',
                  color: 'var(--danger)'
                }}>
                  ??��
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 모달 */}
      {showModal && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1000,
            }}
            onClick={() => { setShowModal(false); setEditingPlan(null); }}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'var(--card-bg)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 1001,
              width: '90%',
              maxWidth: 600,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ padding: 'var(--spacing-3xl)' }}>
              <h2 style={{ margin: '0 0 var(--spacing-xl) 0', fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>
                {editingPlan ? '?�️ ?�품 ?�정' : '???�품 추�?'}
              </h2>

              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
                <div>
                  <label>?�품�?*</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="?? 주짓??무제??1개월"
                  />
                </div>

                <div>
                  <label>카테고리</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.filter(c => c !== '?�체').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div>
                    <label>?�매가�?(?? *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      placeholder="150000"
                    />
                  </div>
                  <div>
                    <label>?��? (??</label>
                    <input
                      type="number"
                      value={formData.original_price}
                      onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                      placeholder="200000"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div>
                    <label>기간 (개월)</label>
                    <input
                      type="number"
                      value={formData.duration_months}
                      onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label>기간 (??</label>
                    <input
                      type="number"
                      value={formData.duration_days}
                      onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div>
                    <label>?�수</label>
                    <input
                      type="number"
                      value={formData.visits}
                      onChange={(e) => setFormData({ ...formData, visits: e.target.value })}
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label>주당 ?�수</label>
                    <input
                      type="number"
                      value={formData.weekly_limit}
                      onChange={(e) => setFormData({ ...formData, weekly_limit: e.target.value })}
                      placeholder="3"
                    />
                  </div>
                  <div>
                    <label>?�인??(%)</label>
                    <input
                      type="number"
                      value={formData.discount_rate}
                      onChange={(e) => setFormData({ ...formData, discount_rate: e.target.value })}
                      placeholder="10"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ marginBottom: 'var(--spacing-sm)' }}>?�함 ?�항</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 'var(--spacing-sm)' }}>
                    {[
                      { key: 'includes_uniform', label: '?�복' },
                      { key: 'includes_rashguard', label: '?�쉬가?? },
                      { key: 'includes_locker', label: '?�커' },
                      { key: 'includes_towel', label: '?�건' },
                      { key: 'includes_gear', label: '?�비' }
                    ].map(item => (
                      <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData[item.key as keyof typeof formData] as boolean}
                          onChange={(e) => setFormData({ ...formData, [item.key]: e.target.checked })}
                        />
                        <span style={{ fontSize: '14px', color: 'var(--text)' }}>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer', padding: 'var(--spacing-md)', backgroundColor: 'var(--pill)', borderRadius: 'var(--radius-lg)' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_popular}
                    onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                  />
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>�??�기 ?�품?�로 ?�시</span>
                </label>

                <div>
                  <label>?�품 ?�명</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="?�품???�???�명???�력?�세??
                    rows={3}
                  />
                </div>

                <div>
                  <label>?��? 메모</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="관리자??메모"
                    rows={2}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
                  <button 
                    type="button" 
                    onClick={() => { setShowModal(false); setEditingPlan(null); }}
                    className="btn btn-secondary"
                  >
                    취소
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingPlan ? '?�정' : '추�?'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
