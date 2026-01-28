import { Place, TravelSegment, ValidationResult } from '../types';

/**
 * 시간 문자열(HH:mm)을 분으로 변환
 */
function timeToMinutes(time: string): number {
    if (!time || !time.includes(':')) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * 분을 시간 문자열(HH:mm)로 변환
 */
function minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * 타임라인 정합성 체크
 * 각 장소의 종료 시간 + 이동 시간이 다음 장소의 시작 시간보다 늦으면 경고
 */
export function validateTimeline(
    places: Place[],
    segments: TravelSegment[]
): ValidationResult[] {
    const results: ValidationResult[] = [];

    for (let i = 0; i < places.length - 1; i++) {
        const currentPlace = places[i];
        const nextPlace = places[i + 1];
        const segment = segments[i];

        // 현재 장소 정보가 불완전하면 스킵
        if (!currentPlace.startTime || !nextPlace.startTime) {
            continue;
        }

        // 현재 장소 종료 시간 계산
        const currentStartMinutes = timeToMinutes(currentPlace.startTime);
        const currentEndMinutes = currentStartMinutes + currentPlace.duration;

        // 이동 시간 추가
        const travelDuration = segment?.duration || 0;
        const arrivalMinutes = currentEndMinutes + travelDuration;

        // 다음 장소 시작 시간
        const nextStartMinutes = timeToMinutes(nextPlace.startTime);

        // 검증
        if (arrivalMinutes > nextStartMinutes) {
            const gap = arrivalMinutes - nextStartMinutes;
            results.push({
                isValid: false,
                message: `${currentPlace.name}에서 ${nextPlace.name}까지 이동 시간이 ${gap}분 부족합니다! (도착 예상: ${minutesToTime(arrivalMinutes)})`,
                placeIndex: i,
                severity: 'error',
            });
        } else if (arrivalMinutes === nextStartMinutes) {
            results.push({
                isValid: true,
                message: `이동 시간이 딱 맞습니다. 여유 시간이 없으니 주의하세요.`,
                placeIndex: i,
                severity: 'warning',
            });
        }
    }

    return results;
}

/**
 * 특정 장소의 종료 시간 계산
 */
export function calculateEndTime(place: Place): string {
    if (!place.startTime) return '';
    const startMinutes = timeToMinutes(place.startTime);
    const endMinutes = startMinutes + place.duration;
    return minutesToTime(endMinutes);
}

/**
 * 예상 도착 시간 계산 (이전 장소 종료 시간 + 이동 시간)
 */
export function calculateArrivalTime(
    previousPlace: Place,
    travelDuration: number
): string {
    if (!previousPlace.startTime) return '';
    const startMinutes = timeToMinutes(previousPlace.startTime);
    const endMinutes = startMinutes + previousPlace.duration;
    const arrivalMinutes = endMinutes + travelDuration;
    return minutesToTime(arrivalMinutes);
}

/**
 * 두 좌표 간의 직선거리 계산 (Haversine 공식)
 */
export function calculateDirectDistance(
    pos1: { lat: number; lng: number },
    pos2: { lat: number; lng: number }
): number {
    const R = 6371e3; // 지구 반지름 (m)
    const φ1 = (pos1.lat * Math.PI) / 180;
    const φ2 = (pos2.lat * Math.PI) / 180;
    const Δφ = ((pos2.lat - pos1.lat) * Math.PI) / 180;
    const Δλ = ((pos2.lng - pos1.lng) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // 결과 (m)
}

/**
 * 직선거리 기준 예상 도보 시간 계산 (평균 5km/h 기준)
 */
export function estimateWalkingTime(distanceMeters: number): number {
    const speedKmh = 5;
    const speedMpm = (speedKmh * 1000) / 60; // meters per minute
    return Math.ceil(distanceMeters / speedMpm);
}
