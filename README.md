# 🧡 Community App (React Native + Firebase)

React Native 기반의 커뮤니티 앱입니다.  
회원가입/로그인, 글 작성 및 목록 조회, 댓글 기능, 마이페이지 등 MVP 기능을 구현했습니다.

<br/>

## 📁 프로젝트 구조
community-app/
├── src/
│ ├── components/ # 재사용 컴포넌트
│ │ ├── EditPostScreen.tsx
│ │ ├── MyCommentScreen.tsx
│ │ ├── MyPostScreen.tsx
│ │ ├── ViewPostsScreen.tsx
│ ├── firebase/ # Firebase 연동
│ │ └── firebaseConfig.tsx
│ ├── navigation/ # 네비게이션 설정
│ │ ├── MainTabNavigation.tsx
│ │ └── MypageStack.tsx
│ ├── screens/ # 주요 화면 (스크린)
│ │ ├── DetailScreen.tsx
│ │ ├── HomeScreen.tsx
│ │ ├── LoginScreen.tsx
│ │ ├── MypageScreen.tsx
│ │ ├── SignupScreen.tsx
│ │ └── WriteScreen.tsx
│ └── types/
│ └── navigation.ts
├── App.tsx
├── app.json
├── package.json
├── tsconfig.json
└── README.md

<br/>

## 🚀 주요 기능

| 기능               | 설명                                                                 |
|--------------------|----------------------------------------------------------------------|
| 🔐 회원가입 / 로그인 | Firebase Authentication 이용, 닉네임 기반 사용자 식별                        |
| 📝 글 작성           | 텍스트 + 이미지 첨부 가능, 최대 10장까지 업로드                                 |
| 📃 글 목록 & 상세    | 글 리스트 출력, 대표 이미지 + 제목/작성자/댓글 수 요약 정보 출력               |
| 💬 댓글             | 실시간 댓글 작성/조회 가능, 우측 상단 `:` 버튼으로 수정/삭제 메뉴 제공          |
| 👤 마이페이지       | 내가 쓴 글 / 댓글 조회 가능, 댓글 수정 시 내 닉네임 출력                        |
| 📱 다크톤 UI        | 전체 화면 다크모드 스타일링, 포인트 컬러(#FF8A3D) 적용                           |

<br/>

## ⚙️ 기술 스택

- **React Native (Expo)**
- **Firebase**
  - Authentication
  - Firestore
  - Storage
- **TypeScript**
- **React Navigation**

<br/>

## 📦 설치 및 실행 방법

```bash
# 의존성 설치
npm install

# Expo 앱 실행
npx expo start
