import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'

const PLANS = [
  {
    id: 'monthly',
    name: '월간 구독',
    price: 9900,
    originalPrice: 14900,
    period: '1개월',
    discount: '33%'
  },
  {
    id: 'yearly',
    name: '연간 구독',
    price: 99000,
    originalPrice: 178800,
    period: '12개월',
    discount: '45%',
    popular: true
  }
]

const FEATURES = [
  { icon: '🤖', title: 'AI 운동 캐릭터 생성', desc: '내 사진으로 3D 캐릭터 만들기' },
  { icon: '🎨', title: '프리미엄 방 테마', desc: '10가지 이상의 특별한 방 꾸미기' },
  { icon: '📊', title: '고급 운동 분석', desc: 'AI 기반 운동 패턴 분석 및 추천' },
  { icon: '🎯', title: '개인 맞춤 운동 플랜', desc: 'AI가 만드는 나만의 운동 계획' },
  { icon: '💪', title: '실시간 자세 교정', desc: 'AI 카메라로 운동 자세 분석' },
  { icon: '🍎', title: 'AI 식단 추천', desc: '목표에 맞는 식단 자동 생성' },
  { icon: '📈', title: '상세 진행 리포트', desc: '주간/월간 운동 성과 리포트' },
  { icon: '🏆', title: '독점 배지 & 보상', desc: '프리미엄 전용 배지와 보상' },
  { icon: '💬', title: '1:1 전문가 상담', desc: '트레이너와 실시간 채팅' },
  { icon: '🎁', title: '광고 제거', desc: '모든 광고 없는 깨끗한 환경' }
]

export default function PremiumScreen() {
  const navigation = useNavigation()
  const [selectedPlan, setSelectedPlan] = useState('monthly')
  const [isPremium, setIsPremium] = useState(false)
  const [showPayment, setShowPayment] = useState(false)

  useEffect(() => {
    checkPremiumStatus()
  }, [])

  const checkPremiumStatus = async () => {
    const userStr = await AsyncStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      const premiumStatus = await AsyncStorage.getItem(`premium_${user.id}`)
      setIsPremium(premiumStatus === 'active')
    }
  }

  const handleSubscribe = () => {
    setShowPayment(true)
  }

  const handleConfirmPayment = async () => {
    const userStr = await AsyncStorage.getItem('user')
    if (!userStr) return

    const user = JSON.parse(userStr)
    const plan = PLANS.find(p => p.id === selectedPlan)

    await AsyncStorage.setItem(`premium_${user.id}`, 'active')
    await AsyncStorage.setItem(`premium_plan_${user.id}`, selectedPlan)
    await AsyncStorage.setItem(`premium_start_date_${user.id}`, new Date().toISOString())

    setIsPremium(true)
    setShowPayment(false)
    Alert.alert('🎉 구독 완료', `${plan?.name} 구독이 완료되었습니다!\n프리미엄 기능을 즐겨보세요!`)
  }

  const handleCancelSubscription = () => {
    Alert.alert(
      '구독 취소',
      '프리미엄 구독을 취소하시겠습니까?',
      [
        { text: '아니요', style: 'cancel' },
        {
          text: '예, 취소합니다',
          style: 'destructive',
          onPress: async () => {
            const userStr = await AsyncStorage.getItem('user')
            if (userStr) {
              const user = JSON.parse(userStr)
              await AsyncStorage.removeItem(`premium_${user.id}`)
              await AsyncStorage.removeItem(`premium_plan_${user.id}`)
              await AsyncStorage.removeItem(`premium_start_date_${user.id}`)
              setIsPremium(false)
              Alert.alert('취소 완료', '프리미엄 구독이 취소되었습니다.')
            }
          }
        }
      ]
    )
  }

  return (
    <LinearGradient colors={['#1f2937', '#4b5563']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pumpy 프리미엄</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>👑</Text>
          <Text style={styles.heroTitle}>프리미엄으로{'\n'}더 강력해지세요!</Text>
          <Text style={styles.heroSubtitle}>Pumpy 프리미엄은 당신의 운동 경험을{'\n'}한 단계 업그레이드 시켜줄 특별한 기능들을 제공합니다.</Text>
        </View>

        {/* Current Status (if premium) */}
        {isPremium && (
          <View style={styles.statusCard}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>✅ 활성</Text>
            </View>
            <Text style={styles.statusTitle}>프리미엄 구독 중</Text>
            <Text style={styles.statusDesc}>모든 프리미엄 기능을 이용하실 수 있습니다</Text>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelSubscription}>
              <Text style={styles.cancelButtonText}>구독 취소</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Plan Selection */}
        {!isPremium && (
          <>
            <Text style={styles.sectionTitle}>플랜 선택</Text>
            {PLANS.map(plan => (
              <TouchableOpacity
                key={plan.id}
                style={[styles.planCard, selectedPlan === plan.id && styles.planCardActive, plan.popular && styles.planCardPopular]}
                onPress={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>인기</Text>
                  </View>
                )}
                <View style={styles.planHeader}>
                  <View>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planPeriod}>{plan.period}</Text>
                  </View>
                  <View style={styles.checkCircle}>
                    {selectedPlan === plan.id && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                </View>
                <View style={styles.planPricing}>
                  <Text style={styles.planPrice}>{plan.price.toLocaleString()}원</Text>
                  <Text style={styles.planOriginalPrice}>{plan.originalPrice.toLocaleString()}원</Text>
                  <View style={[styles.discountBadge, { backgroundColor: '#10b981' }]}>
                    <Text style={styles.discountText}>{plan.discount} 할인</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Features */}
        <Text style={styles.sectionTitle}>프리미엄 기능</Text>
        {FEATURES.map((feature, index) => (
          <View key={index} style={styles.featureCard}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDesc}>{feature.desc}</Text>
            </View>
          </View>
        ))}

        {/* Subscribe Button */}
        {!isPremium && (
          <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
            <LinearGradient colors={['#fbbf24', '#f59e0b']} style={styles.subscribeGradient}>
              <Text style={styles.subscribeButtonText}>프리미엄 구독하기</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Payment Modal */}
      <Modal visible={showPayment} transparent animationType="slide" onRequestClose={() => setShowPayment(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>결제 확인</Text>
            {(() => {
              const plan = PLANS.find(p => p.id === selectedPlan)
              return (
                <>
                  <View style={styles.paymentSummary}>
                    <Text style={styles.paymentLabel}>연간 구독</Text>
                    <Text style={styles.paymentPrice}>{plan?.price.toLocaleString()}원</Text>
                  </View>
                  <Text style={styles.paymentNote}>이 결제는 테스트 결제입니다.{'\n'}실제 결제가 발생하지 않으며, 가상으로 프리미엄 기능을 체험할 수 있습니다.</Text>
                  <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPayment}>
                    <LinearGradient colors={['#667eea', '#764ba2']} style={StyleSheet.absoluteFill} />
                    <Text style={styles.confirmButtonText}>가상 결제 완료</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowPayment(false)}>
                    <Text style={styles.modalCancelText}>취소</Text>
                  </TouchableOpacity>
                </>
              )
            })()}
          </View>
        </View>
      </Modal>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 40, gap: 15 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  backButtonText: { color: 'white', fontSize: 20, fontWeight: '800' },
  headerTitle: { fontSize: 28, fontWeight: '900', color: 'white', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10 },
  heroSection: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  heroEmoji: { fontSize: 80, marginBottom: 20 },
  heroTitle: { fontSize: 32, fontWeight: '900', color: 'white', textAlign: 'center', marginBottom: 15, lineHeight: 42 },
  heroSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 24 },
  statusCard: { backgroundColor: 'rgba(255,255,255,0.95)', marginHorizontal: 20, borderRadius: 25, padding: 25, marginBottom: 30, alignItems: 'center' },
  statusBadge: { backgroundColor: '#10b981', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 15 },
  statusBadgeText: { color: 'white', fontSize: 14, fontWeight: '800' },
  statusTitle: { fontSize: 24, fontWeight: '900', color: '#333', marginBottom: 10 },
  statusDesc: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 20 },
  cancelButton: { backgroundColor: '#ef4444', borderRadius: 15, paddingVertical: 12, paddingHorizontal: 24 },
  cancelButtonText: { color: 'white', fontSize: 15, fontWeight: '800' },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: 'white', marginLeft: 20, marginBottom: 15, marginTop: 10 },
  planCard: { backgroundColor: 'rgba(255,255,255,0.95)', marginHorizontal: 20, borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 3, borderColor: 'transparent' },
  planCardActive: { borderColor: '#fbbf24', backgroundColor: '#fffbeb' },
  planCardPopular: { borderWidth: 3, borderColor: '#10b981' },
  popularBadge: { position: 'absolute', top: -10, right: 15, backgroundColor: '#10b981', borderRadius: 15, paddingHorizontal: 12, paddingVertical: 6 },
  popularBadgeText: { color: 'white', fontSize: 12, fontWeight: '900' },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  planName: { fontSize: 20, fontWeight: '900', color: '#333', marginBottom: 4 },
  planPeriod: { fontSize: 14, color: '#666', fontWeight: '600' },
  checkCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' },
  checkMark: { color: '#fbbf24', fontSize: 18, fontWeight: '900' },
  planPricing: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  planPrice: { fontSize: 28, fontWeight: '900', color: '#fbbf24' },
  planOriginalPrice: { fontSize: 16, color: '#999', textDecorationLine: 'line-through', marginBottom: 4 },
  discountBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 4 },
  discountText: { color: 'white', fontSize: 12, fontWeight: '800' },
  featureCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.95)', marginHorizontal: 20, borderRadius: 18, padding: 18, marginBottom: 12, gap: 15 },
  featureIconContainer: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  featureIcon: { fontSize: 24 },
  featureTitle: { fontSize: 16, fontWeight: '800', color: '#333', marginBottom: 4 },
  featureDesc: { fontSize: 13, color: '#666' },
  subscribeButton: { marginHorizontal: 20, marginTop: 30, borderRadius: 20, overflow: 'hidden', height: 60 },
  subscribeGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  subscribeButtonText: { color: 'white', fontSize: 20, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: 'white', borderRadius: 25, padding: 30, alignItems: 'center' },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#333', marginBottom: 25 },
  paymentSummary: { width: '100%', backgroundColor: '#f9fafb', borderRadius: 15, padding: 20, marginBottom: 20 },
  paymentLabel: { fontSize: 14, color: '#666', marginBottom: 8, fontWeight: '600' },
  paymentPrice: { fontSize: 32, fontWeight: '900', color: '#667eea' },
  paymentNote: { fontSize: 13, color: '#999', textAlign: 'center', lineHeight: 20, marginBottom: 25 },
  confirmButton: { width: '100%', height: 55, borderRadius: 15, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  confirmButtonText: { color: 'white', fontSize: 18, fontWeight: '900', zIndex: 1 },
  modalCancelButton: { width: '100%', backgroundColor: '#e5e7eb', borderRadius: 15, paddingVertical: 16, alignItems: 'center' },
  modalCancelText: { color: '#6b7280', fontSize: 16, fontWeight: '800' },
})
