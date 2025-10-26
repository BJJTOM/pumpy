import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import ServerConfigScreen from './screens/ServerConfigScreen';
import DashboardScreen from './screens/DashboardScreen';
import MembersScreen from './screens/MembersScreen';
import PendingScreen from './screens/PendingScreen';
import SignupScreen from './screens/SignupScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Members') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Pending') {
            iconName = focused ? 'hourglass' : 'hourglass-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#667eea',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: '대시보드' }}
      />
      <Tab.Screen 
        name="Members" 
        component={MembersScreen}
        options={{ title: '회원 관리' }}
      />
      <Tab.Screen 
        name="Pending" 
        component={PendingScreen}
        options={{ title: '승인 대기' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: '설정' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkServerConfig();
  }, []);

  const checkServerConfig = async () => {
    try {
      const url = await AsyncStorage.getItem('serverUrl');
      setServerUrl(url);
    } catch (error) {
      console.error('Failed to load server config:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null; // 또는 로딩 스피너
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!serverUrl ? (
            <Stack.Screen 
              name="ServerConfig" 
              component={ServerConfigScreen}
              options={{ title: '서버 설정' }}
            />
          ) : (
            <>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen 
                name="Signup" 
                component={SignupScreen}
                options={{ 
                  title: '회원 신청',
                  headerShown: true,
                  headerStyle: { backgroundColor: '#667eea' },
                  headerTintColor: '#fff'
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}










