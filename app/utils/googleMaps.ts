/**
 * Google Maps 길찾기 URL 생성 유틸리티
 */

export interface GoogleMapsParams {
    origin?: string | { lat: number; lng: number };
    destination: string | { lat: number; lng: number };
    travelmode?: 'transit' | 'driving' | 'walking' | 'bicycling';
}

/**
 * Google Maps 길찾기 URL을 생성합니다.
 * @param params origin, destination, travelmode 정보
 * @returns 인코딩된 Google Maps URL
 */
export function generateGoogleMapsUrl({ origin, destination, travelmode = 'transit' }: GoogleMapsParams): string {
    const baseUrl = 'https://www.google.com/maps/dir/?api=1';

    const formatPoint = (point: string | { lat: number; lng: number }) => {
        if (typeof point === 'string') {
            return encodeURIComponent(point);
        }
        return `${point.lat},${point.lng}`;
    };

    const originPart = origin ? `&origin=${formatPoint(origin)}` : '';
    const destPart = `&destination=${formatPoint(destination)}`;
    const modePart = `&travelmode=${travelmode}`;

    return `${baseUrl}${originPart}${destPart}${modePart}`;
}

/**
 * '현재 위치' 기반 구글 맵 URL을 생성합니다.
 */
export function generateMyLocationUrl(destination: string | { lat: number; lng: number }, travelmode: 'transit' | 'driving' | 'walking' | 'bicycling' = 'transit'): string {
    return generateGoogleMapsUrl({
        origin: 'My Location',
        destination,
        travelmode
    });
}
