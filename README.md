# 🗺️ Travel Planner: Your Ultimate Journey Architect
> *Plan smarter, travel smoother. Experience the future of collaborative route planning.*

![Travel Planner Banner](https://img.shields.io/badge/Project-Travel%20Planner-blue?style=for-the-badge&logo=googlemaps) ![Build Status](https://img.shields.io/badge/Build-Success-success?style=for-the-badge) ![Version](https://img.shields.io/badge/Next.js-16.1.4-black?style=for-the-badge&logo=next.js) ![Firebase](https://img.shields.io/badge/Firebase-Realtime%20DB-orange?style=for-the-badge&logo=firebase)

---

## 🚀 Project Overview

**"복잡한 여행 계획, 직관적인 시각화와 실시간 협업으로 해결하다."**

기존의 엑셀 시트나 메모장 기반의 여행 계획은 지루하고 동선을 파악하기 어렵습니다. 
**Travel Planner**는 **지도(Map)와 타임라인(Timeline)을 완벽하게 결합**하고, **Firebase 기반의 실시간 협업** 기능을 더해 가족, 친구와 함께 동선을 짜는 즐거움을 선사합니다.

여행의 *시작*부터 *끝*까지, 당신의 여정을 하나의 아름다운 스토리로 만들어 드립니다.

---

## ✨ Core Features (Technical Spec)

### 1. 🔄 실시간 동기화 및 협업 (Real-time Collaboration)
- **Live Sync Engine**: Custom Hook `useTripData`와 **1초 디바운싱(Debouncing)** 로직을 통해 타이핑 중에도 부하 없이 DB와 실시간으로 동기화됩니다.
- **Independent UI State**: `currentDayId`(현재 보고 있는 일차)와 같은 UI 상태는 각 사용자의 브라우저 **로컬 상태(Local State)**로 관리됩니다. 덕분에 내가 1일 차를 볼 때 상대방이 3일 차를 봐도 서로의 화면이 강제로 이동하지 않습니다.
- **Anonymous Auth**: Firebase 익명 인증을 활용하여 번거로운 가입 절차 없이 즉시 보안이 확보된 협업 환경을 제공합니다.

### 2. 🛣️ 스마트 경로 시각화 (Smart Visualization)
- **Hybrid View**: 좌측의 타임라인(일정)과 우측의 지도(Google Maps)가 완벽 연동됩니다.
- **Live Polyline**: 장소를 추가하는 즉시 지도 위에 **파란색 여행 동선(Polyline)**이 그려져 이동 경로를 한눈에 파악할 수 있습니다.
- **Auto-Indexing**: 장소 순서에 따라 지도 마커에 방문 번호가 자동으로 매겨집니다.

### 3. 💾 지능형 데이터 관리 (Data Management)
- **Auto Migration**: 앱 첫 실행 시 브라우저(`LocalStorage`)에 저장되어 있던 기존 데이터를 탐지하여 Firebase 실시간 DB로 **자동 마이그레이션**합니다.
- **Smart Sharing**: 공유 링크를 통해 접속하면 해당 여행 ID가 방문자의 로컬 리스트에 자동 등록되어, 언제든지 홈 화면에서 다시 접근할 수 있습니다.

### 4. 📱 모바일 최적화 UX
- **Click-to-Map**: 카드 번호(①, ②) 클릭 시 지도가 즉시 해당 위치로 이동하여 스크롤 피로도를 줄입니다.
- **Magic Formatting**: 시간 입력 시 숫자만 쳐도(`1400` → `14:00`) 자동 변환되는 편의 기능을 제공합니다.

### 4. 🧭 구글 맵 경로 최적화 (Advanced Routing)
- **듀얼 경로 옵션**: 각 장소마다 '계획된 동선(이전 장소 출발)'과 '실제 현재 위치(GPS)' 기반의 구글 맵 경로 버튼을 제공합니다.
- **인덱스 기반 로직**: 복잡한 설정 없이 타임라인 순서에 따라 자동으로 출발지를 매칭합니다.
- **첫 일정 자동 감지**: 첫 번째 일정에서는 '현재 위치' 버튼만 노출하여 UX 정합성을 유지합니다.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | ![Next.js](https://img.shields.io/badge/Next.js_15-black?logo=next.js) **App Router** 기반 |
| **Database** | ![Firebase](https://img.shields.io/badge/Firebase-Realtime_DB-orange?logo=firebase) **실시간 동기화 노드** |
| **Auth** | **Firebase Anonymous Authentication** (익명 인증) |
| **Language** | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) |
| **UI Library** | ![Ant Design](https://img.shields.io/badge/Ant_Design_6-0170FE?logo=antdesign&logoColor=white) |
| **Map Engine** | **@vis.gl/react-google-maps** (Google Maps Platform) |

---

## 🔑 Environment Variables

프로젝트 실행 및 배포를 위해 아래 환경 변수 설정이 필요합니다. `.env.local` 파일을 생성하여 값을 입력하세요.

```bash
# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## 🛡️ Security & Deployment

### 1. Firebase Security Rules
유료 결제 없이도 보안을 유지하며 영구적으로 사용 가능한 규칙 설정 예시입니다:

```json
{
  "rules": {
    "trips": {
      "$tripId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```
*(Firebase Console > Realtime Database > Rules 탭에 적용 가능)*

### 2. Vercel 배포 시 주의사항
- Vercel 프로젝트 설정의 **Environment Variables** 탭에 상기 나열된 모든 키값을 반드시 등록해야 정상 작동합니다.
- `NEXT_PUBLIC_` 접두사가 붙은 변수만 클라이언트 측에서 참조 가능하므로 주의가 필요합니다.

---

<p align="center">
  <i>Developed with ❤️ by Your AI Assistant, Antigravity.</i>
</p>+
