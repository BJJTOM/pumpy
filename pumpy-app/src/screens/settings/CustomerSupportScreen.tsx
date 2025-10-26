import React, { useState, useRef, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface SupportMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  status?: 'pending' | 'answered'
}

export default function CustomerSupportScreen() {
  const navigation = useNavigation()
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isAgentTyping, setIsAgentTyping] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)

  useEffect(() => {
    loadSupportHistory()
    sendWelcomeMessage()
  }, [])

  const loadSupportHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('support_history')
      if (history) {
        setMessages(JSON.parse(history))
      }
    } catch (error) {
      console.error('Failed to load support history:', error)
    }
  }

  const saveSupportHistory = async (newMessages: SupportMessage[]) => {
    try {
      await AsyncStorage.setItem('support_history', JSON.stringify(newMessages))
    } catch (error) {
      console.error('Failed to save support history:', error)
    }
  }

  const sendWelcomeMessage = () => {
    if (messages.length === 0) {
      const welcomeMsg: SupportMessage = {
        id: Date.now().toString(),
        text: '안녕하세요! 👋\n펌피 고객센터입니다.\n\n무엇을 도와드릴까요?\n\n운영 시간: 평일 09:00 - 18:00\n주말/공휴일: 휴무',
        isUser: false,
        timestamp: new Date(),
        status: 'answered'
      }
      setMessages([welcomeMsg])
      saveSupportHistory([welcomeMsg])
    }
  }

  const getAutoReply = (userMessage: string): string | null => {
    const msg = userMessage.toLowerCase()

    if (msg.includes('영업시간') || msg.includes('운영시간') || msg.includes('몇시')) {
      return '펌피 고객센터 운영시간은 다음과 같습니다:\n\n📅 평일: 09:00 - 18:00\n🌙 점심시간: 12:00 - 13:00\n🚫 주말/공휴일: 휴무\n\n긴급 문의는 emergency@pumpy.com으로 이메일 주시기 바랍니다.'
    }

    if (msg.includes('회원권') || msg.includes('등록') || msg.includes('가입')) {
      return '회원권 관련 문의는 다음 정보를 함께 보내주시면 더 빠르게 도와드릴 수 있습니다:\n\n1. 회원번호\n2. 문의 내용\n3. 연락 가능한 시간\n\n담당자가 확인 후 연락드리겠습니다! 🙏'
    }

    if (msg.includes('환불') || msg.includes('취소') || msg.includes('해지')) {
      return '환불/해지 관련 정책:\n\n✅ 이용 시작 전: 전액 환불\n⚠️ 이용 중: 일할 계산 후 환불\n❌ 위약금: 없음\n\n자세한 상담은 고객센터로 문의 부탁드립니다.'
    }

    if (msg.includes('비밀번호') || msg.includes('로그인')) {
      return '로그인 문제 해결 방법:\n\n1. 비밀번호 재설정\n2. 이메일 확인\n3. 앱 재설치\n\n문제가 계속되면 support@pumpy.com으로 문의해주세요!'
    }

    return null
  }

  const handleSend = async () => {
    if (!inputText.trim()) return

    const userMessage: SupportMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
      status: 'pending'
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputText('')
    setIsAgentTyping(true)

    const autoReply = getAutoReply(inputText)

    setTimeout(() => {
      let agentResponse: SupportMessage

      if (autoReply) {
        agentResponse = {
          id: (Date.now() + 1).toString(),
          text: autoReply,
          isUser: false,
          timestamp: new Date(),
          status: 'answered'
        }
      } else {
        agentResponse = {
          id: (Date.now() + 1).toString(),
          text: '문의해 주셔서 감사합니다! 🙏\n\n담당자가 확인 후 빠른 시일 내에 답변드리겠습니다.\n\n긴급 문의: 02-1234-5678\n이메일: support@pumpy.com',
          isUser: false,
          timestamp: new Date(),
          status: 'answered'
        }
      }

      const updatedMessages = [...newMessages, agentResponse]
      setMessages(updatedMessages)
      saveSupportHistory(updatedMessages)
      setIsAgentTyping(false)

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }, 1500 + Math.random() * 1000)

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }

  const handleQuickAction = (action: string) => {
    setInputText(action)
  }

  const renderMessage = (message: SupportMessage) => {
    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          message.isUser ? styles.userMessageContainer : styles.agentMessageContainer
        ]}
      >
        {!message.isUser && (
          <View style={styles.agentAvatar}>
            <Text style={styles.agentAvatarText}>👨‍💼</Text>
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            message.isUser ? styles.userBubble : styles.agentBubble
          ]}
        >
          <Text style={[styles.messageText, message.isUser ? styles.userText : styles.agentText]}>
            {message.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[styles.timestamp, message.isUser && { color: 'rgba(255,255,255,0.7)' }]}>
              {message.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {message.isUser && message.status === 'pending' && (
              <Text style={styles.statusBadge}>대기중</Text>
            )}
          </View>
        </View>
      </View>
    )
  }

  const quickActions = ['회원권 문의', '영업시간 확인', '환불 문의', '로그인 문제']

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>고객센터</Text>
            <View style={styles.statusIndicator}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>응답 가능</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => Alert.alert('전화 상담', '고객센터: 02-1234-5678\n운영시간: 평일 09:00 - 18:00')}
            style={styles.phoneButton}
          >
            <Text style={styles.phoneButtonText}>📞</Text>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(renderMessage)}
          {isAgentTyping && (
            <View style={[styles.messageContainer, styles.agentMessageContainer]}>
              <View style={styles.agentAvatar}>
                <Text style={styles.agentAvatarText}>👨‍💼</Text>
              </View>
              <View style={[styles.messageBubble, styles.agentBubble, styles.typingBubble]}>
                <View style={styles.typingIndicator}>
                  <View style={[styles.typingDot, { animationDelay: '0ms' }]} />
                  <View style={[styles.typingDot, { animationDelay: '150ms' }]} />
                  <View style={[styles.typingDot, { animationDelay: '300ms' }]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Actions */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickActions}
          contentContainerStyle={styles.quickActionsContent}
        >
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action}
              style={styles.quickActionButton}
              onPress={() => handleQuickAction(action)}
            >
              <Text style={styles.quickActionText}>{action}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => Alert.alert('파일 첨부', '파일 첨부 기능은 준비 중입니다.')}
          >
            <Text style={styles.attachButtonText}>📎</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="문의 내용을 입력하세요..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)'
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
  headerContent: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: 'white' },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981'
  },
  statusText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600'
  },
  phoneButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  phoneButtonText: { fontSize: 20 },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 20, paddingBottom: 10 },
  messageContainer: { marginBottom: 16, flexDirection: 'row', gap: 10 },
  userMessageContainer: { justifyContent: 'flex-end', alignSelf: 'flex-end', maxWidth: '75%' },
  agentMessageContainer: { alignSelf: 'flex-start', maxWidth: '80%' },
  agentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center'
  },
  agentAvatarText: { fontSize: 20 },
  messageBubble: {
    padding: 14,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1
  },
  userBubble: {
    backgroundColor: '#667eea',
    borderBottomRightRadius: 4
  },
  agentBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4
  },
  typingBubble: {
    paddingVertical: 18
  },
  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { color: 'white', fontWeight: '600' },
  agentText: { color: '#333', fontWeight: '500' },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6
  },
  timestamp: {
    fontSize: 10,
    color: '#999'
  },
  statusBadge: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontWeight: '700'
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#667eea'
  },
  quickActions: {
    maxHeight: 50,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)'
  },
  quickActionsContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10
  },
  quickActionButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)'
  },
  quickActionText: { color: 'white', fontSize: 13, fontWeight: '700' },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    gap: 10,
    alignItems: 'center'
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  attachButtonText: { fontSize: 20 },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: '#333'
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc'
  },
  sendButtonText: { color: 'white', fontSize: 18, fontWeight: '900' }
})

