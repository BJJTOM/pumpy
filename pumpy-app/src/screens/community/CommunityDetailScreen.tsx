import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, KeyboardAvoidingView, Platform, Modal, Image } from 'react-native'
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native'
import { communityAPI } from '../../../services/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'
import * as ImagePicker from 'expo-image-picker'

const CATEGORIES = [
  { id: 'general', name: '자유게시판', icon: '💬', color: '#4facfe' },
  { id: 'workout', name: '운동정보', icon: '💪', color: '#f093fb' },
  { id: 'nutrition', name: '식단', icon: '🍎', color: '#30cfd0' },
  { id: 'question', name: '질문', icon: '❓', color: '#fa709a' },
  { id: 'success', name: '성공사례', icon: '🎉', color: '#fbc531' },
  { id: 'review', name: '리뷰', icon: '⭐', color: '#a8e063' },
]

export default function CommunityDetailScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const postId = (route.params as any)?.postId

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingCommentContent, setEditingCommentContent] = useState('')
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
      
      // 조회수 증가 API 호출 (즉시 UI 업데이트)
      try {
        await communityAPI.incrementViewCount(postId)
        postData.view_count = (postData.view_count || 0) + 1
      } catch (viewError) {
        console.log('조회수 증가 실패 (무시):', viewError)
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
      setComments(res.data)
    } catch (error) {
      console.error('댓글 로드 실패:', error)
      // AWS 서버 업데이트 전까지 임시 처리
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

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    if (!currentUser) {
      Alert.alert('오류', '로그인이 필요합니다.')
      return
    }

    try {
      await communityAPI.addComment(postId, {
        author: currentUser.id,
        content: newComment
      })
      setNewComment('')
      loadComments()
      loadPost()
      Alert.alert('성공', '댓글이 작성되었습니다.')
    } catch (error: any) {
      console.error('댓글 작성 실패:', error.response?.data || error.message)
      // AWS 서버 업데이트 전까지 안내 메시지
      Alert.alert('안내', '댓글 기능은 서버 업데이트 후 사용 가능합니다.\n\n잠시 후 다시 시도해주세요.')
    }
  }

  const handleEditPost = () => {
    setEditedTitle(post.title)
    setEditedContent(post.content)
    setShowOptionsModal(false)
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editedTitle.trim() || !editedContent.trim()) {
      Alert.alert('오류', '제목과 내용을 입력해주세요.')
      return
    }

    try {
      // TODO: API 연동 시 실제 수정 API 호출
      Alert.alert('준비 중', '게시글 수정 기능은 준비 중입니다.\n(실제 서비스에서는 수정이 반영됩니다)')
      setShowEditModal(false)
      // await communityAPI.updatePost(postId, { title: editedTitle, content: editedContent })
      // loadPost()
    } catch (error) {
      Alert.alert('오류', '게시글 수정에 실패했습니다.')
    }
  }

  const handleDeletePost = () => {
    setShowOptionsModal(false)
    Alert.alert(
      '게시글 삭제',
      '정말로 이 게시글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: API 연동 시 실제 삭제 API 호출
              Alert.alert('준비 중', '게시글 삭제 기능은 준비 중입니다.\n(실제 서비스에서는 삭제가 반영됩니다)')
              // await communityAPI.deletePost(postId)
              // navigation.goBack()
            } catch (error) {
              Alert.alert('오류', '게시글 삭제에 실패했습니다.')
            }
          }
        }
      ]
    )
  }

  const handleReportPost = () => {
    setShowOptionsModal(false)
    Alert.alert(
      '게시글 신고',
      '이 게시글을 신고하시겠습니까?\n신고 사유를 선택해주세요.',
      [
        { text: '취소', style: 'cancel' },
        { text: '스팸/홍보', onPress: () => submitReport('spam') },
        { text: '욕설/비방', onPress: () => submitReport('abusive') },
        { text: '허위 정보', onPress: () => submitReport('false_info') },
        { text: '기타', onPress: () => submitReport('other') }
      ]
    )
  }

  const submitReport = async (reason: string) => {
    try {
      // TODO: API 연동 시 실제 신고 API 호출
      Alert.alert('신고 완료', '신고가 접수되었습니다. 검토 후 조치하겠습니다.\n(실제 서비스에서는 관리자에게 전달됩니다)')
      // await communityAPI.reportPost(postId, { reason, reporter: currentUser.id })
    } catch (error) {
      Alert.alert('오류', '신고 처리 중 문제가 발생했습니다.')
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowOptionsModal(true)} style={styles.optionsButton}>
            <Text style={styles.optionsButtonText}>⋮</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Post Card */}
          <View style={styles.postCard}>
            <View style={[styles.categoryPill, { backgroundColor: `${categoryInfo.color}20` }]}>
              <Text style={[styles.categoryText, { color: categoryInfo.color }]}>
                {categoryInfo.icon} {categoryInfo.name}
              </Text>
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
                <TextInput
                  style={styles.commentInput}
                  placeholder="댓글을 입력하세요..."
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
                  <Text style={styles.commentButtonText}>댓글 작성</Text>
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
              comments.map(comment => (
                <View key={comment.id} style={styles.commentItem}>
                  {comment.author?.photo ? (
                    <Image source={{ uri: comment.author.photo }} style={styles.commentAvatar} />
                  ) : (
                    <View style={styles.commentAvatar}>
                      <Text style={styles.commentAvatarText}>{comment.author?.last_name?.[0] || 'U'}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <View style={styles.commentHeader}>
                      <View>
                        <Text style={styles.commentAuthor}>{comment.author?.last_name}{comment.author?.first_name}</Text>
                        <Text style={styles.commentDate}>{formatDate(comment.created_at)}</Text>
                      </View>
                    </View>
                    <Text style={styles.commentContent}>{comment.content}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Options Modal */}
        <Modal visible={showOptionsModal} transparent animationType="fade" onRequestClose={() => setShowOptionsModal(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowOptionsModal(false)}>
            <View style={styles.optionsModal}>
              {currentUser && post && currentUser.id === post.author.id ? (
                <>
                  <TouchableOpacity style={styles.optionItem} onPress={handleEditPost}>
                    <Text style={styles.optionIcon}>✏️</Text>
                    <Text style={styles.optionText}>게시글 수정</Text>
                  </TouchableOpacity>
                  <View style={styles.optionDivider} />
                  <TouchableOpacity style={[styles.optionItem, styles.optionItemDanger]} onPress={handleDeletePost}>
                    <Text style={styles.optionIcon}>🗑️</Text>
                    <Text style={[styles.optionText, styles.optionTextDanger]}>게시글 삭제</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={[styles.optionItem, styles.optionItemDanger]} onPress={handleReportPost}>
                  <Text style={styles.optionIcon}>⚠️</Text>
                  <Text style={[styles.optionText, styles.optionTextDanger]}>게시글 신고</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Edit Modal */}
        <Modal visible={showEditModal} transparent animationType="slide" onRequestClose={() => setShowEditModal(false)}>
          <View style={styles.editModalOverlay}>
            <View style={styles.editModalContent}>
              <Text style={styles.editModalTitle}>게시글 수정</Text>
              <TextInput
                style={styles.editInput}
                placeholder="제목"
                placeholderTextColor="#999"
                value={editedTitle}
                onChangeText={setEditedTitle}
              />
              <TextInput
                style={[styles.editInput, styles.editTextArea]}
                placeholder="내용"
                placeholderTextColor="#999"
                multiline
                numberOfLines={8}
                value={editedContent}
                onChangeText={setEditedContent}
              />
              <View style={styles.editModalButtons}>
                <TouchableOpacity style={[styles.editModalButton, styles.editModalButtonCancel]} onPress={() => setShowEditModal(false)}>
                  <Text style={styles.editModalButtonTextCancel}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.editModalButton, styles.editModalButtonSave]} onPress={handleSaveEdit}>
                  <Text style={styles.editModalButtonText}>저장</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 40 },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  backButtonText: { color: 'white', fontSize: 18, fontWeight: '800' },
  optionsButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  optionsButtonText: { color: 'white', fontSize: 24, fontWeight: '700', marginTop: -4 },
  content: { flex: 1, paddingHorizontal: 20 },
  postCard: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 25, marginBottom: 20 },
  categoryPill: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, marginBottom: 15 },
  categoryText: { fontSize: 12, fontWeight: '700' },
  postTitle: { fontSize: 22, fontWeight: '900', color: '#1f2937', marginBottom: 15, lineHeight: 30 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 15, borderBottomWidth: 2, borderBottomColor: '#f3f4f6', marginBottom: 20 },
  authorAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#667eea', justifyContent: 'center', alignItems: 'center' },
  authorAvatarText: { color: 'white', fontSize: 16, fontWeight: '700' },
  authorName: { fontSize: 14, fontWeight: '700', color: '#374151' },
  postDate: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statItem: { fontSize: 12, color: '#9ca3af' },
  postContent: { fontSize: 15, lineHeight: 24, color: '#374151', marginBottom: 20 },
  postImagesScroll: { marginBottom: 25 },
  postImage: { width: 280, height: 280, borderRadius: 16, marginRight: 10, backgroundColor: '#f3f4f6' },
  likeButtonContainer: { alignItems: 'center', paddingTop: 20, borderTopWidth: 2, borderTopColor: '#f3f4f6' },
  likeButton: { paddingHorizontal: 30, paddingVertical: 12, borderRadius: 20, backgroundColor: '#f3f4f6' },
  likeButtonActive: { backgroundColor: '#f093fb' },
  likeButtonText: { fontSize: 14, fontWeight: '700', color: '#6b7280' },
  commentsCard: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 25 },
  commentsTitle: { fontSize: 18, fontWeight: '800', color: '#1f2937', marginBottom: 20 },
  commentInputRow: { flexDirection: 'row', gap: 10, marginBottom: 25, paddingBottom: 20, borderBottomWidth: 2, borderBottomColor: '#f3f4f6' },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#667eea', justifyContent: 'center', alignItems: 'center' },
  commentAvatarText: { color: 'white', fontSize: 14, fontWeight: '700' },
  commentInput: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, fontSize: 14, color: '#333', borderWidth: 2, borderColor: '#e5e7eb', minHeight: 80, textAlignVertical: 'top', marginBottom: 10 },
  commentButton: { backgroundColor: '#667eea', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20, alignSelf: 'flex-start' },
  commentButtonDisabled: { backgroundColor: '#e5e7eb' },
  commentButtonText: { color: 'white', fontSize: 13, fontWeight: '700' },
  noComments: { paddingVertical: 40, alignItems: 'center' },
  noCommentsEmoji: { fontSize: 32, marginBottom: 10 },
  noCommentsText: { fontSize: 14, fontWeight: '600', color: '#9ca3af' },
  commentItem: { flexDirection: 'row', gap: 10, padding: 15, backgroundColor: '#f9fafb', borderRadius: 12, marginBottom: 15 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  commentAuthor: { fontSize: 13, fontWeight: '700', color: '#374151' },
  commentDate: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  commentContent: { fontSize: 13, lineHeight: 20, color: '#374151' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  optionsModal: { backgroundColor: 'white', borderRadius: 20, padding: 8, minWidth: 200, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10 },
  optionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  optionItemDanger: {},
  optionIcon: { fontSize: 20 },
  optionText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  optionTextDanger: { color: '#ef4444' },
  optionDivider: { height: 1, backgroundColor: '#f3f4f6', marginHorizontal: 16 },
  editModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  editModalContent: { width: '100%', backgroundColor: 'white', borderRadius: 25, padding: 25 },
  editModalTitle: { fontSize: 22, fontWeight: '900', color: '#1f2937', marginBottom: 20, textAlign: 'center' },
  editInput: { backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#333', borderWidth: 2, borderColor: '#e5e7eb', marginBottom: 15 },
  editTextArea: { height: 200, textAlignVertical: 'top' },
  editModalButtons: { flexDirection: 'row', gap: 10, marginTop: 10 },
  editModalButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  editModalButtonCancel: { backgroundColor: '#f3f4f6' },
  editModalButtonSave: { backgroundColor: '#667eea' },
  editModalButtonTextCancel: { fontSize: 15, fontWeight: '700', color: '#6b7280' },
  editModalButtonText: { fontSize: 15, fontWeight: '700', color: 'white' },
})

