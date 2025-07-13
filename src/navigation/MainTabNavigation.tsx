import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import MypageStack from './MypageStack'; // ✅ 추가한 Stack

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: { backgroundColor: '#1E1E1E' },
        tabBarActiveTintColor: '#FF8A3D',
        tabBarInactiveTintColor: '#aaa',
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'MyPage') iconName = 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="MyPage"
        component={MypageStack} // ✅ 여기만 바뀜
        options={{ title: '마이페이지' }}
      />
    </Tab.Navigator>
  );
}
