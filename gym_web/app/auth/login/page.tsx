'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      const apiBase = getApiUrl()
      const res = await axios.post(`${apiBase}/auth/login/`, {
        email,
        password
      }, {
        timeout: 10000
      })

      if (res.data.member) {
        // 로그인 성공 - localStorage에 회원 정보 저장
        localStorage.setItem('currentUser', JSON.stringify(res.data.member))
        localStorage.setItem('userEmail', email)
        
        // 메인 화면으로 이동
        router.push('/app')
      }
    } catch (err: any) {
      console.error('로그인 실패:', err)
      if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else if (err.code === 'ECONNABORTED') {
        setError('서버 응답 시간이 초과되었습니다. 다시 시도해주세요.')
      } else {
        setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      <div style={{ maxWidth: '420px', width: '100%' }}>
        {/* 로고 */}
        <div style={{ textAlign: 'center', marginBottom: '48px', animation: 'fadeIn 0.6s ease-out' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>💪</div>
          <h1 style={{
            fontSize: '40px',
            fontWeight: '900',
            color: 'white',
            margin: '0 0 8px 0',
            letterSpacing: '-1px'
          }}>
            펌피
          </h1>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.9)',
            margin: 0,
            fontWeight: '600'
          }}>
            나만의 피트니스 파트너
          </p>
        </div>

        {/* 로그인 카드 */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px 32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1a1a1a',
            margin: '0 0 32px 0',
            textAlign: 'center'
          }}>
            로그인
          </h2>

          <form onSubmit={handleLogin}>
            {/* 이메일 입력 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#666',
                marginBottom: '8px'
              }}>
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                disabled={loading}
                style={{
                  width: '100%',
                  height: '52px',
                  padding: '0 16px',
                  fontSize: '16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            {/* 비밀번호 입력 */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#666',
                marginBottom: '8px'
              }}>
                비밀번호
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '52px',
                    padding: '0 48px 0 16px',
                    fontSize: '16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* 비밀번호 찾기 */}
            <div style={{ textAlign: 'right', marginBottom: '24px' }}>
              <Link 
                href="/auth/reset-password"
                style={{
                  fontSize: '13px',
                  color: '#667eea',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div style={{
                background: '#fee',
                border: '2px solid #fcc',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '20px',
                fontSize: '14px',
                color: '#c33',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '56px',
                background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '18px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)',
                marginBottom: '20px'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>

            {/* 회원가입 링크 */}
            <div style={{
              textAlign: 'center',
              paddingTop: '20px',
              borderTop: '1px solid #f0f0f0'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#666',
                margin: '0 0 12px 0'
              }}>
                아직 회원이 아니신가요?
              </p>
              <Link
                href="/auth/register"
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  background: '#f5f5f5',
                  borderRadius: '10px',
                  color: '#667eea',
                  fontSize: '15px',
                  fontWeight: '700',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#667eea15'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f5f5f5'
                }}
              >
                회원가입하기
              </Link>
            </div>
          </form>
        </div>

        {/* 하단 정보 */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          color: 'white',
          fontSize: '13px',
          opacity: 0.8
        }}>
          <p style={{ margin: 0 }}>© 2025 Pumpy. All rights reserved.</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

