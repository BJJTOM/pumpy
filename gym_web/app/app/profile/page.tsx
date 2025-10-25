'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'
import BottomNav from '../components/BottomNav'

const ROOM_THEMES = [
  { id: 'default', name: '기본', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '🏠' },
  { id: 'gym', name: '헬스장', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', icon: '🏋️' },
  { id: 'beach', name: '해변', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', icon: '🏖️' },
  { id: 'space', name: '우주', gradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', icon: '🚀' },
  { id: 'forest', name: '숲', gradient: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)', icon: '🌲' }
]

const TITLES = [
  { id: 1, name: '초보자', color: '#9ca3af', minAttendance: 0 },
  { id: 2, name: '운동 시작', color: '#10b981', minAttendance: 10 },
  { id: 3, name: '꾸준한 운동러', color: '#3b82f6', minAttendance: 30 },
  { id: 4, name: '운동 마니아', color: '#8b5cf6', minAttendance: 50 },
  { id: 5, name: '철인', color: '#f59e0b', minAttendance: 100 },
  { id: 6, name: '헬스 마스터', color: '#dc2626', minAttendance: 200 },
  { id: 7, name: '전설의 운동러', color: '#fbbf24', minAttendance: 365 }
]

const BADGES = [
  { id: 'first_step', name: '첫 걸음', icon: '👟', desc: '첫 출석 완료', color: '#10b981', condition: 'total >= 1' },
  { id: 'weekly_warrior', name: '주간 전사', icon: '🔥', desc: '7일 연속 출석', color: '#f59e0b', condition: 'consecutive >= 7' },
  { id: 'monthly_master', name: '월간 달인', icon: '📅', desc: '한 달 20회 이상 출석', color: '#667eea', condition: 'thisMonth >= 20' },
  { id: 'hundred_club', name: '100 클럽', icon: '💯', desc: '총 100회 출석', color: '#8b5cf6', condition: 'total >= 100' },
  { id: 'iron_will', name: '강철 의지', icon: '💪', desc: '30일 연속 출석', color: '#ef4444', condition: 'consecutive >= 30' },
  { id: 'annual_champion', name: '연간 챔피언', icon: '👑', desc: '1년 365회 출석', color: '#fbbf24', condition: 'total >= 365' },
  { id: 'early_bird', name: '아침형 인간', icon: '🌅', desc: '아침 운동 50회', color: '#4facfe', condition: 'morning >= 50' },
  { id: 'night_owl', name: '올빼미', icon: '🌙', desc: '저녁 운동 50회', color: '#6366f1', condition: 'night >= 50' },
  { id: 'consistent', name: '꾸준함의 달인', icon: '⭐', desc: '50일 연속 출석', color: '#10b981', condition: 'consecutive >= 50' },
  { id: 'legend', name: '전설', icon: '🏆', desc: '총 500회 출석', color: '#dc2626', condition: 'total >= 500' }
]

export default function ProfilePage() {
  const router = useRouter()
  const [member, setMember] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [aiPhoto, setAiPhoto] = useState<string | null>(null)
  const [attendanceStats, setAttendanceStats] = useState({ consecutive: 0, thisMonth: 0, total: 0, morning: 0, night: 0 })
  const [roomBackground, setRoomBackground] = useState('default')
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [showTitleModal, setShowTitleModal] = useState(false)
  const [showBadgeModal, setShowBadgeModal] = useState(false)
  const [selectedTitle, setSelectedTitle] = useState<any>(null)
  const [showGymInfoDetail, setShowGymInfoDetail] = useState(false)
  const [showMembershipDetail, setShowMembershipDetail] = useState(false)

  useEffect(() => {
    loadMemberData()
    
    // 페이지 포커스 시 데이터 새로고침
    const handleFocus = () => {
      loadMemberData()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [router])

  const loadMemberData = async () => {
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) {
      router.push('/auth/login')
      return
    }
    const user = JSON.parse(userStr)
    
    // API에서 최신 회원 정보 가져오기
    try {
      const apiBase = getApiUrl()
      const response = await axios.get(`${apiBase}/members/${user.id}/`)
      const updatedMember = response.data
      
      // 로컬 스토리지 업데이트
      localStorage.setItem('currentUser', JSON.stringify(updatedMember))
      setMember(updatedMember)

      // 회원권이 활성화되면 대기 중인 구독 정보 삭제
      if (updatedMember.membership) {
        localStorage.removeItem(`pending_subscription_${user.id}`)
      }
    } catch (error) {
      console.error('회원 정보 로드 실패:', error)
      setMember(user)
    }

    // Load saved data
    const savedAiPhoto = localStorage.getItem(`ai_photo_${user.id}`)
    if (savedAiPhoto) setAiPhoto(savedAiPhoto)

    const savedRoomBg = localStorage.getItem(`room_background_${user.id}`)
    if (savedRoomBg) setRoomBackground(savedRoomBg)

    loadAttendanceData(user.id)
    setLoading(false)
  }

  const loadAttendanceData = async (memberId: number) => {
    try {
      const response = await axios.get(`${getApiUrl()}/attendance/?member=${memberId}`)
      const records = response.data || []
      
      const consecutiveDays = calculateConsecutiveDays(records)
      const thisMonth = records.filter((r: any) => {
        const date = new Date(r.check_in_time || r.date)
        const now = new Date()
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      }).length

      const morningCount = records.filter((r: any) => {
        const hour = new Date(r.check_in_time || r.date).getHours()
        return hour >= 5 && hour < 12
      }).length

      const nightCount = records.filter((r: any) => {
        const hour = new Date(r.check_in_time || r.date).getHours()
        return hour >= 18 && hour < 24
      }).length

      setAttendanceStats({
        consecutive: consecutiveDays,
        thisMonth,
        total: records.length,
        morning: morningCount,
        night: nightCount
      })
    } catch (error) {
      console.error('출석 데이터 로드 실패:', error)
    }
  }

  const calculateConsecutiveDays = (records: any[]) => {
    if (records.length === 0) return 0
    
    const dates = records
      .map((r: any) => {
        const dateStr = r.check_in_time || r.date
        return dateStr ? new Date(dateStr).toISOString().split('T')[0] : null
      })
      .filter((d): d is string => d !== null)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    
    let consecutive = 0
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    
    if (dates[0] !== today && dates[0] !== yesterday) return 0
    
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
      if (dates[i] === expected) {
        consecutive++
      } else {
        break
      }
    }
    
    return consecutive
  }

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      localStorage.removeItem('currentUser')
      localStorage.removeItem('userToken')
      router.push('/auth/login')
    }
  }

  // 레벨 계산
  const level = Math.floor(attendanceStats.total / 10) + 1
  const currentLevelXP = attendanceStats.total % 10
  const nextLevelXP = 10

  // 칭호 획득 로직
  const availableTitles = TITLES.filter(title => attendanceStats.total >= title.minAttendance).reverse()
  const currentTitle = availableTitles[0] || TITLES[0]
  
  useEffect(() => {
    if (member) {
      const savedTitle = localStorage.getItem(`selected_title_${member.id}`)
      if (savedTitle) {
        setSelectedTitle(JSON.parse(savedTitle))
      } else {
        setSelectedTitle(currentTitle)
      }
    }
  }, [member, attendanceStats.total])

  // 뱃지 획득 로직
  const earnedBadges = BADGES.filter(badge => {
    if (badge.id === 'first_step') return attendanceStats.total >= 1
    if (badge.id === 'weekly_warrior') return attendanceStats.consecutive >= 7
    if (badge.id === 'monthly_master') return attendanceStats.thisMonth >= 20
    if (badge.id === 'hundred_club') return attendanceStats.total >= 100
    if (badge.id === 'iron_will') return attendanceStats.consecutive >= 30
    if (badge.id === 'annual_champion') return attendanceStats.total >= 365
    if (badge.id === 'early_bird') return attendanceStats.morning >= 50
    if (badge.id === 'night_owl') return attendanceStats.night >= 50
    if (badge.id === 'consistent') return attendanceStats.consecutive >= 50
    if (badge.id === 'legend') return attendanceStats.total >= 500
    return false
  })

  const getRoomBackgroundStyle = () => {
    const theme = ROOM_THEMES.find(t => t.id === roomBackground)
    return {
      background: theme?.gradient || ROOM_THEMES[0].gradient,
      minHeight: '450px',
      borderRadius: '25px',
      position: 'relative' as const,
      overflow: 'hidden',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
    }
  }

  const handleChangeRoom = (themeId: string) => {
    setRoomBackground(themeId)
    if (member) {
      localStorage.setItem(`room_background_${member.id}`, themeId)
    }
    setShowRoomModal(false)
  }

  const handleSelectTitle = (title: any) => {
    setSelectedTitle(title)
    if (member) {
      localStorage.setItem(`selected_title_${member.id}`, JSON.stringify(title))
    }
    setShowTitleModal(false)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f2f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '6px solid #e0e7ff',
            borderTop: '6px solid #667eea',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 0.8s linear infinite'
          }} />
          <p style={{ fontSize: '18px', fontWeight: 700, color: '#667eea' }}>로딩 중...</p>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}} />
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0f2f5',
      padding: '20px',
      paddingBottom: '100px',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '28px',
          fontWeight: 800,
          color: '#333'
        }}>
          프로필
        </h1>
        <div style={{ width: '40px' }} />
      </div>

      {/* 내 방 (캐릭터 배경) */}
      <div style={getRoomBackgroundStyle()}>
        {/* 레벨 & 경험치 바 (상단 좌측) */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '15px',
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(5px)',
          borderRadius: '15px',
          padding: '8px 12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 10,
          width: '120px'
        }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'white' }}>Lv.{level}</span>
          <div style={{
            flex: 1,
            height: '8px',
            background: 'rgba(255,255,255,0.4)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(currentLevelXP / nextLevelXP) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
              borderRadius: '4px',
              transition: 'width 0.5s',
              boxShadow: '0 0 8px rgba(255, 215, 0, 0.6)'
            }} />
          </div>
        </div>

        {/* 방 꾸미기 버튼 (상단 우측) */}
        <div
          onClick={() => setShowRoomModal(true)}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            padding: '8px 14px',
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '15px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            zIndex: 10
          }}
        >
          <span style={{ fontSize: '14px' }}>🎨</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#333' }}>방 꾸미기</span>
        </div>

        {/* 방 장식 요소 */}
        <div style={{
          position: 'absolute',
          top: '50px',
          left: '20px',
          fontSize: '40px',
          opacity: 0.3
        }}>
          {ROOM_THEMES.find(t => t.id === roomBackground)?.icon || '🏠'}
        </div>
        <div style={{
          position: 'absolute',
          top: '50px',
          right: '20px',
          fontSize: '40px',
          opacity: 0.3
        }}>
          🏆
        </div>

        {/* 복싱 캐릭터 */}
        <div style={{
          position: 'relative',
          width: '140px',
          height: '160px',
          margin: '80px auto 0',
          animation: 'boxingPunch 2s ease-in-out infinite'
        }}>
          {aiPhoto ? (
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '20px',
              background: `url(${aiPhoto})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: '4px solid white',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }} />
          ) : (
            <>
              {/* 머리 */}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ffdbac 0%, #ffcc99 100%)',
                position: 'absolute',
                top: '0',
                left: '30px',
                border: '3px solid #333',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '25px',
                  left: '20px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#333'
                }} />
                <div style={{
                  position: 'absolute',
                  top: '25px',
                  right: '20px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#333'
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '30px',
                  height: '15px',
                  borderRadius: '0 0 15px 15px',
                  border: '2px solid #333',
                  borderTop: 'none'
                }} />
              </div>

              {/* 목 */}
              <div style={{
                width: '30px',
                height: '15px',
                background: 'linear-gradient(135deg, #ffdbac 0%, #ffcc99 100%)',
                position: 'absolute',
                top: '75px',
                left: '55px',
                borderLeft: '2px solid #333',
                borderRight: '2px solid #333'
              }} />

              {/* 몸통 */}
              <div style={{
                width: '100px',
                height: '70px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                position: 'absolute',
                top: '88px',
                left: '20px',
                borderRadius: '15px 15px 5px 5px',
                border: '3px solid #333',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '24px'
                }}>🥊</div>
              </div>

              {/* 왼쪽 팔 */}
              <div style={{
                width: '45px',
                height: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                position: 'absolute',
                top: '95px',
                left: '0px',
                borderRadius: '6px',
                border: '2px solid #333',
                transform: 'rotate(-20deg)'
              }} />
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                position: 'absolute',
                top: '88px',
                left: '-5px',
                border: '2px solid #333',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
              }} />

              {/* 오른쪽 팔 (펀치) */}
              <div style={{
                width: '55px',
                height: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                position: 'absolute',
                top: '98px',
                right: '-5px',
                borderRadius: '6px',
                border: '2px solid #333',
                transform: 'rotate(15deg)',
                animation: 'punchArm 2s ease-in-out infinite'
              }} />
              <div style={{
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                position: 'absolute',
                top: '90px',
                right: '-18px',
                border: '2px solid #333',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                animation: 'punchGlove 2s ease-in-out infinite'
              }}>
                <div style={{
                  position: 'absolute',
                  right: '-24px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '24px',
                  animation: 'punchEffect 2s ease-in-out infinite'
                }}>💥</div>
              </div>

              {/* 다리 */}
              <div style={{
                width: '32px',
                height: '38px',
                background: '#333',
                position: 'absolute',
                bottom: '0',
                left: '38px',
                borderRadius: '5px 5px 8px 8px',
                border: '2px solid #222'
              }} />
              <div style={{
                width: '32px',
                height: '38px',
                background: '#333',
                position: 'absolute',
                bottom: '0',
                right: '38px',
                borderRadius: '5px 5px 8px 8px',
                border: '2px solid #222'
              }} />
            </>
          )}
        </div>

        {/* 이름 & 칭호 (캐릭터 아래) */}
        <div style={{
          textAlign: 'center',
          marginTop: '20px'
        }}>
          <div
            onClick={() => setShowTitleModal(true)}
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '15px',
              background: `${selectedTitle?.color || TITLES[0].color}20`,
              border: `2px solid ${selectedTitle?.color || TITLES[0].color}`,
              marginBottom: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: selectedTitle?.color || TITLES[0].color
            }}>
              [{selectedTitle?.name || TITLES[0].name}]
            </span>
          </div>
          <h2 style={{
            margin: '0',
            fontSize: '26px',
            fontWeight: 900,
            color: 'white',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}>
            {member?.last_name}{member?.first_name}
          </h2>
        </div>

        {/* 뱃지 (하단) */}
        <div style={{
          position: 'absolute',
          bottom: '15px',
          left: '15px',
          right: '15px',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(5px)',
          borderRadius: '12px',
          padding: '10px 12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          zIndex: 10
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '12px',
              fontWeight: 800,
              color: '#333'
            }}>
              🏅 획득 뱃지
            </h3>
            <button
              onClick={() => setShowBadgeModal(true)}
              style={{
                padding: '4px 10px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                background: 'white',
                fontSize: '10px',
                fontWeight: 700,
                color: '#667eea',
                cursor: 'pointer'
              }}
            >
              전체보기
            </button>
          </div>
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '3px'
          }}>
            {earnedBadges.slice(0, 4).map(badge => (
              <div
                key={badge.id}
                title={`${badge.name}: ${badge.desc}`}
                style={{
                  minWidth: '45px',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  background: `${badge.color}20`,
                  border: `2px solid ${badge.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  marginBottom: '4px',
                  boxShadow: `0 3px 10px ${badge.color}40`
                }}>
                  {badge.icon}
                </div>
                <div style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  color: '#666'
                }}>
                  {badge.name}
                </div>
              </div>
            ))}
            {earnedBadges.length === 0 && (
              <div style={{
                padding: '10px',
                textAlign: 'center',
                color: '#999',
                fontSize: '11px',
                fontWeight: 600,
                flex: 1
              }}>
                아직 획득한 뱃지가 없습니다
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 프로필 카드들 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '15px',
        marginBottom: '20px'
      }}>
        {/* 프리미엄 구독 */}
        <div
          onClick={() => router.push('/app/premium')}
          style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            padding: '25px',
            borderRadius: '20px',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(251, 191, 36, 0.35)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: '#dc2626',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 800
          }}>
            30% OFF
          </div>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>👑</div>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '22px',
            fontWeight: 900,
            color: 'white'
          }}>
            프리미엄 구독하기
          </h3>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: 'rgba(255,255,255,0.9)'
          }}>
            AI 코칭, 맞춤 식단, 전문가 상담을 이용해보세요
          </p>
        </div>
      </div>

      {/* 승인 대기 중인 회원권 알림 - 승인 시스템 사용 시에만 표시 */}
      {/* 현재는 즉시 결제로 변경되어 표시되지 않음 */}

      {/* 내 체육관 등록 정보 섹션 (클릭식) */}
      <div
        onClick={() => setShowGymInfoDetail(true)}
        style={{
          background: 'white',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
          marginBottom: '15px',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)'
          e.currentTarget.style.boxShadow = '0 6px 25px rgba(0,0,0,0.12)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 2px 15px rgba(0,0,0,0.08)'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🏋️
            </div>
            <div>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 800,
                color: '#333'
              }}>
                내 체육관 등록 정보
              </h3>
              <div style={{
                fontSize: '13px',
                color: '#999',
                marginTop: '3px'
              }}>
                회원번호 #{member?.id || '0000'}
              </div>
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              padding: '6px 12px',
              background: member?.status === 'active' ? '#10b98120' : '#f59e0b20',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 800,
              color: member?.status === 'active' ? '#10b981' : '#f59e0b'
            }}>
              {member?.status === 'active' ? '✓ 활성' : member?.status === 'paused' ? '⏸ 일시중지' : '❌ 만료'}
            </div>
            <span style={{ fontSize: '18px', color: '#d1d5db' }}>›</span>
          </div>
        </div>
      </div>

      {/* 설정 섹션 */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
        marginBottom: '15px'
      }}>
        <MenuItem
          icon="⚙️"
          title="설정"
          onClick={() => router.push('/app/settings')}
        />
        <MenuItem
          icon="🔔"
          title="알림 설정"
          onClick={() => router.push('/app/notifications')}
        />
        <MenuItem
          icon="🔒"
          title="개인정보 및 보안"
          onClick={() => router.push('/app/privacy')}
          isLast
        />
      </div>

      {/* 고객지원 섹션 */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
        marginBottom: '15px'
      }}>
        <MenuItem
          icon="💬"
          title="고객센터"
          onClick={() => router.push('/app/support')}
        />
        <MenuItem
          icon="📢"
          title="공지사항"
          onClick={() => router.push('/app/notices')}
        />
        <MenuItem
          icon="❓"
          title="자주 묻는 질문"
          onClick={() => router.push('/app/faq')}
          isLast
        />
      </div>

      {/* 정보 섹션 */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
        marginBottom: '15px'
      }}>
        <MenuItem
          icon="⭐"
          title="스토어 리뷰 작성"
          onClick={() => {
            if (confirm('스토어로 이동하여 리뷰를 작성하시겠습니까?')) {
              window.open('https://play.google.com/store', '_blank')
            }
          }}
        />
        <MenuItem
          icon="📱"
          title="앱 공유하기"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Pumpy 체육관',
                text: 'Pumpy 체육관 앱을 사용해보세요!',
                url: window.location.origin
              })
            } else {
              alert('공유 기능이 지원되지 않는 브라우저입니다.')
            }
          }}
        />
        <MenuItem
          icon="📄"
          title="이용약관"
          onClick={() => router.push('/app/terms')}
        />
        <MenuItem
          icon="🔐"
          title="개인정보 처리방침"
          onClick={() => router.push('/app/policy')}
        />
        <MenuItem
          icon="ℹ️"
          title="버전 정보"
          subtitle="v1.0.0"
          onClick={() => {
            alert('Pumpy 체육관 앱\n버전: 1.0.0\n최신 버전입니다.')
          }}
          isLast
        />
      </div>

      {/* 로그아웃 버튼 */}
      <button
        onClick={handleLogout}
        style={{
          width: '100%',
          padding: '18px',
          borderRadius: '15px',
          border: 'none',
          background: '#ef4444',
          color: 'white',
          fontSize: '18px',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 5px 20px rgba(239, 68, 68, 0.3)'
        }}
      >
        로그아웃
      </button>

      <BottomNav />

      {/* Room Customization Modal */}
      {showRoomModal && (
        <Modal onClose={() => setShowRoomModal(false)} title="내 방 꾸미기">
          <div style={{ padding: '20px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '15px'
            }}>
              {ROOM_THEMES.map(theme => (
                <div
                  key={theme.id}
                  onClick={() => handleChangeRoom(theme.id)}
                  style={{
                    padding: '20px',
                    background: theme.gradient,
                    borderRadius: '15px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    border: roomBackground === theme.id ? '4px solid white' : '4px solid transparent',
                    boxShadow: roomBackground === theme.id ? '0 8px 25px rgba(0,0,0,0.3)' : '0 4px 15px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s',
                    position: 'relative'
                  }}
                >
                  {roomBackground === theme.id && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px'
                    }}>
                      ✓
                    </div>
                  )}
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>{theme.icon}</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>{theme.name}</div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Title Selection Modal */}
      {showTitleModal && (
        <Modal onClose={() => setShowTitleModal(false)} title="칭호 선택">
          <div style={{ padding: '20px' }}>
            <div style={{
              display: 'grid',
              gap: '12px'
            }}>
              {availableTitles.map(title => (
                <div
                  key={title.id}
                  onClick={() => handleSelectTitle(title)}
                  style={{
                    padding: '15px 20px',
                    background: selectedTitle?.id === title.id ? `${title.color}20` : '#f8f9fa',
                    border: `2px solid ${selectedTitle?.id === title.id ? title.color : '#e5e7eb'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.3s'
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: title.color
                  }}>
                    [{title.name}]
                  </span>
                  <span style={{
                    fontSize: '13px',
                    color: '#999'
                  }}>
                    출석 {title.minAttendance}회 이상
                  </span>
                </div>
              ))}
            </div>
            {availableTitles.length === 1 && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                background: '#f3f4f6',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#666',
                fontSize: '14px'
              }}>
                더 많이 출석하고 새로운 칭호를 획득하세요!
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Badge Detail Modal */}
      {showBadgeModal && (
        <Modal onClose={() => setShowBadgeModal(false)} title="뱃지 컬렉션">
          <div style={{ padding: '20px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '15px'
            }}>
              {BADGES.map(badge => {
                const earned = earnedBadges.find(b => b.id === badge.id)
                return (
                  <div
                    key={badge.id}
                    style={{
                      padding: '20px',
                      background: earned ? `${badge.color}15` : '#f8f9fa',
                      border: `2px solid ${earned ? badge.color : '#e5e7eb'}`,
                      borderRadius: '15px',
                      textAlign: 'center',
                      opacity: earned ? 1 : 0.5
                    }}
                  >
                    <div style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '50%',
                      background: earned ? `${badge.color}30` : '#e5e7eb',
                      border: `3px solid ${earned ? badge.color : '#d1d5db'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                      margin: '0 auto 10px',
                      boxShadow: earned ? `0 4px 15px ${badge.color}40` : 'none'
                    }}>
                      {badge.icon}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: earned ? '#333' : '#999',
                      marginBottom: '5px'
                    }}>
                      {badge.name}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#999'
                    }}>
                      {badge.desc}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Modal>
      )}

      {/* 체육관 등록 정보 상세 모달 */}
      {showGymInfoDetail && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}
        onClick={() => setShowGymInfoDetail(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '25px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{
              padding: '25px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#333'
                }}>
                  내 체육관 등록 정보
                </h2>
                <div
                  onClick={() => setShowGymInfoDetail(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '20px',
                    color: '#666'
                  }}
                >
                  ×
                </div>
              </div>
            </div>

            <div style={{ padding: '25px' }}>
              <div style={{
                display: 'grid',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <InfoRow label="회원명" value={`${member?.last_name || ''}${member?.first_name || ''}`} />
                <InfoRow label="회원번호" value={`#${member?.id || '0000'}`} />
                <InfoRow label="전화번호" value={member?.phone || '-'} />
                <InfoRow label="이메일" value={member?.email || '-'} />
                <InfoRow label="생년월일" value={member?.birth_date || '-'} />
                <InfoRow label="성별" value={member?.gender === 'M' ? '남성' : member?.gender === 'F' ? '여성' : '-'} />
                <InfoRow label="주소" value={member?.address || '-'} />
                <InfoRow label="가입일" value={member?.created_at ? new Date(member.created_at).toLocaleDateString('ko-KR') : '-'} />
                <InfoRow label="상태" value={
                  member?.status === 'active' ? '✓ 활성' : 
                  member?.status === 'paused' ? '⏸ 일시중지' : '❌ 만료'
                } />
              </div>

              {/* 현재 회원권 정보 */}
              {member?.membership ? (
                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '15px',
                  marginBottom: '20px',
                  color: 'white'
                }}>
                  <div style={{
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.8)',
                    marginBottom: '8px',
                    fontWeight: 600
                  }}>
                    💳 현재 회원권
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 900,
                    marginBottom: '15px'
                  }}>
                    {member.membership.plan_name}
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '10px',
                    marginBottom: '15px'
                  }}>
                    <div style={{
                      padding: '10px',
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '10px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '11px', marginBottom: '4px', opacity: 0.9 }}>시작일</div>
                      <div style={{ fontSize: '13px', fontWeight: 700 }}>
                        {new Date(member.membership.start_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div style={{
                      padding: '10px',
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '10px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '11px', marginBottom: '4px', opacity: 0.9 }}>만료일</div>
                      <div style={{ fontSize: '13px', fontWeight: 700 }}>
                        {new Date(member.membership.end_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    textAlign: 'center',
                    opacity: 0.95
                  }}>
                    남은 기간: {Math.max(0, Math.ceil((new Date(member.membership.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}일
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '30px 20px',
                  background: '#f8f9fa',
                  borderRadius: '15px',
                  textAlign: 'center',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>💳</div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: '#333',
                    marginBottom: '8px'
                  }}>
                    등록된 회원권이 없습니다
                  </div>
                  <p style={{
                    margin: '0 0 20px 0',
                    fontSize: '13px',
                    color: '#999'
                  }}>
                    회원권을 구매해주세요
                  </p>
                  <button
                    onClick={() => {
                      setShowGymInfoDetail(false)
                      router.push('/app/membership-payment')
                    }}
                    style={{
                      padding: '12px 24px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                    }}
                  >
                    회원권 구매하기
                  </button>
                </div>
              )}

              <div style={{
                padding: '15px',
                background: '#f8f9fa',
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#333',
                  marginBottom: '10px'
                }}>
                  📋 약관 동의 현황
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <TermsCheckItem 
                    label="이용약관 동의" 
                    agreed={true}
                    onClick={() => {
                      setShowGymInfoDetail(false)
                      router.push('/app/terms')
                    }}
                  />
                  <TermsCheckItem 
                    label="개인정보 처리방침 동의" 
                    agreed={true}
                    onClick={() => {
                      setShowGymInfoDetail(false)
                      router.push('/app/policy')
                    }}
                  />
                  <TermsCheckItem 
                    label="마케팅 수신 동의" 
                    agreed={member?.marketing_agreed || false}
                    optional
                  />
                </div>
              </div>

              {/* 체육관 정보 */}
              <div style={{
                padding: '15px',
                background: '#f0f9ff',
                borderRadius: '12px',
                border: '2px solid #3b82f6'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#1e40af',
                  marginBottom: '10px'
                }}>
                  🏢 다니는 체육관 정보
                </div>
                <div style={{
                  display: 'grid',
                  gap: '8px'
                }}>
                  <InfoRow label="체육관명" value="Pumpy Fitness" />
                  <InfoRow label="주소" value="서울특별시 강남구 테헤란로 123" />
                  <InfoRow label="전화번호" value="02-1234-5678" />
                  <InfoRow label="영업시간" value="06:00 - 23:00" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 회원권 정보 상세 모달 */}
      {showMembershipDetail && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}
        onClick={() => setShowMembershipDetail(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '25px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{
              padding: '25px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '25px 25px 0 0'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: '22px',
                  fontWeight: 800,
                  color: 'white'
                }}>
                  회원권 정보
                </h2>
                <div
                  onClick={() => setShowMembershipDetail(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '20px',
                    color: 'white'
                  }}
                >
                  ×
                </div>
              </div>
            </div>

            <div style={{ padding: '25px' }}>
              {member?.membership ? (
                <>
                  <div style={{
                    padding: '20px',
                    background: '#f8f9fa',
                    borderRadius: '15px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      color: '#999',
                      marginBottom: '8px',
                      fontWeight: 600
                    }}>
                      현재 회원권
                    </div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 900,
                      color: '#333',
                      marginBottom: '15px'
                    }}>
                      {member.membership.plan_name}
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '12px'
                    }}>
                      <div style={{
                        padding: '12px',
                        background: 'white',
                        borderRadius: '12px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '11px', color: '#999', marginBottom: '5px' }}>시작일</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#333' }}>
                          {new Date(member.membership.start_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <div style={{
                        padding: '12px',
                        background: 'white',
                        borderRadius: '12px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '11px', color: '#999', marginBottom: '5px' }}>만료일</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#333' }}>
                          {new Date(member.membership.end_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <div style={{
                        padding: '12px',
                        background: 'white',
                        borderRadius: '12px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '11px', color: '#999', marginBottom: '5px' }}>이용 기간</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#333' }}>
                          {member.membership.duration || 0}개월
                        </div>
                      </div>
                      <div style={{
                        padding: '12px',
                        background: 'white',
                        borderRadius: '12px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '11px', color: '#999', marginBottom: '5px' }}>남은 일수</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#667eea' }}>
                          {Math.max(0, Math.ceil((new Date(member.membership.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}일
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontSize: '13px', color: '#666', fontWeight: 600 }}>
                        이용 진행률
                      </span>
                      <span style={{ fontSize: '13px', color: '#333', fontWeight: 800 }}>
                        {(() => {
                          const start = new Date(member.membership.start_date).getTime()
                          const end = new Date(member.membership.end_date).getTime()
                          const now = new Date().getTime()
                          const progress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100))
                          return Math.round(progress)
                        })()}%
                      </span>
                    </div>
                    <div style={{
                      height: '12px',
                      background: '#e5e7eb',
                      borderRadius: '6px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${(() => {
                          const start = new Date(member.membership.start_date).getTime()
                          const end = new Date(member.membership.end_date).getTime()
                          const now = new Date().getTime()
                          return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100))
                        })()}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '6px',
                        transition: 'width 0.5s'
                      }} />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowMembershipDetail(false)
                      router.push('/app/membership-payment')
                    }}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      borderRadius: '15px',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                    }}
                  >
                    🔄 회원권 연장/변경
                  </button>
                </>
              ) : (
                <>
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px'
                  }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>💳</div>
                    <h3 style={{
                      margin: '0 0 10px 0',
                      fontSize: '20px',
                      fontWeight: 800,
                      color: '#333'
                    }}>
                      등록된 회원권이 없습니다
                    </h3>
                    <p style={{
                      margin: '0 0 30px 0',
                      fontSize: '14px',
                      color: '#666',
                      lineHeight: '1.6'
                    }}>
                      새로운 회원권을 구매하고<br />
                      체육관을 이용해보세요!
                    </p>
                    <button
                      onClick={() => {
                        setShowMembershipDetail(false)
                        router.push('/app/membership-payment')
                      }}
                      style={{
                        padding: '16px 40px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '15px',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                      }}
                    >
                      회원권 구매하기
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes boxingPunch {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
        }
        @keyframes punchArm {
          0%, 100% { transform: rotate(15deg) translateX(0); }
          50% { transform: rotate(15deg) translateX(15px); }
        }
        @keyframes punchGlove {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @keyframes punchEffect {
          0%, 100% { opacity: 0; transform: translateY(-50%) scale(0.5); }
          50% { opacity: 1; transform: translateY(-50%) scale(1.5); }
        }
      `}} />
    </div>
  )
}

function InfoRow({ label, value }: any) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 15px',
      background: '#f8f9fa',
      borderRadius: '10px'
    }}>
      <span style={{
        fontSize: '14px',
        color: '#666',
        fontWeight: 600
      }}>
        {label}
      </span>
      <span style={{
        fontSize: '14px',
        color: '#333',
        fontWeight: 700
      }}>
        {value}
      </span>
    </div>
  )
}

function TermsCheckItem({ label, agreed, optional, onClick }: any) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        background: 'white',
        borderRadius: '8px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background 0.2s'
      }}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.background = '#f9fafb'
      }}
      onMouseLeave={(e) => {
        if (onClick) e.currentTarget.style.background = 'white'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: agreed ? '#10b981' : '#e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: 'white'
        }}>
          {agreed && '✓'}
        </div>
        <span style={{
          fontSize: '13px',
          color: '#333',
          fontWeight: 600
        }}>
          {label}
        </span>
        {optional && (
          <span style={{
            fontSize: '11px',
            color: '#999',
            fontWeight: 600
          }}>
            (선택)
          </span>
        )}
      </div>
      {onClick && (
        <span style={{
          fontSize: '14px',
          color: '#d1d5db'
        }}>
          ›
        </span>
      )}
    </div>
  )
}

function MembershipStatCard({ label, value }: any) {
  return (
    <div style={{
      padding: '12px',
      background: 'rgba(255,255,255,0.25)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '11px',
        color: 'rgba(255,255,255,0.8)',
        marginBottom: '5px',
        fontWeight: 600
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '18px',
        fontWeight: 900,
        color: 'white'
      }}>
        {value}
      </div>
    </div>
  )
}

function MenuItem({ icon, title, subtitle, onClick, isLast = false }: any) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        cursor: 'pointer',
        borderBottom: isLast ? 'none' : '1px solid #f3f4f6',
        transition: 'background 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#f9fafb'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'white'
      }}
    >
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        background: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{
        flex: 1
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#1f2937'
        }}>
          {title}
        </div>
        {subtitle && (
          <div style={{
            fontSize: '13px',
            color: '#9ca3af',
            marginTop: '2px'
          }}>
            {subtitle}
          </div>
        )}
      </div>
      <div style={{
        fontSize: '18px',
        color: '#d1d5db'
      }}>
        ›
      </div>
    </div>
  )
}

function ProfileCard({ icon, title, onClick, children }: any) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        padding: '20px',
        borderRadius: '20px',
        cursor: 'pointer',
        boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
        transition: 'all 0.3s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)'
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 15px rgba(0,0,0,0.08)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px'
        }}>
          {icon}
        </div>
        <h3 style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: 800,
          color: '#333'
        }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}

function Modal({ onClose, title, children }: any) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '25px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: 'white',
          zIndex: 1
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '22px',
            fontWeight: 800,
            color: '#333'
          }}>
            {title}
          </h2>
          <div
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '20px',
              color: '#666'
            }}
          >
            ×
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
