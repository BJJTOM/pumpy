'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Settings() {
  const router = useRouter()
  const [pushEnabled, setPushEnabled] = useState(true)
  const [allowMessages, setAllowMessages] = useState(true)
  const [isPublic, setIsPublic] = useState(true)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      paddingBottom: '40px'
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'white',
        padding: '20px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <div
          onClick={() => router.back()}
          style={{
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          ←
        </div>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>설정</h1>
      </div>

      {/* Settings Sections */}
      <div style={{ padding: '20px', display: 'grid', gap: '15px' }}>
        {/* 알림 설정 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '15px 20px',
            borderBottom: '1px solid #f0f0f0',
            fontWeight: 700,
            fontSize: '16px'
          }}>
            🔔 알림 설정
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 20px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '5px' }}>푸시 알림</div>
              <div style={{ fontSize: '13px', color: '#999' }}>운동, 커뮤니티 알림 받기</div>
            </div>
            <div
              onClick={() => setPushEnabled(!pushEnabled)}
              style={{
                width: 50,
                height: 28,
                borderRadius: 14,
                backgroundColor: pushEnabled ? '#667eea' : '#ddd',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: 'white',
                position: 'absolute',
                top: 2,
                left: pushEnabled ? 24 : 2,
                transition: 'all 0.3s'
              }} />
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 20px'
          }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '5px' }}>채팅 허용</div>
              <div style={{ fontSize: '13px', color: '#999' }}>다른 회원의 메시지 받기</div>
            </div>
            <div
              onClick={() => setAllowMessages(!allowMessages)}
              style={{
                width: 50,
                height: 28,
                borderRadius: 14,
                backgroundColor: allowMessages ? '#667eea' : '#ddd',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: 'white',
                position: 'absolute',
                top: 2,
                left: allowMessages ? 24 : 2,
                transition: 'all 0.3s'
              }} />
            </div>
          </div>
        </div>

        {/* 프로필 설정 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '15px 20px',
            borderBottom: '1px solid #f0f0f0',
            fontWeight: 700,
            fontSize: '16px'
          }}>
            👤 프로필 설정
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 20px',
            borderBottom: '1px solid #f0f0f0',
            cursor: 'pointer'
          }}
          onClick={() => router.push('/app/character')}>
            <div>
              <div style={{ fontWeight: 600 }}>AI 캐릭터 변경</div>
            </div>
            <div style={{ fontSize: '18px', color: '#ccc' }}>›</div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 20px'
          }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '5px' }}>프로필 공개</div>
              <div style={{ fontSize: '13px', color: '#999' }}>커뮤니티에 프로필 표시</div>
            </div>
            <div
              onClick={() => setIsPublic(!isPublic)}
              style={{
                width: 50,
                height: 28,
                borderRadius: 14,
                backgroundColor: isPublic ? '#667eea' : '#ddd',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: 'white',
                position: 'absolute',
                top: 2,
                left: isPublic ? 24 : 2,
                transition: 'all 0.3s'
              }} />
            </div>
          </div>
        </div>

        {/* 계정 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '15px 20px',
            borderBottom: '1px solid #f0f0f0',
            fontWeight: 700,
            fontSize: '16px'
          }}>
            🔐 계정
          </div>
          
          {[
            { icon: '🔑', label: '비밀번호 변경' },
            { icon: '📱', label: '전화번호 변경' },
            { icon: '📧', label: '이메일 변경' }
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px 20px',
                borderBottom: idx < 2 ? '1px solid #f0f0f0' : 'none',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                <span style={{ fontWeight: 600 }}>{item.label}</span>
              </div>
              <div style={{ fontSize: '18px', color: '#ccc' }}>›</div>
            </div>
          ))}
        </div>

        {/* 앱 정보 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '15px 20px',
            borderBottom: '1px solid #f0f0f0',
            fontWeight: 700,
            fontSize: '16px'
          }}>
            ℹ️ 앱 정보
          </div>
          
          {[
            { label: '버전', value: '1.0.0' },
            { label: '이용약관', value: '' },
            { label: '개인정보처리방침', value: '' },
            { label: '고객센터', value: '' }
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px 20px',
                borderBottom: idx < 3 ? '1px solid #f0f0f0' : 'none',
                cursor: item.value ? 'default' : 'pointer'
              }}
            >
              <span style={{ fontWeight: 600 }}>{item.label}</span>
              {item.value ? (
                <span style={{ color: '#999' }}>{item.value}</span>
              ) : (
                <div style={{ fontSize: '18px', color: '#ccc' }}>›</div>
              )}
            </div>
          ))}
        </div>

        {/* 로그아웃 */}
        <button
          onClick={() => {
            if (confirm('로그아웃 하시겠습니까?')) {
              router.push('/')
            }
          }}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '15px',
            border: 'none',
            backgroundColor: 'white',
            fontSize: '16px',
            fontWeight: 700,
            color: '#FF3B30',
            cursor: 'pointer'
          }}
        >
          로그아웃
        </button>

        {/* 회원 탈퇴 */}
        <button
          onClick={() => {
            if (confirm('정말 탈퇴하시겠습니까?')) {
              alert('회원 탈퇴가 완료되었습니다.')
              router.push('/')
            }
          }}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '15px',
            border: 'none',
            backgroundColor: 'transparent',
            fontSize: '14px',
            color: '#999',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          회원 탈퇴
        </button>
      </div>
    </div>
  )
}


