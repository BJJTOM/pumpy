'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ServerConfig() {
  const router = useRouter()
  const [serverUrl, setServerUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [savedUrl, setSavedUrl] = useState('')

  useEffect(() => {
    // 저장된 서버 URL 불러오기
    const saved = localStorage.getItem('serverUrl')
    if (saved) {
      setSavedUrl(saved)
      setServerUrl(saved)
    } else {
      // 기본값 설정
      setServerUrl('http://172.30.1.44:3000')
    }
  }, [])

  const testConnection = async (url: string) => {
    try {
      const response = await fetch(`${url}/api/dashboard/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      return response.ok
    } catch (error) {
      return false
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError('')

    // URL 형식 검증
    if (!serverUrl.startsWith('http://') && !serverUrl.startsWith('https://')) {
      setError('URL은 http:// 또는 https://로 시작해야 합니다')
      setIsLoading(false)
      return
    }

    // 연결 테스트
    const isConnected = await testConnection(serverUrl)
    
    if (isConnected) {
      localStorage.setItem('serverUrl', serverUrl)
      setSavedUrl(serverUrl)
      setError('')
      alert('서버 연결 성공! 앱 메인으로 이동합니다.')
      router.push('/app')
    } else {
      setError('서버에 연결할 수 없습니다. URL과 서버 실행 상태를 확인하세요.')
    }
    
    setIsLoading(false)
  }

  const handleSkip = () => {
    if (savedUrl) {
      router.push('/app')
    } else {
      setError('먼저 서버 URL을 설정해주세요')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          fontSize: '48px',
          textAlign: 'center',
          marginBottom: '10px'
        }}>
          ⚙️
        </div>
        
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          서버 설정
        </h1>

        <p style={{
          textAlign: 'center',
          color: '#666',
          fontSize: '14px',
          marginBottom: '30px'
        }}>
          백엔드 서버 주소를 입력하세요
        </p>

        {savedUrl && (
          <div style={{
            backgroundColor: '#e8f5e9',
            padding: '12px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#2e7d32'
          }}>
            ✓ 현재 설정: {savedUrl}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '8px',
            color: '#333'
          }}>
            서버 URL
          </label>
          <input
            type="text"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="http://192.168.0.10:3000"
            style={{
              width: '100%',
              padding: '14px',
              border: '2px solid #e0e0e0',
              borderRadius: '10px',
              fontSize: '15px',
              outline: 'none',
              transition: 'border 0.3s',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
          <p style={{
            fontSize: '12px',
            color: '#999',
            marginTop: '8px'
          }}>
            예: http://172.30.1.44:3000
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '12px',
            borderRadius: '10px',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={isLoading || !serverUrl}
          style={{
            width: '100%',
            padding: '16px',
            background: isLoading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginBottom: '12px',
            transition: 'transform 0.2s',
          }}
          onMouseDown={(e) => !isLoading && (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isLoading ? '연결 테스트 중...' : '저장 및 연결 테스트'}
        </button>

        {savedUrl && (
          <button
            onClick={handleSkip}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: 'transparent',
              color: '#667eea',
              border: '2px solid #667eea',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f4ff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            건너뛰기
          </button>
        )}

        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '12px'
        }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '12px',
            color: '#333'
          }}>
            💡 서버 URL 찾는 방법
          </h3>
          <ol style={{
            fontSize: '13px',
            color: '#666',
            paddingLeft: '20px',
            margin: 0,
            lineHeight: '1.8'
          }}>
            <li>컴퓨터에서 CMD 실행</li>
            <li><code>ipconfig</code> 입력</li>
            <li>IPv4 주소 확인 (예: 172.30.1.44)</li>
            <li>http://확인한IP:3000 입력</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

