// firebase/firebaseConfig.ts

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase 프로젝트 기본 설정
const firebaseConfig = {
  apiKey: 'AIzaSyDG-Fy3_SDfN7M-JHoXpUbJ4tw76tGt7J8',
  authDomain: 'communityapp-89c20.firebaseapp.com',
  projectId: 'communityapp-89c20',
  storageBucket: 'communityapp-89c20.appspot.com', // .com 도메인 주의
  messagingSenderId: '468755321592',
  appId: '1:468755321592:web:b4bed580e710bc17fca10d',
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firestore 인스턴스 생성 (Expo 환경 대응 옵션 포함)
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // 일부 네트워크 환경 대응
  useFetchStreams: false, // streaming 방식 비활성화 (특정 환경에서 문제 발생 방지)
});

// Firebase 인증 및 스토리지 인스턴스
export const auth = getAuth(app);
export const storage = getStorage(app);
