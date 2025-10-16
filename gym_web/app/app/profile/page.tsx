'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getApiUrl } from '@/lib/api'
import BottomNav from '../components/BottomNav'

export default function ProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [member, setMember] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [aiPhoto, setAiPhoto] = useState<string | null>(null)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [bodyStats, setBodyStats] = useState({ weight: 70, muscle: 35, fat: 15, height: 175 })
  const [isEditingBody, setIsEditingBody] = useState(false)
  const [tempBodyStats, setTempBodyStats] = useState(bodyStats)

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser')
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    loadMember()
  }, [])

  const loadMember = async () => {
    try {
      const userStr = localStorage.getItem('currentUser')
      if (!userStr) return

      const user = JSON.parse(userStr)
      setMember(user)

      const savedPhoto = localStorage.getItem(`user_photo_${user.id}`)
      if (savedPhoto) setSelectedPhoto(savedPhoto)

      const savedAiPhoto = localStorage.getItem(`ai_photo_${user.id}`)
      if (savedAiPhoto) setAiPhoto(savedAiPhoto)

      const savedBodyStats = localStorage.getItem(`body_stats_${user.id}`)
      if (savedBodyStats) {
        const stats = JSON.parse(savedBodyStats)
        setBodyStats(stats)
        setTempBodyStats(stats)
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
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const generateAICharacter = () => {
    if (!selectedPhoto) {
      alert('먼저 사진을 업로드해주세요!')
      return
    }

    setIsGeneratingAI(true)

    // AI 변환 시뮬레이션 (3초 대기 + 진행률 표시)
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      if (progress >= 100) {
        clearInterval(interval)
      }
    }, 300)

    setTimeout(() => {
      // 실제로는 AI API를 호출하여 이미지 변환
      // 지금은 CSS 필터 + 효과로 시뮬레이션
      setAiPhoto(selectedPhoto)
      if (member) {
        localStorage.setItem(`ai_photo_${member.id}`, selectedPhoto)
      }
      setIsGeneratingAI(false)
      alert('✨ AI 운동 캐릭터가 생성되었습니다!\n홈 화면에서 확인해보세요! 🎨')
    }, 3000)
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

  const handleDeleteAICharacter = () => {
    if (confirm('AI 캐릭터를 삭제하시겠습니까?')) {
      setAiPhoto(null)
      if (member) {
        localStorage.removeItem(`ai_photo_${member.id}`)
      }
      alert('✅ AI 캐릭터가 삭제되었습니다!')
    }
  }

  const handleEditAICharacter = () => {
    if (confirm('새로운 AI 캐릭터를 생성하시겠습니까?\n현재 캐릭터는 삭제됩니다.')) {
      setAiPhoto(null)
      if (member) {
        localStorage.removeItem(`ai_photo_${member.id}`)
      }
      alert('✅ 새로운 사진을 업로드해주세요!')
      fileInputRef.current?.click()
    }
  }

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      localStorage.removeItem('currentUser')
      localStorage.removeItem('userToken')
      localStorage.removeItem('userEmail')
      router.push('/auth/login')
    }
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
          <p style={{ fontSize: '18px', fontWeight: 600 }}>로딩 중...</p>
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

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      paddingBottom: '100px'
    }}>
      {/* Header */}
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
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800 }}>
            내 프로필
          </h1>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              borderRadius: '20px',
              border: 'none',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              backdropFilter: 'blur(10px)'
            }}
          >
            로그아웃
          </button>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {/* AI Character Creation Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '25px',
          padding: '30px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: 800, color: '#333' }}>
            🤖 AI 운동 캐릭터 만들기
          </h3>
          <p style={{ margin: '0 0 25px 0', fontSize: '14px', color: '#999' }}>
            사진을 업로드하고 AI가 생성한 나만의 운동 캐릭터를 만들어보세요!
          </p>

          {/* Photo Upload Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: aiPhoto ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
            gap: '15px',
            marginBottom: '20px'
          }}>
            {/* Original Photo */}
            <div>
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px', fontWeight: 600 }}>
                📸 원본 사진
              </div>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%',
                  height: '200px',
                  borderRadius: '15px',
                  background: selectedPhoto ? `url(${selectedPhoto})` : 'linear-gradient(135deg, #e0e7ff 0%, #e9d5ff 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  cursor: 'pointer',
                  border: '2px dashed #cbd5e1',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {!selectedPhoto && (
                  <>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>📷</div>
                    <div style={{ fontSize: '13px', color: '#999', fontWeight: 600 }}>클릭하여 업로드</div>
                  </>
                )}
                {selectedPhoto && (
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '10px',
                    right: '10px',
                    padding: '8px',
                    background: 'rgba(0,0,0,0.7)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '11px',
                    textAlign: 'center'
                  }}>
                    다시 업로드
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
            </div>

            {/* Arrow or Processing */}
            {!aiPhoto && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: '#cbd5e1'
              }}>
                {isGeneratingAI ? (
                  <div style={{
                    textAlign: 'center',
                    width: '100%'
                  }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      border: '5px solid #e0e7ff',
                      borderTop: '5px solid #667eea',
                      borderRadius: '50%',
                      margin: '0 auto 15px',
                      animation: 'spin 1s linear infinite'
                    }} />
                    <div style={{ fontSize: '14px', color: '#667eea', fontWeight: 700 }}>
                      AI 생성 중...
                    </div>
                    <style jsx>{`
                      @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                      }
                    `}</style>
                  </div>
                ) : '→'}
              </div>
            )}

            {/* AI Photo */}
            {aiPhoto && (
              <div>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px', fontWeight: 600 }}>
                  ✨ AI 캐릭터
                </div>
                <div style={{
                  width: '100%',
                  height: '200px',
                  borderRadius: '15px',
                  background: `url(${aiPhoto})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '3px solid #667eea',
                  filter: 'contrast(1.2) saturate(1.3) brightness(1.05)'
                }}>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                    mixBlendMode: 'overlay'
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    padding: '5px 12px',
                    background: 'rgba(102, 126, 234, 0.95)',
                    borderRadius: '15px',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 700
                  }}>
                    ✨ AI
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {!aiPhoto ? (
            <button
              onClick={generateAICharacter}
              disabled={!selectedPhoto || isGeneratingAI}
              style={{
                width: '100%',
                padding: '18px',
                borderRadius: '15px',
                border: 'none',
                background: (!selectedPhoto || isGeneratingAI) 
                  ? '#cbd5e1' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '17px',
                fontWeight: 800,
                cursor: (!selectedPhoto || isGeneratingAI) ? 'not-allowed' : 'pointer',
                boxShadow: (!selectedPhoto || isGeneratingAI) ? 'none' : '0 4px 20px rgba(102, 126, 234, 0.5)',
                transition: 'all 0.3s'
              }}
            >
              {isGeneratingAI 
                ? '🎨 AI가 캐릭터를 생성하고 있습니다...' 
                : '✨ AI 캐릭터 생성하기'}
            </button>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={handleEditAICharacter}
                style={{
                  padding: '18px',
                  borderRadius: '15px',
                  border: '2px solid #667eea',
                  background: 'white',
                  color: '#667eea',
                  fontSize: '16px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                ✏️ 수정하기
              </button>
              <button
                onClick={handleDeleteAICharacter}
                style={{
                  padding: '18px',
                  borderRadius: '15px',
                  border: '2px solid #ff6b6b',
                  background: 'white',
                  color: '#ff6b6b',
                  fontSize: '16px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                🗑️ 삭제하기
              </button>
            </div>
          )}

          {aiPhoto && (
            <div style={{
              marginTop: '15px',
              padding: '15px',
              background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', color: '#667eea', fontWeight: 700 }}>
                ✅ AI 캐릭터가 생성되었습니다!
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                홈 화면에서 확인할 수 있습니다
              </div>
            </div>
          )}
        </div>

        {/* Body Stats Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '25px',
          padding: '30px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#333' }}>
              📊 신체 정보
            </h3>
            <button
              onClick={() => isEditingBody ? handleSaveBodyStats() : setIsEditingBody(true)}
              style={{
                padding: '10px 20px',
                borderRadius: '20px',
                border: 'none',
                background: isEditingBody ? '#10b981' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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

          {isEditingBody ? (
            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '13px', color: '#666', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                  키 (cm)
                </label>
                <input
                  type="number"
                  value={tempBodyStats.height}
                  onChange={(e) => setTempBodyStats({ ...tempBodyStats, height: parseFloat(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '2px solid #e0e7ff',
                    fontSize: '16px',
                    fontWeight: 600
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: '#666', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                  체중 (kg)
                </label>
                <input
                  type="number"
                  value={tempBodyStats.weight}
                  onChange={(e) => setTempBodyStats({ ...tempBodyStats, weight: parseFloat(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '2px solid #e0e7ff',
                    fontSize: '16px',
                    fontWeight: 600
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: '#666', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                  근육량 (kg)
                </label>
                <input
                  type="number"
                  value={tempBodyStats.muscle}
                  onChange={(e) => setTempBodyStats({ ...tempBodyStats, muscle: parseFloat(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '2px solid #e0e7ff',
                    fontSize: '16px',
                    fontWeight: 600
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: '#666', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                  체지방 (%)
                </label>
                <input
                  type="number"
                  value={tempBodyStats.fat}
                  onChange={(e) => setTempBodyStats({ ...tempBodyStats, fat: parseFloat(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '2px solid #e0e7ff',
                    fontSize: '16px',
                    fontWeight: 600
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '20px' }}>
                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                  borderRadius: '15px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📏</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#667eea', marginBottom: '5px' }}>
                    {bodyStats.height}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999', fontWeight: 600 }}>키 (cm)</div>
                </div>

                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                  borderRadius: '15px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚖️</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#667eea', marginBottom: '5px' }}>
                    {bodyStats.weight}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999', fontWeight: 600 }}>체중 (kg)</div>
                </div>

                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, #10b98115 0%, #34d39915 100%)',
                  borderRadius: '15px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>💪</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981', marginBottom: '5px' }}>
                    {bodyStats.muscle}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999', fontWeight: 600 }}>근육량 (kg)</div>
                </div>

                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, #f59e0b15 0%, #fbbf2415 100%)',
                  borderRadius: '15px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔥</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b', marginBottom: '5px' }}>
                    {bodyStats.fat}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999', fontWeight: 600 }}>체지방 (%)</div>
                </div>
              </div>

              {/* BMI Section */}
              <div style={{
                padding: '20px',
                background: `linear-gradient(135deg, ${getBMIStatus().color}15 0%, ${getBMIStatus().color}25 100%)`,
                borderRadius: '15px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px', fontWeight: 600 }}>
                  BMI (체질량지수)
                </div>
                <div style={{
                  fontSize: '48px',
                  fontWeight: 900,
                  color: getBMIStatus().color,
                  marginBottom: '8px'
                }}>
                  {calculateBMI()}
                </div>
                <div style={{
                  padding: '8px 20px',
                  background: getBMIStatus().color,
                  color: 'white',
                  borderRadius: '20px',
                  display: 'inline-block',
                  fontSize: '14px',
                  fontWeight: 700
                }}>
                  {getBMIStatus().text}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Member Info */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '25px',
          padding: '30px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 800, color: '#333' }}>
            👤 회원 정보
          </h3>
          
          <div style={{ display: 'grid', gap: '15px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>이름</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#333' }}>
                {member?.last_name}{member?.first_name}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>이메일</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#333' }}>
                {member?.email || '-'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>전화번호</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#333' }}>
                {member?.phone || '-'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

