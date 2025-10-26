import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

// API URL - AWS 서버
const API_BASE_URL = 'http://3.27.28.175/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// 토큰 보관 (인터셉터에서 즉시 접근 가능하도록 메모리에도 보관)
let authToken: string | null = null

export async function setToken(token: string) {
  authToken = token
  await AsyncStorage.setItem('userToken', token)
  api.defaults.headers.common['Authorization'] = `Token ${token}`
}

export async function clearToken() {
  authToken = null
  await AsyncStorage.removeItem('userToken')
  delete api.defaults.headers.common['Authorization']
}

export async function loadTokenFromStorage() {
  const token = await AsyncStorage.getItem('userToken')
  if (token) {
    authToken = token
    api.defaults.headers.common['Authorization'] = `Token ${token}`
  }
}

// 요청 인터셉터 (토큰 자동 첨부)
api.interceptors.request.use(async (config) => {
  if (!authToken) {
    const token = await AsyncStorage.getItem('userToken')
    if (token) {
      authToken = token
    }
  }
  if (authToken) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Token ${authToken}`
  }
  return config
})

// 인증/회원가입 API
export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login/', { email, password }),
  register: (data: any) => api.post('/auth/register/', data),
  publicSignup: (data: any) => api.post('/public/signup/', data),
}

// 회원/출석 API
export const memberAPI = {
  getProfile: (id: number) => api.get(`/members/${id}/`),
  updateProfile: (id: number, data: any) => api.patch(`/members/${id}/`, data),
  getAttendance: (memberId: number) => api.get(`/attendance/?member_id=${memberId}`),
  weeklyAttendance: () => api.get('/attendance/weekly_stats/'),
  dashboardStats: () => api.get('/members/dashboard_stats/'),
  createAttendance: (memberId: number, dateIso?: string) =>
    api.post('/attendance/', { member: memberId, date: dateIso }),
}

export const attendanceAPI = {
  getMonthlyStats: (memberId: number, year: number, month: number) =>
    api.get(`/attendance/monthly_stats/?member_id=${memberId}&year=${year}&month=${month}`),
  createAttendance: (memberId: number) =>
    api.post('/attendance/', { member: memberId, date: new Date().toISOString().split('T')[0], status: '출석' }),
}

// 회원권/매출 API
export const membershipAPI = {
  getPlans: () => api.get('/plans/'),
  subscribe: (data: any) => api.post('/subscriptions/', data),
  createRevenue: (data: any) => api.post('/revenue/', data),
}

// 커뮤니티 API v3 - 완전 고도화
export const communityAPI = {
  // 게시글
  getPosts: (params?: any) => api.get('/posts/', { params }),
  getPost: (id: number) => api.get(`/posts/${id}/`),
  createPost: (data: any) => api.post('/posts/', data),
  updatePost: (id: number, data: any) => api.patch(`/posts/${id}/`, data),
  deletePost: (id: number, authorId: number) => api.delete(`/posts/${id}/`, { params: { author_id: authorId } }),
  
  // 좋아요
  likePost: (id: number) => api.post(`/posts/${id}/like/`),
  unlikePost: (id: number) => api.post(`/posts/${id}/unlike/`),
  
  // 조회수
  incrementViewCount: (id: number) => api.post(`/posts/${id}/increment_view/`),
  
  // 댓글 (완전 재설계)
  getComments: (postId: number) => api.get(`/posts/${postId}/comments/`),
  addComment: (postId: number, data: any) => api.post(`/posts/${postId}/add_comment/`, data),
  updateComment: (id: number, data: any) => api.patch(`/comments/${id}/`, data),
  deleteComment: (id: number, authorId: number) => api.delete(`/comments/${id}/`, { params: { author_id: authorId } }),
  getReplies: (commentId: number) => api.get(`/comments/${commentId}/replies/`),
  likeComment: (id: number, memberId: number) => api.post(`/comments/${id}/like/`, { member: memberId }),
  
  // 공지사항
  getAnnouncements: (gymId?: number) => api.get('/posts/announcements/', { params: { gym_id: gymId } }),
}

// 공지사항 & 배너 API
export const noticeAPI = {
  getNotices: (gymId?: number) => api.get(`/notices/${gymId ? `?gym_id=${gymId}` : ''}`),
  getNotice: (id: number) => api.get(`/notices/${id}/`),
  createNotice: (data: any) => api.post('/notices/', data),
  updateNotice: (id: number, data: any) => api.patch(`/notices/${id}/`, data),
  deleteNotice: (id: number) => api.delete(`/notices/${id}/`),
}

export const bannerAPI = {
  getBanners: (gymId?: number) => api.get(`/banners/${gymId ? `?gym_id=${gymId}` : ''}`),
  getBanner: (id: number) => api.get(`/banners/${id}/`),
  createBanner: (data: any) => api.post('/banners/', data),
  updateBanner: (id: number, data: any) => api.patch(`/banners/${id}/`, data),
  deleteBanner: (id: number) => api.delete(`/banners/${id}/`),
}

export default api

