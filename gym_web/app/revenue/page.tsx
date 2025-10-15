'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'

export default function RevenuePage() {
  const [revenue, setRevenue] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [monthlyGoal, setMonthlyGoal] = useState(10000000) // 1000만원 기본 목표
  const [newRecord, setNewRecord] = useState({
    member: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    memo: '',
    source: '회원권'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const apiBase = getApiUrl()
      const [revenueRes, statsRes, membersRes] = await Promise.all([
        axios.get(`${apiBase}/revenue/`, { timeout: 30000 }),
        axios.get(`${apiBase}/revenue/stats/`, { timeout: 30000 }),
        axios.get(`${apiBase}/members/`, { timeout: 30000 })
      ])
      setRevenue(revenueRes.data)
      setStats(statsRes.data)
      setMembers(membersRes.data)
      console.log('✅ 매출 데이터 로드 성공')
    } catch (err) {
      console.error('❌ 매출 데이터 로드 실패:', err)
      setRevenue([])
      setStats(null)
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    axios.post(`${API_BASE}/revenue/`, {
      ...newRecord,
      member: newRecord.member || null
    })
      .then(() => {
        alert('매출이 추가되었습니다')
        setNewRecord({
          member: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          memo: '',
          source: '회원권'
        })
        loadData()
      })
      .catch(err => {
        console.error(err)
        alert('추가 실패')
      })
  }

  if (loading || !stats) {
    return <div style={{ textAlign: 'center', padding: 60 }}>로딩 중...</div>
  }

  const goalProgress = (stats.month_revenue / monthlyGoal) * 100
  const today = new Date()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const currentDay = today.getDate()
  const expectedProgress = (currentDay / daysInMonth) * 100
  const isOnTrack = goalProgress >= expectedProgress

  // 일별 매출 예측 (선형 회귀)
  const avgDailyRevenue = stats.month_revenue / currentDay
  const forecastRevenue = avgDailyRevenue * daysInMonth

  // 최근 30일 매출 추이
  const recentRevenue = stats.daily_revenue || []
  const last7Days = recentRevenue.slice(-7)
  const avgLast7Days = last7Days.reduce((sum: number, d: any) => sum + d.amount, 0) / 7

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h2 style={{ margin: 0, fontSize: '24px' }}>매출 관리</h2>

      {/* 매출 KPI */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
        gap: 12 
      }}>
        <div className="card" style={{ padding: 16 }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>이번 달 매출</div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>
            ₩ {(stats.month_revenue / 10000).toFixed(0)}만
          </div>
          <div style={{ fontSize: 11, marginTop: 4 }} className="muted">
            목표: {(monthlyGoal / 10000).toFixed(0)}만원
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>목표 달성률</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: isOnTrack ? 'var(--ok)' : 'var(--warn)' }}>
            {goalProgress.toFixed(1)}%
          </div>
          <div style={{ fontSize: 11, marginTop: 4 }} className="muted">
            {isOnTrack ? '✅ 순조로움' : '⚠️ 노력 필요'}
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>예상 매출</div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>
            ₩ {(forecastRevenue / 10000).toFixed(0)}만
          </div>
          <div style={{ fontSize: 11, marginTop: 4 }} className="muted">
            현재 추세 기준
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>오늘 매출</div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>
            ₩ {(stats.today_revenue / 10000).toFixed(0)}만
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>최근 7일 평균</div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>
            ₩ {(avgLast7Days / 10000).toFixed(0)}만
          </div>
          <div style={{ fontSize: 11, marginTop: 4 }} className="muted">
            일평균
          </div>
        </div>
      </div>

      {/* 목표 달성 프로그레스 */}
      <div className="card">
        <div style={{ 
          padding: '12px 16px', 
          borderBottom: '1px solid var(--line)',
          fontWeight: 600,
          fontSize: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>이번 달 목표 달성 현황</span>
          <input 
            type="number"
            value={monthlyGoal}
            onChange={(e) => setMonthlyGoal(Number(e.target.value))}
            style={{ 
              width: 140, 
              padding: '4px 8px', 
              fontSize: 13,
              textAlign: 'right'
            }}
            placeholder="목표 금액"
          />
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                <span>실제 매출</span>
                <span style={{ fontWeight: 700 }}>₩ {stats.month_revenue.toLocaleString()}</span>
              </div>
              <div style={{ 
                width: '100%', 
                height: 24, 
                backgroundColor: 'var(--pill)', 
                borderRadius: 999,
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  width: `${Math.min(goalProgress, 100)}%`,
                  height: '100%',
                  background: goalProgress >= 100 
                    ? 'linear-gradient(90deg, var(--ok), #00dd88)' 
                    : isOnTrack
                    ? 'linear-gradient(90deg, var(--pri), var(--pri2))'
                    : 'linear-gradient(90deg, var(--warn), var(--danger))',
                  transition: 'width 0.5s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: 12,
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'white'
                }}>
                  {goalProgress.toFixed(1)}%
                </div>
              </div>
            </div>

            <div style={{ fontSize: 13 }} className="muted">
              💡 {currentDay}일 경과 ({daysInMonth}일 중) · 
              예상 달성률: {expectedProgress.toFixed(1)}% · 
              남은 금액: ₩ {Math.max(monthlyGoal - stats.month_revenue, 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 최근 30일 매출 추이 */}
      <div className="card">
        <div style={{ 
          padding: '12px 16px', 
          borderBottom: '1px solid var(--line)',
          fontWeight: 600,
          fontSize: '14px'
        }}>
          최근 30일 매출 추이
        </div>
        <div style={{ padding: 16, overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, minWidth: 800, height: 200 }}>
            {recentRevenue.map((day: any, i: number) => {
              const maxAmount = Math.max(...recentRevenue.map((d: any) => d.amount), 1)
              const height = (day.amount / maxAmount) * 100
              
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, minHeight: 18 }}>
                    {day.amount > 0 ? `${(day.amount / 10000).toFixed(0)}` : ''}
                  </div>
                  <div style={{
                    width: '100%',
                    height: `${height}%`,
                    minHeight: day.amount > 0 ? 8 : 4,
                    background: day.amount > avgDailyRevenue
                      ? 'linear-gradient(135deg, var(--ok), #00dd88)'
                      : day.amount > avgDailyRevenue * 0.5
                      ? 'linear-gradient(135deg, var(--pri), var(--pri2))'
                      : 'var(--pill)',
                    borderRadius: 4,
                    transition: 'height 0.3s'
                  }} />
                  <div className="muted" style={{ fontSize: 9 }}>
                    {new Date(day.date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: 12, fontSize: 12 }} className="muted">
            💡 평균 일매출: ₩ {avgDailyRevenue.toLocaleString()} | 
            예상 월매출: ₩ {forecastRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 매출 기록 추가 폼 */}
      <div className="card">
        <div style={{ 
          padding: '12px 16px', 
          borderBottom: '1px solid var(--line)',
          fontWeight: 600 
        }}>
          매출 기록 추가
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 16 }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>금액 (원)</label>
                <input 
                  type="number"
                  value={newRecord.amount}
                  onChange={(e) => setNewRecord({ ...newRecord, amount: e.target.value })}
                  required
                  placeholder="100000"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>날짜</label>
                <input 
                  type="date"
                  value={newRecord.date}
                  onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>구분</label>
                <select 
                  value={newRecord.source}
                  onChange={(e) => setNewRecord({ ...newRecord, source: e.target.value })}
                >
                  <option value="회원권">회원권</option>
                  <option value="PT">PT</option>
                  <option value="락커">락커</option>
                  <option value="용품">용품</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>회원 (선택)</label>
                <select 
                  value={newRecord.member}
                  onChange={(e) => setNewRecord({ ...newRecord, member: e.target.value })}
                >
                  <option value="">선택 안 함</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.first_name} {m.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>메모</label>
              <input 
                type="text"
                value={newRecord.memo}
                onChange={(e) => setNewRecord({ ...newRecord, memo: e.target.value })}
                placeholder="선택 사항"
              />
            </div>
            
            <button type="submit">추가</button>
          </div>
        </form>
      </div>

      {/* 매출 기록 목록 */}
      <div className="card">
        <div style={{ 
          padding: '12px 16px', 
          borderBottom: '1px solid var(--line)',
          fontWeight: 600 
        }}>
          매출 기록 (최근 50개)
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>날짜</th>
                <th>금액</th>
                <th>구분</th>
                <th>회원</th>
                <th>메모</th>
              </tr>
            </thead>
            <tbody>
              {revenue.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted" style={{ textAlign: 'center', padding: 40 }}>
                    매출 기록이 없습니다
                  </td>
                </tr>
              ) : (
                revenue.slice(0, 50).map((record, i) => {
                  const member = record.member ? members.find(m => m.id === record.member) : null
                  
                  return (
                    <tr key={i}>
                      <td className="muted">{record.date}</td>
                      <td style={{ fontWeight: 600 }}>₩ {Number(record.amount).toLocaleString()}</td>
                      <td>
                        <span className="pill">
                          {record.source || '-'}
                        </span>
                      </td>
                      <td className="muted">{member ? `${member.first_name} ${member.last_name}` : '-'}</td>
                      <td className="muted" style={{ fontSize: 13 }}>{record.memo || '-'}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
