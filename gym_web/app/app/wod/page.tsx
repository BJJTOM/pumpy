'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'
import BottomNav from '../components/BottomNav'

export default function WODPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [todayWOD, setTodayWOD] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) {
      router.push('/auth/login')
      return
    }
    loadWOD()
  }, [router])

  const loadWOD = async () => {
    try {
      const apiBase = getApiUrl()
      const wodsRes = await axios.get(`${apiBase}/wods/`)
      const today = new Date().toISOString().split('T')[0]
      const todayWODs = wodsRes.data.filter((w: any) => w.date === today)
      
      if (todayWODs.length > 0) {
        setTodayWOD(todayWODs[0])
      }
    } catch (error) {
      console.error('WOD 로드 실패:', error)
    } finally {
      setLoading(false)
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
          오늘의 WOD
        </h1>
      </div>

      {/* Content */}
      <div style={{
        padding: '0 20px'
      }}>
        {todayWOD ? (
          <div>
            {/* WOD 카드 */}
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '25px',
              padding: '30px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              border: '2px solid rgba(255,255,255,0.5)',
              marginBottom: '20px'
            }}>
              {/* 날짜 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                paddingBottom: '15px',
                borderBottom: '2px solid #e5e7eb'
              }}>
                <div>
                  <div style={{
                    fontSize: '14px',
                    color: '#999',
                    marginBottom: '5px'
                  }}>
                    날짜
                  </div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#667eea'
                  }}>
                    {new Date(todayWOD.date).toLocaleDateString('ko-KR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      weekday: 'long'
                    })}
                  </div>
                </div>
                <div style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 800,
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)'
                }}>
                  📋 NEW
                </div>
              </div>

              {/* 운동 내용 */}
              <div style={{
                marginBottom: '25px'
              }}>
                <h2 style={{
                  margin: '0 0 15px 0',
                  fontSize: '22px',
                  fontWeight: 900,
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '28px' }}>🏋️</span>
                  운동 내용
                </h2>
                <div style={{
                  padding: '20px',
                  background: '#f8f9fa',
                  borderRadius: '15px',
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#333',
                  whiteSpace: 'pre-wrap',
                  fontWeight: 600
                }}>
                  {todayWOD.content || '운동 내용이 없습니다.'}
                </div>
              </div>

              {/* 노트 (있는 경우) */}
              {todayWOD.notes && (
                <div>
                  <h3 style={{
                    margin: '0 0 10px 0',
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#333',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '22px' }}>📝</span>
                    코치 노트
                  </h3>
                  <div style={{
                    padding: '15px',
                    background: '#fff3cd',
                    borderLeft: '4px solid #fbbf24',
                    borderRadius: '10px',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#666',
                    fontWeight: 600
                  }}>
                    {todayWOD.notes}
                  </div>
                </div>
              )}
            </div>

            {/* 액션 버튼들 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}>
              <button
                onClick={() => router.push('/app')}
                style={{
                  padding: '18px',
                  background: 'rgba(255,255,255,0.95)',
                  border: '2px solid rgba(255,255,255,0.5)',
                  borderRadius: '15px',
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#667eea',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                🏠 홈으로
              </button>
              <button
                onClick={() => {
                  alert('운동 시작! 파이팅! 💪')
                }}
                style={{
                  padding: '18px',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  border: 'none',
                  borderRadius: '15px',
                  fontSize: '16px',
                  fontWeight: 800,
                  color: 'white',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(245, 87, 108, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                💪 운동 시작
              </button>
            </div>

            {/* 응원 메시지 */}
            <div style={{
              marginTop: '25px',
              padding: '25px',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              textAlign: 'center',
              border: '2px solid rgba(255,255,255,0.3)'
            }}>
              <div style={{
                fontSize: '40px',
                marginBottom: '15px'
              }}>🔥</div>
              <div style={{
                fontSize: '18px',
                fontWeight: 800,
                color: 'white',
                marginBottom: '8px',
                textShadow: '0 2px 10px rgba(0,0,0,0.2)'
              }}>
                오늘도 최선을 다해봐요!
              </div>
              <div style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 600
              }}>
                당신의 노력은 절대 배신하지 않습니다
              </div>
            </div>
          </div>
        ) : (
          // WOD가 없을 때
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '25px',
            padding: '50px 30px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            border: '2px solid rgba(255,255,255,0.5)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '80px',
              marginBottom: '20px'
            }}>📋</div>
            <h2 style={{
              margin: '0 0 12px 0',
              fontSize: '24px',
              fontWeight: 900,
              color: '#333'
            }}>
              아직 오늘의 WOD가 없어요
            </h2>
            <p style={{
              margin: '0 0 30px 0',
              fontSize: '16px',
              color: '#666',
              lineHeight: '1.6',
              fontWeight: 600
            }}>
              관리자가 오늘의 운동을 등록하면<br />
              여기에서 확인할 수 있습니다
            </p>
            <button
              onClick={() => router.push('/app')}
              style={{
                padding: '15px 30px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '15px',
                fontSize: '16px',
                fontWeight: 800,
                color: 'white',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
            >
              홈으로 돌아가기
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

