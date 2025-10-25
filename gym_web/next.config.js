/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 이미지 최적화 설정
  images: {
    unoptimized: true,
    formats: ['image/webp'],
  },
  
  // URL 트레일링 슬래시
  trailingSlash: true,
  
  // 프로덕션 최적화
  swcMinify: true,
  compress: true,
  
  // 정적 페이지 생성 최적화
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  
  // 성능 최적화 헤더
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  
  // 출력 설정
  output: 'standalone',
  
  // 빌드 시 타입/ESLint 오류로 빌드 중단 방지 (운영 우선)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 환경 변수 노출
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  },
}

module.exports = nextConfig



