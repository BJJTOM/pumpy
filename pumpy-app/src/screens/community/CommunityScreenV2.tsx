import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, 
  Alert, RefreshControl, Modal, TextInput, Image, TextInput as SearchInput,
  KeyboardAvoidingView, Platform 
} from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { communityAPI } from '../../../services/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'
import * as ImagePicker from 'expo-image-picker'

const CATEGORIES = [
  { id: 'all', name: '전체', icon: '📋', color: '#667eea' },
  { id: 'general', name: '자유', icon: '💬', color: '#4facfe' },
  { id: 'workout', name: '운동', icon: '💪', color: '#f093fb' },
  { id: 'diet', name: '식단', icon: '🥗', color: '#43e97b' },
  { id: 'qna', name: 'Q&A', icon: '❓', color: '#fa709a' },
  { id: 'notice', name: '공지', icon: '📢', color: '#ff6b6b' },
]

export default function CommunityScreenV2() {
  const navigation = useNavigation()
  
  // 탭 상태 (내 체육관 | 전체 커뮤니티)
  const [activeTab, setActiveTab] = useState<'my_gym' | 'all'>('all')
  
  // 데이터 상태
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // 검색 상태
  const [searchMode, setSearchMode] = useState(false)
  const [searchText, setSearchText] = useState('')
  
  // 게시글 작성 모달
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [newPost, setNewPost] = useState({ 
    title: '', 
    content: '', 
    category: 'general', 
    images: [] as string[],
    video: null as string | null,
    videoDuration: 0,
    isGymOnly: false  // 내 체육관 전용 여부
  })
  
  // 좋아요 상태
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())

  // 필터링된 게시글 (useMemo로 최적화)
  const filteredPosts = useMemo(() => {
    let filtered = posts
    
    // 카테고리 필터
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }
    
    // 검색 필터
    if (searchText.trim()) {
      const search = searchText.toLowerCase()
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(search) || 
        p.content?.toLowerCase().includes(search)
      )
    }
    
    return filtered
  }, [posts, selectedCategory, searchText])

  // 게시글 로드
  const loadPosts = useCallback(async () => {
    setLoading(true)
    try {
      const userStr = await AsyncStorage.getItem('currentUser')
      if (userStr) {
        const user = JSON.parse(userStr)
        setCurrentUser(user)
        
        // 좋아요 목록 로드
        const liked = await AsyncStorage.getItem(`liked_posts_${user.id}`)
        if (liked) {
          setLikedPosts(new Set(JSON.parse(liked)))
        }
        
        // 공지사항 로드
        try {
          const announcementsRes = await communityAPI.getAnnouncements(activeTab === 'my_gym' ? user.gym?.id : undefined)
          setAnnouncements(announcementsRes.data || [])
        } catch (err) {
          console.log('공지사항 로드 실패 (무시):', err)
        }
        
        // 게시글 로드
        const params: any = {}
        if (activeTab === 'my_gym') {
          params.gym_only = true
          params.member_id = user.id
        }
        
        const res = await communityAPI.getPosts(params)
        setPosts(res.data || [])
      }
    } catch (error) {
      console.error('게시글 로드 실패:', error)
      Alert.alert('오류', '게시글을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [activeTab])

  useFocusEffect(
    useCallback(() => {
      loadPosts()
    }, [loadPosts])
  )

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    loadPosts()
  }, [loadPosts])

  // 이미지 선택
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
      setNewPost({ ...newPost, images: [...newPost.images, result.assets[0].uri] })
    }
  }

  // 영상 선택
  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('권한 필요', '영상을 선택하려면 갤러리 접근 권한이 필요합니다.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      const duration = result.assets[0].duration || 0
      if (duration > 30) {
        Alert.alert('알림', '영상은 최대 30초까지 업로드 가능합니다.')
        return
      }
      setNewPost({ ...newPost, video: result.assets[0].uri, videoDuration: duration })
    }
  }

  const removeImage = (index: number) => {
    setNewPost({ ...newPost, images: newPost.images.filter((_, i) => i !== index) })
  }

  // 게시글 작성
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
      const postData: any = {
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        author: currentUser.id,
        images: JSON.stringify(newPost.images),
        video_url: newPost.video || '',  // null 대신 빈 문자열
        video_duration: newPost.videoDuration || 0,
        gym: (newPost.isGymOnly || activeTab === 'my_gym') ? currentUser.gym?.id : null,
        is_gym_only: newPost.isGymOnly
      }
      
      await communityAPI.createPost(postData)

      setShowNewPostModal(false)
      setNewPost({ title: '', content: '', category: 'general', images: [], video: null, videoDuration: 0, isGymOnly: false })
      onRefresh()
      Alert.alert('성공', '게시글이 작성되었습니다.')
    } catch (error: any) {
      console.error('게시글 생성 실패:', error.response?.data || error.message)
      Alert.alert('오류', '게시글 작성에 실패했습니다.')
    }
  }

  // 좋아요
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
        return { ...p, like_count: isLiked ? Math.max(0, p.like_count - 1) : p.like_count + 1 }
      }
      return p
    }))

    try {
      if (isLiked) {
        await communityAPI.unlikePost(postId, currentUser.id)
      } else {
        await communityAPI.likePost(postId, currentUser.id)
      }
      await AsyncStorage.setItem(`liked_posts_${currentUser.id}`, JSON.stringify(Array.from(newLikedPosts)))
      
      // 서버에서 최신 데이터 가져오기
      const params: any = {}
      if (activeTab === 'my_gym') {
        params.gym_only = true
        params.member_id = currentUser.id
      }
      const res = await communityAPI.getPosts(params)
      setPosts(res.data || [])
    } catch (error: any) {
      console.error('좋아요 처리 실패:', error)
      // 실패 시 롤백
      if (isLiked) {
        newLikedPosts.add(postId)
      } else {
        newLikedPosts.delete(postId)
      }
      setLikedPosts(newLikedPosts)
    }
  }

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0]
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
        <Text style={styles.headerTitle}>커뮤니티</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setSearchMode(!searchMode)} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>{searchMode ? '✕' : '🔍'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowNewPostModal(true)} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>➕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 검색창 */}
      {searchMode && (
        <View style={styles.searchContainer}>
          <SearchInput
            style={styles.searchInput}
            placeholder="제목, 내용 검색..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      )}

      {/* 탭 (내 체육관 | 전체 커뮤니티) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'my_gym' && styles.tabActive]}
          onPress={() => {
            setActiveTab('my_gym')
            setSearchText('')
          }}
        >
          <Text style={[styles.tabText, activeTab === 'my_gym' && styles.tabTextActive]}>
            🏋️ 내 체육관
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => {
            setActiveTab('all')
            setSearchText('')
          }}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            🌍 전체 커뮤니티
          </Text>
        </TouchableOpacity>
      </View>

      {/* 공지사항 배너 */}
      {announcements.length > 0 && !searchMode && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.announcementScroll}>
          {announcements.map(announcement => (
            <TouchableOpacity 
              key={announcement.id} 
              style={styles.announcementBanner}
              onPress={() => (navigation as any).navigate('CommunityDetail', { postId: announcement.id })}
            >
              <Text style={styles.announcementIcon}>📢</Text>
              <Text style={styles.announcementText} numberOfLines={1}>{announcement.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Category Tabs */}
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

      {/* Posts List */}
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
              
              // 이미지 파싱 (첫 번째 이미지만 썸네일로 사용)
              let thumbnail = null
              try {
                if (post.images) {
                  const images = typeof post.images === 'string' ? JSON.parse(post.images) : post.images
                  if (Array.isArray(images) && images.length > 0) {
                    thumbnail = images[0]
                  }
                }
              } catch (e) {
                console.log('이미지 파싱 오류:', e)
              }
              
              return (
                <TouchableOpacity 
                  key={post.id} 
                  style={[styles.postItemNew, index === filteredPosts.length - 1 && styles.postItemLast]}
                  onPress={() => (navigation as any).navigate('CommunityDetail', { postId: post.id })}
                >
                  {/* 왼쪽: 콘텐츠 */}
                  <View style={styles.postContent}>
                    {/* 상단: 카테고리 + 영상 태그 */}
                    <View style={styles.postHeader}>
                      <View style={[styles.categoryBadge, { backgroundColor: `${categoryInfo.color}20` }]}>
                        <Text style={[styles.categoryBadgeText, { color: categoryInfo.color }]}>
                          {categoryInfo.icon} {categoryInfo.name}
                        </Text>
                      </View>
                      {post.video_url && <Text style={styles.videoIcon}>🎥</Text>}
                    </View>

                    {/* 제목 */}
                    <Text style={styles.postTitleNew} numberOfLines={2}>{post.title}</Text>

                    {/* 내용 미리보기 */}
                    <Text style={styles.postContentPreview} numberOfLines={2}>
                      {post.content}
                    </Text>

                    {/* 하단: 작성자 + 통계 */}
                    <View style={styles.postMeta}>
                      <View style={styles.authorInfo}>
                        {post.author?.photo ? (
                          <Image source={{ uri: post.author.photo }} style={styles.authorAvatar} />
                        ) : (
                          <View style={styles.authorAvatar}>
                            <Text style={styles.authorAvatarText}>
                              {post.author?.last_name?.[0] || 'U'}
                            </Text>
                          </View>
                        )}
                        <Text style={styles.authorName}>
                          {post.author?.last_name}{post.author?.first_name}
                        </Text>
                        <Text style={styles.postTime}>• {formatDate(post.created_at)}</Text>
                      </View>
                      
                      <View style={styles.postStats}>
                        <Text style={styles.statText}>👁️ {post.view_count || 0}</Text>
                        <TouchableOpacity 
                          onPress={(e) => {
                            e.stopPropagation()
                            handleLike(post.id)
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.statText}>{isLiked ? '❤️' : '🤍'} {post.like_count || 0}</Text>
                        </TouchableOpacity>
                        <Text style={styles.statText}>💬 {post.comment_count || 0}</Text>
                      </View>
                    </View>
                  </View>

                  {/* 오른쪽: 썸네일 */}
                  {thumbnail && (
                    <Image 
                      source={{ uri: thumbnail }} 
                      style={styles.thumbnailImage}
                      resizeMode="cover"
                    />
                  )}
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
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
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
              
              {/* 카테고리 선택 */}
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

              {/* 공개 범위 선택 (라디오 버튼) */}
              <View style={styles.scopeContainer}>
                <Text style={styles.scopeLabel}>📢 공개 범위</Text>
                
                {/* 전체 공개 */}
                <TouchableOpacity 
                  style={styles.scopeOption}
                  onPress={() => setNewPost({ ...newPost, isGymOnly: false })}
                >
                  <Text style={styles.radioButton}>{!newPost.isGymOnly ? '🔘' : '⚪'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.scopeOptionTitle}>전체 공개</Text>
                    <Text style={styles.scopeOptionDesc}>모든 사용자에게 표시됩니다</Text>
                  </View>
                </TouchableOpacity>
                
                {/* 내 체육관만 */}
                <TouchableOpacity 
                  style={styles.scopeOption}
                  onPress={() => setNewPost({ ...newPost, isGymOnly: true })}
                >
                  <Text style={styles.radioButton}>{newPost.isGymOnly ? '🔘' : '⚪'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.scopeOptionTitle}>내 체육관만</Text>
                    <Text style={styles.scopeOptionDesc}>같은 체육관 회원에게만 표시됩니다</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* 이미지/영상 선택 */}
              <View style={styles.mediaPickerContainer}>
                <View style={styles.mediaButtons}>
                  <TouchableOpacity style={styles.mediaButton} onPress={pickImages}>
                    <Text style={styles.mediaButtonText}>📷 사진 ({newPost.images.length}/5)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.mediaButton} onPress={pickVideo}>
                    <Text style={styles.mediaButtonText}>🎥 영상 {newPost.video ? '✓' : '(30초)'}</Text>
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
                
                {newPost.video && (
                  <View style={styles.videoPreview}>
                    <Text style={styles.videoPreviewText}>🎥 영상 선택됨 ({Math.floor(newPost.videoDuration)}초)</Text>
                    <TouchableOpacity onPress={() => setNewPost({ ...newPost, video: null, videoDuration: 0 })}>
                      <Text style={styles.removeVideoText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <TouchableOpacity style={styles.modalButton} onPress={handleCreatePost}>
                <Text style={styles.modalButtonText}>작성 완료</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#e0e0e0' }]} onPress={() => setShowNewPostModal(false)}>
                <Text style={[styles.modalButtonText, { color: '#333' }]}>취소</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'white', fontSize: 16, marginTop: 16, fontWeight: '600' },
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, paddingTop: 50 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: 'white' },
  headerActions: { flexDirection: 'row', gap: 12 },
  headerButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerButtonText: { fontSize: 20 },
  
  // 검색
  searchContainer: { paddingHorizontal: 20, paddingBottom: 12 },
  searchInput: { backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#333' },
  
  // 탭
  tabContainer: { flexDirection: 'row', backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 8, gap: 12 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: '#f3f4f6' },
  tabActive: { backgroundColor: '#667eea' },
  tabText: { fontSize: 15, fontWeight: '700', color: '#6b7280' },
  tabTextActive: { color: 'white' },
  
  // 공지사항 배너
  announcementScroll: { paddingHorizontal: 20, paddingVertical: 12, maxHeight: 80 },
  announcementBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff3cd', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginRight: 12, borderWidth: 1, borderColor: '#ffc107' },
  announcementIcon: { fontSize: 20, marginRight: 8 },
  announcementText: { fontSize: 14, fontWeight: '700', color: '#856404', maxWidth: 200 },
  
  // 카테고리 탭
  categoryTabsWrapper: { backgroundColor: 'white', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  categoryTabsContainer: { paddingHorizontal: 16, gap: 0 },
  categoryTab: { paddingHorizontal: 16, paddingVertical: 8, marginRight: 4 },
  categoryTabActive: { borderBottomWidth: 2, borderBottomColor: '#667eea' },
  categoryTabText: { fontSize: 14, fontWeight: '600', color: '#9ca3af' },
  categoryTabTextActive: { color: '#667eea', fontWeight: '700' },
  
  // 게시글 리스트
  postsListContainer: { flex: 1, backgroundColor: 'white' },
  postsList: { flex: 1 },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 16, fontWeight: '800', color: '#6b7280', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#9ca3af' },
  
  // 게시글 아이템 (새 디자인 - 썸네일 포함)
  postItemNew: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: 12 },
  postItemLast: { borderBottomWidth: 0 },
  postContent: { flex: 1 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  categoryBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  categoryBadgeText: { fontSize: 11, fontWeight: '700' },
  videoIcon: { fontSize: 16 },
  postTitleNew: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 6, lineHeight: 22 },
  postContentPreview: { fontSize: 14, color: '#6b7280', lineHeight: 20, marginBottom: 12 },
  postMeta: { flexDirection: 'column', gap: 8 },
  authorInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  authorAvatar: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#667eea', justifyContent: 'center', alignItems: 'center' },
  authorAvatarText: { color: 'white', fontSize: 10, fontWeight: '700' },
  authorName: { fontSize: 12, fontWeight: '600', color: '#374151' },
  postTime: { fontSize: 11, color: '#9ca3af' },
  postStats: { flexDirection: 'row', gap: 12 },
  statText: { fontSize: 11, color: '#9ca3af', fontWeight: '600' },
  thumbnailImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#f3f4f6' },
  
  // 모달
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, maxHeight: '90%' },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#1f2937', marginBottom: 20 },
  input: { backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, marginBottom: 12, color: '#333' },
  categoryPickerContainer: { marginBottom: 20 },
  categoryPickerLabel: { fontSize: 15, fontWeight: '700', color: '#374151' },
  modalCategoryPill: { backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 },
  modalCategoryText: { fontSize: 13, fontWeight: '700', color: '#6b7280' },
  
  // 공개 범위 선택 (라디오 버튼)
  scopeContainer: { marginBottom: 20, backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  scopeLabel: { fontSize: 15, fontWeight: '700', color: '#374151', marginBottom: 12 },
  scopeOption: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: 'white', borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  radioButton: { fontSize: 24, marginRight: 12 },
  scopeOptionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  scopeOptionDesc: { fontSize: 12, color: '#6b7280' },
  
  // 미디어
  mediaPickerContainer: { marginBottom: 20 },
  mediaButtons: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  mediaButton: { flex: 1, backgroundColor: '#667eea', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  mediaButtonText: { color: 'white', fontSize: 14, fontWeight: '700' },
  imagePreviewScroll: { marginTop: 12 },
  imagePreviewContainer: { position: 'relative', marginRight: 10 },
  imagePreview: { width: 100, height: 100, borderRadius: 12, backgroundColor: '#f3f4f6' },
  removeImageButton: { position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: 12, backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center' },
  removeImageButtonText: { color: 'white', fontSize: 14, fontWeight: '800' },
  videoPreview: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f093fb15', borderRadius: 12, padding: 12, marginTop: 12 },
  videoPreviewText: { fontSize: 14, fontWeight: '700', color: '#f093fb' },
  removeVideoText: { fontSize: 20, color: '#ef4444', fontWeight: '800' },
  
  modalButton: { backgroundColor: '#667eea', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  modalButtonText: { color: 'white', fontSize: 17, fontWeight: '800' },
})

