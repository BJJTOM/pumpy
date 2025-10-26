import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';

export default function ServerConfigScreen({ navigation }: any) {
  const [serverUrl, setServerUrl] = useState('http://192.168.0.7:3000');
  const [loading, setLoading] = useState(false);

  const testConnection = async (url: string) => {
    try {
      const apiUrl = url.replace(':3000', ':8000') + '/api';
      const response = await axios.get(`${apiUrl}/members/`, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  };

  const handleSave = async () => {
    if (!serverUrl.startsWith('http://') && !serverUrl.startsWith('https://')) {
      Alert.alert('오류', 'URL은 http:// 또는 https://로 시작해야 합니다');
      return;
    }

    setLoading(true);

    const isConnected = await testConnection(serverUrl);

    if (isConnected) {
      await AsyncStorage.setItem('serverUrl', serverUrl);
      Alert.alert('성공', '서버 연결 성공!', [
        {
          text: '확인',
          onPress: () => navigation.replace('Main'),
        },
      ]);
    } else {
      Alert.alert(
        '연결 실패',
        '서버에 연결할 수 없습니다.\nURL과 서버 실행 상태를 확인하세요.'
      );
    }

    setLoading(false);
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>⚙️</Text>
        <Text style={styles.title}>서버 설정</Text>
        <Text style={styles.subtitle}>백엔드 서버 주소를 입력하세요</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>서버 URL</Text>
          <TextInput
            style={styles.input}
            value={serverUrl}
            onChangeText={setServerUrl}
            placeholder="http://192.168.0.10:3000"
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.hint}>예: http://172.30.1.44:3000</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#667eea" />
          ) : (
            <Text style={styles.buttonText}>저장 및 연결 테스트</Text>
          )}
        </TouchableOpacity>

        <View style={styles.helpBox}>
          <Text style={styles.helpTitle}>💡 서버 URL 찾는 방법</Text>
          <Text style={styles.helpText}>
            1. 컴퓨터에서 CMD 실행{'\n'}
            2. ipconfig 입력{'\n'}
            3. IPv4 주소 확인 (예: 172.30.1.44){'\n'}
            4. http://확인한IP:3000 입력
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  icon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  hint: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 16,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
});










