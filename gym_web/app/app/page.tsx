'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'
import BottomNav from './components/BottomNav'

export default function MemberAppHome() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [aiPhoto, setAiPhoto] = useState<string | null>(null)
  const [bodyStats, setBodyStats] = useState({ weight: 70, muscle: 35, fat: 15, height: 175 })
  const [attendanceStats, setAttendanceStats] = useState({ consecutive: 0, thisMonth: 0, total: 0 })
  const [gymInfo, setGymInfo] = useState({ name: 'Pumpy 체육관', location: '서울시 강남구', daysLeft: 15 })
  const [todaySteps, setTodaySteps] = useState(0)
  const [stepGoal] = useState(10000)
  const [todayWOD, setTodayWOD] = useState<any>(null)
  const [level, setLevel] = useState(1)
  const [experiencePoints, setExperiencePoints] = useState(0)
  const [showPhotoEditModal, setShowPhotoEditModal] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) {
      router.push('/auth/login')
      return
    }
    loadData()
    
    // 걸음 수 시뮬레이션 (실제로는 헬스 앱 API 연동)
    const savedSteps = localStorage.getItem('todaySteps')
    if (savedSteps) {
      setTodaySteps(parseInt(savedSteps))
    } else {
      // 랜덤 걸음 수 (테스트용)
      const randomSteps = Math.floor(Math.random() * 12000)
      setTodaySteps(randomSteps)
      localStorage.setItem('todaySteps', randomSteps.toString())
    }
  }, [router])

  const loadData = async () => {
    try {
      const apiBase = getApiUrl()
      const userStr = localStorage.getItem('currentUser')
      if (!userStr) return

      const user = JSON.parse(userStr)
      setCurrentUser(user)

      const savedAiPhoto = localStorage.getItem(`ai_photo_${user.id}`)
      if (savedAiPhoto) setAiPhoto(savedAiPhoto)

      const savedBodyStats = localStorage.getItem(`body_stats_${user.id}`)
      if (savedBodyStats) {
        setBodyStats(JSON.parse(savedBodyStats))
      }

      // WOD 로드
      try {
        const wodsRes = await axios.get(`${apiBase}/wods/`)
        const today = new Date().toISOString().split('T')[0]
        const todayWODs = wodsRes.data.filter((w: any) => w.date === today)
        if (todayWODs.length > 0) {
          setTodayWOD(todayWODs[0])
        }
      } catch (wodError) {
        console.log('WOD 로드 실패 (정상):', wodError)
      }

      const attendanceRes = await axios.get(`${apiBase}/attendance/?member=${user.id}`)
      const attendanceData = attendanceRes.data
      
      const thisMonth = attendanceData.filter((a: any) => {
        const date = new Date(a.check_in_time || a.date)
        const now = new Date()
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      }).length
      
      setAttendanceStats({
        consecutive: calculateConsecutiveDays(attendanceData),
        thisMonth,
        total: attendanceData.length
      })

      // 레벨 및 경험치 계산 (출석 기반)
      const totalAttendance = attendanceData.length
      const calculatedLevel = Math.floor(totalAttendance / 10) + 1
      const xp = (totalAttendance % 10) * 10
      setLevel(calculatedLevel)
      setExperiencePoints(xp)

      setLoading(false)
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 크기 체크 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      alert('❌ 파일 크기는 10MB 이하여야 합니다.')
      return
    }

    setPhotoFile(file)
    
    // 미리보기 생성
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const generateAICharacter = async () => {
    if (!photoPreview || !currentUser) {
      console.warn('사진 미리보기 또는 사용자 정보가 없습니다.')
      return
    }

    setUploadingPhoto(true)
    console.log('🎨 AI 캐릭터 생성 시작...')
    
    try {
      // 실제로는 AI API (예: OpenAI DALL-E, Midjourney)를 호출하여 변환
      // 여기서는 시뮬레이션으로 복싱 캐릭터 스타일 적용
      
      // 간단한 시뮬레이션: 실제로는 백엔드에서 AI 처리
      await new Promise(resolve => setTimeout(resolve, 2000)) // 2초 대기 (AI 처리 시뮬레이션)
      
      // 업로드한 사진을 AI 캐릭터로 설정 (실제로는 AI 변환된 이미지)
      const characterData = photoPreview
      
      // 로컬 스토리지에 저장
      localStorage.setItem(`ai_photo_${currentUser.id}`, characterData)
      setAiPhoto(characterData)
      
      console.log('✅ AI 캐릭터 생성 완료!')
      
      alert('✅ AI 복싱 캐릭터가 생성되었습니다!\n\n실제 서비스에서는 AI가 당신의 사진을 복싱 스타일 캐릭터로 변환합니다.')
      
      setShowPhotoEditModal(false)
      setPhotoFile(null)
      setPhotoPreview(null)
      
      // 페이지 새로고침하여 캐릭터 즉시 반영
      window.location.reload()
    } catch (error) {
      console.error('❌ AI 캐릭터 생성 실패:', error)
      alert('❌ AI 캐릭터 생성에 실패했습니다.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const deleteCharacter = () => {
    if (!confirm('AI 캐릭터를 삭제하시겠습니까?')) return
    
    if (currentUser) {
      console.log('🗑️ AI 캐릭터 삭제 중...')
      localStorage.removeItem(`ai_photo_${currentUser.id}`)
      setAiPhoto(null)
      setShowPhotoEditModal(false)
      alert('✅ AI 캐릭터가 삭제되었습니다.')
      console.log('✅ AI 캐릭터 삭제 완료')
      
      // 페이지 새로고침하여 변경사항 즉시 반영
      window.location.reload()
    }
  }

  const calculateConsecutiveDays = (attendance: any[]) => {
    if (attendance.length === 0) return 0
    
    const sortedDates = attendance
      .map(a => {
        const dateStr = a.check_in_time || a.date
        return dateStr ? new Date(dateStr).toISOString().split('T')[0] : null
      })
      .filter((d): d is string => d !== null)
      .sort()
      .reverse()
    
    let consecutive = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    
    for (let date of sortedDates) {
      const checkDate = new Date(date)
      checkDate.setHours(0, 0, 0, 0)
      
      const diffDays = Math.floor((currentDate.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === consecutive) {
        consecutive++
      } else {
        break
      }
    }
    
    return consecutive
  }

  const calculateBMI = () => {
    const heightM = bodyStats.height / 100
    return (bodyStats.weight / (heightM * heightM)).toFixed(1)
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paddingBottom: '100px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 배경 장식 */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        fontSize: '120px',
        opacity: 0.05
      }}>💪</div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '10%',
        fontSize: '100px',
        opacity: 0.05
      }}>🥊</div>

      {/* 헤더 */}
      <div style={{
        padding: '25px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <div>
          <h1 style={{
            margin: '0 0 5px 0',
            fontSize: '28px',
            fontWeight: 900,
            color: 'white',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}>
            안녕하세요, {currentUser?.last_name}{currentUser?.first_name}님!
          </h1>
          <p style={{
            margin: 0,
            fontSize: '15px',
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 600
          }}>
            오늘도 힘차게 운동해볼까요? 💪
          </p>
        </div>
        <div style={{
          padding: '10px 20px',
          background: 'rgba(255,255,255,0.25)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          color: 'white',
          fontSize: '14px',
          fontWeight: 800
        }}>
          Lv.{Math.floor(attendanceStats.total / 10) + 1}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div style={{
        padding: '0 20px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* 캐릭터 & 정보 카드 컨테이너 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '180px 1fr',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* 왼쪽: 복싱 캐릭터 */}
          <div
            onClick={() => router.push('/app/profile')}
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(15px)',
              borderRadius: '25px',
              padding: '20px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              border: '2px solid rgba(255,255,255,0.3)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative'
            }}
          >
            {/* 복싱 캐릭터 */}
            <div style={{
              position: 'relative',
              width: '140px',
              height: '160px',
              marginBottom: '10px',
              animation: 'boxingPunch 2s ease-in-out infinite'
            }}>
              {aiPhoto ? (
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '15px',
                  background: `url(${aiPhoto})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '3px solid white',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
                }} />
              ) : (
                <>
                  {/* 머리 */}
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ffdbac 0%, #ffcc99 100%)',
                    position: 'absolute',
                    top: '0',
                    left: '40px',
                    border: '3px solid #333',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '22px',
                      left: '13px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#333'
                    }} />
                    <div style={{
                      position: 'absolute',
                      top: '22px',
                      right: '13px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#333'
                    }} />
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '25px',
                      height: '12px',
                      borderRadius: '0 0 12px 12px',
                      border: '2px solid #333',
                      borderTop: 'none'
                    }} />
                  </div>

                  {/* 목 */}
                  <div style={{
                    width: '25px',
                    height: '15px',
                    background: 'linear-gradient(135deg, #ffdbac 0%, #ffcc99 100%)',
                    position: 'absolute',
                    top: '55px',
                    left: '57px',
                    borderLeft: '2px solid #333',
                    borderRight: '2px solid #333'
                  }} />

                  {/* 몸통 */}
                  <div style={{
                    width: '80px',
                    height: '65px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    position: 'absolute',
                    top: '70px',
                    left: '30px',
                    borderRadius: '12px 12px 4px 4px',
                    border: '3px solid #333',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '20px'
                    }}>🥊</div>
                  </div>

                  {/* 왼쪽 팔 */}
                  <div style={{
                    width: '35px',
                    height: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    position: 'absolute',
                    top: '80px',
                    left: '5px',
                    borderRadius: '6px',
                    border: '2px solid #333',
                    transform: 'rotate(-20deg)'
                  }} />
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                    position: 'absolute',
                    top: '72px',
                    left: '-5px',
                    border: '2px solid #333',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }} />

                  {/* 오른쪽 팔 (펀치) */}
                  <div style={{
                    width: '45px',
                    height: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    position: 'absolute',
                    top: '85px',
                    right: '-5px',
                    borderRadius: '6px',
                    border: '2px solid #333',
                    transform: 'rotate(15deg)',
                    animation: 'punchArm 2s ease-in-out infinite'
                  }} />
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                    position: 'absolute',
                    top: '78px',
                    right: '-18px',
                    border: '2px solid #333',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    animation: 'punchGlove 2s ease-in-out infinite'
                  }}>
                    <div style={{
                      position: 'absolute',
                      right: '-22px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '18px',
                      animation: 'punchEffect 2s ease-in-out infinite'
                    }}>💥</div>
                  </div>

                  {/* 다리 */}
                  <div style={{
                    width: '25px',
                    height: '30px',
                    background: '#333',
                    position: 'absolute',
                    bottom: '0',
                    left: '42px',
                    borderRadius: '4px 4px 6px 6px',
                    border: '2px solid #222'
                  }} />
                  <div style={{
                    width: '25px',
                    height: '30px',
                    background: '#333',
                    position: 'absolute',
                    bottom: '0',
                    right: '42px',
                    borderRadius: '4px 4px 6px 6px',
                    border: '2px solid #222'
                  }} />
                </>
              )}
            </div>

            {/* 이름 */}
            <div style={{
              fontSize: '16px',
              fontWeight: 800,
              color: 'white',
              textAlign: 'center',
              textShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
              {currentUser?.last_name}{currentUser?.first_name}
            </div>

            {/* 편집 아이콘 */}
            <div
              onClick={(e) => {
                e.stopPropagation()
                console.log('✏️ 편집 아이콘 클릭됨')
                setShowPhotoEditModal(true)
              }}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.15)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              ✏️
            </div>
          </div>

          {/* 오른쪽: 정보 카드들 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {/* 신체 정보 카드 */}
            <div
              onClick={() => router.push('/app/body-stats')}
              style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '20px',
                padding: '15px',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                cursor: 'pointer',
                border: '2px solid rgba(255,255,255,0.5)'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>📊</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#333' }}>신체 정보</div>
                    <div style={{ fontSize: '11px', color: '#999' }}>BMI {calculateBMI()}</div>
                  </div>
                </div>
                <div style={{ fontSize: '16px', color: '#ccc' }}>›</div>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '6px'
              }}>
                <StatMini label="키" value={bodyStats.height} unit="cm" />
                <StatMini label="체중" value={bodyStats.weight} unit="kg" />
                <StatMini label="근육" value={bodyStats.muscle} unit="kg" color="#10b981" />
                <StatMini label="체지방" value={bodyStats.fat} unit="%" color="#f59e0b" />
              </div>
            </div>

            {/* 출석 통계 카드 */}
            <div
              onClick={() => router.push('/app/attendance-history')}
              style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '20px',
                padding: '15px',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                cursor: 'pointer',
                border: '2px solid rgba(255,255,255,0.5)'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>📅</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#333' }}>출석 통계</div>
                    <div style={{ fontSize: '11px', color: '#999' }}>이번 달 {attendanceStats.thisMonth}회</div>
                  </div>
                </div>
                <div style={{ fontSize: '16px', color: '#ccc' }}>›</div>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '6px'
              }}>
                <StatMini label="연속" value={attendanceStats.consecutive} unit="일" color="#10b981" />
                <StatMini label="이번 달" value={attendanceStats.thisMonth} unit="회" color="#667eea" />
                <StatMini label="총" value={attendanceStats.total} unit="회" color="#f59e0b" />
              </div>
            </div>

            {/* 레벨 & 달성률 카드 */}
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '20px',
              padding: '15px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
              border: '2px solid rgba(255,255,255,0.5)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>👑</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#333' }}>레벨 {level}</div>
                    <div style={{ fontSize: '11px', color: '#999' }}>다음 레벨까지 {Math.max(0, (level * 100) - experiencePoints)}XP</div>
                  </div>
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  color: '#a855f7'
                }}>
                  {Math.floor((experiencePoints / (level * 100)) * 100)}%
                </div>
              </div>
              <div style={{
                height: '8px',
                background: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(experiencePoints / (level * 100)) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #a855f7 0%, #9333ea 100%)',
                  borderRadius: '4px',
                  transition: 'width 0.5s'
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* 걸음 수 카드 (커뮤니티 대체) */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '25px',
          padding: '25px',
          marginBottom: '20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          border: '2px solid rgba(255,255,255,0.5)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>🚶</div>
              <div>
                <h3 style={{
                  margin: '0 0 3px 0',
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#333'
                }}>
                  오늘의 걸음 수
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '13px',
                  color: '#999',
                  fontWeight: 600
                }}>
                  목표: {stepGoal.toLocaleString()}걸음
                </p>
              </div>
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: 900,
              color: '#4facfe'
            }}>
              {todaySteps.toLocaleString()}
            </div>
          </div>
          <div style={{
            height: '16px',
            background: '#e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '12px'
          }}>
            <div style={{
              width: `${Math.min((todaySteps / stepGoal) * 100, 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
              borderRadius: '8px',
              transition: 'width 0.5s',
              boxShadow: '0 0 10px rgba(79, 172, 254, 0.5)'
            }} />
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{
              fontSize: '13px',
              color: '#666',
              fontWeight: 600
            }}>
              {((todaySteps / stepGoal) * 100).toFixed(0)}% 달성
            </div>
            <div style={{
              fontSize: '13px',
              color: '#4facfe',
              fontWeight: 700
            }}>
              {Math.max(0, stepGoal - todaySteps).toLocaleString()}걸음 남음
            </div>
          </div>
        </div>

        {/* 퀵 액션 버튼들 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <QuickAction
            icon="📋"
            label="WOD"
            onClick={() => {
              if (todayWOD) {
                router.push('/app/wod')
              } else {
                alert('오늘의 WOD가 아직 등록되지 않았습니다.\n관리자 대시보드에서 WOD를 먼저 등록해주세요.')
              }
            }}
            badge={todayWOD ? 'NEW' : null}
          />
          <QuickAction
            icon="🍎"
            label="식단"
            onClick={() => router.push('/app/meal')}
          />
          <QuickAction
            icon="📊"
            label="운동 기록"
            onClick={() => router.push('/app/workout-log')}
          />
          <QuickAction
            icon="👑"
            label="프리미엄"
            onClick={() => router.push('/app/premium')}
            gradient={true}
          />
        </div>

        {/* 오늘의 목표 카드 */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '25px',
          padding: '25px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          border: '2px solid rgba(255,255,255,0.5)'
        }}>
          <h3 style={{
            margin: '0 0 15px 0',
            fontSize: '18px',
            fontWeight: 800,
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>🎯</span> 오늘의 목표
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <span style={{ fontSize: '14px', color: '#666', fontWeight: 600 }}>
              운동 완료하기
            </span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#667eea' }}>
              {attendanceStats.thisMonth > 0 ? '완료' : '진행중'}
            </span>
          </div>
          <div style={{
            height: '12px',
            background: '#e5e7eb',
            borderRadius: '6px',
            overflow: 'hidden',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: `${Math.min((attendanceStats.thisMonth / 20) * 100, 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '6px',
              transition: 'width 0.5s'
            }} />
          </div>
          <div style={{
            marginTop: '10px',
            fontSize: '12px',
            color: '#999',
            textAlign: 'center'
          }}>
            이번 달 {attendanceStats.thisMonth}/20회 달성
          </div>
        </div>
      </div>

      {/* 애니메이션 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes boxingPunch {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-5px) scale(1.01); }
        }
        @keyframes punchArm {
          0%, 100% { transform: rotate(15deg) translateX(0); }
          50% { transform: rotate(15deg) translateX(12px); }
        }
        @keyframes punchGlove {
          0%, 100% { transform: scale(1); right: -18px; }
          50% { transform: scale(1.08); right: -23px; }
        }
        @keyframes punchEffect {
          0%, 100% { opacity: 0; transform: translateY(-50%) scale(0.5); }
          50% { opacity: 1; transform: translateY(-50%) scale(1); }
        }
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}} />

      {/* AI 캐릭터 편집 모달 */}
      {showPhotoEditModal && (
        <div 
          onClick={(e) => {
            // 배경 클릭 시 모달 닫기
            if (e.target === e.currentTarget) {
              setShowPhotoEditModal(false)
              setPhotoFile(null)
              setPhotoPreview(null)
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '20px',
            backdropFilter: 'blur(5px)'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '24px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              animation: 'modalSlideIn 0.3s ease-out'
            }}
          >
            {/* 헤더 */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{
                  margin: '0 0 8px 0',
                  fontSize: '24px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  🥊 AI 캐릭터 만들기
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#999'
                }}>
                  사진을 업로드하면 AI가 복싱 캐릭터로 변환합니다
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPhotoEditModal(false)
                  setPhotoFile(null)
                  setPhotoPreview(null)
                }}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: 'none',
                  background: '#f5f5f5',
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#e0e0e0'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f5f5f5'}
              >
                ✕
              </button>
            </div>

            {/* 콘텐츠 */}
            <div style={{ padding: '24px' }}>
              {/* 현재 캐릭터 */}
              {aiPhoto && !photoPreview && (
                <div style={{
                  marginBottom: '24px',
                  padding: '20px',
                  background: 'linear-gradient(135deg, #f6f8fb 0%, #e9eef5 100%)',
                  borderRadius: '16px'
                }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#666',
                    marginBottom: '12px'
                  }}>
                    현재 AI 캐릭터
                  </div>
                  <img
                    src={aiPhoto}
                    alt="현재 캐릭터"
                    style={{
                      width: '100%',
                      borderRadius: '12px',
                      marginBottom: '12px'
                    }}
                  />
                  <button
                    onClick={deleteCharacter}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ef4444',
                      background: 'white',
                      borderRadius: '12px',
                      color: '#ef4444',
                      fontSize: '15px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ 캐릭터 삭제
                  </button>
                </div>
              )}

              {/* 사진 업로드 영역 */}
              {!photoPreview ? (
                <label style={{
                  display: 'block',
                  padding: '60px 20px',
                  border: '3px dashed #667eea',
                  borderRadius: '16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                }}>
                  <div style={{
                    fontSize: '64px',
                    marginBottom: '16px'
                  }}>
                    📸
                  </div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#333',
                    marginBottom: '8px'
                  }}>
                    사진을 선택하세요
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#999'
                  }}>
                    클릭하거나 드래그 & 드롭
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              ) : (
                <div>
                  {/* 미리보기 */}
                  <div style={{
                    marginBottom: '20px',
                    padding: '20px',
                    background: 'linear-gradient(135deg, #f6f8fb 0%, #e9eef5 100%)',
                    borderRadius: '16px'
                  }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#666',
                      marginBottom: '12px'
                    }}>
                      업로드한 사진
                    </div>
                    <img
                      src={photoPreview}
                      alt="미리보기"
                      style={{
                        width: '100%',
                        borderRadius: '12px'
                      }}
                    />
                  </div>

                  {/* 버튼들 */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px'
                  }}>
                    <button
                      onClick={() => {
                        setPhotoFile(null)
                        setPhotoPreview(null)
                      }}
                      style={{
                        padding: '16px',
                        border: '2px solid #ddd',
                        background: 'white',
                        borderRadius: '12px',
                        color: '#666',
                        fontSize: '15px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      다시 선택
                    </button>
                    <button
                      onClick={generateAICharacter}
                      disabled={uploadingPhoto}
                      style={{
                        padding: '16px',
                        border: 'none',
                        background: uploadingPhoto
                          ? '#ddd'
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '15px',
                        fontWeight: 700,
                        cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                        boxShadow: uploadingPhoto ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)'
                      }}
                    >
                      {uploadingPhoto ? '⏳ 생성 중...' : '✨ AI 캐릭터 생성'}
                    </button>
                  </div>
                </div>
              )}

              {/* 안내 메시지 */}
              <div style={{
                marginTop: '24px',
                padding: '16px',
                background: 'linear-gradient(135deg, #fff3cd 0%, #ffe8a1 100%)',
                borderRadius: '12px',
                fontSize: '13px',
                color: '#856404',
                lineHeight: 1.6
              }}>
                <div style={{
                  fontWeight: 700,
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  💡 AI 캐릭터 생성 정보
                </div>
                <div>
                  • 실제 서비스에서는 OpenAI DALL-E 또는 Midjourney API를 사용합니다<br />
                  • 업로드한 사진을 복싱 스타일 캐릭터로 자동 변환합니다<br />
                  • 생성된 캐릭터는 프로필과 홈 화면에 표시됩니다<br />
                  • 현재는 시뮬레이션 버전입니다
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}

function StatMini({ label, value, unit, color = '#667eea' }: any) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '16px', fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: '9px', color: '#999', marginTop: '2px' }}>{label} ({unit})</div>
    </div>
  )
}

function QuickAction({ icon, label, onClick, gradient = false, badge = null }: any) {
  return (
    <div
      onClick={onClick}
      style={{
        background: gradient 
          ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
          : 'rgba(255,255,255,0.95)',
        borderRadius: '18px',
        padding: '18px 12px',
        textAlign: 'center',
        cursor: 'pointer',
        boxShadow: gradient
          ? '0 8px 25px rgba(255, 215, 0, 0.4)'
          : '0 6px 20px rgba(0,0,0,0.1)',
        border: gradient ? 'none' : '2px solid rgba(255,255,255,0.5)',
        transition: 'all 0.3s',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = gradient
          ? '0 12px 35px rgba(255, 215, 0, 0.5)'
          : '0 8px 25px rgba(0,0,0,0.15)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = gradient
          ? '0 8px 25px rgba(255, 215, 0, 0.4)'
          : '0 6px 20px rgba(0,0,0,0.1)'
      }}
    >
      {badge && (
        <div style={{
          position: 'absolute',
          top: '-5px',
          right: '-5px',
          background: '#ef4444',
          color: 'white',
          fontSize: '9px',
          fontWeight: 800,
          padding: '2px 6px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
        }}>
          {badge}
        </div>
      )}
      <div style={{ fontSize: '32px', marginBottom: '6px' }}>{icon}</div>
      <div style={{
        fontSize: '12px',
        fontWeight: 800,
        color: gradient ? '#000' : '#333'
      }}>
        {label}
      </div>
    </div>
  )
}
