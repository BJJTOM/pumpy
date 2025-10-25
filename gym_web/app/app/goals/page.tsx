'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Goals() {
  const router = useRouter()
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: '체중 감량',
      target: '70kg',
      current: '75kg',
      progress: 50,
      emoji: '⚖️',
      deadline: '2025-12-31'
    },
    {
      id: 2,
      title: '출석 100일',
      target: '100일',
      current: '65일',
      progress: 65,
      emoji: '📅',
      deadline: '2025-12-31'
    }
  ])
  const [showNewGoal, setShowNewGoal] = useState(false)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paddingBottom: '40px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div
            onClick={() => router.back()}
            style={{
              fontSize: '28px',
              cursor: 'pointer'
            }}
          >
            ←
          </div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>
            나의 목표
          </h1>
        </div>
        <button
          onClick={() => setShowNewGoal(true)}
          style={{
            padding: '10px 20px',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: 'rgba(255,255,255,0.3)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          + 목표 추가
        </button>
      </div>

      {/* Goals List */}
      <div style={{ padding: '0 20px', display: 'grid', gap: '15px' }}>
        {goals.map(goal => (
          <div
            key={goal.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '25px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '15px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  {goal.emoji}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 700 }}>
                    {goal.title}
                  </h3>
                  <div style={{ fontSize: '13px', color: '#999' }}>
                    목표: {goal.deadline}
                  </div>
                </div>
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: 800,
                color: '#667eea'
              }}>
                {goal.progress}%
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{
              width: '100%',
              height: 12,
              backgroundColor: '#f0f0f0',
              borderRadius: 6,
              overflow: 'hidden',
              marginBottom: '15px'
            }}>
              <div style={{
                width: `${goal.progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                transition: 'width 0.3s'
              }} />
            </div>

            {/* Stats */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 15px',
              backgroundColor: '#f9f9f9',
              borderRadius: '12px'
            }}>
              <div>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
                  현재
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>
                  {goal.current}
                </div>
              </div>
              <div style={{
                width: 1,
                backgroundColor: '#e0e0e0'
              }} />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
                  목표
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#667eea' }}>
                  {goal.target}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {goals.length === 0 && (
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '20px',
            padding: '60px 20px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎯</div>
            <p style={{ fontSize: '16px', margin: 0 }}>
              아직 설정된 목표가 없습니다<br/>
              새로운 목표를 추가해보세요!
            </p>
          </div>
        )}

        {/* Motivational Quote */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: '20px',
          padding: '25px',
          color: 'white',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '15px' }}>💪</div>
          <p style={{
            fontSize: '16px',
            margin: 0,
            lineHeight: 1.6,
            fontStyle: 'italic'
          }}>
            "작은 목표부터 시작하세요.<br/>
            매일 조금씩 나아가는 것이<br/>
            성공의 비결입니다."
          </p>
        </div>
      </div>

      {/* New Goal Modal */}
      {showNewGoal && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1000
            }}
            onClick={() => setShowNewGoal(false)}
          />
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderRadius: '30px 30px 0 0',
            padding: '30px 20px',
            zIndex: 1001,
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 700 }}>
              새로운 목표 추가
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>
                목표 선택
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {[
                  { emoji: '⚖️', label: '체중 감량' },
                  { emoji: '💪', label: '근육 증가' },
                  { emoji: '📅', label: '출석 목표' },
                  { emoji: '🏃', label: '유산소 목표' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '20px',
                      borderRadius: '15px',
                      border: '2px solid #eee',
                      textAlign: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>{item.emoji}</div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => setShowNewGoal(false)}
                style={{
                  padding: '15px',
                  borderRadius: '15px',
                  border: '1px solid #ddd',
                  backgroundColor: 'white',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={() => {
                  alert('목표가 추가되었습니다!')
                  setShowNewGoal(false)
                }}
                style={{
                  padding: '15px',
                  borderRadius: '15px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                추가
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}






