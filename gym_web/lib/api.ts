// API 연결을 위한 유틸리티 함수
// 개발/프로덕션 환경에 따라 자동 전환

const LOCAL_API_URL = 'http://localhost:8000/api'
const AWS_API_URL = 'http://3.27.28.175/api'  // 절대 경로 - WebView 호환성

// 환경 변수에서 API URL 가져오기 (빌드 시 최적화)
const PRODUCTION_API_URL = process.env.NEXT_PUBLIC_API_URL || AWS_API_URL

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
  
  // AWS 또는 기타 환경에서는 프로덕션 API 사용
  return PRODUCTION_API_URL
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

// API 호출 헬퍼 함수 (타임아웃 및 재시도 로직 포함)
export const apiCall = async (
  endpoint: string, 
  options?: RequestInit,
  retries: number = 2,
  timeout: number = 10000
) => {
  const apiUrl = getApiUrl()
  const url = `${apiUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      const isLastAttempt = attempt === retries
      
      if (isLastAttempt) {
        console.error(`API Call Error (${url}):`, error)
        throw error
      }
      
      // 재시도 전 대기 (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500))
    }
  }
}
