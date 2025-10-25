import axios from 'axios';

// AWS API URL (배포된 서버 주소)
const API_BASE_URL = 'http://3.27.28.175/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 인증 API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login/', { email, password }),
  
  register: (data: any) =>
    api.post('/members/', data),
};

// 회원 API
export const memberAPI = {
  getProfile: (id: number) =>
    api.get(`/members/${id}/`),
  
  updateProfile: (id: number, data: any) =>
    api.patch(`/members/${id}/`, data),
  
  getAttendance: (memberId: number) =>
    api.get(`/attendance/?member=${memberId}`),
};

// 회원권 API
export const membershipAPI = {
  getPlans: () =>
    api.get('/membership-plans/'),
  
  subscribe: (data: any) =>
    api.post('/subscriptions/', data),
  
  createRevenue: (data: any) =>
    api.post('/revenues/', data),
};

// 커뮤니티 API
export const communityAPI = {
  getPosts: () =>
    api.get('/posts/'),
  
  getPost: (id: number) =>
    api.get(`/posts/${id}/`),
  
  createPost: (data: any) =>
    api.post('/posts/', data),
  
  likePost: (id: number) =>
    api.post(`/posts/${id}/like/`),
};

export default api;


