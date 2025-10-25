'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'
import BottomNav from '../components/BottomNav'

export default function AttendanceHistoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [stats, setStats] = useState({ consecutive: 0, thisMonth: 0, total: 0 })

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) {
      router.push('/auth/login')
      return
    }
    const user = JSON.parse(userStr)
    loadAttendance(user.id)
  }, [router])

  const loadAttendance = async (memberId: number) => {
    try {
      const response = await axios.get(`${getApiUrl()}/attendance/?member=${memberId}`)
      const records = response.data || []
      setAttendanceData(records.slice(0, 30)) // 최근 30개만

      const thisMonth = records.filter((r: any) => {
        const date = new Date(r.check_in_time || r.date)
        const now = new Date()
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      }).length

      setStats({
        consecutive: calculateConsecutiveDays(records),
        thisMonth,
        total: records.length
      })
    } catch (error) {
      console.error('출석 데이터 로드 실패:', error)
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
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
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      paddingBottom: '100px'
    }}>
      {/* Header */}
      <div style={{
        padding: '25px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <div
          onClick={() => router.back()}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            fontSize: '20px',
            fontWeight: 800
          }}
        >
          ←
        </div>
        <h1 style={{
          margin: 0,
          fontSize: '28px',
          fontWeight: 900,
          color: 'white',
          textShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}>
          출석 기록
        </h1>
      </div>

      {/* Content */}
      <div style={{
        padding: '0 20px'
      }}>
        {/* 통계 카드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <StatCard
            icon="🔥"
            label="연속 출석"
            value={stats.consecutive}
            unit="일"
            color="#f59e0b"
          />
          <StatCard
            icon="📅"
            label="이번 달"
            value={stats.thisMonth}
            unit="회"
            color="#667eea"
          />
          <StatCard
            icon="🏆"
            label="총 출석"
            value={stats.total}
            unit="회"
            color="#10b981"
          />
        </div>

        {/* 출석 기록 리스트 */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}>
          <h3 style={{
            margin: '0 0 15px 0',
            fontSize: '18px',
            fontWeight: 800,
            color: '#333'
          }}>
            📝 최근 출석 기록
          </h3>
          <div style={{
            display: 'grid',
            gap: '10px'
          }}>
            {attendanceData.length > 0 ? (
              attendanceData.map((record: any, idx: number) => {
                const checkInTime = new Date(record.check_in_time || record.date)
                const hour = checkInTime.getHours()
                const timeOfDay = hour >= 5 && hour < 12 ? '🌅 아침' : hour >= 12 && hour < 18 ? '☀️ 오후' : '🌙 저녁'
                
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '15px',
                      background: '#f8f9fa',
                      borderRadius: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: 800,
                        color: '#333',
                        marginBottom: '4px'
                      }}>
                        {checkInTime.toLocaleDateString('ko-KR', {
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short'
                        })}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#999',
                        fontWeight: 600
                      }}>
                        {checkInTime.toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div style={{
                      padding: '6px 12px',
                      background: 'white',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#10b981'
                    }}>
                      {timeOfDay}
                    </div>
                  </div>
                )
              })
            ) : (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#999'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>📅</div>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>
                  아직 출석 기록이 없습니다
                </div>
                <div style={{ fontSize: '14px', marginTop: '8px' }}>
                  오늘부터 운동을 시작해보세요!
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 응원 메시지 */}
        {stats.consecutive >= 7 && (
          <div style={{
            marginTop: '20px',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '25px',
            textAlign: 'center',
            border: '2px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎉</div>
            <div style={{
              fontSize: '18px',
              fontWeight: 800,
              color: 'white',
              marginBottom: '8px',
              textShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}>
              대단해요! {stats.consecutive}일 연속 출석 중!
            </div>
            <div style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 600
            }}>
              이대로만 계속하면 목표 달성은 시간문제예요!
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

function StatCard({ icon, label, value, unit, color }: any) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.95)',
      borderRadius: '15px',
      padding: '18px 12px',
      textAlign: 'center',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }}>
      <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
      <div style={{
        fontSize: '24px',
        fontWeight: 900,
        color,
        marginBottom: '4px'
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '11px',
        color: '#999',
        fontWeight: 600
      }}>
        {label} ({unit})
      </div>
    </div>
  )
}
