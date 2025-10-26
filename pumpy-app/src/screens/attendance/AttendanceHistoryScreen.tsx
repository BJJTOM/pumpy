import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { api } from '../../../services/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function AttendanceHistoryScreen() {
  const navigation = useNavigation()
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<any[]>([])

  useEffect(() => {
    loadAttendance()
  }, [])

  const loadAttendance = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        const res = await api.get(`/attendance/?member=${user.id}`)
        setRecords(res.data || [])
      }
    } catch (error) {
      console.error('출석 기록 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>출석 기록</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#667eea" />
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item, idx) => String(idx)}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardLeft}>
                <Text style={styles.date}>{item.date || item.check_in_time?.split('T')[0]}</Text>
                <Text style={styles.status}>{item.status || '출석'}</Text>
              </View>
              <Text style={styles.emoji}>✅</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 60, marginBottom: 16 }}>📅</Text>
              <Text style={styles.emptyText}>출석 기록이 없습니다</Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 40, gap: 15, backgroundColor: '#667eea' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  backText: { color: 'white', fontSize: 20, fontWeight: '800' },
  headerTitle: { fontSize: 28, fontWeight: '900', color: 'white' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: 'white', borderRadius: 15, padding: 20, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  cardLeft: { flex: 1 },
  date: { fontSize: 16, fontWeight: '800', color: '#333', marginBottom: 4 },
  status: { fontSize: 14, color: '#667eea', fontWeight: '600' },
  emoji: { fontSize: 32 },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#666', fontWeight: '600' },
})

