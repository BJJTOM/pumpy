'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '../components/BottomNav'

export default function MealPage() {
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

  const mealPlan = {
    breakfast: ['오트밀 1컵', '바나나 1개', '아몬드 한 줌', '우유 200ml'],
    lunch: ['현미밥 1공기', '닭가슴살 150g', '브로콜리', '샐러드'],
    dinner: ['고구마 1개', '연어 150g', '채소 샐러드', '올리브 오일'],
    snack: ['프로틴 쉐이크', '견과류', '과일']
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
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
          오늘의 식단
        </h1>
      </div>

      {/* Content */}
      <div style={{
        padding: '0 20px'
      }}>
        <div style={{
          marginBottom: '20px'
        }}>
          <MealCard
            icon="🌅"
            title="아침"
            items={mealPlan.breakfast}
            color="#fbbf24"
          />
          <MealCard
            icon="☀️"
            title="점심"
            items={mealPlan.lunch}
            color="#f59e0b"
          />
          <MealCard
            icon="🌙"
            title="저녁"
            items={mealPlan.dinner}
            color="#667eea"
          />
          <MealCard
            icon="🍎"
            title="간식"
            items={mealPlan.snack}
            color="#10b981"
          />
        </div>

        {/* 영양 정보 */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          padding: '25px',
          marginBottom: '20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}>
          <h3 style={{
            margin: '0 0 15px 0',
            fontSize: '18px',
            fontWeight: 800,
            color: '#333'
          }}>
            📊 예상 영양 정보
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px'
          }}>
            <NutritionItem label="칼로리" value="2000" unit="kcal" color="#f59e0b" />
            <NutritionItem label="단백질" value="150" unit="g" color="#10b981" />
            <NutritionItem label="탄수화물" value="200" unit="g" color="#667eea" />
          </div>
        </div>

        {/* 팁 */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '25px',
          textAlign: 'center',
          border: '2px solid rgba(255,255,255,0.3)'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>💡</div>
          <div style={{
            fontSize: '16px',
            fontWeight: 800,
            color: 'white',
            marginBottom: '8px',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}>
            식단 관리 팁
          </div>
          <div style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.9)',
            lineHeight: '1.6',
            fontWeight: 600
          }}>
            운동 전 1-2시간 전에 가벼운 식사를 하고,<br />
            운동 후 30분 이내에 단백질을 섭취하세요!
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

function MealCard({ icon, title, items, color }: any) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.95)',
      borderRadius: '20px',
      padding: '20px',
      marginBottom: '15px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '15px',
        paddingBottom: '12px',
        borderBottom: '2px solid #f3f4f6'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}>
          {icon}
        </div>
        <h3 style={{
          margin: 0,
          fontSize: '20px',
          fontWeight: 900,
          color: '#333'
        }}>
          {title}
        </h3>
      </div>
      <div style={{
        display: 'grid',
        gap: '8px'
      }}>
        {items.map((item: string, idx: number) => (
          <div
            key={idx}
            style={{
              padding: '10px 12px',
              background: '#f8f9fa',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ color }}>•</span>
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

function NutritionItem({ label, value, unit, color }: any) {
  return (
    <div style={{
      padding: '15px',
      background: '#f8f9fa',
      borderRadius: '12px',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '22px',
        fontWeight: 900,
        color,
        marginBottom: '5px'
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '11px',
        color: '#999',
        fontWeight: 600
      }}>
        {label} ({unit})
      </div>
    </div>
  )
}
