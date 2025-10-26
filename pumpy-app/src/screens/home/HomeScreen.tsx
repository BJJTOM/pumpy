import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Image } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from '../../navigation/RootNavigator'
import { attendanceAPI, api } from '../../../services/api'
import { LinearGradient } from 'expo-linear-gradient'

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>()
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [aiPhoto, setAiPhoto] = useState<string | null>(null)
  const [bodyStats, setBodyStats] = useState({ weight: 70, muscle: 35, fat: 15, height: 175 })
  const [attendanceStats, setAttendanceStats] = useState({ consecutive: 0, thisMonth: 0, total: 0 })
  const [gymInfo] = useState({ name: 'Pumpy 체육관', location: '서울시 강남구', daysLeft: 15 })
  const [todaySteps, setTodaySteps] = useState(0)
  const [stepGoal] = useState(10000)
  const [todayWOD, setTodayWOD] = useState<any>(null)
  const [level, setLevel] = useState(1)
  const [experiencePoints, setExperiencePoints] = useState(0)

  const loadData = useCallback(async () => {
    try {
      const userStr = await AsyncStorage.getItem('user')
      if (!userStr) {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
        return
      }

      const user = JSON.parse(userStr)
      setCurrentUser(user)

      // Load AI photo
      const savedPhoto = await AsyncStorage.getItem(`ai_photo_${user.id}`)
      if (savedPhoto) setAiPhoto(savedPhoto)

      // Load body stats
      const savedBodyStats = await AsyncStorage.getItem(`body_stats_${user.id}`)
      if (savedBodyStats) {
        setBodyStats(JSON.parse(savedBodyStats))
      }

      // Load steps
      const savedSteps = await AsyncStorage.getItem('todaySteps')
      if (savedSteps) {
        setTodaySteps(parseInt(savedSteps))
      } else {
        const randomSteps = Math.floor(Math.random() * 12000)
        setTodaySteps(randomSteps)
        await AsyncStorage.setItem('todaySteps', randomSteps.toString())
      }

      // Load WOD
      try {
        const wodsRes = await api.get('/wods/')
        const today = new Date().toISOString().split('T')[0]
        const todayWODs = wodsRes.data.filter((w: any) => w.date === today)
        if (todayWODs.length > 0) {
          setTodayWOD(todayWODs[0])
        }
      } catch (wodError) {
        console.log('WOD 로드 실패 (정상):', wodError)
      }

      // Load attendance
      const attendanceRes = await api.get(`/attendance/?member=${user.id}`)
      const attendanceData = attendanceRes.data

      const thisMonth = attendanceData.filter((a: any) => {
        const date = new Date(a.check_in_time || a.date)
        const now = new Date()
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      }).length

      setAttendanceStats({
        consecutive: calculateConsecutiveDays(attendanceData),
        thisMonth,
        total: attendanceData.length
      })

      // Calculate level and XP
      const totalAttendance = attendanceData.length
      const calculatedLevel = Math.floor(totalAttendance / 10) + 1
      const xp = (totalAttendance % 10) * 10
      setLevel(calculatedLevel)
      setExperiencePoints(xp)

    } catch (error) {
      console.error('데이터 로드 실패:', error)
      Alert.alert('오류', '데이터를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [navigation])

  useEffect(() => {
    loadData()
  }, [loadData])

  const calculateConsecutiveDays = (attendance: any[]) => {
    if (attendance.length === 0) return 0

    const sortedDates = attendance
      .map(a => {
        const dateStr = a.check_in_time || a.date
        return dateStr ? new Date(dateStr).toISOString().split('T')[0] : null
      })
      .filter((d): d is string => d !== null)
      .sort()
      .reverse()

    let consecutive = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (let date of sortedDates) {
      const checkDate = new Date(date)
      checkDate.setHours(0, 0, 0, 0)

      const diffDays = Math.floor((currentDate.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === consecutive) {
        consecutive++
      } else {
        break
      }
    }

    return consecutive
  }

  const calculateBMI = () => {
    const heightM = bodyStats.height / 100
    return (bodyStats.weight / (heightM * heightM)).toFixed(1)
  }

  const refreshSteps = async () => {
    try {
      // 실제 헬스앱 연동 시뮬레이션 (실제로는 pedometer API 사용)
      const newSteps = Math.floor(Math.random() * 15000)
      setTodaySteps(newSteps)
      await AsyncStorage.setItem('todaySteps', newSteps.toString())
      Alert.alert('걸음수 갱신 완료', `현재 걸음수: ${newSteps.toLocaleString()}보\n\n실제 서비스에서는 헬스 앱과 연동됩니다.`)
    } catch (error) {
      Alert.alert('오류', '걸음수 새로고침에 실패했습니다.')
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    )
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>안녕하세요, {currentUser?.last_name}{currentUser?.first_name}님!</Text>
            <Text style={styles.subGreeting}>오늘도 힘차게 운동해볼까요? 💪</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lv.{level}</Text>
          </View>
        </View>

        {/* Main Content Grid */}
        <View style={styles.mainGrid}>
          {/* Left: Boxing Character */}
          <TouchableOpacity style={styles.characterCard} onPress={() => (navigation as any).navigate('Profile')}>
            <View style={styles.characterWrapper}>
              {aiPhoto ? (
                <Image source={{ uri: aiPhoto }} style={styles.aiPhoto} />
              ) : (
                <BoxingCharacter />
              )}
            </View>
            <Text style={styles.characterName}>{currentUser?.last_name}{currentUser?.first_name}</Text>
            <TouchableOpacity style={styles.editButton}>
              <Text>✏️</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Right: Info Cards */}
          <View style={styles.infoCards}>
            {/* Body Stats Card */}
            <TouchableOpacity style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <View style={[styles.iconBox, { backgroundColor: '#667eea' }]}>
                    <Text style={styles.iconText}>📊</Text>
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>신체 정보</Text>
                    <Text style={styles.cardSubtitle}>BMI {calculateBMI()}</Text>
                  </View>
                </View>
                <Text style={styles.arrow}>›</Text>
              </View>
              <View style={styles.statsGrid}>
                <StatMini label="키" value={bodyStats.height} unit="cm" />
                <StatMini label="체중" value={bodyStats.weight} unit="kg" />
                <StatMini label="근육" value={bodyStats.muscle} unit="kg" color="#10b981" />
                <StatMini label="체지방" value={bodyStats.fat} unit="%" color="#f59e0b" />
              </View>
            </TouchableOpacity>

            {/* Attendance Stats Card */}
            <TouchableOpacity style={styles.infoCard} onPress={() => (navigation as any).navigate('AttendanceHistory')}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <View style={[styles.iconBox, { backgroundColor: '#10b981' }]}>
                    <Text style={styles.iconText}>📅</Text>
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>출석 통계</Text>
                    <Text style={styles.cardSubtitle}>이번 달 {attendanceStats.thisMonth}회</Text>
                  </View>
                </View>
                <Text style={styles.arrow}>›</Text>
              </View>
              <View style={styles.statsGrid}>
                <StatMini label="연속" value={attendanceStats.consecutive} unit="일" color="#10b981" />
                <StatMini label="이번 달" value={attendanceStats.thisMonth} unit="회" color="#667eea" />
                <StatMini label="총" value={attendanceStats.total} unit="회" color="#f59e0b" />
              </View>
            </TouchableOpacity>

            {/* Level Card */}
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <View style={[styles.iconBox, { backgroundColor: '#8b5cf6' }]}>
                    <Text style={styles.iconText}>🏆</Text>
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>레벨 {level}</Text>
                    <Text style={styles.cardSubtitle}>다음 레벨 까지</Text>
                  </View>
                </View>
                <Text style={styles.xpPercent}>{experiencePoints}%</Text>
              </View>
              <View style={styles.xpBar}>
                <View style={[styles.xpFill, { width: `${experiencePoints}%` }]} />
              </View>
              <Text style={styles.xpText}>100XP</Text>
            </View>
          </View>
        </View>

        {/* Gym Info Card */}
        <View style={styles.gymCard}>
          <Text style={styles.gymTitle}>Pumpy 체육관</Text>
          <Text style={styles.gymLocation}>서울시 강남구</Text>
          <Text style={styles.gymDays}>남은 기간: <Text style={styles.gymDaysNum}>{gymInfo.daysLeft}일</Text></Text>
        </View>

        {/* Steps Card */}
        <View style={styles.stepsCard}>
          <View style={styles.stepsHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#4facfe' }]}>
              <Text style={styles.iconText}>🔥</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepsTitle}>오늘의 걸음 수</Text>
              <Text style={styles.stepsGoal}>목표: {stepGoal.toLocaleString()}걸음</Text>
            </View>
            <Text style={styles.stepsCount}>{todaySteps.toLocaleString()}</Text>
            <TouchableOpacity onPress={refreshSteps} style={styles.refreshButton}>
              <Text style={styles.refreshIcon}>🔄</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.stepsBar}>
            <View style={[styles.stepsBarFill, { width: `${Math.min((todaySteps / stepGoal) * 100, 100)}%` }]} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.stepsPercent}>{Math.floor((todaySteps / stepGoal) * 100)}% 달성</Text>
            <Text style={{ fontSize: 10, color: '#999', fontStyle: 'italic' }}>헬스 앱 연동</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <QuickAction icon="📋" label="WOD" onPress={() => (navigation as any).navigate('WOD')} />
          <QuickAction icon="🍎" label="식단" onPress={() => (navigation as any).navigate('Meal')} />
          <QuickAction icon="📊" label="운동 기록" onPress={() => (navigation as any).navigate('WorkoutLog')} />
          <QuickAction icon="👑" label="프리미엄" onPress={() => (navigation as any).navigate('Premium')} gradient />
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

function BoxingCharacter() {
  return (
    <View style={{ width: 140, height: 160 }}>
      {/* Head */}
      <View style={styles.charHead}>
        <View style={[styles.charEye, { left: 13 }]} />
        <View style={[styles.charEye, { right: 13 }]} />
        <View style={styles.charMouth} />
      </View>
      {/* Neck */}
      <View style={styles.charNeck} />
      {/* Body */}
      <View style={styles.charBody}>
        <Text style={{ fontSize: 20 }}>🥊</Text>
      </View>
      {/* Left Arm */}
      <View style={styles.charLeftArm} />
      <View style={styles.charLeftGlove} />
      {/* Right Arm (Punch) */}
      <View style={styles.charRightArm} />
      <View style={styles.charRightGlove}>
        <Text style={{ position: 'absolute', right: -22, fontSize: 18 }}>💥</Text>
      </View>
      {/* Legs */}
      <View style={[styles.charLeg, { left: 42 }]} />
      <View style={[styles.charLeg, { right: 42 }]} />
    </View>
  )
}

function StatMini({ label, value, unit, color = '#667eea' }: { label: string; value: number; unit: string; color?: string }) {
  return (
    <View style={styles.statMini}>
      <Text style={styles.statMiniValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.statMiniLabel}>{label}</Text>
      <Text style={[styles.statMiniUnit, { color }]}>({unit})</Text>
    </View>
  )
}

function QuickAction({ icon, label, gradient, onPress }: { icon: string; label: string; gradient?: boolean; onPress?: () => void }) {
  return (
    <TouchableOpacity style={[styles.quickAction, gradient && styles.quickActionGradient]} onPress={onPress}>
      <Text style={styles.quickActionIcon}>{icon}</Text>
      <Text style={[styles.quickActionLabel, gradient && { color: 'white' }]}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#667eea' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 40 },
  greeting: { fontSize: 22, fontWeight: '900', color: 'white', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10 },
  subGreeting: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginTop: 4 },
  levelBadge: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  levelText: { color: 'white', fontSize: 14, fontWeight: '800' },
  mainGrid: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 20 },
  characterCard: { width: 160, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 12, alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  characterWrapper: { width: 130, height: 150, marginBottom: 8 },
  aiPhoto: { width: '100%', height: '100%', borderRadius: 15, borderWidth: 3, borderColor: 'white' },
  characterName: { fontSize: 13, fontWeight: '800', color: 'white', textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 },
  editButton: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },
  infoCards: { flex: 1, gap: 8 },
  infoCard: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 15, padding: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBox: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  iconText: { fontSize: 17 },
  cardTitle: { fontSize: 13, fontWeight: '800', color: '#333' },
  cardSubtitle: { fontSize: 10, color: '#999', marginTop: 1 },
  arrow: { fontSize: 18, color: '#ccc' },
  statsGrid: { flexDirection: 'row', gap: 5 },
  statMini: { flex: 1, alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 4 },
  statMiniValue: { fontSize: 17, fontWeight: '800', color: '#333' },
  statMiniLabel: { fontSize: 9, color: '#666', marginTop: 3 },
  statMiniUnit: { fontSize: 8, fontWeight: '600', marginTop: 1, color: '#999' },
  xpPercent: { fontSize: 18, fontWeight: '900', color: '#8b5cf6' },
  xpBar: { height: 10, backgroundColor: '#e5e7eb', borderRadius: 5, overflow: 'hidden', marginTop: 10 },
  xpFill: { height: '100%', backgroundColor: '#8b5cf6', borderRadius: 5 },
  xpText: { fontSize: 10, color: '#999', textAlign: 'right', marginTop: 5 },
  gymCard: { backgroundColor: 'rgba(255,255,255,0.95)', marginHorizontal: 20, borderRadius: 20, padding: 18, marginBottom: 15, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  gymTitle: { fontSize: 17, fontWeight: '800', color: '#333', marginBottom: 4 },
  gymLocation: { fontSize: 13, color: '#666', marginBottom: 10 },
  gymDays: { fontSize: 13, color: '#999' },
  gymDaysNum: { fontSize: 15, fontWeight: '800', color: '#667eea' },
  stepsCard: { backgroundColor: 'rgba(255,255,255,0.95)', marginHorizontal: 20, borderRadius: 20, padding: 18, marginBottom: 15, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  stepsHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  stepsTitle: { fontSize: 14, fontWeight: '800', color: '#333' },
  stepsGoal: { fontSize: 11, color: '#999', marginTop: 2 },
  stepsCount: { fontSize: 26, fontWeight: '900', color: '#4facfe' },
  stepsBar: { height: 12, backgroundColor: '#e5e7eb', borderRadius: 6, overflow: 'hidden', marginBottom: 10 },
  stepsBarFill: { height: '100%', backgroundColor: '#4facfe', borderRadius: 6 },
  stepsPercent: { fontSize: 12, color: '#666', fontWeight: '600' },
  refreshButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#4facfe', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  refreshIcon: { fontSize: 16 },
  quickActions: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 15 },
  quickAction: { flex: 1, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 18, paddingVertical: 16, paddingHorizontal: 8, alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  quickActionGradient: { backgroundColor: '#fbbf24' },
  quickActionIcon: { fontSize: 32, marginBottom: 6 },
  quickActionLabel: { fontSize: 11, fontWeight: '800', color: '#333' },
  // Boxing Character Styles
  charHead: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#ffdbac', position: 'absolute', top: 0, left: 40, borderWidth: 3, borderColor: '#333' },
  charEye: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#333', position: 'absolute', top: 22 },
  charMouth: { position: 'absolute', bottom: 12, left: 18, width: 25, height: 12, borderRadius: 12, borderWidth: 2, borderColor: '#333', borderTopWidth: 0 },
  charNeck: { width: 25, height: 15, backgroundColor: '#ffdbac', position: 'absolute', top: 55, left: 57, borderLeftWidth: 2, borderRightWidth: 2, borderColor: '#333' },
  charBody: { width: 70, height: 55, backgroundColor: '#667eea', position: 'absolute', top: 70, left: 35, borderRadius: 12, borderWidth: 3, borderColor: '#333', justifyContent: 'center', alignItems: 'center' },
  charLeftArm: { width: 30, height: 10, backgroundColor: '#667eea', position: 'absolute', top: 80, left: 10, borderRadius: 5, borderWidth: 2, borderColor: '#333', transform: [{ rotate: '-20deg' }] },
  charLeftGlove: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#ff6b6b', position: 'absolute', top: 74, left: 0, borderWidth: 2, borderColor: '#333' },
  charRightArm: { width: 40, height: 10, backgroundColor: '#667eea', position: 'absolute', top: 85, right: 5, borderRadius: 5, borderWidth: 2, borderColor: '#333', transform: [{ rotate: '15deg' }] },
  charRightGlove: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#ff6b6b', position: 'absolute', top: 79, right: -12, borderWidth: 2, borderColor: '#333' },
  charLeg: { width: 22, height: 28, backgroundColor: '#333', position: 'absolute', bottom: 0, borderRadius: 6, borderWidth: 2, borderColor: '#222' },
})
