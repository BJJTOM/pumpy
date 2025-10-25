'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '../components/BottomNav'

export default function PremiumPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState('monthly')
  const [isPremium, setIsPremium] = useState(false)
  const [showPayment, setShowPayment] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) {
      router.push('/auth/login')
      return
    }
    const user = JSON.parse(userStr)
    const premiumStatus = localStorage.getItem(`premium_${user.id}`)
    setIsPremium(premiumStatus === 'active')
  }, [router])

  const plans = [
    {
      id: 'monthly',
      name: '월간 구독',
      price: 9900,
      originalPrice: 14900,
      period: '1개월',
      discount: '33%'
    },
    {
      id: 'yearly',
      name: '연간 구독',
      price: 99000,
      originalPrice: 178800,
      period: '12개월',
      discount: '45%',
      popular: true
    }
  ]

  const features = [
    { icon: '🤖', title: 'AI 운동 캐릭터 생성', desc: '내 사진으로 3D 캐릭터 만들기' },
    { icon: '🎨', title: '프리미엄 방 테마', desc: '10가지 이상의 특별한 방 꾸미기' },
    { icon: '📊', title: '고급 운동 분석', desc: 'AI 기반 운동 패턴 분석 및 추천' },
    { icon: '🎯', title: '개인 맞춤 운동 플랜', desc: 'AI가 만드는 나만의 운동 계획' },
    { icon: '💪', title: '실시간 자세 교정', desc: 'AI 카메라로 운동 자세 분석' },
    { icon: '🍎', title: 'AI 식단 추천', desc: '목표에 맞는 식단 자동 생성' },
    { icon: '📈', title: '상세 진행 리포트', desc: '주간/월간 운동 성과 리포트' },
    { icon: '🏆', title: '독점 배지 & 보상', desc: '프리미엄 전용 배지와 보상' },
    { icon: '💬', title: '1:1 전문가 상담', desc: '트레이너와 실시간 채팅' },
    { icon: '🎁', title: '광고 제거', desc: '모든 광고 없는 깨끗한 환경' }
  ]

  const handleSubscribe = () => {
    setShowPayment(true)
  }

  const handleConfirmPayment = () => {
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) return
    
    const user = JSON.parse(userStr)
    const plan = plans.find(p => p.id === selectedPlan)
    
    // 프리미엄 활성화
    localStorage.setItem(`premium_${user.id}`, 'active')
    localStorage.setItem(`premium_plan_${user.id}`, selectedPlan)
    localStorage.setItem(`premium_start_date_${user.id}`, new Date().toISOString())
    
    setIsPremium(true)
    setShowPayment(false)
    alert(`🎉 ${plan?.name} 구독이 완료되었습니다!\n프리미엄 기능을 즐겨보세요!`)
  }

  const handleCancelSubscription = () => {
    if (confirm('정말 프리미엄 구독을 취소하시겠습니까?\n모든 프리미엄 기능이 비활성화됩니다.')) {
      const userStr = localStorage.getItem('currentUser')
      if (!userStr) return
      
      const user = JSON.parse(userStr)
      localStorage.removeItem(`premium_${user.id}`)
      localStorage.removeItem(`premium_plan_${user.id}`)
      localStorage.removeItem(`premium_start_date_${user.id}`)
      
      setIsPremium(false)
      alert('프리미엄 구독이 취소되었습니다.')
    }
  }

  if (isPremium) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        paddingBottom: '100px'
      }}>
        {/* 헤더 */}
        <div style={{ padding: '30px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>👑</div>
          <h1 style={{
            margin: '0 0 10px 0',
            fontSize: '32px',
            fontWeight: 900,
            color: 'white',
            textShadow: '0 3px 15px rgba(0,0,0,0.2)'
          }}>
            프리미엄 회원
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', margin: 0 }}>
            모든 프리미엄 기능을 사용 중입니다
          </p>
        </div>

        {/* 프리미엄 기능 목록 */}
        <div style={{
          background: '#F9FAFB',
          borderRadius: '30px 30px 0 0',
          padding: '25px 20px',
          minHeight: '500px'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 800, color: '#333' }}>
            사용 가능한 프리미엄 기능
          </h3>

          <div style={{ display: 'grid', gap: '15px', marginBottom: '30px' }}>
            {features.map((feature, index) => (
              <div key={index} style={{
                backgroundColor: 'white',
                borderRadius: '15px',
                padding: '20px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  flexShrink: 0
                }}>
                  {feature.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#333', marginBottom: '5px' }}>
                    {feature.title}
                  </div>
                  <div style={{ fontSize: '13px', color: '#999' }}>
                    {feature.desc}
                  </div>
                </div>
                <div style={{ fontSize: '20px', color: '#10b981' }}>✓</div>
              </div>
            ))}
          </div>

          {/* 구독 취소 버튼 */}
          <button
            onClick={handleCancelSubscription}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '15px',
              border: '1px solid #e5e7eb',
              background: 'white',
              color: '#999',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            구독 취소
          </button>
        </div>

        <BottomNav />
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paddingBottom: '100px'
    }}>
      {/* 헤더 */}
      <div style={{ padding: '30px 20px 40px', textAlign: 'center' }}>
        <button
          onClick={() => router.back()}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '10px',
            borderRadius: '50%',
            width: '45px',
            height: '45px'
          }}
        >
          ←
        </button>

        <div style={{ fontSize: '80px', marginBottom: '20px' }}>👑</div>
        <h1 style={{
          margin: '0 0 10px 0',
          fontSize: '32px',
          fontWeight: 900,
          color: 'white',
          textShadow: '0 3px 15px rgba(0,0,0,0.2)'
        }}>
          프리미엄으로 업그레이드
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', margin: 0 }}>
          AI 기능과 함께 더 스마트한 운동 경험
        </p>
      </div>

      {/* 메인 콘텐츠 */}
      <div style={{
        background: '#F9FAFB',
        borderRadius: '30px 30px 0 0',
        padding: '25px 20px',
        minHeight: '500px'
      }}>
        {/* 플랜 선택 */}
        <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 800, color: '#333' }}>
          플랜 선택
        </h3>

        <div style={{ display: 'grid', gap: '15px', marginBottom: '30px' }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '25px',
                boxShadow: selectedPlan === plan.id 
                  ? '0 4px 20px rgba(102, 126, 234, 0.3)' 
                  : '0 2px 10px rgba(0,0,0,0.05)',
                border: selectedPlan === plan.id ? '3px solid #667eea' : '3px solid transparent',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s'
              }}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '20px',
                  padding: '5px 15px',
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  color: '#000',
                  fontSize: '12px',
                  fontWeight: 800,
                  borderRadius: '15px',
                  boxShadow: '0 2px 10px rgba(255, 215, 0, 0.5)'
                }}>
                  인기
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#333', marginBottom: '5px' }}>
                    {plan.name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#999' }}>
                    {plan.period}
                  </div>
                </div>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: selectedPlan === plan.id ? '7px solid #667eea' : '2px solid #ddd',
                  transition: 'all 0.3s'
                }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '32px', fontWeight: 900, color: '#667eea' }}>
                  {plan.price.toLocaleString()}원
                </span>
                <span style={{ fontSize: '16px', color: '#999', textDecoration: 'line-through' }}>
                  {plan.originalPrice.toLocaleString()}원
                </span>
              </div>

              <div style={{
                display: 'inline-block',
                padding: '5px 12px',
                background: '#10b98115',
                color: '#10b981',
                fontSize: '13px',
                fontWeight: 700,
                borderRadius: '10px'
              }}>
                {plan.discount} 할인
              </div>
            </div>
          ))}
        </div>

        {/* 프리미엄 기능 */}
        <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 800, color: '#333' }}>
          프리미엄 기능
        </h3>

        <div style={{ display: 'grid', gap: '12px', marginBottom: '30px' }}>
          {features.map((feature, index) => (
            <div key={index} style={{
              backgroundColor: 'white',
              borderRadius: '15px',
              padding: '15px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ fontSize: '28px' }}>{feature.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#333', marginBottom: '3px' }}>
                  {feature.title}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  {feature.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 구독 버튼 */}
        <button
          onClick={handleSubscribe}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '18px',
            border: 'none',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '18px',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
            marginBottom: '20px'
          }}
        >
          {plans.find(p => p.id === selectedPlan)?.price.toLocaleString()}원 구독하기
        </button>
      </div>

      {/* 결제 모달 */}
      {showPayment && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '25px',
            padding: '30px',
            maxWidth: '400px',
            width: '100%'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: 800, textAlign: 'center' }}>
              결제 확인
            </h3>

            <div style={{
              padding: '20px',
              background: '#f8fafc',
              borderRadius: '15px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#333', marginBottom: '10px' }}>
                {plans.find(p => p.id === selectedPlan)?.name}
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#667eea' }}>
                {plans.find(p => p.id === selectedPlan)?.price.toLocaleString()}원
              </div>
            </div>

            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px', lineHeight: 1.6 }}>
              이 결제는 <strong>테스트 결제</strong>입니다.<br />
              실제 결제가 발생하지 않으며, 가상으로 프리미엄 기능을 체험할 수 있습니다.
            </p>

            <div style={{ display: 'grid', gap: '10px' }}>
              <button
                onClick={handleConfirmPayment}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '15px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                가상 결제 완료
              </button>
              <button
                onClick={() => setShowPayment(false)}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '15px',
                  border: '1px solid #e5e7eb',
                  background: 'white',
                  color: '#999',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}

