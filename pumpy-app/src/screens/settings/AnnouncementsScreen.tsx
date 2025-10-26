import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'

interface Announcement {
  id: number
  title: string
  content: string
  date: string
  category: '중요' | '이벤트' | '업데이트' | '일반'
  isNew: boolean
}

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    title: '🎉 펌피 앱 v3.0 업데이트 안내',
    content: `안녕하세요, 펌피입니다!

새로운 버전 3.0이 출시되었습니다. 🎊

📌 주요 업데이트 내용:
• AI 운동 코치 기능 추가
• 식단 관리 시스템 고도화
• WOD (Workout of the Day) 강화
• 커뮤니티 기능 개선
• UI/UX 전면 개편
• 성능 최적화 및 버그 수정

더욱 편리해진 펌피 앱을 경험해보세요!

감사합니다. 💪`,
    date: '2025-01-15',
    category: '업데이트',
    isNew: true
  },
  {
    id: 2,
    title: '💰 신규 회원 50% 할인 이벤트',
    content: `신규 회원님들을 위한 특별 이벤트!

🎁 이벤트 내용:
• 첫 달 회원권 50% 할인
• 무료 PT 1회 제공
• 운동복 세트 증정

📅 이벤트 기간:
2025년 1월 15일 ~ 2월 28일

지금 바로 가입하고 혜택을 받아가세요!`,
    date: '2025-01-10',
    category: '이벤트',
    isNew: true
  },
  {
    id: 3,
    title: '⚠️ 설 연휴 운영 시간 안내',
    content: `설 연휴 기간 운영 시간을 안내드립니다.

🗓️ 운영 일정:
• 1월 28일(화): 정상 운영
• 1월 29일(수) ~ 1월 31일(금): 휴무
• 2월 1일(토): 정상 운영

회원 여러분의 양해 부탁드립니다.
즐거운 명절 보내세요! 🎊`,
    date: '2025-01-08',
    category: '중요',
    isNew: false
  },
  {
    id: 4,
    title: '📅 1월 그룹 PT 일정 안내',
    content: `1월 그룹 PT 일정을 안내드립니다.

🏋️ 월요일 & 수요일
• 07:00 - 아침 요가
• 19:00 - HIIT 트레이닝

🏋️ 화요일 & 목요일
• 07:00 - 필라테스
• 19:00 - 크로스핏

🏋️ 금요일
• 19:00 - 주말 특별 클래스

자세한 내용은 트레이너에게 문의해주세요!`,
    date: '2025-01-05',
    category: '일반',
    isNew: false
  },
  {
    id: 5,
    title: '🔧 시스템 점검 안내',
    content: `보다 나은 서비스 제공을 위해 시스템 점검을 실시합니다.

⏰ 점검 일시:
2025년 1월 20일(월) 02:00 ~ 06:00

📌 점검 내용:
• 서버 성능 향상
• 보안 업데이트
• 데이터베이스 최적화

점검 시간 동안 일부 서비스 이용이 제한될 수 있습니다.
양해 부탁드립니다.`,
    date: '2025-01-03',
    category: '중요',
    isNew: false
  }
]

export default function AnnouncementsScreen() {
  const navigation = useNavigation()
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '중요': return '#ef4444'
      case '이벤트': return '#f59e0b'
      case '업데이트': return '#10b981'
      default: return '#667eea'
    }
  }

  const renderAnnouncementItem = (announcement: Announcement) => (
    <TouchableOpacity
      key={announcement.id}
      style={styles.announcementItem}
      onPress={() => setSelectedAnnouncement(announcement)}
      activeOpacity={0.7}
    >
      <View style={styles.announcementHeader}>
        <View style={styles.announcementTop}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(announcement.category) }]}>
            <Text style={styles.categoryText}>{announcement.category}</Text>
          </View>
          {announcement.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newText}>NEW</Text>
            </View>
          )}
        </View>
        <Text style={styles.dateText}>{announcement.date}</Text>
      </View>
      <Text style={styles.announcementTitle} numberOfLines={2}>
        {announcement.title}
      </Text>
      <Text style={styles.announcementPreview} numberOfLines={2}>
        {announcement.content}
      </Text>
      <View style={styles.readMore}>
        <Text style={styles.readMoreText}>자세히 보기</Text>
        <Text style={styles.readMoreArrow}>›</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>공지사항</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Announcements List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {ANNOUNCEMENTS.map(renderAnnouncementItem)}
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={selectedAnnouncement !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedAnnouncement(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedAnnouncement && (
              <>
                <View style={styles.modalHeader}>
                  <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(selectedAnnouncement.category) }]}>
                    <Text style={styles.categoryText}>{selectedAnnouncement.category}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedAnnouncement(null)} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalTitle}>{selectedAnnouncement.title}</Text>
                <Text style={styles.modalDate}>{selectedAnnouncement.date}</Text>
                <ScrollView style={styles.modalScrollView} contentContainerStyle={styles.modalScrollContent}>
                  <Text style={styles.modalText}>{selectedAnnouncement.content}</Text>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  backButtonText: { color: 'white', fontSize: 24, fontWeight: '800' },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },
  announcementItem: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  announcementTop: { flexDirection: 'row', gap: 8 },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  categoryText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '800'
  },
  newBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10
  },
  newText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900'
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600'
  },
  announcementTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#333',
    marginBottom: 10,
    lineHeight: 24
  },
  announcementPreview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  readMoreText: {
    fontSize: 13,
    color: '#667eea',
    fontWeight: '700'
  },
  readMoreArrow: {
    fontSize: 20,
    color: '#667eea',
    fontWeight: '300'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    maxHeight: '85%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '700'
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#333',
    marginBottom: 10,
    lineHeight: 32
  },
  modalDate: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
    marginBottom: 20
  },
  modalScrollView: {
    maxHeight: 400
  },
  modalScrollContent: {
    paddingBottom: 20
  },
  modalText: {
    fontSize: 15,
    lineHeight: 26,
    color: '#555'
  }
})

