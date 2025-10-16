'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'
import BottomNav from '../components/BottomNav'

export default function MemberInfoPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [memberDetail, setMemberDetail] = useState<any>(null)
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) {
      router.push('/auth/login')
      return
    }
    const user = JSON.parse(userStr)
    setCurrentUser(user)
    loadMemberInfo(user.id)
  }, [])

  const loadMemberInfo = async (memberId: number) => {
    try {
      const apiBase = getApiUrl()
      
      // 회원 상세 정보
      const memberRes = await axios.get(`${apiBase}/members/${memberId}/`)
      setMemberDetail(memberRes.data)
      
      // 회원권 정보
      const subscriptionsRes = await axios.get(`${apiBase}/subscriptions/?member=${memberId}`)
      setSubscriptions(subscriptionsRes.data)
      
      setLoading(false)
    } catch (error) {
      console.error('회원 정보 로드 실패:', error)
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
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
        padding: '30px 20px 40px',
        borderRadius: '0 0 30px 30px',
        marginBottom: '-20px',
        border: '2px solid #d4af37',
        borderTop: 'none'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'white'
        }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800 }}>
            내 정보
          </h1>
          <button
            onClick={() => router.back()}
            style={{
              padding: '10px 20px',
              borderRadius: '20px',
              border: '2px solid #d4af37',
              background: 'transparent',
              color: '#d4af37',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            뒤로
          </button>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {/* 기본 정보 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '25px',
          padding: '25px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 800, color: '#333' }}>
            👤 기본 정보
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <InfoRow label="이름" value={memberDetail ? `${memberDetail.last_name}${memberDetail.first_name}` : '-'} />
            <InfoRow label="이메일" value={memberDetail?.email || '-'} />
            <InfoRow label="전화번호" value={memberDetail?.phone || '-'} />
            <InfoRow label="생년월일" value={memberDetail?.birth_date || '-'} />
            <InfoRow label="성별" value={memberDetail?.gender || '-'} />
            <InfoRow label="주소" value={memberDetail?.address || '-'} />
            <InfoRow label="가입일" value={memberDetail?.join_date ? new Date(memberDetail.join_date).toLocaleDateString('ko-KR') : '-'} />
            <InfoRow 
              label="상태" 
              value={memberDetail?.status === 'active' ? '활성' : memberDetail?.status === 'pending' ? '승인대기' : memberDetail?.status === 'paused' ? '정지' : '해지'}
              valueColor={memberDetail?.status === 'active' ? '#10b981' : '#999'}
            />
          </div>
        </div>

        {/* 회원권 정보 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '25px',
          padding: '25px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 800, color: '#333' }}>
            🎫 회원권 정보
          </h3>
          
          {subscriptions.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#999'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📝</div>
              <div style={{ fontSize: '15px', fontWeight: 600 }}>등록된 회원권이 없습니다</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {subscriptions.map((sub, index) => (
                <div
                  key={index}
                  style={{
                    padding: '20px',
                    background: sub.is_active 
                      ? 'linear-gradient(135deg, #10b98115 0%, #05966915 100%)' 
                      : '#f8fafc',
                    borderRadius: '15px',
                    border: sub.is_active ? '2px solid #10b981' : '1px solid #e5e7eb'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '15px'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: 800,
                        color: '#333',
                        marginBottom: '5px'
                      }}>
                        {sub.plan_name || '회원권'}
                        {sub.is_active && (
                          <span style={{
                            marginLeft: '10px',
                            fontSize: '11px',
                            padding: '3px 10px',
                            background: '#10b981',
                            color: 'white',
                            borderRadius: '10px',
                            fontWeight: 700
                          }}>
                            사용중
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', color: '#999' }}>
                        {sub.duration_months}개월권
                      </div>
                    </div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: 900,
                      color: '#667eea'
                    }}>
                      {parseInt(sub.amount_paid).toLocaleString()}원
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '10px',
                    paddingTop: '15px',
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>시작일</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#333' }}>
                        {new Date(sub.start_date).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>종료일</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#333' }}>
                        {new Date(sub.end_date).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                  </div>

                  {sub.is_active && (
                    <div style={{
                      marginTop: '15px',
                      padding: '12px',
                      background: 'white',
                      borderRadius: '10px',
                      fontSize: '13px',
                      color: '#667eea',
                      fontWeight: 600,
                      textAlign: 'center'
                    }}>
                      남은 기간: {Math.max(0, Math.ceil((new Date(sub.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}일
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 입관 동의서 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '25px',
          padding: '25px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 800, color: '#333' }}>
            📋 입관 동의서
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <ConsentItem 
              title="이용약관 동의" 
              agreed={memberDetail?.terms_agreed}
              date={memberDetail?.join_date}
            />
            <ConsentItem 
              title="개인정보 처리방침 동의" 
              agreed={memberDetail?.privacy_agreed}
              date={memberDetail?.join_date}
            />
            <ConsentItem 
              title="마케팅 정보 수신 동의" 
              agreed={memberDetail?.marketing_agreed}
              date={memberDetail?.join_date}
            />
          </div>

          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: '#f8fafc',
            borderRadius: '12px',
            fontSize: '13px',
            color: '#666',
            lineHeight: 1.6
          }}>
            <div style={{ fontWeight: 700, marginBottom: '8px', color: '#333' }}>📌 동의 내용</div>
            • 시설 이용 규칙 준수<br />
            • 개인 정보 수집 및 이용<br />
            • 사진 및 영상 촬영 동의<br />
            • 부상 발생 시 책임 소재<br />
            • 환불 및 양도 규정
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

// 정보 행 컴포넌트
function InfoRow({ label, value, valueColor = '#333' }: { label: string, value: string, valueColor?: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid #f0f0f0'
    }}>
      <div style={{ fontSize: '14px', color: '#999', fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: '14px', color: valueColor, fontWeight: 700 }}>
        {value}
      </div>
    </div>
  )
}

// 동의 항목 컴포넌트
function ConsentItem({ title, agreed, date }: { title: string, agreed?: boolean, date?: string }) {
  return (
    <div style={{
      padding: '15px',
      background: agreed ? '#10b98110' : '#f8fafc',
      borderRadius: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <div style={{
          fontSize: '14px',
          fontWeight: 700,
          color: '#333',
          marginBottom: '4px'
        }}>
          {title}
        </div>
        {agreed && date && (
          <div style={{ fontSize: '12px', color: '#999' }}>
            {new Date(date).toLocaleDateString('ko-KR')} 동의
          </div>
        )}
      </div>
      <div style={{
        fontSize: '24px'
      }}>
        {agreed ? '✅' : '❌'}
      </div>
    </div>
  )
}


