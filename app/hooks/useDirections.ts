import { useState, useEffect } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Place, TravelSegment, TravelMode } from '../types';
import { calculateDirectDistance, estimateWalkingTime } from '../utils/timelineValidator';

/**
 * Google Directions API를 사용하여 이동 정보를 가져오는 Hook
 */
export function useDirections(places: Place[], modes: TravelMode[]) {
    const map = useMap();
    const routesLibrary = useMapsLibrary('routes');
    const [segments, setSegments] = useState<TravelSegment[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!map || !routesLibrary || places.length < 2) {
            setSegments([]);
            return;
        }

        const fetchDirections = async () => {
            setLoading(true);
            const directionsService = new routesLibrary.DirectionsService();
            const newSegments: TravelSegment[] = [];

            for (let i = 0; i < places.length - 1; i++) {
                const origin = places[i].position;
                const destination = places[i + 1].position;
                const mode = modes[i] || 'WALKING';

                try {
                    // Google Directions API 호출
                    const result = await directionsService.route({
                        origin,
                        destination,
                        travelMode: google.maps.TravelMode[mode],
                    });

                    if (result.routes && result.routes[0]) {
                        const route = result.routes[0];
                        const leg = route.legs[0];

                        newSegments.push({
                            mode,
                            distance: leg.distance?.value || 0,
                            duration: Math.ceil((leg.duration?.value || 0) / 60), // 초 → 분
                            polylinePoints: route.overview_polyline,
                        });
                    } else {
                        throw new Error('No results');
                    }
                } catch (error) {
                    // Fallback: 직선거리 계산
                    const directDist = calculateDirectDistance(origin, destination);
                    const estTime = estimateWalkingTime(directDist);
                    newSegments.push({
                        mode,
                        distance: directDist,
                        duration: estTime,
                        // 폴리라인이 없어도 직선으로 그릴 수 있도록 (MapEngine에서 처리하거나 비워둠)
                    });
                }
            }

            setSegments(newSegments);
            setLoading(false);
        };

        fetchDirections();
    }, [map, routesLibrary, places, modes]);

    return { segments, loading };
}
