import { useState, useEffect } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { PlaceDetails } from '../types';

/**
 * Google Places API를 사용하여 장소 상세 정보를 가져오는 Hook
 */
export function usePlaceDetails(placeId: string | null) {
    const map = useMap();
    const placesLibrary = useMapsLibrary('places');
    const [details, setDetails] = useState<PlaceDetails | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!map || !placesLibrary || !placeId) {
            setDetails(null);
            return;
        }

        const fetchDetails = async () => {
            setLoading(true);
            const service = new placesLibrary.PlacesService(map);

            service.getDetails(
                {
                    placeId,
                    fields: [
                        'rating',
                        'user_ratings_total',
                        'opening_hours',
                        'formatted_phone_number',
                        'website',
                        'price_level',
                    ],
                },
                (place, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                        const placeDetails: PlaceDetails = {
                            rating: place.rating,
                            userRatingsTotal: place.user_ratings_total,
                            openingHours: place.opening_hours?.weekday_text,
                            isOpen: place.opening_hours?.isOpen(),
                            phoneNumber: place.formatted_phone_number,
                            website: place.website,
                            priceLevel: place.price_level,
                        };
                        setDetails(placeDetails);
                    } else {
                        console.error('Place Details API 오류:', status);
                        setDetails(null);
                    }
                    setLoading(false);
                }
            );
        };

        fetchDetails();
    }, [map, placesLibrary, placeId]);

    return { details, loading };
}
