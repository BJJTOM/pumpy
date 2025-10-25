'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '../components/BottomNav'

export default function SettingsPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [autoLogin, setAutoLogin] = useState(true)

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) {
      router.push('/auth/login')
      return
    }
    setCurrentUser(JSON.parse(userStr))

    // Load settings
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    const savedNotifications = localStorage.getItem('notifications') !== 'false'
    const savedAutoLogin = localStorage.getItem('autoLogin') !== 'false'
    
    setDarkMode(savedDarkMode)
    setNotifications(savedNotifications)
    setAutoLogin(savedAutoLogin)
  }, [router])

  const handleToggle = (setting: string, value: boolean) => {
    switch(setting) {
      case 'darkMode':
        setDarkMode(value)
        localStorage.setItem('darkMode', value.toString())
        break
      case 'notifications':
        setNotifications(value)
        localStorage.setItem('notifications', value.toString())
        break
      case 'autoLogin':
        setAutoLogin(value)
        localStorage.setItem('autoLogin', value.toString())
        break
    }
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
            설정
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {/* 일반 설정 */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
          marginBottom: '15px'
        }}>
          <div style={{ padding: '20px 20px 10px 20px' }}>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 800,
              color: '#333'
            }}>
              일반
            </h3>
          </div>
          <SettingItem
            icon="🌙"
            title="다크 모드"
            value={darkMode}
            onChange={(v) => handleToggle('darkMode', v)}
          />
          <SettingItem
            icon="🔑"
            title="자동 로그인"
            value={autoLogin}
            onChange={(v) => handleToggle('autoLogin', v)}
            isLast
          />
        </div>

        {/* 알림 설정 */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
          marginBottom: '15px'
        }}>
          <div style={{ padding: '20px 20px 10px 20px' }}>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 800,
              color: '#333'
            }}>
              알림
            </h3>
          </div>
          <SettingItem
            icon="🔔"
            title="푸시 알림"
            value={notifications}
            onChange={(v) => handleToggle('notifications', v)}
            isLast
          />
        </div>

        {/* 앱 정보 */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 2px 15px rgba(0,0,0,0.08)'
        }}>
          <div style={{ padding: '20px 20px 10px 20px' }}>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 800,
              color: '#333'
            }}>
              앱 정보
            </h3>
          </div>
          <InfoItem icon="📱" title="버전" value="1.0.0" />
          <InfoItem icon="🏢" title="개발사" value="Pumpy Corp." isLast />
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

function SettingItem({ icon, title, value, onChange, isLast = false }: any) {
  return (
    <div style={{
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: isLast ? 'none' : '1px solid #f3f4f6'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <span style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#1f2937'
        }}>
          {title}
        </span>
      </div>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: '50px',
          height: '30px',
          borderRadius: '15px',
          background: value ? '#667eea' : '#d1d5db',
          position: 'relative',
          cursor: 'pointer',
          transition: 'background 0.3s'
        }}
      >
        <div style={{
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          background: 'white',
          position: 'absolute',
          top: '2px',
          left: value ? '22px' : '2px',
          transition: 'left 0.3s',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
      </div>
    </div>
  )
}

function InfoItem({ icon, title, value, isLast = false }: any) {
  return (
    <div style={{
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: isLast ? 'none' : '1px solid #f3f4f6'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <span style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#1f2937'
        }}>
          {title}
        </span>
      </div>
      <span style={{
        fontSize: '14px',
        color: '#9ca3af',
        fontWeight: 600
      }}>
        {value}
      </span>
    </div>
  )
}
