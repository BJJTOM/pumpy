'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'
import BottomNav from '../components/BottomNav'

export default function MembershipPaymentPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState<any[]>([])
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [processingPayment, setProcessingPayment] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) {
      router.push('/auth/login')
      return
    }
    setCurrentUser(JSON.parse(userStr))
    loadPlans()
  }, [router])

  const loadPlans = async () => {
    try {
      const apiBase = getApiUrl()
      const response = await axios.get(`${apiBase}/membership-plans/`)
      console.log('플랜 로드 성공:', response.data)
      
      // API 데이터를 프론트엔드 형식에 맞게 변환
      const formattedPlans = response.data.map((plan: any) => ({
        id: plan.id,
        name: plan.name,
        duration: plan.duration || 1,
        price: parseInt(plan.price) || 0,
        description: plan.description || '',
        popular: plan.is_popular || false
      }))
      
      setPlans(formattedPlans)
    } catch (error) {
      console.error('플랜 로드 실패:', error)
      // 플랜 데이터가 없으면 기본 플랜 사용
      setPlans([
        { id: 1, name: '1개월 회원권', duration: 1, price: 100000, description: '부담 없이 시작하세요' },
        { id: 2, name: '3개월 회원권', duration: 3, price: 270000, description: '10% 할인', discount: '10%' },
        { id: 3, name: '6개월 회원권', duration: 6, price: 480000, description: '20% 할인', discount: '20%', popular: true },
        { id: 4, name: '12개월 회원권', duration: 12, price: 840000, description: '30% 할인', discount: '30%' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan)
    setShowPaymentModal(true)
  }

  const handlePayment = async () => {
    if (!selectedPlan || !currentUser) return

    setProcessingPayment(true)

    try {
      // 가상 결제 처리 (2초 대기)
      await new Promise(resolve => setTimeout(resolve, 2000))

      const apiBase = getApiUrl()
      const startDate = new Date()
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + selectedPlan.duration)

      // 1. 구독(Subscription) 생성 - 즉시 활성화
      const subscriptionData = {
        member: currentUser.id,
        plan: selectedPlan.id,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        amount_paid: selectedPlan.price,
        is_active: true, // 즉시 활성화
        payment_method: paymentMethod === 'card' ? '카드' : paymentMethod === 'bank' ? '계좌이체' : '간편결제',
        approval_status: 'approved' // 자동 승인
      }

      try {
        // 구독 생성 (즉시 활성화)
        const subscriptionResponse = await axios.post(`${apiBase}/subscriptions/`, subscriptionData)
        console.log('✅ 구독 생성 성공:', subscriptionResponse.data)

        // 2. 매출(Revenue) 기록 생성
        const paymentMethodText = paymentMethod === 'card' ? '카드' : paymentMethod === 'bank' ? '계좌이체' : '간편결제'
        const revenueData = {
          member: currentUser.id,
          amount: selectedPlan.price,
          date: startDate.toISOString().split('T')[0],
          source: `회원권 결제 (${paymentMethodText})`,
          memo: `${selectedPlan.name} 구매 - ${selectedPlan.duration}개월`
        }

        const revenueResponse = await axios.post(`${apiBase}/revenues/`, revenueData)
        console.log('💰 매출 기록 성공:', revenueResponse.data)

        // 3. 회원 상태 업데이트
        const memberUpdateData = {
          status: 'active',
          current_plan: selectedPlan.id,
          expire_date: endDate.toISOString().split('T')[0]
        }
        
        const memberResponse = await axios.patch(`${apiBase}/members/${currentUser.id}/`, memberUpdateData)
        console.log('👤 회원 상태 업데이트 성공:', memberResponse.data)

        // 로컬 스토리지의 대기 중인 구독 정보 삭제 (있다면)
        localStorage.removeItem(`pending_subscription_${currentUser.id}`)

        alert('✅ 결제가 완료되었습니다!\n\n회원권이 즉시 활성화되었습니다.\n이제 모든 서비스를 이용하실 수 있습니다.')
        
        // 사용자 정보 새로고침
        const updatedUser = await axios.get(`${apiBase}/members/${currentUser.id}/`)
        localStorage.setItem('currentUser', JSON.stringify(updatedUser.data))
        
        router.push('/app/profile')
      } catch (apiError: any) {
        console.error('❌ 결제 처리 실패:', apiError)
        console.error('오류 상세:', apiError.response?.data)
        
        alert(`❌ 결제 처리 중 오류가 발생했습니다.\n\n${apiError.response?.data?.detail || apiError.response?.data?.error || '다시 시도해주세요.'}`)
      }
    } catch (error) {
      console.error('결제 실패:', error)
      alert('❌ 결제 처리 중 오류가 발생했습니다.\n다시 시도해주세요.')
    } finally {
      setProcessingPayment(false)
    }
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
      paddingBottom: '100px'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '20px'
      }}>
        <div style={{
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
              background: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            ←
          </div>
          <h1 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 800,
            color: '#1f2937'
          }}>
            회원권 구매
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {/* 안내 메시지 */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          padding: '25px',
          marginBottom: '25px',
          color: 'white',
          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.35)'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>💳</div>
          <h2 style={{
            margin: '0 0 10px 0',
            fontSize: '22px',
            fontWeight: 900
          }}>
            회원권을 선택해주세요
          </h2>
          <p style={{
            margin: 0,
            fontSize: '14px',
            lineHeight: '1.6',
            opacity: 0.9
          }}>
            기간에 따라 할인 혜택이 제공됩니다.<br />
            결제는 가상으로 처리되며, 즉시 회원권이 등록됩니다.
          </p>
        </div>

        {/* 플랜 목록 */}
        <div style={{
          display: 'grid',
          gap: '15px',
          marginBottom: '20px'
        }}>
          {plans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSelect={() => handleSelectPlan(plan)}
            />
          ))}
        </div>

        {/* 약관 안내 */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{
            margin: '0 0 15px 0',
            fontSize: '16px',
            fontWeight: 800,
            color: '#333'
          }}>
            📋 결제 전 확인사항
          </h3>
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            fontSize: '13px',
            color: '#666',
            lineHeight: '1.8'
          }}>
            <li>결제 시 <span style={{ color: '#667eea', fontWeight: 700, cursor: 'pointer' }} onClick={() => router.push('/app/terms')}>이용약관</span> 및 <span style={{ color: '#667eea', fontWeight: 700, cursor: 'pointer' }} onClick={() => router.push('/app/policy')}>개인정보 처리방침</span>에 자동 동의됩니다.</li>
            <li>회원권은 구매일로부터 즉시 시작됩니다.</li>
            <li>환불은 이용하지 않은 기간에 대해 일할 계산됩니다.</li>
            <li>회원권 양도 및 재판매는 불가능합니다.</li>
          </ul>
        </div>
      </div>

      {/* 결제 모달 */}
      {showPaymentModal && selectedPlan && (
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
        onClick={() => !processingPayment && setShowPaymentModal(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '25px',
              maxWidth: '450px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
          >
            {/* 모달 헤더 */}
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
                  결제하기
                </h2>
                {!processingPayment && (
                  <div
                    onClick={() => setShowPaymentModal(false)}
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
                )}
              </div>
            </div>

            {/* 모달 내용 */}
            <div style={{ padding: '25px' }}>
              {/* 선택한 플랜 정보 */}
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
                  선택한 회원권
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  color: '#333',
                  marginBottom: '10px'
                }}>
                  {selectedPlan.name}
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '14px', color: '#666', fontWeight: 600 }}>결제 금액</span>
                  <span style={{ fontSize: '24px', fontWeight: 900, color: '#667eea' }}>
                    {selectedPlan.price.toLocaleString()}원
                  </span>
                </div>
              </div>

              {/* 결제 수단 선택 */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#333',
                  marginBottom: '12px'
                }}>
                  결제 수단
                </div>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <PaymentMethodItem
                    icon="💳"
                    label="신용/체크카드"
                    value="card"
                    selected={paymentMethod === 'card'}
                    onClick={() => setPaymentMethod('card')}
                  />
                  <PaymentMethodItem
                    icon="🏦"
                    label="계좌이체"
                    value="bank"
                    selected={paymentMethod === 'bank'}
                    onClick={() => setPaymentMethod('bank')}
                  />
                  <PaymentMethodItem
                    icon="📱"
                    label="간편결제"
                    value="simple"
                    selected={paymentMethod === 'simple'}
                    onClick={() => setPaymentMethod('simple')}
                  />
                </div>
              </div>

              {/* 결제 버튼 */}
              <button
                onClick={handlePayment}
                disabled={processingPayment}
                style={{
                  width: '100%',
                  padding: '18px',
                  background: processingPayment 
                    ? '#d1d5db' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '15px',
                  color: 'white',
                  fontSize: '17px',
                  fontWeight: 800,
                  cursor: processingPayment ? 'not-allowed' : 'pointer',
                  boxShadow: processingPayment ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                {processingPayment ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '3px solid rgba(255,255,255,0.3)',
                      borderTop: '3px solid white',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    결제 처리 중...
                  </>
                ) : (
                  <>
                    {selectedPlan.price.toLocaleString()}원 결제하기
                  </>
                )}
              </button>

              <p style={{
                margin: '15px 0 0 0',
                fontSize: '12px',
                color: '#999',
                textAlign: 'center',
                lineHeight: '1.5'
              }}>
                이것은 가상 결제입니다.<br />
                실제 금액이 청구되지 않습니다.
              </p>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}

function PlanCard({ plan, onSelect }: any) {
  return (
    <div
      onClick={onSelect}
      style={{
        background: 'white',
        borderRadius: '20px',
        padding: '25px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        transition: 'all 0.3s',
        position: 'relative',
        overflow: 'hidden',
        border: plan.popular ? '3px solid #667eea' : '2px solid transparent'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)'
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'
      }}
    >
      {plan.popular && (
        <div style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          padding: '5px 12px',
          background: '#667eea',
          color: 'white',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 800
        }}>
          ⭐ 인기
        </div>
      )}
      
      {plan.discount && (
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '15px',
          padding: '5px 12px',
          background: '#ef4444',
          color: 'white',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 800
        }}>
          {plan.discount} 할인
        </div>
      )}

      <div style={{
        marginTop: plan.discount || plan.popular ? '25px' : '0'
      }}>
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: '22px',
          fontWeight: 900,
          color: '#333'
        }}>
          {plan.name}
        </h3>
        <p style={{
          margin: '0 0 15px 0',
          fontSize: '13px',
          color: '#999',
          fontWeight: 600
        }}>
          {plan.description}
        </p>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '5px',
          marginBottom: '15px'
        }}>
          <span style={{
            fontSize: '32px',
            fontWeight: 900,
            color: '#667eea'
          }}>
            {plan.price.toLocaleString()}
          </span>
          <span style={{
            fontSize: '16px',
            color: '#999',
            fontWeight: 600
          }}>
            원
          </span>
        </div>
        <div style={{
          padding: '12px 0',
          borderTop: '1px solid #f3f4f6',
          fontSize: '13px',
          color: '#666',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>이용 기간</span>
          <span style={{ fontWeight: 700, color: '#333' }}>{plan.duration}개월</span>
        </div>
        <div style={{
          padding: '12px 0',
          borderTop: '1px solid #f3f4f6',
          fontSize: '13px',
          color: '#666',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>월 평균</span>
          <span style={{ fontWeight: 700, color: '#333' }}>
            {Math.round(plan.price / plan.duration).toLocaleString()}원
          </span>
        </div>
      </div>
    </div>
  )
}

function PaymentMethodItem({ icon, label, value, selected, onClick }: any) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '15px',
        background: selected ? '#667eea10' : '#f8f9fa',
        border: `2px solid ${selected ? '#667eea' : '#e5e7eb'}`,
        borderRadius: '12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'all 0.2s'
      }}
    >
      <div style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        border: `2px solid ${selected ? '#667eea' : '#d1d5db'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: selected ? '#667eea' : 'white'
      }}>
        {selected && (
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: 'white'
          }} />
        )}
      </div>
      <span style={{ fontSize: '20px' }}>{icon}</span>
      <span style={{
        fontSize: '15px',
        fontWeight: 600,
        color: selected ? '#667eea' : '#333'
      }}>
        {label}
      </span>
    </div>
  )
}

