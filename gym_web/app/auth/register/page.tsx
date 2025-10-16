'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'
import Link from 'next/link'

interface TermsContent {
  title: string
  content: string
}

const TERMS_DATA: Record<string, TermsContent> = {
  terms: {
    title: '이용약관',
    content: `
제1조 (목적)
본 약관은 펌피(이하 "회사")가 제공하는 피트니스 서비스(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.

제2조 (정의)
1. "서비스"란 회사가 제공하는 피트니스 센터 이용 및 관련 부가 서비스를 의미합니다.
2. "회원"이란 본 약관에 동의하고 회사와 서비스 이용계약을 체결한 자를 의미합니다.
3. "회원권"이란 회원이 서비스를 이용할 수 있는 권리를 의미합니다.

제3조 (약관의 효력 및 변경)
1. 본 약관은 회원이 약관에 동의하고 회사가 정한 절차에 따라 회원 가입을 완료함으로써 효력이 발생합니다.
2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.
3. 약관이 변경되는 경우 회사는 변경 사항을 시행일로부터 최소 7일 전에 공지합니다.

제4조 (서비스의 제공 및 변경)
1. 회사는 다음과 같은 서비스를 제공합니다:
   - 피트니스 시설 이용
   - 운동 프로그램 제공
   - 트레이너 상담 서비스
   - 기타 부대 서비스
2. 회사는 운영상 필요한 경우 서비스의 내용을 변경할 수 있습니다.

제5조 (회원의 의무)
1. 회원은 서비스 이용 시 다음 사항을 준수해야 합니다:
   - 시설 이용 규칙 준수
   - 타 회원에 대한 배려
   - 안전 수칙 준수
2. 회원은 본인의 건강 상태에 대해 사실대로 고지해야 합니다.

제6조 (환불 및 해지)
1. 회원은 계약 체결 후 7일 이내 서비스를 이용하지 않은 경우 계약을 해지하고 전액 환불받을 수 있습니다.
2. 서비스 이용 후 해지 시 이용 일수에 비례하여 환불됩니다.

제7조 (면책조항)
1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인해 서비스를 제공할 수 없는 경우 책임이 면제됩니다.
2. 회원의 귀책사유로 인한 사고에 대해 회사는 책임을 지지 않습니다.

제8조 (분쟁 해결)
본 약관과 관련된 분쟁은 대한민국 법률에 따라 해결하며, 관할 법원은 회사의 소재지 법원으로 합니다.

부칙
본 약관은 2025년 1월 1일부터 시행됩니다.
    `
  },
  privacy: {
    title: '개인정보 처리방침',
    content: `
펌피(이하 "회사")는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보 처리방침을 수립·공개합니다.

제1조 (개인정보의 처리 목적)
회사는 다음의 목적을 위하여 개인정보를 처리합니다:
1. 회원 가입 및 관리
2. 서비스 제공
3. 고충 처리
4. 마케팅 및 광고 활용 (선택적 동의)

제2조 (처리하는 개인정보의 항목)
회사는 다음의 개인정보 항목을 처리하고 있습니다:
1. 필수항목: 이름, 이메일, 전화번호, 생년월일
2. 선택항목: 주소, 긴급연락처
3. 서비스 이용 과정에서 자동 수집: 접속 IP, 쿠키, 서비스 이용 기록

제3조 (개인정보의 처리 및 보유 기간)
1. 회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
2. 회원 탈퇴 시 개인정보는 즉시 파기됩니다. 단, 관련 법령에 따라 보존이 필요한 경우 일정 기간 보관 후 파기합니다.

제4조 (개인정보의 제3자 제공)
회사는 원칙적으로 정보주체의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우는 예외로 합니다:
1. 정보주체가 사전에 동의한 경우
2. 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우

제5조 (개인정보의 파기)
회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때는 지체없이 해당 개인정보를 파기합니다.

제6조 (정보주체의 권리·의무 및 행사방법)
정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:
1. 개인정보 열람 요구
2. 오류 등이 있을 경우 정정 요구
3. 삭제 요구
4. 처리정지 요구

제7조 (개인정보 보호책임자)
회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리를 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
- 이메일: privacy@pumpy.com
- 전화번호: 02-1234-5678

제8조 (개인정보 처리방침 변경)
이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.

부칙
본 방침은 2025년 1월 1일부터 시행됩니다.
    `
  },
  marketing: {
    title: '마케팅 정보 수신 동의',
    content: `
펌피(이하 "회사")는 회원님께 다양한 혜택과 이벤트 정보를 제공하기 위해 마케팅 정보 수신 동의를 받고 있습니다.

제1조 (수집 목적)
회사는 다음의 목적으로 마케팅 정보를 발송합니다:
1. 신규 서비스 안내
2. 이벤트 및 프로모션 정보 제공
3. 맞춤형 서비스 추천
4. 회원권 갱신 안내

제2조 (발송 방법)
마케팅 정보는 다음의 방법으로 발송됩니다:
1. 이메일
2. SMS/MMS
3. 앱 푸시 알림
4. 우편물 (선택 시)

제3조 (수신 동의 철회)
1. 회원은 언제든지 마케팅 정보 수신을 거부할 수 있습니다.
2. 수신 거부 방법:
   - 앱 내 설정 > 알림 설정
   - 이메일 하단의 '수신거부' 링크 클릭
   - 고객센터 문의 (02-1234-5678)

제4조 (동의 거부 권리 및 불이익)
1. 회원은 마케팅 정보 수신에 동의하지 않을 권리가 있습니다.
2. 마케팅 정보 수신에 동의하지 않아도 서비스 이용에는 제한이 없습니다.
3. 단, 프로모션 정보를 받지 못할 수 있습니다.

제5조 (개인정보 제공)
마케팅 목적으로 수집된 개인정보는 제3자에게 제공되지 않습니다.

제6조 (사진 및 영상 촬영 동의)
1. 회사는 시설 홍보 및 SNS 콘텐츠 제작을 위해 사진 및 영상을 촬영할 수 있습니다.
2. 촬영된 사진 및 영상은 다음의 용도로 사용됩니다:
   - 회사 홈페이지 및 SNS 게시
   - 온라인/오프라인 광고
   - 홍보 자료 제작
3. 회원은 언제든지 사진 및 영상 사용 동의를 철회할 수 있습니다.

부칙
본 동의서는 2025년 1월 1일부터 시행됩니다.
    `
  }
}

export default function RegisterPage() {
  const router = useRouter()
  
  // 폼 데이터
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    firstName: '',
    lastName: '',
    phone: ''
  })
  
  // 상태
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  
  // 약관 동의
  const [agreements, setAgreements] = useState({
    all: false,
    terms: false,
    privacy: false,
    marketing: false
  })
  
  // 모달
  const [modalOpen, setModalOpen] = useState<'terms' | 'privacy' | 'marketing' | null>(null)
  
  // 전화번호 인증
  const [phoneVerification, setPhoneVerification] = useState({
    code: '',
    sent: false,
    verified: false,
    serverCode: '', // 개발용
    timer: 180
  })

  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)

  // 전체 동의 토글
  const handleAllAgreement = (checked: boolean) => {
    setAgreements({
      all: checked,
      terms: checked,
      privacy: checked,
      marketing: checked
    })
  }

  // 개별 동의 토글
  const handleAgreement = (key: 'terms' | 'privacy' | 'marketing', checked: boolean) => {
    const newAgreements = { ...agreements, [key]: checked }
    newAgreements.all = newAgreements.terms && newAgreements.privacy && newAgreements.marketing
    setAgreements(newAgreements)
  }

  // 인증번호 전송
  const sendVerificationCode = async () => {
    if (!formData.phone) {
      setError('전화번호를 입력해주세요.')
      return
    }

    if (!/^01[0-9]{8,9}$/.test(formData.phone)) {
      setError('올바른 전화번호 형식이 아닙니다.')
      return
    }

    try {
      const apiBase = getApiUrl()
      const res = await axios.post(`${apiBase}/auth/send-verification/`, {
        phone: formData.phone
      }, {
        timeout: 10000
      })

      setPhoneVerification({
        ...phoneVerification,
        sent: true,
        verified: false,
        serverCode: res.data.code, // 개발용
        timer: 180
      })

      // 타이머 시작
      if (timerInterval) clearInterval(timerInterval)
      const interval = setInterval(() => {
        setPhoneVerification(prev => {
          if (prev.timer <= 1) {
            clearInterval(interval)
            return { ...prev, timer: 0, sent: false }
          }
          return { ...prev, timer: prev.timer - 1 }
        })
      }, 1000)
      setTimerInterval(interval)

      alert(`인증번호가 전송되었습니다. (개발용: ${res.data.code})`)
      setError('')
    } catch (err: any) {
      setError('인증번호 전송에 실패했습니다.')
    }
  }

  // 인증번호 확인
  const verifyPhone = async () => {
    if (!phoneVerification.code) {
      setError('인증번호를 입력해주세요.')
      return
    }

    try {
      const apiBase = getApiUrl()
      await axios.post(`${apiBase}/auth/verify-phone/`, {
        phone: formData.phone,
        code: phoneVerification.code
      }, {
        timeout: 10000
      })

      setPhoneVerification({ ...phoneVerification, verified: true })
      if (timerInterval) clearInterval(timerInterval)
      alert('전화번호 인증이 완료되었습니다!')
      setError('')
    } catch (err: any) {
      setError('인증번호가 올바르지 않습니다.')
    }
  }

  // 회원가입
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 유효성 검사
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.phone) {
      setError('모든 필수 항목을 입력해주세요.')
      return
    }

    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (formData.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.')
      return
    }

    if (!agreements.terms || !agreements.privacy) {
      setError('필수 약관에 동의해주세요.')
      return
    }

    // 전화번호 인증 임시 비활성화
    // if (!phoneVerification.verified) {
    //   setError('전화번호 인증을 완료해주세요.')
    //   return
    // }

    setLoading(true)

    try {
      const apiBase = getApiUrl()
      const res = await axios.post(`${apiBase}/auth/register/`, {
        email: formData.email,
        password: formData.password,
        password_confirm: formData.passwordConfirm,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        phone_verified: true, // 전화번호 인증 임시 비활성화
        terms_agreed: agreements.terms,
        privacy_agreed: agreements.privacy,
        marketing_agreed: agreements.marketing
      }, {
        timeout: 10000
      })

      alert('회원가입이 완료되었습니다! 로그인 해주세요.')
      router.push('/auth/login')
    } catch (err: any) {
      console.error('회원가입 실패:', err)
      if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError('회원가입 중 오류가 발생했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>💪</div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '900',
            color: 'white',
            margin: '0 0 8px 0'
          }}>
            회원가입
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.9)',
            margin: 0
          }}>
            펌피와 함께 건강한 삶을 시작하세요
          </p>
        </div>

        {/* 가입 폼 */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '32px 24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <form onSubmit={handleRegister}>
            {/* 이메일 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#666',
                marginBottom: '8px'
              }}>
                이메일 *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@email.com"
                disabled={loading}
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 16px',
                  fontSize: '15px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            {/* 비밀번호 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#666',
                marginBottom: '8px'
              }}>
                비밀번호 * (8자 이상)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="비밀번호를 입력하세요"
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 48px 0 16px',
                    fontSize: '15px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    fontSize: '18px',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* 비밀번호 확인 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#666',
                marginBottom: '8px'
              }}>
                비밀번호 확인 *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  value={formData.passwordConfirm}
                  onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                  placeholder="비밀번호를 다시 입력하세요"
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 48px 0 16px',
                    fontSize: '15px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    fontSize: '18px',
                    cursor: 'pointer'
                  }}
                >
                  {showPasswordConfirm ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* 이름 (성/이름) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#666',
                  marginBottom: '8px'
                }}>
                  성 *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="김"
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    fontSize: '15px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#666',
                  marginBottom: '8px'
                }}>
                  이름 *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="철수"
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    fontSize: '15px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
            </div>

            {/* 전화번호 (인증 없이 입력만) */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#666',
                marginBottom: '8px'
              }}>
                전화번호 * (- 없이 입력)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, '') })}
                placeholder="01012345678"
                disabled={loading}
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 16px',
                  fontSize: '15px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
              <div style={{
                fontSize: '12px',
                color: '#10b981',
                marginTop: '6px',
                fontWeight: '500'
              }}>
                📱 인증 없이 바로 가입 가능합니다
              </div>
              
              {/* 인증 UI 제거됨 */}
              {false && phoneVerification.sent && !phoneVerification.verified && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={phoneVerification.code}
                    onChange={(e) => setPhoneVerification({ ...phoneVerification, code: e.target.value })}
                    placeholder="인증번호 6자리"
                    maxLength={6}
                    disabled={loading}
                    style={{
                      flex: 1,
                      height: '48px',
                      padding: '0 16px',
                      fontSize: '15px',
                      border: '2px solid #667eea',
                      borderRadius: '12px',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                  <button
                    type="button"
                    onClick={verifyPhone}
                    disabled={loading || !phoneVerification.code}
                    style={{
                      padding: '0 20px',
                      height: '48px',
                      background: '#4caf50',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    확인
                  </button>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 12px',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: phoneVerification.timer < 60 ? '#f44336' : '#667eea'
                  }}>
                    {formatTime(phoneVerification.timer)}
                  </div>
                </div>
              )}
            </div>

            {/* 약관 동의 */}
            <div style={{
              background: '#f9f9f9',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '700'
                }}>
                  <input
                    type="checkbox"
                    checked={agreements.all}
                    onChange={(e) => handleAllAgreement(e.target.checked)}
                    style={{
                      width: '20px',
                      height: '20px',
                      marginRight: '10px',
                      cursor: 'pointer'
                    }}
                  />
                  전체 동의
                </label>
              </div>

              <div style={{ paddingLeft: '30px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 이용약관 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      checked={agreements.terms}
                      onChange={(e) => handleAgreement('terms', e.target.checked)}
                      style={{ width: '18px', height: '18px', marginRight: '8px', cursor: 'pointer' }}
                    />
                    <span>[필수] 이용약관 동의</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setModalOpen('terms')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#667eea',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    보기
                  </button>
                </div>

                {/* 개인정보처리방침 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      checked={agreements.privacy}
                      onChange={(e) => handleAgreement('privacy', e.target.checked)}
                      style={{ width: '18px', height: '18px', marginRight: '8px', cursor: 'pointer' }}
                    />
                    <span>[필수] 개인정보 처리방침 동의</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setModalOpen('privacy')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#667eea',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    보기
                  </button>
                </div>

                {/* 마케팅 동의 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      checked={agreements.marketing}
                      onChange={(e) => handleAgreement('marketing', e.target.checked)}
                      style={{ width: '18px', height: '18px', marginRight: '8px', cursor: 'pointer' }}
                    />
                    <span>[선택] 마케팅 정보 수신 동의</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setModalOpen('marketing')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#667eea',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    보기
                  </button>
                </div>
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div style={{
                background: '#fee',
                border: '2px solid #fcc',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '20px',
                fontSize: '14px',
                color: '#c33',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            {/* 가입 버튼 */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '56px',
                background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '18px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)',
                marginBottom: '16px'
              }}
            >
              {loading ? '가입 중...' : '가입하기'}
            </button>

            {/* 로그인 링크 */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>이미 회원이신가요? </span>
              <Link
                href="/auth/login"
                style={{
                  fontSize: '14px',
                  color: '#667eea',
                  fontWeight: '700',
                  textDecoration: 'none'
                }}
              >
                로그인
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* 약관 모달 */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 1000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '20px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* 모달 헤더 */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
                {TERMS_DATA[modalOpen].title}
              </h3>
              <button
                onClick={() => setModalOpen(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>

            {/* 모달 내용 */}
            <div style={{
              padding: '24px',
              overflow: 'auto',
              flex: 1,
              fontSize: '14px',
              lineHeight: '1.8',
              color: '#333',
              whiteSpace: 'pre-wrap'
            }}>
              {TERMS_DATA[modalOpen].content}
            </div>

            {/* 모달 푸터 */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #f0f0f0'
            }}>
              <button
                onClick={() => setModalOpen(null)}
                style={{
                  width: '100%',
                  height: '48px',
                  background: '#667eea',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

