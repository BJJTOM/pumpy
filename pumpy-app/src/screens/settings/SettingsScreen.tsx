import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'

interface SettingsItem {
  icon: string
  label: string
  value?: string | boolean
  onPress?: () => void
  type?: 'switch' | 'nav' | 'link'
  key?: string
}

export default function SettingsScreen() {
  const navigation = useNavigation()
  const [darkMode, setDarkMode] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('app_settings')
      if (settings) {
        const parsed = JSON.parse(settings)
        setDarkMode(parsed.darkMode || false)
        setPushEnabled(parsed.pushEnabled !== false)
        setSoundEnabled(parsed.soundEnabled !== false)
        setVibrationEnabled(parsed.vibrationEnabled !== false)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const saveSettings = async (key: string, value: boolean) => {
    try {
      const settings = await AsyncStorage.getItem('app_settings')
      const parsed = settings ? JSON.parse(settings) : {}
      parsed[key] = value
      await AsyncStorage.setItem('app_settings', JSON.stringify(parsed))
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const toggleDarkMode = async (value: boolean) => {
    setDarkMode(value)
    await saveSettings('darkMode', value)
    // TODO: Implement dark mode globally
    Alert.alert('다크모드', value ? '다크모드가 활성화되었습니다. (다음 업데이트에서 적용됩니다)' : '다크모드가 비활성화되었습니다.')
  }

  const togglePush = async (value: boolean) => {
    setPushEnabled(value)
    await saveSettings('pushEnabled', value)
  }

  const toggleSound = async (value: boolean) => {
    setSoundEnabled(value)
    await saveSettings('soundEnabled', value)
  }

  const toggleVibration = async (value: boolean) => {
    setVibrationEnabled(value)
    await saveSettings('vibrationEnabled', value)
  }

  const settingsGroups = [
    {
      title: '일반',
      items: [
        {
          icon: '🌙',
          label: '다크 모드',
          type: 'switch',
          value: darkMode,
          onPress: () => toggleDarkMode(!darkMode)
        },
        {
          icon: '🔔',
          label: '푸시 알림',
          type: 'switch',
          value: pushEnabled,
          onPress: () => togglePush(!pushEnabled)
        },
        {
          icon: '🔊',
          label: '알림 소리',
          type: 'switch',
          value: soundEnabled,
          onPress: () => toggleSound(!soundEnabled)
        },
        {
          icon: '📳',
          label: '진동',
          type: 'switch',
          value: vibrationEnabled,
          onPress: () => toggleVibration(!vibrationEnabled)
        }
      ]
    },
    {
      title: '개인정보 및 보안',
      items: [
        {
          icon: '🔒',
          label: '개인정보 및 보안',
          type: 'nav',
          onPress: () => (navigation as any).navigate('PrivacySecurity')
        },
        {
          icon: '🗑️',
          label: '캐시 삭제',
          type: 'nav',
          onPress: async () => {
            Alert.alert(
              '캐시 삭제',
              '앱 캐시를 삭제하시겠습니까?',
              [
                { text: '취소', style: 'cancel' },
                {
                  text: '삭제',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await AsyncStorage.removeItem('chatbot_history')
                      Alert.alert('완료', '캐시가 삭제되었습니다.')
                    } catch (error) {
                      Alert.alert('오류', '캐시 삭제에 실패했습니다.')
                    }
                  }
                }
              ]
            )
          }
        }
      ]
    },
    {
      title: '고객 지원',
      items: [
        {
          icon: '💬',
          label: '고객센터',
          type: 'nav',
          onPress: () => (navigation as any).navigate('CustomerSupport')
        },
        {
          icon: '📢',
          label: '공지사항',
          type: 'nav',
          onPress: () => (navigation as any).navigate('Announcements')
        },
        {
          icon: '❓',
          label: '자주 묻는 질문',
          type: 'nav',
          onPress: () => (navigation as any).navigate('FAQ')
        }
      ]
    },
    {
      title: '앱 정보',
      items: [
        {
          icon: '⭐',
          label: '스토어 리뷰 작성',
          type: 'nav',
          onPress: () => Alert.alert('리뷰 작성', '스토어로 이동합니다.\n(실제 앱에서는 Google Play Store로 연결됩니다)')
        },
        {
          icon: '📤',
          label: '앱 공유하기',
          type: 'nav',
          onPress: () => Alert.alert('앱 공유', '스토어 링크가 클립보드에 복사되었습니다!\n\n(실제 앱에서는 공유 기능이 작동합니다)')
        },
        {
          icon: '📄',
          label: '이용약관',
          type: 'nav',
          onPress: () => (navigation as any).navigate('TermsOfService')
        },
        {
          icon: '🔐',
          label: '개인정보 처리방침',
          type: 'nav',
          onPress: () => (navigation as any).navigate('PrivacyPolicy')
        },
        {
          icon: 'ℹ️',
          label: '버전 정보',
          value: 'v3.0.0',
          type: 'nav',
          onPress: () => Alert.alert('버전 정보', 'Pumpy v3.0.0\n\n최신 버전입니다! 🎉')
        }
      ]
    }
  ]

  const renderSettingItem = (item: SettingsItem) => {
    if (item.type === 'switch') {
      return (
        <View key={item.label} style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>{item.icon}</Text>
            <Text style={styles.settingLabel}>{item.label}</Text>
          </View>
          <Switch
            value={item.value as boolean}
            onValueChange={() => item.onPress?.()}
            trackColor={{ false: '#e0e0e0', true: '#667eea' }}
            thumbColor={item.value ? '#white' : '#f4f3f4'}
          />
        </View>
      )
    }

    return (
      <TouchableOpacity
        key={item.label}
        style={styles.settingItem}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={styles.settingLeft}>
          <Text style={styles.settingIcon}>{item.icon}</Text>
          <Text style={styles.settingLabel}>{item.label}</Text>
        </View>
        <View style={styles.settingRight}>
          {item.value && typeof item.value === 'string' && (
            <Text style={styles.settingValue}>{item.value}</Text>
          )}
          <Text style={styles.settingArrow}>›</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Settings List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {settingsGroups.map((group) => (
          <View key={group.title} style={styles.settingGroup}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.settingCard}>
              {group.items.map((item, index) => (
                <View key={item.label}>
                  {renderSettingItem(item)}
                  {index < group.items.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Pumpy. All rights reserved.</Text>
          <Text style={styles.footerSubtext}>Made with 💪 for fitness enthusiasts</Text>
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
    fontSize: 22,
    fontWeight: '900',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  settingGroup: { marginBottom: 30 },
  groupTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
    marginLeft: 5
  },
  settingCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    minHeight: 60
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingIcon: { fontSize: 24, marginRight: 14 },
  settingLabel: { fontSize: 15, fontWeight: '600', color: '#333', flex: 1 },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingValue: { fontSize: 14, color: '#999', fontWeight: '600' },
  settingArrow: { fontSize: 24, color: '#ccc', fontWeight: '300' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginLeft: 56 },
  footer: {
    alignItems: 'center',
    paddingVertical: 30
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    marginBottom: 6
  },
  footerSubtext: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500'
  }
})

