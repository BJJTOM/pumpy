import React, { useEffect, useState, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert, Modal, TextInput } from 'react-native'
import { api } from '../../../services/api'
import { useNavigation } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function WODScreen() {
  const navigation = useNavigation()
  const [loading, setLoading] = useState(true)
  const [todayWOD, setTodayWOD] = useState<any>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showTimer, setShowTimer] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [result, setResult] = useState({ time: '', reps: '', notes: '' })
  const timerInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadWOD()
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current)
    }
  }, [])

  useEffect(() => {
    if (isTimerRunning) {
      timerInterval.current = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)
    } else {
      if (timerInterval.current) clearInterval(timerInterval.current)
    }
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current)
    }
  }, [isTimerRunning])

  const loadWOD = async () => {
    try {
      const res = await api.get('/wods/')
      const today = new Date().toISOString().split('T')[0]
      const todayWODs = res.data.filter((w: any) => w.date === today)
      
      if (todayWODs.length > 0) {
        setTodayWOD(todayWODs[0])
        const completed = await AsyncStorage.getItem(`wod_completed_${today}`)
        if (completed) setIsCompleted(true)
      }
    } catch (error) {
      console.error('WOD 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartTimer = () => {
    setShowTimer(true)
    setTimer(0)
    setIsTimerRunning(true)
  }

  const handleStopTimer = () => {
    setIsTimerRunning(false)
    setShowResultModal(true)
    setResult({ ...result, time: formatTime(timer) })
  }

  const handleSaveResult = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      await AsyncStorage.setItem(`wod_completed_${today}`, JSON.stringify({
        time: result.time,
        reps: result.reps,
        notes: result.notes,
        completedAt: new Date().toISOString()
      }))
      setIsCompleted(true)
      setShowResultModal(false)
      setShowTimer(false)
      Alert.alert('완료!', '오늘의 WOD를 완료했습니다! 💪')
    } catch (error) {
      Alert.alert('오류', '기록 저장에 실패했습니다.')
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    )
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>오늘의 WOD</Text>
          {isCompleted && <Text style={styles.completedBadge}>✓ 완료</Text>}
        </View>
        {!isCompleted && todayWOD && (
          <TouchableOpacity style={styles.timerButton} onPress={handleStartTimer}>
            <Text style={styles.timerButtonText}>⏱️ 시작</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {todayWOD ? (
          <View style={styles.wodCard}>
            {/* Date */}
            <View style={styles.section}>
              <Text style={styles.label}>날짜</Text>
              <Text style={styles.date}>{todayWOD.date}</Text>
            </View>

            {/* Title */}
            {todayWOD.title && (
              <View style={styles.section}>
                <Text style={styles.label}>제목</Text>
                <Text style={styles.title}>{todayWOD.title}</Text>
              </View>
            )}

            {/* Type */}
            {todayWOD.workout_type && (
              <View style={styles.section}>
                <Text style={styles.label}>운동 유형</Text>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>{todayWOD.workout_type}</Text>
                </View>
              </View>
            )}

            {/* Description */}
            {todayWOD.description && (
              <View style={styles.section}>
                <Text style={styles.label}>운동 설명</Text>
                <Text style={styles.description}>{todayWOD.description}</Text>
              </View>
            )}

            {/* Time Cap */}
            {todayWOD.time_cap && (
              <View style={styles.section}>
                <Text style={styles.label}>⏱️ 시간 제한</Text>
                <Text style={styles.timeCap}>{todayWOD.time_cap}분</Text>
              </View>
            )}

            {/* Coach Tips */}
            {todayWOD.coach_tips && (
              <View style={[styles.section, styles.tipsSection]}>
                <Text style={styles.label}>💡 코치의 팁</Text>
                <Text style={styles.tips}>{todayWOD.coach_tips}</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 60, marginBottom: 16 }}>📋</Text>
            <Text style={styles.emptyTitle}>오늘의 WOD가 없습니다</Text>
            <Text style={styles.emptyText}>관리자가 WOD를 등록하면 여기에 표시됩니다.</Text>
          </View>
        )}
      </ScrollView>

      {/* Timer Modal */}
      <Modal visible={showTimer} transparent animationType="fade">
        <View style={styles.timerModalOverlay}>
          <View style={styles.timerModalContent}>
            <Text style={styles.timerModalTitle}>운동 시간</Text>
            <Text style={styles.timerDisplay}>{formatTime(timer)}</Text>
            <View style={styles.timerButtons}>
              {!isTimerRunning ? (
                <>
                  <TouchableOpacity style={styles.timerButton2} onPress={() => setIsTimerRunning(true)}>
                    <Text style={styles.timerButtonText2}>▶ 재시작</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.timerButton2, styles.timerButtonStop]} onPress={handleStopTimer}>
                    <Text style={styles.timerButtonText2}>■ 완료</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={[styles.timerButton2, styles.timerButtonPause]} onPress={() => setIsTimerRunning(false)}>
                  <Text style={styles.timerButtonText2}>⏸ 일시정지</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={() => {
              setShowTimer(false)
              setIsTimerRunning(false)
              setTimer(0)
            }}>
              <Text style={styles.timerCloseText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Result Modal */}
      <Modal visible={showResultModal} transparent animationType="slide" onRequestClose={() => setShowResultModal(false)}>
        <View style={styles.resultModalOverlay}>
          <View style={styles.resultModalContent}>
            <Text style={styles.resultModalTitle}>WOD 기록 저장</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>완료 시간</Text>
              <TextInput
                style={styles.input}
                value={result.time}
                onChangeText={(text) => setResult({ ...result, time: text })}
                placeholder="MM:SS"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>라운드/반복 횟수</Text>
              <TextInput
                style={styles.input}
                value={result.reps}
                onChangeText={(text) => setResult({ ...result, reps: text })}
                placeholder="예: 5 rounds"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>메모</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={result.notes}
                onChangeText={(text) => setResult({ ...result, notes: text })}
                placeholder="오늘의 느낌, 개선점 등"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>
            <View style={styles.resultModalButtons}>
              <TouchableOpacity style={[styles.resultModalButton, styles.resultButtonCancel]} onPress={() => setShowResultModal(false)}>
                <Text style={styles.resultButtonTextCancel}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.resultModalButton, styles.resultButtonSave]} onPress={handleSaveResult}>
                <Text style={styles.resultButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#667eea',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    gap: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  completedBadge: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '800',
    marginTop: 2,
  },
  timerButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  timerButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  wodCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 25,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 10,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
    fontWeight: '600',
  },
  date: {
    fontSize: 18,
    fontWeight: '800',
    color: '#667eea',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#333',
  },
  typeBadge: {
    backgroundColor: '#667eea20',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#667eea',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  timeCap: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f59e0b',
  },
  tipsSection: {
    backgroundColor: '#fef3c7',
    borderRadius: 15,
    padding: 20,
    marginTop: 8,
  },
  tips: {
    fontSize: 15,
    lineHeight: 22,
    color: '#78350f',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 25,
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  timerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerModalContent: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 40,
    alignItems: 'center',
    minWidth: 300,
  },
  timerModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#666',
    marginBottom: 20,
  },
  timerDisplay: {
    fontSize: 64,
    fontWeight: '900',
    color: '#667eea',
    marginBottom: 30,
  },
  timerButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  timerButton2: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 15,
  },
  timerButtonPause: {
    backgroundColor: '#f59e0b',
  },
  timerButtonStop: {
    backgroundColor: '#10b981',
  },
  timerButtonText2: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
  },
  timerCloseText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  resultModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultModalContent: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 25,
  },
  resultModalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#333',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  resultModalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  resultModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  resultButtonCancel: {
    backgroundColor: '#f3f4f6',
  },
  resultButtonSave: {
    backgroundColor: '#667eea',
  },
  resultButtonTextCancel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6b7280',
  },
  resultButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
  },
})

