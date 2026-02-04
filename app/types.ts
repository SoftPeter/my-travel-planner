// 체크리스트 아이템
export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

// 장소 상세 정보 (Google Places API)
export interface PlaceDetails {
  rating?: number;
  userRatingsTotal?: number;
  openingHours?: string[];
  isOpen?: boolean;
  closedOn?: string[]; // 휴무일
  phoneNumber?: string;
  website?: string;
  priceLevel?: number; // 0-4
}

// 이동 구간 정보
export interface TravelSegment {
  mode: 'WALKING' | 'DRIVING' | 'TRANSIT';
  distance: number; // 미터
  duration: number; // 분
  polylinePoints?: string; // encoded polyline
}

// 장소 정보
export interface Place {
  tempId: number;
  placeId: string;
  name: string;
  address: string;
  position: { lat: number; lng: number };
  startTime: string; // HH:mm 형식
  duration: number; // 체류 시간 (분)
  budget: number;
  memo: string;
  checklist: ChecklistItem[];
  placeDetails?: PlaceDetails;
  type?: 'attraction' | 'accommodation' | 'transport';
}

// 타임라인 검증 결과
export interface ValidationResult {
  isValid: boolean;
  message: string;
  placeIndex: number;
  severity: 'error' | 'warning';
}

// 일차 정보
export interface Day {
  id: string;
  date: string; // YYYY-MM-DD 형식
  places: Place[];
  travelModes: TravelMode[]; // 신규 추가: 날짜별 이동 수단 설정
  totalDistance: number; // 미터
  totalDuration: number; // 분
  totalBudget: number;
  modeStats?: {
    [key in TravelMode]?: {
      distance: number;
      duration: number;
    }
  };
}

// 전체 여행 정보
export interface Trip {
  id: string; // 고유 ID
  days: Day[];
  currentDayId?: string; // 현재 선택된 날짜 ID (UI 상태)
  tripName: string;
  startDate: string; // YYYY-MM-DD
  coverImage?: string; // 커버 이미지 (그라데이션 CSS 또는 이미지 URL)
}

// 이동 수단 타입
export type TravelMode = 'WALKING' | 'DRIVING' | 'TRANSIT';

// 이동 수단 옵션
export interface TravelModeOption {
  value: TravelMode;
  label: string;
  icon: string;
  color: string;
}
