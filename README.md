# Community App (React Native + Firebase)

React Native 기반의 커뮤니티 앱입니다.  
회원가입/로그인, 글 작성 및 목록 조회, 댓글 기능, 마이페이지 등 MVP 기능을 구현했습니다.

---

## 📁 프로젝트 구조

```
community-app/
│
├── src/                      
│   │
│   ├── screens/              # 주요 화면 (페이지 단위)
│   │   ├── HomeScreen.tsx    # 홈 화면
│   │   ├── DetailScreen.tsx  # 게시글 상세
│   │   ├── WriteScreen.tsx   # 글쓰기 화면
│   │   ├── LoginScreen.tsx   # 로그인
│   │   ├── SignupScreen.tsx  # 회원가입
│   │   ├── MypageScreen.tsx  # 마이페이지
│   │   ├── MyPostScreen.tsx  # 내가 쓴 글
│   │   └── MyCommentScreen.tsx # 내가 쓴 댓글
│   │
│   ├── navigation/           # React Navigation 관련 설정
│   │   ├── MainTabNavigation.tsx
│   │   └── MypageStack.tsx
│   │
│   ├── firebase/             # Firebase 설정 파일
│       └── firebaseConfig.ts
│   
│
│
├── App.tsx                   # 앱 루트 진입점
├── app.json                  # Expo 설정 파일
├── package.json              # 프로젝트 의존성 정보
├── tsconfig.json             # TypeScript 설정
└── README.md                 # 프로젝트 소개 문서
```

---

## 🚀 주요 기능

| 기능                 | 설명                                                                 |
|----------------------|----------------------------------------------------------------------|
| 🔐 **회원가입 / 로그인** | Firebase Authentication 이용, 닉네임 기반 사용자 식별                   |
| 📝 **글 작성**           | 텍스트 + 이미지 첨부 가능, 최대 10장까지 업로드                          |
| 📃 **글 목록 & 상세**     | 리스트 출력, 대표 이미지 + 제목/작성자/댓글 수 요약 정보 포함           |
| 💬 **댓글**             | 실시간 작성/조회 가능, `:` 버튼으로 수정 및 삭제                        |
| 👤 **마이페이지**         | 내가 쓴 글 / 댓글 조회 및 수정 가능                                    |
| 🌙 **다크톤 UI**         | 전체 화면 다크모드 + 포인트 컬러 `#FF8A3D` 적용                         |

---

## ⚙️ 기술 스택

- **React Native (Expo)**
- **Firebase**
  - Authentication
  - Firestore
  - Storage
- **TypeScript**
- **React Navigation**

---

## 📦 설치 및 실행 방법

```bash
# 의존성 설치
npm install

# Expo 앱 실행
npx expo start
```
