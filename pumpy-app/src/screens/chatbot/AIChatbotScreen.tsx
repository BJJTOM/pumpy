import React, { useState, useRef, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

const AI_RESPONSES = {
  greeting: [
    "안녕하세요! 💪 저는 펌피 AI 운동 코치입니다. 운동에 관해 무엇이든 물어보세요!",
    "반갑습니다! 🏋️ 오늘 운동 목표가 있으신가요?",
  ],
  workout: [
    "훌륭한 질문이네요! 근력 운동은 주 3-4회, 각 근육군당 48시간 휴식이 이상적입니다. 💪",
    "유산소와 근력 운동을 병행하시면 더 효과적입니다. 유산소 20-30분, 근력 40-50분 추천드려요!",
  ],
  diet: [
    "식단은 운동만큼 중요합니다! 단백질 체중kg당 1.6-2.2g, 탄수화물 적절히, 건강한 지방 섭취를 권장합니다. 🍎",
    "운동 전후 영양 섭취가 중요합니다. 운동 전 탄수화물, 운동 후 단백질을 섭취하세요!",
  ],
  rest: [
    "충분한 휴식도 운동의 일부입니다! 😴 근육은 휴식 중에 성장합니다. 하루 7-8시간 수면을 권장드립니다.",
    "과도한 운동은 오히려 역효과입니다. 몸의 신호를 잘 듣고 적절히 쉬어주세요!",
  ],
  motivation: [
    "포기하지 마세요! 💪 작은 변화들이 모여 큰 성과를 만듭니다. 오늘도 화이팅!",
    "당신은 할 수 있습니다! 🔥 꾸준함이 가장 강력한 무기입니다!",
  ],
  default: [
    "흥미로운 질문이네요! 더 구체적으로 말씀해주시면 자세히 답변드리겠습니다. 😊",
    "궁금하신 점이 있으시면 언제든 물어보세요! 운동, 식단, 휴식 등 다양한 주제로 도와드릴게요. 💪",
  ]
}

export default function AIChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)

  useEffect(() => {
    loadChatHistory()
    sendWelcomeMessage()
  }, [])

  const loadChatHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('chatbot_history')
      if (history) {
        setMessages(JSON.parse(history))
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
    }
  }

  const saveChatHistory = async (newMessages: Message[]) => {
    try {
      await AsyncStorage.setItem('chatbot_history', JSON.stringify(newMessages))
    } catch (error) {
      console.error('Failed to save chat history:', error)
    }
  }

  const sendWelcomeMessage = () => {
    if (messages.length === 0) {
      const welcomeMsg: Message = {
        id: Date.now().toString(),
        text: AI_RESPONSES.greeting[0],
        isUser: false,
        timestamp: new Date()
      }
      setMessages([welcomeMsg])
      saveChatHistory([welcomeMsg])
    }
  }

  const getAIResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase()
    
    if (msg.includes('운동') || msg.includes('트레이닝') || msg.includes('루틴')) {
      return AI_RESPONSES.workout[Math.floor(Math.random() * AI_RESPONSES.workout.length)]
    } else if (msg.includes('식단') || msg.includes('음식') || msg.includes('단백질') || msg.includes('다이어트')) {
      return AI_RESPONSES.diet[Math.floor(Math.random() * AI_RESPONSES.diet.length)]
    } else if (msg.includes('휴식') || msg.includes('수면') || msg.includes('피로')) {
      return AI_RESPONSES.rest[Math.floor(Math.random() * AI_RESPONSES.rest.length)]
    } else if (msg.includes('힘들') || msg.includes('포기') || msg.includes('동기')) {
      return AI_RESPONSES.motivation[Math.floor(Math.random() * AI_RESPONSES.motivation.length)]
    } else if (msg.includes('안녕') || msg.includes('하이') || msg.includes('헬로')) {
      return AI_RESPONSES.greeting[Math.floor(Math.random() * AI_RESPONSES.greeting.length)]
    }
    
    return AI_RESPONSES.default[Math.floor(Math.random() * AI_RESPONSES.default.length)]
  }

  const handleSend = async () => {
    if (!inputText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputText('')
    setIsTyping(true)

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputText),
        isUser: false,
        timestamp: new Date()
      }

      const updatedMessages = [...newMessages, aiResponse]
      setMessages(updatedMessages)
      saveChatHistory(updatedMessages)
      setIsTyping(false)

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }, 1000 + Math.random() * 1000)

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }

  const clearHistory = async () => {
    setMessages([])
    await AsyncStorage.removeItem('chatbot_history')
    sendWelcomeMessage()
  }

  const renderMessage = (message: Message) => {
    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          message.isUser ? styles.userMessageContainer : styles.aiMessageContainer
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            message.isUser ? styles.userBubble : styles.aiBubble
          ]}
        >
          <Text style={[styles.messageText, message.isUser ? styles.userText : styles.aiText]}>
            {message.text}
          </Text>
          <Text style={styles.timestamp}>
            {message.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.aiAvatar}>
              <Text style={styles.aiAvatarText}>🤖</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>AI 운동 코치</Text>
              <Text style={styles.headerSubtitle}>24/7 운동 상담 서비스</Text>
            </View>
          </View>
          <TouchableOpacity onPress={clearHistory} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>🗑️</Text>
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
          {isTyping && (
            <View style={[styles.messageContainer, styles.aiMessageContainer]}>
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <ActivityIndicator color="#667eea" />
                <Text style={[styles.messageText, styles.aiText, { marginLeft: 10 }]}>
                  답변 작성 중...
                </Text>
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
          {['운동 루틴 추천', '식단 조언', '휴식 방법', '동기부여'].map((action) => (
            <TouchableOpacity
              key={action}
              style={styles.quickActionButton}
              onPress={() => {
                setInputText(action)
                setTimeout(handleSend, 100)
              }}
            >
              <Text style={styles.quickActionText}>{action}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="메시지를 입력하세요..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
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
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center'
  },
  aiAvatarText: { fontSize: 28 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: 'white' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  clearButtonText: { fontSize: 20 },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 20, paddingBottom: 10 },
  messageContainer: { marginBottom: 16, maxWidth: '80%' },
  userMessageContainer: { alignSelf: 'flex-end' },
  aiMessageContainer: { alignSelf: 'flex-start' },
  messageBubble: {
    padding: 14,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  userBubble: {
    backgroundColor: '#667eea',
    borderBottomRightRadius: 4
  },
  aiBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4
  },
  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { color: 'white', fontWeight: '600' },
  aiText: { color: '#333', fontWeight: '500' },
  timestamp: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 6,
    alignSelf: 'flex-end'
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 100,
    color: '#333'
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0
  },
  sendButtonText: { color: 'white', fontSize: 20, fontWeight: '900' }
})

