'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'
import BottomNav from '../components/BottomNav'

export default function CommunityPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) {
      router.push('/auth/login')
      return
    }
    setCurrentUser(JSON.parse(userStr))
    loadData()

    // 자동 새로고침 (30초마다)
    const interval = setInterval(() => {
      refreshData()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const apiBase = getApiUrl()
      console.log('커뮤니티 데이터 로드 시작:', apiBase)
      
      // 게시글 로드
      const postsRes = await axios.get(`${apiBase}/posts/`)
      console.log('게시글 로드 성공:', postsRes.data.length, '개')
      console.log('게시글 데이터:', postsRes.data)
      setPosts(postsRes.data)

      // 스토리 로드
      const storiesRes = await axios.get(`${apiBase}/stories/`)
      console.log('스토리 로드 성공:', storiesRes.data.length, '개')
      setStories(storiesRes.data)

      setLoading(false)
    } catch (error: any) {
      console.error('커뮤니티 데이터 로드 실패:', error)
      console.error('에러 상세:', error.response?.data)
      setPosts([])
      setStories([])
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const handleLike = async (postId: number) => {
    if (!currentUser) return
    try {
      const apiBase = getApiUrl()
      await axios.post(`${apiBase}/posts/${postId}/like/`, {
        member_id: currentUser.id
      })
      // 게시글 새로고침
      await loadData()
    } catch (error) {
      console.error(error)
    }
  }

  const handleCommentSubmit = async (postId: number, content: string) => {
    if (!currentUser || !content.trim()) return
    try {
      const apiBase = getApiUrl()
      await axios.post(`${apiBase}/posts/${postId}/comment/`, {
        member_id: currentUser.id,
        content: content.trim()
      })
      // 게시글 새로고침
      await loadData()
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e0e7ff',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 0.8s linear infinite'
          }} />
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#667eea' }}>로딩 중...</p>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      paddingBottom: '100px'
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '15px 20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            커뮤니티
          </h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={refreshData}
              disabled={refreshing}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: 'none',
                background: refreshing ? '#e0e7ff' : '#f3f4f6',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                animation: refreshing ? 'spin 1s linear infinite' : 'none'
              }}
            >
              🔄
            </button>
            <button
              onClick={() => router.push('/app/community/profile')}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '2px solid #667eea',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: 'white',
                fontWeight: 800
              }}
            >
              {currentUser?.first_name?.charAt(0) || '👤'}
            </button>
          </div>
        </div>
      </div>

      {/* Stories Slider */}
      {stories.length > 0 && (
        <div style={{
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '15px 20px',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          <div style={{ display: 'inline-flex', gap: '15px' }}>
            {/* Add Story Button */}
            <div
              onClick={() => router.push('/app/community/story/new')}
              style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: 'white',
                marginBottom: '5px'
              }}>
                +
              </div>
              <span style={{ fontSize: '12px', color: '#666', fontWeight: 600 }}>내 스토리</span>
            </div>

            {/* Stories */}
            {stories.map(story => (
              <div
                key={story.id}
                onClick={() => router.push(`/app/community/story/${story.id}`)}
                style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: `url(${story.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '3px solid #667eea',
                  marginBottom: '5px'
                }} />
                <span style={{ fontSize: '12px', color: '#666', fontWeight: 600 }}>
                  {story.member?.first_name || '회원'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts Feed */}
      <div style={{ padding: '20px' }}>
        {/* New Post Button */}
        <button
          onClick={() => router.push('/app/community/new')}
          style={{
            width: '100%',
            padding: '20px',
            borderRadius: '15px',
            border: '2px dashed #cbd5e1',
            background: 'white',
            cursor: 'pointer',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            fontSize: '16px',
            fontWeight: 700,
            color: '#667eea'
          }}
        >
          <span style={{ fontSize: '24px' }}>📸</span>
          <span>게시글 작성하기</span>
        </button>

        {posts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#999'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📝</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 700 }}>
              첫 게시글을 작성해보세요!
            </h3>
            <p style={{ margin: 0, fontSize: '14px' }}>
              운동 인증샷이나 일상을 공유해보세요
            </p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onLike={handleLike}
              onComment={handleCommentSubmit}
              onProfileClick={() => router.push(`/app/community/profile/${post.member.id}`)}
            />
          ))
        )}
      </div>

      <BottomNav />
    </div>
  )
}

// Post Card Component
function PostCard({ post, currentUser, onLike, onComment, onProfileClick }: any) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      onComment(post.id, commentText)
      setCommentText('')
    }
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      marginBottom: '20px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      overflow: 'hidden'
    }}>
      {/* Post Header */}
      <div style={{
        padding: '15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div
          onClick={onProfileClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer'
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '16px',
            fontWeight: 800
          }}>
            {post.member?.first_name?.charAt(0) || '?'}
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#333' }}>
              {post.member?.last_name}{post.member?.first_name}
            </div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              {new Date(post.created_at).toLocaleDateString('ko-KR')}
            </div>
          </div>
        </div>
        <button style={{
          border: 'none',
          background: 'transparent',
          fontSize: '20px',
          cursor: 'pointer'
        }}>
          ⋮
        </button>
      </div>

      {/* Post Image */}
      {post.image && (
        <div style={{
          width: '100%',
          height: '400px',
          background: `url(${post.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} />
      )}

      {/* Post Actions */}
      <div style={{ padding: '15px' }}>
        <div style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '10px'
        }}>
          <button
            onClick={() => onLike(post.id)}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span>{post.is_liked ? '❤️' : '🤍'}</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>
              {post.likes_count}
            </span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span>💬</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>
              {post.comments_count}
            </span>
          </button>
        </div>

        {/* Post Caption */}
        {post.caption && (
          <p style={{
            margin: '0 0 10px 0',
            fontSize: '14px',
            color: '#333',
            lineHeight: 1.5
          }}>
            <strong>{post.member?.first_name}</strong> {post.caption}
          </p>
        )}

        {/* Comments Section */}
        {showComments && (
          <div style={{
            marginTop: '15px',
            paddingTop: '15px',
            borderTop: '1px solid #f0f0f0'
          }}>
            {/* Comment Input */}
            <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '15px'
            }}>
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="댓글을 입력하세요..."
                style={{
                  flex: 1,
                  padding: '10px 15px',
                  borderRadius: '20px',
                  border: '1px solid #e0e7ff',
                  fontSize: '14px'
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
              />
              <button
                onClick={handleSubmitComment}
                disabled={!commentText.trim()}
                style={{
                  padding: '10px 20px',
                  borderRadius: '20px',
                  border: 'none',
                  background: commentText.trim() ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e0e7ff',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: commentText.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                게시
              </button>
            </div>

            {/* Comments List */}
            {post.comments && post.comments.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {post.comments.map((comment: any) => (
                  <div key={comment.id} style={{
                    display: 'flex',
                    gap: '10px'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 800,
                      flexShrink: 0
                    }}>
                      {comment.member?.first_name?.charAt(0) || '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        background: '#f3f4f6',
                        padding: '10px 12px',
                        borderRadius: '15px'
                      }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#333', marginBottom: '3px' }}>
                          {comment.member?.last_name}{comment.member?.first_name}
                        </div>
                        <div style={{ fontSize: '14px', color: '#333' }}>
                          {comment.content}
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: '#999', marginTop: '5px', marginLeft: '12px' }}>
                        {new Date(comment.created_at).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
