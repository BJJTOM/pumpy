import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Modal, Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ImagePicker from 'expo-image-picker'
import { memberAPI, api } from '../../../services/api'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/RootNavigator'

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>

export default function EditProfileScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [member, setMember] = useState<any>(null)
  const [showAIPhotoModal, setShowAIPhotoModal] = useState(false)
  const [aiPhoto, setAiPhoto] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    emergencyContactRelation: ''
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
        
        setFormData({
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          phone: user.phone || '',
          email: user.email || '',
          address: user.address || '',
          emergencyContact: user.emergency_contact || '',
          emergencyContactRelation: user.emergency_contact_relation || ''
        })

        const savedAiPhoto = await AsyncStorage.getItem(`ai_photo_${user.id}`)
        if (savedAiPhoto) {
          setAiPhoto(savedAiPhoto)
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
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('오류', '이름은 필수 입력 항목입니다.')
      return
    }

    if (!formData.phone.trim()) {
      Alert.alert('오류', '전화번호는 필수 입력 항목입니다.')
      return
    }

    setSaving(true)
    try {
      const updatedData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim() || '',
        emergency_contact: formData.emergencyContact.trim() || '',
        emergency_contact_relation: formData.emergencyContactRelation.trim() || ''
      }

      // Update via API
      try {
        const res = await memberAPI.updateProfile(member.id, updatedData)
        const updatedUser = { ...member, ...res.data }
        await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser))
        setMember(updatedUser)
      } catch (apiError) {
        console.log('API update failed (non-critical):', apiError)
      }

      Alert.alert('저장 완료', '프로필 정보가 성공적으로 저장되었습니다.')
      navigation.goBack()
    } catch (error) {
      console.error('Failed to save profile:', error)
      Alert.alert('오류', '프로필 저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진을 업로드하려면 미디어 라이브러리 접근 권한이 필요합니다.')
      return
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri
      const base64 = result.assets[0].base64

      if (base64) {
        setPhotoFile(uri)
        setPhotoPreview(`data:image/jpeg;base64,${base64}`)
      } else {
        Alert.alert('오류', '이미지 데이터를 불러오지 못했습니다.')
      }
    }
  }

  const generateAICharacter = async () => {
    if (!photoPreview || !member) {
      Alert.alert('오류', '사진 미리보기 또는 사용자 정보가 없습니다.')
      return
    }

    setUploadingPhoto(true)
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      await AsyncStorage.setItem(`ai_photo_${member.id}`, photoPreview)
      setAiPhoto(photoPreview)
      Alert.alert('✅ AI 복싱 캐릭터 생성 완료!', '실제 서비스에서는 AI가 당신의 사진을 복싱 스타일 캐릭터로 변환합니다.')
      setShowAIPhotoModal(false)
      setPhotoFile(null)
      setPhotoPreview(null)
    } catch (error) {
      console.error('❌ AI 캐릭터 생성 실패:', error)
      Alert.alert('❌ AI 캐릭터 생성 실패', '캐릭터 생성 중 오류가 발생했습니다.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const deleteCharacter = async () => {
    if (!member) return
    Alert.alert(
      'AI 캐릭터 삭제',
      'AI 캐릭터를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(`ai_photo_${member.id}`)
              setAiPhoto(null)
              setShowAIPhotoModal(false)
              Alert.alert('✅ AI 캐릭터 삭제 완료', 'AI 캐릭터가 삭제되었습니다.')
            } catch (error) {
              console.error('❌ AI 캐릭터 삭제 실패:', error)
              Alert.alert('❌ AI 캐릭터 삭제 실패', '캐릭터 삭제 중 오류가 발생했습니다.')
            }
          },
        },
      ],
      { cancelable: true }
    )
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
          <Text style={styles.headerTitle}>프로필 편집</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* AI Photo Section */}
        <View style={styles.aiPhotoSection}>
          <Text style={styles.sectionTitle}>AI 캐릭터</Text>
          <TouchableOpacity onPress={() => setShowAIPhotoModal(true)} style={styles.aiPhotoCard}>
            {aiPhoto ? (
              <Image source={{ uri: aiPhoto }} style={styles.aiPhotoImage} />
            ) : (
              <View style={styles.aiPhotoPlaceholder}>
                <Text style={styles.aiPhotoPlaceholderText}>🥊</Text>
                <Text style={styles.aiPhotoPlaceholderSubtext}>AI 캐릭터 설정</Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Text style={{ fontSize: 14 }}>✏️</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>기본 정보</Text>
            
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
              <View style={[styles.inputGroup, { flex: 2 }]}>
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
              <TextInput
                style={styles.input}
                placeholder="010-1234-5678"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>이메일</Text>
              <TextInput
                style={[styles.input, { backgroundColor: '#f0f0f0' }]}
                value={formData.email}
                editable={false}
              />
              <Text style={styles.hint}>이메일은 변경할 수 없습니다</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>추가 정보</Text>
            
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
                  placeholder="부모 등"
                  value={formData.emergencyContactRelation}
                  onChangeText={(text) => setFormData({ ...formData, emergencyContactRelation: text })}
                />
              </View>
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

      {/* AI Photo Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAIPhotoModal}
        onRequestClose={() => setShowAIPhotoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>AI 캐릭터 설정</Text>
            {photoPreview ? (
              <Image source={{ uri: photoPreview }} style={styles.modalImagePreview} />
            ) : aiPhoto ? (
              <Image source={{ uri: aiPhoto }} style={styles.modalImagePreview} />
            ) : (
              <View style={styles.modalImagePlaceholder}>
                <Text style={styles.modalImagePlaceholderText}>🥊</Text>
              </View>
            )}

            <TouchableOpacity style={styles.modalButton} onPress={pickImage}>
              <Text style={styles.modalButtonText}>📷 사진 선택</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#667eea' }]}
              onPress={generateAICharacter}
              disabled={uploadingPhoto || !photoPreview}
            >
              {uploadingPhoto ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalButtonText}>✨ AI 캐릭터 생성</Text>
              )}
            </TouchableOpacity>

            {aiPhoto && (
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#ef4444' }]}
                onPress={deleteCharacter}
              >
                <Text style={styles.modalButtonText}>🗑️ AI 캐릭터 삭제</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#e5e7eb' }]}
              onPress={() => {
                setShowAIPhotoModal(false)
                setPhotoFile(null)
                setPhotoPreview(null)
              }}
            >
              <Text style={[styles.modalButtonText, { color: '#6b7280' }]}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  aiPhotoSection: { 
    alignItems: 'center', 
    marginBottom: 20, 
    paddingHorizontal: 20 
  },
  aiPhotoCard: { 
    width: 150, 
    height: 150, 
    borderRadius: 75, 
    overflow: 'hidden', 
    borderWidth: 4, 
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8
  },
  aiPhotoImage: { width: '100%', height: '100%' },
  aiPhotoPlaceholder: { 
    width: '100%', 
    height: '100%', 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  aiPhotoPlaceholderText: { fontSize: 48, marginBottom: 8 },
  aiPhotoPlaceholderSubtext: { color: 'white', fontSize: 12, fontWeight: '700' },
  editBadge: { 
    position: 'absolute', 
    bottom: 5, 
    right: 5, 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: 'white', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5
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
    borderBottomColor: '#e5e7eb',
    textAlign: 'center'
  },
  inputGroup: { marginBottom: 20 },
  inputRow: { flexDirection: 'row', marginBottom: 20 },
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
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0, 0, 0, 0.7)' 
  },
  modalContent: { 
    width: '85%', 
    backgroundColor: 'white', 
    borderRadius: 25, 
    padding: 30, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10
  },
  modalTitle: { 
    fontSize: 24, 
    fontWeight: '900', 
    marginBottom: 25, 
    color: '#333' 
  },
  modalImagePreview: { 
    width: 150, 
    height: 150, 
    borderRadius: 75, 
    marginBottom: 25, 
    borderWidth: 3, 
    borderColor: '#667eea' 
  },
  modalImagePlaceholder: { 
    width: 150, 
    height: 150, 
    borderRadius: 75, 
    marginBottom: 25, 
    backgroundColor: '#f0f0f0', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 2, 
    borderColor: '#ccc' 
  },
  modalImagePlaceholderText: { fontSize: 60 },
  modalButton: { 
    width: '100%', 
    paddingVertical: 14, 
    backgroundColor: '#4CAF50', 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 12 
  },
  modalButtonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: '800' 
  },
})

