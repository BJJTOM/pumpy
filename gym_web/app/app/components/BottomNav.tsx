'use client'

import { useRouter, usePathname } from 'next/navigation'

interface NavItem {
  icon: string
  label: string
  path: string
}

const NAV_ITEMS: NavItem[] = [
  { icon: '🏠', label: '홈', path: '/app' },
  { icon: '👥', label: '커뮤니티', path: '/app/community' },
  { icon: '📋', label: '내정보', path: '/app/info' },
  { icon: '🔔', label: '알림', path: '/app/notifications' },
  { icon: '👤', label: '프로필', path: '/app/profile' }
]

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      borderRadius: '30px 30px 0 0',
      padding: '15px 20px 25px',
      boxShadow: '0 -5px 30px rgba(0,0,0,0.15)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 100
    }}>
      {NAV_ITEMS.map((item) => (
        <NavButton
          key={item.path}
          icon={item.icon}
          label={item.label}
          active={pathname === item.path}
          onClick={() => router.push(item.path)}
        />
      ))}
    </nav>
  )
}

function NavButton({ icon, label, active, onClick }: {
  icon: string
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        textAlign: 'center',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '15px',
        transition: 'all 0.2s',
        backgroundColor: active ? '#667eea15' : 'transparent'
      }}
    >
      <div style={{
        fontSize: '26px',
        marginBottom: '5px',
        filter: active ? 'drop-shadow(0 2px 4px rgba(102, 126, 234, 0.4))' : 'none'
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: '11px',
        fontWeight: active ? 700 : 600,
        color: active ? '#667eea' : '#999'
      }}>
        {label}
      </div>
    </button>
  )
}

