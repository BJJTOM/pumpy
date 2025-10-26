'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WorkoutLog() {
  const router = useRouter()
  const [duration, setDuration] = useState('')
  const [feeling, setFeeling] = useState('')
  const [notes, setNotes] = useState('')

  const feelings = [
    { emoji: '😊', label: '좋음', value: 'good' },
    { emoji: '😐', label: '보통', value: 'normal' },
    { emoji: '😓', label: '힘듦', value: 'hard' },
    { emoji: '💪', label: '최고!', value: 'excellent' }
  ]

  const handleSubmit = async () => {
    // TODO: API POST 요청
    alert('운동 기록이 저장되었습니다!')
    router.push('/app')
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
          운동 출석 & 기록
        </h1>
      </div>

      {/* Form Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '25px',
        padding: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        {/* Success Icon */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <div style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '50px',
            margin: '0 auto 15px'
          }}>
            ✓
          </div>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: 800 }}>
            출석 완료!
          </h2>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            오늘도 운동을 완료하셨네요 👏
          </p>
        </div>

        {/* Duration Input */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{
            display: 'block',
            marginBottom: '10px',
            fontSize: '16px',
            fontWeight: 700,
            color: '#333'
          }}>
            운동 시간 (분)
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="60"
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '12px',
              border: '2px solid #eee',
              fontSize: '16px',
              outline: 'none',
              transition: 'border 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#eee'}
          />
        </div>

        {/* Feeling Selection */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{
            display: 'block',
            marginBottom: '10px',
            fontSize: '16px',
            fontWeight: 700,
            color: '#333'
          }}>
            오늘의 컨디션
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px'
          }}>
            {feelings.map(f => (
              <div
                key={f.value}
                onClick={() => setFeeling(f.value)}
                style={{
                  padding: '20px 10px',
                  borderRadius: '12px',
                  border: feeling === f.value ? '2px solid #667eea' : '2px solid #eee',
                  backgroundColor: feeling === f.value ? '#f0f4ff' : 'white',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '5px' }}>{f.emoji}</div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: feeling === f.value ? '#667eea' : '#666'
                }}>
                  {f.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{
            display: 'block',
            marginBottom: '10px',
            fontSize: '16px',
            fontWeight: 700,
            color: '#333'
          }}>
            메모 (선택사항)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="오늘 운동은 어땠나요?"
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '15px',
              borderRadius: '12px',
              border: '2px solid #eee',
              fontSize: '15px',
              resize: 'none',
              outline: 'none',
              transition: 'border 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#eee'}
          />
        </div>

        {/* Estimated Calories */}
        {duration && (
          <div style={{
            padding: '20px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            textAlign: 'center',
            marginBottom: '25px'
          }}>
            <div style={{ fontSize: '14px', marginBottom: '5px', opacity: 0.9 }}>
              예상 소모 칼로리
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800 }}>
              🔥 {Math.round(parseInt(duration) * 5)} kcal
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!duration || !feeling}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '15px',
            border: 'none',
            background: duration && feeling 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : '#ddd',
            color: 'white',
            fontSize: '18px',
            fontWeight: 800,
            cursor: duration && feeling ? 'pointer' : 'not-allowed',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => {
            if (duration && feeling) {
              e.currentTarget.style.transform = 'translateY(-2px)'
            }
          }}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          기록 저장하기
        </button>
      </div>
    </div>
  )
}











