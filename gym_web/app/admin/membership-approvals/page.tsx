'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'

export default function MembershipApprovalsPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pendingSubscriptions, setPendingSubscriptions] = useState<any[]>([])
  const [approvedSubscriptions, setApprovedSubscriptions] = useState<any[]>([])
  const [rejectedSubscriptions, setRejectedSubscriptions] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [processingId, setProcessingId] = useState<number | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin')
      return
    }
    setIsAuthenticated(true)
    loadSubscriptions()
  }, [router])

  const loadSubscriptions = async () => {
    setLoading(true)
    try {
      const apiBase = getApiUrl()
      const response = await axios.get(`${apiBase}/subscriptions/`)
      const subscriptions = response.data

      console.log('📦 구독 데이터:', subscriptions)

      // 상태별로 분류
      const pending = subscriptions.filter((s: any) => 
        s.approval_status === 'pending' || (!s.is_active && !s.approval_status) || (!s.is_active && s.approval_status === 'approved')
      )
      const approved = subscriptions.filter((s: any) => 
        s.is_active && (s.approval_status === 'approved' || !s.approval_status)
      )
      const rejected = subscriptions.filter((s: any) => s.approval_status === 'rejected')

      console.log('⏳ 승인 대기:', pending.length, pending)
      console.log('✅ 승인 완료:', approved.length)
      console.log('❌ 거절됨:', rejected.length)

      setPendingSubscriptions(pending)
      setApprovedSubscriptions(approved)
      setRejectedSubscriptions(rejected)
    } catch (error) {
      console.error('구독 목록 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (subscription: any) => {
    if (!confirm(`${subscription.member_name || '회원'}님의 회원권을 승인하시겠습니까?`)) return

    setProcessingId(subscription.id)
    try {
      const apiBase = getApiUrl()

      console.log('🔄 승인 처리 시작:', subscription)

      // 1. 구독 상태 업데이트 (승인)
      const subscriptionUpdate = await axios.patch(`${apiBase}/subscriptions/${subscription.id}/`, {
        is_active: true,
        approval_status: 'approved',
        approved_at: new Date().toISOString()
      })
      console.log('✅ 구독 업데이트 완료:', subscriptionUpdate.data)

      // 2. 매출 기록 생성
      const revenueData = {
        member: subscription.member,
        amount: subscription.amount_paid || 0,
        date: new Date().toISOString().split('T')[0],
        source: `회원권 승인 (${subscription.payment_method || '카드'})`,
        memo: `${subscription.plan_name || '회원권'} 승인 - 관리자 승인 처리`
      }
      const revenueResponse = await axios.post(`${apiBase}/revenues/`, revenueData)
      console.log('💰 매출 기록 완료:', revenueResponse.data)

      // 3. 회원 상태 업데이트
      const memberUpdate = await axios.patch(`${apiBase}/members/${subscription.member}/`, {
        status: 'active',
        current_plan: subscription.plan,
        expire_date: subscription.end_date
      })
      console.log('👤 회원 상태 업데이트 완료:', memberUpdate.data)

      alert('✅ 회원권이 승인되었습니다!\n\n매출 기록이 생성되고 대시보드에 반영되었습니다.\n회원 앱에서도 즉시 확인 가능합니다.')
      
      // 승인 목록 새로고침
      loadSubscriptions()
    } catch (error: any) {
      console.error('❌ 승인 실패:', error)
      console.error('오류 상세:', error.response?.data)
      alert(`❌ 승인 처리 중 오류가 발생했습니다:\n${JSON.stringify(error.response?.data || error.message)}`)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (subscription: any) => {
    const reason = prompt('거절 사유를 입력해주세요:')
    if (!reason) return

    setProcessingId(subscription.id)
    try {
      const apiBase = getApiUrl()

      // 구독 상태 업데이트 (거절)
      await axios.patch(`${apiBase}/subscriptions/${subscription.id}/`, {
        is_active: false,
        approval_status: 'rejected',
        rejection_reason: reason,
        rejected_at: new Date().toISOString()
      })

      alert('❌ 회원권이 거절되었습니다.')
      loadSubscriptions()
    } catch (error: any) {
      console.error('거절 실패:', error)
      alert(`❌ 거절 처리 중 오류가 발생했습니다:\n${error.response?.data?.error || error.message}`)
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f7fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '6px solid #e2e8f0',
            borderTop: '6px solid #667eea',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ fontSize: '18px', fontWeight: 600, color: '#667eea' }}>로딩 중...</p>
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

  const currentList = activeTab === 'pending' 
    ? pendingSubscriptions 
    : activeTab === 'approved' 
    ? approvedSubscriptions 
    : rejectedSubscriptions

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f7fafc',
      padding: '30px'
    }}>
      {/* 헤더 */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{
              margin: '0 0 10px 0',
              fontSize: '28px',
              fontWeight: 800,
              color: '#1a202c'
            }}>
              💳 회원권 승인 관리
            </h1>
            <p style={{
              margin: 0,
              fontSize: '15px',
              color: '#718096'
            }}>
              회원들의 회원권 구매 신청을 승인하거나 거절할 수 있습니다
            </p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: '2px solid #e2e8f0',
              background: 'white',
              color: '#4a5568',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f7fafc'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white'
            }}
          >
            ← 대시보드로
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <StatCard
          icon="⏳"
          label="승인 대기"
          count={pendingSubscriptions.length}
          color="#f59e0b"
          active={activeTab === 'pending'}
          onClick={() => setActiveTab('pending')}
        />
        <StatCard
          icon="✅"
          label="승인 완료"
          count={approvedSubscriptions.length}
          color="#10b981"
          active={activeTab === 'approved'}
          onClick={() => setActiveTab('approved')}
        />
        <StatCard
          icon="❌"
          label="거절됨"
          count={rejectedSubscriptions.length}
          color="#ef4444"
          active={activeTab === 'rejected'}
          onClick={() => setActiveTab('rejected')}
        />
      </div>

      {/* 구독 목록 */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{
          margin: '0 0 20px 0',
          fontSize: '20px',
          fontWeight: 800,
          color: '#1a202c'
        }}>
          {activeTab === 'pending' && '⏳ 승인 대기 목록'}
          {activeTab === 'approved' && '✅ 승인 완료 목록'}
          {activeTab === 'rejected' && '❌ 거절된 목록'}
        </h2>

        {currentList.length === 0 ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: '#a0aec0'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📭</div>
            <p style={{ fontSize: '16px', fontWeight: 600 }}>
              {activeTab === 'pending' && '승인 대기 중인 회원권이 없습니다'}
              {activeTab === 'approved' && '승인된 회원권이 없습니다'}
              {activeTab === 'rejected' && '거절된 회원권이 없습니다'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            {currentList.map(subscription => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onApprove={() => handleApprove(subscription)}
                onReject={() => handleReject(subscription)}
                isProcessing={processingId === subscription.id}
                status={activeTab}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, count, color, active, onClick }: any) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: active ? `0 0 0 3px ${color}40` : '0 1px 3px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        border: active ? `2px solid ${color}` : '2px solid transparent'
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
        }
      }}
    >
      <div style={{
        fontSize: '40px',
        marginBottom: '12px'
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: '14px',
        color: '#718096',
        fontWeight: 600,
        marginBottom: '8px'
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '32px',
        fontWeight: 800,
        color: active ? color : '#1a202c'
      }}>
        {count}
      </div>
    </div>
  )
}

function SubscriptionCard({ subscription, onApprove, onReject, isProcessing, status }: any) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount)
  }

  return (
    <div style={{
      padding: '24px',
      background: '#f7fafc',
      borderRadius: '16px',
      border: '2px solid #e2e8f0'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              fontWeight: 700
            }}>
              {subscription.member_name?.[0] || '?'}
            </div>
            <div>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 800,
                color: '#1a202c'
              }}>
                {subscription.member_name || `회원 #${subscription.member}`}
              </h3>
              <p style={{
                margin: '4px 0 0 0',
                fontSize: '14px',
                color: '#718096'
              }}>
                {subscription.member_email || subscription.member_phone || '-'}
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
          }}>
            <InfoItem label="회원권" value={subscription.plan_name || '회원권'} />
            <InfoItem label="금액" value={formatCurrency(subscription.amount_paid || 0)} />
            <InfoItem label="시작일" value={formatDate(subscription.start_date)} />
            <InfoItem label="종료일" value={formatDate(subscription.end_date)} />
            <InfoItem label="결제수단" value={subscription.payment_method || '-'} />
            <InfoItem 
              label="신청일" 
              value={subscription.created_at ? formatDate(subscription.created_at) : '-'} 
            />
          </div>
        </div>

        {status === 'pending' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginLeft: '20px'
          }}>
            <button
              onClick={onApprove}
              disabled={isProcessing}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: isProcessing 
                  ? '#d1d5db' 
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                fontSize: '15px',
                fontWeight: 700,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                boxShadow: isProcessing ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)',
                whiteSpace: 'nowrap'
              }}
            >
              {isProcessing ? '처리 중...' : '✅ 승인'}
            </button>
            <button
              onClick={onReject}
              disabled={isProcessing}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: '2px solid #ef4444',
                background: 'white',
                color: '#ef4444',
                fontSize: '15px',
                fontWeight: 700,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              ❌ 거절
            </button>
          </div>
        )}

        {status === 'approved' && (
          <div style={{
            padding: '12px 24px',
            borderRadius: '12px',
            background: '#d1fae5',
            color: '#065f46',
            fontSize: '15px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            marginLeft: '20px'
          }}>
            ✅ 승인 완료
          </div>
        )}

        {status === 'rejected' && (
          <div style={{
            padding: '12px 24px',
            borderRadius: '12px',
            background: '#fee2e2',
            color: '#991b1b',
            fontSize: '15px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            marginLeft: '20px'
          }}>
            ❌ 거절됨
          </div>
        )}
      </div>
    </div>
  )
}

function InfoItem({ label, value }: any) {
  return (
    <div>
      <div style={{
        fontSize: '12px',
        color: '#a0aec0',
        fontWeight: 600,
        marginBottom: '4px'
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '15px',
        color: '#1a202c',
        fontWeight: 700
      }}>
        {value}
      </div>
    </div>
  )
}

