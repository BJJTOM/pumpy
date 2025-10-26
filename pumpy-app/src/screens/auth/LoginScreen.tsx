import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Image, KeyboardAvoidingView, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authAPI, setToken, loadTokenFromStorage } from '../../../services/api'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/RootNavigator'

type Props = NativeStackScreenProps<RootStackParamList, 'Login'> & {
  onLoginSuccess?: (token: string) => void
}

// 테스트 계정 정보
const TEST_ACCOUNT = {
  email: 'test@pumpy.com',
  password: 'test1234'
}

export default function LoginScreen({ navigation, onLoginSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  // 자동 로그인 (토큰이 있으면 홈으로)
  useEffect(() => {
    (async () => {
      await loadTokenFromStorage()
      const stored = await AsyncStorage.getItem('userToken')
      if (stored) {
        navigation.replace('Tabs')
        return
      }
      setChecking(false)
    })()
  }, [navigation])

  const handleLogin = async () => {
    // 입력값이 비어있으면 테스트 계정으로 로그인
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()
    
    // 빈 문자열이면 테스트 계정 사용 (명시적 비교)
    const loginEmail = trimmedEmail === '' ? TEST_ACCOUNT.email : trimmedEmail
    const loginPassword = trimmedPassword === '' ? TEST_ACCOUNT.password : trimmedPassword
    
    // 디버깅: 실제 로그인 시도 정보 확인
    console.log('로그인 시도:', { 
      inputEmail: email, 
      inputPassword: password,
      loginEmail, 
      usingTestAccount: trimmedEmail === '' && trimmedPassword === ''
    })
    
    setLoading(true)
    try {
      const res = await authAPI.login(loginEmail, loginPassword)
      console.log('로그인 응답:', res.data)
      
      if (res.data?.user) {
        if (res.data?.token) {
          await setToken(res.data.token)
          await AsyncStorage.setItem('currentUser', JSON.stringify(res.data.user))
          if (onLoginSuccess) {
            onLoginSuccess(res.data.token)
          }
        }
        // 사용자 정보 저장 (홈에서 사용)
        try { 
          await AsyncStorage.setItem('user', JSON.stringify(res.data.user)) 
        } catch {}
        
        Alert.alert('로그인 성공', `${res.data.user.last_name}${res.data.user.first_name}님 환영합니다!`)
        
        if (!onLoginSuccess) {
          navigation.replace('Tabs')
        }
      } else {
        Alert.alert('오류', '로그인 응답이 올바르지 않습니다.')
      }
    } catch (e: any) {
      console.error('로그인 에러:', e)
      console.error('에러 상세:', e?.response?.data)
      const msg = e?.response?.data?.error || e?.response?.data?.message || '이메일 또는 비밀번호가 올바르지 않습니다.'
      Alert.alert('로그인 실패', msg)
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    )
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* 앱 아이콘 */}
          <View style={styles.iconContainer}>
            <Image 
              source={require('../../../assets/icon.png')} 
              style={styles.appIcon}
              resizeMode="contain"
            />
          </View>

          {/* 앱 이름 */}
          <Text style={styles.appName}>펌피</Text>
          <Text style={styles.subtitle}>나만의 피트니스 파트너</Text>

          {/* 로그인 카드 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>로그인</Text>

            {/* 이메일 입력 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>이메일</Text>
              <TextInput 
                placeholder="example@email.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address" 
                autoCapitalize="none" 
                value={email} 
                onChangeText={setEmail} 
                style={styles.input}
              />
            </View>

            {/* 비밀번호 입력 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>비밀번호</Text>
              <View style={styles.passwordContainer}>
                <TextInput 
                  placeholder="비밀번호를 입력하세요"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                  value={password} 
                  onChangeText={setPassword} 
                  style={styles.passwordInput}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Text style={{ fontSize: 18 }}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 비밀번호 찾기 */}
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>비밀번호를 잊으셨나요?</Text>
            </TouchableOpacity>

            {/* 테스트 계정 안내 */}
            {!email && !password && (
              <View style={styles.testAccountInfo}>
                <Text style={styles.testAccountText}>
                  💡 빈 칸으로 로그인하면 테스트 계정으로 체험할 수 있습니다
                </Text>
              </View>
            )}

            {/* 로그인 버튼 */}
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleLogin} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>로그인</Text>
              )}
            </TouchableOpacity>

            {/* 회원가입 링크 */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupQuestion}>아직 회원이 아니신가요?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
                <Text style={styles.signupLink}>회원가입하기</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 저작권 */}
          <Text style={styles.copyright}>© 2025 Pumpy. All rights reserved.</Text>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appIcon: {
    width: 100,
    height: 100,
    borderRadius: 25,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 40,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
    marginBottom: 25,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#333',
  },
  eyeButton: {
    padding: 12,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#667eea',
  },
  testAccountInfo: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  testAccountText: {
    fontSize: 13,
    color: '#1e40af',
    textAlign: 'center',
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 17,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  signupQuestion: {
    fontSize: 14,
    color: '#666',
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#667eea',
  },
  copyright: {
    marginTop: 30,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
})


