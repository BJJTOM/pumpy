import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface Stats {
  total_members: number;
  active_members: number;
  paused_members: number;
  cancelled_members: number;
  pending_members: number;
  expiring_7days: number;
  expiring_3days: number;
  expiring_1day: number;
  expired_members: number;
  attendance_rate: number;
  revenue_growth: number;
  renewal_rate: number;
  inactive_7days: number;
}

export default function DashboardScreen({ navigation }: any) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const serverUrl = await AsyncStorage.getItem('serverUrl');
      if (!serverUrl) return;

      const apiUrl = serverUrl.replace(':3000', ':8000') + '/api';
      const response = await axios.get(`${apiUrl}/members/dashboard_stats/`);
      setStats(response.data);
    } catch (error) {
      console.error('Dashboard data load failed:', error);
      Alert.alert('오류', '데이터를 불러올 수 없습니다');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text>로딩 중...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.loading}>
        <Text>데이터를 불러올 수 없습니다</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>펌피 대시보드</Text>
        <Text style={styles.headerSubtitle}>실시간 현황</Text>
      </View>

      {/* KPI 카드 */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { backgroundColor: '#667eea' }]}>
          <Ionicons name="people" size={32} color="white" />
          <Text style={styles.kpiValue}>{stats.total_members}</Text>
          <Text style={styles.kpiLabel}>총 회원</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: '#48bb78' }]}>
          <Ionicons name="checkmark-circle" size={32} color="white" />
          <Text style={styles.kpiValue}>{stats.active_members}</Text>
          <Text style={styles.kpiLabel}>활성 회원</Text>
        </View>
      </View>

      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { backgroundColor: '#ed8936' }]}>
          <Ionicons name="pause-circle" size={32} color="white" />
          <Text style={styles.kpiValue}>{stats.paused_members}</Text>
          <Text style={styles.kpiLabel}>일시정지</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: '#f56565' }]}>
          <Ionicons name="close-circle" size={32} color="white" />
          <Text style={styles.kpiValue}>{stats.cancelled_members}</Text>
          <Text style={styles.kpiLabel}>해지</Text>
        </View>
      </View>

      {/* 알림 */}
      {stats.pending_members > 0 && (
        <TouchableOpacity
          style={styles.alertCard}
          onPress={() => navigation.navigate('Pending')}
        >
          <Ionicons name="notifications" size={24} color="#ed8936" />
          <Text style={styles.alertText}>
            승인 대기 중인 회원이 {stats.pending_members}명 있습니다
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      )}

      {stats.expiring_7days > 0 && (
        <View style={styles.alertCard}>
          <Ionicons name="warning" size={24} color="#f56565" />
          <Text style={styles.alertText}>
            7일 내 만료 예정: {stats.expiring_7days}명
          </Text>
        </View>
      )}

      {stats.inactive_7days > 0 && (
        <View style={styles.alertCard}>
          <Ionicons name="alert-circle" size={24} color="#ed8936" />
          <Text style={styles.alertText}>
            7일 이상 미출석: {stats.inactive_7days}명
          </Text>
        </View>
      )}

      {/* 통계 */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>주요 지표</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>출석률</Text>
          <Text style={styles.statValue}>{stats.attendance_rate.toFixed(1)}%</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>매출 성장률</Text>
          <Text style={[styles.statValue, styles.positive]}>
            +{stats.revenue_growth.toFixed(1)}%
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>갱신율</Text>
          <Text style={styles.statValue}>{stats.renewal_rate.toFixed(1)}%</Text>
        </View>
      </View>

      {/* 빠른 액션 */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>빠른 액션</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Members')}
        >
          <Ionicons name="people" size={24} color="#667eea" />
          <Text style={styles.actionText}>회원 관리</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Signup')}
        >
          <Ionicons name="person-add" size={24} color="#667eea" />
          <Text style={styles.actionText}>회원 신청</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#667eea',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  kpiRow: {
    flexDirection: 'row',
    padding: 10,
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  kpiLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 10,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  alertText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  statsSection: {
    backgroundColor: 'white',
    margin: 10,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  positive: {
    color: '#48bb78',
  },
  quickActions: {
    backgroundColor: 'white',
    margin: 10,
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginTop: 8,
    gap: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

