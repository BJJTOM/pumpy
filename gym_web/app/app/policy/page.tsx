'use client'
import { useRouter } from 'next/navigation'
import BottomNav from '../components/BottomNav'

export default function PolicyPage() {
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
            개인정보 처리방침
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
            <p style={{ fontSize: '14px', marginBottom: '30px', color: '#666' }}>
              Pumpy 체육관(이하 "회사")은 개인정보보호법에 따라 이용자의 개인정보 보호 및 권익을 보호하고 개인정보와 관련한 이용자의 고충을 원활하게 처리할 수 있도록 다음과 같은 처리방침을 두고 있습니다.
            </p>

            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>1. 개인정보의 처리 목적</h2>
            <p style={{ fontSize: '14px', marginBottom: '10px' }}>
              회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <p style={{ fontSize: '14px', marginBottom: '10px' }}>
              가. 회원가입 및 관리: 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리
            </p>
            <p style={{ fontSize: '14px', marginBottom: '30px' }}>
              나. 서비스 제공: 출석 관리, 운동 프로그램 정보 제공, 맞춤 서비스 제공
            </p>

            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>2. 개인정보의 처리 및 보유 기간</h2>
            <p style={{ fontSize: '14px', marginBottom: '10px' }}>
              ① 회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
            </p>
            <p style={{ fontSize: '14px', marginBottom: '10px' }}>
              ② 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
            </p>
            <p style={{ fontSize: '14px', marginBottom: '10px' }}>
              - 회원 정보: 회원 탈퇴 시까지
            </p>
            <p style={{ fontSize: '14px', marginBottom: '30px' }}>
              - 출석 기록: 회원 탈퇴 후 1년
            </p>

            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>3. 처리하는 개인정보의 항목</h2>
            <p style={{ fontSize: '14px', marginBottom: '10px' }}>
              회사는 다음의 개인정보 항목을 처리하고 있습니다.
            </p>
            <p style={{ fontSize: '14px', marginBottom: '10px' }}>
              가. 필수항목: 이름, 전화번호, 이메일, 생년월일, 성별
            </p>
            <p style={{ fontSize: '14px', marginBottom: '30px' }}>
              나. 선택항목: 주소, 체중, 신장 등 신체 정보
            </p>

            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>4. 개인정보의 제3자 제공</h2>
            <p style={{ fontSize: '14px', marginBottom: '30px' }}>
              회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
            </p>

            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>5. 개인정보의 파기</h2>
            <p style={{ fontSize: '14px', marginBottom: '10px' }}>
              ① 회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
            </p>
            <p style={{ fontSize: '14px', marginBottom: '10px' }}>
              ② 정보주체로부터 동의받은 개인정보 보유기간이 경과하거나 처리목적이 달성되었음에도 불구하고 다른 법령에 따라 개인정보를 계속 보존하여야 하는 경우에는, 해당 개인정보를 별도의 데이터베이스(DB)로 옮기거나 보관장소를 달리하여 보존합니다.
            </p>
            <p style={{ fontSize: '14px', marginBottom: '30px' }}>
              ③ 개인정보 파기의 절차 및 방법은 다음과 같습니다.
              <br />- 파기절차: 불필요한 개인정보 및 개인정보파일은 개인정보책임자의 책임 하에 내부방침 절차에 따라 즉시 파기합니다.
              <br />- 파기방법: 전자적 파일 형태로 기록·저장된 개인정보는 기록을 재생할 수 없도록 파기하며, 종이 문서에 기록·저장된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.
            </p>

            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>6. 정보주체의 권리·의무 및 행사방법</h2>
            <p style={{ fontSize: '14px', marginBottom: '10px' }}>
              ① 정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
            </p>
            <p style={{ fontSize: '14px', marginBottom: '30px' }}>
              1. 개인정보 열람요구
              <br />2. 오류 등이 있을 경우 정정 요구
              <br />3. 삭제요구
              <br />4. 처리정지 요구
            </p>

            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>7. 개인정보 보호책임자</h2>
            <p style={{ fontSize: '14px', marginBottom: '10px' }}>
              회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <p style={{ fontSize: '14px', marginBottom: '30px' }}>
              ▶ 개인정보 보호책임자
              <br />성명: 홍길동
              <br />직책: 대표
              <br />연락처: 02-1234-5678
              <br />이메일: privacy@pumpy.com
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

