import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'

export default function WorkoutLogScreen() {
  const navigation = useNavigation()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>운동 기록</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.emoji}>📊</Text>
          <Text style={styles.title}>운동 기록</Text>
          <Text style={styles.subtitle}>오늘의 운동을 기록하세요</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>운동 추가하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f093fb' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 40, gap: 15 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  backText: { color: 'white', fontSize: 20, fontWeight: '800' },
  headerTitle: { fontSize: 28, fontWeight: '900', color: 'white' },
  content: { flex: 1, padding: 20 },
  card: { backgroundColor: 'white', borderRadius: 25, padding: 40, alignItems: 'center' },
  emoji: { fontSize: 80, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#333', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30 },
  button: { backgroundColor: '#f093fb', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 15 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '800' },
})

