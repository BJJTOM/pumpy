'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="landing-page">
      <style jsx>{`
        .landing-page {
          min-height: 100vh;
          background: #0a0e27;
          color: white;
          overflow-x: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: ${scrolled ? '15px 50px' : '25px 50px'};
          background: ${scrolled ? 'rgba(10, 14, 39, 0.95)' : 'transparent'};
          backdrop-filter: ${scrolled ? 'blur(20px)' : 'none'};
          transition: all 0.3s ease;
          z-index: 1000;
          border-bottom: ${scrolled ? '1px solid rgba(255,255,255,0.1)' : 'none'};
        }

        .logo {
          font-size: 32px;
          font-weight: 900;
          display: flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-buttons {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .btn {
          padding: 14px 32px;
          border-radius: 50px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          border: none;
          font-size: 16px;
          position: relative;
          overflow: hidden;
          display: inline-block;
        }

        .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }

        .btn:hover::before {
          left: 100%;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }

        .btn-primary:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-3px);
        }

        .hero {
          text-align: center;
          padding: 180px 20px 120px;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%);
          border-radius: 50%;
          z-index: 0;
          animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.5; }
          50% { transform: translateX(-50%) scale(1.1); opacity: 0.8; }
        }

        .hero-content {
          position: relative;
          z-index: 1;
        }

        .badge {
          display: inline-block;
          background: rgba(102, 126, 234, 0.2);
          border: 1px solid rgba(102, 126, 234, 0.4);
          padding: 10px 24px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 30px;
          backdrop-filter: blur(10px);
          animation: fadeInUp 0.8s ease;
        }

        .hero h1 {
          font-size: 72px;
          font-weight: 900;
          margin-bottom: 25px;
          line-height: 1.1;
          background: linear-gradient(135deg, #fff 0%, #667eea 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: fadeInUp 0.8s ease 0.2s backwards;
        }

        .hero p {
          font-size: 24px;
          opacity: 0.8;
          margin-bottom: 50px;
          line-height: 1.6;
          animation: fadeInUp 0.8s ease 0.4s backwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
          animation: fadeInUp 0.8s ease 0.6s backwards;
        }

        .features {
          background: linear-gradient(180deg, #0a0e27 0%, #1a1f3a 100%);
          color: white;
          padding: 120px 20px;
          position: relative;
        }

        .features::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.5), transparent);
        }

        .features-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .features h2 {
          text-align: center;
          font-size: 56px;
          margin-bottom: 20px;
          font-weight: 900;
          background: linear-gradient(135deg, #fff 0%, #667eea 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .features-subtitle {
          text-align: center;
          font-size: 20px;
          opacity: 0.7;
          margin-bottom: 80px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 30px;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.05);
          padding: 45px;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transform: scaleX(0);
          transition: transform 0.4s;
        }

        .feature-card:hover::before {
          transform: scaleX(1);
        }

        .feature-card:hover {
          transform: translateY(-12px);
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(102, 126, 234, 0.3);
          box-shadow: 0 20px 60px rgba(102, 126, 234, 0.2);
        }

        .feature-icon {
          font-size: 56px;
          margin-bottom: 24px;
          display: inline-block;
          transition: transform 0.4s;
        }

        .feature-card:hover .feature-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .feature-card h3 {
          font-size: 26px;
          margin-bottom: 16px;
          font-weight: 700;
        }

        .feature-card p {
          opacity: 0.8;
          line-height: 1.8;
          font-size: 16px;
        }

        .stats {
          background: #0a0e27;
          padding: 120px 20px;
          position: relative;
          overflow: hidden;
        }

        .stats::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.5), transparent);
        }

        .stats-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 50px;
          text-align: center;
        }

        .stat-card {
          position: relative;
          padding: 40px 20px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.4s;
        }

        .stat-card:hover {
          background: rgba(102, 126, 234, 0.1);
          border-color: rgba(102, 126, 234, 0.3);
          transform: scale(1.05);
        }

        .stat-card h3 {
          font-size: 64px;
          font-weight: 900;
          margin-bottom: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-card p {
          font-size: 18px;
          opacity: 0.8;
          font-weight: 600;
        }

        .cta {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 120px 20px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .cta::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: rotate 20s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .cta-content {
          position: relative;
          z-index: 1;
        }

        .cta h2 {
          font-size: 56px;
          color: white;
          margin-bottom: 20px;
          font-weight: 900;
        }

        .cta p {
          font-size: 22px;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 50px;
        }

        .footer {
          background: #0a0e27;
          color: white;
          padding: 60px 20px 40px;
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .footer p {
          opacity: 0.6;
          margin: 8px 0;
        }

        .footer-logo {
          font-size: 36px;
          font-weight: 900;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 15px 20px;
            flex-direction: column;
            gap: 15px;
          }

          .hero h1 {
            font-size: 40px;
          }

          .hero p {
            font-size: 18px;
          }

          .features h2,
          .cta h2 {
            font-size: 32px;
          }

          .stat-card h3 {
            font-size: 40px;
          }
        }
      `}</style>

      {/* Navigation */}
      <nav className="navbar">
        <div className="logo">
          <span>💪</span>
          <span>펌피</span>
        </div>
        <div className="nav-buttons">
          <Link href="/login" className="btn btn-secondary">로그인</Link>
          <Link href="/signup" className="btn btn-primary">무료 시작하기</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="badge">✨ 2025 최신 헬스장 관리 솔루션</div>
          <h1>헬스장 관리의<br/>새로운 기준</h1>
          <p>회원 관리부터 매출 분석까지, AI 기반 스마트 관리<br/>지금 바로 무료로 시작하세요</p>
          <div className="hero-buttons">
            <Link href="/signup" className="btn btn-primary" style={{fontSize: '20px', padding: '18px 50px'}}>
              무료 시작하기 →
            </Link>
            <Link href="/app" className="btn btn-secondary" style={{fontSize: '20px', padding: '18px 50px'}}>
              데모 체험하기
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          <h2>왜 펌피인가요?</h2>
          <p className="features-subtitle">헬스장 운영을 더 쉽고 효율적으로 만드는 올인원 솔루션</p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>스마트 회원 관리</h3>
              <p>회원 등록, 출석 체크, 회원권 관리를 한 번에. 실시간으로 회원 상태를 파악하고 맞춤형 서비스를 제공하세요.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>실시간 매출 분석</h3>
              <p>일별, 월별 매출을 한눈에 확인하고, 데이터 기반의 경영 결정을 내리세요. 자동화된 리포트로 시간을 절약하세요.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>모바일 회원 앱</h3>
              <p>회원들이 언제 어디서나 출석 확인, 운동 기록, 식단 관리를 할 수 있는 전용 앱을 제공합니다.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🏋️</div>
              <h3>WOD & 수업 관리</h3>
              <p>크로스핏 WOD, 그룹 수업 스케줄을 쉽게 관리하고 회원들과 공유하세요.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>자동 결제 시스템</h3>
              <p>회원권 만료 알림, 자동 결제 처리로 매출 누락을 방지하세요.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>스마트 알림</h3>
              <p>회원권 만료, 생일, 장기 미출석 회원에게 자동으로 알림을 보내 고객 관리를 자동화하세요.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stats-container">
          <div className="stat-card">
            <h3>1,000+</h3>
            <p>사용 중인 헬스장</p>
          </div>
          <div className="stat-card">
            <h3>50,000+</h3>
            <p>활성 회원 수</p>
          </div>
          <div className="stat-card">
            <h3>99.9%</h3>
            <p>시스템 안정성</p>
          </div>
          <div className="stat-card">
            <h3>24/7</h3>
            <p>고객 지원</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-content">
          <h2>지금 바로 시작하세요</h2>
          <p>14일 무료 체험 • 신용카드 불필요 • 언제든 해지 가능</p>
          <Link href="/signup" className="btn btn-primary" style={{fontSize: '22px', padding: '20px 60px', background: 'white', color: '#667eea'}}>
            무료로 시작하기 →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">💪 펌피</div>
          <p>헬스장 관리의 새로운 기준</p>
          <p style={{marginTop: '30px'}}>© 2025 Pumpy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

