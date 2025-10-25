'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'

type Plan = {
  id: number
  name: string
  category: string
  price: number
  duration_months?: number
}

export default function NewMemberPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])
  const [formData, setFormData] = useState({
    // 기본 정보
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    home_phone: '',
    work_phone: '',
    address: '',
    birth_date: '',
    gender: '남',
    
    // 입관원서 추가 정보
    member_number: '',
    religion: '무교',
    age_group: '일반부',
    school_name: '',
    school_grade: '',
    age: '',
    height: '',
    weight: '',
    blood_type: 'A',
    
    // 입관/퇴관 정보
    admission_date: new Date().toISOString().split('T')[0],
    
    // 단(품) 정보
    dan_rank: '',
    dan_rank_date: '',
    dan_rank_number: '',
    
    // 부모/보호자 정보
    parent_job: '',
    
    // 입관 관련 상세 정보
    admission_motivation: '',
    personality_description: '',
    exercise_aptitude: '',
    training_reason: '',
    special_notes: '',
    
    // 회원권 정보
    current_plan: '',
    expire_date: '',
    status: 'pending'
  })

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      const apiBase = getApiUrl()
      const res = await axios.get(`${apiBase}/plans/`, { timeout: 30000 })
      setPlans(res.data.filter((p: any) => p.is_active))
    } catch (err) {
      console.error('Plans loading failed:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
      alert('필수 항목(이름, 이메일, 전화번호)을 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      const apiBase = getApiUrl()
      
      // 빈 문자열을 null로 변환하여 전송
      const dataToSend = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        home_phone: formData.home_phone || '',
        work_phone: formData.work_phone || '',
        address: formData.address || '',
        birth_date: formData.birth_date || null,
        gender: formData.gender,
        member_number: formData.member_number || '',
        religion: formData.religion,
        age_group: formData.age_group,
        school_name: formData.school_name || '',
        school_grade: formData.school_grade || '',
        age: formData.age ? Number(formData.age) : null,
        height: formData.height ? Number(formData.height) : null,
        weight: formData.weight ? Number(formData.weight) : null,
        blood_type: formData.blood_type,
        admission_date: formData.admission_date || null,
        dan_rank: formData.dan_rank || '',
        dan_rank_date: formData.dan_rank_date || null,
        dan_rank_number: formData.dan_rank_number || '',
        parent_job: formData.parent_job || '',
        admission_motivation: formData.admission_motivation || '',
        personality_description: formData.personality_description || '',
        exercise_aptitude: formData.exercise_aptitude || '',
        training_reason: formData.training_reason || '',
        special_notes: formData.special_notes || '',
        current_plan: formData.current_plan ? Number(formData.current_plan) : null,
        expire_date: formData.expire_date || null,
        status: formData.status
      }

      const response = await axios.post(`${apiBase}/members/`, dataToSend, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('회원 등록 성공:', response.data)
      alert('회원이 등록되었습니다!')
      router.push('/members')
    } catch (err: any) {
      console.error('Failed to create member:', err)
      console.error('Error response:', err.response?.data)
      
      if (err.response?.data) {
        const errorMsg = JSON.stringify(err.response.data, null, 2)
        alert(`회원 등록에 실패했습니다:\n${errorMsg}`)
      } else {
        alert('회원 등록에 실패했습니다. 서버 연결을 확인해주세요.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 12px 0', fontSize: '32px', fontWeight: 800 }}>📋 입관원서</h1>
        <p style={{ margin: 0, color: 'var(--text-sub)', fontSize: '15px' }}>
          회원 등록을 위한 상세 정보를 입력해주세요
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ padding: '40px', marginBottom: '20px' }}>
          {/* 사진 & 기본 정보 */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 700, borderBottom: '2px solid var(--pri)', paddingBottom: '12px' }}>
              📷 기본 정보
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  성 *
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  required
                  placeholder="김"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  이름 *
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  required
                  placeholder="철수"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  관번
                </label>
                <input
                  type="text"
                  value={formData.member_number}
                  onChange={(e) => setFormData({...formData, member_number: e.target.value})}
                  placeholder="자동 생성"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* 개인 정보 */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 700, borderBottom: '2px solid var(--pri)', paddingBottom: '12px' }}>
              👤 개인 정보
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  생년월일 *
                </label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  성별 *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  style={{ width: '100%' }}
                >
                  <option value="남">남</option>
                  <option value="여">여</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  나이 (만)
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  placeholder="20"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  종교
                </label>
                <select
                  value={formData.religion}
                  onChange={(e) => setFormData({...formData, religion: e.target.value})}
                  style={{ width: '100%' }}
                >
                  <option value="무교">무교</option>
                  <option value="기독교">기독교</option>
                  <option value="천주교">천주교</option>
                  <option value="불교">불교</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </div>
          </div>

          {/* 연락처 정보 */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 700, borderBottom: '2px solid var(--pri)', paddingBottom: '12px' }}>
              📞 연락처
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  휴대폰 *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                  placeholder="01012345678"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  자택전화
                </label>
                <input
                  type="tel"
                  value={formData.home_phone}
                  onChange={(e) => setFormData({...formData, home_phone: e.target.value})}
                  placeholder="0212345678"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  직장전화
                </label>
                <input
                  type="tel"
                  value={formData.work_phone}
                  onChange={(e) => setFormData({...formData, work_phone: e.target.value})}
                  placeholder="0212345678"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  이메일 *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  placeholder="example@email.com"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                주소
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="서울시 강남구..."
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* 학년 분류 & 학교 정보 */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 700, borderBottom: '2px solid var(--pri)', paddingBottom: '12px' }}>
              🎓 학년 분류
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  학년 분류
                </label>
                <select
                  value={formData.age_group}
                  onChange={(e) => setFormData({...formData, age_group: e.target.value})}
                  style={{ width: '100%' }}
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
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  학교명
                </label>
                <input
                  type="text"
                  value={formData.school_name}
                  onChange={(e) => setFormData({...formData, school_name: e.target.value})}
                  placeholder="OO초등학교"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  학년/반
                </label>
                <input
                  type="text"
                  value={formData.school_grade}
                  onChange={(e) => setFormData({...formData, school_grade: e.target.value})}
                  placeholder="3학년 2반"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* 신체 정보 */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 700, borderBottom: '2px solid var(--pri)', paddingBottom: '12px' }}>
              💪 신체 정보
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  신장 (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.height}
                  onChange={(e) => setFormData({...formData, height: e.target.value})}
                  placeholder="170.5"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  체중 (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  placeholder="65.5"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  혈액형
                </label>
                <select
                  value={formData.blood_type}
                  onChange={(e) => setFormData({...formData, blood_type: e.target.value})}
                  style={{ width: '100%' }}
                >
                  <option value="A">A형</option>
                  <option value="B">B형</option>
                  <option value="O">O형</option>
                  <option value="AB">AB형</option>
                  <option value="RH-">RH-</option>
                </select>
              </div>
            </div>
          </div>

          {/* 입관/단수 정보 */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 700, borderBottom: '2px solid var(--pri)', paddingBottom: '12px' }}>
              🥋 입관 & 단수 정보
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  입관일자
                </label>
                <input
                  type="date"
                  value={formData.admission_date}
                  onChange={(e) => setFormData({...formData, admission_date: e.target.value})}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  단(품)급
                </label>
                <input
                  type="text"
                  value={formData.dan_rank}
                  onChange={(e) => setFormData({...formData, dan_rank: e.target.value})}
                  placeholder="1단"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  단(품)급 취득일
                </label>
                <input
                  type="date"
                  value={formData.dan_rank_date}
                  onChange={(e) => setFormData({...formData, dan_rank_date: e.target.value})}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  단(품)번호
                </label>
                <input
                  type="text"
                  value={formData.dan_rank_number}
                  onChange={(e) => setFormData({...formData, dan_rank_number: e.target.value})}
                  placeholder="20250101"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* 보호자 정보 */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 700, borderBottom: '2px solid var(--pri)', paddingBottom: '12px' }}>
              👨‍👩‍👧 보호자 정보
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  부모님 직업
                </label>
                <input
                  type="text"
                  value={formData.parent_job}
                  onChange={(e) => setFormData({...formData, parent_job: e.target.value})}
                  placeholder="회사원"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* 회원권 정보 */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 700, borderBottom: '2px solid var(--pri)', paddingBottom: '12px' }}>
              💳 회원권 정보
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  회원권 선택
                </label>
                <select
                  value={formData.current_plan}
                  onChange={(e) => setFormData({...formData, current_plan: e.target.value})}
                  style={{ width: '100%' }}
                >
                  <option value="">선택 안 함</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      [{plan.category}] {plan.name} - {Number(plan.price).toLocaleString()}원
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  만료일
                </label>
                <input
                  type="date"
                  value={formData.expire_date}
                  onChange={(e) => setFormData({...formData, expire_date: e.target.value})}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  회원 상태
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  style={{ width: '100%' }}
                >
                  <option value="pending">승인대기</option>
                  <option value="active">활성</option>
                  <option value="paused">정지</option>
                  <option value="cancelled">해지</option>
                </select>
              </div>
            </div>
          </div>

          {/* 상세 정보 */}
          <div>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 700, borderBottom: '2px solid var(--pri)', paddingBottom: '12px' }}>
              📝 상세 정보
            </h2>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  입관 동기
                </label>
                <textarea
                  value={formData.admission_motivation}
                  onChange={(e) => setFormData({...formData, admission_motivation: e.target.value})}
                  rows={3}
                  placeholder="입관하게 된 동기를 작성해주세요..."
                  style={{ width: '100%', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  본인 성격
                </label>
                <textarea
                  value={formData.personality_description}
                  onChange={(e) => setFormData({...formData, personality_description: e.target.value})}
                  rows={3}
                  placeholder="성격을 작성해주세요 (예: 내성적, 외향적, 활발함 등)..."
                  style={{ width: '100%', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  본인 운동 소질
                </label>
                <textarea
                  value={formData.exercise_aptitude}
                  onChange={(e) => setFormData({...formData, exercise_aptitude: e.target.value})}
                  rows={3}
                  placeholder="운동 소질이나 경험을 작성해주세요..."
                  style={{ width: '100%', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  수련 보낸 이유
                </label>
                <textarea
                  value={formData.training_reason}
                  onChange={(e) => setFormData({...formData, training_reason: e.target.value})}
                  rows={3}
                  placeholder="수련을 보내는 이유를 작성해주세요..."
                  style={{ width: '100%', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  본인의 특기 사항
                </label>
                <textarea
                  value={formData.special_notes}
                  onChange={(e) => setFormData({...formData, special_notes: e.target.value})}
                  rows={3}
                  placeholder="특이사항이나 특기를 작성해주세요..."
                  style={{ width: '100%', fontFamily: 'inherit' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              padding: '16px 48px',
              fontSize: '18px',
              fontWeight: 700
            }}
          >
            {loading ? '등록 중...' : '✅ 회원 등록'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/members')}
            className="btn btn-secondary"
            style={{
              padding: '16px 48px',
              fontSize: '18px',
              fontWeight: 700
            }}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  )
}
