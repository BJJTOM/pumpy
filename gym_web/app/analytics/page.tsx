'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'

import { getApiUrl } from '@/lib/api'

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const apiBase = getApiUrl()
        const [statsRes, membersRes] = await Promise.all([
          axios.get(`${apiBase}/members/dashboard_stats/`, { timeout: 30000 }),
          axios.get(`${apiBase}/members/`, { timeout: 30000 })
        ])
        setStats(statsRes.data)
        setMembers(membersRes.data)
        console.log('✅ 분석 데이터 로드 성공')
      } catch (err) {
        console.error('❌ 분석 데이터 로드 실패:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading || !stats) {
    return <div style={{ textAlign: 'center', padding: 60 }}>로딩 중...</div>
  }

  // 회원 생애주기 분류
  const today = new Date()
  const newMembers = members.filter(m => {
    const joinDate = new Date(m.join_date)
    const daysSinceJoin = (today.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceJoin <= 30 && m.status === '활성'
  })

  const atRiskMembers = members.filter(m => {
    if (m.status !== '활성' || !m.expire_date) return false
    const expireDate = new Date(m.expire_date)
    const daysUntilExpire = (expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    return daysUntilExpire <= 7 && daysUntilExpire >= 0
  })

  const churnedMembers = members.filter(m => m.status === '해지')

  const loyalMembers = members.filter(m => {
    if (m.status !== '활성') return false
    const joinDate = new Date(m.join_date)
    const monthsSinceJoin = (today.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    return monthsSinceJoin >= 6
  })

  // 월별 가입/이탈 추이 (최근 6개월)
  const monthlyTrend = []
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0)
    
    const joined = members.filter(m => {
      const joinDate = new Date(m.join_date)
      return joinDate >= monthDate && joinDate <= monthEnd
    }).length

    monthlyTrend.push({
      month: monthDate.toLocaleDateString('ko-KR', { month: 'short' }),
      joined
    })
  }

  const maxJoined = Math.max(...monthlyTrend.map(m => m.joined), 1)

  // 리텐션 분석
  const totalChurned = churnedMembers.length
  const totalEverJoined = members.length
  const churnRate = totalEverJoined > 0 ? (totalChurned / totalEverJoined) * 100 : 0
  const retentionRate = 100 - churnRate

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h2 style={{ margin: 0, fontSize: '24px' }}>📊 회원 분석</h2>

      {/* 회원 생애주기 개요 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
        gap: 12 
      }}>
        <div className="card" style={{ padding: 16 }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>🆕 신규 회원</div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>
            {newMembers.length}명
          </div>
          <div style={{ fontSize: 11, marginTop: 4 }} className="muted">최근 30일</div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>💪 충성 회원</div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>
            {loyalMembers.length}명
          </div>
          <div style={{ fontSize: 11, marginTop: 4 }} className="muted">6개월 이상</div>
        </div>

        <div className="card" style={{ padding: 16, backgroundColor: 'rgba(255, 193, 7, 0.1)' }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>⚠️ 위험 회원</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--warn)' }}>
            {atRiskMembers.length}명
          </div>
          <div style={{ fontSize: 11, marginTop: 4 }} className="muted">7일 내 만료</div>
        </div>

        <div className="card" style={{ padding: 16, backgroundColor: 'rgba(244, 67, 54, 0.1)' }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>❌ 이탈 회원</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--danger)' }}>
            {churnedMembers.length}명
          </div>
          <div style={{ fontSize: 11, marginTop: 4 }} className="muted">해지 상태</div>
        </div>
      </div>

      {/* 리텐션 분석 */}
      <div className="card">
        <div style={{ 
          padding: '12px 16px', 
          borderBottom: '1px solid var(--line)',
          fontWeight: 600,
          fontSize: '14px'
        }}>
          리텐션 분석
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                <span>재등록률</span>
                <span style={{ fontWeight: 700, color: 'var(--ok)' }}>{stats.renewal_rate}%</span>
              </div>
              <div style={{ 
                width: '100%', 
                height: 20, 
                backgroundColor: 'var(--pill)', 
                borderRadius: 999,
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${stats.renewal_rate}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--ok), #00dd88)',
                  transition: 'width 0.5s'
                }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                <span>전체 리텐션</span>
                <span style={{ fontWeight: 700, color: 'var(--pri)' }}>{retentionRate.toFixed(1)}%</span>
              </div>
              <div style={{ 
                width: '100%', 
                height: 20, 
                backgroundColor: 'var(--pill)', 
                borderRadius: 999,
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${retentionRate}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--pri), var(--pri2))',
                  transition: 'width 0.5s'
                }} />
              </div>
            </div>

            <div style={{ fontSize: 13 }} className="muted">
              💡 총 {totalEverJoined}명 중 {stats.active_members}명 활성 / {churnedMembers.length}명 이탈
            </div>
          </div>
        </div>
      </div>

      {/* 월별 가입 추이 */}
      <div className="card">
        <div style={{ 
          padding: '12px 16px', 
          borderBottom: '1px solid var(--line)',
          fontWeight: 600,
          fontSize: '14px'
        }}>
          최근 6개월 가입 추이
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 200 }}>
            {monthlyTrend.map((month, i) => {
              const height = (month.joined / maxJoined) * 100
              
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{month.joined}</div>
                  <div style={{
                    width: '100%',
                    height: `${height}%`,
                    minHeight: month.joined > 0 ? 20 : 8,
                    background: 'linear-gradient(135deg, var(--pri), var(--pri2))',
                    borderRadius: 8,
                    transition: 'height 0.3s'
                  }} />
                  <div className="muted" style={{ fontSize: 12 }}>{month.month}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 위험 회원 목록 */}
      {atRiskMembers.length > 0 && (
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
            <span>⚠️ 만료 임박 회원 (조치 필요)</span>
            <span className="pill" style={{ backgroundColor: 'var(--warn)', color: '#000', border: 'none' }}>
              {atRiskMembers.length}
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>이름</th>
                  <th>연락처</th>
                  <th>만료일</th>
                  <th>남은 일수</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {atRiskMembers.map((m, i) => {
                  const daysLeft = Math.ceil((new Date(m.expire_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{m.first_name} {m.last_name}</td>
                      <td>{m.phone}</td>
                      <td className="muted">{m.expire_date}</td>
                      <td>
                        <span className="pill" style={{
                          backgroundColor: daysLeft <= 1 ? 'var(--danger)' : daysLeft <= 3 ? 'var(--warn)' : 'var(--pill)',
                          color: daysLeft <= 3 ? 'white' : 'var(--text)',
                          border: daysLeft > 3 ? '1px solid var(--pill-line)' : 'none'
                        }}>
                          D-{daysLeft}
                        </span>
                      </td>
                      <td>
                        <a href={`/members/${m.id}`}>
                          <button style={{ 
                            fontSize: 12, 
                            padding: '6px 12px',
                            backgroundColor: 'var(--pri)',
                            color: 'white',
                            border: 'none'
                          }}>
                            관리
                          </button>
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 신규 회원 목록 */}
      {newMembers.length > 0 && (
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
            <span>🆕 신규 회원 (최근 30일)</span>
            <span className="pill" style={{ backgroundColor: 'var(--ok)', color: 'white', border: 'none' }}>
              {newMembers.length}
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>이름</th>
                  <th>연락처</th>
                  <th>가입일</th>
                  <th>경과일</th>
                </tr>
              </thead>
              <tbody>
                {newMembers.slice(0, 10).map((m, i) => {
                  const daysSinceJoin = Math.floor((today.getTime() - new Date(m.join_date).getTime()) / (1000 * 60 * 60 * 24))
                  
                  return (
                    <tr 
                      key={i}
                      onClick={() => window.location.href = `/members/${m.id}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ fontWeight: 600 }}>{m.first_name} {m.last_name}</td>
                      <td>{m.phone}</td>
                      <td className="muted">{new Date(m.join_date).toLocaleDateString('ko-KR')}</td>
                      <td className="muted">{daysSinceJoin}일</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 인사이트 */}
      <div className="card" style={{ backgroundColor: 'var(--pill)' }}>
        <div style={{ 
          padding: '12px 16px', 
          borderBottom: '1px solid var(--line)',
          fontWeight: 600,
          fontSize: '14px'
        }}>
          💡 인사이트
        </div>
        <div style={{ padding: 16, display: 'grid', gap: 10, fontSize: 14 }}>
          {stats.renewal_rate < 50 && (
            <div>⚠️ <b>재등록률이 {stats.renewal_rate}%로 낮습니다.</b> 만료 전 적극적인 연락이 필요합니다.</div>
          )}
          {atRiskMembers.length > 5 && (
            <div>📞 <b>{atRiskMembers.length}명의 회원이 곧 만료됩니다.</b> 갱신 안내를 시작하세요.</div>
          )}
          {stats.inactive_members.length > 10 && (
            <div>💤 <b>{stats.inactive_members.length}명이 30일간 미출석</b> 상태입니다. 케어가 필요합니다.</div>
          )}
          {newMembers.length > 5 && (
            <div>🎉 <b>신규 회원 {newMembers.length}명!</b> 첫 달 관리가 중요합니다.</div>
          )}
          {stats.renewal_rate >= 70 && (
            <div>✅ <b>재등록률 {stats.renewal_rate}%!</b> 우수한 리텐션을 유지하고 있습니다.</div>
          )}
        </div>
      </div>
    </div>
  )
}


