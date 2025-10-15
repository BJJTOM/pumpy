'use client'

import { useRouter } from 'next/navigation'

interface AppHeaderProps {
  title?: string
  showBack?: boolean
  rightButton?: React.ReactNode
}

export default function AppHeader({ title, showBack, rightButton }: AppHeaderProps) {
  const router = useRouter()

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      borderBottom: '1px solid #f0f0f0',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 50,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      {/* 왼쪽: 뒤로가기 또는 로고 */}
      <div style={{ width: '40px' }}>
        {showBack && (
          <button
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ←
          </button>
        )}
      </div>

      {/* 중앙: 타이틀 또는 로고 */}
      <div style={{
        flex: 1,
        textAlign: 'center',
        fontSize: title ? '18px' : '24px',
        fontWeight: title ? 700 : 900,
        color: '#333'
      }}>
        {title || '💪 펌피'}
      </div>

      {/* 오른쪽: 커스텀 버튼 */}
      <div style={{ width: '40px', textAlign: 'right' }}>
        {rightButton}
      </div>
    </header>
  )
}

