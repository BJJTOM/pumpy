'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 임시 인증 (실제로는 백엔드 API 연동 필요)
    if (formData.username === 'admin' && formData.password === 'admin') {
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('user', JSON.stringify({ username: 'admin', role: '관리자' }))
      alert('로그인 성공!')
      router.push('/')
    } else {
      alert('아이디 또는 비밀번호가 일치하지 않습니다')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--toss-blue) 0%, var(--toss-blue-light) 100%)',
      padding: 'var(--spacing-xl)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: 'var(--spacing-4xl)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-3xl)' }}>
          <div style={{ fontSize: 64, marginBottom: 'var(--spacing-lg)' }}>💪</div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, marginBottom: 'var(--spacing-xs)' }}>
            Gym Manager
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            관리자 로그인
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--spacing-xl)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 600, fontSize: '14px' }}>
              아이디
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              placeholder="admin"
              autoComplete="username"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 600, fontSize: '14px' }}>
              비밀번호
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" style={{ marginTop: 'var(--spacing-md)' }}>
            로그인
          </button>
        </form>

        <div style={{
          marginTop: 'var(--spacing-3xl)',
          padding: 'var(--spacing-lg)',
          backgroundColor: 'var(--toss-gray-50)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          fontSize: '14px'
        }}>
          <p style={{ margin: 0, color: 'var(--text-tertiary)' }}>
            💡 임시 계정<br/>
            ID: <b>admin</b> / PW: <b>admin</b>
          </p>
        </div>

        <div style={{ marginTop: 'var(--spacing-xl)', textAlign: 'center' }}>
          <a href="/signup" style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: 600 }}>
            회원 가입하기 (고객용) →
          </a>
        </div>
      </div>
    </div>
  )
}






