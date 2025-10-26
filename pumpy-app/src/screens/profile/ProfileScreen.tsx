import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, Image } from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'
import { api, clearToken } from '../../../services/api'

const ROOM_THEMES = [
  { id: 'default', name: '기본', colors: ['#667eea', '#764ba2'], icon: '🏠' },
  { id: 'gym', name: '헬스장', colors: ['#f093fb', '#f5576c'], icon: '🏋️' },
  { id: 'beach', name: '해변', colors: ['#4facfe', '#00f2fe'], icon: '🏖️' },
  { id: 'space', name: '우주', colors: ['#0f2027', '#2c5364'], icon: '🚀' },
  { id: 'forest', name: '숲', colors: ['#0ba360', '#3cba92'], icon: '🌲' }
]

const TITLES = [
  { id: 1, name: '초보자', color: '#9ca3af', minAttendance: 0 },
  { id: 2, name: '운동 시작', color: '#10b981', minAttendance: 10 },
  { id: 3, name: '꾸준한 운동러', color: '#3b82f6', minAttendance: 30 },
  { id: 4, name: '운동 마니아', color: '#8b5cf6', minAttendance: 50 },
  { id: 5, name: '철인', color: '#f59e0b', minAttendance: 100 },
  { id: 6, name: '헬스 마스터', color: '#dc2626', minAttendance: 200 },
  { id: 7, name: '전설의 운동러', color: '#fbbf24', minAttendance: 365 }
]

const BADGES = [
  { id: 'first_step', name: '첫 걸음', icon: '👟', desc: '첫 출석 완료', color: '#10b981', condition: 'total >= 1' },
  { id: 'weekly_warrior', name: '주간 전사', icon: '🔥', desc: '7일 연속 출석', color: '#f59e0b', condition: 'consecutive >= 7' },
  { id: 'monthly_master', name: '월간 달인', icon: '📅', desc: '한 달 20회 이상 출석', color: '#667eea', condition: 'thisMonth >= 20' },
  { id: 'hundred_club', name: '100 클럽', icon: '💯', desc: '총 100회 출석', color: '#8b5cf6', condition: 'total >= 100' },
  { id: 'iron_will', name: '강철 의지', icon: '💪', desc: '30일 연속 출석', color: '#ef4444', condition: 'consecutive >= 30' },
  { id: 'annual_champion', name: '연간 챔피언', icon: '👑', desc: '1년 365회 출석', color: '#fbbf24', condition: 'total >= 365' },
  { id: 'early_bird', name: '아침형 인간', icon: '🌅', desc: '아침 운동 50회', color: '#4facfe', condition: 'morning >= 50' },
  { id: 'night_owl', name: '올빼미', icon: '🌙', desc: '저녁 운동 50회', color: '#6366f1', condition: 'night >= 50' },
  { id: 'consistent', name: '꾸준함의 달인', icon: '⭐', desc: '50일 연속 출석', color: '#10b981', condition: 'consecutive >= 50' },
  { id: 'legend', name: '전설', icon: '🏆', desc: '총 500회 출석', color: '#dc2626', condition: 'total >= 500' }
]

export default function ProfileScreen() {
  const navigation = useNavigation()
  const [loading, setLoading] = useState(true)
  const [member, setMember] = useState<any>(null)
  const [aiPhoto, setAiPhoto] = useState<string | null>(null)
  const [attendanceStats, setAttendanceStats] = useState({ consecutive: 0, thisMonth: 0, total: 0, morning: 0, night: 0 })
  const [roomBackground, setRoomBackground] = useState('default')
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [showBadgeModal, setShowBadgeModal] = useState(false)
  const [showTitleModal, setShowTitleModal] = useState(false)
  const [showGymInfoDetail, setShowGymInfoDetail] = useState(false)
  const [showMembershipDetail, setShowMembershipDetail] = useState(false)
  const [selectedTitle, setSelectedTitle] = useState<any>(null)

  const loadData = useCallback(async () => {
    try {
      const userStr = await AsyncStorage.getItem('currentUser')
      if (!userStr) {
        (navigation as any).reset({ index: 0, routes: [{ name: 'Login' }] })
        return
      }

      const user = JSON.parse(userStr)
      setMember(user)

      // Fetch latest member data from API
      try {
        const res = await api.get(`/members/${user.id}/`)
        setMember(res.data)
        await AsyncStorage.setItem('currentUser', JSON.stringify(res.data))
      } catch (error) {
        console.log('Failed to fetch latest member data:', error)
      }

      // Load saved data
      const savedPhoto = await AsyncStorage.getItem(`ai_photo_${user.id}`)
      if (savedPhoto) setAiPhoto(savedPhoto)

      const savedBg = await AsyncStorage.getItem(`room_background_${user.id}`)
      if (savedBg) setRoomBackground(savedBg)

      // Load attendance
      const res = await api.get(`/attendance/?member=${user.id}`)
      const records = res.data || []

      const thisMonth = records.filter((r: any) => {
        const date = new Date(r.check_in_time || r.date)
        const now = new Date()
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      }).length

      const morningCount = records.filter((r: any) => {
        const hour = new Date(r.check_in_time || r.date).getHours()
        return hour >= 5 && hour < 12
      }).length

      const nightCount = records.filter((r: any) => {
        const hour = new Date(r.check_in_time || r.date).getHours()
        return hour >= 18 && hour < 24
      }).length

      setAttendanceStats({
        consecutive: calculateConsecutiveDays(records),
        thisMonth,
        total: records.length,
        morning: morningCount,
        night: nightCount
      })
    } catch (error) {
      console.error('데이터 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }, [navigation])

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [loadData])
  )

  const calculateConsecutiveDays = (records: any[]) => {
    if (records.length === 0) return 0

    const dates = records
      .map((r: any) => {
        const dateStr = r.check_in_time || r.date
        return dateStr ? new Date(dateStr).toISOString().split('T')[0] : null
      })
      .filter((d): d is string => d !== null)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    let consecutive = 0
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    if (dates[0] !== today && dates[0] !== yesterday) return 0

    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
      if (dates[i] === expected) {
        consecutive++
      } else {
        break
      }
    }

    return consecutive
  }

  const handleLogout = async () => {
    Alert.alert(
      '로그아웃',
      '로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          onPress: async () => {
            try {
              // 모든 토큰 및 사용자 정보 삭제
              await clearToken()
              await AsyncStorage.removeItem('currentUser')
              await AsyncStorage.removeItem('userToken')
              
              // 약간의 지연을 주어 AsyncStorage가 완전히 업데이트되도록 함
              setTimeout(() => {
                Alert.alert('로그아웃 완료', '안전하게 로그아웃되었습니다.')
              }, 500)
            } catch (error) {
              console.error('로그아웃 오류:', error)
              Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.')
            }
          }
        }
      ]
    )
  }

  const handleChangeRoom = async (themeId: string) => {
    setRoomBackground(themeId)
    if (member) {
      await AsyncStorage.setItem(`room_background_${member.id}`, themeId)
    }
    setShowRoomModal(false)
  }

  const level = Math.floor(attendanceStats.total / 10) + 1
  const currentLevelXP = attendanceStats.total % 10
  const nextLevelXP = 10
  const xpProgress = (currentLevelXP / nextLevelXP) * 100

  // 칭호 획득 로직
  const availableTitles = TITLES.filter(title => attendanceStats.total >= title.minAttendance).reverse()
  const currentTitle = availableTitles[0] || TITLES[0]

  // 선택된 칭호 로드
  useEffect(() => {
    if (member && attendanceStats.total > 0) {
      AsyncStorage.getItem(`selected_title_${member.id}`).then(savedTitle => {
        if (savedTitle) {
          setSelectedTitle(JSON.parse(savedTitle))
        } else {
          setSelectedTitle(currentTitle)
        }
      })
    }
  }, [member, attendanceStats.total])

  const handleSelectTitle = async (title: any) => {
    setSelectedTitle(title)
    if (member) {
      await AsyncStorage.setItem(`selected_title_${member.id}`, JSON.stringify(title))
    }
    setShowTitleModal(false)
  }

  // 뱃지 획득 로직
  const earnedBadges = BADGES.filter(badge => {
    if (badge.id === 'first_step') return attendanceStats.total >= 1
    if (badge.id === 'weekly_warrior') return attendanceStats.consecutive >= 7
    if (badge.id === 'monthly_master') return attendanceStats.thisMonth >= 20
    if (badge.id === 'hundred_club') return attendanceStats.total >= 100
    if (badge.id === 'iron_will') return attendanceStats.consecutive >= 30
    if (badge.id === 'annual_champion') return attendanceStats.total >= 365
    if (badge.id === 'early_bird') return attendanceStats.morning >= 50
    if (badge.id === 'night_owl') return attendanceStats.night >= 50
    if (badge.id === 'consistent') return attendanceStats.consecutive >= 50
    if (badge.id === 'legend') return attendanceStats.total >= 500
    return false
  })

  const currentTheme = ROOM_THEMES.find(t => t.id === roomBackground) || ROOM_THEMES[0]

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>프로필</Text>
        </View>

        {/* 내 방 (캐릭터 배경) */}
        <LinearGradient colors={currentTheme.colors} style={styles.roomCard}>
          {/* 레벨 & XP 바 (상단 좌측) */}
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lv.{level}</Text>
            <View style={styles.xpBarSmall}>
              <View style={[styles.xpFillSmall, { width: `${xpProgress}%` }]} />
            </View>
          </View>

          {/* 방 꾸미기 버튼 (상단 우측) */}
          <TouchableOpacity style={styles.roomButton} onPress={() => setShowRoomModal(true)}>
            <Text style={{ fontSize: 14 }}>🎨</Text>
            <Text style={styles.roomButtonText}>방 꾸미기</Text>
          </TouchableOpacity>

          {/* 방 장식 */}
          <Text style={[styles.decoration, { top: 50, left: 20 }]}>{currentTheme.icon}</Text>
          <Text style={[styles.decoration, { top: 50, right: 20 }]}>🏆</Text>

          {/* 복싱 캐릭터 */}
          <View style={styles.characterWrapper}>
            {aiPhoto ? (
              <Image source={{ uri: aiPhoto }} style={styles.aiPhotoLarge} />
            ) : (
              <BoxingCharacter />
            )}
          </View>

          {/* 이름 & 칭호 */}
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <TouchableOpacity
              onPress={() => setShowTitleModal(true)}
              style={{
                backgroundColor: selectedTitle ? `${selectedTitle.color}20` : '#9ca3af20',
                borderWidth: 2,
                borderColor: selectedTitle?.color || '#9ca3af',
                borderRadius: 15,
                paddingVertical: 4,
                paddingHorizontal: 12,
                marginBottom: 8
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: selectedTitle?.color || '#9ca3af' }}>
                [{selectedTitle?.name || TITLES[0].name}]
              </Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 26, fontWeight: '900', color: 'white', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10 }}>
              {member?.last_name}{member?.first_name}
            </Text>
          </View>

          {/* 뱃지 (하단) */}
          <View style={{
            position: 'absolute',
            bottom: 15,
            left: 15,
            right: 15,
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: 12,
            padding: 10,
            paddingHorizontal: 12
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#333' }}>🏅 획득 뱃지</Text>
              <TouchableOpacity onPress={() => setShowBadgeModal(true)}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#667eea' }}>전체보기</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
              {earnedBadges.slice(0, 4).map(badge => (
                <View key={badge.id} style={{ minWidth: 45, alignItems: 'center', marginRight: 8 }}>
                  <View style={{
                    width: 45,
                    height: 45,
                    borderRadius: 22.5,
                    backgroundColor: `${badge.color}20`,
                    borderWidth: 2,
                    borderColor: badge.color,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 4
                  }}>
                    <Text style={{ fontSize: 22 }}>{badge.icon}</Text>
                  </View>
                  <Text style={{ fontSize: 9, fontWeight: '700', color: '#666' }}>{badge.name}</Text>
                </View>
              ))}
              {earnedBadges.length === 0 && (
                <Text style={{ fontSize: 11, color: '#999', paddingVertical: 10, flex: 1, textAlign: 'center' }}>
                  아직 획득한 뱃지가 없습니다
                </Text>
              )}
            </ScrollView>
          </View>
        </LinearGradient>

        {/* 프리미엄 구독 배너 - 30% 사이즈 축소 */}
        <TouchableOpacity style={styles.premiumBanner} onPress={() => (navigation as any).navigate('Premium')}>
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>30% OFF</Text>
          </View>
          <Text style={styles.premiumEmoji}>👑</Text>
          <Text style={styles.premiumTitle}>프리미엄 구독하기</Text>
          <Text style={styles.premiumDesc}>AI 코칭, 맞춤 식단, 전문가 상담 이용해보세요</Text>
        </TouchableOpacity>

        {/* 내 체육관 등록 정보 */}
        <TouchableOpacity
          onPress={() => setShowGymInfoDetail(true)}
          style={{
            backgroundColor: 'white',
            marginHorizontal: 20,
            borderRadius: 20,
            padding: 20,
            marginBottom: 15,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: '#667eea',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: 24 }}>🏋️</Text>
            </View>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#333' }}>내 체육관 등록 정보</Text>
              <Text style={{ fontSize: 13, color: '#999', marginTop: 3 }}>회원번호 #{member?.id || '0000'}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: member?.status === 'active' ? '#10b98120' : '#f59e0b20',
              borderRadius: 20
            }}>
              <Text style={{
                fontSize: 12,
                fontWeight: '800',
                color: member?.status === 'active' ? '#10b981' : '#f59e0b'
              }}>
                {member?.status === 'active' ? '✓ 활성' : member?.status === 'paused' ? '⏸ 일시중지' : '❌ 만료'}
              </Text>
            </View>
            <Text style={{ fontSize: 18, color: '#d1d5db' }}>›</Text>
          </View>
        </TouchableOpacity>

        {/* 설정 섹션 */}
        <View style={styles.menuSection}>
          <MenuItem icon="👤" label="프로필 편집" onPress={() => (navigation as any).navigate('EditProfile')} />
          <MenuItem icon="📊" label="신체 정보 편집" onPress={() => (navigation as any).navigate('EditBodyStats')} />
          <MenuItem icon="⚙️" label="설정" onPress={() => (navigation as any).navigate('Settings')} />
        </View>

        {/* 고객지원 섹션 */}
        <View style={styles.menuSection}>
          <MenuItem icon="💬" label="고객센터" onPress={() => (navigation as any).navigate('CustomerSupport')} />
          <MenuItem icon="📢" label="공지사항" onPress={() => (navigation as any).navigate('Announcements')} />
          <MenuItem icon="❓" label="자주 묻는 질문" onPress={() => (navigation as any).navigate('FAQ')} />
        </View>

        {/* 정보 섹션 */}
        <View style={styles.menuSection}>
          <MenuItem icon="⭐" label="스토어 리뷰 작성" onPress={() => Alert.alert('리뷰 작성', '스토어로 이동합니다.\n(실제 앱에서는 Google Play Store로 연결됩니다)')} />
          <MenuItem icon="📱" label="앱 공유하기" onPress={() => Alert.alert('앱 공유', '스토어 링크가 클립보드에 복사되었습니다!\n\n(실제 앱에서는 공유 기능이 작동합니다)')} />
          <MenuItem icon="📄" label="이용약관" onPress={() => (navigation as any).navigate('TermsOfService')} />
          <MenuItem icon="🔐" label="개인정보 처리방침" onPress={() => (navigation as any).navigate('PrivacyPolicy')} />
          <MenuItem icon="ℹ️" label="버전 정보" subtitle="v3.0.0" onPress={() => Alert.alert('버전 정보', 'Pumpy v3.0.0\n\n최신 버전입니다! 🎉')} />
        </View>

        {/* 로그아웃 버튼 */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 방 꾸미기 모달 */}
      <Modal visible={showRoomModal} transparent animationType="slide" onRequestClose={() => setShowRoomModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>방 테마 선택</Text>
            {ROOM_THEMES.map(theme => (
              <TouchableOpacity key={theme.id} style={styles.themeOption} onPress={() => handleChangeRoom(theme.id)}>
                <Text style={styles.themeIcon}>{theme.icon}</Text>
                <Text style={styles.themeName}>{theme.name}</Text>
                {roomBackground === theme.id && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowRoomModal(false)}>
              <Text style={styles.modalCloseText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 뱃지 전체보기 모달 */}
      <Modal visible={showBadgeModal} transparent animationType="slide" onRequestClose={() => setShowBadgeModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>뱃지 컬렉션</Text>
            <ScrollView style={{ width: '100%', maxHeight: 500 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15, padding: 10 }}>
                {BADGES.map(badge => {
                  const earned = earnedBadges.find(b => b.id === badge.id)
                  return (
                    <View key={badge.id} style={{
                      width: '45%',
                      padding: 20,
                      backgroundColor: earned ? `${badge.color}15` : '#f8f9fa',
                      borderWidth: 2,
                      borderColor: earned ? badge.color : '#e5e7eb',
                      borderRadius: 15,
                      alignItems: 'center',
                      opacity: earned ? 1 : 0.5
                    }}>
                      <View style={{
                        width: 70,
                        height: 70,
                        borderRadius: 35,
                        backgroundColor: earned ? `${badge.color}30` : '#e5e7eb',
                        borderWidth: 3,
                        borderColor: earned ? badge.color : '#d1d5db',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 10
                      }}>
                        <Text style={{ fontSize: 32 }}>{badge.icon}</Text>
                      </View>
                      <Text style={{
                        fontSize: 14,
                        fontWeight: '800',
                        color: earned ? '#333' : '#999',
                        marginBottom: 5,
                        textAlign: 'center'
                      }}>{badge.name}</Text>
                      <Text style={{
                        fontSize: 11,
                        color: '#999',
                        textAlign: 'center'
                      }}>{badge.desc}</Text>
                    </View>
                  )
                })}
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowBadgeModal(false)}>
              <Text style={styles.modalCloseText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 칭호 선택 모달 */}
      <Modal visible={showTitleModal} transparent animationType="slide" onRequestClose={() => setShowTitleModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>칭호 선택</Text>
            <ScrollView style={{ width: '100%', maxHeight: 400 }}>
              {availableTitles.map(title => (
                <TouchableOpacity
                  key={title.id}
                  onPress={() => handleSelectTitle(title)}
                  style={{
                    padding: 15,
                    paddingHorizontal: 20,
                    backgroundColor: selectedTitle?.id === title.id ? `${title.color}20` : '#f8f9fa',
                    borderWidth: 2,
                    borderColor: selectedTitle?.id === title.id ? title.color : '#e5e7eb',
                    borderRadius: 12,
                    marginBottom: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '700', color: title.color }}>
                    [{title.name}]
                  </Text>
                  <Text style={{ fontSize: 13, color: '#999' }}>
                    출석 {title.minAttendance}회 이상
                  </Text>
                </TouchableOpacity>
              ))}
              {availableTitles.length === 1 && (
                <View style={{
                  marginTop: 20,
                  padding: 15,
                  backgroundColor: '#f3f4f6',
                  borderRadius: 12,
                  alignItems: 'center'
                }}>
                  <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
                    더 많이 출석하고 새로운 칭호를 획득하세요!
                  </Text>
                </View>
              )}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowTitleModal(false)}>
              <Text style={styles.modalCloseText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 체육관 등록 정보 상세 모달 */}
      <Modal visible={showGymInfoDetail} transparent animationType="slide" onRequestClose={() => setShowGymInfoDetail(false)}>
        <View style={styles.modalOverlay}>
          <View style={{ ...styles.modalContent, maxHeight: '85%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 20 }}>
              <Text style={styles.modalTitle}>내 체육관 등록 정보</Text>
              <TouchableOpacity onPress={() => setShowGymInfoDetail(false)} style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#f3f4f6',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Text style={{ fontSize: 20, color: '#666' }}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
              {/* 회원 정보 */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#333', marginBottom: 15, paddingHorizontal: 5 }}>
                  👤 회원 정보
                </Text>
                <InfoRow label="회원명" value={`${member?.last_name || ''}${member?.first_name || ''}`} />
                <InfoRow label="회원번호" value={`#${member?.id || '0000'}`} />
                <InfoRow label="전화번호" value={member?.phone || '-'} />
                <InfoRow label="이메일" value={member?.email || '-'} />
                <InfoRow label="생년월일" value={member?.birth_date ? new Date(member.birth_date).toLocaleDateString('ko-KR') : '-'} />
                <InfoRow label="성별" value={member?.gender === 'male' ? '남성' : member?.gender === 'female' ? '여성' : '-'} />
                <InfoRow label="주소" value={member?.address || '-'} />
                <InfoRow label="가입일" value={member?.join_date ? new Date(member.join_date).toLocaleDateString('ko-KR') : '-'} />
                <InfoRow label="상태" value={
                  member?.status === 'active' ? '✓ 활성' :
                  member?.status === 'paused' ? '⏸ 일시중지' : 
                  member?.status === 'pending' ? '⏳ 승인대기' : '❌ 만료'
                } valueColor={member?.status === 'active' ? '#10b981' : member?.status === 'pending' ? '#f59e0b' : '#ef4444'} />
              </View>

              {/* 회원권 구매 (박스) */}
              <TouchableOpacity 
                onPress={() => setShowMembershipDetail(true)} 
                style={{
                  backgroundColor: 'white',
                  borderRadius: 15,
                  padding: 25,
                  marginBottom: 20,
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: '#e5e7eb',
                  borderStyle: 'dashed'
                }}
              >
                <Text style={{ fontSize: 52, marginBottom: 12 }}>💳</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#333', marginBottom: 8 }}>
                  등록된 회원권이 없습니다
                </Text>
                <Text style={{ fontSize: 13, color: '#999', marginBottom: 20 }}>
                  회원권을 선택해주세요
                </Text>
                <View style={{
                  backgroundColor: '#667eea',
                  paddingVertical: 12,
                  paddingHorizontal: 30,
                  borderRadius: 12
                }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: 'white' }}>회원권 구매하기</Text>
                </View>
              </TouchableOpacity>

              {/* 약관 동의 현황 (박스) */}
              <View style={{
                backgroundColor: 'white',
                borderRadius: 15,
                padding: 20,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: '#e5e7eb'
              }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#333', marginBottom: 15 }}>
                  📋 약관 동의 현황
                </Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#f0fdf4', borderRadius: 10 }}>
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: '#10b981',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12
                  }}>
                    <Text style={{ color: 'white', fontSize: 14, fontWeight: '900' }}>✓</Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#059669', flex: 1 }}>이용약관 동의</Text>
                  {member?.terms_agreed && (
                    <Text style={{ fontSize: 11, color: '#6b7280' }}>
                      {new Date(member.terms_agreed_date).toLocaleDateString('ko-KR')}
                    </Text>
                  )}
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#f0fdf4', borderRadius: 10 }}>
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: '#10b981',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12
                  }}>
                    <Text style={{ color: 'white', fontSize: 14, fontWeight: '900' }}>✓</Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#059669', flex: 1 }}>개인정보 처리방침 동의</Text>
                  {member?.privacy_agreed && (
                    <Text style={{ fontSize: 11, color: '#6b7280' }}>
                      {new Date(member.privacy_agreed_date).toLocaleDateString('ko-KR')}
                    </Text>
                  )}
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, backgroundColor: member?.marketing_agreed ? '#f0fdf4' : '#f9fafb', borderRadius: 10 }}>
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: member?.marketing_agreed ? '#10b981' : '#d1d5db',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12
                  }}>
                    <Text style={{ color: 'white', fontSize: 14, fontWeight: '900' }}>
                      {member?.marketing_agreed ? '✓' : '○'}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: member?.marketing_agreed ? '#059669' : '#9ca3af', flex: 1 }}>
                    마케팅 수신 동의 <Text style={{ fontSize: 12, color: '#6b7280' }}>(선택)</Text>
                  </Text>
                  {member?.marketing_agreed && member?.marketing_agreed_date && (
                    <Text style={{ fontSize: 11, color: '#6b7280' }}>
                      {new Date(member.marketing_agreed_date).toLocaleDateString('ko-KR')}
                    </Text>
                  )}
                </View>
              </View>

              {/* 다니는 체육관 정보 (박스) */}
              <View style={{
                padding: 20,
                backgroundColor: '#eff6ff',
                borderRadius: 15,
                marginBottom: 20,
                borderWidth: 2,
                borderColor: '#3b82f6'
              }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#1e40af', marginBottom: 15 }}>
                  🏢 다니는 체육관 정보
                </Text>
                <InfoRow label="체육관명" value="Pumpy Fitness" bgColor="#dbeafe" />
                <InfoRow label="주소" value="서울특별시 강남구 테헤란로 123" bgColor="#dbeafe" />
                <InfoRow label="전화번호" value="02-1234-5678" bgColor="#dbeafe" />
                <InfoRow label="영업시간" value="06:00 - 23:00" bgColor="#dbeafe" />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 회원권 구매 모달 */}
      <Modal visible={showMembershipDetail} transparent animationType="slide" onRequestClose={() => setShowMembershipDetail(false)}>
        <View style={styles.modalOverlay}>
          <View style={{ ...styles.modalContent, maxHeight: '80%', width: '90%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 20 }}>
              <View>
                <Text style={styles.modalTitle}>회원권 구매</Text>
                <Text style={{ fontSize: 13, color: '#999', marginTop: 4 }}>회원권을 선택해주세요</Text>
              </View>
              <TouchableOpacity onPress={() => setShowMembershipDetail(false)} style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#f3f4f6',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Text style={{ fontSize: 20, color: '#666' }}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
              {/* 1개월 회원권 */}
              <LinearGradient colors={['#667eea', '#764ba2']} style={{
                padding: 25,
                borderRadius: 20,
                marginBottom: 15
              }}>
                <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 8, fontWeight: '600' }}>
                  1개월 회원권
                </Text>
                <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 15 }}>
                  부담 없이 시작해보세요
                </Text>
                <Text style={{ fontSize: 36, fontWeight: '900', color: 'white', marginBottom: 8 }}>
                  100,000<Text style={{ fontSize: 22, fontWeight: '700' }}> 원</Text>
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                  <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>이용 기간</Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 10 }} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: 'white' }}>1개월</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                  <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>할 평균</Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 10 }} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: 'white' }}>100,000원</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setShowMembershipDetail(false)
                    Alert.alert('구매 확인', '1개월 회원권을 구매하시겠습니까?\n\n가격: 100,000원', [
                      { text: '취소', style: 'cancel' },
                      { text: '구매하기', onPress: () => Alert.alert('결제 진행', '실제 앱에서는 결제 페이지로 이동합니다.') }
                    ])
                  }}
                  style={{
                    backgroundColor: 'white',
                    padding: 15,
                    borderRadius: 12,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#667eea' }}>선택하기</Text>
                </TouchableOpacity>
              </LinearGradient>

              {/* 3개월 회원권 (10% 할인) */}
              <LinearGradient colors={['#f093fb', '#f5576c']} style={{
                padding: 25,
                borderRadius: 20,
                marginBottom: 20,
                position: 'relative'
              }}>
                <View style={{
                  position: 'absolute',
                  top: 15,
                  right: 15,
                  backgroundColor: '#ef4444',
                  borderRadius: 15,
                  paddingHorizontal: 12,
                  paddingVertical: 6
                }}>
                  <Text style={{ color: 'white', fontSize: 11, fontWeight: '900' }}>10% 할인</Text>
                </View>
                <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: 8, fontWeight: '600' }}>
                  3개월 회원권
                </Text>
                <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 15 }}>
                  10% 할인! 가장 인기있는 상품
                </Text>
                <Text style={{ fontSize: 36, fontWeight: '900', color: 'white', marginBottom: 8 }}>
                  270,000<Text style={{ fontSize: 22, fontWeight: '700' }}> 원</Text>
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                  <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>이용 기간</Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.4)', marginHorizontal: 10 }} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: 'white' }}>3개월</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                  <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>할 평균</Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.4)', marginHorizontal: 10 }} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: 'white' }}>90,000원</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setShowMembershipDetail(false)
                    Alert.alert('구매 확인', '3개월 회원권을 구매하시겠습니까?\n\n가격: 270,000원 (10% 할인가)', [
                      { text: '취소', style: 'cancel' },
                      { text: '구매하기', onPress: () => Alert.alert('결제 진행', '실제 앱에서는 결제 페이지로 이동합니다.') }
                    ])
                  }}
                  style={{
                    backgroundColor: 'white',
                    padding: 15,
                    borderRadius: 12,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#f5576c' }}>선택하기</Text>
                </TouchableOpacity>
              </LinearGradient>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}

function InfoRow({ label, value, valueColor, bgColor }: { label: string; value: string; valueColor?: string; bgColor?: string }) {
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      paddingHorizontal: 15,
      backgroundColor: bgColor || '#f8f9fa',
      borderRadius: 10,
      marginBottom: 8
    }}>
      <Text style={{ fontSize: 14, color: '#666', fontWeight: '600' }}>{label}</Text>
      <Text style={{ fontSize: 14, color: valueColor || '#333', fontWeight: '700' }}>{value}</Text>
    </View>
  )
}

function BoxingCharacter() {
  return (
    <View style={{ width: 140, height: 160 }}>
      {/* Head */}
      <View style={styles.charHead}>
        <View style={[styles.charEye, { left: 20 }]} />
        <View style={[styles.charEye, { right: 20 }]} />
        <View style={styles.charMouth} />
      </View>
      {/* Neck */}
      <View style={styles.charNeck} />
      {/* Body */}
      <View style={styles.charBody}>
        <Text style={{ fontSize: 24 }}>🥊</Text>
      </View>
      {/* Left Arm */}
      <View style={styles.charLeftArm} />
      <View style={styles.charLeftGlove} />
      {/* Right Arm */}
      <View style={styles.charRightArm} />
      <View style={styles.charRightGlove}>
        <Text style={{ position: 'absolute', right: -22, fontSize: 18 }}>💥</Text>
      </View>
      {/* Legs */}
      <View style={[styles.charLeg, { left: 45 }]} />
      <View style={[styles.charLeg, { right: 45 }]} />
    </View>
  )
}

function MenuItem({ icon, label, subtitle, onPress }: { icon: string; label: string; subtitle?: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIcon}>
          <Text style={{ fontSize: 18 }}>{icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.menuLabel}>{label}</Text>
          {subtitle && (
            <Text style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>{subtitle}</Text>
          )}
        </View>
      </View>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5' },
  header: { padding: 20, paddingTop: 40 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#333' },
  roomCard: { marginHorizontal: 20, borderRadius: 25, padding: 20, minHeight: 380, marginBottom: 20 },
  levelBadge: { position: 'absolute', top: 15, left: 15, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 15, padding: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8, width: 120, zIndex: 10 },
  levelText: { fontSize: 12, fontWeight: '800', color: 'white' },
  xpBarSmall: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 4, overflow: 'hidden' },
  xpFillSmall: { height: '100%', backgroundColor: '#FFD700', borderRadius: 4 },
  roomButton: { position: 'absolute', top: 15, right: 15, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 15, padding: 8, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 5, zIndex: 10 },
  roomButtonText: { fontSize: 12, fontWeight: '700', color: '#333' },
  decoration: { position: 'absolute', fontSize: 40, opacity: 0.3 },
  characterWrapper: { marginTop: 60, alignItems: 'center', marginBottom: 15 },
  aiPhotoLarge: { width: 140, height: 160, borderRadius: 20, borderWidth: 4, borderColor: 'white' },
  titleBadge: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 15, paddingVertical: 8, paddingHorizontal: 16, alignSelf: 'center' },
  titleText: { fontSize: 14, fontWeight: '800', color: '#333' },
  badgeSection: { backgroundColor: 'white', marginHorizontal: 20, borderRadius: 20, padding: 20, marginBottom: 15 },
  badgeSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  badgeSectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badgeSectionIcon: { fontSize: 20 },
  badgeSectionTitle: { fontSize: 16, fontWeight: '800', color: '#333' },
  viewAllText: { fontSize: 13, color: '#667eea', fontWeight: '600' },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  badgeItem: { alignItems: 'center', width: 70 },
  badgeCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  badgeEmoji: { fontSize: 28 },
  badgeName: { fontSize: 11, fontWeight: '700', color: '#333', textAlign: 'center' },
  noBadges: { fontSize: 14, color: '#999', textAlign: 'center', paddingVertical: 20, width: '100%' },
  premiumBanner: { backgroundColor: '#fbbf24', marginHorizontal: 20, borderRadius: 15, padding: 17, marginBottom: 15, position: 'relative' },
  premiumBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#ef4444', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  premiumBadgeText: { color: 'white', fontSize: 10, fontWeight: '900' },
  premiumEmoji: { fontSize: 35, marginBottom: 10 },
  premiumTitle: { fontSize: 17, fontWeight: '900', color: '#78350f', marginBottom: 6 },
  premiumDesc: { fontSize: 11, color: '#92400e', lineHeight: 16 },
  menuSection: { backgroundColor: 'white', marginHorizontal: 20, borderRadius: 20, marginBottom: 15, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  menuLabel: { fontSize: 15, fontWeight: '600', color: '#333' },
  menuArrow: { fontSize: 20, color: '#ccc' },
  logoutButton: { backgroundColor: '#ef4444', marginHorizontal: 20, borderRadius: 15, padding: 18, alignItems: 'center', marginBottom: 20 },
  logoutText: { color: 'white', fontSize: 16, fontWeight: '800' },
  versionText: { fontSize: 13, color: '#999', textAlign: 'center', marginBottom: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#333', marginBottom: 20 },
  themeOption: { flexDirection: 'row', alignItems: 'center', width: '100%', padding: 15, backgroundColor: '#f9fafb', borderRadius: 12, marginBottom: 10 },
  themeIcon: { fontSize: 24, marginRight: 12 },
  themeName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#333' },
  checkmark: { fontSize: 20, color: '#10b981' },
  modalCloseButton: { backgroundColor: '#e0e0e0', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 12, marginTop: 15 },
  modalCloseText: { fontSize: 16, fontWeight: '700', color: '#333' },
  badgeListItem: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#f9fafb', borderRadius: 12, marginBottom: 10 },
  badgeListItemDisabled: { opacity: 0.5 },
  badgeDesc: { fontSize: 11, color: '#666', marginTop: 2 },
  // Character styles
  charHead: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ffdbac', position: 'absolute', top: 0, left: 30, borderWidth: 3, borderColor: '#333' },
  charEye: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#333', position: 'absolute', top: 25 },
  charMouth: { position: 'absolute', bottom: 15, left: 25, width: 30, height: 15, borderRadius: 15, borderWidth: 2, borderColor: '#333', borderTopWidth: 0 },
  charNeck: { width: 30, height: 15, backgroundColor: '#ffdbac', position: 'absolute', top: 75, left: 55, borderLeftWidth: 2, borderRightWidth: 2, borderColor: '#333' },
  charBody: { width: 100, height: 70, backgroundColor: '#667eea', position: 'absolute', top: 88, left: 20, borderRadius: 15, borderWidth: 3, borderColor: '#333', justifyContent: 'center', alignItems: 'center' },
  charLeftArm: { width: 45, height: 12, backgroundColor: '#667eea', position: 'absolute', top: 95, left: 0, borderRadius: 6, borderWidth: 2, borderColor: '#333', transform: [{ rotate: '-20deg' }] },
  charLeftGlove: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#ff6b6b', position: 'absolute', top: 88, left: -5, borderWidth: 2, borderColor: '#333' },
  charRightArm: { width: 55, height: 12, backgroundColor: '#667eea', position: 'absolute', top: 100, right: 5, borderRadius: 6, borderWidth: 2, borderColor: '#333', transform: [{ rotate: '15deg' }] },
  charRightGlove: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#ff6b6b', position: 'absolute', top: 93, right: -12, borderWidth: 2, borderColor: '#333' },
  charLeg: { width: 25, height: 30, backgroundColor: '#333', position: 'absolute', bottom: 0, borderRadius: 6, borderWidth: 2, borderColor: '#222' },
})
