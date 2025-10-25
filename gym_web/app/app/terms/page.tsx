'use client'
import { useRouter } from 'next/navigation'
import BottomNav from '../components/BottomNav'

export default function TermsPage() {
  const router = useRouter()

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0f2f5',
      paddingBottom: '100px'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <div
            onClick={() => router.back()}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            ←
          </div>
          <h1 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 800,
            color: '#1f2937'
          }}>
            이용약관
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 2px 15px rgba(0,0,0,0.08)'
        }}>
          <div style={{ color: '#333', lineHeight: '1.8' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>제1조 (목적)</h2>
            <p style={{ fontSize: '14px', marginBottom: '30px' }}>
              본 약관은 Pumpy 체육관(이하 "회사")이 제공하는 모바일 애플리케이션 서비스(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>

            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>제2조 (정의)</h2>
            <p style={{ fontSize: '14px', marginBottom: '10px' }}>
              1. "서비스"란 회사가 제공하는 체육관 회원 관리 및 운동 정보 제공 서비스를 의미합니다.
            </p>
            <p style={{ fontSize: '14px', marginBottom: '10px' }}>
              2. "회원"이란 본 약관에 동의하고 회사와 서비스 이용계약을 체결한 자를 의미합니다.
            </p>
            <p style={{ fontSize: '14px', marginBottom: '30px' }}>
              3. "아이디(ID)"란 회원의 식별과 서비스 이용을 위하여 회원이 정하고 회사가 승인하는 문자와 숫자의 조합을 의미합니다.
            </p>

            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>제3조 (약관의 효력 및 변경)</h2>
            <p style={{ fontSize: '14px', marginBottom: '10px' }}>
              1. 본 약관은 서비스를 이용하고자 하는 모든 회원에 대하여 그 효력을 발생합니다.
            </p>
            <p style={{ fontSize: '14px', marginBottom: '10px' }}>
              2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위 내에서 본 약관을 변경할 수 있습니다.
            </p>
            <p style={{ fontSize: '14px', marginBottom: '30px' }}>
              3. 약관이 변경되는 경우 회사는 변경사항을 시행일자 7일 전부터 공지합니다.
            </p>

            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>제4조 (회원가입)</h2>
            <p style={{ fontSize: '14px', marginBottom: '10px' }}>
              1. 회원가입은 이용자가 약관의 내용에 동의하고 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 회원가입신청을 하여 회사가 이를 승낙함으로써 체결됩니다.
            </p>
            <p style={{ fontSize: '14px', marginBottom: '30px' }}>
              2. 회사는 다음 각 호에 해당하는 경우 회원가입을 거부할 수 있습니다.
              <br />- 가입신청자가 본 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우
              <br />- 실명이 아니거나 타인의 명의를 이용한 경우
              <br />- 허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우
            </p>

            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>제5조 (서비스의 제공 및 변경)</h2>
            <p style={{ fontSize: '14px', marginBottom: '10px' }}>
              1. 회사는 다음과 같은 서비스를 제공합니다.
              <br />- 회원 출석 관리
              <br />- 운동 프로그램 정보 제공
              <br />- 체육관 시설 이용 정보
              <br />- 기타 회사가 정하는 서비스
            </p>
            <p style={{ fontSize: '14px', marginBottom: '30px' }}>
              2. 회사는 운영상, 기술상의 필요에 따라 제공하고 있는 서비스를 변경할 수 있습니다.
            </p>

            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>제6조 (서비스 이용시간)</h2>
            <p style={{ fontSize: '14px', marginBottom: '30px' }}>
              1. 서비스의 이용은 연중무휴 1일 24시간을 원칙으로 합니다. 다만, 회사의 업무상 또는 기술상의 이유로 서비스가 일시 중지될 수 있으며, 운영상의 목적으로 회사가 정한 기간에는 서비스가 일시 중지될 수 있습니다.
            </p>

            <div style={{
              marginTop: '40px',
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                최종 업데이트: 2024년 1월 1일
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

