'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [stats, setStats] = useState<any>(null)
  const [recentMembers, setRecentMembers] = useState<any[]>([])
  const [activeMenu, setActiveMenu] = useState('dashboard')

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      setIsAuthenticated(true)
      loadData()
    }
    setLoading(false)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    if (username === 'admin' && password === 'pumpy2025') {
      localStorage.setItem('admin_token', 'admin-authenticated')
      setIsAuthenticated(true)
      loadData()
    } else {
      setLoginError('아이디 또는 비밀번호가 올바르지 않습니다')
    }
  }

  const loadData = async () => {
    try {
      const apiBase = getApiUrl()
      const [membersRes, attendanceRes] = await Promise.all([
        axios.get(`${apiBase}/members/`, { timeout: 10000 }),
        axios.get(`${apiBase}/attendance/`, { timeout: 10000 })
      ])
      
      const members = membersRes.data
      const attendance = attendanceRes.data
      
      const activeMembers = members.filter((m: any) => m.status === 'active').length
      const pendingMembers = members.filter((m: any) => m.status === 'pending').length
      const cancelledMembers = members.filter((m: any) => m.status === 'cancelled').length
      const todayAttendance = attendance.filter((a: any) => {
        const today = new Date().toISOString().split('T')[0]
        return a.date === today
      }).length
      
      setStats({
        totalMembers: members.length,
        activeMembers,
        pendingMembers,
        cancelledMembers,
        todayAttendance,
        monthlyRevenue: members.length * 150000
      })
      
      setRecentMembers(members.slice(0, 10))
    } catch (err) {
      console.error('Failed to load data:', err)
    }
  }

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>로딩 중...</div>
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '48px 40px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '36px'
            }}>
              💪
            </div>
            <h1 style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              펌피 관리자
            </h1>
            <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '14px' }}>
              Gym Management System
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'grid', gap: '20px' }}>
            {loginError && (
              <div style={{
                padding: '14px',
                background: '#FEE',
                border: '1px solid #FCC',
                borderRadius: '12px',
                color: '#C33',
                fontSize: '14px',
                textAlign: 'center',
                fontWeight: 600
              }}>
                {loginError}
              </div>
            )}
            
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#334155'
              }}>
                아이디
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  border: '2px solid #E2E8F0',
                  borderRadius: '12px',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#334155'
              }}>
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  border: '2px solid #E2E8F0',
                  borderRadius: '12px',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                marginTop: '8px'
              }}
            >
              로그인
            </button>
          </form>

          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#F8FAFC',
            borderRadius: '12px',
            fontSize: '13px',
            color: '#64748b',
            textAlign: 'center'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '6px' }}>💡 기본 계정</div>
            <div>admin / pumpy2025</div>
          </div>
        </div>
      </div>
    )
  }

  // Main Admin Dashboard with Sidebar
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F7F8FA' }}>
      {/* Sidebar */}
      <div style={{
        width: '260px',
        background: '#2D3748',
        color: 'white',
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto'
      }}>
        {/* Logo */}
        <div style={{
          padding: '0 24px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              💪
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                펌피
              </div>
              <div style={{ fontSize: '11px', color: '#A0AEC0', marginTop: '2px' }}>
                Gym Management
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div style={{ flex: 1, padding: '0 12px' }}>
          <SidebarItem icon="📊" label="대시보드" active={activeMenu === 'dashboard'} onClick={() => { setActiveMenu('dashboard'); router.push('/admin'); }} />
          <SidebarItem icon="✅" label="출석 체크" onClick={() => router.push('/checkin')} />
          <SidebarItem icon="👥" label="회원 관리" onClick={() => router.push('/members')} />
          <SidebarItem icon="🔔" label="승인 대기" onClick={() => router.push('/pending')} />
          <SidebarItem icon="📅" label="수업 일정" onClick={() => router.push('/schedule')} />
          <SidebarItem icon="💳" label="상품 관리" onClick={() => router.push('/plans')} />
          <SidebarItem icon="📈" label="분석" onClick={() => router.push('/analytics')} />
          <SidebarItem icon="🔍" label="출결" onClick={() => router.push('/attendance')} />
          <SidebarItem icon="💰" label="매출" onClick={() => router.push('/revenue')} />
          <SidebarItem icon="🌙" label="다크모드" onClick={() => {}} />
          <SidebarItem icon="📦" label="로그아웃" onClick={() => { localStorage.removeItem('admin_token'); setIsAuthenticated(false); }} />
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '260px', flex: 1, padding: '32px', maxWidth: 'calc(100% - 260px)' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 800, color: '#1A202C' }}>
              📊 대시보드
            </h1>
            <div style={{ fontSize: '14px', color: '#718096' }}>
              {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <StatCard
            icon="👥"
            title="이번 달 매출"
            value={`₩ ${((stats?.monthlyRevenue || 0) / 10000).toFixed(0)}만`}
            subtitle="전체 0명"
            color="#667eea"
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
          <StatCard
            icon="✅"
            title="활성 회원"
            value="0"
            subtitle="이번 달"
            color="#10B981"
            gradient="linear-gradient(135deg, #10B981 0%, #059669 100%)"
          />
          <StatCard
            icon="👤"
            title="신규 회원"
            value="0"
            subtitle="이번 달"
            color="#F59E0B"
            gradient="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
          />
          <StatCard
            icon="📊"
            title="추천 홍보율"
            value="0%"
            subtitle="최근 7일"
            color="#8B5CF6"
            gradient="linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)"
          />
          <StatCard
            icon="📈"
            title="재등록률"
            value="0%"
            subtitle="자년월 기준"
            color="#EC4899"
            gradient="linear-gradient(135deg, #EC4899 0%, #DB2777 100%)"
          />
          <StatCard
            icon="⏰"
            title="정시/해지"
            value="0"
            subtitle="0일 / 0일"
            color="#06B6D4"
            gradient="linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)"
          />
        </div>

        {/* Charts Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {/* 최근 7일 출석 현황 */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700, color: '#1A202C' }}>
              최근 7일 출석 현황
            </h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '200px' }}>
              {['10.10', '10.11', '10.12', '10.13', '10.14', '10.15', '10.16'].map((date, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: '100%',
                    height: `${Math.random() * 80 + 20}%`,
                    background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '8px 8px 0 0',
                    marginBottom: '8px'
                  }} />
                  <div style={{ fontSize: '11px', color: '#718096', fontWeight: 600 }}>
                    {date}
                  </div>
                  <div style={{ fontSize: '13px', color: '#1A202C', fontWeight: 700 }}>
                    0
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 회원 현황 */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700, color: '#1A202C' }}>
              회원 현황
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <MemberStatusRow label="활성" count={stats?.activeMembers || 0} color="#10B981" />
              <MemberStatusRow label="정지" count={stats?.pendingMembers || 0} color="#F59E0B" />
              <MemberStatusRow label="해지" count={stats?.cancelledMembers || 0} color="#EF4444" />
            </div>
          </div>
        </div>

        {/* 빠른 액션 */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '32px'
        }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700, color: '#1A202C' }}>
            🚀 빠른 액션
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px'
          }}>
            <QuickActionCard
              icon="✅"
              title="출석 체크 (터치)"
              gradient="linear-gradient(135deg, #22D3EE 0%, #06B6D4 100%)"
              onClick={() => router.push('/checkin')}
            />
            <QuickActionCard
              icon="📋"
              title="회원등록 엄청빠름"
              gradient="linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)"
              onClick={() => router.push('/members/new')}
            />
            <QuickActionCard
              icon="👤"
              title="회원 신청 페이지"
              gradient="linear-gradient(135deg, #FB7185 0%, #EC4899 100%)"
              onClick={() => router.push('/signup')}
            />
          </div>
        </div>

        {/* 최근 활동 */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700, color: '#1A202C' }}>
            최근 가입 회원
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {recentMembers.slice(0, 5).map((member, idx) => (
              <div key={idx} style={{
                padding: '16px',
                background: '#F7FAFC',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#EDF2F7'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#F7FAFC'}
              onClick={() => router.push(`/members/${member.id}`)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 700
                  }}>
                    {member.first_name?.[0] || '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1A202C', fontSize: '15px' }}>
                      {member.first_name} {member.last_name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#718096', marginTop: '2px' }}>
                      {member.email || member.phone || '-'}
                    </div>
                  </div>
                </div>
                <span style={{
                  padding: '6px 16px',
                  background: member.status === 'active' ? '#D1FAE5' : '#FED7AA',
                  color: member.status === 'active' ? '#065F46' : '#92400E',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700
                }}>
                  {member.status === 'active' ? '활성' : '대기'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SidebarItem({ icon, label, active, onClick }: { icon: string, label: string, active?: boolean, onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px 16px',
        borderRadius: '10px',
        marginBottom: '4px',
        cursor: 'pointer',
        background: active ? 'rgba(102, 126, 234, 0.15)' : 'transparent',
        color: active ? '#667eea' : '#E2E8F0',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '14px',
        fontWeight: 600,
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
          e.currentTarget.style.color = 'white'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = '#E2E8F0'
        }
      }}
    >
      <span style={{ fontSize: '18px' }}>{icon}</span>
      <span>{label}</span>
    </div>
  )
}

function StatCard({ icon, title, value, subtitle, color, gradient }: any) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)'
      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100px',
        height: '100px',
        background: gradient,
        opacity: 0.1,
        borderRadius: '0 16px 0 100%'
      }} />
      
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        marginBottom: '16px'
      }}>
        {icon}
      </div>
      
      <div style={{ fontSize: '13px', color: '#718096', fontWeight: 600, marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{ fontSize: '32px', fontWeight: 800, color: '#1A202C', marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: '#A0AEC0' }}>
        {subtitle}
      </div>
    </div>
  )
}

function MemberStatusRow({ label, count, color }: any) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px',
      background: '#F7FAFC',
      borderRadius: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: color
        }} />
        <span style={{ fontSize: '15px', fontWeight: 600, color: '#1A202C' }}>
          {label}
        </span>
      </div>
      <span style={{ fontSize: '20px', fontWeight: 800, color: '#1A202C' }}>
        {count}명
      </span>
    </div>
  )
}

function QuickActionCard({ icon, title, gradient, onClick }: any) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '20px',
        borderRadius: '12px',
        background: gradient,
        color: 'white',
        cursor: 'pointer',
        transition: 'all 0.2s',
        textAlign: 'center'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>
        {icon}
      </div>
      <div style={{ fontSize: '14px', fontWeight: 700 }}>
        {title}
      </div>
    </div>
  )
}
