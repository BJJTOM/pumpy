'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import TermsModal from '../../components/TermsModal'
import { getApiUrl } from '@/lib/api'
import BottomNav from '../components/BottomNav'

export default function ProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [member, setMember] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [bodyStats, setBodyStats] = useState({ weight: 70, muscle: 35, fat: 15, height: 175 })
  const [isEditingBody, setIsEditingBody] = useState(false)
  const [tempBodyStats, setTempBodyStats] = useState(bodyStats)
  const [modalOpen, setModalOpen] = useState<'terms' | 'privacy' | 'marketing' | null>(null)

  useEffect(() => {
    // 로그인 확인
    const currentUser = localStorage.getItem('currentUser')
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    loadMember()
  }, [])

  const loadMember = async () => {
    try {
      const apiBase = getApiUrl()

      const res = await axios.get(`${apiBase}/members/`)
      if (res.data.length > 0) {
        const user = res.data[0]
        setMember(user)

        // 로컬스토리지에서 사진 로드
        const savedPhoto = localStorage.getItem(`user_photo_${user.id}`)
        if (savedPhoto) {
          setSelectedPhoto(savedPhoto)
        }

        // 로컬스토리지에서 신체 정보 로드
        const savedBodyStats = localStorage.getItem(`body_stats_${user.id}`)
        if (savedBodyStats) {
          const stats = JSON.parse(savedBodyStats)
          setBodyStats(stats)
          setTempBodyStats(stats)
        }
      }
      setLoading(false)
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하로 업로드해주세요.')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setSelectedPhoto(base64)
        if (member) {
          localStorage.setItem(`user_photo_${member.id}`, base64)
          alert('✅ 사진이 업로드되었습니다!\nAI 캐릭터가 생성되었습니다.')
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveBodyStats = () => {
    setBodyStats(tempBodyStats)
    if (member) {
      localStorage.setItem(`body_stats_${member.id}`, JSON.stringify(tempBodyStats))
    }
    setIsEditingBody(false)
    alert('✅ 신체 정보가 저장되었습니다!')
  }

  const calculateBMI = () => {
    const heightM = bodyStats.height / 100
    return (bodyStats.weight / (heightM * heightM)).toFixed(1)
  }

  const getBMIStatus = () => {
    const bmi = parseFloat(calculateBMI())
    if (bmi < 18.5) return { text: '저체중', color: '#51cf66' }
    if (bmi < 23) return { text: '정상', color: '#667eea' }
    if (bmi < 25) return { text: '과체중', color: '#ffa94d' }
    return { text: '비만', color: '#ff6b6b' }
  }

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
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  const daysLeft = member?.expire_date 
    ? Math.ceil((new Date(member.expire_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const bmiStatus = getBMIStatus()

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      paddingBottom: '100px'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 20px 80px',
        color: 'white',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <button
            onClick={() => router.push('/app')}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '5px'
            }}
          >
            ←
          </button>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>내 정보</h1>
          <button
            onClick={() => router.push('/app/settings')}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '5px'
            }}
          >
            ⚙️
          </button>
        </div>

        {/* 프로필 카드 */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: '25px',
          padding: '25px',
          backdropFilter: 'blur(10px)',
          textAlign: 'center'
        }}>
          {/* 프로필 사진 */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: selectedPhoto ? `url(${selectedPhoto})` : 'rgba(255,255,255,0.3)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '5px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                cursor: 'pointer',
                margin: '0 auto',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {!selectedPhoto && (
                <span style={{ fontSize: '56px' }}>
                  {(member?.full_name || member?.name || '?').charAt(0)}
                </span>
              )}
              {selectedPhoto && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
                  mixBlendMode: 'overlay'
                }} />
              )}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
              >
                <div style={{
                  background: 'rgba(0,0,0,0.6)',
                  borderRadius: '50%',
                  padding: '10px',
                  fontSize: '24px'
                }}>
                  📷
                </div>
              </div>
            </div>
            <div style={{
              position: 'absolute',
              bottom: 5,
              right: 'calc(50% - 60px)',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid white',
              cursor: 'pointer',
              fontSize: '18px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
              ✨
            </div>
          </div>

          <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 900 }}>
            {member?.full_name || member?.name || '회원'}
          </h2>
          <p style={{ margin: '0 0 15px 0', fontSize: '15px', opacity: 0.9 }}>
            {member?.phone || '-'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {member?.status && (
              <span style={{
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.25)',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 700
              }}>
                ✅ {member.status === 'active' || member.status === '활성' ? '활성' : member.status}
              </span>
            )}
            {member?.current_level && (
              <span style={{
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.25)',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 700
              }}>
                🥋 {member.current_level}
              </span>
            )}
            {daysLeft > 0 && (
              <span style={{
                padding: '8px 16px',
                background: daysLeft < 7 ? 'rgba(255, 107, 107, 0.3)' : 'rgba(255,255,255,0.25)',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 700
              }}>
                ⏰ D-{daysLeft}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 신체 정보 카드 */}
      <div style={{
        margin: '-50px 20px 20px',
        backgroundColor: 'white',
        borderRadius: '25px',
        padding: '30px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#333' }}>
            💪 신체 정보
          </h3>
          <button
            onClick={() => {
              if (isEditingBody) {
                handleSaveBodyStats()
              } else {
                setIsEditingBody(true)
              }
            }}
            style={{
              padding: '10px 20px',
              borderRadius: '20px',
              border: 'none',
              background: isEditingBody ? 'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
          >
            {isEditingBody ? '✅ 저장' : '✏️ 수정'}
          </button>
        </div>

        {/* BMI 카드 */}
        <div style={{
          padding: '20px',
          background: `linear-gradient(135deg, ${bmiStatus.color}15 0%, ${bmiStatus.color}05 100%)`,
          borderRadius: '20px',
          marginBottom: '20px',
          textAlign: 'center',
          border: `2px solid ${bmiStatus.color}20`
        }}>
          <div style={{ fontSize: '14px', color: '#999', marginBottom: '8px', fontWeight: 600 }}>BMI 지수</div>
          <div style={{ fontSize: '36px', fontWeight: 900, color: bmiStatus.color, marginBottom: '8px' }}>
            {calculateBMI()}
          </div>
          <div style={{
            display: 'inline-block',
            padding: '6px 16px',
            background: bmiStatus.color,
            color: 'white',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 700
          }}>
            {bmiStatus.text}
          </div>
        </div>

        {/* 신체 정보 그리드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '15px'
        }}>
          <BodyStatCard
            icon="📏"
            label="키"
            value={isEditingBody ? tempBodyStats.height : bodyStats.height}
            unit="cm"
            color="#667eea"
            isEditing={isEditingBody}
            onChange={(val) => setTempBodyStats({ ...tempBodyStats, height: val })}
          />
          <BodyStatCard
            icon="⚖️"
            label="체중"
            value={isEditingBody ? tempBodyStats.weight : bodyStats.weight}
            unit="kg"
            color="#f093fb"
            isEditing={isEditingBody}
            onChange={(val) => setTempBodyStats({ ...tempBodyStats, weight: val })}
          />
          <BodyStatCard
            icon="💪"
            label="근육량"
            value={isEditingBody ? tempBodyStats.muscle : bodyStats.muscle}
            unit="kg"
            color="#f5576c"
            isEditing={isEditingBody}
            onChange={(val) => setTempBodyStats({ ...tempBodyStats, muscle: val })}
          />
          <BodyStatCard
            icon="📊"
            label="체지방률"
            value={isEditingBody ? tempBodyStats.fat : bodyStats.fat}
            unit="%"
            color="#fcb69f"
            isEditing={isEditingBody}
            onChange={(val) => setTempBodyStats({ ...tempBodyStats, fat: val })}
          />
        </div>

        {isEditingBody && (
          <button
            onClick={() => {
              setTempBodyStats(bodyStats)
              setIsEditingBody(false)
            }}
            style={{
              width: '100%',
              padding: '14px',
              marginTop: '15px',
              borderRadius: '15px',
              border: '1px solid #ddd',
              background: 'white',
              color: '#999',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            취소
          </button>
        )}
      </div>

      {/* 회원 정보 카드 */}
      <div style={{
        margin: '0 20px 20px',
        backgroundColor: 'white',
        borderRadius: '25px',
        padding: '30px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '22px', fontWeight: 800, color: '#333' }}>
          📋 회원 정보
        </h3>
        <div style={{ display: 'grid', gap: '15px' }}>
          <InfoRow label="📧 이메일" value={member?.email || '-'} />
          <InfoRow label="📅 가입일" value={member?.join_date || '-'} />
          <InfoRow label="⏰ 만료일" value={member?.expire_date || '-'} />
          <InfoRow label="📊 총 출석" value={`${member?.total_attendance_days || 0}일`} />
          <InfoRow label="⭐ 포인트" value={`${member?.points?.toLocaleString() || 0}P`} />
        </div>
      </div>

      {/* 약관 카드 */}
      <div style={{
        margin: '0 20px 20px',
        backgroundColor: 'white',
        borderRadius: '25px',
        padding: '30px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '22px', fontWeight: 800, color: '#333' }}>
          📄 약관 및 정책
        </h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          <TermsButton label="이용약관" onClick={() => setModalOpen('terms')} />
          <TermsButton label="개인정보처리방침" onClick={() => setModalOpen('privacy')} />
          <TermsButton label="마케팅 수신 동의" onClick={() => setModalOpen('marketing')} />
        </div>
      </div>

      {/* 로그아웃 버튼 */}
      <div style={{
        margin: '0 20px 100px',
        padding: '0'
      }}>
        <button
          onClick={() => {
            if (confirm('로그아웃 하시겠습니까?')) {
              localStorage.removeItem('currentUser')
              localStorage.removeItem('userEmail')
              router.push('/auth/login')
            }
          }}
          style={{
            width: '100%',
            padding: '18px',
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
            border: 'none',
            borderRadius: '15px',
            color: 'white',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)'
          }}
        >
          🚪 로그아웃
        </button>
      </div>

      {/* Bottom Nav - 공통 컴포넌트 사용 */}
      <BottomNav />

      {/* 약관 모달 */}
      {modalOpen && (
        <TermsModal
          isOpen={true}
          type={modalOpen}
          onClose={() => setModalOpen(null)}
        />
      )}
    </div>
  )
}

// 신체 정보 카드 컴포넌트
function BodyStatCard({ icon, label, value, unit, color, isEditing, onChange }: {
  icon: string;
  label: string;
  value: number;
  unit: string;
  color: string;
  isEditing: boolean;
  onChange: (val: number) => void;
}) {
  return (
    <div style={{
      padding: '20px',
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      borderRadius: '15px',
      textAlign: 'center',
      border: `1px solid ${color}20`
    }}>
      <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
      {isEditing ? (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          style={{
            width: '100%',
            fontSize: '24px',
            fontWeight: 800,
            color: color,
            textAlign: 'center',
            border: `2px solid ${color}`,
            borderRadius: '10px',
            padding: '8px',
            marginBottom: '8px'
          }}
        />
      ) : (
        <div style={{ fontSize: '24px', fontWeight: 800, color: color, marginBottom: '5px' }}>
          {value}{unit}
        </div>
      )}
      <div style={{ fontSize: '12px', color: '#999', fontWeight: 600 }}>{label}</div>
    </div>
  )
}

// 정보 행 컴포넌트
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px',
      background: '#f8f9fa',
      borderRadius: '12px'
    }}>
      <span style={{ fontSize: '15px', color: '#666', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: '15px', color: '#333', fontWeight: 700 }}>{value}</span>
    </div>
  )
}

// 약관 버튼 컴포넌트
function TermsButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '16px',
        background: '#f8f9fa',
        border: 'none',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: 600,
        color: '#333',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = '#e9ecef'}
      onMouseLeave={(e) => e.currentTarget.style.background = '#f8f9fa'}
    >
      <span>{label}</span>
      <span style={{ color: '#999' }}>→</span>
    </button>
  )
}
