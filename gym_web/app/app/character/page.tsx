'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AICharacter() {
  const router = useRouter()
  const [selectedStyle, setSelectedStyle] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const characterStyles = [
    { id: 'fitness', name: '피트니스', emoji: '💪', desc: '근육질 운동선수 스타일' },
    { id: 'anime', name: '애니메이션', emoji: '✨', desc: '귀여운 애니 캐릭터' },
    { id: 'cartoon', name: '카툰', emoji: '🎨', desc: '재미있는 카툰 스타일' },
    { id: 'superhero', name: '슈퍼히어로', emoji: '🦸', desc: '영웅 캐릭터 스타일' },
    { id: 'minimal', name: '미니멀', emoji: '🎭', desc: '심플한 아바타' },
    { id: 'realistic', name: '사실적', emoji: '📸', desc: '실사 기반 스타일' }
  ]

  const handleGenerate = () => {
    if (!selectedStyle) {
      alert('스타일을 선택해주세요!')
      return
    }

    setIsGenerating(true)
    // TODO: AI 캐릭터 생성 API 호출
    setTimeout(() => {
      setIsGenerating(false)
      alert('AI 캐릭터가 생성되었습니다! 🎉')
      router.push('/app/profile')
    }, 3000)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      paddingBottom: '40px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '30px',
        color: 'white'
      }}>
        <div
          onClick={() => router.back()}
          style={{
            fontSize: '28px',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          ←
        </div>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800 }}>
          AI 캐릭터 생성
        </h1>
      </div>

      {/* Content Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '25px',
        padding: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        marginBottom: '20px'
      }}>
        {/* Icon & Description */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <div style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '60px',
            margin: '0 auto 20px',
            animation: 'pulse 2s infinite'
          }}>
            ✨
          </div>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: 800 }}>
            나만의 AI 캐릭터
          </h2>
          <p style={{ margin: 0, color: '#666', fontSize: '15px', lineHeight: 1.6 }}>
            사진을 업로드하고 원하는 스타일을 선택하면<br/>
            AI가 멋진 캐릭터를 만들어드려요!
          </p>
        </div>

        {/* Photo Upload */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{
            display: 'block',
            marginBottom: '12px',
            fontSize: '16px',
            fontWeight: 700,
            color: '#333'
          }}>
            📷 프로필 사진
          </label>
          <div style={{
            border: '3px dashed #ddd',
            borderRadius: '15px',
            padding: '40px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s',
            backgroundColor: '#fafafa'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#667eea'
            e.currentTarget.style.backgroundColor = '#f0f4ff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#ddd'
            e.currentTarget.style.backgroundColor = '#fafafa'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>📸</div>
            <div style={{ fontSize: '15px', color: '#666', marginBottom: '5px' }}>
              클릭하여 사진 업로드
            </div>
            <div style={{ fontSize: '13px', color: '#999' }}>
              JPG, PNG (최대 10MB)
            </div>
          </div>
        </div>

        {/* Style Selection */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{
            display: 'block',
            marginBottom: '12px',
            fontSize: '16px',
            fontWeight: 700,
            color: '#333'
          }}>
            🎨 캐릭터 스타일
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
          }}>
            {characterStyles.map(style => (
              <div
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                style={{
                  padding: '20px',
                  borderRadius: '15px',
                  border: selectedStyle === style.id ? '3px solid #667eea' : '2px solid #eee',
                  backgroundColor: selectedStyle === style.id ? '#f0f4ff' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>{style.emoji}</div>
                <div style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: selectedStyle === style.id ? '#667eea' : '#333',
                  marginBottom: '5px'
                }}>
                  {style.name}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  {style.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '15px',
            border: 'none',
            background: isGenerating 
              ? '#ddd'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '18px',
            fontWeight: 800,
            cursor: isGenerating ? 'wait' : 'pointer',
            transition: 'transform 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
          onMouseEnter={(e) => {
            if (!isGenerating) {
              e.currentTarget.style.transform = 'translateY(-2px)'
            }
          }}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          {isGenerating ? (
            <>
              <div className="spinner" style={{
                width: 20,
                height: 20,
                border: '3px solid white',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              AI 캐릭터 생성 중...
            </>
          ) : (
            '✨ AI 캐릭터 생성하기'
          )}
        </button>

        {/* Info Box */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#fff8e1',
          borderRadius: '12px',
          fontSize: '13px',
          color: '#856404',
          lineHeight: 1.6
        }}>
          💡 <strong>팁:</strong> 얼굴이 정면으로 잘 나온 사진일수록 더 멋진 캐릭터가 생성됩니다!
        </div>
      </div>

      {/* Example Characters */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: '20px',
        padding: '25px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{
          margin: '0 0 15px 0',
          fontSize: '18px',
          fontWeight: 700,
          textAlign: 'center'
        }}>
          🎉 생성 예시
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px'
        }}>
          {['💪', '✨', '🎨', '🦸'].map((emoji, idx) => (
            <div
              key={idx}
              style={{
                aspectRatio: '1',
                borderRadius: '15px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px'
              }}
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}








