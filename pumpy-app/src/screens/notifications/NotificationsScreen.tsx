import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native'
import { api } from '../../../services/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

type Notification = {
  id: number
  type: string
  message: string
  post?: number
  is_read: boolean
  created_at: string
}

export default function NotificationsScreen() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    loadUserAndNotifications()
  }, [])

  const loadUserAndNotifications = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        setCurrentUser(user)
        await loadNotifications(user.id)
      }
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error)
      setLoading(false)
    }
  }

  const loadNotifications = async (userId: number) => {
    try {
      const res = await api.get(`/notifications/?recipient=${userId}`)
      setNotifications(res.data)
    } catch (error) {
      console.error('알림 로드 실패:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    if (currentUser) {
      setRefreshing(true)
      loadNotifications(currentUser.id)
    }
  }

  const handleNotificationPress = async (notification: Notification) => {
    try {
      if (!notification.is_read) {
        await api.patch(`/notifications/${notification.id}/`, { is_read: true })
        // Update local state
        setNotifications(prev =>
          prev.map(n => (n.id === notification.id ? { ...n, is_read: true } : n))
        )
      }
      // TODO: Navigate to related post/content
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!currentUser) return
    try {
      await api.post('/notifications/mark_all_read/', { recipient_id: currentUser.id })
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (error) {
      console.error('전체 읽음 처리 실패:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '방금 전'
    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`

    return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return '❤️'
      case 'comment':
        return '💬'
      case 'mention':
        return '📢'
      case 'system':
        return '⚙️'
      default:
        return '🔔'
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    )
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>알림</Text>
          {unreadCount > 0 && (
            <Text style={styles.unreadCount}>읽지 않은 알림 {unreadCount}개</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
            <Text style={styles.markAllText}>모두 읽음</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        keyExtractor={item => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.notificationCard, !item.is_read && styles.notificationUnread]}
            onPress={() => handleNotificationPress(item)}
          >
            <View style={styles.notificationIcon}>
              <Text style={{ fontSize: 28 }}>{getNotificationIcon(item.type)}</Text>
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationMessage}>{item.message}</Text>
              <Text style={styles.notificationDate}>{formatDate(item.created_at)}</Text>
            </View>
            {!item.is_read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 60, marginBottom: 16 }}>🔔</Text>
            <Text style={styles.emptyText}>알림이 없습니다</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
    marginBottom: 4,
  },
  unreadCount: {
    fontSize: 13,
    color: '#667eea',
    fontWeight: '700',
  },
  markAllButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  markAllText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 13,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationUnread: {
    backgroundColor: '#667eea05',
  },
  notificationIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f5f7fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationDate: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#667eea',
    marginLeft: 8,
  },
  empty: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
  },
})
