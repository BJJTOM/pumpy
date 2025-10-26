import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import HomeScreen from '../screens/home/HomeScreen'
import CommunityScreenV2 from '../screens/community/CommunityScreenV2'
import AIChatbotScreen from '../screens/chatbot/AIChatbotScreen'
import ProfileScreen from '../screens/profile/ProfileScreen'
import { Text } from 'react-native'

export type TabParamList = {
  HomeTab: undefined
  Community: undefined
  AICoach: undefined
  Profile: undefined
}

const Tab = createBottomTabNavigator<TabParamList>()

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#667eea',
        tabBarStyle: {
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -5 },
          shadowOpacity: 0.15,
          shadowRadius: 30,
        }
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{ 
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 26 }}>{focused ? '🏠' : '🏠'}</Text>,
          tabBarLabel: ({ color }) => <Text style={{ color, fontSize: 11, fontWeight: '700' }}>홈</Text> 
        }} 
      />
      <Tab.Screen 
        name="Community" 
        component={CommunityScreenV2} 
        options={{ 
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 26 }}>{focused ? '👥' : '👥'}</Text>,
          tabBarLabel: ({ color }) => <Text style={{ color, fontSize: 11, fontWeight: '700' }}>커뮤니티</Text> 
        }} 
      />
      <Tab.Screen 
        name="AICoach" 
        component={AIChatbotScreen} 
        options={{ 
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 26 }}>{focused ? '🤖' : '🤖'}</Text>,
          tabBarLabel: ({ color }) => <Text style={{ color, fontSize: 11, fontWeight: '700' }}>AI코치</Text> 
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 26 }}>{focused ? '👤' : '👤'}</Text>,
          tabBarLabel: ({ color }) => <Text style={{ color, fontSize: 11, fontWeight: '700' }}>프로필</Text> 
        }} 
      />
    </Tab.Navigator>
  )
}


