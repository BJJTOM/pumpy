import React, { useState, useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ActivityIndicator, View, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import RegisterScreen from '../screens/auth/RegisterScreen'
import LoginScreen from '../screens/auth/LoginScreen'
import HomeScreen from '../screens/home/HomeScreen'
import AppTabs from './AppTabs'
import WODScreen from '../screens/wod/WODScreen'
import MealScreen from '../screens/meal/MealScreen'
import WorkoutLogScreen from '../screens/workout/WorkoutLogScreen'
import AttendanceHistoryScreen from '../screens/attendance/AttendanceHistoryScreen'
import PremiumScreen from '../screens/premium/PremiumScreen'
import CommunityDetailScreen from '../screens/community/CommunityDetailScreenV2'
import EditBodyStatsScreen from '../screens/profile/EditBodyStatsScreen'
import EditProfileScreen from '../screens/profile/EditProfileScreen'
import SettingsScreen from '../screens/settings/SettingsScreen'
import PrivacySecurityScreen from '../screens/settings/PrivacySecurityScreen'
import CustomerSupportScreen from '../screens/settings/CustomerSupportScreen'
import AnnouncementsScreen from '../screens/settings/AnnouncementsScreen'
import FAQScreen from '../screens/settings/FAQScreen'
import TermsOfServiceScreen from '../screens/settings/TermsOfServiceScreen'
import PrivacyPolicyScreen from '../screens/settings/PrivacyPolicyScreen'

export type RootStackParamList = {
  Login: undefined
  Home: undefined
  Tabs: undefined
  Register: undefined
  WOD: undefined
  Meal: undefined
  WorkoutLog: undefined
  AttendanceHistory: undefined
  Premium: undefined
  CommunityDetail: { postId: number }
  EditBodyStats: undefined
  EditProfile: undefined
  Settings: undefined
  PrivacySecurity: undefined
  CustomerSupport: undefined
  Announcements: undefined
  FAQ: undefined
  TermsOfService: undefined
  PrivacyPolicy: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function RootNavigator() {
  const [isLoading, setIsLoading] = useState(true)
  const [userToken, setUserToken] = useState<string | null>(null)

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken')
        setUserToken(token)
      } catch (e) {
        console.error('Failed to load token from storage', e)
      } finally {
        setIsLoading(false)
      }
    }
    checkLoginStatus()

    // AsyncStorage 변경 감지 (로그아웃 시)
    const interval = setInterval(async () => {
      try {
        const token = await AsyncStorage.getItem('userToken')
        if (token !== userToken) {
          setUserToken(token)
        }
      } catch (e) {
        console.error('Failed to check token', e)
      }
    }, 1000) // 1초마다 확인

    return () => clearInterval(interval)
  }, [userToken])

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
          <>
            <Stack.Screen name="Login">
              {props => <LoginScreen {...props} onLoginSuccess={(token) => {
                AsyncStorage.setItem('userToken', token)
                setUserToken(token)
              }} />}
            </Stack.Screen>
            <Stack.Screen name="Register">
              {props => <RegisterScreen {...props} onRegisterSuccess={(token) => {
                AsyncStorage.setItem('userToken', token)
                setUserToken(token)
              }} />}
            </Stack.Screen>
          </>
        ) : (
                 <>
                   <Stack.Screen name="Tabs" component={AppTabs} />
                   <Stack.Screen name="Home" component={HomeScreen} />
                   <Stack.Screen name="WOD" component={WODScreen} />
                   <Stack.Screen name="Meal" component={MealScreen} />
                   <Stack.Screen name="WorkoutLog" component={WorkoutLogScreen} />
                   <Stack.Screen name="AttendanceHistory" component={AttendanceHistoryScreen} />
                   <Stack.Screen name="Premium" component={PremiumScreen} />
                   <Stack.Screen name="CommunityDetail" component={CommunityDetailScreen} />
                   <Stack.Screen name="EditBodyStats" component={EditBodyStatsScreen} />
                   <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                   <Stack.Screen name="Settings" component={SettingsScreen} />
                   <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
                   <Stack.Screen name="CustomerSupport" component={CustomerSupportScreen} />
                   <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
                   <Stack.Screen name="FAQ" component={FAQScreen} />
                   <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
                   <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
                 </>
               )}
             </Stack.Navigator>
           </NavigationContainer>
         )
       }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
})
