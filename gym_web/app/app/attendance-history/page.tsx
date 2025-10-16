'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AttendanceHistory() {
  const router = useRouter()
  const [selectedMonth, setSelectedMonth] = useState('2025-10')
  
  const attendanceData = [
    { date: '2025-10-14', time: '18:30', calories: 450 },
    { date: '2025-10-12', time: '19:00', calories: 500 },
    { date: '2025-10-10', time: '18:00', calories: 420 },
    { date: '2025-10-08', time: '19:30', calories: 480 },
    { date: '2025-10-06', time: '18:15', calories: 390 },
    { date: '2025-10-04', time: '19:45', calories: 510 },
    { date: '2025-10-02', time: '18:30', calories: 460 }
  ]

  const totalDays = attendanceData.length
  const totalCalories = attendanceData.reduce((sum, item) => sum + item.calories, 0)
  const avgCalories = Math.round(totalCalories / totalDays)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      paddingBottom: '40px'
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          marginBottom: '15px'
        }}>
          <div
            onClick={() => router.back()}
            style={{
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ←
          </div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>출석 기록</h1>
        </div>

        {/* Month Selector */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            border: '2px solid #eee',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="2025-10">2025년 10월</option>
          <option value="2025-09">2025년 9월</option>
          <option value="2025-08">2025년 8월</option>
        </select>
      </div>

      {/* Stats Summary */}
      <div style={{
        padding: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#667eea', marginBottom: '5px' }}>
            {totalDays}
          </div>
          <div style={{ fontSize: '13px', color: '#999' }}>출석일</div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#667eea', marginBottom: '5px' }}>
            {totalCalories}
          </div>
          <div style={{ fontSize: '13px', color: '#999' }}>칼로리</div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#667eea', marginBottom: '5px' }}>
            {avgCalories}
          </div>
          <div style={{ fontSize: '13px', color: '#999' }}>평균</div>
        </div>
      </div>

      {/* Calendar View */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '15px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 700 }}>
            📅 이번 달 출석
          </h3>
          
          {/* Simple Calendar Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px'
          }}>
            {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: idx === 0 ? '#FF3B30' : idx === 6 ? '#667eea' : '#999',
                  padding: '8px 0'
                }}
              >
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
              const dateStr = `2025-10-${String(day).padStart(2, '0')}`
              const hasAttendance = attendanceData.some(item => item.date === dateStr)
              
              return (
                <div
                  key={day}
                  style={{
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    backgroundColor: hasAttendance ? '#667eea' : 'transparent',
                    color: hasAttendance ? 'white' : '#333',
                    position: 'relative'
                  }}
                >
                  {day}
                  {hasAttendance && (
                    <div style={{
                      position: 'absolute',
                      bottom: 2,
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      backgroundColor: 'white'
                    }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Attendance List */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '15px 20px',
            borderBottom: '1px solid #f0f0f0',
            fontWeight: 700,
            fontSize: '16px'
          }}>
            📝 출석 내역
          </div>
          
          {attendanceData.map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: '15px 20px',
                borderBottom: idx < attendanceData.length - 1 ? '1px solid #f0f0f0' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, marginBottom: '5px' }}>
                  {new Date(item.date).toLocaleDateString('ko-KR', {
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short'
                  })}
                </div>
                <div style={{ fontSize: '13px', color: '#999' }}>
                  🕐 {item.time}
                </div>
              </div>
              <div style={{
                padding: '8px 16px',
                borderRadius: '20px',
                backgroundColor: '#f0f4ff',
                fontSize: '14px',
                fontWeight: 700,
                color: '#667eea'
              }}>
                🔥 {item.calories} kcal
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}



