'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '../components/BottomNav'

export default function WorkoutLogPage() {
  const router = useRouter()
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newLog, setNewLog] = useState({
    date: new Date().toISOString().split('T')[0],
    exercise: '',
    sets: '',
    reps: '',
    weight: '',
    duration: '',
    notes: ''
  })

  useEffect(() => {
    // 로컬 스토리지에서 운동 기록 불러오기
    const savedLogs = localStorage.getItem('workout_logs')
    if (savedLogs) {
      setWorkoutLogs(JSON.parse(savedLogs))
    }
  }, [])

  const handleAddLog = () => {
    if (!newLog.exercise.trim()) {
      alert('운동 종목을 입력해주세요!')
      return
    }

    const log = {
      id: Date.now(),
      ...newLog,
      createdAt: new Date().toISOString()
    }

    const updatedLogs = [log, ...workoutLogs]
    setWorkoutLogs(updatedLogs)
    localStorage.setItem('workout_logs', JSON.stringify(updatedLogs))

    setNewLog({
      date: new Date().toISOString().split('T')[0],
      exercise: '',
      sets: '',
      reps: '',
      weight: '',
      duration: '',
      notes: ''
    })
    setShowAddModal(false)
  }

  const handleDeleteLog = (id: number) => {
    if (!confirm('이 운동 기록을 삭제하시겠습니까?')) return

    const updatedLogs = workoutLogs.filter(log => log.id !== id)
    setWorkoutLogs(updatedLogs)
    localStorage.setItem('workout_logs', JSON.stringify(updatedLogs))
  }

  const groupLogsByDate = () => {
    const grouped: any = {}
    workoutLogs.forEach(log => {
      if (!grouped[log.date]) {
        grouped[log.date] = []
      }
      grouped[log.date].push(log)
    })
    return grouped
  }

  const groupedLogs = groupLogsByDate()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return '오늘'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '어제'
    } else {
      return date.toLocaleDateString('ko-KR', { 
        month: 'long', 
        day: 'numeric',
        weekday: 'short'
      })
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paddingBottom: '100px'
    }}>
      {/* 헤더 */}
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        padding: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
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
              fontWeight: 900,
              color: '#1f2937'
            }}>
              운동 기록
            </h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '15px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            ➕ 추가
          </button>
        </div>

        {/* 통계 카드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px'
        }}>
          <StatCard
            icon="🏋️"
            label="총 운동"
            value={`${workoutLogs.length}회`}
          />
          <StatCard
            icon="📅"
            label="이번 주"
            value={`${workoutLogs.filter(log => {
              const logDate = new Date(log.date)
              const weekAgo = new Date()
              weekAgo.setDate(weekAgo.getDate() - 7)
              return logDate >= weekAgo
            }).length}회`}
          />
          <StatCard
            icon="🔥"
            label="연속"
            value="3일"
          />
        </div>
      </div>

      {/* 운동 기록 목록 */}
      <div style={{ padding: '20px' }}>
        {Object.keys(groupedLogs).length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            padding: '60px 20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>💪</div>
            <h3 style={{
              margin: '0 0 10px 0',
              fontSize: '20px',
              fontWeight: 800,
              color: '#333'
            }}>
              아직 운동 기록이 없습니다
            </h3>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#999'
            }}>
              첫 운동 기록을 추가해보세요!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {Object.keys(groupedLogs).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).map(date => (
              <div key={date}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: 'white',
                  marginBottom: '12px',
                  textShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}>
                  {formatDate(date)}
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  {groupedLogs[date].map((log: any) => (
                    <WorkoutLogCard
                      key={log.id}
                      log={log}
                      onDelete={() => handleDeleteLog(log.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 추가 모달 */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}
        onClick={() => setShowAddModal(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '25px',
              padding: '30px',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '25px'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '22px',
                fontWeight: 900,
                color: '#1f2937'
              }}>
                운동 기록 추가
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#f3f4f6',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <InputField
                label="날짜"
                type="date"
                value={newLog.date}
                onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
              />
              <InputField
                label="운동 종목 *"
                placeholder="예: 벤치프레스, 스쿼트, 데드리프트"
                value={newLog.exercise}
                onChange={(e) => setNewLog({ ...newLog, exercise: e.target.value })}
              />
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px'
              }}>
                <InputField
                  label="세트"
                  type="number"
                  placeholder="3"
                  value={newLog.sets}
                  onChange={(e) => setNewLog({ ...newLog, sets: e.target.value })}
                />
                <InputField
                  label="회"
                  type="number"
                  placeholder="10"
                  value={newLog.reps}
                  onChange={(e) => setNewLog({ ...newLog, reps: e.target.value })}
                />
                <InputField
                  label="무게 (kg)"
                  type="number"
                  placeholder="50"
                  value={newLog.weight}
                  onChange={(e) => setNewLog({ ...newLog, weight: e.target.value })}
                />
              </div>
              <InputField
                label="운동 시간 (분)"
                type="number"
                placeholder="30"
                value={newLog.duration}
                onChange={(e) => setNewLog({ ...newLog, duration: e.target.value })}
              />
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  메모
                </label>
                <textarea
                  placeholder="오늘 운동에 대한 메모를 남겨보세요"
                  value={newLog.notes}
                  onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '10px',
                marginTop: '10px'
              }}>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    background: 'white',
                    color: '#6b7280',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  취소
                </button>
                <button
                  onClick={handleAddLog}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                  }}
                >
                  추가하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}

function StatCard({ icon, label, value }: any) {
  return (
    <div style={{
      padding: '12px',
      background: 'white',
      borderRadius: '12px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '20px', marginBottom: '5px' }}>{icon}</div>
      <div style={{
        fontSize: '11px',
        color: '#999',
        marginBottom: '3px',
        fontWeight: 600
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '16px',
        fontWeight: 800,
        color: '#667eea'
      }}>
        {value}
      </div>
    </div>
  )
}

function WorkoutLogCard({ log, onDelete }: any) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.95)',
      borderRadius: '20px',
      padding: '20px',
      boxShadow: '0 2px 15px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '15px'
      }}>
        <div>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '18px',
            fontWeight: 800,
            color: '#333'
          }}>
            {log.exercise}
          </h3>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {log.sets && (
              <span style={{
                padding: '4px 10px',
                background: '#667eea20',
                color: '#667eea',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700
              }}>
                {log.sets} 세트
              </span>
            )}
            {log.reps && (
              <span style={{
                padding: '4px 10px',
                background: '#10b98120',
                color: '#10b981',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700
              }}>
                {log.reps} 회
              </span>
            )}
            {log.weight && (
              <span style={{
                padding: '4px 10px',
                background: '#f59e0b20',
                color: '#f59e0b',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700
              }}>
                {log.weight} kg
              </span>
            )}
            {log.duration && (
              <span style={{
                padding: '4px 10px',
                background: '#ec489920',
                color: '#ec4899',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700
              }}>
                {log.duration} 분
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onDelete}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#fee2e2',
            border: 'none',
            color: '#ef4444',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          🗑️
        </button>
      </div>
      {log.notes && (
        <div style={{
          padding: '12px',
          background: '#f9fafb',
          borderRadius: '10px',
          fontSize: '13px',
          color: '#666',
          lineHeight: '1.6'
        }}>
          {log.notes}
        </div>
      )}
    </div>
  )
}

function InputField({ label, type = 'text', placeholder, value, onChange }: any) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: '13px',
        fontWeight: 700,
        color: '#374151',
        marginBottom: '8px'
      }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '2px solid #e5e7eb',
          fontSize: '14px',
          fontWeight: 600,
          outline: 'none',
          transition: 'border 0.2s'
        }}
      />
    </div>
  )
}

