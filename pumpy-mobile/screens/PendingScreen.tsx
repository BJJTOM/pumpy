import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface PendingMember {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  notes?: string;
}

export default function PendingScreen() {
  const [members, setMembers] = useState<PendingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPendingMembers();
  }, []);

  const loadPendingMembers = async () => {
    try {
      const serverUrl = await AsyncStorage.getItem('serverUrl');
      if (!serverUrl) return;

      const apiUrl = serverUrl.replace(':3000', ':8000') + '/api';
      const response = await axios.get<PendingMember[]>(
        `${apiUrl}/members/pending/`
      );
      setMembers(response.data);
    } catch (error) {
      console.error('Pending members load failed:', error);
      Alert.alert('오류', '승인 대기 목록을 불러올 수 없습니다');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPendingMembers();
  };

  const handleApprove = async (id: number, name: string) => {
    Alert.alert(
      '회원 승인',
      `${name} 님을 승인하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '승인',
          onPress: async () => {
            try {
              const serverUrl = await AsyncStorage.getItem('serverUrl');
              if (!serverUrl) return;

              const apiUrl = serverUrl.replace(':3000', ':8000') + '/api';
              await axios.patch(`${apiUrl}/members/${id}/`, {
                status: 'active',
                is_approved: true,
              });
              
              Alert.alert('성공', '회원이 승인되었습니다');
              loadPendingMembers();
            } catch (error) {
              console.error('Approve failed:', error);
              Alert.alert('오류', '승인 처리 중 오류가 발생했습니다');
            }
          },
        },
      ]
    );
  };

  const handleReject = async (id: number, name: string) => {
    Alert.alert(
      '회원 거절',
      `${name} 님의 신청을 거절하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '거절',
          style: 'destructive',
          onPress: async () => {
            try {
              const serverUrl = await AsyncStorage.getItem('serverUrl');
              if (!serverUrl) return;

              const apiUrl = serverUrl.replace(':3000', ':8000') + '/api';
              await axios.delete(`${apiUrl}/members/${id}/`);
              
              Alert.alert('완료', '신청이 거절되었습니다');
              loadPendingMembers();
            } catch (error) {
              console.error('Reject failed:', error);
              Alert.alert('오류', '거절 처리 중 오류가 발생했습니다');
            }
          },
        },
      ]
    );
  };

  const renderMember = ({ item }: { item: PendingMember }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberAvatar}>
        <Text style={styles.avatarText}>
          {item.first_name?.[0] || '?'}
        </Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>
          {item.first_name} {item.last_name}
        </Text>
        <Text style={styles.memberPhone}>📱 {item.phone}</Text>
        {item.email && (
          <Text style={styles.memberEmail}>📧 {item.email}</Text>
        )}
        {item.notes && (
          <Text style={styles.memberNotes} numberOfLines={2}>
            💬 {item.notes}
          </Text>
        )}
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() =>
            handleApprove(item.id, `${item.first_name} ${item.last_name}`)
          }
        >
          <Ionicons name="checkmark" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() =>
            handleReject(item.id, `${item.first_name} ${item.last_name}`)
          }
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
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
      <View style={styles.header}>
        <Text style={styles.headerText}>
          승인 대기 중인 회원: {members.length}명
        </Text>
      </View>

      <FlatList
        data={members}
        renderItem={renderMember}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="checkmark-done-circle" size={64} color="#ccc" />
            <Text style={styles.emptyText}>승인 대기 중인 회원이 없습니다</Text>
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
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  memberCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 10,
    marginTop: 10,
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
  memberEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  memberNotes: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#48bb78',
  },
  rejectButton: {
    backgroundColor: '#f56565',
  },
  empty: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
});


