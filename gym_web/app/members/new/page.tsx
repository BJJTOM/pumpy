'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'

export default function NewMemberPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    address: '',
    birth_date: '',
    gender: '남',
    current_level: '흰띠',
    points: 0,
    notes: '',
    health_issues: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    terms_agreed: false,
    privacy_agreed: false,
    marketing_agreed: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.terms_agreed || !formData.privacy_agreed) {
      alert('⚠️ 필수 약관에 동의해주세요')
      return
    }

    const submitData = {
      ...formData,
      status: 'active',
      total_attendance_days: 0,
      terms_agreed_date: formData.terms_agreed ? new Date().toISOString() : null,
      privacy_agreed_date: formData.privacy_agreed ? new Date().toISOString() : null,
      marketing_agreed_date: formData.marketing_agreed ? new Date().toISOString() : null,
    }

    // 모바일에서도 접근 가능하도록 동적으로 API 주소 설정
    const apiBase = getApiUrl()

    console.log('API 주소:', apiBase, '데이터:', submitData)

    axios.post(`${apiBase}/members/`, submitData)
      .then(res => {
        alert('✅ 회원이 추가되었습니다')
        router.push(`/members/${res.data.id}`)
      })
      .catch(err => {
        console.error(err)
        alert('❌ 회원 추가 실패: ' + (err.response?.data?.detail || '오류가 발생했습니다'))
      })
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2xl)', flexWrap: 'wrap', gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: 'var(--text)' }}>
          ✨ 회원 추가
        </h1>
        <button onClick={() => router.push('/members')} className="btn btn-secondary btn-sm">
          ← 돌아가기
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--spacing-xl)' }}>
        {/* 기본 정보 */}
        <div className="card" style={{ padding: 'var(--spacing-2xl)' }}>
          <h3 style={{ margin: '0 0 var(--spacing-lg) 0', fontSize: '18px', fontWeight: 600, color: 'var(--text)', paddingBottom: 'var(--spacing-md)', borderBottom: '2px solid var(--line)' }}>
            📋 기본 정보
          </h3>
          <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--spacing-md)' }}>
              <div>
                <label>성 *</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                  placeholder="김"
                />
              </div>
              <div>
                <label>이름 *</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                  placeholder="펌피"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
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
            </div>

            <div>
              <label>주소</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="서울시 강남구..."
              />
            </div>
          </div>
        </div>

        {/* 개인정보 */}
        <div className="card" style={{ padding: 'var(--spacing-2xl)' }}>
          <h3 style={{ margin: '0 0 var(--spacing-lg) 0', fontSize: '18px', fontWeight: 600, color: 'var(--text)', paddingBottom: 'var(--spacing-md)', borderBottom: '2px solid var(--line)' }}>
            👤 개인정보
          </h3>
          <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--spacing-md)' }}>
              <div>
                <label>생년월일</label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                />
              </div>
              <div>
                <label>성별</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="남">남</option>
                  <option value="여">여</option>
                </select>
              </div>
              <div>
                <label>레벨</label>
                <select
                  value={formData.current_level}
                  onChange={(e) => setFormData({ ...formData, current_level: e.target.value })}
                >
                  <option value="흰띠">흰띠</option>
                  <option value="파란띠">파란띠</option>
                  <option value="보라띠">보라띠</option>
                  <option value="갈색띠">갈색띠</option>
                  <option value="검은띠">검은띠</option>
                  <option value="검은띠 1단">검은띠 1단</option>
                  <option value="검은띠 2단">검은띠 2단</option>
                  <option value="검은띠 3단">검은띠 3단</option>
                </select>
              </div>
              <div>
                <label>포인트</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label>건강 특이사항</label>
              <textarea
                value={formData.health_issues}
                onChange={(e) => setFormData({ ...formData, health_issues: e.target.value })}
                placeholder="알레르기, 지병, 부상 이력 등"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* 긴급 연락처 */}
        <div className="card" style={{ padding: 'var(--spacing-2xl)' }}>
          <h3 style={{ margin: '0 0 var(--spacing-lg) 0', fontSize: '18px', fontWeight: 600, color: 'var(--text)', paddingBottom: 'var(--spacing-md)', borderBottom: '2px solid var(--line)' }}>
            🚨 긴급 연락처
          </h3>
          <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
              <div>
                <label>이름</label>
                <input
                  type="text"
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                  placeholder="홍길동"
                />
              </div>
              <div>
                <label>전화번호</label>
                <input
                  type="tel"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                  placeholder="010-9876-5432"
                />
              </div>
              <div>
                <label>관계</label>
                <input
                  type="text"
                  value={formData.emergency_contact_relation}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_relation: e.target.value })}
                  placeholder="부모, 형제, 친구 등"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 메모 */}
        <div className="card" style={{ padding: 'var(--spacing-2xl)' }}>
          <h3 style={{ margin: '0 0 var(--spacing-lg) 0', fontSize: '18px', fontWeight: 600, color: 'var(--text)', paddingBottom: 'var(--spacing-md)', borderBottom: '2px solid var(--line)' }}>
            📝 메모
          </h3>
          <div>
            <label>특이사항</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="기타 메모사항을 입력하세요"
              rows={4}
            />
          </div>
        </div>

        {/* 약관 동의 */}
        <div className="card" style={{ padding: 'var(--spacing-2xl)' }}>
          <h3 style={{ margin: '0 0 var(--spacing-lg) 0', fontSize: '18px', fontWeight: 600, color: 'var(--text)', paddingBottom: 'var(--spacing-md)', borderBottom: '2px solid var(--line)' }}>
            ✅ 약관 동의
          </h3>
          <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer', padding: 'var(--spacing-md)', backgroundColor: 'var(--pill)', borderRadius: 'var(--radius-lg)' }}>
              <input
                type="checkbox"
                checked={formData.terms_agreed}
                onChange={(e) => setFormData({ ...formData, terms_agreed: e.target.checked })}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>이용약관 동의 (필수)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer', padding: 'var(--spacing-md)', backgroundColor: 'var(--pill)', borderRadius: 'var(--radius-lg)' }}>
              <input
                type="checkbox"
                checked={formData.privacy_agreed}
                onChange={(e) => setFormData({ ...formData, privacy_agreed: e.target.checked })}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>개인정보 처리방침 동의 (필수)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer', padding: 'var(--spacing-md)', backgroundColor: 'var(--pill)', borderRadius: 'var(--radius-lg)' }}>
              <input
                type="checkbox"
                checked={formData.marketing_agreed}
                onChange={(e) => setFormData({ ...formData, marketing_agreed: e.target.checked })}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>마케팅 정보 수신 동의 (선택)</span>
            </label>
          </div>
        </div>

        {/* 버튼 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
          <button 
            type="button" 
            onClick={() => router.push('/members')}
            className="btn btn-secondary"
          >
            취소
          </button>
          <button type="submit" className="btn btn-primary">
            회원 추가
          </button>
        </div>
      </form>

      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
