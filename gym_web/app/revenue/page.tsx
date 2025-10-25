'use client'
import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'

type Revenue = {
  id?: number
  member?: number
  member_name?: string
  amount: number
  date: string
  source: string
  memo: string
}

type Stats = {
  today: number
  month: number
  year: number
}

export default function RevenuePage() {
  const [revenue, setRevenue] = useState<Revenue[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingRevenue, setEditingRevenue] = useState<Revenue | null>(null)
  const [formData, setFormData] = useState<Revenue>({
    member: 0,
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    source: '',
    memo: ''
  })
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('month')

  useEffect(() => {
    loadRevenue()
    loadMembers()
  }, [])

  const loadRevenue = async () => {
    setLoading(true)
    try {
      const apiBase = getApiUrl()
      const res = await axios.get(`${apiBase}/revenue/`, { timeout: 30000 })
      setRevenue(res.data)
    } catch (err) {
      console.error('Revenue loading failed:', err)
      setRevenue([])
    } finally {
      setLoading(false)
    }
  }

  const loadMembers = async () => {
    try {
      const apiBase = getApiUrl()
      const res = await axios.get(`${apiBase}/members/`, { timeout: 30000 })
      setMembers(res.data)
    } catch (err) {
      console.error('Members loading failed:', err)
    }
  }

  const stats: Stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const thisMonth = today.slice(0, 7)
    const thisYear = today.slice(0, 4)

    return {
      today: revenue.filter(r => r.date === today).reduce((sum, r) => sum + Number(r.amount), 0),
      month: revenue.filter(r => r.date.startsWith(thisMonth)).reduce((sum, r) => sum + Number(r.amount), 0),
      year: revenue.filter(r => r.date.startsWith(thisYear)).reduce((sum, r) => sum + Number(r.amount), 0),
    }
  }, [revenue])

  const filteredRevenue = useMemo(() => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    return revenue.filter(r => {
      const revDate = new Date(r.date)
      
      switch (dateFilter) {
        case 'today':
          return r.date === todayStr
        case 'week':
          const weekAgo = new Date(today)
          weekAgo.setDate(weekAgo.getDate() - 7)
          return revDate >= weekAgo
        case 'month':
          return r.date.startsWith(todayStr.slice(0, 7))
        case 'year':
          return r.date.startsWith(todayStr.slice(0, 4))
        case 'all':
        default:
          return true
      }
    })
  }, [revenue, dateFilter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const apiBase = getApiUrl()
      
      if (editingRevenue?.id) {
        await axios.put(`${apiBase}/revenue/${editingRevenue.id}/`, formData)
        alert('매출이 수정되었습니다.')
      } else {
        await axios.post(`${apiBase}/revenue/`, formData)
        alert('매출이 추가되었습니다.')
      }
      
      setShowForm(false)
      setEditingRevenue(null)
      resetForm()
      loadRevenue()
    } catch (err) {
      console.error('Failed to save revenue:', err)
      alert('저장에 실패했습니다.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    
    try {
      const apiBase = getApiUrl()
      await axios.delete(`${apiBase}/revenue/${id}/`)
      alert('삭제되었습니다.')
      loadRevenue()
    } catch (err) {
      console.error('Failed to delete revenue:', err)
      alert('삭제에 실패했습니다.')
    }
  }

  const handleEdit = (rev: Revenue) => {
    setEditingRevenue(rev)
    setFormData(rev)
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      member: 0,
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      source: '',
      memo: ''
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
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: 800 }}>💰 매출 관리</h1>
            <p style={{ margin: 0, color: 'var(--text-sub)', fontSize: '15px' }}>
              전체 <strong style={{ color: 'var(--pri)' }}>{revenue.length}건</strong> 매출 기록
            </p>
          </div>
          <button
            onClick={() => {
              setEditingRevenue(null)
              resetForm()
              setShowForm(true)
            }}
            className="btn btn-primary"
            style={{ padding: '14px 28px', fontSize: '16px', fontWeight: 700 }}
          >
            ➕ 매출 추가
          </button>
        </div>

        {/* 통계 카드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-sub)', marginBottom: '8px', fontWeight: 600 }}>오늘</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--pri)' }}>
              {stats.today.toLocaleString()}원
            </div>
          </div>
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-sub)', marginBottom: '8px', fontWeight: 600 }}>이번 달</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ok)' }}>
              {stats.month.toLocaleString()}원
            </div>
          </div>
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-sub)', marginBottom: '8px', fontWeight: 600 }}>올해</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)' }}>
              {stats.year.toLocaleString()}원
            </div>
          </div>
        </div>
      </div>

      {/* 필터 */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { value: 'today', label: '오늘' },
            { value: 'week', label: '최근 7일' },
            { value: 'month', label: '이번 달' },
            { value: 'year', label: '올해' },
            { value: 'all', label: '전체' }
          ].map(filter => (
            <button
              key={filter.value}
              onClick={() => setDateFilter(filter.value as any)}
              className="btn"
              style={{
                padding: '10px 20px',
                backgroundColor: dateFilter === filter.value ? 'var(--pri)' : 'var(--pill)',
                color: dateFilter === filter.value ? 'white' : 'var(--text)',
                border: 'none'
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* 매출 추가/수정 폼 */}
      {showForm && (
        <div className="card" style={{ padding: '30px', marginBottom: '30px', backgroundColor: 'var(--bg2)' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 700 }}>
            {editingRevenue ? '✏️ 매출 수정' : '➕ 새 매출 추가'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>날짜 *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>금액 *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                  required
                  style={{ width: '100%' }}
                  placeholder="100000"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>회원</label>
                <select
                  value={formData.member || ''}
                  onChange={(e) => setFormData({...formData, member: Number(e.target.value) || 0})}
                  style={{ width: '100%' }}
                >
                  <option value="">선택 안 함</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.full_name || m.name || `${m.last_name}${m.first_name}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>출처</label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                  style={{ width: '100%' }}
                  placeholder="회원권, PT, 용품 판매 등"
                />
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>메모</label>
              <textarea
                value={formData.memo}
                onChange={(e) => setFormData({...formData, memo: e.target.value})}
                rows={3}
                style={{ width: '100%' }}
                placeholder="추가 메모 사항"
              />
            </div>

            <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                {editingRevenue ? '✅ 수정 완료' : '➕ 추가'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingRevenue(null)
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

      {/* 매출 목록 */}
      {filteredRevenue.length === 0 ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>💰</div>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: 700 }}>
            매출 기록이 없습니다
          </h3>
          <p style={{ margin: 0, color: 'var(--text-sub)' }}>
            매출을 추가하여 관리를 시작하세요
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* 테이블 헤더 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '120px 140px 200px 1fr 150px 100px',
            gap: '16px',
            padding: '20px 24px',
            backgroundColor: 'var(--pill)',
            borderBottom: '2px solid var(--line)',
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--text-sub)'
          }}>
            <div>날짜</div>
            <div>금액</div>
            <div>회원</div>
            <div>출처/메모</div>
            <div style={{ textAlign: 'center' }}>작업</div>
          </div>

          {/* 테이블 바디 */}
          {filteredRevenue.map((rev) => {
            const member = members.find(m => m.id === rev.member)
            
            return (
              <div
                key={rev.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 140px 200px 1fr 150px 100px',
                  gap: '16px',
                  padding: '20px 24px',
                  borderBottom: '1px solid var(--line)',
                  alignItems: 'center',
                  transition: 'background-color 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg2)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  {rev.date}
                </div>

                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--pri)' }}>
                  {Number(rev.amount).toLocaleString()}원
                </div>

                <div style={{ fontSize: '14px', color: 'var(--text)' }}>
                  {member ? (member.full_name || member.name || `${member.last_name}${member.first_name}`) : '-'}
                </div>

                <div>
                  {rev.source && (
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
                      {rev.source}
                    </div>
                  )}
                  {rev.memo && (
                    <div style={{ fontSize: '13px', color: 'var(--text-sub)' }}>
                      {rev.memo}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button
                    onClick={() => handleEdit(rev)}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    ✏️ 수정
                  </button>
                  <button
                    onClick={() => rev.id && handleDelete(rev.id)}
                    className="btn"
                    style={{
                      padding: '8px 16px',
                      fontSize: '13px',
                      backgroundColor: 'var(--danger)',
                      color: 'white',
                      border: 'none'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 합계 */}
      {filteredRevenue.length > 0 && (
        <div className="card" style={{ padding: '20px', marginTop: '20px', textAlign: 'right' }}>
          <div style={{ fontSize: '16px', color: 'var(--text-sub)', marginBottom: '8px' }}>
            선택 기간 합계
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--pri)' }}>
            {filteredRevenue.reduce((sum, r) => sum + Number(r.amount), 0).toLocaleString()}원
          </div>
        </div>
      )}
    </div>
  )
}
