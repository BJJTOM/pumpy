'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [serverCode, setServerCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

  // 인증 코드 전송
  const sendResetCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('이메일을 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      const apiBase = getApiUrl()
      const res = await axios.post(`${apiBase}/auth/reset-password/`, {
        email
      }, {
        timeout: 10000
      })

      setServerCode(res.data.code || '') // 개발용
      setStep('code')
      alert(`인증 코드가 이메일로 전송되었습니다. (개발용: ${res.data.code})`)
    } catch (err: any) {
      console.error('인증 코드 전송 실패:', err)
      setError('이메일 전송 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 인증 코드 확인
  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!code) {
      setError('인증 코드를 입력해주세요.')
      return
    }

    // 간단한 검증 (실제로는 서버에서 검증)
    if (code.length !== 6) {
      setError('인증 코드는 6자리입니다.')
      return
    }

    setStep('password')
  }

  // 비밀번호 재설정
  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!newPassword || !newPasswordConfirm) {
      setError('새 비밀번호를 입력해주세요.')
      return
    }

    if (newPassword !== newPasswordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (newPassword.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.')
      return
    }

    setLoading(true)

    try {
      const apiBase = getApiUrl()
      await axios.post(`${apiBase}/auth/reset-password-confirm/`, {
        email,
        code,
        new_password: newPassword
      }, {
        timeout: 10000
      })

      alert('비밀번호가 성공적으로 변경되었습니다.')
      router.push('/auth/login')
    } catch (err: any) {
      console.error('비밀번호 재설정 실패:', err)
      if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError('비밀번호 재설정 중 오류가 발생했습니다.')
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
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔐</div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '900',
            color: 'white',
            margin: '0 0 8px 0'
          }}>
            비밀번호 찾기
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.9)',
            margin: 0
          }}>
            {step === 'email' && '가입하신 이메일을 입력해주세요'}
            {step === 'code' && '이메일로 전송된 인증 코드를 입력해주세요'}
            {step === 'password' && '새로운 비밀번호를 설정해주세요'}
          </p>
        </div>

        {/* 카드 */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px 32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          {/* STEP 1: 이메일 입력 */}
          {step === 'email' && (
            <form onSubmit={sendResetCode}>
              <div style={{ marginBottom: '24px' }}>
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
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>

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
                  boxShadow: loading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)',
                  marginBottom: '16px'
                }}
              >
                {loading ? '전송 중...' : '인증 코드 전송'}
              </button>

              <div style={{ textAlign: 'center' }}>
                <Link
                  href="/auth/login"
                  style={{
                    fontSize: '14px',
                    color: '#667eea',
                    fontWeight: '600',
                    textDecoration: 'none'
                  }}
                >
                  로그인으로 돌아가기
                </Link>
              </div>
            </form>
          )}

          {/* STEP 2: 인증 코드 입력 */}
          {step === 'code' && (
            <form onSubmit={verifyCode}>
              <div style={{
                background: '#f0f0f0',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                  인증 코드 전송 완료
                </div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#667eea' }}>
                  {email}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#666',
                  marginBottom: '8px'
                }}>
                  인증 코드 (6자리)
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  maxLength={6}
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '52px',
                    padding: '0 16px',
                    fontSize: '24px',
                    fontWeight: '700',
                    textAlign: 'center',
                    letterSpacing: '4px',
                    border: '2px solid #667eea',
                    borderRadius: '12px',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

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

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                style={{
                  width: '100%',
                  height: '56px',
                  background: (loading || code.length !== 6) ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: (loading || code.length !== 6) ? 'not-allowed' : 'pointer',
                  boxShadow: (loading || code.length !== 6) ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)',
                  marginBottom: '16px'
                }}
              >
                확인
              </button>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '14px',
                    color: '#667eea',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  이메일 다시 입력
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: 새 비밀번호 설정 */}
          {step === 'password' && (
            <form onSubmit={resetPassword}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#666',
                  marginBottom: '8px'
                }}>
                  새 비밀번호 (8자 이상)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="새 비밀번호"
                    disabled={loading}
                    style={{
                      width: '100%',
                      height: '52px',
                      padding: '0 48px 0 16px',
                      fontSize: '16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      outline: 'none',
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
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#666',
                  marginBottom: '8px'
                }}>
                  새 비밀번호 확인
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPasswordConfirm ? 'text' : 'password'}
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    placeholder="새 비밀번호 확인"
                    disabled={loading}
                    style={{
                      width: '100%',
                      height: '52px',
                      padding: '0 48px 0 16px',
                      fontSize: '16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      fontSize: '20px',
                      cursor: 'pointer'
                    }}
                  >
                    {showPasswordConfirm ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

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
                  boxShadow: loading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)'
                }}
              >
                {loading ? '변경 중...' : '비밀번호 변경'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}










