// API 연결을 위한 유틸리티 함수
// AWS 서버 고정 사용

const AWS_API_URL = 'http://3.27.28.175:8000/api'

export const getApiUrl = (): string => {
  // 항상 AWS 서버 URL 반환
  return AWS_API_URL
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

