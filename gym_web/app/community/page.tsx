'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'

type Post = {
  id: number
  title: string
  content: string
  author: string
  created_at: string
  likes: number
  comments_count: number
  category: string
}

export default function CommunityPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' })

  const categories = [
    { id: 'all', name: '전체', icon: '📋', color: '#667eea' },
    { id: 'general', name: '자유게시판', icon: '💬', color: '#4facfe' },
    { id: 'workout', name: '운동정보', icon: '💪', color: '#f093fb' },
    { id: 'nutrition', name: '식단', icon: '🍎', color: '#30cfd0' },
    { id: 'question', name: '질문', icon: '❓', color: '#fa709a' },
    { id: 'success', name: '성공사례', icon: '🎉', color: '#fbc531' },
  ]

  useEffect(() => {
    loadPosts()
  }, [])

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
      const res = await axios.get(`${apiBase}/community/posts/`)
      setPosts(res.data)
      setFilteredPosts(res.data)
    } catch (err) {
      console.error('Failed to load posts:', err)
      // 샘플 데이터
      const samplePosts: Post[] = [
        {
          id: 1,
          title: '오늘 첫 운동 시작했어요! 🎉',
          content: '드디어 운동을 시작했습니다. 다들 화이팅!',
          author: '김철수',
          created_at: new Date().toISOString(),
          likes: 15,
          comments_count: 3,
          category: 'general'
        },
        {
          id: 2,
          title: '데드리프트 자세 질문드립니다',
          content: '데드리프트 할 때 허리가 아픈데 자세가 잘못된 걸까요?',
          author: '이영희',
          created_at: new Date().toISOString(),
          likes: 8,
          comments_count: 12,
          category: 'question'
        },
        {
          id: 3,
          title: '3개월 만에 10kg 감량 성공! 💪',
          content: '꾸준히 운동하고 식단 관리한 결과 10kg 감량했습니다!',
          author: '박민수',
          created_at: new Date().toISOString(),
          likes: 42,
          comments_count: 18,
          category: 'success'
        },
        {
          id: 4,
          title: '초보자 추천 식단 공유',
          content: '운동 초보분들을 위한 간단한 식단 공유합니다',
          author: '정수진',
          created_at: new Date().toISOString(),
          likes: 23,
          comments_count: 7,
          category: 'nutrition'
        },
      ]
      setPosts(samplePosts)
      setFilteredPosts(samplePosts)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('제목과 내용을 입력해주세요')
      return
    }

    try {
      const apiBase = getApiUrl()
      await axios.post(`${apiBase}/community/posts/`, {
        ...newPost,
        author: '사용자',
        created_at: new Date().toISOString(),
        likes: 0,
        comments_count: 0
      })
      
      setShowNewPostModal(false)
      setNewPost({ title: '', content: '', category: 'general' })
      loadPosts()
      alert('게시글이 작성되었습니다!')
    } catch (err) {
      // 샘플 데이터로 추가
      const newPostData: Post = {
        id: posts.length + 1,
        ...newPost,
        author: '사용자',
        created_at: new Date().toISOString(),
        likes: 0,
        comments_count: 0
      }
      setPosts([newPostData, ...posts])
      setShowNewPostModal(false)
      setNewPost({ title: '', content: '', category: 'general' })
      alert('게시글이 작성되었습니다!')
    }
  }

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || categories[0]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`
    return date.toLocaleDateString('ko-KR')
  }

  return (
    <>
      {/* 떠다니는 배경 아이콘 */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0
      }}>
        <div className="bg-icon" style={{ top: '15%', left: '8%', fontSize: '100px' }}>💬</div>
        <div className="bg-icon" style={{ top: '45%', right: '12%', fontSize: '120px' }}>💪</div>
        <div className="bg-icon" style={{ bottom: '20%', left: '50%', fontSize: '90px' }}>🎉</div>
        <div className="bg-icon" style={{ top: '35%', left: '30%', fontSize: '80px' }}>❤️</div>
        <div className="bg-icon" style={{ bottom: '35%', right: '20%', fontSize: '110px' }}>🔥</div>
      </div>

      {/* 떠다니는 원들 */}
      <div className="floating-circles">
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
      </div>

    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paddingTop: '20px',
      position: 'relative',
      zIndex: 1
    }}>
      {/* Header */}
      <div style={{
        padding: '0 20px 20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div>
            <button 
              onClick={() => router.back()}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 600,
                marginBottom: '12px'
              }}
            >
              ← 뒤로가기
            </button>
            <h1 style={{
              margin: 0,
              fontSize: '36px',
              fontWeight: 800,
              color: 'white',
              textShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}>
              💬 커뮤니티
            </h1>
            <p style={{
              margin: '8px 0 0',
              fontSize: '16px',
              color: 'rgba(255,255,255,0.9)'
            }}>
              회원들과 운동 정보를 공유하세요
            </p>
          </div>
          <button
            onClick={() => setShowNewPostModal(true)}
            className="app-btn gradient-bg-pink"
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              border: 'none',
              padding: '16px 28px',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(245, 87, 108, 0.4)'
            }}
          >
            ✍️ 글쓰기
          </button>
        </div>

        {/* Categories */}
        <div style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          padding: '4px 0',
          marginBottom: '20px'
        }}>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                padding: '12px 20px',
                borderRadius: '16px',
                border: selectedCategory === category.id ? '2px solid white' : 'none',
                background: selectedCategory === category.id 
                  ? 'white' 
                  : 'rgba(255,255,255,0.2)',
                color: selectedCategory === category.id ? category.color : 'white',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: selectedCategory === category.id ? '0 4px 15px rgba(0,0,0,0.2)' : 'none'
              }}
            >
              <span style={{ fontSize: '18px' }}>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Container */}
      <div style={{
        background: '#F9FAFB',
        minHeight: 'calc(100vh - 280px)',
        borderRadius: '32px 32px 0 0',
        padding: '32px 20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p style={{ marginTop: '20px', color: '#8B95A1' }}>로딩 중...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: '#8B95A1'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📝</div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
              아직 게시글이 없습니다
            </h3>
            <p>첫 번째 게시글을 작성해보세요!</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '16px'
          }}>
            {filteredPosts.map(post => {
              const categoryInfo = getCategoryInfo(post.category)
              return (
                <div
                  key={post.id}
                  className="card"
                  style={{
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onClick={() => router.push(`/community/${post.id}`)}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px'
                  }}>
                    {/* Category Icon */}
                    <div
                      className="icon-box"
                      style={{
                        background: `linear-gradient(135deg, ${categoryInfo.color}, ${categoryInfo.color}dd)`,
                        width: '56px',
                        height: '56px',
                        flexShrink: 0
                      }}
                    >
                      {categoryInfo.icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                      }}>
                        <span className="app-badge" style={{
                          background: `${categoryInfo.color}20`,
                          color: categoryInfo.color,
                          border: `1px solid ${categoryInfo.color}40`
                        }}>
                          {categoryInfo.name}
                        </span>
                        <span style={{ fontSize: '14px', color: '#8B95A1' }}>
                          {post.author}
                        </span>
                        <span style={{ fontSize: '14px', color: '#B0B8C1' }}>
                          · {formatDate(post.created_at)}
                        </span>
                      </div>
                      
                      <h3 style={{
                        margin: '0 0 8px',
                        fontSize: '18px',
                        fontWeight: 700,
                        color: '#191F28'
                      }}>
                        {post.title}
                      </h3>
                      
                      <p style={{
                        margin: '0 0 16px',
                        fontSize: '15px',
                        color: '#4E5968',
                        lineHeight: '1.5',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {post.content}
                      </p>

                      <div style={{
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '14px',
                          color: '#8B95A1'
                        }}>
                          ❤️ {post.likes}
                        </span>
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '14px',
                          color: '#8B95A1'
                        }}>
                          💬 {post.comments_count}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2 style={{
              margin: '0 0 24px',
              fontSize: '24px',
              fontWeight: 800
            }}>
              ✍️ 새 게시글 작성
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600
              }}>
                카테고리
              </label>
              <select
                value={newPost.category}
                onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #E5E8EB',
                  borderRadius: '12px',
                  fontSize: '15px'
                }}
              >
                {categories.filter(c => c.id !== 'all').map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600
              }}>
                제목
              </label>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                placeholder="제목을 입력하세요"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #E5E8EB',
                  borderRadius: '12px',
                  fontSize: '15px'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600
              }}>
                내용
              </label>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="내용을 입력하세요"
                rows={8}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #E5E8EB',
                  borderRadius: '12px',
                  fontSize: '15px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleCreatePost}
                className="btn-primary"
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                작성하기
              </button>
              <button
                onClick={() => {
                  setShowNewPostModal(false)
                  setNewPost({ title: '', content: '', category: 'general' })
                }}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid #E5E8EB',
                  background: 'white',
                  color: '#4E5968',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}

