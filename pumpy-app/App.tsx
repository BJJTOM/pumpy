import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, memberAPI, membershipAPI } from './services/api';

const Tab = createBottomTabNavigator();

// 로그인 화면
function LoginScreen({ navigation, onLogin }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      // 간단한 로그인 시뮬레이션 (실제로는 JWT 토큰 사용)
      const response = await memberAPI.getProfile(1); // 임시로 ID 1 사용
      await AsyncStorage.setItem('currentUser', JSON.stringify(response.data));
      onLogin(response.data);
    } catch (error) {
      Alert.alert('로그인 실패', '이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginBox}>
        <Text style={styles.logo}>💪</Text>
        <Text style={styles.title}>펌피</Text>
        <Text style={styles.subtitle}>체육관 관리 시스템</Text>

        <TextInput
          style={styles.input}
          placeholder="이메일"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '로그인 중...' : '로그인'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 홈 화면
function HomeScreen({ user }: any) {
  const [stats, setStats] = useState({
    attendance: 0,
    level: 1,
    points: 0
  });

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const response = await memberAPI.getAttendance(user.id);
      setStats({
        attendance: response.data.length,
        level: Math.floor(response.data.length / 10) + 1,
        points: response.data.length * 10
      });
    } catch (error) {
      console.log('출석 로드 실패:', error);
    }
  };

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🥊 펌피</Text>
        <Text style={styles.headerSubtitle}>{user?.last_name}{user?.first_name}님 환영합니다!</Text>
      </View>

      {/* 캐릭터 카드 */}
      <View style={styles.card}>
        <Text style={styles.cardIcon}>🥊</Text>
        <Text style={styles.cardTitle}>나의 캐릭터</Text>
        <Text style={styles.levelText}>Lv. {stats.level}</Text>
      </View>

      {/* 통계 */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.attendance}</Text>
          <Text style={styles.statLabel}>출석</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.level}</Text>
          <Text style={styles.statLabel}>레벨</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.points}</Text>
          <Text style={styles.statLabel}>포인트</Text>
        </View>
      </View>

      {/* 빠른 메뉴 */}
      <View style={styles.quickMenu}>
        <TouchableOpacity style={styles.quickButton}>
          <Text style={styles.quickIcon}>📅</Text>
          <Text style={styles.quickText}>출석 체크</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickButton}>
          <Text style={styles.quickIcon}>💪</Text>
          <Text style={styles.quickText}>운동 기록</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickButton}>
          <Text style={styles.quickIcon}>🍎</Text>
          <Text style={styles.quickText}>식단</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// 프로필 화면
function ProfileScreen({ user, onLogout }: any) {
  return (
    <ScrollView style={styles.screen}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.first_name?.[0] || '?'}
          </Text>
        </View>
        <Text style={styles.profileName}>
          {user?.last_name}{user?.first_name}
        </Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
      </View>

      <View style={styles.menuList}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>🏋️</Text>
          <Text style={styles.menuText}>내 체육관 정보</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>💳</Text>
          <Text style={styles.menuText}>회원권 관리</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={styles.menuText}>설정</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, styles.logoutButton]}
          onPress={onLogout}
        >
          <Text style={styles.menuIcon}>🚪</Text>
          <Text style={[styles.menuText, styles.logoutText]}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// 메인 앱
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.log('인증 확인 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('currentUser');
    setUser(null);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#667eea',
          tabBarInactiveTintColor: '#999',
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="홈" 
          options={{ tabBarIcon: () => <Text>🏠</Text> }}
        >
          {() => <HomeScreen user={user} />}
        </Tab.Screen>
        
        <Tab.Screen 
          name="프로필" 
          options={{ tabBarIcon: () => <Text>👤</Text> }}
        >
          {() => <ProfileScreen user={user} onLogout={handleLogout} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBox: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#667eea',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  screen: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#667eea',
    padding: 24,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  levelText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#667eea',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#667eea',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
  quickMenu: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  quickButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  quickIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  profileHeader: {
    backgroundColor: '#667eea',
    padding: 40,
    paddingTop: 80,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#667eea',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  menuList: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#fee',
    marginTop: 20,
  },
  logoutText: {
    color: '#f44',
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
});
