'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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

type Comment = {
  id: number
  post: number
  author: {
    id: number
    first_name: string
    last_name: string
  }
  content: string
  like_count: number
  created_at: string
  updated_at: string
}

const CATEGORIES = [
  { id: 'general', name: '자유게시판', icon: '💬', color: '#4facfe' },
  { id: 'workout', name: '운동정보', icon: '💪', color: '#f093fb' },
  { id: 'nutrition', name: '식단', icon: '🍎', color: '#30cfd0' },
  { id: 'question', name: '질문', icon: '❓', color: '#fa709a' },
  { id: 'success', name: '성공사례', icon: '🎉', color: '#fbc531' },
  { id: 'review', name: '리뷰', icon: '⭐', color: '#a8e063' },
]

export default function PostDetailPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingCommentContent, setEditingCommentContent] = useState('')
  const [isEditingPost, setIsEditingPost] = useState(false)
  const [editedPost, setEditedPost] = useState({ title: '', content: '', category: 'general' })

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) {
      router.push('/auth/login')
      return
    }
    setCurrentUser(JSON.parse(userStr))
    loadPost()
    loadComments()
  }, [postId, router])

  const loadPost = async () => {
    try {
      const apiBase = getApiUrl()
      const res = await axios.get(`${apiBase}/posts/${postId}/`)
      setPost(res.data)
      setEditedPost({
        title: res.data.title,
        content: res.data.content,
        category: res.data.category
      })
      setLoading(false)

      // 좋아요 상태 확인
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}')
      const likesRes = await axios.get(`${apiBase}/likes/?post=${postId}&member=${user.id}`)
      setIsLiked(likesRes.data.length > 0)
    } catch (error) {
      console.error('게시글 로드 실패:', error)
      setLoading(false)
    }
  }

  const loadComments = async () => {
    try {
      const apiBase = getApiUrl()
      const res = await axios.get(`${apiBase}/comments/?post=${postId}`)
      setComments(res.data)
    } catch (error) {
      console.error('댓글 로드 실패:', error)
    }
  }

  const handleLike = async () => {
    try {
      const apiBase = getApiUrl()
      await axios.post(`${apiBase}/posts/${postId}/like/`, {
        member_id: currentUser.id
      })
      setIsLiked(!isLiked)
      loadPost() // 좋아요 수 업데이트
    } catch (error) {
      console.error('좋아요 실패:', error)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      const apiBase = getApiUrl()
      await axios.post(`${apiBase}/comments/`, {
        post: postId,
        author: currentUser.id,
        content: newComment
      })
      setNewComment('')
      loadComments()
      loadPost() // 댓글 수 업데이트
    } catch (error) {
      console.error('댓글 작성 실패:', error)
      alert('댓글 작성에 실패했습니다.')
    }
  }

  const handleEditComment = async (commentId: number) => {
    if (!editingCommentContent.trim()) return

    try {
      const apiBase = getApiUrl()
      await axios.patch(`${apiBase}/comments/${commentId}/`, {
        content: editingCommentContent
      })
      setEditingCommentId(null)
      setEditingCommentContent('')
      loadComments()
    } catch (error) {
      console.error('댓글 수정 실패:', error)
      alert('댓글 수정에 실패했습니다.')
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return

    try {
      const apiBase = getApiUrl()
      await axios.delete(`${apiBase}/comments/${commentId}/`)
      loadComments()
      loadPost() // 댓글 수 업데이트
    } catch (error) {
      console.error('댓글 삭제 실패:', error)
      alert('댓글 삭제에 실패했습니다.')
    }
  }

  const handleEditPost = async () => {
    if (!editedPost.title.trim() || !editedPost.content.trim()) {
      alert('제목과 내용을 입력해주세요!')
      return
    }

    try {
      const apiBase = getApiUrl()
      await axios.patch(`${apiBase}/posts/${postId}/`, editedPost)
      setIsEditingPost(false)
      loadPost()
    } catch (error) {
      console.error('게시글 수정 실패:', error)
      alert('게시글 수정에 실패했습니다.')
    }
  }

  const handleDeletePost = async () => {
    if (!confirm('게시글을 삭제하시겠습니까?')) return

    try {
      const apiBase = getApiUrl()
      await axios.delete(`${apiBase}/posts/${postId}/`)
      router.push('/community')
    } catch (error) {
      console.error('게시글 삭제 실패:', error)
      alert('게시글 삭제에 실패했습니다.')
    }
  }

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
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

  const categoryInfo = getCategoryInfo(post.category)
  const isMyPost = currentUser && post.author.id === currentUser.id

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
          alignItems: 'center'
        }}>
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
          {isMyPost && !isEditingPost && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setIsEditingPost(true)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: '2px solid #667eea',
                  background: 'white',
                  color: '#667eea',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                수정
              </button>
              <button
                onClick={handleDeletePost}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: '2px solid #ef4444',
                  background: 'white',
                  color: '#ef4444',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                삭제
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* 게시글 */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          padding: '25px',
          marginBottom: '20px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
        }}>
          {isEditingPost ? (
            <>
              {/* 카테고리 선택 */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
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
                  {CATEGORIES.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setEditedPost({ ...editedPost, category: category.id })}
                      style={{
                        padding: '8px',
                        borderRadius: '10px',
                        background: editedPost.category === category.id
                          ? `${category.color}20`
                          : '#f9fafb',
                        border: editedPost.category === category.id
                          ? `2px solid ${category.color}`
                          : '2px solid #e5e7eb',
                        color: editedPost.category === category.id ? category.color : '#6b7280',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {category.icon} {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 제목 수정 */}
              <input
                type="text"
                value={editedPost.title}
                onChange={(e) => setEditedPost({ ...editedPost, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  fontWeight: 700,
                  marginBottom: '15px',
                  outline: 'none'
                }}
              />

              {/* 내용 수정 */}
              <textarea
                value={editedPost.content}
                onChange={(e) => setEditedPost({ ...editedPost, content: e.target.value })}
                style={{
                  width: '100%',
                  minHeight: '200px',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  marginBottom: '15px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setIsEditingPost(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    background: 'white',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  취소
                </button>
                <button
                  onClick={handleEditPost}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  저장
                </button>
              </div>
            </>
          ) : (
            <>
              {/* 카테고리 배지 */}
              <div style={{
                display: 'inline-block',
                padding: '6px 14px',
                borderRadius: '12px',
                background: `${categoryInfo.color}20`,
                color: categoryInfo.color,
                fontSize: '12px',
                fontWeight: 700,
                marginBottom: '15px'
              }}>
                <span style={{ marginRight: '4px' }}>{categoryInfo.icon}</span>
                {categoryInfo.name}
              </div>

              {/* 제목 */}
              <h1 style={{
                margin: '0 0 15px 0',
                fontSize: '22px',
                fontWeight: 900,
                color: '#1f2937',
                lineHeight: 1.4
              }}>
                {post.title}
              </h1>

              {/* 작성자 정보 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                paddingBottom: '15px',
                borderBottom: '2px solid #f3f4f6',
                marginBottom: '20px'
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
                  fontSize: '16px',
                  fontWeight: 700
                }}>
                  {post.author.last_name?.[0] || 'U'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#374151' }}>
                    {post.author.last_name}{post.author.first_name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {formatDate(post.created_at)}
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

              {/* 본문 */}
              <div style={{
                fontSize: '15px',
                lineHeight: 1.7,
                color: '#374151',
                whiteSpace: 'pre-wrap',
                marginBottom: '25px'
              }}>
                {post.content}
              </div>

              {/* 좋아요 버튼 */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                paddingTop: '20px',
                borderTop: '2px solid #f3f4f6'
              }}>
                <button
                  onClick={handleLike}
                  style={{
                    padding: '12px 30px',
                    borderRadius: '20px',
                    border: 'none',
                    background: isLiked
                      ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                      : '#f3f4f6',
                    color: isLiked ? 'white' : '#6b7280',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: isLiked ? '0 4px 15px rgba(240, 147, 251, 0.4)' : 'none',
                    transition: 'all 0.3s'
                  }}
                >
                  {isLiked ? '❤️' : '🤍'} 좋아요 {post.like_count}
                </button>
              </div>
            </>
          )}
        </div>

        {/* 댓글 섹션 */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          padding: '25px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
        }}>
          <h3 style={{
            margin: '0 0 20px 0',
            fontSize: '18px',
            fontWeight: 800,
            color: '#1f2937'
          }}>
            💬 댓글 {comments.length}
          </h3>

          {/* 댓글 작성 */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '25px',
            paddingBottom: '20px',
            borderBottom: '2px solid #f3f4f6'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: 700,
              flexShrink: 0
            }}>
              {currentUser?.last_name?.[0] || 'U'}
            </div>
            <div style={{ flex: 1 }}>
              <textarea
                placeholder="댓글을 입력하세요..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '14px',
                  lineHeight: 1.5,
                  marginBottom: '10px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: newComment.trim()
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : '#e5e7eb',
                  color: newComment.trim() ? 'white' : '#9ca3af',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: newComment.trim() ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
                }}
              >
                댓글 작성
              </button>
            </div>
          </div>

          {/* 댓글 목록 */}
          {comments.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#9ca3af'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>💭</div>
              <p style={{ fontSize: '14px', fontWeight: 600 }}>
                첫 댓글을 작성해보세요!
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              {comments.map(comment => {
                const isMyComment = currentUser && comment.author.id === currentUser.id
                const isEditing = editingCommentId === comment.id

                return (
                  <div key={comment.id} style={{
                    padding: '15px',
                    borderRadius: '12px',
                    background: '#f9fafb'
                  }}>
                    <div style={{
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
                        fontWeight: 700,
                        flexShrink: 0
                      }}>
                        {comment.author.last_name?.[0] || 'U'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px'
                        }}>
                          <div>
                            <span style={{
                              fontSize: '13px',
                              fontWeight: 700,
                              color: '#374151',
                              marginRight: '8px'
                            }}>
                              {comment.author.last_name}{comment.author.first_name}
                            </span>
                            <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          {isMyComment && !isEditing && (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment.id)
                                  setEditingCommentContent(comment.content)
                                }}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #d1d5db',
                                  background: 'white',
                                  color: '#6b7280',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #fca5a5',
                                  background: 'white',
                                  color: '#ef4444',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                삭제
                              </button>
                            </div>
                          )}
                        </div>

                        {isEditing ? (
                          <>
                            <textarea
                              value={editingCommentContent}
                              onChange={(e) => setEditingCommentContent(e.target.value)}
                              style={{
                                width: '100%',
                                minHeight: '60px',
                                padding: '8px',
                                borderRadius: '8px',
                                border: '2px solid #e5e7eb',
                                fontSize: '13px',
                                lineHeight: 1.5,
                                marginBottom: '8px',
                                outline: 'none',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                              }}
                            />
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={() => {
                                  setEditingCommentId(null)
                                  setEditingCommentContent('')
                                }}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '8px',
                                  border: '1px solid #e5e7eb',
                                  background: 'white',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                취소
                              </button>
                              <button
                                onClick={() => handleEditComment(comment.id)}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '8px',
                                  border: 'none',
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  color: 'white',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                저장
                              </button>
                            </div>
                          </>
                        ) : (
                          <p style={{
                            margin: 0,
                            fontSize: '13px',
                            lineHeight: 1.6,
                            color: '#374151',
                            whiteSpace: 'pre-wrap'
                          }}>
                            {comment.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  )
}
