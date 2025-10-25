'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '../components/BottomNav'

export default function SupportPage() {
  const router = useRouter()
  const [message, setMessage] = useState('')

  const handleSubmit = () => {
    if (!message.trim()) {
      alert('문의 내용을 입력해주세요.')
      return
    }
    alert('문의가 접수되었습니다.\n빠른 시일 내에 답변 드리겠습니다.')
    setMessage('')
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
            고객센터
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {/* 연락처 정보 */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '25px',
          boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
          marginBottom: '20px'
        }}>
          <h3 style={{
            margin: '0 0 20px 0',
            fontSize: '18px',
            fontWeight: 800,
            color: '#333'
          }}>
            연락처
          </h3>
          <div style={{
            display: 'grid',
            gap: '15px'
          }}>
            <ContactItem
              icon="📞"
              title="전화"
              value="02-1234-5678"
              onClick={() => window.location.href = 'tel:02-1234-5678'}
            />
            <ContactItem
              icon="✉️"
              title="이메일"
              value="support@pumpy.com"
              onClick={() => window.location.href = 'mailto:support@pumpy.com'}
            />
            <ContactItem
              icon="🕐"
              title="운영시간"
              value="평일 09:00 - 18:00"
            />
          </div>
        </div>

        {/* 문의하기 */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '25px',
          boxShadow: '0 2px 15px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{
            margin: '0 0 15px 0',
            fontSize: '18px',
            fontWeight: 800,
            color: '#333'
          }}>
            문의하기
          </h3>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="문의 내용을 입력해주세요..."
            style={{
              width: '100%',
              minHeight: '200px',
              padding: '15px',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
              marginBottom: '15px'
            }}
          />
          <button
            onClick={handleSubmit}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}
          >
            문의 보내기
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

function ContactItem({ icon, title, value, onClick }: any) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      <div style={{
        width: '45px',
        height: '45px',
        borderRadius: '12px',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '22px'
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '13px',
          color: '#999',
          marginBottom: '4px',
          fontWeight: 600
        }}>
          {title}
        </div>
        <div style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#333'
        }}>
          {value}
        </div>
      </div>
      {onClick && (
        <div style={{
          fontSize: '18px',
          color: '#d1d5db'
        }}>
          ›
        </div>
      )}
    </div>
  )
}

