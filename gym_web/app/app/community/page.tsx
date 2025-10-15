'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Community() {
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [showNewPost, setShowNewPost] = useState(false)
  const [newPostContent, setNewPostContent] = useState('')

  useEffect(() => {
    // TODO: API 연동
    // 임시 데이터
    setPosts([
      {
        id: 1,
        author: { name: '김철수', photo: null },
        content: '오늘 운동 끝! 정말 힘들었지만 뿌듯합니다 💪',
        images: [],
        likes: 24,
        comments: 5,
        createdAt: '1시간 전'
      },
      {
        id: 2,
        author: { name: '이영희', photo: null },
        content: '새로운 PR 달성! 데드리프트 100kg 성공했어요 🎉',
        images: [],
        likes: 42,
        comments: 12,
        createdAt: '3시간 전'
      }
    ])
  }, [])

  const handleNewPost = () => {
    if (!newPostContent.trim()) return
    
    // TODO: API POST 요청
    const newPost = {
      id: posts.length + 1,
      author: { name: '나', photo: null },
      content: newPostContent,
      images: [],
      likes: 0,
      comments: 0,
      createdAt: '방금 전'
    }
    
    setPosts([newPost, ...posts])
    setNewPostContent('')
    setShowNewPost(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      paddingBottom: '100px'
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'white',
        padding: '20px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>커뮤니티</h1>
        <button
          onClick={() => setShowNewPost(true)}
          style={{
            padding: '10px 20px',
            borderRadius: '20px',
            border: 'none',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          + 글쓰기
        </button>
      </div>

      {/* Stories */}
      <div style={{
        padding: '15px 20px',
        backgroundColor: 'white',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        borderBottom: '1px solid #eee'
      }}>
        <div style={{ display: 'inline-flex', gap: '15px' }}>
          {/* My Story */}
          <div style={{ textAlign: 'center', cursor: 'pointer' }}>
            <div style={{
              width: 70,
              height: 70,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              marginBottom: '5px',
              border: '3px solid white',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              ➕
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>내 스토리</div>
          </div>

          {/* Other Stories */}
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ textAlign: 'center', cursor: 'pointer' }}>
              <div style={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                marginBottom: '5px',
                border: '3px solid #f093fb'
              }}>
                👤
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>회원{i}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      <div style={{ padding: '10px 0' }}>
        {posts.map(post => (
          <div key={post.id} style={{
            backgroundColor: 'white',
            marginBottom: '10px',
            paddingBottom: '15px'
          }}>
            {/* Post Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '15px 20px 10px',
              gap: '10px'
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#667eea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: 'white',
                fontWeight: 700
              }}>
                {post.author.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{post.author.name}</div>
                <div style={{ fontSize: '12px', color: '#999' }}>{post.createdAt}</div>
              </div>
              <div style={{ fontSize: '20px', cursor: 'pointer' }}>⋯</div>
            </div>

            {/* Post Content */}
            <div style={{
              padding: '10px 20px',
              fontSize: '15px',
              lineHeight: 1.6
            }}>
              {post.content}
            </div>

            {/* Post Actions */}
            <div style={{
              display: 'flex',
              gap: '20px',
              padding: '10px 20px',
              borderTop: '1px solid #f0f0f0',
              marginTop: '10px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                color: '#666'
              }}>
                <span style={{ fontSize: '20px' }}>❤️</span>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>{post.likes}</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                color: '#666'
              }}>
                <span style={{ fontSize: '20px' }}>💬</span>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>{post.comments}</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                color: '#666'
              }}>
                <span style={{ fontSize: '20px' }}>📤</span>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>공유</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1000
            }}
            onClick={() => setShowNewPost(false)}
          />
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderRadius: '30px 30px 0 0',
            padding: '30px 20px',
            zIndex: 1001,
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 700 }}>
              새 게시글
            </h2>
            
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="무슨 생각을 하고 계신가요?"
              style={{
                width: '100%',
                minHeight: '150px',
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '15px',
                fontSize: '16px',
                resize: 'none',
                marginBottom: '20px'
              }}
            />

            <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '20px'
            }}>
              <button style={{
                flex: 1,
                padding: '15px',
                borderRadius: '15px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                📷 사진
              </button>
              <button style={{
                flex: 1,
                padding: '15px',
                borderRadius: '15px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                😊 이모티콘
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => setShowNewPost(false)}
                style={{
                  padding: '15px',
                  borderRadius: '15px',
                  border: '1px solid #ddd',
                  backgroundColor: 'white',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={handleNewPost}
                style={{
                  padding: '15px',
                  borderRadius: '15px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                게시
              </button>
            </div>
          </div>
        </>
      )}

      {/* Bottom Nav */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: '30px 30px 0 0',
        padding: '15px 20px 20px',
        boxShadow: '0 -5px 20px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center'
      }}>
        <div onClick={() => router.push('/app')} style={{ textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: '24px', marginBottom: '5px' }}>🏠</div>
          <div style={{ fontSize: '11px', color: '#999' }}>홈</div>
        </div>
        <div onClick={() => router.push('/app/community')} style={{ textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: '24px', marginBottom: '5px' }}>👥</div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#667eea' }}>커뮤니티</div>
        </div>
        <div onClick={() => router.push('/app/chat')} style={{ textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: '24px', marginBottom: '5px' }}>💬</div>
          <div style={{ fontSize: '11px', color: '#999' }}>채팅</div>
        </div>
        <div onClick={() => router.push('/app/profile')} style={{ textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: '24px', marginBottom: '5px' }}>👤</div>
          <div style={{ fontSize: '11px', color: '#999' }}>내 정보</div>
        </div>
      </div>
    </div>
  )
}


