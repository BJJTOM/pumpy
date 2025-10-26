import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { memberAPI } from '../../../services/api'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/RootNavigator'

type Props = NativeStackScreenProps<RootStackParamList, 'EditBodyStats'>

export default function EditBodyStatsScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [member, setMember] = useState<any>(null)
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    muscle: '',
    fat: ''
  })

  useEffect(() => {
    loadMemberData()
  }, [])

  const loadMemberData = async () => {
    setLoading(true)
    try {
      const userStr = await AsyncStorage.getItem('currentUser')
      if (userStr) {
        const user = JSON.parse(userStr)
        setMember(user)
        
        // Load existing body stats from AsyncStorage or member data
        const savedStats = await AsyncStorage.getItem(`body_stats_${user.id}`)
        if (savedStats) {
          const stats = JSON.parse(savedStats)
          setFormData({
            height: stats.height?.toString() || user.height?.toString() || '',
            weight: stats.weight?.toString() || user.weight?.toString() || '',
            muscle: stats.muscle?.toString() || '35',
            fat: stats.fat?.toString() || '15'
          })
        } else {
          setFormData({
            height: user.height?.toString() || '',
            weight: user.weight?.toString() || '',
            muscle: '35',
            fat: '15'
          })
        }
      }
    } catch (error) {
      console.error('Failed to load member data:', error)
      Alert.alert('오류', '회원 정보를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    // Validation
    if (!formData.height.trim() || !formData.weight.trim()) {
      Alert.alert('오류', '키와 체중은 필수 입력 항목입니다.')
      return
    }

    const height = parseFloat(formData.height)
    const weight = parseFloat(formData.weight)
    const muscle = parseFloat(formData.muscle || '0')
    const fat = parseFloat(formData.fat || '0')

    if (isNaN(height) || isNaN(weight)) {
      Alert.alert('오류', '올바른 숫자를 입력해주세요.')
      return
    }

    if (height < 100 || height > 250) {
      Alert.alert('오류', '키는 100cm ~ 250cm 범위 내에서 입력해주세요.')
      return
    }

    if (weight < 30 || weight > 300) {
      Alert.alert('오류', '체중은 30kg ~ 300kg 범위 내에서 입력해주세요.')
      return
    }

    setSaving(true)
    try {
      const bodyStats = {
        height,
        weight,
        muscle,
        fat
      }

      // Save to AsyncStorage
      await AsyncStorage.setItem(`body_stats_${member.id}`, JSON.stringify(bodyStats))

      // Try to update member record in API
      try {
        await memberAPI.updateProfile(member.id, {
          height,
          weight
        })
      } catch (apiError) {
        console.log('API update failed (non-critical):', apiError)
      }

      Alert.alert('저장 완료', '신체 정보가 성공적으로 저장되었습니다.')
      navigation.goBack()
    } catch (error) {
      console.error('Failed to save body stats:', error)
      Alert.alert('오류', '신체 정보 저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const calculateBMI = () => {
    const height = parseFloat(formData.height)
    const weight = parseFloat(formData.weight)
    if (!isNaN(height) && !isNaN(weight) && height > 0) {
      const heightM = height / 100
      return (weight / (heightM * heightM)).toFixed(1)
    }
    return '-'
  }

  if (loading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.center}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>로딩 중...</Text>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>신체 정보 편집</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>기본 정보</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>신장 (cm) <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="175"
                keyboardType="numeric"
                value={formData.height}
                onChangeText={(text) => setFormData({ ...formData, height: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>체중 (kg) <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="70"
                keyboardType="numeric"
                value={formData.weight}
                onChangeText={(text) => setFormData({ ...formData, weight: text })}
              />
            </View>

            {formData.height && formData.weight && (
              <View style={styles.bmiCard}>
                <Text style={styles.bmiLabel}>BMI 지수</Text>
                <Text style={styles.bmiValue}>{calculateBMI()}</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>상세 정보</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>근육량 (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="35"
                keyboardType="numeric"
                value={formData.muscle}
                onChangeText={(text) => setFormData({ ...formData, muscle: text })}
              />
              <Text style={styles.hint}>인바디 측정 시 확인 가능합니다</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>체지방률 (%)</Text>
              <TextInput
                style={styles.input}
                placeholder="15"
                keyboardType="numeric"
                value={formData.fat}
                onChangeText={(text) => setFormData({ ...formData, fat: text })}
              />
              <Text style={styles.hint}>인바디 측정 시 확인 가능합니다</Text>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonText}>💾 저장하기</Text>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'white', fontSize: 18, fontWeight: '700', marginTop: 15 },
  scrollContent: { flexGrow: 1, paddingBottom: 100 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    paddingTop: 40 
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
  formCard: { 
    backgroundColor: 'rgba(255,255,255,0.95)', 
    marginHorizontal: 20, 
    borderRadius: 25, 
    padding: 25, 
    borderWidth: 2, 
    borderColor: 'rgba(255,255,255,0.5)' 
  },
  section: { marginBottom: 30 },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#333', 
    marginBottom: 20, 
    paddingBottom: 10, 
    borderBottomWidth: 2, 
    borderBottomColor: '#e5e7eb' 
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8 },
  required: { color: '#ef4444' },
  input: { 
    backgroundColor: '#f9fafb', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    fontSize: 16, 
    color: '#333', 
    borderWidth: 2, 
    borderColor: '#e5e7eb' 
  },
  hint: { fontSize: 12, color: '#9ca3af', marginTop: 6, fontStyle: 'italic' },
  bmiCard: { 
    backgroundColor: '#667eea', 
    borderRadius: 15, 
    padding: 20, 
    alignItems: 'center', 
    marginTop: 15 
  },
  bmiLabel: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginBottom: 8 },
  bmiValue: { fontSize: 36, fontWeight: '900', color: 'white' },
  saveButton: { 
    backgroundColor: '#667eea', 
    borderRadius: 15, 
    paddingVertical: 18, 
    alignItems: 'center', 
    marginBottom: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 5
  },
  saveButtonText: { color: 'white', fontSize: 18, fontWeight: '900' },
  cancelButton: { 
    backgroundColor: '#e5e7eb', 
    borderRadius: 15, 
    paddingVertical: 18, 
    alignItems: 'center' 
  },
  cancelButtonText: { color: '#6b7280', fontSize: 16, fontWeight: '700' },
})

