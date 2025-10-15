'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'

export default function MemberAppHome() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [todayWOD, setTodayWOD] = useState<any>(null)
  const [todayStats, setTodayStats] = useState({ calories: 850, workouts: 2, meals: 3 })
  const [bodyStats, setBodyStats] = useState({ weight: 70, muscle: 35, fat: 15 })
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  useEffect(() => {
    // 서버 URL이 설정되어 있는지 확인
    const serverUrl = localStorage.getItem('serverUrl')
    if (!serverUrl) {
      router.push('/app/server-config')
      return
    }
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const apiBase = getApiUrl()
      console.log('회원앱 API 주소:', apiBase)

      const membersRes = await axios.get(`${apiBase}/members/`)
      if (membersRes.data.length > 0) {
        const user = membersRes.data[0]
        setCurrentUser(user)
        
        // 로컬스토리지에서 사진 로드
        const savedPhoto = localStorage.getItem(`user_photo_${user.id}`)
        if (savedPhoto) {
          setSelectedPhoto(savedPhoto)
        }

        // 로컬스토리지에서 신체 정보 로드
        const savedBodyStats = localStorage.getItem(`body_stats_${user.id}`)
        if (savedBodyStats) {
          setBodyStats(JSON.parse(savedBodyStats))
        }
      }

      const wodsRes = await axios.get(`${apiBase}/wods/`)
      const today = new Date().toISOString().split('T')[0]
      const todayWODs = wodsRes.data.filter((w: any) => w.date === today)
      if (todayWODs.length > 0) {
        setTodayWOD(todayWODs[0])
      }

      setLoading(false)
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setSelectedPhoto(base64)
        if (currentUser) {
          localStorage.setItem(`user_photo_${currentUser.id}`, base64)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 0.8s linear infinite'
          }} />
          <p style={{ fontSize: '18px', fontWeight: 600 }}>로딩 중...</p>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      paddingBottom: '100px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px',
        color: 'white'
      }}>
        <div>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '5px' }}>
            {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
          </div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800 }}>
            안녕하세요! 👋
          </h1>
          <h2 style={{ margin: '5px 0 0 0', fontSize: '32px', fontWeight: 900 }}>
            {currentUser?.full_name || currentUser?.name || '회원'}님
          </h2>
        </div>
        <div
          onClick={() => router.push('/app/profile')}
          style={{
            width: 70,
            height: 70,
            borderRadius: '50%',
            background: selectedPhoto ? `url(${selectedPhoto})` : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            cursor: 'pointer',
            border: '4px solid white',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {!selectedPhoto && (
            <span style={{ fontSize: '36px' }}>
              {(currentUser?.full_name || currentUser?.name || '?').charAt(0)}
            </span>
          )}
          {selectedPhoto && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
              mixBlendMode: 'overlay'
            }} />
          )}
        </div>
      </div>

      {/* 신체 정보 & AI 캐릭터 카드 */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '25px',
        padding: '25px',
        marginBottom: '20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#333' }}>
            💪 나의 신체 정보
          </h3>
          <button
            onClick={() => router.push('/app/profile')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
          >
            수정하기
          </button>
        </div>

        {/* 신체 정보 그리드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚖️</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#667eea', marginBottom: '5px' }}>
              {bodyStats.weight}
            </div>
            <div style={{ fontSize: '12px', color: '#999', fontWeight: 600 }}>체중 (kg)</div>
          </div>

          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #f093fb15 0%, #f5576c15 100%)',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>💪</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#f5576c', marginBottom: '5px' }}>
              {bodyStats.muscle}
            </div>
            <div style={{ fontSize: '12px', color: '#999', fontWeight: 600 }}>근육량 (kg)</div>
          </div>

          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #ffecd215 0%, #fcb69f15 100%)',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📊</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#fcb69f', marginBottom: '5px' }}>
              {bodyStats.fat}
            </div>
            <div style={{ fontSize: '12px', color: '#999', fontWeight: 600 }}>체지방 (%)</div>
          </div>
        </div>

        {/* AI 캐릭터 섹션 */}
        <div
          onClick={() => router.push('/app/profile')}
          style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '20px',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}
        >
          {/* AI 캐릭터 이미지 영역 */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: selectedPhoto ? `url(${selectedPhoto})` : 'rgba(255,255,255,0.3)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '3px solid white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            position: 'relative',
            flexShrink: 0
          }}>
            {!selectedPhoto && '🎨'}
            {selectedPhoto && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.4) 0%, rgba(245, 87, 108, 0.4) 100%)',
                borderRadius: '50%',
                mixBlendMode: 'overlay'
              }} />
            )}
          </div>

          <div style={{ flex: 1, color: 'white' }}>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 800 }}>
              {selectedPhoto ? '내 AI 캐릭터' : '나만의 AI 캐릭터'}
            </h4>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.95 }}>
              {selectedPhoto ? '프로필에서 새 사진 등록하기' : '사진을 등록하고 AI 캐릭터를 만드세요!'}
            </p>
          </div>

          <div style={{ fontSize: '24px', color: 'white', opacity: 0.8 }}>→</div>

          <div style={{
            position: 'absolute',
            right: -30,
            bottom: -30,
            fontSize: '120px',
            opacity: 0.15
          }}>
            ✨
          </div>
        </div>
      </div>

      {/* 오늘의 운동 */}
      {todayWOD ? (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '25px',
          marginBottom: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#333' }}>
              🔥 오늘의 운동
            </h3>
            <button
              onClick={() => router.push('/app/workout')}
              style={{
                padding: '10px 20px',
                borderRadius: '20px',
                border: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
              }}
            >
              출석하기 →
            </button>
          </div>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333', fontWeight: 700 }}>
            {todayWOD.title}
          </h4>
          <p style={{ margin: 0, color: '#666', fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {todayWOD.description}
          </p>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '20px',
          textAlign: 'center',
          color: 'white',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '15px' }}>💪</div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 800 }}>오늘의 운동 준비중</h4>
          <p style={{ margin: 0, fontSize: '15px', opacity: 0.9 }}>곧 오늘의 운동이 등록됩니다!</p>
        </div>
      )}

      {/* 오늘의 통계 */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '25px',
        marginBottom: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 800, color: '#333' }}>
          📊 오늘의 활동
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '15px'
        }}>
          <div style={{
            padding: '20px 15px',
            background: 'linear-gradient(135deg, #ff9a9e15 0%, #fad0c415 100%)',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔥</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#ff6b6b', marginBottom: '5px' }}>
              {todayStats.calories}
            </div>
            <div style={{ fontSize: '12px', color: '#999', fontWeight: 600 }}>소모 칼로리</div>
          </div>

          <div style={{
            padding: '20px 15px',
            background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💪</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#667eea', marginBottom: '5px' }}>
              {todayStats.workouts}
            </div>
            <div style={{ fontSize: '12px', color: '#999', fontWeight: 600 }}>운동 세트</div>
          </div>

          <div style={{
            padding: '20px 15px',
            background: 'linear-gradient(135deg, #a8edea15 0%, #fed6e315 100%)',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🍽️</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#51cf66', marginBottom: '5px' }}>
              {todayStats.meals}
            </div>
            <div style={{ fontSize: '12px', color: '#999', fontWeight: 600 }}>식사 기록</div>
          </div>
        </div>
      </div>

      {/* 빠른 액션 그리드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <ActionCard
          icon="🍽️"
          title="식단 기록"
          gradient="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
          onClick={() => router.push('/app/meal')}
        />
        <ActionCard
          icon="💪"
          title="운동 기록"
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          onClick={() => router.push('/app/workout')}
        />
        <ActionCard
          icon="📊"
          title="진행 상황"
          gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
          onClick={() => router.push('/app/goals')}
        />
        <ActionCard
          icon="👥"
          title="커뮤니티"
          gradient="linear-gradient(135deg, #30cfd0 0%, #330867 100%)"
          onClick={() => router.push('/app/community')}
        />
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: '30px 30px 0 0',
        padding: '15px 20px 25px',
        boxShadow: '0 -5px 30px rgba(0,0,0,0.15)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 100
      }}>
        <NavItem icon="🏠" label="홈" active onClick={() => router.push('/app')} />
        <NavItem icon="👥" label="커뮤니티" onClick={() => router.push('/app/community')} />
        <NavItem icon="💬" label="채팅" onClick={() => router.push('/app/chat')} />
        <NavItem icon="👤" label="내 정보" onClick={() => router.push('/app/profile')} />
      </div>
    </div>
  )
}

// 액션 카드 컴포넌트
function ActionCard({ icon, title, gradient, onClick }: { icon: string; title: string; gradient: string; onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: gradient,
        borderRadius: '20px',
        padding: '30px 20px',
        textAlign: 'center',
        cursor: 'pointer',
        boxShadow: isHovered ? '0 15px 35px rgba(0,0,0,0.25)' : '0 10px 25px rgba(0,0,0,0.15)',
        transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: '12px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>{icon}</div>
      <div style={{ fontSize: '17px', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{title}</div>
      <div style={{
        position: 'absolute',
        right: -20,
        bottom: -20,
        fontSize: '100px',
        opacity: 0.1
      }}>
        ✨
      </div>
    </div>
  )
}

// 네비게이션 아이템 컴포넌트
function NavItem({ icon, label, active, onClick }: { icon: string; label: string; active?: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        textAlign: 'center',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '15px',
        transition: 'all 0.2s',
        backgroundColor: active ? '#667eea15' : 'transparent'
      }}
    >
      <div style={{
        fontSize: '26px',
        marginBottom: '5px',
        filter: active ? 'drop-shadow(0 2px 4px rgba(102, 126, 234, 0.4))' : 'none'
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: '11px',
        fontWeight: active ? 700 : 600,
        color: active ? '#667eea' : '#999'
      }}>
        {label}
      </div>
    </div>
  )
}
