'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '../components/BottomNav'
import AppHeader from '../components/AppHeader'

export default function Chat() {
  const router = useRouter()
  const [chatRooms] = useState([
    {
      id: 1,
      name: '관장님',
      lastMessage: '오늘 수업 잘 하셨어요!',
      lastMessageTime: '10분 전',
      unread: 2,
      avatar: '👨‍🏫'
    },
    {
      id: 2,
      name: '김철수',
      lastMessage: '내일 운동 같이 할래?',
      lastMessageTime: '1시간 전',
      unread: 1,
      avatar: '💪'
    },
    {
      id: 3,
      name: '이영희',
      lastMessage: '식단 공유 감사합니다!',
      lastMessageTime: '어제',
      unread: 0,
      avatar: '🙆‍♀️'
    },
    {
      id: 4,
      name: '체육관 단톡방',
      lastMessage: '다음주 월요일은 휴관입니다',
      lastMessageTime: '2일 전',
      unread: 5,
      avatar: '👥'
    }
  ])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      paddingBottom: '80px'
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'white',
        padding: '20px',
        borderBottom: '1px solid #eee'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>채팅</h1>
      </div>

      {/* Chat Rooms List */}
      <div style={{ backgroundColor: 'white', marginTop: '10px' }}>
        {chatRooms.map(room => (
          <div
            key={room.id}
            onClick={() => router.push(`/app/chat/${room.id}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '15px 20px',
              borderBottom: '1px solid #f0f0f0',
              cursor: 'pointer',
              gap: '15px',
              backgroundColor: 'white',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            {/* Avatar */}
            <div style={{
              width: 55,
              height: 55,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              flexShrink: 0
            }}>
              {room.avatar}
            </div>

            {/* Chat Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '5px'
              }}>
                <div style={{
                  fontWeight: 700,
                  fontSize: '16px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {room.name}
                </div>
                <div style={{ fontSize: '12px', color: '#999', flexShrink: 0, marginLeft: '10px' }}>
                  {room.lastMessageTime}
                </div>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {room.lastMessage}
                </div>
                {room.unread > 0 && (
                  <div style={{
                    backgroundColor: '#FF3B30',
                    color: 'white',
                    borderRadius: '12px',
                    padding: '2px 8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    flexShrink: 0,
                    marginLeft: '10px'
                  }}>
                    {room.unread}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State if no chats */}
      {chatRooms.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#999'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>💬</div>
          <p style={{ fontSize: '16px', margin: 0 }}>아직 대화가 없습니다</p>
        </div>
      )}

      {/* Bottom Nav */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: '30px 30px 0 0',
        padding: '15px 20px 20px',
        boxShadow: '0 -5px 20px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center'
      }}>
        <div onClick={() => router.push('/app')} style={{ textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: '24px', marginBottom: '5px' }}>🏠</div>
          <div style={{ fontSize: '11px', color: '#999' }}>홈</div>
        </div>
        <div onClick={() => router.push('/app/community')} style={{ textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: '24px', marginBottom: '5px' }}>👥</div>
          <div style={{ fontSize: '11px', color: '#999' }}>커뮤니티</div>
        </div>
        <div onClick={() => router.push('/app/chat')} style={{ textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: '24px', marginBottom: '5px' }}>💬</div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#667eea' }}>채팅</div>
        </div>
        <div onClick={() => router.push('/app/profile')} style={{ textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: '24px', marginBottom: '5px' }}>👤</div>
          <div style={{ fontSize: '11px', color: '#999' }}>내 정보</div>
        </div>
      </div>
    </div>
  )
}


