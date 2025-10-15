'use client'
import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'

export default function MemberDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [member, setMember] = useState<any>(null)
  const [attendance, setAttendance] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'attendance' | 'subscriptions' | 'notes'>('info')
  const [newNote, setNewNote] = useState('')
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)

  useEffect(() => {
    if (params.id) {
      loadAllData()
    }
  }, [params.id])

  const loadAllData = () => {
    const apiBase = getApiUrl()

    Promise.all([
      axios.get(`${apiBase}/members/${params.id}/`),
      axios.get(`${apiBase}/attendance/?member_id=${params.id}`),
      axios.get(`${apiBase}/subscriptions/?member_id=${params.id}`),
      axios.get(`${apiBase}/member-notes/?member_id=${params.id}`),
      axios.get(`${apiBase}/plans/`)
    ]).then(([memberRes, attendanceRes, subsRes, notesRes, plansRes]) => {
      console.log('회원 상세:', memberRes.data)
      setMember(memberRes.data)
      setAttendance(attendanceRes.data || [])
      setSubscriptions(subsRes.data || [])
      setNotes(notesRes.data || [])
      setPlans(plansRes.data || [])
    }).catch(err => {
      console.error('데이터 로드 실패:', err)
      alert('데이터를 불러오는데 실패했습니다.')
    }).finally(() => {
      setLoading(false)
    })
  }

  const handleStatusChange = (newStatus: string) => {
    const apiBase = getApiUrl()

    axios.patch(`${apiBase}/members/${params.id}/`, { status: newStatus })
      .then(() => {
        alert('✅ 상태가 변경되었습니다')
        loadAllData()
      })
      .catch(err => alert('❌ 상태 변경 실패'))
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return

    const apiBase = getApiUrl()
    
    axios.post(`${apiBase}/member-notes/`, {
      member: params.id,
      content: newNote,
      note_type: '일반',
      author: '관리자'
    }).then(() => {
      setNewNote('')
      loadAllData()
      alert('✅ 메모가 추가되었습니다')
    }).catch(err => alert('❌ 메모 추가 실패'))
  }

  const handleCheckIn = () => {
    const apiBase = getApiUrl()

    axios.post(`${apiBase}/attendance/`, {
      member: params.id,
      check_in_time: new Date().toISOString(),
      status: '출석'
    }).then(() => {
      alert('✅ 출석 체크 완료!')
      loadAllData()
    }).catch(err => alert('❌ 출석 체크 실패'))
  }

  const handlePurchasePlan = (planId: number) => {
    const plan = plans.find(p => p.id === planId)
    if (!plan) return

    const apiBase = getApiUrl()

    const today = new Date()
    const endDate = new Date(today)
    if (plan.duration_months) {
      endDate.setMonth(endDate.getMonth() + plan.duration_months)
    } else if (plan.duration_days) {
      endDate.setDate(endDate.getDate() + plan.duration_days)
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }

    axios.post(`${apiBase}/subscriptions/`, {
      member: Number(params.id),
      plan: planId,
      start_date: today.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      amount_paid: plan.price,
      is_active: true
    }).then(() => {
      // 회원의 만료일 업데이트
      axios.patch(`${apiBase}/members/${params.id}/`, {
        current_plan: planId,
        expire_date: endDate.toISOString().split('T')[0]
      })
      alert(`✅ ${plan.name} 구매 완료!`)
      setShowPurchaseModal(false)
      loadAllData()
    }).catch(err => {
      console.error(err)
      alert('❌ 구매 실패')
    })
  }

  const getStatusBadge = (status: string) => {
    const isActive = status === 'active' || status === '활성'
    const isPending = status === 'pending' || status === '대기'
    const isPaused = status === 'paused' || status === '정지'

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        borderRadius: 'var(--radius-full)',
        fontSize: '14px',
        fontWeight: 700,
        backgroundColor: 
          isActive ? 'rgba(0, 217, 165, 0.1)' :
          isPending ? 'rgba(255, 210, 51, 0.1)' :
          isPaused ? 'rgba(255, 82, 71, 0.1)' :
          'rgba(100, 100, 100, 0.1)',
        color:
          isActive ? 'var(--ok)' :
          isPending ? '#E67700' :
          isPaused ? 'var(--danger)' :
          'var(--text-sub)'
      }}>
        <span style={{ fontSize: '16px' }}>{isActive ? '✅' : isPending ? '⏰' : isPaused ? '⏸️' : '❌'}</span>
        <span>{isActive ? '활성' : isPending ? '대기' : isPaused ? '정지' : '해지'}</span>
      </span>
    )
  }

  const stats = useMemo(() => {
    const recentAttendance = attendance.filter(a => {
      const date = new Date(a.date || a.check_in_time)
      const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays <= 30
    }).length

    const activeSubscription = subscriptions.find(s => s.is_active || s.status === '활성')
    const totalSpent = subscriptions.reduce((sum, s) => sum + (parseFloat(s.amount_paid) || 0), 0)

    return { recentAttendance, activeSubscription, totalSpent }
  }, [attendance, subscriptions])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid var(--line)',
          borderTop: '4px solid var(--pri)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: 'var(--text-sub)', fontSize: '14px' }}>회원 정보를 불러오는 중...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="card" style={{ padding: 'var(--spacing-4xl)', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: 'var(--spacing-lg)' }}>😞</div>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>
          회원을 찾을 수 없습니다
        </h3>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 'var(--spacing-3xl)' }}>
        <button
          onClick={() => router.push('/members')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-sub)',
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: 'var(--spacing-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          ← 회원 목록으로
        </button>

        <div className="card" style={{
          padding: 'var(--spacing-3xl)',
          background: 'linear-gradient(135deg, var(--pri-light) 0%, rgba(49, 130, 246, 0.05) 100%)',
          border: '2px solid var(--line)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-2xl)' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-xl)', alignItems: 'center' }}>
              {/* 프로필 아바타 */}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--pri) 0%, var(--pri2) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                color: 'white',
                fontWeight: 800,
                boxShadow: '0 8px 24px rgba(49, 130, 246, 0.4)'
              }}>
                {(member.full_name || member.name || '?').charAt(0)}
              </div>

              {/* 회원 정보 */}
              <div>
                <h1 style={{ margin: '0 0 var(--spacing-sm) 0', fontSize: '32px', fontWeight: 800, color: 'var(--text)' }}>
                  {member.full_name || member.name}
                </h1>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'center' }}>
                  {getStatusBadge(member.status)}
                  {member.current_level && (
                    <span style={{
                      padding: '6px 12px',
                      background: 'var(--pill)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--text)'
                    }}>
                      🥋 {member.current_level}
                    </span>
                  )}
                  {member.days_until_expire !== undefined && member.days_until_expire >= 0 && (
                    <span style={{
                      padding: '6px 12px',
                      background: member.days_until_expire < 7 ? 'rgba(255, 82, 71, 0.1)' : 'var(--pill)',
                      color: member.days_until_expire < 7 ? 'var(--danger)' : 'var(--text)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '13px',
                      fontWeight: 700
                    }}>
                      ⏰ D-{member.days_until_expire}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 빠른 액션 버튼 */}
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
              <button
                onClick={handleCheckIn}
                className="btn"
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, var(--ok) 0%, #00C896 100%)',
                  color: 'white',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0, 217, 165, 0.3)',
                  fontWeight: 700
                }}
              >
                ✅ 출석 체크
              </button>
              <button
                onClick={() => setShowPurchaseModal(true)}
                className="btn btn-primary"
                style={{ padding: '12px 24px', fontWeight: 700 }}
              >
                🎫 회원권 구매
              </button>
              <select
                onChange={(e) => e.target.value && handleStatusChange(e.target.value)}
                style={{
                  padding: '12px 20px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--line)',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                defaultValue=""
              >
                <option value="">상태 변경</option>
                <option value="active">✅ 활성</option>
                <option value="paused">⏸️ 정지</option>
                <option value="cancelled">❌ 해지</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* KPI 카드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-3xl)'
      }}>
        <div className="card" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: 'var(--spacing-sm)' }}>📊</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>
            {member.total_attendance_days || 0}일
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-sub)', fontWeight: 600 }}>총 출석일수</div>
        </div>

        <div className="card" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: 'var(--spacing-sm)' }}>📅</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>
            {stats.recentAttendance}일
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-sub)', fontWeight: 600 }}>최근 30일 출석</div>
        </div>

        <div className="card" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: 'var(--spacing-sm)' }}>💰</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--pri)', marginBottom: '4px' }}>
            ₩{Math.floor(stats.totalSpent / 10000).toLocaleString()}만
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-sub)', fontWeight: 600 }}>총 결제금액</div>
        </div>

        <div className="card" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: 'var(--spacing-sm)' }}>⭐</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#FFB800', marginBottom: '4px' }}>
            {member.points?.toLocaleString() || 0}P
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-sub)', fontWeight: 600 }}>적립 포인트</div>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div style={{
        display: 'flex',
        gap: 'var(--spacing-sm)',
        marginBottom: 'var(--spacing-xl)',
        borderBottom: '2px solid var(--line)',
        overflowX: 'auto'
      }}>
        {[
          { key: 'info', label: '📋 기본정보', icon: '📋' },
          { key: 'attendance', label: '📊 출석현황', icon: '📊' },
          { key: 'subscriptions', label: '🎫 회원권', icon: '🎫' },
          { key: 'notes', label: '📝 메모', icon: '📝' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '16px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key ? '3px solid var(--pri)' : '3px solid transparent',
              color: activeTab === tab.key ? 'var(--pri)' : 'var(--text-sub)',
              fontWeight: activeTab === tab.key ? 700 : 600,
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div>
        {activeTab === 'info' && (
          <div style={{ display: 'grid', gap: 'var(--spacing-xl)' }}>
            <div className="card" style={{ padding: 'var(--spacing-3xl)' }}>
              <h3 style={{
                margin: '0 0 var(--spacing-xl) 0',
                fontSize: '20px',
                fontWeight: 700,
                color: 'var(--text)',
                paddingBottom: 'var(--spacing-md)',
                borderBottom: '2px solid var(--line)'
              }}>
                📋 회원 상세정보
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 'var(--spacing-xl)'
              }}>
                <InfoItem label="📱 전화번호" value={member.phone || '-'} />
                <InfoItem label="📧 이메일" value={member.email || '-'} />
                <InfoItem label="📅 가입일" value={member.join_date || '-'} />
                <InfoItem label="🎂 생년월일" value={member.birth_date || '-'} />
                <InfoItem label="⚧ 성별" value={member.gender || '-'} />
                <InfoItem label="📍 주소" value={member.address || '-'} />
                <InfoItem label="🎫 현재 회원권" value={stats.activeSubscription?.plan_name || '-'} />
                <InfoItem label="⏰ 만료일" value={member.expire_date || '-'} />
                <InfoItem label="🆘 긴급연락처" value={member.emergency_contact || '-'} />
              </div>

              {member.notes && (
                <div style={{
                  marginTop: 'var(--spacing-xl)',
                  padding: 'var(--spacing-xl)',
                  background: 'var(--bg2)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--line)'
                }}>
                  <div style={{ fontWeight: 700, marginBottom: 'var(--spacing-sm)', color: 'var(--text)' }}>
                    📝 특이사항
                  </div>
                  <div style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--text-sub)', whiteSpace: 'pre-wrap' }}>
                    {member.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="card" style={{ padding: 'var(--spacing-3xl)' }}>
            <h3 style={{
              margin: '0 0 var(--spacing-xl) 0',
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--text)',
              paddingBottom: 'var(--spacing-md)',
              borderBottom: '2px solid var(--line)'
            }}>
              📊 출석 기록 ({attendance.length}건)
            </h3>
            {attendance.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--spacing-4xl)', color: 'var(--text-sub)' }}>
                <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-lg)' }}>📅</div>
                <p>출석 기록이 없습니다</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                {attendance.slice(0, 20).map((record, index) => (
                  <div
                    key={index}
                    style={{
                      padding: 'var(--spacing-lg)',
                      background: 'var(--bg2)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--line)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
                        {record.date || new Date(record.check_in_time).toLocaleDateString('ko-KR')}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-sub)' }}>
                        {record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString('ko-KR') : '-'}
                      </div>
                    </div>
                    <span className="badge success">✅ 출석</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="card" style={{ padding: 'var(--spacing-3xl)' }}>
            <h3 style={{
              margin: '0 0 var(--spacing-xl) 0',
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--text)',
              paddingBottom: 'var(--spacing-md)',
              borderBottom: '2px solid var(--line)'
            }}>
              🎫 회원권 구매 이력 ({subscriptions.length}건)
            </h3>
            {subscriptions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--spacing-4xl)', color: 'var(--text-sub)' }}>
                <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-lg)' }}>🎫</div>
                <p>구매 이력이 없습니다</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
                {subscriptions.map((sub, index) => (
                  <div
                    key={index}
                    className="card"
                    style={{
                      padding: 'var(--spacing-xl)',
                      border: '2px solid var(--line)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                      <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
                        {sub.plan_name || '회원권'}
                      </h4>
                      <span className={`badge ${sub.is_active || sub.status === '활성' ? 'success' : ''}`}>
                        {sub.is_active || sub.status === '활성' ? '✅ 활성' : '⏸️ 종료'}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--spacing-md)', fontSize: '14px' }}>
                      <div>
                        <div style={{ color: 'var(--text-sub)', marginBottom: '4px' }}>시작일</div>
                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{sub.start_date}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-sub)', marginBottom: '4px' }}>종료일</div>
                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{sub.end_date}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-sub)', marginBottom: '4px' }}>결제금액</div>
                        <div style={{ fontWeight: 700, color: 'var(--pri)', fontSize: '16px' }}>
                          ₩{parseFloat(sub.amount_paid).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="card" style={{ padding: 'var(--spacing-3xl)' }}>
            <h3 style={{
              margin: '0 0 var(--spacing-xl) 0',
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--text)',
              paddingBottom: 'var(--spacing-md)',
              borderBottom: '2px solid var(--line)'
            }}>
              📝 메모 ({notes.length}건)
            </h3>

            {/* 메모 작성 */}
            <div style={{
              padding: 'var(--spacing-xl)',
              background: 'var(--bg2)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--line)',
              marginBottom: 'var(--spacing-xl)'
            }}>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="새 메모를 작성하세요..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: 'var(--spacing-md)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '15px',
                  resize: 'vertical',
                  marginBottom: 'var(--spacing-md)'
                }}
              />
              <button
                onClick={handleAddNote}
                className="btn btn-primary"
                style={{ fontWeight: 700 }}
              >
                ✅ 메모 추가
              </button>
            </div>

            {/* 메모 목록 */}
            {notes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--spacing-4xl)', color: 'var(--text-sub)' }}>
                <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-lg)' }}>📝</div>
                <p>메모가 없습니다</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                {notes.map((note, index) => (
                  <div
                    key={index}
                    style={{
                      padding: 'var(--spacing-lg)',
                      background: 'var(--bg2)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--line)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--pri)' }}>
                        {note.author || '관리자'}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-disabled)' }}>
                        {note.created_at ? new Date(note.created_at).toLocaleDateString('ko-KR') : '-'}
                      </span>
                    </div>
                    <div style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                      {note.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 회원권 구매 모달 */}
      {showPurchaseModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowPurchaseModal(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              padding: 'var(--spacing-3xl)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              margin: '0 0 var(--spacing-xl) 0',
              fontSize: '24px',
              fontWeight: 800,
              color: 'var(--text)'
            }}>
              🎫 회원권 구매
            </h3>

            <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
              {plans.map(plan => (
                <div
                  key={plan.id}
                  className="card"
                  style={{
                    padding: 'var(--spacing-xl)',
                    border: selectedPlan?.id === plan.id ? '2px solid var(--pri)' : '1px solid var(--line)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
                        {plan.name}
                      </h4>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-sub)' }}>
                        {plan.duration_months ? `${plan.duration_months}개월` : plan.duration_days ? `${plan.duration_days}일` : '기간 미정'}
                      </p>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--pri)' }}>
                      ₩{parseFloat(plan.price).toLocaleString()}
                    </div>
                  </div>
                  {plan.description && (
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                      {plan.description}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-2xl)' }}>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="btn btn-secondary"
                style={{ flex: 1, fontWeight: 700 }}
              >
                취소
              </button>
              <button
                onClick={() => selectedPlan && handlePurchasePlan(selectedPlan.id)}
                className="btn btn-primary"
                style={{ flex: 1, fontWeight: 700 }}
                disabled={!selectedPlan}
              >
                {selectedPlan ? `₩${parseFloat(selectedPlan.price).toLocaleString()} 결제` : '회원권 선택'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          h1 {
            font-size: 24px !important;
          }
        }
      `}</style>
    </div>
  )
}

// 정보 아이템 컴포넌트
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{
        fontSize: '13px',
        color: 'var(--text-sub)',
        marginBottom: '8px',
        fontWeight: 600
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '16px',
        fontWeight: 700,
        color: 'var(--text)',
        wordBreak: 'break-all'
      }}>
        {value}
      </div>
    </div>
  )
}
