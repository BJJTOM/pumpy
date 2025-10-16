'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MealLog() {
  const router = useRouter()
  const [mealType, setMealType] = useState('breakfast')
  const [foodName, setFoodName] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [notes, setNotes] = useState('')

  const mealTypes = [
    { value: 'breakfast', label: '아침', emoji: '🌅' },
    { value: 'lunch', label: '점심', emoji: '☀️' },
    { value: 'dinner', label: '저녁', emoji: '🌙' },
    { value: 'snack', label: '간식', emoji: '🍪' }
  ]

  const handleSubmit = async () => {
    // TODO: API POST 요청
    alert('식단이 기록되었습니다!')
    router.push('/app')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
          식단 기록
        </h1>
      </div>

      {/* Form Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '25px',
        padding: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        {/* Icon */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <div style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '50px',
            margin: '0 auto 15px'
          }}>
            🍽️
          </div>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: 800 }}>
            오늘 뭐 드셨나요?
          </h2>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            건강한 식단 관리를 시작해보세요
          </p>
        </div>

        {/* Meal Type Selection */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{
            display: 'block',
            marginBottom: '10px',
            fontSize: '16px',
            fontWeight: 700,
            color: '#333'
          }}>
            식사 시간
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px'
          }}>
            {mealTypes.map(mt => (
              <div
                key={mt.value}
                onClick={() => setMealType(mt.value)}
                style={{
                  padding: '15px 10px',
                  borderRadius: '12px',
                  border: mealType === mt.value ? '2px solid #f5576c' : '2px solid #eee',
                  backgroundColor: mealType === mt.value ? '#fff0f5' : 'white',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '5px' }}>{mt.emoji}</div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: mealType === mt.value ? '#f5576c' : '#666'
                }}>
                  {mt.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Food Name */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '10px',
            fontSize: '16px',
            fontWeight: 700,
            color: '#333'
          }}>
            음식명
          </label>
          <input
            type="text"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            placeholder="예: 닭가슴살 샐러드"
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '12px',
              border: '2px solid #eee',
              fontSize: '16px',
              outline: 'none',
              transition: 'border 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#f5576c'}
            onBlur={(e) => e.target.style.borderColor = '#eee'}
          />
        </div>

        {/* Nutrition Grid */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '10px',
            fontSize: '16px',
            fontWeight: 700,
            color: '#333'
          }}>
            영양 정보
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '15px'
          }}>
            <div>
              <div style={{
                fontSize: '13px',
                color: '#666',
                marginBottom: '8px',
                fontWeight: 600
              }}>
                칼로리 (kcal)
              </div>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="300"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '2px solid #eee',
                  fontSize: '15px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#f5576c'}
                onBlur={(e) => e.target.style.borderColor = '#eee'}
              />
            </div>
            <div>
              <div style={{
                fontSize: '13px',
                color: '#666',
                marginBottom: '8px',
                fontWeight: 600
              }}>
                단백질 (g)
              </div>
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="25"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '2px solid #eee',
                  fontSize: '15px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#f5576c'}
                onBlur={(e) => e.target.style.borderColor = '#eee'}
              />
            </div>
            <div>
              <div style={{
                fontSize: '13px',
                color: '#666',
                marginBottom: '8px',
                fontWeight: 600
              }}>
                탄수화물 (g)
              </div>
              <input
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="30"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '2px solid #eee',
                  fontSize: '15px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#f5576c'}
                onBlur={(e) => e.target.style.borderColor = '#eee'}
              />
            </div>
            <div>
              <div style={{
                fontSize: '13px',
                color: '#666',
                marginBottom: '8px',
                fontWeight: 600
              }}>
                지방 (g)
              </div>
              <input
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="10"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '2px solid #eee',
                  fontSize: '15px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#f5576c'}
                onBlur={(e) => e.target.style.borderColor = '#eee'}
              />
            </div>
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
            placeholder="맛있게 먹었어요!"
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '15px',
              borderRadius: '12px',
              border: '2px solid #eee',
              fontSize: '15px',
              resize: 'none',
              outline: 'none',
              transition: 'border 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#f5576c'}
            onBlur={(e) => e.target.style.borderColor = '#eee'}
          />
        </div>

        {/* Photo Upload Button */}
        <button style={{
          width: '100%',
          padding: '15px',
          borderRadius: '12px',
          border: '2px dashed #ddd',
          backgroundColor: '#fafafa',
          fontSize: '15px',
          fontWeight: 600,
          color: '#666',
          cursor: 'pointer',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '24px' }}>📷</span>
          사진 추가하기
        </button>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!foodName || !calories}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '15px',
            border: 'none',
            background: foodName && calories
              ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
              : '#ddd',
            color: 'white',
            fontSize: '18px',
            fontWeight: 800,
            cursor: foodName && calories ? 'pointer' : 'not-allowed',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => {
            if (foodName && calories) {
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



