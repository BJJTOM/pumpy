'use client'
import { useState } from 'react'
import axios from 'axios'
import TermsModal from '../components/TermsModal'
import { getApiUrl } from '@/lib/api'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    notes: ''
  })

  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false
  })

  const [modalOpen, setModalOpen] = useState<'terms' | 'privacy' | 'marketing' | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 필수 약관 체크
    if (!agreements.terms || !agreements.privacy) {
      alert('❌ 필수 약관에 동의해주세요.')
      return
    }
    
    const data = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
      email: formData.email,
      notes: formData.notes,
      status: 'pending',
      terms_agreed: agreements.terms,
      privacy_agreed: agreements.privacy,
      marketing_agreed: agreements.marketing,
      terms_agreed_date: agreements.terms ? new Date().toISOString() : null,
      privacy_agreed_date: agreements.privacy ? new Date().toISOString() : null,
      marketing_agreed_date: agreements.marketing ? new Date().toISOString() : null
    }

    // 모바일에서도 접근 가능하도록 동적으로 API 주소 설정
    const apiBase = getApiUrl()

    console.log('API 주소:', apiBase, '데이터:', data)

    axios.post(`${apiBase}/members/`, data)
      .then(() => {
        alert('✅ 회원 신청이 완료되었습니다!\n관리자 승인 후 이용하실 수 있습니다.')
        window.location.href = '/login'
      })
      .catch(err => {
        alert('❌ 회원 신청 실패: ' + (err.response?.data?.detail || '오류가 발생했습니다'))
        console.error(err)
      })
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
        maxWidth: 500, 
        padding: 'var(--spacing-4xl)',
        backgroundColor: 'var(--card-bg)'
      }}>
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

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--spacing-md)' }}>
            <div>
              <label>성 *</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
                placeholder="홍"
              />
            </div>

            <div>
              <label>이름 *</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              placeholder="010-1234-5678"
            />
          </div>

          <div>
            <label>이메일</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label>특이사항 / 문의사항</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="문의사항이나 특이사항이 있으시면 적어주세요"
              rows={4}
            />
          </div>

          {/* 약관 동의 섹션 */}
          <div style={{
            background: 'var(--hover-bg)',
            padding: 'var(--spacing-lg)',
            borderRadius: '12px',
            marginTop: 'var(--spacing-md)'
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

          <button type="submit" className="btn btn-primary w-full" style={{ marginTop: 'var(--spacing-md)' }}>
            회원 신청하기
          </button>

          <div style={{ textAlign: 'center', marginTop: 'var(--spacing-md)' }}>
            <a href="/login" style={{ color: 'var(--pri)', fontSize: '14px', fontWeight: 600 }}>
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
