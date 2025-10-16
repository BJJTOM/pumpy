'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import '../globals.css'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    // 항상 로그인 체크 (서버 설정 화면 제거됨)
    const user = localStorage.getItem('currentUser')
    if (!user) {
      router.push('/auth/login')
      return
    }
    setCurrentUser(JSON.parse(user))
  }, [pathname, router])

  return (
    <html lang="ko">
      <head>
        <title>펌피 - 나만의 피트니스 파트너</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#667eea" />
        <meta name="description" content="펌피와 함께하는 스마트 피트니스 라이프" />
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        backgroundColor: '#f5f7fa'
      }}>
        {/* 앱 전용 레이아웃 - 사이드바 없음 */}
        {children}
      </body>
    </html>
  )
}

