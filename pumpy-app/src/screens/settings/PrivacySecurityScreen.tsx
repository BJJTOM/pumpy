import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert, TextInput } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import { api } from '../../../services/api'

export default function PrivacySecurityScreen() {
  const navigation = useNavigation()
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [autoLockEnabled, setAutoLockEnabled] = useState(true)
  const [dataCollection, setDataCollection] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    loadSecuritySettings()
  }, [])

  const loadSecuritySettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('security_settings')
      if (settings) {
        const parsed = JSON.parse(settings)
        setBiometricEnabled(parsed.biometricEnabled || false)
        setAutoLockEnabled(parsed.autoLockEnabled !== false)
        setDataCollection(parsed.dataCollection !== false)
      }
    } catch (error) {
      console.error('Failed to load security settings:', error)
    }
  }

  const saveSecuritySettings = async (key: string, value: boolean) => {
    try {
      const settings = await AsyncStorage.getItem('security_settings')
      const parsed = settings ? JSON.parse(settings) : {}
      parsed[key] = value
      await AsyncStorage.setItem('security_settings', JSON.stringify(parsed))
    } catch (error) {
      console.error('Failed to save security settings:', error)
    }
  }

  const toggleBiometric = async (value: boolean) => {
    setBiometricEnabled(value)
    await saveSecuritySettings('biometricEnabled', value)
    Alert.alert(
      '생체 인증',
      value
        ? '생체 인증이 활성화되었습니다. (다음 로그인부터 적용됩니다)'
        : '생체 인증이 비활성화되었습니다.'
    )
  }

  const toggleAutoLock = async (value: boolean) => {
    setAutoLockEnabled(value)
    await saveSecuritySettings('autoLockEnabled', value)
  }

  const toggleDataCollection = async (value: boolean) => {
    setDataCollection(value)
    await saveSecuritySettings('dataCollection', value)
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('오류', '모든 필드를 입력해주세요.')
      return
    }

    if (newPassword.length < 6) {
      Alert.alert('오류', '새 비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('오류', '새 비밀번호가 일치하지 않습니다.')
      return
    }

    try {
      const userStr = await AsyncStorage.getItem('currentUser')
      if (!userStr) {
        Alert.alert('오류', '사용자 정보를 찾을 수 없습니다.')
        return
      }

      const user = JSON.parse(userStr)
      
      // TODO: Implement password change API
      Alert.alert(
        '비밀번호 변경',
        '비밀번호가 성공적으로 변경되었습니다.\n(실제 API 연동은 다음 업데이트에서 적용됩니다)',
        [
          {
            text: '확인',
            onPress: () => {
              setCurrentPassword('')
              setNewPassword('')
              setConfirmPassword('')
              setShowPassword(false)
            }
          }
        ]
      )
    } catch (error) {
      Alert.alert('오류', '비밀번호 변경에 실패했습니다.')
    }
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      '계정 삭제',
      '정말로 계정을 삭제하시겠습니까?\n\n모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '최종 확인',
              '마지막으로 확인합니다. 계정을 삭제하시겠습니까?',
              [
                { text: '취소', style: 'cancel' },
                {
                  text: '삭제',
                  style: 'destructive',
                  onPress: async () => {
                    // TODO: Implement account deletion API
                    Alert.alert('계정 삭제', '계정 삭제 요청이 접수되었습니다.\n관리자 승인 후 처리됩니다.')
                  }
                }
              ]
            )
          }
        }
      ]
    )
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>개인정보 및 보안</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Security Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>보안 설정</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🔐</Text>
                <View>
                  <Text style={styles.settingLabel}>생체 인증</Text>
                  <Text style={styles.settingDesc}>지문 또는 Face ID</Text>
                </View>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={toggleBiometric}
                trackColor={{ false: '#e0e0e0', true: '#667eea' }}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🔒</Text>
                <View>
                  <Text style={styles.settingLabel}>자동 잠금</Text>
                  <Text style={styles.settingDesc}>5분 후 자동 로그아웃</Text>
                </View>
              </View>
              <Switch
                value={autoLockEnabled}
                onValueChange={toggleAutoLock}
                trackColor={{ false: '#e0e0e0', true: '#667eea' }}
              />
            </View>
          </View>
        </View>

        {/* Password Change */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>비밀번호 변경</Text>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>현재 비밀번호</Text>
              <TextInput
                style={styles.input}
                placeholder="현재 비밀번호 입력"
                secureTextEntry={!showPassword}
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>새 비밀번호</Text>
              <TextInput
                style={styles.input}
                placeholder="새 비밀번호 입력 (최소 6자)"
                secureTextEntry={!showPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>새 비밀번호 확인</Text>
              <TextInput
                style={styles.input}
                placeholder="새 비밀번호 재입력"
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
            <TouchableOpacity
              style={styles.showPasswordButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.showPasswordText}>
                {showPassword ? '🙈 비밀번호 숨기기' : '👁️ 비밀번호 보기'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.changePasswordButton} onPress={handleChangePassword}>
              <Text style={styles.changePasswordText}>비밀번호 변경</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>개인정보 설정</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>📊</Text>
                <View>
                  <Text style={styles.settingLabel}>데이터 수집 동의</Text>
                  <Text style={styles.settingDesc}>앱 개선을 위한 익명 데이터 수집</Text>
                </View>
              </View>
              <Switch
                value={dataCollection}
                onValueChange={toggleDataCollection}
                trackColor={{ false: '#e0e0e0', true: '#667eea' }}
              />
            </View>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => Alert.alert('내 정보', '회원 정보 다운로드 기능은 준비 중입니다.')}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>📥</Text>
                <Text style={styles.settingLabel}>내 정보 다운로드</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>위험 영역</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.dangerItem} onPress={handleDeleteAccount}>
              <Text style={styles.dangerIcon}>⚠️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.dangerLabel}>계정 삭제</Text>
                <Text style={styles.dangerDesc}>모든 데이터가 영구 삭제됩니다</Text>
              </View>
            </TouchableOpacity>
          </View>
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
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  section: { marginBottom: 25 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
    marginLeft: 5
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  settingIcon: { fontSize: 24 },
  settingLabel: { fontSize: 15, fontWeight: '600', color: '#333' },
  settingDesc: { fontSize: 12, color: '#999', marginTop: 2 },
  settingArrow: { fontSize: 24, color: '#ccc' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 8 },
  inputGroup: { marginBottom: 15 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 8 },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 2,
    borderColor: '#e5e7eb'
  },
  showPasswordButton: {
    alignSelf: 'center',
    marginVertical: 10
  },
  showPasswordText: {
    fontSize: 13,
    color: '#667eea',
    fontWeight: '600'
  },
  changePasswordButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10
  },
  changePasswordText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800'
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12
  },
  dangerIcon: { fontSize: 24 },
  dangerLabel: { fontSize: 15, fontWeight: '700', color: '#ef4444' },
  dangerDesc: { fontSize: 12, color: '#999', marginTop: 2 }
})

