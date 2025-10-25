import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function SignupScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // 필수 입력 검증
    if (!formData.first_name || !formData.last_name || !formData.phone) {
      Alert.alert('입력 오류', '이름과 전화번호는 필수 입력 항목입니다');
      return;
    }

    if (!termsAgreed || !privacyAgreed) {
      Alert.alert('약관 동의', '필수 약관에 동의해주세요');
      return;
    }

    setLoading(true);

    try {
      const serverUrl = await AsyncStorage.getItem('serverUrl');
      if (!serverUrl) {
        Alert.alert('오류', '서버 설정이 필요합니다');
        return;
      }

      const apiUrl = serverUrl.replace(':3000', ':8000') + '/api';
      
      await axios.post(`${apiUrl}/members/`, {
        ...formData,
        status: 'pending',
        terms_agreed: termsAgreed,
        privacy_agreed: privacyAgreed,
      });

      Alert.alert(
        '신청 완료',
        '회원 신청이 완료되었습니다.\n관리자 승인 후 이용 가능합니다.',
        [
          {
            text: '확인',
            onPress: () => {
              // 폼 초기화
              setFormData({
                first_name: '',
                last_name: '',
                phone: '',
                email: '',
                address: '',
                notes: '',
              });
              setTermsAgreed(false);
              setPrivacyAgreed(false);
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Signup failed:', error);
      Alert.alert('오류', '회원 신청 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🏋️</Text>
        <Text style={styles.headerTitle}>펌피 회원 신청</Text>
        <Text style={styles.headerSubtitle}>
          간편하게 신청하고 관리자 승인을 기다려주세요
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            이름 <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={formData.first_name}
            onChangeText={(text) =>
              setFormData({ ...formData, first_name: text })
            }
            placeholder="홍길동"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            성 <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={formData.last_name}
            onChangeText={(text) =>
              setFormData({ ...formData, last_name: text })
            }
            placeholder="김"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            전화번호 <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) =>
              setFormData({ ...formData, phone: text })
            }
            placeholder="010-1234-5678"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>이메일</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) =>
              setFormData({ ...formData, email: text })
            }
            placeholder="example@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>주소</Text>
          <TextInput
            style={styles.input}
            value={formData.address}
            onChangeText={(text) =>
              setFormData({ ...formData, address: text })
            }
            placeholder="서울시 강남구..."
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>메모 (선택)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(text) =>
              setFormData({ ...formData, notes: text })
            }
            placeholder="문의사항이나 특이사항을 적어주세요"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* 약관 동의 */}
        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>약관 동의</Text>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setTermsAgreed(!termsAgreed)}
          >
            <Ionicons
              name={termsAgreed ? 'checkbox' : 'square-outline'}
              size={24}
              color={termsAgreed ? '#667eea' : '#999'}
            />
            <Text style={styles.checkboxLabel}>
              <Text style={styles.required}>*</Text> 이용약관 동의
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setPrivacyAgreed(!privacyAgreed)}
          >
            <Ionicons
              name={privacyAgreed ? 'checkbox' : 'square-outline'}
              size={24}
              color={privacyAgreed ? '#667eea' : '#999'}
            />
            <Text style={styles.checkboxLabel}>
              <Text style={styles.required}>*</Text> 개인정보 처리방침 동의
            </Text>
          </TouchableOpacity>
        </View>

        {/* 제출 버튼 */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>신청하기</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          신청 후 관리자 승인이 완료되면{'\n'}
          이용 가능합니다. (보통 1~2일 소요)
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 24,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#f56565',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  termsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  termsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerNote: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
});







