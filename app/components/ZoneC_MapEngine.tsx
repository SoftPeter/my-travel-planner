"use client";

import React, { useEffect, useState } from 'react';
import { Map, Marker, useMap, useApiIsLoaded } from '@vis.gl/react-google-maps';
import { Place, TravelSegment } from '../types';
import { MAP_CONFIG } from '../utils/constants';
import PlaceSearcher from './PlaceSearcher';

interface ZoneCProps {
    places: Place[];
    segments: TravelSegment[];
    editingPlaceId: number | null;
    focusedPlaceId?: number | null;
    onPlaceAdd: (place: Partial<Place>) => void;
    onPlaceSelect: (placeId: number) => void;
}

/**
 * Zone C: 동선 시각화 엔진
 * 지도에 마커와 경로를 표시하고, 현재 편집 중인 장소를 중심으로 이동
 */
export default function ZoneC_MapEngine({
    places,
    segments,
    editingPlaceId,
    focusedPlaceId,
    onPlaceAdd,
    onPlaceSelect,
}: ZoneCProps) {
    const apiIsLoaded = useApiIsLoaded();

    return (
        <div style={{ height: '100%', position: 'relative' }}>
            <Map
                defaultCenter={MAP_CONFIG.defaultCenter}
                defaultZoom={MAP_CONFIG.defaultZoom}
                gestureHandling={'greedy'}
                mapId={MAP_CONFIG.mapId}
                disableDefaultUI={false}
                zoomControl={true}
                mapTypeControl={false}
                streetViewControl={false}
                fullscreenControl={true}
            >
                {/* API 로드 완료 시에만 자식 컴포넌트 렌더링 */}
                {apiIsLoaded && (
                    <>
                        {/* 장소 검색 */}
                        <PlaceSearcher onPlaceSelect={onPlaceAdd} />

                        {/* Polyline 렌더링 */}
                        <RoutePolylines places={places} segments={segments} />

                        {/* 마커 렌더링 */}
                        {places.map((place, index) => {
                            const isEditing = editingPlaceId === place.tempId;
                            return (
                                <React.Fragment key={place.tempId}>
                                    <Marker
                                        position={place.position}
                                        onClick={() => onPlaceSelect(place.tempId)}
                                        label={{
                                            text: `${index + 1}`,
                                            color: 'white',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                        }}
                                        icon={{
                                            path: google.maps.SymbolPath.CIRCLE,
                                            scale: isEditing ? 12 : 10,
                                            fillColor: isEditing ? '#ff4d4f' : '#3b82f6',
                                            fillOpacity: 1,
                                            strokeColor: 'white',
                                            strokeWeight: 2,
                                        }}
                                        animation={isEditing ? google.maps.Animation.BOUNCE : undefined}
                                    />
                                    {/* 메모 인디케이터 (메모가 있을 경우 우측 상단에 작은 점 표시) */}
                                    {place.memo && (
                                        <Marker
                                            position={{
                                                lat: place.position.lat + 0.00015,
                                                lng: place.position.lng + 0.00015
                                            }}
                                            icon={{
                                                path: google.maps.SymbolPath.CIRCLE,
                                                scale: 5,
                                                fillColor: '#faad14', // AntD Warning Gold
                                                fillOpacity: 1,
                                                strokeColor: 'white',
                                                strokeWeight: 1,
                                            }}
                                            zIndex={2000}
                                        />
                                    )}
                                </React.Fragment>
                            );
                        })}

                        {/* 편집 중인 장소로 지도 중심 이동 */}
                        <MapCenterSync places={places} editingPlaceId={editingPlaceId} focusedPlaceId={focusedPlaceId} />
                    </>
                )}
            </Map>
        </div>
    );
}

/**
 * Polyline 렌더링 컴포넌트
 */
function RoutePolylines({ places, segments }: { places: Place[], segments: TravelSegment[] }) {
    const map = useMap();
    const [polylines, setPolylines] = useState<google.maps.Polyline[]>([]);
    const [middleMarkers, setMiddleMarkers] = useState<google.maps.Marker[]>([]);

    useEffect(() => {
        if (!map) return;

        // 기존 요소 제거
        polylines.forEach(p => p.setMap(null));
        middleMarkers.forEach(m => m.setMap(null));

        const newPolylines: google.maps.Polyline[] = [];
        const newMarkers: google.maps.Marker[] = [];

        for (let i = 0; i < places.length - 1; i++) {
            const from = places[i];
            const to = places[i + 1];
            const segment = segments[i];

            // 경로 좌표
            const path = [from.position, to.position];

            // 1. Polyline 실선 스타일로 통일 (기획안: 직선 연결)
            const polyline = new google.maps.Polyline({
                path,
                geodesic: true,
                strokeColor: '#3b82f6', // 세련된 파란색
                strokeOpacity: 0.6,
                strokeWeight: 3,
                map,
            });
            newPolylines.push(polyline);

            // 2. 중간 지점 계산
            const midLat = (from.position.lat + to.position.lat) / 2;
            const midLng = (from.position.lng + to.position.lng) / 2;

            // 3. 거리 칩 (Marker) 추가
            if (segment || from.position) {
                const distanceText = segment
                    ? (segment.distance < 1000 ? `${segment.distance}m` : `${(segment.distance / 1000).toFixed(1)}km`)
                    : '계산 중';

                const marker = new google.maps.Marker({
                    position: { lat: midLat, lng: midLng },
                    map,
                    label: {
                        text: distanceText,
                        color: '#1e3a8a',
                        fontSize: '11px',
                        fontWeight: 'bold',
                    },
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 18,
                        fillColor: 'white',
                        fillOpacity: 0.9,
                        strokeColor: '#3b82f6',
                        strokeWeight: 1,
                    },
                });
                newMarkers.push(marker);
            }
        }

        setPolylines(newPolylines);
        setMiddleMarkers(newMarkers);

        return () => {
            newPolylines.forEach(p => p.setMap(null));
            newMarkers.forEach(m => m.setMap(null));
        };
    }, [map, places, segments]);

    return null;
}

/**
 * 편집 중인 장소로 지도 중심 이동
 */
function MapCenterSync({ places, editingPlaceId, focusedPlaceId }: { places: Place[], editingPlaceId: number | null, focusedPlaceId?: number | null }) {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        // 편집 중이거나 포커스된 장소가 있을 때 이동
        const targetId = editingPlaceId || focusedPlaceId;
        if (!targetId) return;

        const targetPlace = places.find(p => p.tempId === targetId);
        if (targetPlace) {
            map.panTo(targetPlace.position);
            // 편집 모드가 아닐 때(스크롤 포커스)는 줌이 너무 확 바뀌지 않는게 좋을 수도 있지만, 기획안에 따라 15 고정
            map.setZoom(15);
        }
    }, [map, editingPlaceId, focusedPlaceId, places]);

    return null;
}
