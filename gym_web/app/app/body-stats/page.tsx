'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '../components/BottomNav'

export default function BodyStatsPage() {
  const router = useRouter()
  const [bodyStats, setBodyStats] = useState({ weight: 70, muscle: 35, fat: 15, height: 175 })
  const [isEditing, setIsEditing] = useState(false)
  const [tempStats, setTempStats] = useState(bodyStats)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) {
      router.push('/auth/login')
      return
    }

    const user = JSON.parse(userStr)
    const savedBodyStats = localStorage.getItem(`body_stats_${user.id}`)
    if (savedBodyStats) {
      const stats = JSON.parse(savedBodyStats)
      setBodyStats(stats)
      setTempStats(stats)
    }
    setLoading(false)
  }, [router])

  // BMI 계산 메모이제이션
  const calculateBMI = useMemo(() => {
    const heightM = bodyStats.height / 100
    return (bodyStats.weight / (heightM * heightM)).toFixed(1)
  }, [bodyStats.height, bodyStats.weight])

  // BMI 상태 메모이제이션
  const getBMIStatus = useMemo(() => {
    const bmi = parseFloat(calculateBMI)
    if (bmi < 18.5) return { text: '저체중', color: '#51cf66', emoji: '😰' }
    if (bmi < 23) return { text: '정상', color: '#667eea', emoji: '😊' }
    if (bmi < 25) return { text: '과체중', color: '#ffa94d', emoji: '😅' }
    return { text: '비만', color: '#ff6b6b', emoji: '😓' }
  }, [calculateBMI])

  // 저장 핸들러 메모이제이션
  const handleSave = useCallback(() => {
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) return

    const user = JSON.parse(userStr)
    localStorage.setItem(`body_stats_${user.id}`, JSON.stringify(tempStats))
    setBodyStats(tempStats)
    setIsEditing(false)
    alert('✅ 신체 정보가 저장되었습니다!')
  }, [tempStats])

  // 취소 핸들러 메모이제이션
  const handleCancel = useCallback(() => {
    setTempStats(bodyStats)
    setIsEditing(false)
  }, [bodyStats])
  
  // 권장 체중 범위 메모이제이션
  const recommendedWeightRange = useMemo(() => {
    const heightM = bodyStats.height / 100
    const minWeight = (heightM * heightM * 18.5).toFixed(1)
    const maxWeight = (heightM * heightM * 23).toFixed(1)
    return { min: minWeight, max: maxWeight }
  }, [bodyStats.height])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 0.8s linear infinite'
          }} />
          <p style={{ fontSize: '18px', fontWeight: 600 }}>로딩 중...</p>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}} />
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      paddingBottom: '100px'
    }}>
      {/* 헤더 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '30px 20px 40px',
        borderRadius: '0 0 30px 30px',
        marginBottom: '-20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
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
              내 신체 정보
            </h1>
          </div>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            style={{
              padding: '10px 20px',
              borderRadius: '20px',
              border: 'none',
              background: isEditing ? '#10b981' : 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              backdropFilter: 'blur(10px)'
            }}
          >
            {isEditing ? '✅ 저장' : '✏️ 수정'}
          </button>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {/* BMI 카드 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '25px',
          padding: '30px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '60px', marginBottom: '15px' }}>
            {getBMIStatus.emoji}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '10px',
            fontWeight: 600
          }}>
            BMI (체질량지수)
          </div>
          <div style={{
            fontSize: '56px',
            fontWeight: 900,
            color: getBMIStatus.color,
            marginBottom: '15px'
          }}>
            {calculateBMI}
          </div>
          <div style={{
            padding: '10px 25px',
            background: getBMIStatus.color,
            color: 'white',
            borderRadius: '25px',
            display: 'inline-block',
            fontSize: '16px',
            fontWeight: 700
          }}>
            {getBMIStatus.text}
          </div>
        </div>

        {/* 신체 측정 */}
        {isEditing ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '25px',
            padding: '30px',
            marginBottom: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 800, color: '#333' }}>
              📝 신체 정보 수정
            </h3>

            <div style={{ display: 'grid', gap: '20px' }}>
              <InputField
                label="키 (cm)"
                icon="📏"
                value={tempStats.height}
                onChange={(value) => setTempStats({ ...tempStats, height: value })}
              />
              <InputField
                label="체중 (kg)"
                icon="⚖️"
                value={tempStats.weight}
                onChange={(value) => setTempStats({ ...tempStats, weight: value })}
              />
              <InputField
                label="근육량 (kg)"
                icon="💪"
                value={tempStats.muscle}
                onChange={(value) => setTempStats({ ...tempStats, muscle: value })}
              />
              <InputField
                label="체지방 (%)"
                icon="🔥"
                value={tempStats.fat}
                onChange={(value) => setTempStats({ ...tempStats, fat: value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={handleCancel}
                style={{
                  padding: '16px',
                  borderRadius: '15px',
                  border: '1px solid #e5e7eb',
                  background: 'white',
                  color: '#999',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: '16px',
                  borderRadius: '15px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                }}
              >
                저장하기
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '25px',
            padding: '30px',
            marginBottom: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 800, color: '#333' }}>
              📊 신체 측정
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '15px'
            }}>
              <StatCard
                emoji="📏"
                value={bodyStats.height}
                label="키 (cm)"
                gradient="linear-gradient(135deg, #667eea15 0%, #764ba215 100%)"
                color="#667eea"
              />
              <StatCard
                emoji="⚖️"
                value={bodyStats.weight}
                label="체중 (kg)"
                gradient="linear-gradient(135deg, #667eea15 0%, #764ba215 100%)"
                color="#667eea"
              />
              <StatCard
                emoji="💪"
                value={bodyStats.muscle}
                label="근육량 (kg)"
                gradient="linear-gradient(135deg, #10b98115 0%, #34d39915 100%)"
                color="#10b981"
              />
              <StatCard
                emoji="🔥"
                value={bodyStats.fat}
                label="체지방 (%)"
                gradient="linear-gradient(135deg, #f59e0b15 0%, #fbbf2415 100%)"
                color="#f59e0b"
              />
            </div>
          </div>
        )}

        {/* 건강 팁 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '25px',
          padding: '25px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: 800, color: '#333' }}>
            💡 건강 팁
          </h3>
          <div style={{
            padding: '15px',
            background: '#f8fafc',
            borderRadius: '12px',
            fontSize: '14px',
            color: '#666',
            lineHeight: 1.8
          }}>
            <div style={{ marginBottom: '10px' }}>
              • 현재 BMI: <strong style={{ color: getBMIStatus.color }}>{getBMIStatus.text}</strong>
            </div>
            <div style={{ marginBottom: '10px' }}>
              • 권장 체중 범위: {recommendedWeightRange.min}kg ~ {recommendedWeightRange.max}kg
            </div>
            <div>
              • 근육량을 늘리고 체지방을 줄이는 것이 건강한 몸을 만드는 핵심입니다!
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

type StatCardProps = {
  emoji: string
  value: number
  label: string
  gradient: string
  color: string
}

function StatCard({ emoji, value, label, gradient, color }: StatCardProps) {
  return (
    <div style={{
      padding: '20px',
      background: gradient,
      borderRadius: '15px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '28px', marginBottom: '10px' }}>{emoji}</div>
      <div style={{
        fontSize: '32px',
        fontWeight: 800,
        color: color,
        marginBottom: '8px'
      }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: '#999', fontWeight: 600 }}>
        {label}
      </div>
    </div>
  )
}

type InputFieldProps = {
  label: string
  icon: string
  value: number
  onChange: (value: number) => void
}

function InputField({ label, icon, value, onChange }: InputFieldProps) {
  return (
    <div>
      <label style={{
        fontSize: '14px',
        color: '#666',
        fontWeight: 600,
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        style={{
          width: '100%',
          padding: '15px',
          borderRadius: '12px',
          border: '2px solid #e0e7ff',
          fontSize: '18px',
          fontWeight: 600,
          boxSizing: 'border-box'
        }}
      />
    </div>
  )
}

