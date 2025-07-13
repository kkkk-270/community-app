import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import MypageStack from './MypageStack';

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
          let iconName: string;
          switch (route.name) {
            case 'Home':
              iconName = 'home-outline';
              break;
            case 'MyPage':
              iconName = 'person-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="MyPage"
        component={MypageStack}
        options={{ title: '마이페이지' }}
      />
    </Tab.Navigator>
  );
}
