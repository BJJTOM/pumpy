'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'

export default function PendingPage() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = () => {
    // 모바일에서도 접근 가능하도록 동적으로 API 주소 설정
    const apiBase = getApiUrl()

    console.log('API 주소:', apiBase)

    axios.get(`${apiBase}/pending-members/`)
      .then(res => {
        console.log('승인 대기 회원:', res.data)
        setMembers(res.data)
      })
      .catch(err => {
        console.error('API 에러:', err)
        alert('데이터 로드 실패: ' + (err.response?.data?.detail || err.message))
      })
      .finally(() => setLoading(false))
  }

  const handleApprove = (id: number) => {
    if (!confirm('이 회원을 승인하시겠습니까?')) return

    const apiBase = getApiUrl()

    axios.patch(`${apiBase}/members/${id}/`, { status: 'active', is_approved: true })
      .then(() => {
        alert('✅ 승인되었습니다')
        loadMembers()
      })
      .catch(err => {
        console.error('승인 에러:', err)
        alert('❌ 승인 실패: ' + (err.response?.data?.detail || err.message))
      })
  }

  const handleReject = (id: number) => {
    if (!confirm('이 회원을 거부하시겠습니까?')) return

    const apiBase = getApiUrl()

    axios.delete(`${apiBase}/members/${id}/`)
      .then(() => {
        alert('✅ 거부되었습니다')
        loadMembers()
      })
      .catch(err => {
        console.error('거부 에러:', err)
        alert('❌ 거부 실패: ' + (err.response?.data?.detail || err.message))
      })
  }

  if (loading) {
    return (
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
          border: '4px solid var(--line)',
          borderTop: '4px solid var(--pri)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: 'var(--text-sub)', fontSize: '14px' }}>로딩 중...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* 헤더 */}
      <div style={{ 
        marginBottom: 'var(--spacing-3xl)',
        paddingBottom: 'var(--spacing-lg)',
        borderBottom: '2px solid var(--line)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
          <div style={{ fontSize: '32px' }}>⏰</div>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 800, color: 'var(--text)' }}>
            승인 대기
          </h1>
        </div>
        <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-sub)' }}>
          {members.length > 0 ? (
            <>승인 대기 중인 회원이 <strong style={{ color: 'var(--pri)', fontWeight: 700 }}>{members.length}명</strong> 있습니다</>
          ) : (
            <>승인 대기 중인 회원이 없습니다</>
          )}
        </p>
      </div>

      {/* 빈 상태 */}
      {members.length === 0 ? (
        <div className="card" style={{ 
          padding: 'var(--spacing-4xl)', 
          textAlign: 'center',
          background: 'linear-gradient(135deg, var(--bg) 0%, var(--bg2) 100%)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: 'var(--spacing-lg)' }}>✅</div>
          <h3 style={{ margin: '0 0 var(--spacing-sm) 0', fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>
            모든 회원이 승인되었습니다
          </h3>
          <p style={{ margin: 0, color: 'var(--text-sub)', fontSize: '15px' }}>
            새로운 회원 신청을 기다리고 있습니다
          </p>
        </div>
      ) : (
        /* 회원 목록 */
        <div style={{ display: 'grid', gap: 'var(--spacing-xl)' }}>
          {members.map(member => (
            <div key={member.id} className="card" style={{ 
              padding: 0,
              overflow: 'hidden',
              transition: 'all 0.2s ease',
              border: '2px solid var(--line)'
            }}>
              {/* 상단 헤더 영역 */}
              <div style={{ 
                padding: 'var(--spacing-xl) var(--spacing-2xl)',
                background: 'linear-gradient(135deg, var(--pri-light) 0%, rgba(49, 130, 246, 0.05) 100%)',
                borderBottom: '1px solid var(--line)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-lg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, var(--pri) 0%, var(--pri2) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      color: 'white',
                      fontWeight: 700,
                      boxShadow: '0 4px 12px rgba(49, 130, 246, 0.3)'
                    }}>
                      {member.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>
                        {member.name}
                      </h3>
                      <span className="badge warning" style={{ 
                        fontSize: '12px',
                        padding: '4px 12px',
                        background: 'rgba(255, 210, 51, 0.15)',
                        color: '#E67700',
                        fontWeight: 600
                      }}>
                        ⏰ 승인 대기중
                      </span>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <button
                      onClick={() => handleApprove(member.id)}
                      className="btn btn-primary"
                      style={{ 
                        padding: '12px 24px',
                        fontSize: '15px',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, var(--ok) 0%, #00C896 100%)',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0, 217, 165, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>✅</span>
                      <span>승인</span>
                    </button>
                    <button
                      onClick={() => handleReject(member.id)}
                      className="btn btn-secondary"
                      style={{ 
                        padding: '12px 24px',
                        fontSize: '15px',
                        fontWeight: 700,
                        background: 'var(--pill)',
                        color: 'var(--danger)',
                        border: '1px solid var(--line)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>❌</span>
                      <span>거부</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 정보 영역 */}
              <div style={{ padding: 'var(--spacing-2xl)' }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: 'var(--spacing-xl)'
                }}>
                  <div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: 'var(--text-sub)', 
                      marginBottom: 'var(--spacing-xs)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      📱 전화번호
                    </div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: 700,
                      color: 'var(--text)',
                      padding: '8px 0'
                    }}>
                      {member.phone || '-'}
                    </div>
                  </div>

                  <div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: 'var(--text-sub)', 
                      marginBottom: 'var(--spacing-xs)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      📧 이메일
                    </div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: 700,
                      color: 'var(--text)',
                      padding: '8px 0',
                      wordBreak: 'break-all'
                    }}>
                      {member.email || '-'}
                    </div>
                  </div>

                  <div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: 'var(--text-sub)', 
                      marginBottom: 'var(--spacing-xs)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      📅 신청일
                    </div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: 700,
                      color: 'var(--text)',
                      padding: '8px 0'
                    }}>
                      {new Date(member.join_date).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {/* 메모 섹션 */}
                {member.notes && (
                  <div style={{
                    marginTop: 'var(--spacing-xl)',
                    padding: 'var(--spacing-xl)',
                    background: 'linear-gradient(135deg, var(--bg2) 0%, var(--pill) 100%)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--line)'
                  }}>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-sm)',
                      marginBottom: 'var(--spacing-md)',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'var(--text)'
                    }}>
                      <span>📝</span>
                      <span>신청 메모</span>
                    </div>
                    <div style={{ 
                      fontSize: '15px',
                      lineHeight: 1.6,
                      color: 'var(--text-sub)',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {member.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
