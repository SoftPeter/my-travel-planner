import { TravelModeOption } from '../types';

/**
 * 이동 수단 옵션
 */
export const TRAVEL_MODE_OPTIONS: TravelModeOption[] = [
    {
        value: 'WALKING',
        label: '도보',
        icon: '🚶',
        color: '#52c41a',
    },
    {
        value: 'DRIVING',
        label: '차량',
        icon: '🚗',
        color: '#1890ff',
    },
    {
        value: 'TRANSIT',
        label: '대중교통',
        icon: '🚇',
        color: '#722ed1',
    },
];

/**
 * 기본 체크리스트 템플릿
 */
export const DEFAULT_CHECKLIST = [
    { id: '1', label: '예약 완료', checked: false },
    { id: '2', label: '티켓 구매', checked: false },
    { id: '3', label: '방문 완료', checked: false },
];

/**
 * 기본 체류 시간 (분)
 */
export const DEFAULT_DURATION = 60;

/**
 * Polyline 스타일 설정
 */
export const POLYLINE_STYLES = {
    WALKING: {
        strokeColor: '#52c41a',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        strokeDashArray: '10 5', // 점선
    },
    DRIVING: {
        strokeColor: '#1890ff',
        strokeOpacity: 0.9,
        strokeWeight: 4,
        strokeDashArray: undefined, // 실선
    },
    TRANSIT: {
        strokeColor: '#722ed1',
        strokeOpacity: 0.9,
        strokeWeight: 4,
        strokeDashArray: undefined, // 실선
    },
};

/**
 * 지도 기본 설정
 */
export const MAP_CONFIG = {
    defaultCenter: { lat: 37.5665, lng: 126.9780 }, // 서울
    defaultZoom: 13,
    mapId: 'travel_planner_map',
};
