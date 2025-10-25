'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '../components/BottomNav'

export default function GymInfoPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) {
      router.push('/auth/login')
      return
    }
    setCurrentUser(JSON.parse(userStr))
  }, [router])

  const gymInfo = {
    name: 'Pumpy 체육관',
    location: '서울시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    hours: '평일 06:00 - 23:00\n주말 08:00 - 20:00',
    facilities: ['런닝머신', '웨이트 트레이닝', '요가실', '샤워실', '락커룸', 'PT룸'],
    rules: [
      '운동복과 실내화를 착용해주세요',
      '기구 사용 후 소독제로 닦아주세요',
      '큰 소리로 대화는 자제해주세요',
      '사진 및 영상 촬영 시 다른 회원 배려',
      '음식물 반입 금지 (물, 음료 제외)'
    ]
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
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
          체육관 정보
        </h1>
      </div>

      {/* Content */}
      <div style={{
        padding: '0 20px'
      }}>
        {/* 기본 정보 */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          padding: '25px',
          marginBottom: '15px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '20px',
            paddingBottom: '15px',
            borderBottom: '2px solid #f3f4f6'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '15px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px'
            }}>
              🏋️
            </div>
            <div>
              <h2 style={{
                margin: '0 0 5px 0',
                fontSize: '22px',
                fontWeight: 900,
                color: '#333'
              }}>
                {gymInfo.name}
              </h2>
              <div style={{
                fontSize: '14px',
                color: '#999',
                fontWeight: 600
              }}>
                헬스 & 피트니스 센터
              </div>
            </div>
          </div>

          <InfoItem
            icon="📍"
            label="위치"
            value={gymInfo.location}
          />
          <InfoItem
            icon="📞"
            label="연락처"
            value={gymInfo.phone}
          />
          <InfoItem
            icon="🕐"
            label="운영시간"
            value={gymInfo.hours}
            multiline
          />
        </div>

        {/* 시설 안내 */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          padding: '25px',
          marginBottom: '15px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}>
          <h3 style={{
            margin: '0 0 15px 0',
            fontSize: '18px',
            fontWeight: 800,
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '22px' }}>🏢</span>
            시설 안내
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px'
          }}>
            {gymInfo.facilities.map((facility, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px',
                  background: '#f8f9fa',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#333',
                  textAlign: 'center'
                }}
              >
                ✓ {facility}
              </div>
            ))}
          </div>
        </div>

        {/* 이용 수칙 */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          padding: '25px',
          marginBottom: '15px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}>
          <h3 style={{
            margin: '0 0 15px 0',
            fontSize: '18px',
            fontWeight: 800,
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '22px' }}>📋</span>
            이용 수칙
          </h3>
          <div style={{
            display: 'grid',
            gap: '10px'
          }}>
            {gymInfo.rules.map((rule, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 15px',
                  background: '#f8f9fa',
                  borderLeft: '4px solid #f59e0b',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#666',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                <span style={{ color: '#f59e0b', fontWeight: 800 }}>{idx + 1}.</span>
                {rule}
              </div>
            ))}
          </div>
        </div>

        {/* 문의하기 버튼 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px'
        }}>
          <button
            onClick={() => {
              window.location.href = `tel:${gymInfo.phone}`
            }}
            style={{
              padding: '18px',
              background: 'rgba(255,255,255,0.95)',
              border: '2px solid rgba(255,255,255,0.5)',
              borderRadius: '15px',
              fontSize: '16px',
              fontWeight: 800,
              color: '#f59e0b',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            📞 전화하기
          </button>
          <button
            onClick={() => {
              alert('지도 앱을 실행합니다')
            }}
            style={{
              padding: '18px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '15px',
              fontSize: '16px',
              fontWeight: 800,
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            🗺️ 길찾기
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

function InfoItem({ icon, label, value, multiline = false }: any) {
  return (
    <div style={{
      marginBottom: '15px',
      paddingBottom: '15px',
      borderBottom: '1px solid #f3f4f6'
    }}>
      <div style={{
        display: 'flex',
        alignItems: multiline ? 'flex-start' : 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          flexShrink: 0
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '13px',
            color: '#999',
            marginBottom: '5px',
            fontWeight: 600
          }}>
            {label}
          </div>
          <div style={{
            fontSize: '15px',
            fontWeight: 700,
            color: '#333',
            whiteSpace: multiline ? 'pre-line' : 'normal'
          }}>
            {value}
          </div>
        </div>
      </div>
    </div>
  )
}
