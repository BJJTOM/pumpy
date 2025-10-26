import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'

interface FAQ {
  id: number
  category: string
  question: string
  answer: string
}

const FAQS: FAQ[] = [
  {
    id: 1,
    category: '회원권',
    question: '회원권 종류는 어떤 것이 있나요?',
    answer: `펌피에서는 다양한 회원권을 제공합니다:

• 일일권: 1회 이용권
• 10회권: 자유롭게 10회 사용
• 1개월권: 30일 무제한 이용
• 3개월권: 90일 무제한 이용 (10% 할인)
• 6개월권: 180일 무제한 이용 (15% 할인)
• 1년권: 365일 무제한 이용 (20% 할인)

모든 회원권은 PT, GX 클래스 별도 결제 가능합니다.`
  },
  {
    id: 2,
    category: '회원권',
    question: '회원권 환불이 가능한가요?',
    answer: `회원권 환불 정책은 다음과 같습니다:

✅ 이용 시작 전: 전액 환불
⚠️ 이용 중: 사용 기간 차감 후 환불
• 1개월 이하 사용: 80% 환불
• 1-3개월 사용: 60% 환불
• 3개월 이상 사용: 50% 환불

환불 시 최초 할인 금액은 차감됩니다.
자세한 문의는 고객센터로 연락 주세요.`
  },
  {
    id: 3,
    category: '이용 시간',
    question: '운영 시간은 어떻게 되나요?',
    answer: `펌피 운영 시간:

📅 평일 (월-금)
• 05:00 - 23:00

🌞 주말 (토-일)
• 07:00 - 22:00

🎉 공휴일
• 09:00 - 18:00

연중무휴로 운영되며, 특별한 경우 공지사항을 통해 안내드립니다.`
  },
  {
    id: 4,
    category: '시설',
    question: '어떤 운동 기구가 있나요?',
    answer: `펌피의 주요 시설:

🏋️ 유산소 구역
• 러닝머신 15대
• 사이클 10대
• 로잉머신 5대
• 스테퍼 5대

💪 근력 운동 구역
• 프리웨이트 존
• 머신 운동 존
• 케이블 운동 존
• 기능성 운동 존

🧘 그룹 운동실
• 요가/필라테스 전용실
• GX 스튜디오

🚿 부대시설
• 샤워실 (남/여 분리)
• 락커룸
• 휴게실`
  },
  {
    id: 5,
    category: '프로그램',
    question: 'PT는 어떻게 신청하나요?',
    answer: `PT (Personal Training) 신청 방법:

1️⃣ 앱에서 [프리미엄] 메뉴 선택
2️⃣ PT 프로그램 확인
3️⃣ 담당 트레이너 선택
4️⃣ 일정 조율 후 결제

💰 PT 가격
• 10회: 500,000원
• 20회: 900,000원 (10% 할인)
• 30회: 1,200,000원 (20% 할인)

첫 PT는 무료 체험 가능합니다!`
  },
  {
    id: 6,
    category: '프로그램',
    question: 'GX 수업은 어떤 것이 있나요?',
    answer: `GX (Group Exercise) 프로그램:

🔥 고강도
• HIIT
• 크로스핏
• 스피닝

💪 중강도
• 바디펌프
• 바디컴뱃
• 다이어트 댄스

🧘 저강도
• 요가
• 필라테스
• 스트레칭

수업 시간표는 앱에서 확인하실 수 있습니다.`
  },
  {
    id: 7,
    category: '앱 사용',
    question: '출석 체크는 어떻게 하나요?',
    answer: `출석 체크 방법:

1️⃣ 앱 하단 [홈] 탭 이동
2️⃣ "오늘 출석 체크" 버튼 클릭
3️⃣ 출석 완료!

💡 Tip:
• 출석 시 경험치 획득
• 연속 출석 시 보너스
• 한 달 20회 출석 시 뱃지 획득

앱이 아닌 체육관 키오스크에서도 체크 가능합니다.`
  },
  {
    id: 8,
    category: '앱 사용',
    question: '운동 기록은 어떻게 남기나요?',
    answer: `운동 기록 남기기:

1️⃣ 앱 하단 [홈] 탭
2️⃣ "운동 기록" 카드 클릭
3️⃣ 오늘 한 운동 입력
   • 운동 종류
   • 세트 / 횟수 / 무게
   • 메모

📊 기록하면 좋은 점:
• 운동 진행 상황 그래프로 확인
• AI 코치의 맞춤 피드백
• 운동 히스토리 보관`
  },
  {
    id: 9,
    category: '기타',
    question: '주차는 가능한가요?',
    answer: `주차 안내:

🚗 주차 시설
• 전용 주차장 50대
• 2시간 무료
• 이후 시간당 2,000원

🅿️ 주차 위치
• 건물 지하 1층~2층
• 펌피 전용 구역 이용

💡 참고사항
• 주말/공휴일 혼잡 가능
• 대중교통 이용 권장
• 지하철 2호선 강남역 도보 5분`
  },
  {
    id: 10,
    category: '기타',
    question: '락커는 어떻게 이용하나요?',
    answer: `락커 이용 안내:

📦 일일 락커
• 무료 이용
• 운동 중에만 사용
• 퇴실 시 물품 회수 필수

🗝️ 개인 락커
• 월 10,000원
• 개인 전용 락커
• 운동복, 신발 보관 가능

⚠️ 주의사항
• 귀중품 보관 금지
• 분실 책임은 본인에게 있음
• 장기 방치 시 물품 폐기`
  }
]

export default function FAQScreen() {
  const navigation = useNavigation()
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('전체')

  const categories = ['전체', '회원권', '이용 시간', '시설', '프로그램', '앱 사용', '기타']

  const filteredFAQs = FAQS.filter(faq => {
    const matchesCategory = selectedCategory === '전체' || faq.category === selectedCategory
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>자주 묻는 질문</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="궁금한 내용을 검색하세요..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categories}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[styles.categoryButton, selectedCategory === category && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[styles.categoryText, selectedCategory === category && styles.categoryTextActive]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FAQ List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {filteredFAQs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
            <Text style={styles.emptySubtext}>다른 키워드로 검색해보세요</Text>
          </View>
        ) : (
          filteredFAQs.map(faq => (
            <View key={faq.id} style={styles.faqCard}>
              <TouchableOpacity
                style={styles.faqHeader}
                onPress={() => toggleExpand(faq.id)}
                activeOpacity={0.7}
              >
                <View style={styles.faqHeaderLeft}>
                  <View style={styles.faqCategoryBadge}>
                    <Text style={styles.faqCategoryText}>{faq.category}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                  </View>
                </View>
                <Text style={[styles.expandIcon, expandedId === faq.id && styles.expandIconRotated]}>
                  ›
                </Text>
              </TouchableOpacity>
              {expandedId === faq.id && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))
        )}

        {/* Contact Support */}
        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>원하는 답변을 찾지 못하셨나요?</Text>
          <Text style={styles.supportSubtitle}>고객센터로 문의해주세요</Text>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => (navigation as any).navigate('CustomerSupport')}
          >
            <Text style={styles.supportButtonText}>💬 고객센터 문의하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    fontSize: 20,
    fontWeight: '900',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12
  },
  searchIcon: { fontSize: 18, marginRight: 10 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333'
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  clearButtonText: { fontSize: 14, color: '#666' },
  categories: { maxHeight: 50, marginBottom: 15 },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 10
  },
  categoryButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)'
  },
  categoryButtonActive: {
    backgroundColor: 'white'
  },
  categoryText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700'
  },
  categoryTextActive: {
    color: '#667eea'
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },
  faqCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 18,
    marginBottom: 12,
    overflow: 'hidden'
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18
  },
  faqHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 10
  },
  faqCategoryBadge: {
    backgroundColor: '#667eea',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10
  },
  faqCategoryText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '800'
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    lineHeight: 22,
    paddingRight: 10
  },
  expandIcon: {
    fontSize: 28,
    color: '#ccc',
    transform: [{ rotate: '90deg' }],
    fontWeight: '300'
  },
  expandIconRotated: {
    transform: [{ rotate: '270deg' }]
  },
  faqAnswer: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    paddingTop: 0
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 24,
    color: '#666'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyEmoji: { fontSize: 60, marginBottom: 15 },
  emptyText: {
    fontSize: 17,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)'
  },
  supportCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginTop: 20
  },
  supportTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#333',
    marginBottom: 8
  },
  supportSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20
  },
  supportButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 15
  },
  supportButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800'
  }
})

