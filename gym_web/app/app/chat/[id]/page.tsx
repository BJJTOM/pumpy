'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function ChatRoom() {
  const router = useRouter()
  const params = useParams()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // TODO: API로 메시지 가져오기
    setMessages([
      { id: 1, text: '안녕하세요!', isMine: false, time: '오전 10:30', sender: '관장님' },
      { id: 2, text: '안녕하세요 관장님!', isMine: true, time: '오전 10:31' },
      { id: 3, text: '오늘 운동 잘 하셨어요!', isMine: false, time: '오전 10:32', sender: '관장님' },
      { id: 4, text: '감사합니다 😊', isMine: true, time: '오전 10:33' }
    ])
  }, [params.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = () => {
    if (!message.trim()) return

    const newMessage = {
      id: messages.length + 1,
      text: message,
      isMine: true,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    }

    setMessages([...messages, newMessage])
    setMessage('')
    // TODO: API POST 요청
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#b2c7da'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '15px 20px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <div
          onClick={() => router.back()}
          style={{
            fontSize: '24px',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          ←
        </div>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px'
        }}>
          👨‍🏫
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '16px' }}>관장님</div>
          <div style={{ fontSize: '12px', color: '#999' }}>온라인</div>
        </div>
        <div style={{ fontSize: '24px', cursor: 'pointer' }}>⋮</div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.isMine ? 'flex-end' : 'flex-start',
              alignItems: 'flex-end',
              gap: '8px'
            }}
          >
            {!msg.isMine && (
              <div style={{
                width: 35,
                height: 35,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                flexShrink: 0
              }}>
                👨‍🏫
              </div>
            )}

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.isMine ? 'flex-end' : 'flex-start',
              maxWidth: '70%'
            }}>
              {!msg.isMine && (
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  marginBottom: '5px',
                  paddingLeft: '10px'
                }}>
                  {msg.sender}
                </div>
              )}
              
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '5px',
                flexDirection: msg.isMine ? 'row-reverse' : 'row'
              }}>
                <div style={{
                  backgroundColor: msg.isMine ? '#FFE600' : 'white',
                  padding: '12px 16px',
                  borderRadius: msg.isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  fontSize: '15px',
                  lineHeight: 1.5,
                  wordWrap: 'break-word',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  {msg.text}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#666',
                  whiteSpace: 'nowrap'
                }}>
                  {msg.time}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        backgroundColor: 'white',
        padding: '15px 20px',
        borderTop: '1px solid #eee',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-end'
      }}>
        <button style={{
          width: 36,
          height: 36,
          borderRadius: '8px',
          border: 'none',
          backgroundColor: '#f0f0f0',
          fontSize: '20px',
          cursor: 'pointer',
          flexShrink: 0
        }}>
          ➕
        </button>

        <div style={{
          flex: 1,
          backgroundColor: '#f5f5f5',
          borderRadius: '20px',
          padding: '10px 15px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요"
            style={{
              flex: 1,
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '15px',
              resize: 'none',
              outline: 'none',
              maxHeight: '100px',
              minHeight: '24px'
            }}
            rows={1}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!message.trim()}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: 'none',
            background: message.trim() 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
              : '#ddd',
            color: 'white',
            fontSize: '18px',
            cursor: message.trim() ? 'pointer' : 'not-allowed',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ↑
        </button>
      </div>
    </div>
  )
}


