'use client'
import { useRouter } from 'next/navigation'
import BottomNav from '../components/BottomNav'

export default function NoticesPage() {
  const router = useRouter()

  const notices = [
    {
      id: 1,
      title: '신규 프리미엄 기능 출시 안내',
      date: '2024.01.15',
      content: 'AI 맞춤 코칭 및 개인별 식단 추천 서비스가 새롭게 출시되었습니다.',
      isNew: true
    },
    {
      id: 2,
      title: '설 연휴 운영 안내',
      date: '2024.01.10',
      content: '설 연휴 기간(2/9-2/12) 정상 운영합니다. 많은 이용 부탁드립니다.',
      isNew: true
    },
    {
      id: 3,
      title: '겨울 특별 이벤트 진행',
      date: '2024.01.05',
      content: '새해 맞이 특별 할인 이벤트가 진행됩니다. 프리미엄 구독 30% 할인!',
      isNew: false
    },
    {
      id: 4,
      title: '앱 업데이트 완료',
      date: '2024.01.01',
      content: '안정성 개선 및 새로운 기능이 추가된 v1.0.0 업데이트가 완료되었습니다.',
      isNew: false
    },
    {
      id: 5,
      title: '개인정보 처리방침 변경 안내',
      date: '2023.12.20',
      content: '개인정보 처리방침이 일부 변경되었습니다. 자세한 내용은 설정에서 확인해주세요.',
      isNew: false
    }
  ]

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
            공지사항
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        <div style={{
          display: 'grid',
          gap: '12px'
        }}>
          {notices.map(notice => (
            <NoticeItem
              key={notice.id}
              title={notice.title}
              date={notice.date}
              content={notice.content}
              isNew={notice.isNew}
            />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

function NoticeItem({ title, date, content, isNew }: any) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '15px',
      padding: '20px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      cursor: 'pointer',
      transition: 'transform 0.2s'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)'
      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.12)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '10px'
      }}>
        {isNew && (
          <span style={{
            padding: '3px 8px',
            background: '#ef4444',
            color: 'white',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 800
          }}>
            NEW
          </span>
        )}
        <span style={{
          fontSize: '13px',
          color: '#999',
          fontWeight: 600
        }}>
          {date}
        </span>
      </div>
      <h3 style={{
        margin: '0 0 10px 0',
        fontSize: '16px',
        fontWeight: 800,
        color: '#333'
      }}>
        {title}
      </h3>
      <p style={{
        margin: 0,
        fontSize: '14px',
        color: '#666',
        lineHeight: '1.6'
      }}>
        {content}
      </p>
    </div>
  )
}

