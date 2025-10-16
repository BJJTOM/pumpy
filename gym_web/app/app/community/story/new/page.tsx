'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'

export default function NewStoryPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [image, setImage] = useState<string | null>(null)
  const [text, setText] = useState('')
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
    if (!image) {
      alert('사진을 선택해주세요!')
      return
    }

    if (!currentUser) {
      alert('로그인이 필요합니다.')
      return
    }

    setUploading(true)

    try {
      const apiBase = getApiUrl()
      await axios.post(`${apiBase}/stories/`, {
        member_id: currentUser.id,
        image: image,
        text: text.trim()
      })

      alert('✅ 스토리가 등록되었습니다!\n24시간 후 자동으로 삭제됩니다.')
      router.push('/app/community')
    } catch (error) {
      console.error(error)
      alert('스토리 등록에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)'
      }}>
        <button
          onClick={() => router.back()}
          style={{
            border: 'none',
            background: 'rgba(255,255,255,0.2)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)'
          }}
        >
          ×
        </button>
        <button
          onClick={handleSubmit}
          disabled={!image || uploading}
          style={{
            padding: '10px 25px',
            borderRadius: '25px',
            border: 'none',
            background: (!image || uploading) 
              ? 'rgba(255,255,255,0.3)' 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '15px',
            fontWeight: 700,
            cursor: (!image || uploading) ? 'not-allowed' : 'pointer',
            backdropFilter: 'blur(10px)'
          }}
        >
          {uploading ? '업로드 중...' : '공유하기'}
        </button>
      </div>

      {/* Content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '80px 20px 20px'
      }}>
        {image ? (
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '500px',
            background: '#111',
            borderRadius: '20px',
            overflow: 'hidden'
          }}>
            <img
              src={image}
              alt="Story"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
            
            {/* Text Overlay */}
            {text && (
              <div style={{
                position: 'absolute',
                bottom: '30px',
                left: '20px',
                right: '20px',
                padding: '15px 20px',
                background: 'rgba(0,0,0,0.6)',
                borderRadius: '15px',
                color: 'white',
                fontSize: '16px',
                fontWeight: 600,
                textAlign: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                {text}
              </div>
            )}

            {/* Change Photo Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                padding: '10px 20px',
                borderRadius: '20px',
                border: 'none',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(10px)'
              }}
            >
              📸 사진 변경
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%',
              maxWidth: '500px',
              height: '600px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '3px dashed rgba(255,255,255,0.5)'
            }}
          >
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>📸</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '10px' }}>
              사진 선택하기
            </div>
            <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)' }}>
              스토리로 공유할 사진을 선택하세요
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />

        {/* Text Input */}
        {image && (
          <div style={{
            width: '100%',
            maxWidth: '500px',
            marginTop: '20px'
          }}>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="텍스트 추가 (선택사항)"
              style={{
                width: '100%',
                padding: '15px 20px',
                borderRadius: '15px',
                border: 'none',
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                fontSize: '15px',
                backdropFilter: 'blur(10px)',
                textAlign: 'center'
              }}
              maxLength={100}
            />
          </div>
        )}

        {/* Info */}
        <div style={{
          marginTop: '20px',
          padding: '15px 20px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '15px',
          fontSize: '13px',
          color: 'rgba(255,255,255,0.8)',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
          maxWidth: '500px',
          width: '100%'
        }}>
          <div style={{ fontWeight: 700, marginBottom: '5px' }}>⏰ 24시간 후 자동 삭제</div>
          <div>스토리는 24시간 후 자동으로 사라집니다</div>
        </div>
      </div>
    </div>
  )
}

