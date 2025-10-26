import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Modal, TextInput, Image } from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { communityAPI } from '../../../services/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'
import * as ImagePicker from 'expo-image-picker'

const CATEGORIES = [
  { id: 'all', name: '전체', icon: '📋', color: '#667eea' },
  { id: 'general', name: '자유게시판', icon: '💬', color: '#4facfe' },
  { id: 'workout', name: '운동정보', icon: '💪', color: '#f093fb' },
  { id: 'nutrition', name: '식단', icon: '🍎', color: '#30cfd0' },
  { id: 'question', name: '질문', icon: '❓', color: '#fa709a' },
  { id: 'success', name: '성공사례', icon: '🎉', color: '#fbc531' },
  { id: 'review', name: '리뷰', icon: '⭐', color: '#a8e063' },
]

export default function CommunityScreen() {
  const navigation = useNavigation()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general', images: [] as string[] })
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())

  // 필터링된 게시글 계산 (useMemo로 최적화)
  const filteredPosts = useMemo(() => {
    return selectedCategory === 'all' ? posts : posts.filter(p => p.category === selectedCategory)
  }, [posts, selectedCategory])

  const loadPosts = useCallback(async () => {
    setLoading(true)
    try {
      const userStr = await AsyncStorage.getItem('currentUser')
      if (userStr) {
        const user = JSON.parse(userStr)
        setCurrentUser(user)
        const liked = await AsyncStorage.getItem(`liked_posts_${user.id}`)
        if (liked) {
          setLikedPosts(new Set(JSON.parse(liked)))
        }
      }

      const res = await communityAPI.getPosts()
      setPosts(res.data)
    } catch (error) {
      console.error('게시글 로드 실패:', error)
      Alert.alert('오류', '게시글을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadPosts()
    }, [loadPosts])
  )

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    loadPosts()
  }, [loadPosts])

  const pickImages = async () => {
    if (newPost.images.length >= 5) {
      Alert.alert('알림', '최대 5장까지 선택할 수 있습니다.')
      return
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진을 선택하려면 갤러리 접근 권한이 필요합니다.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      const remainingSlots = 5 - newPost.images.length
      if (remainingSlots > 0) {
        setNewPost({ ...newPost, images: [...newPost.images, result.assets[0].uri] })
      }
    }
  }

  const removeImage = (index: number) => {
    const newImages = newPost.images.filter((_, i) => i !== index)
    setNewPost({ ...newPost, images: newImages })
  }

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      Alert.alert('오류', '제목과 내용을 입력해주세요!')
      return
    }
    if (!currentUser) {
      Alert.alert('오류', '로그인이 필요합니다.')
      return
    }

    try {
      await communityAPI.createPost({
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        author: currentUser.id,
        images: JSON.stringify(newPost.images)
      })

      setShowNewPostModal(false)
      setNewPost({ title: '', content: '', category: 'general', images: [] })
      onRefresh()
      Alert.alert('성공', '게시글이 작성되었습니다.')
    } catch (error: any) {
      console.error('게시글 생성 실패:', error.response?.data || error.message)
      Alert.alert('오류', '게시글 작성에 실패했습니다.')
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

  const handleLike = async (postId: number) => {
    if (!currentUser) {
      Alert.alert('오류', '로그인이 필요합니다.')
      return
    }

    const isLiked = likedPosts.has(postId)
    const newLikedPosts = new Set(likedPosts)

    // UI 즉시 업데이트
    if (isLiked) {
      newLikedPosts.delete(postId)
    } else {
      newLikedPosts.add(postId)
    }
    setLikedPosts(newLikedPosts)

    // 로컬 게시글 카운트 즉시 업데이트
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return { ...p, like_count: isLiked ? p.like_count - 1 : p.like_count + 1 }
      }
      return p
    }))

    try {
      if (isLiked) {
        await communityAPI.unlikePost(postId)
      } else {
        await communityAPI.likePost(postId)
      }
      await AsyncStorage.setItem(`liked_posts_${currentUser.id}`, JSON.stringify(Array.from(newLikedPosts)))
      
      // 서버에서 최신 데이터 가져오기
      const res = await communityAPI.getPosts()
      setPosts(res.data)
    } catch (error: any) {
      console.error('좋아요 처리 실패:', error.response?.data || error.message)
      // 실패 시 롤백
      if (isLiked) {
        newLikedPosts.add(postId)
      } else {
        newLikedPosts.delete(postId)
      }
      setLikedPosts(newLikedPosts)
      Alert.alert('오류', '좋아요 처리 중 문제가 발생했습니다.')
    }
  }

  if (loading && !refreshing) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.center}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>로딩 중...</Text>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>커뮤니티</Text>
          <Text style={styles.headerSubtitle}>함께 나누는 운동 이야기</Text>
        </View>
        <TouchableOpacity style={styles.newPostButton} onPress={() => setShowNewPostModal(true)}>
          <Text style={{ fontSize: 16 }}>✏️</Text>
          <Text style={styles.newPostButtonText}>글쓰기</Text>
        </TouchableOpacity>
      </View>

      {/* Category Tabs - 작고 컴팩트한 버전 */}
      <View style={styles.categoryTabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryTabsContainer}>
          {CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                selectedCategory === category.id && styles.categoryTabActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={[
                styles.categoryTabText,
                selectedCategory === category.id && styles.categoryTabTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Posts List - 일반 커뮤니티 리스트 형식 */}
      <View style={styles.postsListContainer}>
        <ScrollView
          style={styles.postsList}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />
          }
        >
          {filteredPosts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={styles.emptyText}>게시글이 없습니다</Text>
              <Text style={styles.emptySubtext}>첫 번째 게시글을 작성해보세요!</Text>
            </View>
          ) : (
            filteredPosts.map((post, index) => {
              const categoryInfo = getCategoryInfo(post.category)
              const isLiked = likedPosts.has(post.id)
              return (
                <TouchableOpacity 
                  key={post.id} 
                  style={[styles.postItem, index === filteredPosts.length - 1 && styles.postItemLast]}
                  onPress={() => (navigation as any).navigate('CommunityDetail', { postId: post.id })}
                >
                  {/* 상단: 카테고리 배지 */}
                  <View style={styles.postItemHeader}>
                    <View style={styles.postItemCategory}>
                      <Text style={styles.postItemCategoryText}>🔖 {categoryInfo.name}</Text>
                    </View>
                  </View>

                  {/* 제목 */}
                  <Text style={styles.postItemTitle} numberOfLines={1}>{post.title}</Text>

                  {/* 내용 미리보기 */}
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.postItemContent} numberOfLines={2}>
                        {post.content}
                      </Text>
                    </View>
                    
                    {/* 썸네일 이미지 */}
                    {(() => {
                      try {
                        if (post.images) {
                          const images = typeof post.images === 'string' ? JSON.parse(post.images) : post.images
                          if (Array.isArray(images) && images.length > 0 && images[0]) {
                            return (
                              <Image 
                                source={{ uri: images[0] }} 
                                style={styles.postItemThumbnail}
                                resizeMode="cover"
                              />
                            )
                          }
                        }
                      } catch (e) {
                        console.log('이미지 파싱 오류:', e)
                      }
                      return null
                    })()}
                  </View>

                  {/* 하단: 작성자 정보 + 통계 */}
                  <View style={styles.postItemFooter}>
                    <View style={styles.postItemAuthor}>
                      {post.author.photo ? (
                        <Image source={{ uri: post.author.photo }} style={styles.postItemAvatar} />
                      ) : (
                        <View style={styles.postItemAvatar}>
                          <Text style={styles.postItemAvatarText}>
                            {post.author.last_name?.[0] || 'U'}
                          </Text>
                        </View>
                      )}
                      <Text style={styles.postItemAuthorName}>
                        {post.author.last_name}{post.author.first_name}
                      </Text>
                      <Text style={styles.postItemDate}>{formatDate(post.created_at)}</Text>
                    </View>

                    <View style={styles.postItemStats}>
                      <Text style={styles.postItemStat}>👁️ {post.view_count || 0}</Text>
                      <TouchableOpacity 
                        onPress={(e) => {
                          e.stopPropagation()
                          handleLike(post.id)
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.postItemStat}>{isLiked ? '❤️' : '🤍'} {post.like_count || 0}</Text>
                      </TouchableOpacity>
                      <Text style={styles.postItemStat}>💬 {post.comment_count || 0}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )
            })
          )}
        </ScrollView>
      </View>

      {/* New Post Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showNewPostModal}
        onRequestClose={() => setShowNewPostModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>새 게시글 작성</Text>
            <TextInput
              style={styles.input}
              placeholder="제목"
              placeholderTextColor="#ccc"
              value={newPost.title}
              onChangeText={(text) => setNewPost({ ...newPost, title: text })}
            />
            <TextInput
              style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
              placeholder="내용"
              placeholderTextColor="#ccc"
              multiline
              value={newPost.content}
              onChangeText={(text) => setNewPost({ ...newPost, content: text })}
            />
            <View style={styles.categoryPickerContainer}>
              <Text style={styles.categoryPickerLabel}>카테고리:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                {CATEGORIES.filter(c => c.id !== 'all').map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.modalCategoryPill,
                      newPost.category === category.id && { backgroundColor: category.color }
                    ]}
                    onPress={() => setNewPost({ ...newPost, category: category.id })}
                  >
                    <Text style={[styles.modalCategoryText, newPost.category === category.id && { color: 'white' }]}>
                      {category.icon} {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* 이미지 선택 영역 */}
            <View style={styles.imagePickerContainer}>
              <View style={styles.imagePickerHeader}>
                <Text style={styles.imagePickerLabel}>사진 ({newPost.images.length}/5) - 선택사항</Text>
                <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
                  <Text style={styles.addImageButtonText}>📷 사진 추가</Text>
                </TouchableOpacity>
              </View>
              {newPost.images.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewScroll}>
                  {newPost.images.map((uri, index) => (
                    <View key={index} style={styles.imagePreviewContainer}>
                      <Image source={{ uri }} style={styles.imagePreview} />
                      <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                        <Text style={styles.removeImageButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>

            <TouchableOpacity style={styles.modalButton} onPress={handleCreatePost}>
              <Text style={styles.modalButtonText}>작성 완료</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#e0e0e0' }]} onPress={() => setShowNewPostModal(false)}>
              <Text style={[styles.modalButtonText, { color: '#333' }]}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'white', fontSize: 18, fontWeight: '700', marginTop: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 40 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: 'white', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginTop: 4 },
  newPostButton: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 },
  newPostButtonText: { color: 'white', fontWeight: '800', fontSize: 13 },
  
  // 새로운 작은 카테고리 탭
  categoryTabsWrapper: { backgroundColor: 'white', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  categoryTabsContainer: { paddingHorizontal: 16, gap: 0 },
  categoryTab: { paddingHorizontal: 16, paddingVertical: 8, marginRight: 4 },
  categoryTabActive: { borderBottomWidth: 2, borderBottomColor: '#667eea' },
  categoryTabText: { fontSize: 14, fontWeight: '600', color: '#9ca3af' },
  categoryTabTextActive: { color: '#667eea', fontWeight: '700' },
  
  // 게시글 리스트 컨테이너
  postsListContainer: { flex: 1, backgroundColor: 'white' },
  postsList: { flex: 1 },
  emptyContainer: { alignItems: 'center', paddingVertical: 60, backgroundColor: 'white', borderRadius: 20, marginTop: 20, marginHorizontal: 20 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 16, fontWeight: '800', color: '#6b7280', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#9ca3af' },
  
  // 일반 리스트 형식 게시글 아이템
  postItem: { 
    backgroundColor: 'white', 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f3f4f6' 
  },
  postItemLast: { borderBottomWidth: 0 },
  postItemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  postItemCategory: { backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  postItemCategoryText: { fontSize: 11, fontWeight: '700', color: '#667eea' },
  postItemTitle: { fontSize: 16, fontWeight: '800', color: '#1f2937', marginBottom: 6, lineHeight: 22 },
  postItemContent: { fontSize: 14, color: '#6b7280', lineHeight: 20, marginBottom: 12 },
  postItemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  postItemAuthor: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  postItemAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#667eea', justifyContent: 'center', alignItems: 'center' },
  postItemAvatarText: { color: 'white', fontSize: 11, fontWeight: '700' },
  postItemAuthorName: { fontSize: 13, fontWeight: '600', color: '#374151' },
  postItemDate: { fontSize: 12, color: '#9ca3af', marginLeft: 4 },
  postItemStats: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  postItemStat: { fontSize: 12, color: '#9ca3af', fontWeight: '600' },
  postItemThumbnail: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#f3f4f6' },
  
  // 모달 스타일
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', padding: 20 },
  modalContent: { width: '100%', maxWidth: 500, backgroundColor: 'white', borderRadius: 25, padding: 30, maxHeight: '90%' },
  modalTitle: { fontSize: 22, fontWeight: '900', marginBottom: 25, color: '#1f2937', textAlign: 'center' },
  input: { width: '100%', backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 15, fontSize: 15, color: '#333', borderWidth: 2, borderColor: '#e5e7eb' },
  categoryPickerContainer: { width: '100%', marginBottom: 20 },
  categoryPickerLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 },
  modalCategoryPill: { backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, borderWidth: 2, borderColor: '#e5e7eb' },
  modalCategoryText: { fontSize: 12, fontWeight: '700', color: '#6b7280' },
  
  // 이미지 선택 스타일
  imagePickerContainer: { width: '100%', marginBottom: 20 },
  imagePickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  imagePickerLabel: { fontSize: 13, fontWeight: '700', color: '#374151' },
  addImageButton: { backgroundColor: '#667eea', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addImageButtonText: { color: 'white', fontSize: 12, fontWeight: '700' },
  imagePreviewScroll: { marginTop: 8 },
  imagePreviewContainer: { position: 'relative', marginRight: 10 },
  imagePreview: { width: 100, height: 100, borderRadius: 12, backgroundColor: '#f3f4f6' },
  removeImageButton: { position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: 12, backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  removeImageButtonText: { color: 'white', fontSize: 14, fontWeight: '800', lineHeight: 18 },
  
  modalButton: { width: '100%', paddingVertical: 14, backgroundColor: '#667eea', borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: '#667eea', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 5 },
  modalButtonText: { color: 'white', fontSize: 16, fontWeight: '800' },
})
