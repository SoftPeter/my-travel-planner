import { Trip } from '../types';

const STORAGE_KEY_SINGLE = 'travel_planner_data'; // Legacy
const STORAGE_KEY_LIST = 'travel_planner_trips';  // New

/**
 * 모든 여행 목록 가져오기 (마이그레이션 포함)
 */
export function getAllTrips(): Trip[] {
    if (typeof window === 'undefined') return [];

    // 1. 신규 포맷(배열) 확인
    const listJson = localStorage.getItem(STORAGE_KEY_LIST);
    if (listJson) {
        return JSON.parse(listJson) as Trip[];
    }

    // 2. 구버전 데이터 확인 및 마이그레이션
    const singleJson = localStorage.getItem(STORAGE_KEY_SINGLE);
    if (singleJson) {
        try {
            const oldTrip = JSON.parse(singleJson) as Trip;
            // ID가 없다면 생성
            if (!oldTrip.id) oldTrip.id = 'legacy-trip';

            const newTrips = [oldTrip];
            localStorage.setItem(STORAGE_KEY_LIST, JSON.stringify(newTrips));
            return newTrips;
        } catch (e) {
            console.error('Migration failed', e);
            return [];
        }
    }

    return [];
}

/**
 * 특정 여행 가져오기
 */
export function getTrip(id: string): Trip | null {
    const trips = getAllTrips();
    return trips.find(t => t.id === id) || null;
}

/**
 * 여행 저장 (업데이트 또는 추가)
 */
export function saveTrip(updatedTrip: Trip): void {
    const trips = getAllTrips();
    const index = trips.findIndex(t => t.id === updatedTrip.id);

    if (index >= 0) {
        trips[index] = updatedTrip;
    } else {
        trips.push(updatedTrip);
    }

    localStorage.setItem(STORAGE_KEY_LIST, JSON.stringify(trips));
}

/**
 * 새 여행 생성
 */
export function createTrip(): Trip {
    const newId = `trip-${Date.now()}`;
    const newTrip: Trip = {
        id: newId,
        tripName: '새 여행',
        startDate: new Date().toISOString().split('T')[0],
        days: [],
        currentDayId: '',
    };

    // Day 1 자동 추가
    const firstDayId = `day-${Date.now()}`;
    newTrip.days.push({
        id: firstDayId,
        date: newTrip.startDate,
        places: [],
        travelModes: [],
        totalDistance: 0,
        totalDuration: 0,
        totalBudget: 0
    });
    newTrip.currentDayId = firstDayId;

    saveTrip(newTrip);
    return newTrip;
}

/**
 * 여행 삭제
 */
export function deleteTrip(id: string): void {
    const trips = getAllTrips().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEY_LIST, JSON.stringify(trips));
}

// 호환성을 위해 남겨두되 경고 출력 (사용처 제거 후 삭제 예정)
export function loadTripFromLocalStorage(): Trip | null {
    console.warn('Deprecated: loadTripFromLocalStorage called. Use getTrip or getAllTrips.');
    const trips = getAllTrips();
    return trips.length > 0 ? trips[0] : null;
}

export function saveTripToLocalStorage(trip: Trip): void {
    console.warn('Deprecated: saveTripToLocalStorage called. Use saveTrip.');
    saveTrip(trip);
}

