'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import TermsModal from '../components/TermsModal'
import { getApiUrl } from '@/lib/api'

export default function SignupPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // 기본 정보
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    password: '',
    password_confirm: '',
    
    // 개인 정보
    birth_date: '',
    gender: '',
    address: '',
    emergency_contact: '',
    emergency_contact_relation: '',
    
    // 신체 정보
    height: '',
    weight: '',
    blood_type: '',
    medical_notes: '',
    
    // 회원권 정보
    current_level: '초보',
    age_group: '일반부',
    religion: '무교',
    
    // 기타
    notes: '',
    referrer_code: ''
  })

  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false
  })

  const [modalOpen, setModalOpen] = useState<'terms' | 'privacy' | 'marketing' | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateStep1 = () => {
    if (!formData.first_name || !formData.last_name) {
      alert('❌ 이름을 입력해주세요.')
      return false
    }
    if (!formData.phone) {
      alert('❌ 전화번호를 입력해주세요.')
      return false
    }
    if (!formData.email) {
      alert('❌ 이메일을 입력해주세요.')
      return false
    }
    if (!formData.password || formData.password.length < 6) {
      alert('❌ 비밀번호는 최소 6자 이상이어야 합니다.')
      return false
    }
    if (formData.password !== formData.password_confirm) {
      alert('❌ 비밀번호가 일치하지 않습니다.')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.birth_date) {
      alert('❌ 생년월일을 입력해주세요.')
      return false
    }
    if (!formData.gender) {
      alert('❌ 성별을 선택해주세요.')
      return false
    }
    return true
  }

  const validateStep3 = () => {
    if (!agreements.terms || !agreements.privacy) {
      alert('❌ 필수 약관에 동의해주세요.')
      return false
    }
    return true
  }

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return
    if (currentStep === 2 && !validateStep2()) return
    setCurrentStep(prev => prev + 1)
  }

  const prevStep = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep3()) return

    setSubmitting(true)
    
    try {
      const data = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        birth_date: formData.birth_date || null,
        gender: formData.gender || '',
        address: formData.address || '',
        emergency_contact: formData.emergency_contact || '',
        emergency_contact_relation: formData.emergency_contact_relation || '',
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        blood_type: formData.blood_type || '',
        medical_notes: formData.medical_notes || '',
        current_level: formData.current_level || '초보',
        age_group: formData.age_group || '일반부',
        religion: formData.religion || '무교',
        notes: formData.notes || '',
        status: 'pending',
        phone_verified: false,
        email_verified: false,
        terms_agreed: agreements.terms,
        privacy_agreed: agreements.privacy,
        marketing_agreed: agreements.marketing,
        terms_agreed_date: agreements.terms ? new Date().toISOString() : null,
        privacy_agreed_date: agreements.privacy ? new Date().toISOString() : null,
        marketing_agreed_date: agreements.marketing ? new Date().toISOString() : null,
        join_date: new Date().toISOString().split('T')[0]
      }

      const apiBase = getApiUrl()
      console.log('회원 신청 데이터:', data)

      const response = await axios.post(`${apiBase}/members/`, data)
      console.log('회원 신청 성공:', response.data)

      // 생성된 회원 정보를 로컬 스토리지에 저장 (로그인용)
      localStorage.setItem('pendingUser', JSON.stringify({
        ...response.data,
        email: formData.email,
        password: formData.password
      }))

      alert(`✅ 회원 신청이 완료되었습니다!\n\n회원번호: ${response.data.id}\n\n관리자 승인 후 로그인하실 수 있습니다.`)
      router.push('/auth/login')
    } catch (err: any) {
      console.error('회원 신청 실패:', err)
      alert('❌ 회원 신청 실패: ' + (err.response?.data?.detail || err.response?.data?.email?.[0] || '오류가 발생했습니다'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--pri) 0%, var(--pri2) 100%)',
      padding: 'var(--spacing-xl)'
    }}>
      <div className="card" style={{ 
        width: '100%', 
        maxWidth: 600, 
        padding: 'var(--spacing-4xl)',
        backgroundColor: 'var(--card-bg)'
      }}>
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-3xl)' }}>
          <div style={{ fontSize: 64, marginBottom: 'var(--spacing-lg)' }}>💪</div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '28px', 
            fontWeight: 700, 
            marginBottom: 'var(--spacing-xs)',
            color: 'var(--text)'
          }}>
            펌피 회원 신청
          </h1>
          <p style={{ margin: 0, color: 'var(--text-sub)', fontSize: '15px' }}>
            체육관 회원 등록을 시작합니다
          </p>
        </div>

        {/* 단계 표시기 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 'var(--spacing-3xl)',
          position: 'relative'
        }}>
          {[1, 2, 3].map(step => (
            <div key={step} style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: currentStep >= step 
                  ? 'linear-gradient(135deg, var(--pri) 0%, var(--pri2) 100%)'
                  : '#e0e0e0',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 700,
                marginBottom: '8px',
                zIndex: 2
              }}>
                {step}
              </div>
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                color: currentStep >= step ? 'var(--pri)' : '#999',
                textAlign: 'center'
              }}>
                {step === 1 && '기본 정보'}
                {step === 2 && '상세 정보'}
                {step === 3 && '약관 동의'}
              </div>
              {step < 3 && (
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '50%',
                  width: '100%',
                  height: '3px',
                  background: currentStep > step ? 'var(--pri)' : '#e0e0e0',
                  zIndex: 1
                }} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
          {/* Step 1: 기본 정보 */}
          {currentStep === 1 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--spacing-md)' }}>
                <div>
                  <label>성 *</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    required
                    placeholder="홍"
                  />
                </div>
                <div>
                  <label>이름 *</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    required
                    placeholder="길동"
                  />
                </div>
              </div>

              <div>
                <label>전화번호 *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                  placeholder="010-1234-5678"
                />
              </div>

              <div>
                <label>이메일 *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label>비밀번호 * (최소 6자)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••"
                />
              </div>

              <div>
                <label>비밀번호 확인 *</label>
                <input
                  type="password"
                  value={formData.password_confirm}
                  onChange={(e) => handleChange('password_confirm', e.target.value)}
                  required
                  placeholder="••••••"
                />
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="btn btn-primary w-full"
                style={{ marginTop: 'var(--spacing-md)' }}
              >
                다음 단계 →
              </button>
            </>
          )}

          {/* Step 2: 상세 정보 */}
          {currentStep === 2 && (
            <>
              <div>
                <label>생년월일 *</label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleChange('birth_date', e.target.value)}
                  required
                />
              </div>

              <div>
                <label>성별 *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '15px'
                  }}
                >
                  <option value="">선택하세요</option>
                  <option value="남">남성</option>
                  <option value="여">여성</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div>
                <label>주소</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="서울시 강남구..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-md)' }}>
                <div>
                  <label>긴급 연락처</label>
                  <input
                    type="tel"
                    value={formData.emergency_contact}
                    onChange={(e) => handleChange('emergency_contact', e.target.value)}
                    placeholder="010-9876-5432"
                  />
                </div>
                <div>
                  <label>관계</label>
                  <input
                    type="text"
                    value={formData.emergency_contact_relation}
                    onChange={(e) => handleChange('emergency_contact_relation', e.target.value)}
                    placeholder="부모, 배우자 등"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-md)' }}>
                <div>
                  <label>신장 (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleChange('height', e.target.value)}
                    placeholder="175"
                  />
                </div>
                <div>
                  <label>체중 (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    placeholder="70"
                  />
                </div>
                <div>
                  <label>혈액형</label>
                  <select
                    value={formData.blood_type}
                    onChange={(e) => handleChange('blood_type', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      fontSize: '15px'
                    }}
                  >
                    <option value="">선택</option>
                    <option value="A">A형</option>
                    <option value="B">B형</option>
                    <option value="O">O형</option>
                    <option value="AB">AB형</option>
                    <option value="RH-">RH-</option>
                  </select>
                </div>
              </div>

              <div>
                <label>현재 레벨</label>
                <select
                  value={formData.current_level}
                  onChange={(e) => handleChange('current_level', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '15px'
                  }}
                >
                  <option value="초보">초보</option>
                  <option value="중급">중급</option>
                  <option value="고급">고급</option>
                  <option value="1단">1단</option>
                  <option value="2단">2단</option>
                  <option value="3단">3단</option>
                </select>
              </div>

              <div>
                <label>연령대</label>
                <select
                  value={formData.age_group}
                  onChange={(e) => handleChange('age_group', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '15px'
                  }}
                >
                  <option value="유치부">유치부</option>
                  <option value="초등부">초등부</option>
                  <option value="중등부">중등부</option>
                  <option value="고등부">고등부</option>
                  <option value="대학부">대학부</option>
                  <option value="일반부">일반부</option>
                </select>
              </div>

              <div>
                <label>건강 특이사항</label>
                <textarea
                  value={formData.medical_notes}
                  onChange={(e) => handleChange('medical_notes', e.target.value)}
                  placeholder="건강상 특이사항이 있으면 적어주세요"
                  rows={3}
                />
              </div>

              <div>
                <label>특이사항 / 문의사항</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="기타 문의사항이 있으시면 적어주세요"
                  rows={3}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--spacing-md)',
                marginTop: 'var(--spacing-md)'
              }}>
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn"
                  style={{
                    background: '#f5f5f5',
                    color: '#666'
                  }}
                >
                  ← 이전
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn btn-primary"
                >
                  다음 단계 →
                </button>
              </div>
            </>
          )}

          {/* Step 3: 약관 동의 */}
          {currentStep === 3 && (
            <>
              <div style={{
                background: 'var(--hover-bg)',
                padding: 'var(--spacing-lg)',
                borderRadius: '12px'
              }}>
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 600
                  }}>
                    <input
                      type="checkbox"
                      checked={agreements.terms && agreements.privacy}
                      onChange={(e) => {
                        const checked = e.target.checked
                        setAgreements({
                          terms: checked,
                          privacy: checked,
                          marketing: checked
                        })
                      }}
                      style={{
                        width: '20px',
                        height: '20px',
                        marginRight: '10px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ color: 'var(--text-primary)' }}>전체 동의</span>
                  </label>
                </div>

                <div style={{
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: 'var(--spacing-md)',
                  display: 'grid',
                  gap: 'var(--spacing-sm)'
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={agreements.terms}
                        onChange={(e) => setAgreements({ ...agreements, terms: e.target.checked })}
                        style={{
                          width: '18px',
                          height: '18px',
                          marginRight: '10px',
                          cursor: 'pointer'
                        }}
                      />
                      <span style={{ color: 'var(--text-primary)' }}>
                        <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>[필수]</span> 이용 약관 동의
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalOpen('terms')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      보기
                    </button>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={agreements.privacy}
                        onChange={(e) => setAgreements({ ...agreements, privacy: e.target.checked })}
                        style={{
                          width: '18px',
                          height: '18px',
                          marginRight: '10px',
                          cursor: 'pointer'
                        }}
                      />
                      <span style={{ color: 'var(--text-primary)' }}>
                        <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>[필수]</span> 개인정보 처리방침 동의
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalOpen('privacy')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      보기
                    </button>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={agreements.marketing}
                        onChange={(e) => setAgreements({ ...agreements, marketing: e.target.checked })}
                        style={{
                          width: '18px',
                          height: '18px',
                          marginRight: '10px',
                          cursor: 'pointer'
                        }}
                      />
                      <span style={{ color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>[선택]</span> 마케팅 정보 수신 및 활용 동의
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalOpen('marketing')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      보기
                    </button>
                  </label>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--spacing-md)',
                marginTop: 'var(--spacing-md)'
              }}>
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn"
                  style={{
                    background: '#f5f5f5',
                    color: '#666'
                  }}
                >
                  ← 이전
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? '처리 중...' : '회원 신청하기'}
                </button>
              </div>
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: 'var(--spacing-md)' }}>
            <a href="/auth/login" style={{ color: 'var(--pri)', fontSize: '14px', fontWeight: 600 }}>
              이미 회원이신가요? 로그인
            </a>
          </div>
        </form>
      </div>

      {/* 약관 모달 */}
      {modalOpen && (
        <TermsModal
          isOpen={true}
          onClose={() => setModalOpen(null)}
          type={modalOpen}
        />
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          div:first-child {
            padding: var(--spacing-md) !important;
          }
          
          .card {
            padding: var(--spacing-2xl) !important;
          }

          h1 {
            font-size: 24px !important;
          }
        }
      `}</style>
    </div>
  )
}
