'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [hourlyStats, setHourlyStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newRecord, setNewRecord] = useState({
    member: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    status: '출석',
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const apiBase = getApiUrl()
      const [attendanceRes, membersRes, hourlyRes] = await Promise.all([
        axios.get(`${apiBase}/attendance/`, { timeout: 30000 }),
        axios.get(`${apiBase}/members/`, { timeout: 30000 }),
        axios.get(`${apiBase}/attendance/hourly_stats/`, { timeout: 30000 })
      ])
      setAttendance(attendanceRes.data)
      setMembers(membersRes.data)
      setHourlyStats(hourlyRes.data)
      console.log('✅ 출석 데이터 로드 성공')
    } catch (err: any) {
      console.error('❌ 출석 데이터 로드 실패:', err)
      setAttendance([])
      setMembers([])
      setHourlyStats([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const apiBase = getApiUrl()
      await axios.post(`${apiBase}/attendance/`, newRecord, { timeout: 30000 })
      alert('✅ 출석 기록이 추가되었습니다')
      setShowAddModal(false)
      setNewRecord({
        member: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        status: '출석',
        notes: ''
      })
      loadData()
    } catch (err: any) {
      console.error('❌ 출석 추가 실패:', err)
      alert('❌ 추가 실패: ' + (err.response?.data?.detail || '오류가 발생했습니다'))
    }
  }

  const handleDelete = (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    axios.delete(`${API_BASE}/attendance/${id}/`)
      .then(() => {
        alert('삭제되었습니다')
        loadData()
      })
      .catch(err => alert('삭제 실패'))
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text)' }}>
        <div style={{ fontSize: '48px', marginBottom: 16 }}>⏳</div>
        <p>로딩 중...</p>
      </div>
    )
  }

  const todayAttendance = attendance.filter(a => a.date === new Date().toISOString().split('T')[0])
  const filteredAttendance = attendance.filter(a => a.date === filterDate)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weeklyAttendance = attendance.filter(a => {
    const date = new Date(a.date)
    return date >= weekAgo && a.status === '출석'
  })

  const peakHour = hourlyStats.reduce((max, curr) => curr.count > max.count ? curr : max, { hour: 0, count: 0 })
  const maxHourlyCount = Math.max(...hourlyStats.map(h => h.count), 1)

  // 회원별 출석 통계
  const memberAttendanceMap = new Map()
  attendance.forEach(a => {
    if (a.status === '출석') {
      memberAttendanceMap.set(a.member, (memberAttendanceMap.get(a.member) || 0) + 1)
    }
  })

  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-2xl)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, marginBottom: 'var(--spacing-xs)', color: 'var(--text)' }}>
            📝 출결 관리
          </h1>
          <p style={{ margin: 0, color: 'var(--text-sub)' }}>
            오늘 {todayAttendance.length}명 출석 • 이번 주 총 {weeklyAttendance.length}명
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          + 출석 기록
        </button>
      </div>

      {/* 출석 통계 카드 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
        gap: 'var(--spacing-md)' 
      }}>
        <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
          <div style={{ fontSize: 12, marginBottom: 6, color: 'var(--text-sub)' }}>오늘 출석</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)' }}>
            {todayAttendance.filter(a => a.status === '출석').length}명
          </div>
          <div style={{ fontSize: 11, marginTop: 4, color: 'var(--text-disabled)' }}>
            지각 {todayAttendance.filter(a => a.status === '지각').length}명
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
          <div style={{ fontSize: 12, marginBottom: 6, color: 'var(--text-sub)' }}>이번 주 출석</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)' }}>
            {weeklyAttendance.length}명
          </div>
          <div style={{ fontSize: 11, marginTop: 4, color: 'var(--text-disabled)' }}>
            일평균 {Math.round(weeklyAttendance.length / 7)}명
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
          <div style={{ fontSize: 12, marginBottom: 6, color: 'var(--text-sub)' }}>피크 시간대</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)' }}>
            {peakHour.hour}:00
          </div>
          <div style={{ fontSize: 11, marginTop: 4, color: 'var(--text-disabled)' }}>
            평균 {peakHour.count}명
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
          <div style={{ fontSize: 12, marginBottom: 6, color: 'var(--text-sub)' }}>총 출석 기록</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)' }}>
            {attendance.filter(a => a.status === '출석').length}건
          </div>
          <div style={{ fontSize: 11, marginTop: 4, color: 'var(--text-disabled)' }}>
            전체 기간
          </div>
        </div>
      </div>

      {/* 시간대별 출석 패턴 */}
      <div className="card">
        <div style={{ 
          padding: 'var(--spacing-lg) var(--spacing-xl)', 
          borderBottom: '1px solid var(--line)',
          fontWeight: 600,
          fontSize: '16px',
          color: 'var(--text)'
        }}>
          📊 시간대별 출석 패턴 (최근 7일)
        </div>
        <div style={{ padding: 'var(--spacing-2xl)', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, minWidth: 800, height: 200 }}>
            {hourlyStats.map((stat, i) => {
              const height = (stat.count / maxHourlyCount) * 100
              const isOperatingHour = stat.hour >= 6 && stat.hour <= 22
              
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, minHeight: 18, color: 'var(--text)' }}>
                    {stat.count > 0 ? stat.count : ''}
                  </div>
                  <div style={{
                    width: '100%',
                    height: `${height}%`,
                    minHeight: stat.count > 0 ? 12 : 4,
                    background: stat.hour === peakHour.hour 
                      ? 'linear-gradient(135deg, var(--danger), var(--warn))' 
                      : isOperatingHour
                      ? 'linear-gradient(135deg, var(--pri), var(--pri2))'
                      : 'var(--pill)',
                    borderRadius: 6,
                    transition: 'height 0.3s'
                  }} />
                  <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>
                    {stat.hour}시
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: 16, fontSize: 14, color: 'var(--text-sub)' }}>
            💡 가장 붐비는 시간: {peakHour.hour}:00 ~ {peakHour.hour + 1}:00 (평균 {peakHour.count}명)
          </div>
        </div>
      </div>

      {/* 출석 기록 리스트 */}
      <div className="card">
        <div style={{ 
          padding: 'var(--spacing-lg) var(--spacing-xl)', 
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text)' }}>
            📋 출석 기록 상세
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ fontSize: '14px', color: 'var(--text)', marginRight: 4 }}>날짜:</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{ padding: '8px 12px', fontSize: '14px' }}
            />
          </div>
        </div>

        <div style={{ padding: 'var(--spacing-xl)' }}>
          {filteredAttendance.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)', color: 'var(--text-sub)' }}>
              <div style={{ fontSize: '48px', marginBottom: 12 }}>📭</div>
              <p>해당 날짜에 출석 기록이 없습니다</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
              {/* 테이블 헤더 */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '50px 120px 1fr 100px 100px 120px 100px',
                gap: 12,
                padding: 'var(--spacing-md) var(--spacing-lg)',
                backgroundColor: 'var(--pill)',
                borderRadius: 'var(--radius-lg)',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text)'
              }}>
                <div>#</div>
                <div>시간</div>
                <div>회원명</div>
                <div>전화번호</div>
                <div>상태</div>
                <div>메모</div>
                <div>작업</div>
              </div>

              {/* 테이블 바디 */}
              {filteredAttendance.map((record, index) => {
                const member = members.find(m => m.id === record.member)
                return (
                  <div 
                    key={record.id}
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '50px 120px 1fr 100px 100px 120px 100px',
                      gap: 12,
                      padding: 'var(--spacing-md) var(--spacing-lg)',
                      backgroundColor: 'var(--bg2)',
                      borderRadius: 'var(--radius-lg)',
                      fontSize: '14px',
                      alignItems: 'center',
                      color: 'var(--text)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{ color: 'var(--text-sub)' }}>{index + 1}</div>
                    <div style={{ fontWeight: 600 }}>{record.time}</div>
                    <div>
                      {member ? (
                        <div>
                          <div style={{ fontWeight: 600 }}>{member.full_name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
                            {member.current_level || '회원'}
                          </div>
                        </div>
                      ) : (
                        <div style={{ color: 'var(--text-disabled)' }}>알 수 없음</div>
                      )}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-sub)' }}>
                      {member?.phone || '-'}
                    </div>
                    <div>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: 
                            record.status === '출석' ? 'rgba(0, 217, 165, 0.1)' :
                            record.status === '지각' ? 'rgba(255, 210, 51, 0.1)' :
                            'rgba(255, 82, 71, 0.1)',
                          color:
                            record.status === '출석' ? 'var(--ok)' :
                            record.status === '지각' ? '#FFB800' :
                            'var(--danger)',
                          border: 'none'
                        }}
                      >
                        {record.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-sub)' }}>
                      {record.notes || '-'}
                    </div>
                    <div>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="btn btn-sm"
                        style={{
                          padding: '6px 12px',
                          backgroundColor: 'transparent',
                          border: '1px solid var(--line)',
                          color: 'var(--danger)',
                          fontSize: '13px'
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 출석 기록 추가 모달 */}
      {showAddModal && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1000,
            }}
            onClick={() => setShowAddModal(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'var(--card-bg)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 1001,
              width: '90%',
              maxWidth: 500,
            }}
          >
            <div style={{ padding: 'var(--spacing-3xl)' }}>
              <h2 style={{ margin: '0 0 var(--spacing-xl) 0', fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>
                📝 출석 기록 추가
              </h2>

              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
                <div>
                  <label>회원 *</label>
                  <select
                    value={newRecord.member}
                    onChange={(e) => setNewRecord({ ...newRecord, member: e.target.value })}
                    required
                  >
                    <option value="">선택하세요</option>
                    {members.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.full_name} ({member.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div>
                    <label>날짜 *</label>
                    <input
                      type="date"
                      value={newRecord.date}
                      onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label>시간 *</label>
                    <input
                      type="time"
                      value={newRecord.time}
                      onChange={(e) => setNewRecord({ ...newRecord, time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label>상태 *</label>
                  <select
                    value={newRecord.status}
                    onChange={(e) => setNewRecord({ ...newRecord, status: e.target.value })}
                    required
                  >
                    <option value="출석">출석</option>
                    <option value="지각">지각</option>
                    <option value="결석">결석</option>
                  </select>
                </div>

                <div>
                  <label>메모</label>
                  <textarea
                    value={newRecord.notes}
                    onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                    placeholder="추가 메모사항이 있으면 입력하세요"
                    rows={3}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    className="btn btn-secondary"
                  >
                    취소
                  </button>
                  <button type="submit" className="btn btn-primary">
                    추가
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
