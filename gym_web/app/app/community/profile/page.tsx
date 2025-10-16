'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'
import BottomNav from '../../components/BottomNav'

export default function CommunityProfilePage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [myPosts, setMyPosts] = useState<any[]>([])
  const [myComments, setMyComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts')

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) {
      router.push('/auth/login')
      return
    }
    const user = JSON.parse(userStr)
    setCurrentUser(user)
    loadData(user.id)
  }, [])

  const loadData = async (userId: number) => {
    try {
      const apiBase = getApiUrl()
      
      // 내 게시글 로드
      const postsRes = await axios.get(`${apiBase}/posts/?member=${userId}`)
      setMyPosts(postsRes.data)

      // 내 댓글 로드
      const commentsRes = await axios.get(`${apiBase}/comments/?member=${userId}`)
      setMyComments(commentsRes.data)

      setLoading(false)
    } catch (error) {
      console.error(error)
      setLoading(false)
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px 20px 40px'
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
            marginBottom: '20px',
            backdropFilter: 'blur(10px)'
          }}
        >
          ←
        </button>

        {/* Profile Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          color: 'white'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            fontWeight: 800,
            border: '4px solid rgba(255,255,255,0.3)'
          }}>
            {currentUser?.first_name?.charAt(0) || '?'}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{
              margin: '0 0 8px 0',
              fontSize: '24px',
              fontWeight: 800
            }}>
              {currentUser?.last_name}{currentUser?.first_name}
            </h2>
            <div style={{
              fontSize: '14px',
              opacity: 0.9
            }}>
              {currentUser?.email}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '15px',
          marginTop: '25px'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '20px',
            borderRadius: '15px',
            textAlign: 'center',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: 900,
              color: 'white',
              marginBottom: '5px'
            }}>
              {myPosts.length}
            </div>
            <div style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 600
            }}>
              작성한 게시글
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '20px',
            borderRadius: '15px',
            textAlign: 'center',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: 900,
              color: 'white',
              marginBottom: '5px'
            }}>
              {myComments.length}
            </div>
            <div style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 600
            }}>
              작성한 댓글
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex'
      }}>
        <button
          onClick={() => setActiveTab('posts')}
          style={{
            flex: 1,
            padding: '15px',
            border: 'none',
            background: 'transparent',
            fontSize: '15px',
            fontWeight: 700,
            color: activeTab === 'posts' ? '#667eea' : '#999',
            borderBottom: activeTab === 'posts' ? '3px solid #667eea' : '3px solid transparent',
            cursor: 'pointer'
          }}
        >
          게시글 {myPosts.length}
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          style={{
            flex: 1,
            padding: '15px',
            border: 'none',
            background: 'transparent',
            fontSize: '15px',
            fontWeight: 700,
            color: activeTab === 'comments' ? '#667eea' : '#999',
            borderBottom: activeTab === 'comments' ? '3px solid #667eea' : '3px solid transparent',
            cursor: 'pointer'
          }}
        >
          댓글 {myComments.length}
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {activeTab === 'posts' ? (
          myPosts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#999'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '15px' }}>📝</div>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>작성한 게시글이 없습니다</div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '5px'
            }}>
              {myPosts.map(post => (
                <div
                  key={post.id}
                  onClick={() => router.push(`/app/community/post/${post.id}`)}
                  style={{
                    aspectRatio: '1',
                    background: `url(${post.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {post.likes_count > 0 && (
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      padding: '5px 10px',
                      background: 'rgba(0,0,0,0.7)',
                      borderRadius: '15px',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>❤️</span>
                      <span>{post.likes_count}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          myComments.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#999'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '15px' }}>💬</div>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>작성한 댓글이 없습니다</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {myComments.map(comment => (
                <div
                  key={comment.id}
                  onClick={() => router.push(`/app/community/post/${comment.post}`)}
                  style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '15px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    fontSize: '14px',
                    color: '#333',
                    lineHeight: 1.5,
                    marginBottom: '8px'
                  }}>
                    {comment.content}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#999'
                  }}>
                    {new Date(comment.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <BottomNav />
    </div>
  )
}

