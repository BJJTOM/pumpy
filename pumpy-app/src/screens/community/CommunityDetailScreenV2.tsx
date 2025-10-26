import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, KeyboardAvoidingView, Platform, Modal, Image } from 'react-native'
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native'
import { communityAPI } from '../../../services/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'

const CATEGORIES = [
  { id: 'general', name: '자유게시판', icon: '💬', color: '#4facfe' },
  { id: 'workout', name: '운동정보', icon: '💪', color: '#f093fb' },
  { id: 'nutrition', name: '식단', icon: '🍎', color: '#30cfd0' },
  { id: 'question', name: '질문', icon: '❓', color: '#fa709a' },
  { id: 'success', name: '성공사례', icon: '🎉', color: '#fbc531' },
  { id: 'review', name: '리뷰', icon: '⭐', color: '#a8e063' },
]

export default function CommunityDetailScreenV2() {
  const navigation = useNavigation()
  const route = useRoute()
  const postId = (route.params as any)?.postId

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  
  // 댓글 작성/수정/답글
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingCommentContent, setEditingCommentContent] = useState('')
  
  // 게시글 수정/삭제
  const [showOptionsModal, setShowOptionsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedContent, setEditedContent] = useState('')

  const loadPost = useCallback(async () => {
    try {
      const userStr = await AsyncStorage.getItem('currentUser')
      if (userStr) {
        const user = JSON.parse(userStr)
        setCurrentUser(user)
        
        const liked = await AsyncStorage.getItem(`liked_posts_${user.id}`)
        if (liked) {
          const likedPostIds = JSON.parse(liked)
          setIsLiked(likedPostIds.includes(Number(postId)))
        }
      }

      const res = await communityAPI.getPost(postId)
      const postData = res.data
      
      // 조회수 증가
      try {
        await communityAPI.incrementViewCount(postId)
        postData.view_count = (postData.view_count || 0) + 1
      } catch (viewError) {
        console.log('조회수 증가 실패:', viewError)
      }
      
      setPost(postData)
      setLoading(false)
    } catch (error) {
      console.error('게시글 로드 실패:', error)
      Alert.alert('오류', '게시글을 불러오지 못했습니다.')
      setLoading(false)
    }
  }, [postId])

  const loadComments = useCallback(async () => {
    try {
      const res = await communityAPI.getComments(postId)
      setComments(res.data || [])
    } catch (error) {
      console.error('댓글 로드 실패:', error)
      setComments([])
    }
  }, [postId])

  useFocusEffect(
    useCallback(() => {
      loadPost()
      loadComments()
    }, [loadPost, loadComments])
  )

  const handleLike = async () => {
    if (!currentUser || !post) return

    const wasLiked = isLiked
    const newLikeCount = wasLiked ? post.like_count - 1 : post.like_count + 1

    setIsLiked(!wasLiked)
    setPost({ ...post, like_count: newLikeCount })

    const likedPostsKey = `liked_posts_${currentUser.id}`
    const likedPosts = await AsyncStorage.getItem(likedPostsKey)
    let likedPostIds = likedPosts ? JSON.parse(likedPosts) : []

    if (wasLiked) {
      likedPostIds = likedPostIds.filter((id: number) => id !== Number(postId))
    } else {
      likedPostIds.push(Number(postId))
    }

    await AsyncStorage.setItem(likedPostsKey, JSON.stringify(likedPostIds))

    try {
      if (wasLiked) {
        await communityAPI.unlikePost(postId)
      } else {
        await communityAPI.likePost(postId)
      }
      const res = await communityAPI.getPost(postId)
      setPost(res.data)
    } catch (error) {
      console.error('좋아요 API 실패:', error)
    }
  }

  // 댓글 작성 (신규 또는 답글)
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('알림', '댓글 내용을 입력해주세요.')
      return
    }
    if (!currentUser) {
      Alert.alert('오류', '로그인이 필요합니다.')
      return
    }

    try {
      const commentData = {
        author: currentUser.id,
        content: newComment.trim(),
        parent: replyingTo
      }
      
      await communityAPI.addComment(postId, commentData)
      setNewComment('')
      setReplyingTo(null)
      await loadComments()
      await loadPost()
      Alert.alert('성공', replyingTo ? '답글이 작성되었습니다.' : '댓글이 작성되었습니다.')
    } catch (error: any) {
      console.error('댓글 작성 실패:', error.response?.data || error.message)
      Alert.alert('오류', '댓글 작성에 실패했습니다.')
    }
  }

  // 댓글 수정
  const handleEditComment = async (commentId: number) => {
    if (!editingCommentContent.trim()) {
      Alert.alert('알림', '댓글 내용을 입력해주세요.')
      return
    }

    try {
      await communityAPI.updateComment(commentId, { content: editingCommentContent.trim() })
      setEditingCommentId(null)
      setEditingCommentContent('')
      await loadComments()
      Alert.alert('성공', '댓글이 수정되었습니다.')
    } catch (error: any) {
      console.error('댓글 수정 실패:', error)
      Alert.alert('오류', '댓글 수정에 실패했습니다.')
    }
  }

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!currentUser) return

    Alert.alert(
      '댓글 삭제',
      '정말 이 댓글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await communityAPI.deleteComment(commentId, currentUser.id)
              await loadComments()
              await loadPost()
              Alert.alert('성공', '댓글이 삭제되었습니다.')
            } catch (error: any) {
              console.error('댓글 삭제 실패:', error)
              Alert.alert('오류', '댓글 삭제에 실패했습니다.')
            }
          }
        }
      ]
    )
  }

  // 게시글 수정
  const handleEditPost = () => {
    setEditedTitle(post.title)
    setEditedContent(post.content)
    setShowOptionsModal(false)
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editedTitle.trim() || !editedContent.trim()) {
      Alert.alert('알림', '제목과 내용을 입력해주세요.')
      return
    }

    try {
      await communityAPI.updatePost(postId, { title: editedTitle, content: editedContent })
      setShowEditModal(false)
      await loadPost()
      Alert.alert('성공', '게시글이 수정되었습니다.')
    } catch (error) {
      console.error('게시글 수정 실패:', error)
      Alert.alert('오류', '게시글 수정에 실패했습니다.')
    }
  }

  // 게시글 삭제
  const handleDeletePost = () => {
    Alert.alert(
      '게시글 삭제',
      '정말 이 게시글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await communityAPI.deletePost(postId, currentUser.id)
              Alert.alert('성공', '게시글이 삭제되었습니다.')
              navigation.goBack()
            } catch (error) {
              console.error('게시글 삭제 실패:', error)
              Alert.alert('오류', '게시글 삭제에 실패했습니다.')
            }
          }
        }
      ]
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`
    
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0]
  }

  // 댓글 렌더링 (계층 구조)
  const renderComment = (comment: any, isReply = false) => {
    const isEditing = editingCommentId === comment.id
    const isAuthor = currentUser?.id === comment.author?.id

    return (
      <View key={comment.id} style={[styles.commentItem, isReply && styles.replyItem]}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {comment.author?.photo ? (
            <Image source={{ uri: comment.author.photo }} style={styles.commentAvatar} />
          ) : (
            <View style={styles.commentAvatar}>
              <Text style={styles.commentAvatarText}>{comment.author?.last_name?.[0] || 'U'}</Text>
            </View>
          )}
          
          <View style={{ flex: 1 }}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentAuthor}>
                {comment.author?.last_name}{comment.author?.first_name}
              </Text>
              <Text style={styles.commentDate}>{formatDate(comment.created_at)}</Text>
            </View>

            {isEditing ? (
              <View>
                <TextInput
                  style={styles.commentEditInput}
                  value={editingCommentContent}
                  onChangeText={setEditingCommentContent}
                  multiline
                  autoFocus
                />
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <TouchableOpacity
                    style={styles.commentEditSaveButton}
                    onPress={() => handleEditComment(comment.id)}
                  >
                    <Text style={styles.commentEditSaveButtonText}>저장</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.commentEditCancelButton}
                    onPress={() => {
                      setEditingCommentId(null)
                      setEditingCommentContent('')
                    }}
                  >
                    <Text style={styles.commentEditCancelButtonText}>취소</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.commentContent}>{comment.content}</Text>
                <View style={styles.commentActions}>
                  <TouchableOpacity onPress={() => setReplyingTo(comment.id)}>
                    <Text style={styles.commentActionText}>답글</Text>
                  </TouchableOpacity>
                  {isAuthor && (
                    <>
                      <TouchableOpacity
                        onPress={() => {
                          setEditingCommentId(comment.id)
                          setEditingCommentContent(comment.content)
                        }}
                      >
                        <Text style={styles.commentActionText}>수정</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
                        <Text style={[styles.commentActionText, { color: '#ef4444' }]}>삭제</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </>
            )}
          </View>
        </View>

        {/* 답글 목록 */}
        {comment.replies && comment.replies.length > 0 && (
          <View style={{ marginLeft: 40, marginTop: 12 }}>
            {comment.replies.map((reply: any) => renderComment(reply, true))}
          </View>
        )}
      </View>
    )
  }

  if (loading || !post) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.center}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>로딩 중...</Text>
      </LinearGradient>
    )
  }

  const categoryInfo = getCategoryInfo(post.category)

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={{ fontSize: 20 }}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>게시글</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Post Content */}
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color }]}>
                <Text style={styles.categoryBadgeText}>{categoryInfo.icon} {categoryInfo.name}</Text>
              </View>
              {currentUser?.id === post.author.id && (
                <TouchableOpacity onPress={() => setShowOptionsModal(true)} style={styles.optionsButton}>
                  <Text style={styles.optionsButtonText}>⋮</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.postTitle}>{post.title}</Text>

            <View style={styles.authorRow}>
              {post.author.photo ? (
                <Image source={{ uri: post.author.photo }} style={styles.authorAvatar} />
              ) : (
                <View style={styles.authorAvatar}>
                  <Text style={styles.authorAvatarText}>{post.author.last_name?.[0] || 'U'}</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.authorName}>{post.author.last_name}{post.author.first_name}</Text>
                <Text style={styles.postDate}>{formatDate(post.created_at)}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statItem}>👁️ {post.view_count || 0}</Text>
                <Text style={styles.statItem}>❤️ {post.like_count || 0}</Text>
                <Text style={styles.statItem}>💬 {post.comment_count || 0}</Text>
              </View>
            </View>

            <Text style={styles.postContent}>{post.content}</Text>

            {/* 이미지 표시 */}
            {post.images && (() => {
              try {
                const images = typeof post.images === 'string' ? JSON.parse(post.images) : post.images
                if (Array.isArray(images) && images.length > 0) {
                  return (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.postImagesScroll}>
                      {images.map((uri: string, index: number) => (
                        <Image key={index} source={{ uri }} style={styles.postImage} />
                      ))}
                    </ScrollView>
                  )
                }
              } catch (e) {
                console.error('이미지 파싱 오류:', e)
              }
              return null
            })()}

            <View style={styles.likeButtonContainer}>
              <TouchableOpacity style={[styles.likeButton, isLiked && styles.likeButtonActive]} onPress={handleLike}>
                <Text style={styles.likeButtonText}>{isLiked ? '❤️' : '🤍'} 좋아요 {post.like_count}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsCard}>
            <Text style={styles.commentsTitle}>💬 댓글 {comments.length}</Text>

            {/* Comment Input */}
            <View style={styles.commentInputRow}>
              {currentUser?.photo ? (
                <Image source={{ uri: currentUser.photo }} style={styles.commentAvatar} />
              ) : (
                <View style={styles.commentAvatar}>
                  <Text style={styles.commentAvatarText}>{currentUser?.last_name?.[0] || 'U'}</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                {replyingTo !== null && (
                  <View style={styles.replyingToContainer}>
                    <Text style={styles.replyingToText}>답글 작성 중...</Text>
                    <TouchableOpacity onPress={() => setReplyingTo(null)}>
                      <Text style={styles.replyingToCancel}>취소</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <TextInput
                  style={styles.commentInput}
                  placeholder={replyingTo ? '답글을 입력하세요...' : '댓글을 입력하세요...'}
                  placeholderTextColor="#999"
                  multiline
                  value={newComment}
                  onChangeText={setNewComment}
                />
                <TouchableOpacity
                  style={[styles.commentButton, !newComment.trim() && styles.commentButtonDisabled]}
                  onPress={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  <Text style={styles.commentButtonText}>{replyingTo ? '답글 작성' : '댓글 작성'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Comments List */}
            {comments.length === 0 ? (
              <View style={styles.noComments}>
                <Text style={styles.noCommentsEmoji}>💭</Text>
                <Text style={styles.noCommentsText}>첫 댓글을 작성해보세요!</Text>
              </View>
            ) : (
              comments.filter(c => !c.parent).map(comment => renderComment(comment))
            )}
          </View>
        </ScrollView>

        {/* Options Modal */}
        <Modal visible={showOptionsModal} transparent animationType="fade" onRequestClose={() => setShowOptionsModal(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowOptionsModal(false)}>
            <View style={styles.optionsModal}>
              <TouchableOpacity style={styles.optionButton} onPress={handleEditPost}>
                <Text style={styles.optionButtonText}>✏️ 수정</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.optionButton, { borderBottomWidth: 0 }]} onPress={handleDeletePost}>
                <Text style={[styles.optionButtonText, { color: '#ef4444' }]}>🗑️ 삭제</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Edit Modal */}
        <Modal visible={showEditModal} transparent animationType="slide" onRequestClose={() => setShowEditModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.editModal}>
              <Text style={styles.editModalTitle}>게시글 수정</Text>
              <TextInput
                style={styles.editInput}
                placeholder="제목"
                value={editedTitle}
                onChangeText={setEditedTitle}
              />
              <TextInput
                style={[styles.editInput, { height: 200, textAlignVertical: 'top' }]}
                placeholder="내용"
                multiline
                value={editedContent}
                onChangeText={setEditedContent}
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity style={styles.editSaveButton} onPress={handleSaveEdit}>
                  <Text style={styles.editSaveButtonText}>저장</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.editCancelButton} onPress={() => setShowEditModal(false)}>
                  <Text style={styles.editCancelButtonText}>취소</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'white', fontSize: 18, fontWeight: '700', marginTop: 15 },
  scrollViewContent: { paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 40 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: 'white' },
  
  // Post
  postCard: { backgroundColor: 'white', margin: 15, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  categoryBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  categoryBadgeText: { color: 'white', fontSize: 12, fontWeight: '700' },
  optionsButton: { padding: 8 },
  optionsButtonText: { fontSize: 20, color: '#999' },
  postTitle: { fontSize: 22, fontWeight: '900', color: '#1f2937', marginBottom: 15, lineHeight: 30 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  authorAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#667eea', justifyContent: 'center', alignItems: 'center' },
  authorAvatarText: { color: 'white', fontSize: 16, fontWeight: '700' },
  authorName: { fontSize: 15, fontWeight: '700', color: '#374151' },
  postDate: { fontSize: 12, color: '#9ca3af' },
  statsRow: { flexDirection: 'row', gap: 8, marginLeft: 'auto' },
  statItem: { fontSize: 12, color: '#9ca3af' },
  postContent: { fontSize: 16, color: '#4b5563', lineHeight: 24, marginBottom: 20 },
  postImagesScroll: { marginBottom: 20 },
  postImage: { width: 300, height: 300, borderRadius: 12, marginRight: 10 },
  likeButtonContainer: { alignItems: 'center' },
  likeButton: { backgroundColor: '#f3f4f6', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25, borderWidth: 2, borderColor: '#e5e7eb' },
  likeButtonActive: { backgroundColor: '#fee2e2', borderColor: '#fca5a5' },
  likeButtonText: { fontSize: 16, fontWeight: '700', color: '#667eea' },
  
  // Comments
  commentsCard: { backgroundColor: 'white', margin: 15, marginTop: 0, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  commentsTitle: { fontSize: 18, fontWeight: '900', color: '#1f2937', marginBottom: 20 },
  commentInputRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  commentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#667eea', justifyContent: 'center', alignItems: 'center' },
  commentAvatarText: { color: 'white', fontSize: 16, fontWeight: '700' },
  replyingToContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#dbeafe', padding: 8, borderRadius: 8, marginBottom: 8 },
  replyingToText: { fontSize: 12, color: '#1e40af', fontWeight: '600' },
  replyingToCancel: { fontSize: 12, color: '#dc2626', fontWeight: '700' },
  commentInput: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, minHeight: 80, textAlignVertical: 'top', marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  commentButton: { backgroundColor: '#667eea', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  commentButtonDisabled: { backgroundColor: '#d1d5db' },
  commentButtonText: { color: 'white', fontWeight: '700', fontSize: 14 },
  noComments: { paddingVertical: 40, alignItems: 'center' },
  noCommentsEmoji: { fontSize: 40, marginBottom: 10 },
  noCommentsText: { fontSize: 14, color: '#9ca3af' },
  
  commentItem: { marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  replyItem: { borderBottomWidth: 0, paddingBottom: 10 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  commentAuthor: { fontSize: 14, fontWeight: '700', color: '#374151' },
  commentDate: { fontSize: 12, color: '#9ca3af' },
  commentContent: { fontSize: 14, color: '#4b5563', lineHeight: 20, marginBottom: 8 },
  commentActions: { flexDirection: 'row', gap: 15 },
  commentActionText: { fontSize: 12, color: '#667eea', fontWeight: '600' },
  
  commentEditInput: { backgroundColor: '#f9fafb', borderRadius: 8, padding: 10, minHeight: 60, textAlignVertical: 'top', borderWidth: 1, borderColor: '#d1d5db' },
  commentEditSaveButton: { backgroundColor: '#667eea', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  commentEditSaveButtonText: { color: 'white', fontWeight: '700', fontSize: 13 },
  commentEditCancelButton: { backgroundColor: '#f3f4f6', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  commentEditCancelButtonText: { color: '#6b7280', fontWeight: '700', fontSize: 13 },
  
  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  optionsModal: { backgroundColor: 'white', borderRadius: 15, overflow: 'hidden', width: 200 },
  optionButton: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  optionButtonText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  editModal: { backgroundColor: 'white', borderRadius: 20, padding: 25, width: '100%', maxWidth: 400 },
  editModalTitle: { fontSize: 20, fontWeight: '900', color: '#1f2937', marginBottom: 20 },
  editInput: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#e5e7eb' },
  editSaveButton: { flex: 1, backgroundColor: '#667eea', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  editSaveButtonText: { color: 'white', fontWeight: '700', fontSize: 16 },
  editCancelButton: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  editCancelButtonText: { color: '#6b7280', fontWeight: '700', fontSize: 16 },
})

