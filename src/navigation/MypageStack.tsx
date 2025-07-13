// src/navigation/MypageStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MypageScreen from '../screens/MypageScreen';
import MyPostScreen from '../components/MyPostScreen';

const Stack = createNativeStackNavigator();

export default function MypageStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Mypage"
        component={MypageScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MyPost"
        component={MyPostScreen}
        options={{ title: '내가 쓴 글', headerShown: false }}
      />
    </Stack.Navigator>
  );
}
