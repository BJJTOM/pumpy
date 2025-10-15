'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'

type Exercise = {
  name: string
  reps: number | string
  sets: number | string
  weight?: string
  notes?: string
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<any[]>([])
  const [coaches, setCoaches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time_start: '09:00',
    time_end: '10:00',
    title: '',
    category: 'CrossFit',
    level: '전체',
    description: '',
    warmup: '',
    strength: '',
    wod_detail: '',
    rounds: '',
    time_cap: '',
    coach: '',
    max_participants: '20',
    notes: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const apiBase = getApiUrl()
    Promise.all([
      axios.get(`${apiBase}/wods/`),
      axios.get(`${apiBase}/coaches/`)
    ]).then(([schedRes, coachRes]) => {
      setSchedules(schedRes.data)
      setCoaches(coachRes.data)
    }).catch(err => {
      console.error(err)
    }).finally(() => {
      setLoading(false)
    })
  }

  const addExercise = () => {
    setExercises([...exercises, { name: '', reps: '', sets: '', weight: '', notes: '' }])
  }

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const updateExercise = (index: number, field: keyof Exercise, value: string | number) => {
    const updated = [...exercises]
    updated[index] = { ...updated[index], [field]: value }
    setExercises(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const data = {
      date: formData.date,
      time_start: formData.time_start,
      time_end: formData.time_end,
      title: formData.title,
      category: formData.category,
      level: formData.level,
      description: formData.description,
      warmup: formData.warmup,
      strength: formData.strength,
      wod_detail: formData.wod_detail,
      rounds: formData.rounds ? parseInt(formData.rounds) : null,
      time_cap: formData.time_cap ? parseInt(formData.time_cap) : null,
      exercises: exercises.filter(ex => ex.name.trim() !== ''),
      coach: formData.coach || null,
      max_participants: parseInt(formData.max_participants),
      notes: formData.notes,
    }

    const apiBase = getApiUrl()
    axios.post(`${apiBase}/wods/`, data)
      .then(() => {
        alert('수업 일정이 등록되었습니다')
        setShowModal(false)
        resetForm()
        loadData()
      })
      .catch(err => {
        console.error(err)
        alert('등록 실패: ' + (err.response?.data?.detail || '오류가 발생했습니다'))
      })
  }

  const handleDelete = (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    const apiBase = getApiUrl()
    axios.delete(`${apiBase}/wods/${id}/`)
      .then(() => {
        alert('삭제되었습니다')
        loadData()
      })
      .catch(err => alert('삭제 실패'))
  }

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time_start: '09:00',
      time_end: '10:00',
      title: '',
      category: 'CrossFit',
      level: '전체',
      description: '',
      warmup: '',
      strength: '',
      wod_detail: '',
      rounds: '',
      time_cap: '',
      coach: '',
      max_participants: '20',
      notes: '',
    })
    setExercises([])
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text)' }}>
        <div style={{ fontSize: '48px', marginBottom: 16 }}>⏳</div>
        <p>로딩 중...</p>
      </div>
    )
  }

  const todaySchedules = schedules.filter(s => s.date === new Date().toISOString().split('T')[0])
  const upcomingSchedules = schedules.filter(s => s.date > new Date().toISOString().split('T')[0])

  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-2xl)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, marginBottom: 'var(--spacing-xs)', color: 'var(--text)' }}>
            📅 수업 일정
          </h1>
          <p style={{ margin: 0, color: 'var(--text-sub)' }}>
            오늘 {todaySchedules.length}개 수업
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          + 수업 추가
        </button>
      </div>

      {/* 오늘의 수업 */}
      <div>
        <h2 style={{ margin: '0 0 var(--spacing-lg) 0', fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>
          🔥 오늘의 수업
        </h2>
        {todaySchedules.length === 0 ? (
          <div className="card" style={{ padding: 'var(--spacing-3xl)', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-sub)' }}>오늘 등록된 수업이 없습니다</p>
            <button 
              onClick={() => setShowModal(true)} 
              className="btn btn-secondary"
              style={{ marginTop: 'var(--spacing-lg)' }}
            >
              오늘 수업 등록하기
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
            {todaySchedules.map(schedule => {
              const coachInfo = coaches.find(c => c.id === schedule.coach)
              return (
                <div key={schedule.id} className="card">
                  <div style={{ padding: 'var(--spacing-2xl)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--spacing-xl)', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 280 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                          <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: 'var(--text)' }}>
                            {schedule.title}
                          </h3>
                          <span className="badge primary">오늘</span>
                          <span className="badge success">{schedule.category}</span>
                          <span className="pill">{schedule.level}</span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '14px', color: 'var(--text-sub)', marginBottom: 'var(--spacing-md)' }}>
                          {coachInfo && <div>👨‍🏫 {coachInfo.name}</div>}
                          <div>🕒 {schedule.time_start} - {schedule.time_end}</div>
                          <div>👥 {schedule.registered_count}/{schedule.max_participants}명</div>
                          {schedule.time_cap && <div>⏱️ {schedule.time_cap}분</div>}
                          {schedule.rounds && <div>🔄 {schedule.rounds}라운드</div>}
                        </div>

                        {schedule.description && (
                          <div style={{
                            padding: 'var(--spacing-lg)',
                            backgroundColor: 'var(--pill)',
                            borderRadius: 'var(--radius-lg)',
                            fontSize: '14px',
                            marginBottom: 'var(--spacing-md)',
                            whiteSpace: 'pre-wrap',
                            color: 'var(--text)'
                          }}>
                            {schedule.description}
                          </div>
                        )}

                        {schedule.exercises && schedule.exercises.length > 0 && (
                          <div style={{ marginTop: 'var(--spacing-md)' }}>
                            <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)', color: 'var(--text)' }}>💪 운동 목록:</div>
                            <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
                              {schedule.exercises.map((ex: any, i: number) => (
                                <div key={i} style={{ 
                                  padding: 'var(--spacing-md)', 
                                  backgroundColor: 'var(--bg2)', 
                                  borderRadius: 'var(--radius-md)',
                                  fontSize: '14px',
                                  color: 'var(--text)'
                                }}>
                                  <span style={{ fontWeight: 600 }}>{ex.name}</span>
                                  {ex.sets && ex.reps && ` - ${ex.sets}세트 × ${ex.reps}회`}
                                  {ex.weight && ` (${ex.weight})`}
                                  {ex.notes && <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: 4 }}>{ex.notes}</div>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="btn btn-sm btn-danger"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 예정된 수업 */}
      {upcomingSchedules.length > 0 && (
        <div>
          <h2 style={{ margin: '0 0 var(--spacing-lg) 0', fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>
            📅 예정된 수업
          </h2>
          <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
            {upcomingSchedules.slice(0, 10).map(schedule => {
              const coachInfo = coaches.find(c => c.id === schedule.coach)
              return (
                <div key={schedule.id} className="card">
                  <div style={{ padding: 'var(--spacing-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 240 }}>
                      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center', marginBottom: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
                          {schedule.title}
                        </div>
                        <span className="badge success">{schedule.category}</span>
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-sub)' }}>
                        {new Date(schedule.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                        {' • '}{schedule.time_start} - {schedule.time_end}
                        {coachInfo && ` • ${coachInfo.name}`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className="btn btn-sm btn-secondary"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
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
            onClick={() => setShowModal(false)}
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
              maxWidth: 700,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ padding: 'var(--spacing-3xl)' }}>
              <h2 style={{ margin: '0 0 var(--spacing-xl) 0', fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>
                💪 수업 일정 추가
              </h2>

              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
                {/* 기본 정보 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
                  <div>
                    <label>날짜 *</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label>시작 시간 *</label>
                    <input
                      type="time"
                      value={formData.time_start}
                      onChange={(e) => setFormData({ ...formData, time_start: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label>종료 시간 *</label>
                    <input
                      type="time"
                      value={formData.time_end}
                      onChange={(e) => setFormData({ ...formData, time_end: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label>수업명 *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="예: 상체 근력 운동"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--spacing-md)' }}>
                  <div>
                    <label>종목 *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      <option value="CrossFit">CrossFit</option>
                      <option value="주짓수">주짓수</option>
                      <option value="복싱">복싱</option>
                      <option value="MMA">MMA</option>
                      <option value="요가">요가</option>
                      <option value="PT">PT</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>

                  <div>
                    <label>레벨 *</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      required
                    >
                      <option value="전체">전체</option>
                      <option value="초급">초급</option>
                      <option value="중급">중급</option>
                      <option value="고급">고급</option>
                    </select>
                  </div>

                  <div>
                    <label>담당 코치</label>
                    <select
                      value={formData.coach}
                      onChange={(e) => setFormData({ ...formData, coach: e.target.value })}
                    >
                      <option value="">선택 안 함</option>
                      {coaches.map(coach => (
                        <option key={coach.id} value={coach.id}>
                          {coach.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--spacing-md)' }}>
                  <div>
                    <label>최대 인원</label>
                    <input
                      type="number"
                      value={formData.max_participants}
                      onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                      placeholder="20"
                    />
                  </div>

                  <div>
                    <label>라운드 수</label>
                    <input
                      type="number"
                      value={formData.rounds}
                      onChange={(e) => setFormData({ ...formData, rounds: e.target.value })}
                      placeholder="5"
                    />
                  </div>

                  <div>
                    <label>타임캡 (분)</label>
                    <input
                      type="number"
                      value={formData.time_cap}
                      onChange={(e) => setFormData({ ...formData, time_cap: e.target.value })}
                      placeholder="20"
                    />
                  </div>
                </div>

                <div>
                  <label>수업 설명</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="수업 설명을 입력하세요"
                    rows={3}
                  />
                </div>

                {/* 운동 구성 */}
                <div style={{ borderTop: '1px solid var(--line)', paddingTop: 'var(--spacing-lg)' }}>
                  <h3 style={{ margin: '0 0 var(--spacing-md) 0', fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
                    운동 구성
                  </h3>

                  <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                    <div>
                      <label>워밍업</label>
                      <textarea
                        value={formData.warmup}
                        onChange={(e) => setFormData({ ...formData, warmup: e.target.value })}
                        placeholder="예: 조깅 5분, 동적 스트레칭 5분"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label>스트렝스</label>
                      <textarea
                        value={formData.strength}
                        onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                        placeholder="예: 백 스쿼트 5x5 @ 70% 1RM"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label>WOD 상세</label>
                      <textarea
                        value={formData.wod_detail}
                        onChange={(e) => setFormData({ ...formData, wod_detail: e.target.value })}
                        placeholder="예: AMRAP 20분..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* 운동 목록 */}
                <div style={{ borderTop: '1px solid var(--line)', paddingTop: 'var(--spacing-lg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
                      💪 운동 목록
                    </h3>
                    <button 
                      type="button" 
                      onClick={addExercise}
                      className="btn btn-sm btn-secondary"
                    >
                      + 운동 추가
                    </button>
                  </div>

                  {exercises.map((exercise, index) => (
                    <div key={index} style={{ 
                      padding: 'var(--spacing-md)', 
                      backgroundColor: 'var(--pill)', 
                      borderRadius: 'var(--radius-lg)',
                      marginBottom: 'var(--spacing-md)'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={exercise.name}
                          onChange={(e) => updateExercise(index, 'name', e.target.value)}
                          placeholder="운동 이름"
                          style={{ padding: '8px' }}
                        />
                        <input
                          type="text"
                          value={exercise.sets}
                          onChange={(e) => updateExercise(index, 'sets', e.target.value)}
                          placeholder="세트"
                          style={{ padding: '8px' }}
                        />
                        <input
                          type="text"
                          value={exercise.reps}
                          onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                          placeholder="횟수"
                          style={{ padding: '8px' }}
                        />
                        <input
                          type="text"
                          value={exercise.weight || ''}
                          onChange={(e) => updateExercise(index, 'weight', e.target.value)}
                          placeholder="무게"
                          style={{ padding: '8px' }}
                        />
                        <button 
                          type="button"
                          onClick={() => removeExercise(index)}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: 'var(--danger)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                      <input
                        type="text"
                        value={exercise.notes || ''}
                        onChange={(e) => updateExercise(index, 'notes', e.target.value)}
                        placeholder="메모 (선택사항)"
                        style={{ padding: '8px', marginTop: 'var(--spacing-sm)', width: '100%' }}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label>기타 메모</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="기타 메모사항"
                    rows={2}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
                  <button 
                    type="button" 
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="btn btn-secondary"
                  >
                    취소
                  </button>
                  <button type="submit" className="btn btn-primary">
                    등록
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
