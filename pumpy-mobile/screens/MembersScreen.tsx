import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  status: string;
  current_plan_name?: string;
  expiry_date?: string;
}

export default function MembersScreen() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, searchQuery, filterStatus]);

  const loadMembers = async () => {
    try {
      const serverUrl = await AsyncStorage.getItem('serverUrl');
      if (!serverUrl) return;

      const apiUrl = serverUrl.replace(':3000', ':8000') + '/api';
      const response = await axios.get<Member[]>(`${apiUrl}/members/`);
      setMembers(response.data);
    } catch (error) {
      console.error('Members load failed:', error);
      Alert.alert('오류', '회원 목록을 불러올 수 없습니다');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterMembers = () => {
    let filtered = members;

    // 상태 필터
    if (filterStatus !== 'all') {
      filtered = filtered.filter((m) => m.status === filterStatus);
    }

    // 검색 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.first_name?.toLowerCase().includes(query) ||
          m.last_name?.toLowerCase().includes(query) ||
          m.phone?.includes(query) ||
          m.email?.toLowerCase().includes(query)
      );
    }

    setFilteredMembers(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMembers();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#48bb78';
      case 'paused':
        return '#ed8936';
      case 'cancelled':
        return '#f56565';
      case 'pending':
        return '#667eea';
      default:
        return '#999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '활성';
      case 'paused':
        return '일시정지';
      case 'cancelled':
        return '해지';
      case 'pending':
        return '승인대기';
      default:
        return status;
    }
  };

  const renderMember = ({ item }: { item: Member }) => (
    <TouchableOpacity style={styles.memberCard}>
      <View style={styles.memberAvatar}>
        <Text style={styles.avatarText}>
          {item.first_name?.[0] || '?'}
        </Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>
          {item.first_name} {item.last_name}
        </Text>
        <Text style={styles.memberPhone}>{item.phone}</Text>
        {item.current_plan_name && (
          <Text style={styles.memberPlan}>📦 {item.current_plan_name}</Text>
        )}
        {item.expiry_date && (
          <Text style={styles.memberExpiry}>
            📅 만료: {item.expiry_date}
          </Text>
        )}
      </View>
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) },
        ]}
      >
        <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text>로딩 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 검색 바 */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="이름, 전화번호 검색"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* 필터 버튼 */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterStatus === 'all' && styles.filterButtonActive,
          ]}
          onPress={() => setFilterStatus('all')}
        >
          <Text
            style={[
              styles.filterText,
              filterStatus === 'all' && styles.filterTextActive,
            ]}
          >
            전체
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterStatus === 'active' && styles.filterButtonActive,
          ]}
          onPress={() => setFilterStatus('active')}
        >
          <Text
            style={[
              styles.filterText,
              filterStatus === 'active' && styles.filterTextActive,
            ]}
          >
            활성
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterStatus === 'paused' && styles.filterButtonActive,
          ]}
          onPress={() => setFilterStatus('paused')}
        >
          <Text
            style={[
              styles.filterText,
              filterStatus === 'paused' && styles.filterTextActive,
            ]}
          >
            일시정지
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterStatus === 'cancelled' && styles.filterButtonActive,
          ]}
          onPress={() => setFilterStatus('cancelled')}
        >
          <Text
            style={[
              styles.filterText,
              filterStatus === 'cancelled' && styles.filterTextActive,
            ]}
          >
            해지
          </Text>
        </TouchableOpacity>
      </View>

      {/* 회원 목록 */}
      <FlatList
        data={filteredMembers}
        renderItem={renderMember}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>회원이 없습니다</Text>
          </View>
        }
      />
    </View>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 10,
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginBottom: 10,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  memberCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 10,
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  memberPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  memberPlan: {
    fontSize: 13,
    color: '#667eea',
    marginBottom: 2,
  },
  memberExpiry: {
    fontSize: 13,
    color: '#ed8936',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});







