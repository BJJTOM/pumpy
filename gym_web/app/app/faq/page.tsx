'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '../components/BottomNav'

export default function FAQPage() {
  const router = useRouter()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: '회원 가입은 어떻게 하나요?',
      answer: '앱 첫 화면에서 "회원가입" 버튼을 누르고, 필요한 정보를 입력하신 후 약관에 동의하시면 가입이 완료됩니다.'
    },
    {
      question: '출석 체크는 어떻게 하나요?',
      answer: '체육관 방문 시 앱의 "출석 체크" 메뉴를 통해 QR 코드를 스캔하거나, 직원에게 요청하여 출석을 등록할 수 있습니다.'
    },
    {
      question: '멤버십은 어떻게 연장하나요?',
      answer: '프로필 메뉴에서 "멤버십 정보"를 확인하신 후, 체육관에 직접 방문하시거나 고객센터로 연락하여 연장 신청을 하실 수 있습니다.'
    },
    {
      question: '운동 프로그램은 어디서 확인하나요?',
      answer: '홈 화면의 "WOD(Workout of the Day)" 메뉴에서 오늘의 추천 운동 프로그램을 확인하실 수 있습니다.'
    },
    {
      question: '비밀번호를 잊어버렸어요',
      answer: '로그인 화면에서 "비밀번호 찾기"를 클릭하시면 등록하신 이메일로 비밀번호 재설정 링크가 전송됩니다.'
    },
    {
      question: '회원 탈퇴는 어떻게 하나요?',
      answer: '프로필 > 설정 > 계정 관리에서 회원 탈퇴를 신청하실 수 있습니다. 단, 진행 중인 멤버십이 있는 경우 먼저 해지하셔야 합니다.'
    },
    {
      question: '프리미엄 구독의 혜택은 무엇인가요?',
      answer: 'AI 맞춤 코칭, 개인별 식단 추천, 1:1 전문가 상담, 우선 예약권 등의 혜택을 제공합니다.'
    },
    {
      question: '환불 정책이 궁금합니다',
      answer: '이용하지 않은 잔여 기간에 대해 일할 계산하여 환불해드립니다. 자세한 내용은 고객센터로 문의해주세요.'
    }
  ]

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
            자주 묻는 질문
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        <div style={{
          display: 'grid',
          gap: '12px'
        }}>
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

        {/* 추가 문의 */}
        <div style={{
          marginTop: '30px',
          padding: '25px',
          background: 'white',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 2px 15px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '15px' }}>💬</div>
          <h3 style={{
            margin: '0 0 10px 0',
            fontSize: '18px',
            fontWeight: 800,
            color: '#333'
          }}>
            원하는 답변을 찾지 못하셨나요?
          </h3>
          <p style={{
            margin: '0 0 20px 0',
            fontSize: '14px',
            color: '#666',
            lineHeight: '1.6'
          }}>
            고객센터로 문의하시면<br />
            친절하게 답변해드리겠습니다
          </p>
          <button
            onClick={() => router.push('/app/support')}
            style={{
              padding: '14px 30px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}
          >
            고객센터 문의하기
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

function FAQItem({ question, answer, isOpen, onClick }: any) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: '15px',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        transition: 'all 0.3s'
      }}
    >
      <div
        onClick={onClick}
        style={{
          padding: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '15px'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flex: 1
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: '#667eea20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 800,
            color: '#667eea',
            flexShrink: 0
          }}>
            Q
          </div>
          <span style={{
            fontSize: '15px',
            fontWeight: 700,
            color: '#333'
          }}>
            {question}
          </span>
        </div>
        <div style={{
          fontSize: '20px',
          color: '#d1d5db',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s'
        }}>
          ▼
        </div>
      </div>
      {isOpen && (
        <div style={{
          padding: '0 20px 20px 20px',
          borderTop: '1px solid #f3f4f6'
        }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            paddingTop: '15px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#10b98120',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 800,
              color: '#10b981',
              flexShrink: 0
            }}>
              A
            </div>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#666',
              lineHeight: '1.7',
              flex: 1
            }}>
              {answer}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

