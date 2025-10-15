'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import './globals.css'
import Script from 'next/script'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()

  // 공개 페이지 및 회원 앱 페이지는 사이드바 숨김
  const isPublicPage = pathname === '/signup' || pathname === '/login' || pathname?.startsWith('/app')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (saved) {
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    }

    // 모바일에서는 초기에 사이드바 닫기
    const isMobile = window.innerWidth <= 768
    if (isMobile) {
      setSidebarOpen(false)
    }

    // Service Worker 등록 (PWA)
    if ('serviceWorker' in navigator && pathname?.startsWith('/app')) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => console.log('SW registered:', registration))
        .catch((error) => console.log('SW registration failed:', error))
    }
  }, [pathname])

  // 모바일에서 오버레이 클릭 시 사이드바 닫기
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (window.innerWidth <= 768 && sidebarOpen) {
        const target = e.target as HTMLElement
        // body의 ::before 오버레이를 클릭한 경우
        if (target === document.body) {
          setSidebarOpen(false)
        }
      }
    }

    if (sidebarOpen && window.innerWidth <= 768) {
      document.body.addEventListener('click', handleClick, true)
    }

    return () => {
      document.body.removeEventListener('click', handleClick, true)
    }
  }, [sidebarOpen])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const menuItems = [
    { href: '/', icon: '📊', label: '대시보드' },
    { href: '/members', icon: '👥', label: '회원 관리' },
    { href: '/pending', icon: '⏰', label: '승인 대기' },
    { href: '/schedule', icon: '📅', label: '수업 일정' },
    { href: '/plans', icon: '🎫', label: '상품 관리' },
    { href: '/analytics', icon: '📈', label: '분석' },
    { href: '/attendance', icon: '📝', label: '출결' },
    { href: '/revenue', icon: '💰', label: '매출' },
    { href: '/app', icon: '📱', label: '회원 앱' },
    { href: '/signup', icon: '✍️', label: '회원 신청' },
  ]

  if (isPublicPage) {
    return (
      <html lang="ko">
        <head>
          <title>💪 펌피 Pumpy</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
          <meta name="description" content="스마트한 체육관 관리 앱" />
          <meta name="theme-color" content="#667eea" />
          <link rel="manifest" href="/manifest.json" />
          <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
          <link
            rel="stylesheet"
            as="style"
            crossOrigin="anonymous"
            href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
          />
        </head>
        <body>{children}</body>
      </html>
    )
  }

  return (
    <html lang="ko">
      <head>
        <title>💪 펌피 Pumpy - 관리자</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="description" content="스마트한 체육관 관리 시스템" />
        <meta name="theme-color" content="#3182F6" />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          {/* Left Sidebar */}
          <aside style={{
            width: sidebarOpen ? '260px' : '70px',
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #1a1f3a 0%, #0f1419 100%)',
            color: 'white',
            transition: 'width 0.3s',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Logo */}
            <div style={{
              padding: sidebarOpen ? 'var(--spacing-2xl)' : 'var(--spacing-lg)',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              textAlign: sidebarOpen ? 'left' : 'center'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: sidebarOpen ? '24px' : '20px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                transition: 'font-size 0.3s'
              }}>
                {sidebarOpen ? '💪 펌피' : '💪'}
              </h2>
              {sidebarOpen && (
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.7 }}>
                  Gym Management
                </p>
              )}
            </div>

            {/* Menu Items */}
            <nav style={{ flex: 1, padding: 'var(--spacing-lg)', overflowY: 'auto' }}>
              {menuItems.map(item => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: sidebarOpen ? 'var(--spacing-md)' : '0',
                      justifyContent: sidebarOpen ? 'flex-start' : 'center',
                      padding: 'var(--spacing-md)',
                      borderRadius: 'var(--radius-lg)',
                      marginBottom: 'var(--spacing-sm)',
                      backgroundColor: isActive ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
                      color: 'white',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontWeight: isActive ? 700 : 500,
                      transition: 'all 0.2s',
                      border: isActive ? '1px solid rgba(102, 126, 234, 0.3)' : '1px solid transparent'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    {sidebarOpen && <span>{item.label}</span>}
                  </a>
                )
              })}
            </nav>

            {/* Bottom Controls */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: 'var(--spacing-lg)' }}>
              <button
                onClick={toggleTheme}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  gap: 'var(--spacing-md)',
                }}
              >
                <span>{theme === 'light' ? '🌙' : '☀️'}</span>
                {sidebarOpen && <span>{theme === 'light' ? '다크모드' : '라이트모드'}</span>}
              </button>
              
              {sidebarOpen && (
                <button
                  onClick={() => window.location.href = '/login'}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    marginTop: 'var(--spacing-md)',
                  }}
                >
                  🚪 로그아웃
                </button>
              )}

              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '20px',
                  marginTop: 'var(--spacing-md)',
                }}
              >
                {sidebarOpen ? '◀' : '▶'}
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div style={{
            marginLeft: sidebarOpen ? '260px' : '70px',
            flex: 1,
            transition: 'margin-left 0.3s',
            backgroundColor: 'var(--toss-gray-50)',
          }}>
            {/* Top Bar */}
            <header style={{
              backgroundColor: 'var(--card-bg)',
              borderBottom: '1px solid var(--line)',
              padding: 'var(--spacing-lg) var(--spacing-2xl)',
              position: 'sticky',
              top: 0,
              zIndex: 100,
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  {/* 모바일 햄버거 버튼 */}
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="mobile-menu-btn"
                    style={{
                      display: 'none',
                      padding: '8px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '24px',
                      color: 'var(--text)'
                    }}
                  >
                    ☰
                  </button>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>
                      {menuItems.find(m => m.href === pathname)?.label || '대시보드'}
                    </h2>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  <div className="badge primary">관리자</div>
                </div>
              </div>
            </header>

            {/* Page Content */}
            <main style={{
              padding: 'var(--spacing-3xl)',
              maxWidth: '1400px',
              margin: '0 auto',
            }}>
              {children}
            </main>
          </div>
        </div>

        <style jsx global>{`
          @media (max-width: 768px) {
            aside {
              position: fixed !important;
              left: ${sidebarOpen ? '0' : '-280px'} !important;
              width: 260px !important;
              transition: left 0.3s ease !important;
              z-index: 2000 !important;
            }
            
            body > div > div:last-child {
              margin-left: 0 !important;
            }

            main {
              margin-left: 0 !important;
              padding: var(--spacing-lg) !important;
            }

            header {
              padding: var(--spacing-md) !important;
            }

            /* 모바일 햄버거 버튼 */
            .mobile-menu-btn {
              display: block !important;
            }

            /* 카드 그리드 반응형 */
            div[style*="gridTemplateColumns"] {
              grid-template-columns: 1fr !important;
            }

            /* 오버레이 */
            ${sidebarOpen ? `
              body::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 1999;
                cursor: pointer;
              }
            ` : ''}
          }

          @media (min-width: 769px) {
            .mobile-menu-btn {
              display: none !important;
            }
          }
        `}</style>
      </body>
    </html>
  )
}
