'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'

export default function NewPostPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [image, setImage] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) {
      router.push('/auth/login')
      return
    }
    setCurrentUser(JSON.parse(userStr))
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB 이하로 업로드해주세요.')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    // 사진과 캡션 둘 다 없으면 경고
    if (!image && !caption.trim()) {
      alert('사진 또는 텍스트를 입력해주세요!')
      return
    }

    if (!currentUser) {
      alert('로그인이 필요합니다.')
      return
    }

    setUploading(true)

    try {
      const apiBase = getApiUrl()
      console.log('게시글 업로드 시작:', {
        author: currentUser.id,
        hasImage: !!image,
        content: caption.trim()
      })

      const response = await axios.post(`${apiBase}/posts/`, {
        author: currentUser.id,
        images: image || '',  // 이미지가 없으면 빈 문자열
        content: caption.trim()
      })

      console.log('게시글 업로드 성공:', response.data)
      alert('✅ 게시글이 등록되었습니다!')
      
      // 잠시 대기 후 이동
      setTimeout(() => {
        router.push('/app/community')
      }, 500)
    } catch (error: any) {
      console.error('게시글 업로드 실패:', error)
      console.error('에러 상세:', error.response?.data)
      alert(`게시글 등록에 실패했습니다.\n${error.response?.data?.error || error.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc'
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          onClick={() => router.back()}
          style={{
            border: 'none',
            background: 'transparent',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          ←
        </button>
        <h1 style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: 800,
          color: '#333'
        }}>
          새 게시글
        </h1>
        <button
          onClick={handleSubmit}
          disabled={uploading || (!image && !caption.trim())}
          style={{
            padding: '8px 20px',
            borderRadius: '20px',
            border: 'none',
            background: (uploading || (!image && !caption.trim())) ? '#e0e7ff' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 700,
            cursor: (uploading || (!image && !caption.trim())) ? 'not-allowed' : 'pointer'
          }}
        >
          {uploading ? '업로드 중...' : '게시'}
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {/* Image Upload */}
        <div
          onClick={() => !image && fileInputRef.current?.click()}
          style={{
            width: '100%',
            height: image ? 'auto' : '400px',
            borderRadius: '20px',
            background: image ? 'transparent' : 'linear-gradient(135deg, #e0e7ff 0%, #e9d5ff 100%)',
            border: image ? 'none' : '2px dashed #cbd5e1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: image ? 'default' : 'pointer',
            marginBottom: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {image ? (
            <>
              <img
                src={image}
                alt="Preview"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '20px'
                }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setImage(null)
                }}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: '64px', marginBottom: '15px' }}>📸</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#667eea', marginBottom: '5px' }}>
                사진 선택하기 (선택사항)
              </div>
              <div style={{ fontSize: '14px', color: '#999' }}>
                클릭하여 갤러리에서 선택하거나, 텍스트만 작성하셔도 됩니다
              </div>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />

        {/* Caption Input */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
        }}>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="문구를 입력하세요..."
            style={{
              width: '100%',
              minHeight: '120px',
              border: 'none',
              fontSize: '15px',
              lineHeight: 1.6,
              resize: 'vertical',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
            }}
            maxLength={500}
          />
          <div style={{
            textAlign: 'right',
            fontSize: '12px',
            color: '#999',
            marginTop: '10px'
          }}>
            {caption.length}/500
          </div>
        </div>

        {/* Tips */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: 'rgba(102, 126, 234, 0.1)',
          borderRadius: '15px',
          fontSize: '13px',
          color: '#667eea'
        }}>
          <div style={{ fontWeight: 700, marginBottom: '8px' }}>💡 게시글 작성 팁</div>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>운동 인증샷이나 식단 사진을 공유해보세요</li>
            <li>운동 루틴이나 팁을 공유하면 좋아요!</li>
            <li>긍정적이고 서로 응원하는 커뮤니티를 만들어요</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

