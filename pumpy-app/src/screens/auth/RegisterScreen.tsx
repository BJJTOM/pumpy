import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Modal } from 'react-native'
import { authAPI, setToken } from '../../../services/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Checkbox from 'expo-checkbox'
import { LinearGradient } from 'expo-linear-gradient'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/RootNavigator'

type Props = NativeStackScreenProps<RootStackParamList, 'Register'> & {
  onRegisterSuccess?: (token: string) => void
}

const TERMS_DATA = {
  terms: {
    title: '이용약관',
    content: `제1조 (목적)
본 약관은 펌피(이하 "회사")가 제공하는 피트니스 서비스의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (정의)
1. "서비스"란 회사가 제공하는 피트니스 센터 이용 및 관련 부가 서비스를 의미합니다.
2. "회원"이란 본 약관에 동의하고 회사와 서비스 이용계약을 체결한 자를 의미합니다.
...`
  },
  privacy: {
    title: '개인정보 처리방침',
    content: `펌피는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보 처리방침을 수립·공개합니다.

제1조 (개인정보의 처리 목적)
회사는 다음의 목적을 위하여 개인정보를 처리합니다:
1. 회원 가입 및 관리
2. 서비스 제공
...`
  },
  marketing: {
    title: '마케팅 정보 수신 동의',
    content: `펌피는 회원님께 다양한 혜택과 이벤트 정보를 제공하기 위해 마케팅 정보 수신 동의를 받고 있습니다.

제1조 (수집 목적)
1. 신규 서비스 안내
2. 이벤트 및 프로모션 정보 제공
...`
  }
}

export default function RegisterScreen({ navigation, onRegisterSuccess }: Props) {
  // Step management
  const [currentStep, setCurrentStep] = useState(1)
  
  // Form data (웹과 완전히 동일하게)
  const [formData, setFormData] = useState({
    // 기본 정보 (Step 1)
    email: '',
    password: '',
    passwordConfirm: '',
    lastName: '',
    firstName: '',
    phone: '',
    
    // 상세 정보 (Step 2)
    birthDate: '',
    gender: '',
    address: '',
    emergencyContact: '',
    emergencyContactRelation: '',
    height: '',
    weight: '',
    bloodType: '',
    medicalNotes: '',
    currentLevel: '초보',
    ageGroup: '일반부',
    notes: ''
  })
  
  // Agreements
  const [agreements, setAgreements] = useState({
    all: false,
    terms: false,
    privacy: false,
    marketing: false
  })
  
  // States
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [modalOpen, setModalOpen] = useState<'terms' | 'privacy' | 'marketing' | null>(null)
  
  // Phone verification
  const [phoneVerification, setPhoneVerification] = useState({
    code: '',
    sent: false,
    verified: false,
    serverCode: '',
    timer: 180
  })
  
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval)
      }
    }
  }, [timerInterval])

  const handleAllAgreement = (checked: boolean) => {
    setAgreements({
      all: checked,
      terms: checked,
      privacy: checked,
      marketing: checked
    })
  }

  const handleAgreement = (key: 'terms' | 'privacy' | 'marketing', checked: boolean) => {
    const newAgreements = { ...agreements, [key]: checked }
    newAgreements.all = newAgreements.terms && newAgreements.privacy && newAgreements.marketing
    setAgreements(newAgreements)
  }

  const sendVerificationCode = () => {
    if (!formData.phone.trim()) {
      Alert.alert('오류', '전화번호를 입력해주세요.')
      return
    }
    
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString()
    setPhoneVerification({
      ...phoneVerification,
      sent: true,
      serverCode: generatedCode,
      timer: 180
    })
    
    Alert.alert('인증번호 발송', `인증번호: ${generatedCode}\n(실제 서비스에서는 SMS로 전송됩니다)`)
    
    if (timerInterval) clearInterval(timerInterval)
    
    const interval = setInterval(() => {
      setPhoneVerification(prev => {
        if (prev.timer <= 1) {
          clearInterval(interval)
          return { ...prev, timer: 0, sent: false }
        }
        return { ...prev, timer: prev.timer - 1 }
      })
    }, 1000)
    
    setTimerInterval(interval)
  }

  const verifyCode = () => {
    if (phoneVerification.code === phoneVerification.serverCode) {
      setPhoneVerification({ ...phoneVerification, verified: true })
      if (timerInterval) clearInterval(timerInterval)
      Alert.alert('인증 성공', '전화번호 인증이 완료되었습니다.')
    } else {
      Alert.alert('인증 실패', '인증번호가 일치하지 않습니다.')
    }
  }

  const validateStep1 = () => {
    if (!formData.lastName.trim() || !formData.firstName.trim()) {
      Alert.alert('오류', '성과 이름을 입력해주세요.')
      return false
    }
    if (!formData.phone.trim()) {
      Alert.alert('오류', '전화번호를 입력해주세요.')
      return false
    }
    if (!phoneVerification.verified) {
      Alert.alert('오류', '전화번호 인증을 완료해주세요.')
      return false
    }
    if (!formData.email.trim()) {
      Alert.alert('오류', '이메일을 입력해주세요.')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      Alert.alert('오류', '올바른 이메일 형식을 입력해주세요.')
      return false
    }
    if (!formData.password.trim() || formData.password.length < 6) {
      Alert.alert('오류', '비밀번호는 최소 6자 이상이어야 합니다.')
      return false
    }
    if (formData.password !== formData.passwordConfirm) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.birthDate) {
      Alert.alert('오류', '생년월일을 입력해주세요.')
      return false
    }
    if (!formData.gender) {
      Alert.alert('오류', '성별을 선택해주세요.')
      return false
    }
    return true
  }

  const validateStep3 = () => {
    if (!agreements.terms || !agreements.privacy) {
      Alert.alert('오류', '필수 약관에 동의해주세요.')
      return false
    }
    return true
  }

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2)
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3)
      }
    } else if (currentStep === 3) {
      if (validateStep3()) {
        handleRegister()
      }
    }
  }

  const handleRegister = async () => {
    setLoading(true)
    try {
      const res = await authAPI.register({
        // 기본 정보
        email: formData.email.trim(),
        password: formData.password,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        phone: formData.phone.trim(),
        
        // 상세 정보 (웹과 동일)
        birth_date: formData.birthDate || null,
        gender: formData.gender || '',
        address: formData.address.trim() || '',
        emergency_contact: formData.emergencyContact.trim() || '',
        emergency_contact_relation: formData.emergencyContactRelation.trim() || '',
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        blood_type: formData.bloodType || '',
        medical_notes: formData.medicalNotes || '',
        current_level: formData.currentLevel || '초보',
        age_group: formData.ageGroup || '일반부',
        notes: formData.notes || '',
        
        // 약관 동의
        terms_agreed: agreements.terms,
        privacy_agreed: agreements.privacy,
        marketing_agreed: agreements.marketing,
        terms_agreed_date: agreements.terms ? new Date().toISOString() : null,
        privacy_agreed_date: agreements.privacy ? new Date().toISOString() : null,
        marketing_agreed_date: agreements.marketing ? new Date().toISOString() : null,
        
        // 기타
        status: 'pending',
        phone_verified: phoneVerification.verified,
        email_verified: false,
        join_date: new Date().toISOString().split('T')[0]
      })

      if (res.data?.token && res.data?.user) {
        await setToken(res.data.token)
        await AsyncStorage.setItem('currentUser', JSON.stringify(res.data.user))
        Alert.alert(
          '회원가입 성공',
          `${res.data.user.last_name}${res.data.user.first_name}님 환영합니다!\n\n회원번호: ${res.data.user.id}\n\n관리자 승인 후 모든 기능을 이용하실 수 있습니다.`
        )
        if (onRegisterSuccess) {
          onRegisterSuccess(res.data.token)
        } else {
          navigation.replace('Tabs')
        }
      } else {
        Alert.alert('오류', '회원가입 응답이 올바르지 않습니다.')
      }
    } catch (e: any) {
      console.error('Register Error:', e.response?.data || e.message)
      const msg = e.response?.data?.error || e.response?.data?.email?.[0] || e.message || '회원가입 실패'
      Alert.alert('회원가입 실패', msg)
    } finally {
      setLoading(false)
    }
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>💪</Text>
          <Text style={styles.headerTitle}>펌피 회원 신청</Text>
          <Text style={styles.headerSubtitle}>체육관 회원 등록을 시작합니다</Text>
        </View>

        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          {[1, 2, 3].map(step => (
            <View key={step} style={styles.stepItem}>
              <View style={[styles.stepCircle, currentStep >= step && styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, currentStep >= step && styles.stepNumberActive]}>{step}</Text>
              </View>
              <Text style={[styles.stepLabel, currentStep >= step && styles.stepLabelActive]}>
                {step === 1 ? '기본 정보' : step === 2 ? '상세 정보' : '약관 동의'}
              </Text>
            </View>
          ))}
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <>
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>성 <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="홍"
                    value={formData.lastName}
                    onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>이름 <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="길동"
                    value={formData.firstName}
                    onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>전화번호 <Text style={styles.required}>*</Text></Text>
                <View style={styles.phoneRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="010-1234-5678"
                    keyboardType="phone-pad"
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    editable={!phoneVerification.verified}
                  />
                  <TouchableOpacity
                    style={[styles.verifyButton, phoneVerification.verified && styles.verifyButtonDisabled]}
                    onPress={sendVerificationCode}
                    disabled={phoneVerification.verified}
                  >
                    <Text style={styles.verifyButtonText}>
                      {phoneVerification.verified ? '인증완료' : '인증'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {phoneVerification.sent && !phoneVerification.verified && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>인증번호</Text>
                  <View style={styles.phoneRow}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="인증번호 6자리"
                      keyboardType="number-pad"
                      value={phoneVerification.code}
                      onChangeText={(text) => setPhoneVerification({ ...phoneVerification, code: text })}
                    />
                    <TouchableOpacity style={styles.verifyButton} onPress={verifyCode}>
                      <Text style={styles.verifyButtonText}>확인</Text>
                    </TouchableOpacity>
                  </View>
                  {phoneVerification.timer > 0 && (
                    <Text style={styles.timerText}>{formatTimer(phoneVerification.timer)} 남음</Text>
                  )}
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>이메일 <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="example@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>비밀번호 <Text style={styles.required}>* (최소 6자)</Text></Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="******"
                    secureTextEntry={!showPassword}
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    <Text>{showPassword ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>비밀번호 확인 <Text style={styles.required}>*</Text></Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="******"
                    secureTextEntry={!showPasswordConfirm}
                    value={formData.passwordConfirm}
                    onChangeText={(text) => setFormData({ ...formData, passwordConfirm: text })}
                  />
                  <TouchableOpacity onPress={() => setShowPasswordConfirm(!showPasswordConfirm)} style={styles.eyeButton}>
                    <Text>{showPasswordConfirm ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {/* Step 2: Detailed Info (웹과 100% 동일) */}
          {currentStep === 2 && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>생년월일 <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={formData.birthDate}
                  onChangeText={(text) => setFormData({ ...formData, birthDate: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>성별 <Text style={styles.required}>*</Text></Text>
                <View style={styles.genderRow}>
                  {[{ id: '남', label: '남성' }, { id: '여', label: '여성' }, { id: '기타', label: '기타' }].map(g => (
                    <TouchableOpacity
                      key={g.id}
                      style={[styles.genderButton, formData.gender === g.id && styles.genderButtonActive]}
                      onPress={() => setFormData({ ...formData, gender: g.id })}
                    >
                      <Text style={[styles.genderButtonText, formData.gender === g.id && styles.genderButtonTextActive]}>
                        {g.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>주소</Text>
                <TextInput
                  style={styles.input}
                  placeholder="서울시 강남구..."
                  value={formData.address}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 2, marginRight: 8 }]}>
                  <Text style={styles.label}>긴급 연락처</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="010-9876-5432"
                    keyboardType="phone-pad"
                    value={formData.emergencyContact}
                    onChangeText={(text) => setFormData({ ...formData, emergencyContact: text })}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>관계</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="부모, 배우자 등"
                    value={formData.emergencyContactRelation}
                    onChangeText={(text) => setFormData({ ...formData, emergencyContactRelation: text })}
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 4 }]}>
                  <Text style={styles.label}>신장 (cm)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="175"
                    keyboardType="numeric"
                    value={formData.height}
                    onChangeText={(text) => setFormData({ ...formData, height: text })}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginHorizontal: 4 }]}>
                  <Text style={styles.label}>체중 (kg)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="70"
                    keyboardType="numeric"
                    value={formData.weight}
                    onChangeText={(text) => setFormData({ ...formData, weight: text })}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 4 }]}>
                  <Text style={styles.label}>혈액형</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="A형"
                    value={formData.bloodType}
                    onChangeText={(text) => setFormData({ ...formData, bloodType: text })}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>현재 레벨</Text>
                <View style={styles.genderRow}>
                  {['초보', '중급', '고급'].map(level => (
                    <TouchableOpacity
                      key={level}
                      style={[styles.genderButton, formData.currentLevel === level && styles.genderButtonActive]}
                      onPress={() => setFormData({ ...formData, currentLevel: level })}
                    >
                      <Text style={[styles.genderButtonText, formData.currentLevel === level && styles.genderButtonTextActive]}>
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>연령대</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {['유치부', '초등부', '중등부', '고등부', '대학부', '일반부'].map(age => (
                    <TouchableOpacity
                      key={age}
                      style={[styles.ageButton, formData.ageGroup === age && styles.genderButtonActive, { flex: 0, minWidth: '30%' }]}
                      onPress={() => setFormData({ ...formData, ageGroup: age })}
                    >
                      <Text style={[styles.ageButtonText, formData.ageGroup === age && styles.genderButtonTextActive]}>
                        {age}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>건강 특이사항</Text>
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                  placeholder="건강상 특이사항이 있으면 적어주세요"
                  multiline
                  numberOfLines={3}
                  value={formData.medicalNotes}
                  onChangeText={(text) => setFormData({ ...formData, medicalNotes: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>특이사항 / 문의사항</Text>
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                  placeholder="기타 문의사항이 있으시면 적어주세요"
                  multiline
                  numberOfLines={3}
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                />
              </View>
            </>
          )}

          {/* Step 3: Agreements */}
          {currentStep === 3 && (
            <>
              <TouchableOpacity style={styles.agreementRow} onPress={() => handleAllAgreement(!agreements.all)}>
                <Checkbox value={agreements.all} onValueChange={handleAllAgreement} color={agreements.all ? '#4facfe' : undefined} />
                <Text style={styles.agreementText}>전체 동의</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <View style={styles.agreementRow}>
                <Checkbox value={agreements.terms} onValueChange={(checked) => handleAgreement('terms', checked)} color={agreements.terms ? '#4facfe' : undefined} />
                <Text style={styles.agreementText}>이용약관 동의 <Text style={styles.required}>(필수)</Text></Text>
                <TouchableOpacity onPress={() => setModalOpen('terms')}>
                  <Text style={styles.viewLink}>보기</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.agreementRow}>
                <Checkbox value={agreements.privacy} onValueChange={(checked) => handleAgreement('privacy', checked)} color={agreements.privacy ? '#4facfe' : undefined} />
                <Text style={styles.agreementText}>개인정보 처리방침 <Text style={styles.required}>(필수)</Text></Text>
                <TouchableOpacity onPress={() => setModalOpen('privacy')}>
                  <Text style={styles.viewLink}>보기</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.agreementRow}>
                <Checkbox value={agreements.marketing} onValueChange={(checked) => handleAgreement('marketing', checked)} color={agreements.marketing ? '#4facfe' : undefined} />
                <Text style={styles.agreementText}>마케팅 정보 수신 동의 (선택)</Text>
                <TouchableOpacity onPress={() => setModalOpen('marketing')}>
                  <Text style={styles.viewLink}>보기</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Navigation Buttons */}
          <View style={styles.buttonRow}>
            {currentStep > 1 && (
              <TouchableOpacity style={[styles.navButton, styles.backButton]} onPress={() => setCurrentStep(currentStep - 1)}>
                <Text style={styles.backButtonText}>이전</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.navButton, styles.nextButton, currentStep > 1 && { flex: 1 }]} onPress={handleNextStep} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.nextButtonText}>{currentStep === 3 ? '가입 완료 →' : '다음 단계 →'}</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>이미 회원이신가요? 로그인</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Terms Modal */}
      <Modal visible={modalOpen !== null} transparent animationType="slide" onRequestClose={() => setModalOpen(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalOpen && TERMS_DATA[modalOpen].title}</Text>
            <ScrollView style={styles.modalScrollView}>
              <Text style={styles.modalText}>{modalOpen && TERMS_DATA[modalOpen].content}</Text>
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalOpen(null)}>
              <Text style={styles.modalCloseText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingVertical: 40, paddingHorizontal: 20 },
  header: { alignItems: 'center', marginBottom: 30 },
  headerEmoji: { fontSize: 60, marginBottom: 15 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: 'white', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10, marginBottom: 8 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  stepIndicator: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 30 },
  stepItem: { alignItems: 'center', flex: 1 },
  stepCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  stepCircleActive: { backgroundColor: 'white' },
  stepNumber: { fontSize: 16, fontWeight: '800', color: 'rgba(255,255,255,0.7)' },
  stepNumberActive: { color: '#4facfe' },
  stepLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  stepLabelActive: { color: 'white', fontWeight: '800' },
  formCard: { backgroundColor: 'white', borderRadius: 25, padding: 25 },
  inputGroup: { marginBottom: 20 },
  inputRow: { flexDirection: 'row', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8 },
  required: { color: '#ef4444' },
  input: { backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#333', borderWidth: 2, borderColor: '#e5e7eb' },
  phoneRow: { flexDirection: 'row', gap: 8 },
  verifyButton: { backgroundColor: '#4facfe', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, justifyContent: 'center' },
  verifyButtonDisabled: { backgroundColor: '#10b981' },
  verifyButtonText: { color: 'white', fontWeight: '700', fontSize: 14 },
  timerText: { fontSize: 12, color: '#ef4444', marginTop: 6, fontWeight: '600' },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeButton: { padding: 14 },
  genderRow: { flexDirection: 'row', gap: 8 },
  genderButton: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 2, borderColor: '#e5e7eb' },
  genderButtonActive: { backgroundColor: '#e0f2fe', borderColor: '#4facfe' },
  genderButtonText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  genderButtonTextActive: { color: '#4facfe', fontWeight: '800' },
  ageButton: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center', borderWidth: 2, borderColor: '#e5e7eb', marginRight: 6 },
  ageButtonText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  agreementRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 },
  agreementText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#374151' },
  viewLink: { color: '#4facfe', fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },
  divider: { height: 2, backgroundColor: '#e5e7eb', marginVertical: 15 },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  navButton: { borderRadius: 15, paddingVertical: 16, alignItems: 'center' },
  backButton: { flex: 0.4, backgroundColor: '#e5e7eb' },
  backButtonText: { color: '#6b7280', fontSize: 16, fontWeight: '800' },
  nextButton: { flex: 1, backgroundColor: '#4facfe' },
  nextButtonText: { color: 'white', fontSize: 16, fontWeight: '900' },
  loginLink: { textAlign: 'center', color: '#4facfe', fontSize: 14, fontWeight: '700', marginTop: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', maxHeight: '80%', backgroundColor: 'white', borderRadius: 25, padding: 25 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 15, color: '#333' },
  modalScrollView: { maxHeight: 400, marginBottom: 15 },
  modalText: { fontSize: 14, lineHeight: 22, color: '#555' },
  modalCloseButton: { backgroundColor: '#4facfe', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalCloseText: { color: 'white', fontSize: 16, fontWeight: '800' },
})
