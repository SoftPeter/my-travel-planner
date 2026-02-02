# 🗺️ Travel Planner: Your Ultimate Journey Architect
> *Plan smarter, travel smoother. Experience the future of route planning.*

![Travel Planner Banner](https://img.shields.io/badge/Project-Travel%20Planner-blue?style=for-the-badge&logo=googlemaps) ![Build Status](https://img.shields.io/badge/Build-Success-success?style=for-the-badge) ![Version](https://img.shields.io/badge/Next.js-16.1.4-black?style=for-the-badge&logo=next.js)

---

## 🚀 Project Overview

**"복잡한 여행 계획, 직관적인 시각화로 해결하다."**

기존의 엑셀 시트나 메모장 기반의 여행 계획은 지루하고 동선을 파악하기 어렵습니다. 
**Travel Planner**는 **지도(Map)와 타임라인(Timeline)을 완벽하게 결합**하여, 사용자가 **직관적인 동선 관리**를 할 수 있도록 설계된 차세대 웹 애플리케이션입니다.

여행의 *시작*부터 *끝*까지, 당신의 여정을 하나의 아름다운 스토리로 만들어 드립니다.

---

## ✨ Key Features

### 1. 🎨 Visualizing Imagination
- **Hybrid View**: 좌측의 타임라인(일정)과 우측의 지도(Google Maps)가 실시간으로 연동됩니다.
- **Live Polyline**: 장소를 추가하는 즉시 지도 위에 **파란색 여행 동선(Polyline)**이 그려져 이동 경로를 한눈에 파악할 수 있습니다.
- **Auto-Indexing**: 장소 순서에 따라 지도 마커에 `1`, `2`, `3` 번호가 자동으로 매겨집니다.

### 2. 🧠 Smart Calculations
- **Dynamic Gap Analysis**: 장소와 장소 사이의 **이동 거리(m/km)**와 **예상 소모 시간**을 자동으로 계산하여 알려줍니다.
- **Budget & Time Management**: 각 장소별 예산과 방문 시간을 입력하면 전체 여행의 총 예산과 소요 시간을 **자동으로 합산**해줍니다.

### 3. 📱 Mobile-First Experience (New!)
모바일 환경에서도 PC 못지않은 강력한 편집 기능을 제공하기 위해 UX를 극한으로 끌어올렸습니다.
- **Smart Input**: 시간 입력 시 숫자(`1400`)만 쳐도 `14:00`으로 자동 변환되는 **매직 포맷팅**.
- **Touch-Optimized**: 롱프레스(Long-press)로 간편하게 날짜를 삭제하고, 드래그 앤 드롭으로 순서를 바꿀 수 있습니다.
- **Auto-Save**: 별도의 저장 버튼 없이도, 모달을 닫으면 **수정 사항이 즉시 저장**됩니다.

---

## 🛠️ Tech Stack

이 프로젝트는 최상의 성능과 사용자 경험을 위해 **최신 기술 스택**으로 무장했습니다.

| Category | Technology |
| :--- | :--- |
| **Framework** | ![Next.js](https://img.shields.io/badge/Next.js_16-balck?logo=next.js) **App Router** 기반의 최신 구조 |
| **Language** | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) 타입 안정성을 보장하는 개발 |
| **UI Library** | ![Ant Design](https://img.shields.io/badge/Ant_Design_6-0170FE?logo=antdesign&logoColor=white) + ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?logo=tailwindcss&logoColor=white) |
| **Map Engine** | **@vis.gl/react-google-maps** (Google Maps Platform) |
| **Interaction** | **@dnd-kit** (부드러운 드래그 앤 드롭 구현) |

---

## 💎 UX/UI Detail Focus

작은 디테일이 명품을 만듭니다. 우리는 **사용자의 귀찮음**을 해결하는 데 집중했습니다.

### 🕹️ Stickiness & Navigation
- **Sticky Day Navigator**: 스크롤을 내려도 날짜 선택 바가 화면 상단에 찰싹 붙어 있어, 언제든 다른 날짜로 점프할 수 있습니다.
- **Re-indexing Logic**: 중간 날짜(Day 2)를 삭제하면, 뒤에 있던 일정들이 자동으로 당겨와지며(Day 3 → Day 2) 여행의 연속성을 유지합니다.

### 💡 Visual Cues (Memo Indicators)
- **"기억을 돕는 점"**: 메모가 작성된 장소는 지도 마커 우측 상단에 **노란색 점(Dot)**이 표시됩니다. 지도를 보면서 "아, 여기 뭐 적어놨었지!"라고 즉시 인지할 수 있습니다.
- **In-List Icon**: 타임라인 카드에도 📝 아이콘이 표시되어 상세 정보를 놓치지 않게 돕습니다.

### 🖥️ Seamless Cross-Platform
- **PC Inline Editing**: PC에서는 클릭 한 번으로 인라인 편집 모드로 전환되어 생산성을 높입니다.
- **Mobile Immersive Modal**: 모바일에서는 꽉 찬 화면의 모달로 집중도 높은 편집 환경을 제공합니다.

---

<p align="center">
  <i>Developed with ❤️ by Your AI Assistant, Antigravity.</i>
</p>
