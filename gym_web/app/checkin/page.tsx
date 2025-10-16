'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'

interface Membership {
  id: number
  plan_name: string
  start_date: string
  end_date: string
  status: string
  remaining_days: number
}

interface Member {
  id: number
  name: string
  phone: string
  status: string
  current_plan: string | null
  membership_end_date: string | null
  memberships: Membership[]
  total_attendance: number
  attendance_streak: number
  last_attendance: string | null
}

export default function CheckInPage() {
  const [step, setStep] = useState<'input' | 'select' | 'info' | 'success'>('input')
  const [phoneInput, setPhoneInput] = useState('')
  const [members, setMembers] = useState<Member[]>([])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [todayCheckedIn, setTodayCheckedIn] = useState(false)

  // 자동으로 초기 화면으로 돌아가기
  useEffect(() => {
    if (step === 'success') {
      const timer = setTimeout(() => {
        resetForm()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [step])

  const resetForm = () => {
    setStep('input')
    setPhoneInput('')
    setMembers([])
    setSelectedMember(null)
    setError('')
    setTodayCheckedIn(false)
  }

  const handlePhoneInput = (num: string) => {
    if (phoneInput.length < 4) {
      const newInput = phoneInput + num
      setPhoneInput(newInput)
      setError('')
    }
  }

  const handleBackspace = () => {
    setPhoneInput(phoneInput.slice(0, -1))
    setError('')
  }

  const handleClear = () => {
    setPhoneInput('')
    setError('')
  }

  const searchMember = async () => {
    if (phoneInput.length !== 4) {
      setError('휴대폰 번호 뒤 4자리를 입력해주세요')
      return
    }

    setLoading(true)
    setError('')

    try {
      const apiBase = getApiUrl()
      const res = await axios.get(`${apiBase}/members/search_by_phone/`, {
        params: { last4: phoneInput },
        timeout: 10000
      })

      if (res.data) {
        // 단일 회원 또는 배열로 응답 처리
        const memberData = Array.isArray(res.data) ? res.data : [res.data]
        
        if (memberData.length === 0) {
          setError('등록된 회원 정보를 찾을 수 없습니다')
          setLoading(false)
        } else if (memberData.length === 1) {
          // 회원이 1명이면 바로 정보 표시
          const member = memberData[0]
          setSelectedMember(member)
          
          // 오늘 이미 출석했는지 체크
          if (member.last_attendance) {
            const lastAttendance = new Date(member.last_attendance)
            const today = new Date()
            const isToday = lastAttendance.toDateString() === today.toDateString()
            setTodayCheckedIn(isToday)
          }
          
          setStep('info')
          setLoading(false)
        } else {
          // 여러 명이면 선택 화면 표시
          setMembers(memberData)
          setStep('select')
          setLoading(false)
        }
      }
    } catch (err: any) {
      console.error('회원 조회 실패:', err)
      if (err.response?.status === 404) {
        setError('등록된 회원 정보를 찾을 수 없습니다')
      } else if (err.code === 'ECONNABORTED') {
        setError('서버 응답 시간이 초과되었습니다')
      } else {
        setError('회원 조회 중 오류가 발생했습니다')
      }
      setLoading(false)
    }
  }

  const selectMember = (member: Member) => {
    setSelectedMember(member)
    
    // 오늘 이미 출석했는지 체크
    if (member.last_attendance) {
      const lastAttendance = new Date(member.last_attendance)
      const today = new Date()
      const isToday = lastAttendance.toDateString() === today.toDateString()
      setTodayCheckedIn(isToday)
    }
    
    setStep('info')
  }

  const handleCheckIn = async () => {
    if (!selectedMember) return

    setLoading(true)
    setError('')

    try {
      const apiBase = getApiUrl()
      const today = new Date().toISOString().split('T')[0]
      const now = new Date().toISOString()
      
      console.log('출석 체크 시작:', {
        member_id: selectedMember.id,
        date: today,
        check_in_time: now
      })
      
      const response = await axios.post(`${apiBase}/attendance/`, {
        member: selectedMember.id,
        date: today,
        check_in_time: now,
        status: 'present'
      }, {
        timeout: 10000
      })

      console.log('출석 체크 성공:', response.data)
      setStep('success')
      setLoading(false)
    } catch (err: any) {
      console.error('출석 체크 실패:', err)
      console.error('에러 상세:', err.response?.data)
      if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError('출석 체크 중 오류가 발생했습니다')
      }
      setLoading(false)
    }
  }

  // INPUT 화면
  if (step === 'input') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}>
        <div style={{ maxWidth: '480px', width: '100%' }}>
          {/* 로고 */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              fontSize: '72px',
              marginBottom: '16px',
              animation: 'fadeIn 0.6s ease-out'
            }}>💪</div>
            <h1 style={{
              fontSize: '48px',
              fontWeight: '900',
              color: 'white',
              margin: '0 0 8px 0',
              letterSpacing: '-1px'
            }}>펌피</h1>
            <p style={{
              fontSize: '20px',
              color: 'rgba(255,255,255,0.9)',
              margin: 0,
              fontWeight: '600'
            }}>출석 체크</p>
          </div>

          {/* 입력 카드 */}
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '40px 32px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#1a1a1a',
              textAlign: 'center',
              margin: '0 0 32px 0'
            }}>
              휴대폰 번호 뒤 4자리
            </h2>

            {/* 입력 디스플레이 */}
            <div style={{
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px'
              }}>
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    style={{
                      width: '64px',
                      height: '72px',
                      background: 'white',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '36px',
                      fontWeight: '700',
                      color: phoneInput[idx] ? '#667eea' : '#e0e0e0',
                      boxShadow: phoneInput[idx] ? '0 4px 12px rgba(102,126,234,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {phoneInput[idx] || '·'}
                  </div>
                ))}
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div style={{
                background: '#fee',
                border: '2px solid #fcc',
                color: '#c33',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '24px',
                fontSize: '15px',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            {/* 숫자 키패드 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginBottom: '16px'
            }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handlePhoneInput(num.toString())}
                  disabled={loading}
                  style={{
                    height: '64px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '28px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease',
                    boxShadow: '0 4px 12px rgba(102,126,234,0.3)'
                  }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleClear}
                disabled={loading}
                style={{
                  height: '64px',
                  background: '#f0f0f0',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#666',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'transform 0.1s ease'
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                지우기
              </button>
              <button
                onClick={() => handlePhoneInput('0')}
                disabled={loading}
                style={{
                  height: '64px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '28px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'transform 0.1s ease',
                  boxShadow: '0 4px 12px rgba(102,126,234,0.3)'
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                disabled={loading}
                style={{
                  height: '64px',
                  background: '#f0f0f0',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#666',
                  fontSize: '24px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'transform 0.1s ease'
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                ←
              </button>
            </div>

            {/* 확인 버튼 */}
            <button
              onClick={searchMember}
              disabled={phoneInput.length !== 4 || loading}
              style={{
                width: '100%',
                height: '64px',
                background: phoneInput.length === 4 ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' : '#e0e0e0',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '20px',
                fontWeight: '700',
                cursor: phoneInput.length === 4 ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                boxShadow: phoneInput.length === 4 ? '0 4px 12px rgba(17,153,142,0.3)' : 'none'
              }}
            >
              {loading ? '조회 중...' : '확인'}
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    )
  }

  // SELECT 화면
  if (step === 'select' && members.length > 0) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}>
        <div style={{ maxWidth: '600px', width: '100%' }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '40px 32px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a1a1a',
              textAlign: 'center',
              margin: '0 0 8px 0'
            }}>
              회원을 선택해주세요
            </h2>
            <p style={{
              textAlign: 'center',
              color: '#666',
              margin: '0 0 32px 0',
              fontSize: '15px'
            }}>
              동일한 번호로 {members.length}명이 조회되었습니다
            </p>

            <div style={{ marginBottom: '24px' }}>
              {members.map((member, index) => (
                <button
                  key={member.id}
                  onClick={() => selectMember(member)}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: index < members.length - 1 ? '12px' : '0',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: '700',
                      color: 'white',
                      flexShrink: 0
                    }}>
                      {member.name[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '22px',
                        fontWeight: '700',
                        color: '#1a1a1a',
                        marginBottom: '4px'
                      }}>
                        {member.name}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#666'
                      }}>
                        {member.phone}
                      </div>
                    </div>
                    <div style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      background: member.status === 'active' ? '#e8f5e9' : '#fff3e0',
                      color: member.status === 'active' ? '#2e7d32' : '#e65100'
                    }}>
                      {member.status === 'active' ? '활성' : member.status === 'pending' ? '대기' : member.status}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={resetForm}
              style={{
                width: '100%',
                height: '56px',
                background: '#f0f0f0',
                border: 'none',
                borderRadius: '12px',
                color: '#666',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              취소
            </button>
          </div>
        </div>
      </div>
    )
  }

  // INFO 화면
  if (step === 'info' && selectedMember) {
    const activeMemberships = selectedMember.memberships.filter(m => m.status === 'active')
    
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        overflow: 'auto'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* 회원 정보 카드 */}
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            marginBottom: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {/* 프로필 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '32px',
              paddingBottom: '24px',
              borderBottom: '2px solid #f0f0f0'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                fontWeight: '700',
                color: 'white',
                flexShrink: 0,
                boxShadow: '0 8px 16px rgba(102,126,234,0.3)'
              }}>
                {selectedMember.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{
                  fontSize: '32px',
                  fontWeight: '900',
                  color: '#1a1a1a',
                  margin: '0 0 8px 0',
                  letterSpacing: '-0.5px'
                }}>
                  {selectedMember.name}
                </h2>
                <p style={{
                  fontSize: '16px',
                  color: '#666',
                  margin: 0
                }}>
                  {selectedMember.phone}
                </p>
              </div>
            </div>

            {/* 출석 통계 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginBottom: '32px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center',
                color: 'white'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '900',
                  marginBottom: '4px'
                }}>
                  {selectedMember.total_attendance}
                </div>
                <div style={{
                  fontSize: '13px',
                  opacity: 0.9,
                  fontWeight: '600'
                }}>
                  총 출석
                </div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center',
                color: 'white'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '900',
                  marginBottom: '4px'
                }}>
                  {selectedMember.attendance_streak}
                </div>
                <div style={{
                  fontSize: '13px',
                  opacity: 0.9,
                  fontWeight: '600'
                }}>
                  연속 🔥
                </div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center',
                color: 'white'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '900',
                  marginBottom: '4px'
                }}>
                  {selectedMember.last_attendance 
                    ? new Date(selectedMember.last_attendance).getDate()
                    : '-'
                  }
                </div>
                <div style={{
                  fontSize: '13px',
                  opacity: 0.9,
                  fontWeight: '600'
                }}>
                  최근 출석
                </div>
              </div>
            </div>

            {/* 오늘 출석 완료 */}
            {todayCheckedIn && (
              <div style={{
                background: '#e8f5e9',
                border: '2px solid #4caf50',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '40px',
                  marginBottom: '8px'
                }}>
                  ✅
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#2e7d32'
                }}>
                  오늘 이미 출석하셨습니다!
                </div>
              </div>
            )}

            {/* 회원권 정보 */}
            {activeMemberships.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#666',
                  margin: '0 0 16px 0'
                }}>
                  💳 회원권 정보
                </h3>
                {activeMemberships.map((membership) => (
                  <div
                    key={membership.id}
                    style={{
                      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                      borderRadius: '16px',
                      padding: '20px',
                      marginBottom: '12px'
                    }}
                  >
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#1a1a1a',
                      marginBottom: '8px'
                    }}>
                      {membership.plan_name}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#666',
                      marginBottom: '12px'
                    }}>
                      {new Date(membership.start_date).toLocaleDateString('ko-KR')} ~ {new Date(membership.end_date).toLocaleDateString('ko-KR')}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{
                        fontSize: '14px',
                        color: '#666'
                      }}>
                        남은 기간
                      </span>
                      <span style={{
                        fontSize: '24px',
                        fontWeight: '900',
                        color: membership.remaining_days <= 7 ? '#f44336' : membership.remaining_days <= 30 ? '#ff9800' : '#4caf50'
                      }}>
                        {membership.remaining_days}일
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 에러 */}
            {error && (
              <div style={{
                background: '#fee',
                border: '2px solid #fcc',
                color: '#c33',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '24px',
                fontSize: '15px',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            {/* 버튼 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
              gap: '12px'
            }}>
              <button
                onClick={resetForm}
                style={{
                  height: '64px',
                  background: '#f0f0f0',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#666',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={handleCheckIn}
                disabled={loading || todayCheckedIn}
                style={{
                  height: '64px',
                  background: todayCheckedIn ? '#e0e0e0' : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: '700',
                  cursor: todayCheckedIn ? 'not-allowed' : 'pointer',
                  boxShadow: todayCheckedIn ? 'none' : '0 4px 12px rgba(17,153,142,0.3)'
                }}
              >
                {loading ? '처리 중...' : todayCheckedIn ? '출석 완료' : '✅ 출석하기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // SUCCESS 화면
  if (step === 'success' && selectedMember) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          animation: 'scaleIn 0.5s ease-out'
        }}>
          <div style={{
            fontSize: '120px',
            marginBottom: '24px',
            animation: 'bounce 0.6s ease-out'
          }}>
            ✅
          </div>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '48px 64px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{
              fontSize: '48px',
              fontWeight: '900',
              color: '#1a1a1a',
              margin: '0 0 16px 0',
              letterSpacing: '-1px'
            }}>
              출석 완료!
            </h2>
            <p style={{
              fontSize: '28px',
              color: '#666',
              fontWeight: '700',
              margin: '0 0 32px 0'
            }}>
              {selectedMember.name} 님
            </p>
            <div style={{
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <div style={{
                fontSize: '56px',
                fontWeight: '900',
                color: 'white',
                marginBottom: '8px'
              }}>
                {(selectedMember.attendance_streak || 0) + 1}일
              </div>
              <div style={{
                fontSize: '18px',
                color: 'white',
                opacity: 0.9,
                fontWeight: '600'
              }}>
                연속 출석 달성! 🔥
              </div>
            </div>
            <p style={{
              fontSize: '14px',
              color: '#999',
              margin: 0
            }}>
              잠시 후 자동으로 돌아갑니다...
            </p>
          </div>
        </div>

        <style jsx>{`
          @keyframes scaleIn {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
        `}</style>
      </div>
    )
  }

  return null
}
