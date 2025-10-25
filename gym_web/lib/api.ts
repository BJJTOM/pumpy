// API 연결을 위한 유틸리티 함수
// 개발/프로덕션 환경에 따라 자동 전환

const LOCAL_API_URL = 'http://localhost:8000/api'
const AWS_API_URL = '/api'  // 상대 경로 - Nginx 프록시 사용

export const getApiUrl = (): string => {
  // 브라우저 환경에서만 localStorage 체크
  if (typeof window !== 'undefined') {
    // 사용자가 설정한 서버 URL이 있으면 사용
    const savedApiUrl = localStorage.getItem('apiUrl')
    if (savedApiUrl) {
      return savedApiUrl.replace(/\/$/, '')
    }
    
    // localhost로 접속한 경우 로컬 API 사용
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return LOCAL_API_URL
    }
  }
  
  // AWS 또는 기타 환경에서는 상대 경로 사용 (Nginx 프록시)
  return AWS_API_URL
}

export const setApiUrl = (url: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('apiUrl', url)
  }
}

export const resetApiUrl = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('apiUrl')
  }
}

export const getFrontendUrl = (): string => {
  if (typeof window === 'undefined') {
    return 'http://localhost:3000'
  }

  const savedServerUrl = localStorage.getItem('serverUrl')
  if (savedServerUrl) {
    return savedServerUrl.replace(/\/$/, '')
  }

  const hostname = window.location.hostname
  const port = window.location.port || '3000'
  const protocol = window.location.protocol
  
  return `${protocol}//${hostname}${port ? ':' + port : ''}`
}

// API 호출 헬퍼 함수
export const apiCall = async (endpoint: string, options?: RequestInit) => {
  const apiUrl = getApiUrl()
  const url = `${apiUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API Call Error:', error)
    throw error
  }
}
