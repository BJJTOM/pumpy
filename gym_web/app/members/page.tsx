'use client'
import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'

type Member = {
  id: number
  first_name: string
  last_name: string
  full_name: string
  name?: string
  phone?: string
  email?: string
  status: string
  expire_date?: string
  days_until_expire?: number
  current_level?: string
  join_date: string
  total_attendance_days: number
  points: number
  current_plan?: any
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'attendance'>('date')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20 // 페이지당 20명씩 표시

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    try {
      const apiBase = getApiUrl()
      console.log('🔗 API 주소:', apiBase)
      
      const res = await axios.get<Member[]>(`${apiBase}/members/`, { 
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      console.log('✅ 회원 목록 로드 성공:', res.data.length, '명')
      
      // 데이터 안전하게 처리
      const safeMembers = res.data.map(member => ({
        ...member,
        full_name: member.full_name || `${member.last_name || ''}${member.first_name || ''}`,
        name: member.name || member.full_name || `${member.last_name || ''}${member.first_name || ''}`,
        phone: member.phone || '',
        email: member.email || '',
        status: member.status || 'pending',
        expire_date: member.expire_date || undefined,
        days_until_expire: member.days_until_expire !== undefined ? member.days_until_expire : undefined,
        current_level: member.current_level || '',
        join_date: member.join_date || '',
        total_attendance_days: member.total_attendance_days || 0,
        points: member.points || 0
      }))
      
      setMembers(safeMembers)
    } catch (err: any) {
      console.error('❌ 회원 목록 로드 실패:', err)
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      })
      
      if (err.code === 'ECONNABORTED') {
        alert('서버 응답 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.')
      } else if (err.response) {
        alert(`서버 오류: ${err.response.status}\n${JSON.stringify(err.response.data, null, 2)}`)
      } else if (err.request) {
        alert('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.\n\n백엔드 서버: http://localhost:8000')
      } else {
        alert('회원 목록을 불러오는데 실패했습니다.')
      }
      setMembers([]) // 빈 배열로 초기화
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    let result = members

    // 상태 필터
    if (statusFilter !== 'all') {
      result = result.filter(m => {
        if (statusFilter === 'active') return m.status === 'active' || m.status === '활성'
        if (statusFilter === 'pending') return m.status === 'pending' || m.status === '대기'
        if (statusFilter === 'paused') return m.status === 'paused' || m.status === '정지'
        if (statusFilter === 'cancelled') return m.status === 'cancelled' || m.status === '해지'
        return true
      })
    }

    // 검색 필터
    if (search) {
      const s = search.toLowerCase()
      result = result.filter(m =>
        m.full_name?.toLowerCase().includes(s) ||
        m.name?.toLowerCase().includes(s) ||
        m.first_name?.toLowerCase().includes(s) ||
        m.last_name?.toLowerCase().includes(s) ||
        m.phone?.includes(s) ||
        m.email?.toLowerCase().includes(s)
      )
    }

    // 정렬
    result = [...result].sort((a, b) => {
      if (sortBy === 'name') {
        return (a.full_name || a.name || '').localeCompare(b.full_name || b.name || '')
      } else if (sortBy === 'date') {
        return new Date(b.join_date).getTime() - new Date(a.join_date).getTime()
      } else if (sortBy === 'attendance') {
        return b.total_attendance_days - a.total_attendance_days
      }
      return 0
    })

    return result
  }, [members, search, statusFilter, sortBy])

  // 페이지네이션
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginatedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filtered.slice(startIndex, endIndex)
  }, [filtered, currentPage, itemsPerPage])

  // 검색이나 필터 변경 시 첫 페이지로
  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter, sortBy])

  const stats = useMemo(() => {
    const active = members.filter(m => m.status === 'active' || m.status === '활성').length
    const pending = members.filter(m => m.status === 'pending' || m.status === '대기').length
    const expiring = members.filter(m => m.days_until_expire !== undefined && m.days_until_expire >= 0 && m.days_until_expire <= 7).length
    return { active, pending, expiring }
  }, [members])

  const getStatusBadge = (status: string) => {
    const isActive = status === 'active' || status === '활성'
    const isPending = status === 'pending' || status === '대기'
    const isPaused = status === 'paused' || status === '정지'

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 12px',
        borderRadius: 'var(--radius-full)',
        fontSize: '13px',
        fontWeight: 600,
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
        <span>{isActive ? '✅' : isPending ? '⏰' : isPaused ? '⏸️' : '❌'}</span>
        <span>{isActive ? '활성' : isPending ? '대기' : isPaused ? '정지' : '해지'}</span>
      </span>
    )
  }

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
        <p style={{ color: 'var(--text-sub)', fontSize: '14px' }}>회원 목록을 불러오는 중...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* 헤더 */}
      <div style={{
        marginBottom: 'var(--spacing-3xl)',
        paddingBottom: 'var(--spacing-lg)',
        borderBottom: '2px solid var(--line)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-lg)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
              <div style={{ fontSize: '32px' }}>👥</div>
              <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 800, color: 'var(--text)' }}>
                회원 관리
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-sub)' }}>
              전체 <strong style={{ color: 'var(--pri)', fontWeight: 700 }}>{members.length}명</strong> • 
              활성 <strong style={{ color: 'var(--ok)', fontWeight: 700 }}>{stats.active}명</strong>
              {stats.pending > 0 && <> • 승인대기 <strong style={{ color: '#E67700', fontWeight: 700 }}>{stats.pending}명</strong></>}
              {stats.expiring > 0 && <> • 만료임박 <strong style={{ color: 'var(--danger)', fontWeight: 700 }}>{stats.expiring}명</strong></>}
            </p>
          </div>
          <a href="/members/new">
            <button className="btn btn-primary" style={{
              padding: '14px 28px',
              fontSize: '16px',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(49, 130, 246, 0.3)'
            }}>
              ➕ 회원 추가
            </button>
          </a>
        </div>
      </div>

      {/* 필터 & 정렬 */}
      <div className="card" style={{
        padding: 'var(--spacing-xl)',
        marginBottom: 'var(--spacing-2xl)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-md)',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="🔍 이름, 전화번호, 이메일 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: '15px' }}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ fontSize: '15px' }}
          >
            <option value="all">📊 전체 상태</option>
            <option value="active">✅ 활성</option>
            <option value="pending">⏰ 승인대기</option>
            <option value="paused">⏸️ 정지</option>
            <option value="cancelled">❌ 해지</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{ fontSize: '15px' }}
          >
            <option value="date">📅 최신순</option>
            <option value="name">🔤 이름순</option>
            <option value="attendance">📊 출석순</option>
          </select>
        </div>
      </div>

      {/* 결과 요약 */}
      <div style={{
        marginBottom: 'var(--spacing-lg)',
        padding: 'var(--spacing-md)',
        backgroundColor: 'var(--pill)',
        borderRadius: 'var(--radius)',
        fontSize: '14px',
        color: 'var(--text-sub)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>
          총 <strong style={{ color: 'var(--pri)' }}>{filtered.length}명</strong> 중 
          <strong style={{ color: 'var(--text)' }}> {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)}명</strong> 표시
        </span>
        <span>페이지 {currentPage} / {totalPages}</span>
      </div>

      {/* 회원 리스트 */}
      {filtered.length === 0 ? (
        <div className="card" style={{
          padding: 'var(--spacing-4xl)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: 'var(--spacing-lg)' }}>🔍</div>
          <h3 style={{ margin: '0 0 var(--spacing-sm) 0', fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>
            검색 결과가 없습니다
          </h3>
          <p style={{ margin: 0, color: 'var(--text-sub)', fontSize: '15px' }}>
            다른 검색어를 입력하거나 필터를 변경해보세요
          </p>
        </div>
      ) : (
        <>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* 테이블 헤더 (데스크톱만) */}
            <div className="desktop-only" style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 180px 120px 100px 100px 80px',
              gap: 'var(--spacing-md)',
              padding: 'var(--spacing-lg) var(--spacing-xl)',
              backgroundColor: 'var(--pill)',
              borderBottom: '2px solid var(--line)',
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--text-sub)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <div style={{ textAlign: 'center' }}>No.</div>
              <div>회원명</div>
              <div>연락처</div>
              <div>상태</div>
              <div>출석일수</div>
              <div>만료일</div>
              <div style={{ textAlign: 'center' }}>상세</div>
            </div>

            {/* 테이블 바디 */}
            <div>
              {paginatedMembers.map((member, index) => (
              <a
                key={member.id}
                href={`/members/${member.id}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div
                  className="member-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 180px 120px 100px 100px 80px',
                    gap: 'var(--spacing-md)',
                    padding: 'var(--spacing-lg) var(--spacing-xl)',
                    borderBottom: '1px solid var(--line)',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    backgroundColor: 'var(--card-bg)'
                  }}
                >
                  {/* 번호 */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--pri) 0%, var(--pri2) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'white',
                    margin: '0 auto'
                  }}>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </div>

                  {/* 회원명 */}
                  <div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: 'var(--text)',
                      marginBottom: '4px'
                    }}>
                      {member.full_name || member.name}
                    </div>
                    {member.current_level && (
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--text-sub)'
                      }}>
                        🥋 {member.current_level}
                      </div>
                    )}
                  </div>

                  {/* 연락처 */}
                  <div>
                    <div style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '2px' }}>
                      📱 {member.phone || '-'}
                    </div>
                    {member.email && (
                      <div style={{ fontSize: '12px', color: 'var(--text-sub)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        📧 {member.email}
                      </div>
                    )}
                  </div>

                  {/* 상태 */}
                  <div>
                    {getStatusBadge(member.status)}
                  </div>

                  {/* 출석일수 */}
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'var(--text)',
                    textAlign: 'center'
                  }}>
                    {member.total_attendance_days}일
                  </div>

                  {/* 만료일 */}
                  <div style={{ textAlign: 'center' }}>
                    {member.expire_date ? (
                      <>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: member.days_until_expire !== undefined && member.days_until_expire < 7 ? 'var(--danger)' : 'var(--text)'
                        }}>
                          {member.expire_date}
                        </div>
                        {member.days_until_expire !== undefined && member.days_until_expire >= 0 && (
                          <div style={{
                            fontSize: '11px',
                            color: member.days_until_expire < 7 ? 'var(--danger)' : 'var(--text-sub)',
                            fontWeight: 600
                          }}>
                            D-{member.days_until_expire}
                          </div>
                        )}
                      </>
                    ) : (
                      <span style={{ color: 'var(--text-disabled)' }}>-</span>
                    )}
                  </div>

                  {/* 상세보기 */}
                  <div style={{
                    fontSize: '20px',
                    textAlign: 'center',
                    color: 'var(--pri)'
                  }}>
                    →
                  </div>
                </div>

                {/* 모바일 카드 뷰 */}
                <div className="mobile-only" style={{
                  padding: 'var(--spacing-lg)',
                  borderBottom: '1px solid var(--line)',
                  backgroundColor: 'var(--card-bg)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--pri) 0%, var(--pri2) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: 'white'
                      }}>
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </div>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginBottom: '2px' }}>
                          {member.full_name || member.name}
                        </div>
                        {member.current_level && (
                          <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
                            🥋 {member.current_level}
                          </div>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(member.status)}
                  </div>

                  <div style={{ display: 'grid', gap: 'var(--spacing-sm)', fontSize: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-sub)' }}>📱 연락처</span>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>{member.phone || '-'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-sub)' }}>📊 출석</span>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>{member.total_attendance_days}일</span>
                    </div>
                    {member.expire_date && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-sub)' }}>📅 만료일</span>
                        <span style={{
                          fontWeight: 600,
                          color: member.days_until_expire !== undefined && member.days_until_expire < 7 ? 'var(--danger)' : 'var(--text)'
                        }}>
                          {member.expire_date}
                          {member.days_until_expire !== undefined && member.days_until_expire >= 0 && (
                            <span style={{ marginLeft: '4px' }}>(D-{member.days_until_expire})</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              padding: 'var(--spacing-xl)',
              borderTop: '1px solid var(--line)'
            }}>
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="btn btn-secondary"
                style={{
                  padding: '10px 16px',
                  fontSize: '14px',
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                « 처음
              </button>
              
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary"
                style={{
                  padding: '10px 16px',
                  fontSize: '14px',
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                ‹ 이전
              </button>
              
              <div style={{
                padding: '10px 20px',
                backgroundColor: 'var(--pill)',
                borderRadius: 'var(--radius)',
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--text)'
              }}>
                {currentPage} / {totalPages}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-secondary"
                style={{
                  padding: '10px 16px',
                  fontSize: '14px',
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                다음 ›
              </button>
              
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="btn btn-secondary"
                style={{
                  padding: '10px 16px',
                  fontSize: '14px',
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                마지막 »
              </button>
            </div>
          )}
        </div>
        </>
      )}

      <style jsx>{`
        .member-row:hover {
          background-color: var(--bg2) !important;
          transform: translateX(4px);
        }

        .desktop-only {
          display: grid;
        }

        .mobile-only {
          display: none;
        }

        @media (max-width: 1024px) {
          .desktop-only {
            display: none !important;
          }

          .mobile-only {
            display: block !important;
          }

          .member-row {
            display: none !important;
          }
        }

        @media (max-width: 768px) {
          h1 {
            font-size: 24px !important;
          }
        }
      `}</style>
    </div>
  )
}
