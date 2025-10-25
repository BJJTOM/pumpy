'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'

type Post = {
  id: number
  title: string
  content: string
  author: {
    id: number
    first_name: string
    last_name: string
  }
  category: string
  like_count: number
  comment_count: number
  view_count: number
  created_at: string
  updated_at: string
}

const CATEGORIES = [
  { id: 'all', name: '전체', icon: '📋', color: '#667eea' },
  { id: 'general', name: '자유게시판', icon: '💬', color: '#4facfe' },
  { id: 'workout', name: '운동정보', icon: '💪', color: '#f093fb' },
  { id: 'nutrition', name: '식단', icon: '🍎', color: '#30cfd0' },
  { id: 'question', name: '질문', icon: '❓', color: '#fa709a' },
  { id: 'success', name: '성공사례', icon: '🎉', color: '#fbc531' },
  { id: 'review', name: '리뷰', icon: '⭐', color: '#a8e063' },
]

export default function CommunityPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general'
  })

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) {
      router.push('/auth/login')
      return
    }
    setCurrentUser(JSON.parse(userStr))
    loadPosts()
  }, [router])

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredPosts(posts)
    } else {
      setFilteredPosts(posts.filter(post => post.category === selectedCategory))
    }
  }, [selectedCategory, posts])

  const loadPosts = async () => {
    try {
      const apiBase = getApiUrl()
      const res = await axios.get(`${apiBase}/posts/`)
      console.log('게시글 로드:', res.data)
      setPosts(res.data)
      setFilteredPosts(res.data)
      setLoading(false)
    } catch (error) {
      console.error('게시글 로드 실패:', error)
      setLoading(false)
    }
  }

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('제목과 내용을 입력해주세요!')
      return
    }

    try {
      const apiBase = getApiUrl()
      const res = await axios.post(`${apiBase}/posts/`, {
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        author: currentUser.id
      })
      console.log('게시글 생성 성공:', res.data)
      
      setShowNewPostModal(false)
      setNewPost({ title: '', content: '', category: 'general' })
      loadPosts() // 목록 새로고침
    } catch (error) {
      console.error('게시글 생성 실패:', error)
      alert('게시글 작성에 실패했습니다.')
    }
  }

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[1]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '방금 전'
    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`
    
    return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 0.8s linear infinite'
          }} />
          <p style={{ fontSize: '18px', fontWeight: 600 }}>로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paddingBottom: '100px'
    }}>
      {/* 헤더 */}
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        padding: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              onClick={() => router.back()}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              ←
            </div>
            <h1 style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 900,
              color: '#1f2937'
            }}>
              커뮤니티
            </h1>
          </div>
          <button
            onClick={() => setShowNewPostModal(true)}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ fontSize: '16px' }}>✏️</span>
            글쓰기
          </button>
        </div>

        {/* 카테고리 탭 */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '5px'
        }}>
          {CATEGORIES.map(category => (
            <div
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: selectedCategory === category.id
                  ? `linear-gradient(135deg, ${category.color} 0%, ${category.color}dd 100%)`
                  : '#f3f4f6',
                color: selectedCategory === category.id ? 'white' : '#6b7280',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s',
                border: selectedCategory === category.id ? 'none' : '2px solid #e5e7eb',
                boxShadow: selectedCategory === category.id
                  ? `0 4px 12px ${category.color}40`
                  : 'none'
              }}
            >
              <span style={{ marginRight: '4px' }}>{category.icon}</span>
              {category.name}
            </div>
          ))}
        </div>
      </div>

      {/* 게시글 목록 */}
      <div style={{ padding: '20px' }}>
        {filteredPosts.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            padding: '60px 20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <p style={{ fontSize: '16px', color: '#6b7280', fontWeight: 600 }}>
              아직 게시글이 없습니다
            </p>
            <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
              첫 번째 글을 작성해보세요!
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {filteredPosts.map(post => {
              const categoryInfo = getCategoryInfo(post.category)
              return (
                <div
                  key={post.id}
                  onClick={() => router.push(`/community/${post.id}`)}
                  style={{
                    background: 'rgba(255,255,255,0.95)',
                    borderRadius: '20px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    border: '2px solid rgba(255,255,255,0.5)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                >
                  {/* 카테고리 배지 */}
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    background: `${categoryInfo.color}20`,
                    color: categoryInfo.color,
                    fontSize: '11px',
                    fontWeight: 700,
                    marginBottom: '12px'
                  }}>
                    <span style={{ marginRight: '4px' }}>{categoryInfo.icon}</span>
                    {categoryInfo.name}
                  </div>

                  {/* 제목 */}
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '16px',
                    fontWeight: 800,
                    color: '#1f2937',
                    lineHeight: 1.4
                  }}>
                    {post.title}
                  </h3>

                  {/* 내용 미리보기 */}
                  <p style={{
                    margin: '0 0 12px 0',
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: 1.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {post.content}
                  </p>

                  {/* 하단 정보 */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '12px',
                    borderTop: '1px solid #f3f4f6'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 700
                      }}>
                        {post.author.last_name?.[0] || 'U'}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                          {post.author.last_name}{post.author.first_name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                          {formatDate(post.created_at)}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      fontSize: '12px',
                      color: '#9ca3af'
                    }}>
                      <span>👁️ {post.view_count}</span>
                      <span>❤️ {post.like_count}</span>
                      <span>💬 {post.comment_count}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 글쓰기 모달 */}
      {showNewPostModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '25px',
            padding: '30px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '25px'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '22px',
                fontWeight: 900,
                color: '#1f2937'
              }}>
                새 게시글 작성
              </h2>
              <button
                onClick={() => setShowNewPostModal(false)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#f3f4f6',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* 카테고리 선택 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 700,
                color: '#374151',
                marginBottom: '8px'
              }}>
                카테고리
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px'
              }}>
                {CATEGORIES.filter(c => c.id !== 'all').map(category => (
                  <button
                    key={category.id}
                    onClick={() => setNewPost({ ...newPost, category: category.id })}
                    style={{
                      padding: '10px',
                      borderRadius: '12px',
                      background: newPost.category === category.id
                        ? `${category.color}20`
                        : '#f9fafb',
                      border: newPost.category === category.id
                        ? `2px solid ${category.color}`
                        : '2px solid #e5e7eb',
                      color: newPost.category === category.id ? category.color : '#6b7280',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>{category.icon}</div>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 제목 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 700,
                color: '#374151',
                marginBottom: '8px'
              }}>
                제목
              </label>
              <input
                type="text"
                placeholder="제목을 입력하세요"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '14px',
                  fontWeight: 600,
                  outline: 'none',
                  transition: 'border 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* 내용 */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 700,
                color: '#374151',
                marginBottom: '8px'
              }}>
                내용
              </label>
              <textarea
                placeholder="내용을 입력하세요"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                style={{
                  width: '100%',
                  minHeight: '200px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  transition: 'border 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* 버튼 */}
            <div style={{
              display: 'flex',
              gap: '10px'
            }}>
              <button
                onClick={() => setShowNewPostModal(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  background: 'white',
                  color: '#6b7280',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={handleCreatePost}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                }}
              >
                작성하기
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  )
}
