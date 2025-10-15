// API 연결을 위한 유틸리티 함수

export const getApiUrl = (): string => {
  // 브라우저 환경에서만 실행
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api'
  }

  // localStorage에서 저장된 서버 URL 확인 (앱에서 설정한 경우)
  const savedServerUrl = localStorage.getItem('serverUrl')
  
  if (savedServerUrl) {
    // LocalTunnel URL 처리
    if (savedServerUrl.includes('loca.lt')) {
      // pumpy-app-2025.loca.lt -> pumpy-api-2025.loca.lt
      const apiUrl = savedServerUrl
        .replace('pumpy-app-2025', 'pumpy-api-2025')
        .replace(/\/$/, '') + '/api'
      return apiUrl
    }
    
    // 일반 IP:PORT 형식 처리 (3000 -> 8000)
    const apiUrl = savedServerUrl.replace(':3000', ':8000').replace(/\/$/, '') + '/api'
    return apiUrl
  }

  // localStorage에 없으면 현재 호스트 기반으로 API URL 생성
  const hostname = window.location.hostname
  const protocol = window.location.protocol
  
  // localhost나 127.0.0.1인 경우
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api'
  }
  
  // LocalTunnel URL인 경우
  if (hostname.includes('loca.lt')) {
    const apiUrl = `${protocol}//${hostname.replace('pumpy-app-2025', 'pumpy-api-2025')}/api`
    return apiUrl
  }
  
  // 그 외의 경우 (모바일이나 외부 접속)
  return `http://${hostname}:8000/api`
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

