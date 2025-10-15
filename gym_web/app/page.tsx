'use client'
import { useEffect, useState, useMemo, memo } from 'react'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'

type DashboardStats = {
  total_members: number
  active_members: number
  paused_members: number
  cancelled_members: number
  expire_7days: number
  expire_3days: number
  expire_today: number
  expired_members: any[]
  new_members_this_month: number
  inactive_members: any[]
  attendance_rate: number
  month_revenue: number
  revenue_growth: number
  renewal_rate: number
}

// 로딩 스피너 컴포넌트
const LoadingSpinner = memo(() => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '60vh',
    flexDirection: 'column',
    gap: '16px'
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      border: '4px solid var(--border-color)',
      borderTop: '4px solid var(--primary-color)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>데이터를 불러오는 중...</p>
    <style jsx>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
))
LoadingSpinner.displayName = 'LoadingSpinner'

// KPI 카드 컴포넌트
const KPICard = memo(({ title, value, subtitle, trend }: { 
  title: string, 
  value: string | number, 
  subtitle?: string,
  trend?: { value: number, positive: boolean }
}) => (
  <div className="card" style={{ padding: 16 }}>
    <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>{title}</div>
    <div style={{ fontSize: '24px', fontWeight: 800 }}>{value}</div>
    {trend && (
      <div style={{ fontSize: 12, marginTop: 4, color: trend.positive ? 'var(--ok)' : 'var(--danger)' }}>
        {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
      </div>
    )}
    {subtitle && (
      <div style={{ fontSize: 11, marginTop: 4 }} className="muted">{subtitle}</div>
    )}
  </div>
))
KPICard.displayName = 'KPICard'

// 출석 차트 컴포넌트
const AttendanceChart = memo(({ data }: { data: { date: string; count: number }[] }) => {
  const maxCount = useMemo(() => Math.max(...data.map(d => d.count), 1), [data])
  
  return (
    <div className="card">
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid var(--border-color)',
        fontWeight: 600,
        fontSize: '14px'
      }}>
        최근 7일 출석 현황
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160 }}>
          {data.map((day, i) => {
            const height = (day.count / maxCount) * 100
            
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{day.count}</div>
                <div style={{
                  width: '100%',
                  height: `${height}%`,
                  minHeight: day.count > 0 ? 20 : 4,
                  background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))',
                  borderRadius: 6,
                  transition: 'height 0.3s'
                }} />
                <div className="muted" style={{ fontSize: 10 }}>
                  {new Date(day.date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
})
AttendanceChart.displayName = 'AttendanceChart'

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [weeklyAttendance, setWeeklyAttendance] = useState<{ date: string; count: number }[]>([])
  const [revenueStats, setRevenueStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const apiBase = getApiUrl()
        console.log('🔗 API 주소:', apiBase) // 디버깅용
        
        // 타임아웃 설정으로 무한 로딩 방지
        const timeout = 30000 // 30초
        
        const [dashRes, attendanceRes, revenueRes] = await Promise.all([
          axios.get(`${apiBase}/members/dashboard_stats/`, { timeout }),
          axios.get(`${apiBase}/attendance/weekly_stats/`, { timeout }),
          axios.get(`${apiBase}/revenue/stats/`, { timeout })
        ])
        
        console.log('✅ 대시보드 데이터 로드 성공')
        setStats(dashRes.data)
        setWeeklyAttendance(attendanceRes.data)
        setRevenueStats(revenueRes.data)
      } catch (err: any) {
        console.error('❌ 대시보드 데이터 로드 실패:', err)
        if (err.response) {
          console.error('서버 응답 에러:', err.response.status, err.response.data)
        } else if (err.request) {
          console.error('서버 연결 실패:', err.message)
          alert('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.')
        } else {
          console.error('요청 설정 에러:', err.message)
        }
        
        // 빈 데이터로 초기화
        setStats({
          total_members: 0,
          active_members: 0,
          paused_members: 0,
          cancelled_members: 0,
          expire_7days: 0,
          expire_3days: 0,
          expire_today: 0,
          expired_members: [],
          new_members_this_month: 0,
          inactive_members: [],
          attendance_rate: 0,
          month_revenue: 0,
          revenue_growth: 0,
          renewal_rate: 0
        })
        setWeeklyAttendance([])
        setRevenueStats(null)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const hasAlerts = useMemo(() => 
    stats ? stats.expire_7days > 0 || stats.expired_members.length > 0 || stats.inactive_members.length > 0 : false,
    [stats]
  )

  if (loading || !stats) {
    return <LoadingSpinner />
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: '24px' }}>📊 대시보드</h2>
        <div style={{ fontSize: '14px' }} className="muted">
          {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
        </div>
      </div>

      {/* 🚨 알림 섹션 */}
      {hasAlerts && (
        <div style={{ 
          backgroundColor: 'var(--warn)', 
          color: '#000', 
          padding: '16px', 
          borderRadius: '12px',
          display: 'grid',
          gap: 12
        }}>
          <div style={{ fontSize: '18px', fontWeight: 700 }}>⚠️ 주의가 필요한 항목</div>
          <div style={{ display: 'grid', gap: 8, fontSize: '14px' }}>
            {stats.expire_today > 0 && (
              <div>🔴 <b>오늘 만료:</b> {stats.expire_today}명</div>
            )}
            {stats.expire_3days > 0 && (
              <div>🟠 <b>3일 이내 만료:</b> {stats.expire_3days}명</div>
            )}
            {stats.expire_7days > 0 && (
              <div>🟡 <b>7일 이내 만료:</b> {stats.expire_7days}명</div>
            )}
            {stats.expired_members.length > 0 && (
              <div>❌ <b>만료 후 미갱신:</b> {stats.expired_members.length}명</div>
            )}
            {stats.inactive_members.length > 0 && (
              <div>💤 <b>30일 미출석:</b> {stats.inactive_members.length}명</div>
            )}
          </div>
        </div>
      )}
      
      {/* KPI 카드 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
        gap: 12 
      }}>
        <div className="card" style={{ padding: 16 }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>이번 달 매출</div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>
            ₩ {(stats.month_revenue / 10000).toFixed(0)}만
          </div>
          {revenueStats && stats.revenue_growth !== 0 && (
            <div style={{ fontSize: 12, marginTop: 4, color: stats.revenue_growth > 0 ? 'var(--ok)' : 'var(--danger)' }}>
              {stats.revenue_growth > 0 ? '↑' : '↓'} {Math.abs(stats.revenue_growth)}%
            </div>
          )}
        </div>
        
        <div className="card" style={{ padding: 16 }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>활성 회원</div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{stats.active_members}</div>
          <div style={{ fontSize: 11, marginTop: 4 }} className="muted">
            전체 {stats.total_members}명
          </div>
        </div>
        
        <div className="card" style={{ padding: 16 }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>신규 회원</div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{stats.new_members_this_month}</div>
          <div style={{ fontSize: 11, marginTop: 4 }} className="muted">이번 달</div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>주간 출석률</div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{stats.attendance_rate}%</div>
          <div style={{ fontSize: 11, marginTop: 4 }} className="muted">최근 7일</div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>재등록률</div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{stats.renewal_rate}%</div>
          <div style={{ fontSize: 11, marginTop: 4 }} className="muted">지난달 기준</div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>정지/해지</div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>
            {stats.paused_members + stats.cancelled_members}
          </div>
          <div style={{ fontSize: 11, marginTop: 4 }} className="muted">
            {stats.paused_members}명 / {stats.cancelled_members}명
          </div>
        </div>
      </div>

      {/* 차트 섹션 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <div className="card">
          <div style={{ 
            padding: '12px 16px', 
            borderBottom: '1px solid var(--line)',
            fontWeight: 600,
            fontSize: '14px'
          }}>
            최근 7일 출석 현황
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160 }}>
              {weeklyAttendance.map((day, i) => {
                const maxCount = Math.max(...weeklyAttendance.map(d => d.count), 1)
                const height = (day.count / maxCount) * 100
                
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{day.count}</div>
                    <div style={{
                      width: '100%',
                      height: `${height}%`,
                      minHeight: day.count > 0 ? 20 : 4,
                      background: 'linear-gradient(135deg, var(--pri), var(--pri2))',
                      borderRadius: 6,
                      transition: 'height 0.3s'
                    }} />
                    <div className="muted" style={{ fontSize: 10 }}>
                      {new Date(day.date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ 
            padding: '12px 16px', 
            borderBottom: '1px solid var(--line)',
            fontWeight: 600,
            fontSize: '14px'
          }}>
            회원 현황
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>활성</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ 
                    flex: 1, 
                    height: 8, 
                    background: 'var(--ok)', 
                    borderRadius: 4,
                    width: `${(stats.active_members / stats.total_members) * 100}px`
                  }} />
                  <span style={{ fontWeight: 600 }}>{stats.active_members}명</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>정지</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ 
                    flex: 1, 
                    height: 8, 
                    background: 'var(--warn)', 
                    borderRadius: 4,
                    width: `${(stats.paused_members / stats.total_members) * 100}px`
                  }} />
                  <span style={{ fontWeight: 600 }}>{stats.paused_members}명</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>해지</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ 
                    flex: 1, 
                    height: 8, 
                    background: 'var(--danger)', 
                    borderRadius: 4,
                    width: `${(stats.cancelled_members / stats.total_members) * 100}px`
                  }} />
                  <span style={{ fontWeight: 600 }}>{stats.cancelled_members}명</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 액션 필요 목록 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {stats.expired_members.length > 0 && (
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
              <span>❌ 만료 후 미갱신</span>
              <span className="pill" style={{ backgroundColor: 'var(--danger)', color: 'white', border: 'none' }}>
                {stats.expired_members.length}
              </span>
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ display: 'grid', gap: 8, fontSize: '13px' }}>
                {stats.expired_members.slice(0, 5).map((m: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: 'var(--pill)', borderRadius: 6 }}>
                    <span>{m.first_name} {m.last_name}</span>
                    <span className="muted">{m.expire_date}</span>
                  </div>
                ))}
              </div>
              {stats.expired_members.length > 5 && (
                <a href="/members" style={{ display: 'block', textAlign: 'center', marginTop: 12, fontSize: '13px' }}>
                  +{stats.expired_members.length - 5}명 더보기
                </a>
              )}
            </div>
          </div>
        )}

        {stats.inactive_members.length > 0 && (
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
              <span>💤 30일 미출석</span>
              <span className="pill" style={{ backgroundColor: 'var(--warn)', color: '#000', border: 'none' }}>
                {stats.inactive_members.length}
              </span>
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ display: 'grid', gap: 8, fontSize: '13px' }}>
                {stats.inactive_members.slice(0, 5).map((m: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: 'var(--pill)', borderRadius: 6 }}>
                    <span>{m.first_name} {m.last_name}</span>
                    <span className="muted">{m.phone}</span>
                  </div>
                ))}
              </div>
              {stats.inactive_members.length > 5 && (
                <a href="/members" style={{ display: 'block', textAlign: 'center', marginTop: 12, fontSize: '13px' }}>
                  +{stats.inactive_members.length - 5}명 더보기
                </a>
              )}
            </div>
          </div>
        )}

        <div className="card">
          <div style={{ 
            padding: '12px 16px', 
            borderBottom: '1px solid var(--line)',
            fontWeight: 600,
            fontSize: '14px'
          }}>
            🚀 빠른 액션
          </div>
          <div style={{ padding: 12, display: 'grid', gap: 8 }}>
            <a href="/checkin" style={{ 
              padding: '12px 14px', 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              borderRadius: 8, 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 700,
              textAlign: 'center'
            }}>
              ✅ 출석 체크 (터치)
            </a>
            <a href="/app" style={{ 
              padding: '12px 14px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 8, 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 700,
              textAlign: 'center'
            }}>
              📱 회원용 앱 접속
            </a>
            <a href="/signup" style={{ 
              padding: '12px 14px', 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              borderRadius: 8, 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 700,
              textAlign: 'center'
            }}>
              ✍️ 회원 신청 페이지
            </a>
            <a href="/members/new" style={{ 
              padding: '12px 14px', 
              backgroundColor: 'var(--pill)', 
              borderRadius: 8, 
              display: 'block', 
              fontSize: '14px',
              textAlign: 'center'
            }}>
              + 회원 추가
            </a>
            <a href="/attendance" style={{ 
              padding: '12px 14px', 
              backgroundColor: 'var(--pill)', 
              borderRadius: 8, 
              display: 'block', 
              fontSize: '14px',
              textAlign: 'center'
            }}>
              출석 기록
            </a>
            <a href="/revenue" style={{ 
              padding: '12px 14px', 
              backgroundColor: 'var(--pill)', 
              borderRadius: 8, 
              display: 'block', 
              fontSize: '14px',
              textAlign: 'center'
            }}>
              매출 입력
            </a>
            <a href="/members" style={{ 
              padding: '12px 14px', 
              backgroundColor: 'var(--pill)', 
              borderRadius: 8, 
              display: 'block', 
              fontSize: '14px',
              textAlign: 'center'
            }}>
              회원 관리
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
