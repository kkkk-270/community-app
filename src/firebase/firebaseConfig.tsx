// src/firebase/firebaseConfig.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ✅ Firebase 프로젝트 설정
const firebaseConfig = {
  apiKey: "AIzaSyDG-Fy3_SDfN7M-JHoXpUbJ4tw76tGt7J8",
  authDomain: "communityapp-89c20.firebaseapp.com",
  projectId: "communityapp-89c20",
  storageBucket: "communityapp-89c20.appspot.com", // ❗️중요: .com으로 고쳐야 정상작동
  messagingSenderId: "468755321592",
  appId: "1:468755321592:web:b4bed580e710bc17fca10d"
};

// ✅ Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// ✅ Firestore 초기화 (Expo 환경에서 안정성 확보용 옵션 적용)
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false, // 네트워크 문제 시 streaming 비활성화
});

// ✅ Firebase 인증 및 스토리지
export const auth = getAuth(app);
export const storage = getStorage(app);
