'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'
import BottomNav from './components/BottomNav'

export default function MemberAppHome() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [todayWOD, setTodayWOD] = useState<any>(null)
  const [todayCalories, setTodayCalories] = useState(0)
  const [bodyStats, setBodyStats] = useState({ weight: 70, muscle: 35, fat: 15 })
  const [isEditingBody, setIsEditingBody] = useState(false)
  const [tempBodyStats, setTempBodyStats] = useState(bodyStats)
  const [loading, setLoading] = useState(true)
  const [aiPhoto, setAiPhoto] = useState<string | null>(null)
  const [attendanceStats, setAttendanceStats] = useState({
    consecutive: 0,
    thisMonth: 0,
    total: 0
  })
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([])
  const [showAttendanceDetail, setShowAttendanceDetail] = useState(false)
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([])
  const [isCompletingWorkout, setIsCompletingWorkout] = useState(false)
  const [showWorkoutDetail, setShowWorkoutDetail] = useState(false)

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser')
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    loadData()

    // 30초마다 출석 데이터 새로고침
    const interval = setInterval(() => {
      loadData()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

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
        const stats = JSON.parse(savedBodyStats)
        setBodyStats(stats)
        setTempBodyStats(stats)
      }

      const wodsRes = await axios.get(`${apiBase}/wods/`)
      const today = new Date().toISOString().split('T')[0]
      const todayWODs = wodsRes.data.filter((w: any) => w.date === today)
      if (todayWODs.length > 0) {
        setTodayWOD(todayWODs[0])
      }

      const attendanceRes = await axios.get(`${apiBase}/attendance/?member=${user.id}`)
      const attendanceData = attendanceRes.data
      console.log('출석 데이터 로드:', {
        total: attendanceData.length,
        data: attendanceData
      })
      setAttendanceHistory(attendanceData)

      const consecutive = calculateConsecutiveDays(attendanceData)
      const thisMonth = calculateThisMonthAttendance(attendanceData)
      const total = attendanceData.length

      console.log('출석 통계:', { consecutive, thisMonth, total })
      setAttendanceStats({ consecutive, thisMonth, total })

      // 운동 내역 로드 (localStorage에서)
      const savedWorkoutHistory = localStorage.getItem(`workout_history_${user.id}`)
      if (savedWorkoutHistory) {
        setWorkoutHistory(JSON.parse(savedWorkoutHistory))
      }

      const todayAttendance = attendanceData.find((a: any) => 
        a.check_in_time?.startsWith(today)
      )
      
      if (todayAttendance && todayAttendance.check_out_time) {
        const checkIn = new Date(todayAttendance.check_in_time)
        const checkOut = new Date(todayAttendance.check_out_time)
        const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)
        const calories = Math.round(hours * 300)
        setTodayCalories(calories)
      }

      setLoading(false)
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  const calculateConsecutiveDays = (attendance: any[]) => {
    if (attendance.length === 0) return 0
    
    // 날짜만 추출하고 중복 제거
    const uniqueDates: string[] = Array.from(new Set(
      attendance
        .map(a => {
          const dateStr = a.check_in_time 
            ? new Date(a.check_in_time).toISOString().split('T')[0]
            : a.date
            ? new Date(a.date).toISOString().split('T')[0]
            : null
          return dateStr
        })
        .filter((d): d is string => d !== null)
    )).sort().reverse()
    
    if (uniqueDates.length === 0) return 0
    
    let consecutive = 1
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    // 오늘이나 어제 출석한 경우만 연속 출석 계산
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0
    
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i-1])
      const currDate = new Date(uniqueDates[i])
      const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays === 1) consecutive++
      else break
    }
    return consecutive
  }

  const calculateThisMonthAttendance = (attendance: any[]) => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    
    // 중복 제거하고 이번 달 출석만 카운트
    const uniqueDates = new Set(
      attendance
        .filter(a => {
          const dateStr = a.check_in_time || a.date
          if (!dateStr) return false
          const date = new Date(dateStr)
          return date.getFullYear() === year && date.getMonth() === month
        })
        .map(a => {
          const dateStr = a.check_in_time || a.date
          return new Date(dateStr).toISOString().split('T')[0]
        })
    )
    
    return uniqueDates.size
  }

  const handleSaveBodyStats = () => {
    setBodyStats(tempBodyStats)
    if (currentUser) {
      localStorage.setItem(`body_stats_${currentUser.id}`, JSON.stringify(tempBodyStats))
    }
    setIsEditingBody(false)
    alert('✅ 신체 정보가 저장되었습니다!')
  }

  const handleCompleteWorkout = async () => {
    if (!todayWOD || !currentUser) return

    if (confirm('오늘의 운동을 완료하셨나요?')) {
      setIsCompletingWorkout(true)

      try {
        // 운동 시간 계산 (기본 1시간)
        const workoutDuration = 1.0 // hours
        
        // 칼로리 계산 (체중 기반)
        // 평균적으로 체중 1kg당 시간당 약 7kcal 소모
        const calculatedCalories = Math.round(bodyStats.weight * 7 * workoutDuration)

        // WOD 설명을 파싱하여 운동 상세 정보 생성
        const exercises = parseWODDescription(todayWOD.description, calculatedCalories)

        // 운동 기록 생성
        const workoutRecord = {
          id: Date.now(),
          date: new Date().toISOString(),
          wod: todayWOD,
          calories: calculatedCalories,
          duration: workoutDuration,
          completedAt: new Date().toISOString(),
          exercises: exercises // 운동별 상세 정보 추가
        }

        // 운동 내역에 추가
        const updatedHistory = [workoutRecord, ...workoutHistory]
        setWorkoutHistory(updatedHistory)
        
        // localStorage에 저장
        localStorage.setItem(`workout_history_${currentUser.id}`, JSON.stringify(updatedHistory))

        // 오늘의 칼로리 업데이트
        setTodayCalories(calculatedCalories)

        setIsCompletingWorkout(false)
        alert(`✅ 운동 완료!\n🔥 ${calculatedCalories}kcal 소모되었습니다!`)
      } catch (error) {
        console.error('운동 완료 처리 실패:', error)
        setIsCompletingWorkout(false)
        alert('운동 완료 처리 중 오류가 발생했습니다.')
      }
    }
  }

  // WOD 설명을 파싱하여 운동 목록 생성
  const parseWODDescription = (description: string, totalCalories: number): Array<{name: string, sets: number, reps: number, calories: number}> => {
    // 간단한 파싱: "운동명 세트수" 형식을 찾음
    const exercises: Array<{name: string, sets: number, reps: number, calories: number}> = []
    const lines = description.split('\n').filter(line => line.trim())
    
    if (lines.length === 0) {
      // 기본 운동 정보
      return [{
        name: '복합 운동',
        sets: 5,
        reps: 10,
        calories: totalCalories
      }]
    }

    const caloriesPerExercise = Math.round(totalCalories / Math.max(lines.length, 1))
    
    lines.forEach((line, index) => {
      // "스쿼트 5세트" 또는 "데드리프트 3세트 x 10회" 같은 패턴 찾기
      const setsMatch = line.match(/(\d+)\s*세트/i)
      const repsMatch = line.match(/x?\s*(\d+)\s*회/i)
      
      let exerciseName = line
        .replace(/\d+\s*세트/gi, '')
        .replace(/x?\s*\d+\s*회/gi, '')
        .trim()
      
      if (!exerciseName) {
        exerciseName = `운동 ${index + 1}`
      }

      exercises.push({
        name: exerciseName,
        sets: setsMatch ? parseInt(setsMatch[1]) : 5,
        reps: repsMatch ? parseInt(repsMatch[1]) : 10,
        calories: caloriesPerExercise
      })
    })

    return exercises
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e0e7ff',
            borderTop: '3px solid #667eea',
            borderRadius: '50%',
            margin: '0 auto 15px',
            animation: 'spin 0.8s linear infinite'
          }} />
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
      background: '#f8fafc',
      paddingBottom: '100px'
    }}>
      {/* Simplified Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '25px 20px',
        borderRadius: '0 0 25px 25px'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '24px',
          fontWeight: 800,
          color: 'white'
        }}>
          {currentUser?.last_name}{currentUser?.first_name}님 💪
        </h1>
      </div>

      <div style={{ padding: '0 20px' }}>
        {/* AI Character Card - Large Display */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '25px',
          padding: '25px',
          marginTop: '-15px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <div
            onClick={() => router.push('/app/profile')}
            style={{
              width: '100%',
              height: '350px',
              borderRadius: '20px',
              background: aiPhoto ? `url(${aiPhoto})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              cursor: 'pointer',
              filter: aiPhoto ? 'contrast(1.2) saturate(1.3) brightness(1.05)' : 'none',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
            }}
          >
            {!aiPhoto && (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <div style={{ fontSize: '80px', marginBottom: '15px' }}>👤</div>
                <div style={{ fontSize: '18px', fontWeight: 700, opacity: 0.9 }}>
                  AI 캐릭터를 만들어보세요
                </div>
              </div>
            )}
            {aiPhoto && (
              <>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                  mixBlendMode: 'overlay'
                }} />
                {/* AI Badge */}
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  left: '15px',
                  padding: '8px 15px',
                  background: 'rgba(102, 126, 234, 0.95)',
                  borderRadius: '20px',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <span>✨</span>
                  <span>AI Character</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Gym Info Box */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '18px',
          marginBottom: '15px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            flexShrink: 0,
            border: '2px solid #d4af37'
          }}>
            🥊
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              margin: '0 0 4px 0',
              fontSize: '16px',
              fontWeight: 800,
              color: '#333'
            }}>
              블랙샤크 본관
            </h3>
            <p style={{
              margin: 0,
              fontSize: '13px',
              color: '#999'
            }}>
              회원님의 강한 파이팅을 응원합니다 🥋
            </p>
          </div>
        </div>

        {/* Body Stats - Compact */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '15px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#333' }}>
              📊 신체 정보
            </h3>
            <button
              onClick={() => isEditingBody ? handleSaveBodyStats() : setIsEditingBody(true)}
              style={{
                padding: '6px 12px',
                borderRadius: '12px',
                border: 'none',
                background: isEditingBody ? '#10b981' : '#f3f4f6',
                color: isEditingBody ? 'white' : '#667eea',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {isEditingBody ? '✅ 저장' : '✏️ 수정'}
            </button>
          </div>

          {isEditingBody ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#999', display: 'block', marginBottom: '5px' }}>체중(kg)</label>
                <input
                  type="number"
                  value={tempBodyStats.weight}
                  onChange={(e) => setTempBodyStats({ ...tempBodyStats, weight: parseFloat(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '10px',
                    border: '1px solid #e0e7ff',
                    fontSize: '14px',
                    fontWeight: 700,
                    textAlign: 'center'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#999', display: 'block', marginBottom: '5px' }}>근육(kg)</label>
                <input
                  type="number"
                  value={tempBodyStats.muscle}
                  onChange={(e) => setTempBodyStats({ ...tempBodyStats, muscle: parseFloat(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '10px',
                    border: '1px solid #e0e7ff',
                    fontSize: '14px',
                    fontWeight: 700,
                    textAlign: 'center'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#999', display: 'block', marginBottom: '5px' }}>체지방(%)</label>
                <input
                  type="number"
                  value={tempBodyStats.fat}
                  onChange={(e) => setTempBodyStats({ ...tempBodyStats, fat: parseFloat(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '10px',
                    border: '1px solid #e0e7ff',
                    fontSize: '14px',
                    fontWeight: 700,
                    textAlign: 'center'
                  }}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <StatBox emoji="⚖️" value={bodyStats.weight} label="체중(kg)" color="#667eea" />
              <StatBox emoji="💪" value={bodyStats.muscle} label="근육(kg)" color="#10b981" />
              <StatBox emoji="🔥" value={bodyStats.fat} label="체지방(%)" color="#f59e0b" />
            </div>
          )}
        </div>

        {/* Today's Workout - Always Show */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '15px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#333' }}>
              🏋️ 오늘의 운동
            </h3>
            {todayWOD && (
              <button
                onClick={handleCompleteWorkout}
                disabled={isCompletingWorkout || todayCalories > 0}
                style={{
                  padding: '8px 16px',
                  borderRadius: '15px',
                  border: 'none',
                  background: (isCompletingWorkout || todayCalories > 0) 
                    ? '#e0e7ff' 
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: (isCompletingWorkout || todayCalories > 0) ? 'not-allowed' : 'pointer',
                  boxShadow: (isCompletingWorkout || todayCalories > 0) ? 'none' : '0 2px 8px rgba(16, 185, 129, 0.3)'
                }}
              >
                {isCompletingWorkout ? '처리 중...' : todayCalories > 0 ? '✅ 완료됨' : '완료하기'}
              </button>
            )}
          </div>
          {todayWOD ? (
            <>
              <div style={{
                padding: '15px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                color: 'white',
                marginBottom: '10px'
              }}>
                <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '5px' }}>WOD</div>
                <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
                  {todayWOD.title}
                </div>
                <div style={{ fontSize: '13px', opacity: 0.95, lineHeight: 1.5 }}>
                  {todayWOD.description}
                </div>
              </div>
              {todayCalories > 0 && (
                <div style={{
                  padding: '12px',
                  background: 'linear-gradient(135deg, #f59e0b15 0%, #fbbf2415 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '20px' }}>🔥</span>
                  <span style={{ fontSize: '20px', fontWeight: 900, color: '#f59e0b' }}>
                    {todayCalories}
                  </span>
                  <span style={{ fontSize: '13px', color: '#999', fontWeight: 600 }}>kcal 소모</span>
                </div>
              )}
            </>
          ) : (
            <div style={{
              padding: '30px',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>💪</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#667eea', marginBottom: '5px' }}>
                오늘의 운동 준비 중
              </div>
              <div style={{ fontSize: '13px', color: '#999' }}>
                트레이너가 등록하면 표시됩니다
              </div>
            </div>
          )}
        </div>

        {/* Attendance Stats - Compact */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '15px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#333' }}>
              📅 출석 통계
            </h3>
            <button
              onClick={() => setShowAttendanceDetail(!showAttendanceDetail)}
              style={{
                padding: '6px 12px',
                borderRadius: '12px',
                border: 'none',
                background: '#f3f4f6',
                color: '#667eea',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {showAttendanceDetail ? '간단히' : '상세보기'}
            </button>
          </div>

          {!showAttendanceDetail ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <StatBox emoji="🔥" value={attendanceStats.consecutive} label="연속" color="#10b981" />
              <StatBox emoji="📆" value={attendanceStats.thisMonth} label="이번 달" color="#667eea" />
              <StatBox emoji="🏆" value={attendanceStats.total} label="총 출석" color="#f59e0b" />
            </div>
          ) : (
            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {attendanceHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>📝</div>
                  <div style={{ fontSize: '13px' }}>출석 기록이 없습니다</div>
                </div>
              ) : (
                attendanceHistory.map((record, index) => {
                  // check_in_time이 없거나 유효하지 않으면 date를 사용
                  const checkInDate = record.check_in_time 
                    ? new Date(record.check_in_time) 
                    : record.date 
                    ? new Date(record.date)
                    : new Date()
                  
                  const checkOutDate = record.check_out_time ? new Date(record.check_out_time) : null
                  
                  // 날짜가 유효한지 확인
                  const isValidDate = !isNaN(checkInDate.getTime())
                  
                  if (!isValidDate) {
                    console.warn('유효하지 않은 출석 데이터:', record)
                    return null
                  }
                  
                  return (
                    <div
                      key={index}
                      style={{
                        padding: '12px',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#333', marginBottom: '3px' }}>
                          {checkInDate.toLocaleDateString('ko-KR', { 
                            month: 'long', 
                            day: 'numeric',
                            weekday: 'short'
                          })}
                        </div>
                        <div style={{ fontSize: '11px', color: '#999' }}>
                          {checkInDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                          {checkOutDate && (
                            <> → {checkOutDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</>
                          )}
                        </div>
                      </div>
                      <div style={{
                        padding: '5px 10px',
                        borderRadius: '10px',
                        background: record.check_out_time ? '#10b98120' : '#667eea20',
                        color: record.check_out_time ? '#10b981' : '#667eea',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        {record.check_out_time ? '완료' : '진행중'}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>

        {/* Workout History with Detail View */}
        {workoutHistory.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '20px',
            marginBottom: '15px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#333' }}>
                💪 운동 내역
              </h3>
              <button
                onClick={() => setShowWorkoutDetail(!showWorkoutDetail)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#f3f4f6',
                  color: '#667eea',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {showWorkoutDetail ? '간단히' : '상세보기'}
              </button>
            </div>

            {!showWorkoutDetail ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {workoutHistory.slice(0, 3).map((workout: any) => {
                  const workoutDate = new Date(workout.date)
                  const isToday = workoutDate.toDateString() === new Date().toDateString()
                  
                  return (
                    <div
                      key={workout.id}
                      style={{
                        padding: '15px',
                        background: isToday 
                          ? 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)' 
                          : '#f8fafc',
                        borderRadius: '12px',
                        border: isToday ? '2px solid #667eea' : '1px solid #e5e7eb'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 800,
                            color: '#333',
                            marginBottom: '4px'
                          }}>
                            {workout.wod.title}
                            {isToday && (
                              <span style={{
                                marginLeft: '8px',
                                fontSize: '11px',
                                padding: '2px 8px',
                                background: '#667eea',
                                color: 'white',
                                borderRadius: '8px',
                                fontWeight: 700
                              }}>
                                TODAY
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            {workoutDate.toLocaleDateString('ko-KR', { 
                              month: 'long', 
                              day: 'numeric',
                              weekday: 'short'
                            })}
                          </div>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span style={{ fontSize: '16px' }}>🔥</span>
                          <span style={{
                            fontSize: '18px',
                            fontWeight: 900,
                            color: '#f59e0b'
                          }}>
                            {workout.calories}
                          </span>
                          <span style={{ fontSize: '12px', color: '#999' }}>kcal</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {workoutHistory.length > 3 && (
                  <div style={{
                    textAlign: 'center',
                    fontSize: '13px',
                    color: '#999',
                    marginTop: '5px'
                  }}>
                    상세보기를 눌러 모든 운동을 확인하세요
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
              }}>
                {workoutHistory.map((workout: any) => {
                  const workoutDate = new Date(workout.date)
                  const isToday = workoutDate.toDateString() === new Date().toDateString()
                  
                  return (
                    <div
                      key={workout.id}
                      style={{
                        padding: '18px',
                        background: isToday 
                          ? 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)' 
                          : '#f8fafc',
                        borderRadius: '15px',
                        border: isToday ? '2px solid #667eea' : '1px solid #e5e7eb'
                      }}
                    >
                      {/* 운동 헤더 */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '15px',
                        paddingBottom: '12px',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        <div>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: 800,
                            color: '#333',
                            marginBottom: '5px'
                          }}>
                            {workout.wod.title}
                            {isToday && (
                              <span style={{
                                marginLeft: '8px',
                                fontSize: '11px',
                                padding: '3px 10px',
                                background: '#667eea',
                                color: 'white',
                                borderRadius: '10px',
                                fontWeight: 700
                              }}>
                                TODAY
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '13px', color: '#999' }}>
                            {workoutDate.toLocaleDateString('ko-KR', { 
                              year: 'numeric',
                              month: 'long', 
                              day: 'numeric',
                              weekday: 'short'
                            })}
                          </div>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 12px',
                          background: 'linear-gradient(135deg, #f59e0b15 0%, #fbbf2415 100%)',
                          borderRadius: '12px'
                        }}>
                          <span style={{ fontSize: '18px' }}>🔥</span>
                          <span style={{
                            fontSize: '20px',
                            fontWeight: 900,
                            color: '#f59e0b'
                          }}>
                            {workout.calories}
                          </span>
                          <span style={{ fontSize: '13px', color: '#999', fontWeight: 600 }}>kcal</span>
                        </div>
                      </div>

                      {/* 운동 상세 정보 */}
                      {workout.exercises && workout.exercises.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {workout.exercises.map((exercise: any, idx: number) => (
                            <div
                              key={idx}
                              style={{
                                padding: '12px',
                                background: 'white',
                                borderRadius: '10px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <div>
                                <div style={{
                                  fontSize: '14px',
                                  fontWeight: 700,
                                  color: '#333',
                                  marginBottom: '4px'
                                }}>
                                  {idx + 1}. {exercise.name}
                                </div>
                                <div style={{
                                  fontSize: '12px',
                                  color: '#667eea',
                                  fontWeight: 600
                                }}>
                                  {exercise.sets}세트 × {exercise.reps}회
                                </div>
                              </div>
                              <div style={{
                                fontSize: '14px',
                                fontWeight: 700,
                                color: '#f59e0b'
                              }}>
                                ~{exercise.calories}kcal
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{
                          padding: '15px',
                          background: 'white',
                          borderRadius: '10px',
                          fontSize: '13px',
                          color: '#666',
                          lineHeight: 1.6
                        }}>
                          {workout.wod.description}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

// Stat Box Component
function StatBox({ emoji, value, label, color }: { emoji: string; value: number; label: string; color: string }) {
  return (
    <div style={{
      padding: '15px',
      background: `${color}15`,
      borderRadius: '12px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '20px', marginBottom: '5px' }}>{emoji}</div>
      <div style={{ fontSize: '22px', fontWeight: 900, color, marginBottom: '3px' }}>
        {value}
      </div>
      <div style={{ fontSize: '10px', color: '#999', fontWeight: 600 }}>{label}</div>
    </div>
  )
}

