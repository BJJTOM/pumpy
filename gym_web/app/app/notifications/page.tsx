'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'
import BottomNav from '../components/BottomNav'

export default function NotificationsPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) {
      router.push('/auth/login')
      return
    }
    const user = JSON.parse(userStr)
    setCurrentUser(user)
    loadNotifications(user.id)
  }, [])

  const loadNotifications = async (userId: number) => {
    try {
      const apiBase = getApiUrl()
      const res = await axios.get(`${apiBase}/notifications/?recipient=${userId}`)
      setNotifications(res.data)
      setLoading(false)
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  const handleNotificationClick = async (notification: any) => {
    try {
      const apiBase = getApiUrl()
      
      // 읽음 표시
      if (!notification.is_read) {
        await axios.patch(`${apiBase}/notifications/${notification.id}/`, {
          is_read: true
        })
      }

      // 해당 게시글로 이동
      router.push(`/app/community/post/${notification.post}`)
    } catch (error) {
      console.error(error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const apiBase = getApiUrl()
      await axios.post(`${apiBase}/notifications/mark_all_read/`, {
        recipient_id: currentUser.id
      })
      loadNotifications(currentUser.id)
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e0e7ff',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 0.8s linear infinite'
          }} />
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

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      paddingBottom: '100px'
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '15px 20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 800,
              color: '#333'
            }}>
              알림
            </h1>
            {unreadCount > 0 && (
              <p style={{
                margin: '5px 0 0 0',
                fontSize: '13px',
                color: '#667eea',
                fontWeight: 600
              }}>
                읽지 않은 알림 {unreadCount}개
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                background: '#f3f4f6',
                color: '#667eea',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              모두 읽음
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ padding: '20px' }}>
        {notifications.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: '#999'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔔</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 700 }}>
              알림이 없습니다
            </h3>
            <p style={{ margin: 0, fontSize: '14px' }}>
              다른 회원들과 소통해보세요!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.map(notification => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                style={{
                  background: notification.is_read ? 'white' : '#f0f4ff',
                  padding: '15px',
                  borderRadius: '15px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  position: 'relative',
                  border: notification.is_read ? '1px solid #e5e7eb' : '2px solid #667eea'
                }}
              >
                {/* Sender Avatar */}
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 800,
                  flexShrink: 0
                }}>
                  {notification.sender?.first_name?.charAt(0) || '?'}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '15px',
                    color: '#333',
                    marginBottom: '5px',
                    fontWeight: notification.is_read ? 400 : 700
                  }}>
                    <strong>{notification.sender?.last_name}{notification.sender?.first_name}</strong>님이{' '}
                    {notification.notification_type === 'like' ? (
                      <>회원님의 게시글을 <span style={{ color: '#ff6b6b' }}>좋아합니다 ❤️</span></>
                    ) : (
                      <>회원님의 게시글에 <span style={{ color: '#667eea' }}>댓글을 남겼습니다 💬</span></>
                    )}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#999'
                  }}>
                    {new Date(notification.created_at).toLocaleString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {/* Unread Badge */}
                {!notification.is_read && (
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#667eea'
                  }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

