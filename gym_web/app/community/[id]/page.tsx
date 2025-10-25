'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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

type Comment = {
  id: number
  author: string
  content: string
  created_at: string
}

export default function PostDetailPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id

  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)

  const categories = {
    general: { name: '자유게시판', icon: '💬', color: '#4facfe' },
    workout: { name: '운동정보', icon: '💪', color: '#f093fb' },
    nutrition: { name: '식단', icon: '🍎', color: '#30cfd0' },
    question: { name: '질문', icon: '❓', color: '#fa709a' },
    success: { name: '성공사례', icon: '🎉', color: '#fbc531' },
  }

  useEffect(() => {
    loadPost()
    loadComments()
  }, [postId])

  const loadPost = async () => {
    try {
      const apiBase = getApiUrl()
      const res = await axios.get(`${apiBase}/community/posts/${postId}/`)
      setPost(res.data)
    } catch (err) {
      // 샘플 데이터
      setPost({
        id: Number(postId),
        title: '오늘 첫 운동 시작했어요! 🎉',
        content: `드디어 운동을 시작했습니다! 
        
오늘부터 꾸준히 운동하려고 합니다. 
처음에는 많이 힘들었는데, 시작하고 나니 기분이 너무 좋네요.

다들 화이팅하세요! 함께 건강해져요 💪`,
        author: '김철수',
        created_at: new Date().toISOString(),
        likes: 15,
        comments_count: 3,
        category: 'general'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async () => {
    try {
      const apiBase = getApiUrl()
      const res = await axios.get(`${apiBase}/community/posts/${postId}/comments/`)
      setComments(res.data)
    } catch (err) {
      // 샘플 데이터
      setComments([
        {
          id: 1,
          author: '이영희',
          content: '축하합니다! 저도 같이 열심히 할게요!',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          author: '박민수',
          content: '화이팅입니다! 꾸준히 하시면 분명 좋은 결과 있을거에요 💪',
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          author: '정수진',
          content: '시작이 반이라고 하잖아요. 응원합니다!',
          created_at: new Date().toISOString()
        }
      ])
    }
  }

  const handleLike = () => {
    if (!post) return
    setLiked(!liked)
    setPost({
      ...post,
      likes: liked ? post.likes - 1 : post.likes + 1
    })
  }

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) {
      alert('댓글을 입력해주세요')
      return
    }

    try {
      const apiBase = getApiUrl()
      await axios.post(`${apiBase}/community/posts/${postId}/comments/`, {
        content: newComment,
        author: '사용자'
      })
      loadComments()
      setNewComment('')
      alert('댓글이 작성되었습니다!')
    } catch (err) {
      // 샘플 데이터로 추가
      const newCommentData: Comment = {
        id: comments.length + 1,
        author: '사용자',
        content: newComment,
        created_at: new Date().toISOString()
      }
      setComments([...comments, newCommentData])
      setNewComment('')
      if (post) {
        setPost({ ...post, comments_count: post.comments_count + 1 })
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading || !post) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    )
  }

  const categoryInfo = categories[post.category as keyof typeof categories] || categories.general

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paddingTop: '20px',
      paddingBottom: '40px'
    }}>
      {/* Header */}
      <div style={{
        padding: '0 20px 20px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
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
            fontWeight: 600
          }}
        >
          ← 목록으로
        </button>
      </div>

      {/* Post Container */}
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '32px',
        maxWidth: '800px',
        margin: '0 auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
      }}>
        {/* Category Badge */}
        <div style={{ marginBottom: '16px' }}>
          <span className="app-badge" style={{
            background: `${categoryInfo.color}20`,
            color: categoryInfo.color,
            border: `1px solid ${categoryInfo.color}40`,
            fontSize: '14px'
          }}>
            {categoryInfo.icon} {categoryInfo.name}
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          margin: '0 0 16px',
          fontSize: '32px',
          fontWeight: 800,
          color: '#191F28',
          lineHeight: 1.3
        }}>
          {post.title}
        </h1>

        {/* Meta Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          paddingBottom: '24px',
          borderBottom: '2px solid #F2F4F6',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
            fontWeight: 700
          }}>
            {post.author[0]}
          </div>
          <div>
            <div style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#191F28'
            }}>
              {post.author}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#8B95A1'
            }}>
              {formatDate(post.created_at)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{
          fontSize: '16px',
          lineHeight: 1.8,
          color: '#4E5968',
          marginBottom: '32px',
          whiteSpace: 'pre-wrap'
        }}>
          {post.content}
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '16px',
          paddingTop: '24px',
          borderTop: '2px solid #F2F4F6'
        }}>
          <button
            onClick={handleLike}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: liked ? 'none' : '2px solid #E5E8EB',
              background: liked ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'white',
              color: liked ? 'white' : '#4E5968',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s'
            }}
          >
            {liked ? '❤️' : '🤍'} 좋아요 {post.likes}
          </button>
          <div style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: '2px solid #E5E8EB',
            background: 'white',
            color: '#4E5968',
            fontSize: '15px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            💬 댓글 {post.comments_count}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '32px',
        maxWidth: '800px',
        margin: '20px auto 0',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
      }}>
        <h3 style={{
          margin: '0 0 24px',
          fontSize: '20px',
          fontWeight: 700,
          color: '#191F28'
        }}>
          💬 댓글 {comments.length}개
        </h3>

        {/* Comment Input */}
        <div style={{
          marginBottom: '32px',
          padding: '20px',
          background: '#F9FAFB',
          borderRadius: '16px'
        }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요..."
            rows={3}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E5E8EB',
              borderRadius: '12px',
              fontSize: '15px',
              marginBottom: '12px',
              resize: 'vertical'
            }}
          />
          <button
            onClick={handleCommentSubmit}
            className="btn-primary"
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            댓글 작성
          </button>
        </div>

        {/* Comments List */}
        <div style={{ display: 'grid', gap: '16px' }}>
          {comments.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#8B95A1'
            }}>
              첫 번째 댓글을 작성해보세요!
            </div>
          ) : (
            comments.map(comment => (
              <div
                key={comment.id}
                style={{
                  padding: '20px',
                  background: '#F9FAFB',
                  borderRadius: '12px',
                  border: '1px solid #E5E8EB'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 700
                  }}>
                    {comment.author[0]}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#191F28'
                    }}>
                      {comment.author}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#8B95A1'
                    }}>
                      {formatDate(comment.created_at)}
                    </div>
                  </div>
                </div>
                <div style={{
                  fontSize: '15px',
                  lineHeight: 1.6,
                  color: '#4E5968'
                }}>
                  {comment.content}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

