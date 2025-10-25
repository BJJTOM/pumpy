import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen({ navigation }: any) {
  const [serverUrl, setServerUrl] = useState('');

  useEffect(() => {
    loadServerUrl();
  }, []);

  const loadServerUrl = async () => {
    const url = await AsyncStorage.getItem('serverUrl');
    if (url) {
      setServerUrl(url);
    }
  };

  const handleChangeServer = () => {
    Alert.alert(
      '서버 변경',
      '서버를 변경하시겠습니까?\n앱이 재시작됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '변경',
          onPress: async () => {
            await AsyncStorage.removeItem('serverUrl');
            // 앱 재시작이 필요하므로 알림만 표시
            Alert.alert('알림', '앱을 재시작해주세요');
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      '캐시 삭제',
      '캐시를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            Alert.alert('완료', '캐시가 삭제되었습니다');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>⚙️</Text>
        <Text style={styles.headerTitle}>설정</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>서버 설정</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>현재 서버</Text>
          <Text style={styles.infoValue}>{serverUrl || '설정 없음'}</Text>
        </View>
        <TouchableOpacity style={styles.menuItem} onPress={handleChangeServer}>
          <Ionicons name="server" size={24} color="#667eea" />
          <Text style={styles.menuText}>서버 변경</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>앱 정보</Text>
        <View style={styles.menuItem}>
          <Ionicons name="information-circle" size={24} color="#667eea" />
          <Text style={styles.menuText}>버전</Text>
          <Text style={styles.menuValue}>1.0.0</Text>
        </View>
        <TouchableOpacity style={styles.menuItem} onPress={handleClearCache}>
          <Ionicons name="trash" size={24} color="#ed8936" />
          <Text style={styles.menuText}>캐시 삭제</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>정보</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>펌피 (Pumpy) 관리자 앱</Text>
          <Text style={styles.infoBoxText}>
            체육관 회원 관리를 위한{'\n'}
            올인원 솔루션
          </Text>
          <Text style={styles.infoBoxFooter}>
            Made with ❤️ in Korea
          </Text>
        </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginLeft: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  infoCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  menuValue: {
    fontSize: 16,
    color: '#999',
  },
  infoBox: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoBoxTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoBoxText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  infoBoxFooter: {
    fontSize: 14,
    color: '#999',
  },
});







