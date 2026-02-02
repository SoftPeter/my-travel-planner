"use client";

import React, { useState, useEffect, useRef } from 'react';
import { AutoComplete, Input, Typography, Spin } from 'antd';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Place } from '../types';
import { Grid } from 'antd';

const { Text } = Typography;
const { useBreakpoint } = Grid;

interface PlaceSearcherProps {
    onPlaceSelect: (place: Partial<Place>) => void;
}

/**
 * 장소 검색 컴포넌트 (Autocomplete 지원)
 */
export default function PlaceSearcher({ onPlaceSelect }: PlaceSearcherProps) {
    const map = useMap();
    const placesLib = useMapsLibrary("places");
    const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
    const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);

    const [options, setOptions] = useState<{ value: string; label: React.ReactNode; placeId: string }[]>([]);
    const [searchValue, setSearchValue] = useState("");
    const [loading, setLoading] = useState(false);
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    useEffect(() => {
        if (!map || !placesLib) return;
        setAutocompleteService(new placesLib.AutocompleteService());
        setPlacesService(new placesLib.PlacesService(map));
    }, [map, placesLib]);

    /**
     * 입력을 바탕으로 장소 추천 목록 조회
     */
    const handleSearch = (value: string) => {
        setSearchValue(value);
        if (!value || !autocompleteService) {
            setOptions([]);
            return;
        }

        setLoading(true);
        autocompleteService.getPlacePredictions(
            {
                input: value,
                language: 'ko',
                // componentRestrictions: { country: 'kr' } // 글로벌 검색을 위해 제한 해제
            },
            (predictions, status) => {
                setLoading(false);
                if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                    const mappedOptions = predictions.map(p => ({
                        value: p.description,
                        placeId: p.place_id,
                        label: (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                                <EnvironmentOutlined style={{ color: '#1890ff' }} />
                                <div>
                                    <Text strong style={{ fontSize: '13px', display: 'block' }}>{p.structured_formatting.main_text}</Text>
                                    <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>{p.structured_formatting.secondary_text}</Text>
                                </div>
                            </div>
                        )
                    }));
                    setOptions(mappedOptions);
                } else {
                    setOptions([]);
                }
            }
        );
    };

    /**
     * 추천 목록에서 장소 선택 시 상세 정보 조회 및 등록
     */
    const handleSelect = (value: string, option: any) => {
        if (!placesService || !map) return;

        setLoading(true);
        placesService.getDetails(
            {
                placeId: option.placeId,
                fields: ["name", "geometry", "formatted_address", "place_id", "rating", "opening_hours", "formatted_phone_number", "website"]
            },
            (result, status) => {
                setLoading(false);
                if (status === google.maps.places.PlacesServiceStatus.OK && result) {
                    map.panTo(result.geometry!.location!);
                    map.setZoom(16);

                    onPlaceSelect({
                        placeId: result.place_id!,
                        name: result.name!,
                        address: result.formatted_address!,
                        position: result.geometry!.location!.toJSON(),
                        placeDetails: {
                            rating: result.rating,
                            openingHours: result.opening_hours?.weekday_text,
                            isOpen: result.opening_hours?.isOpen(),
                            phoneNumber: result.formatted_phone_number,
                            website: result.website
                        }
                    });
                    setSearchValue(""); // 입력창 초기화
                    setOptions([]);
                }
            }
        );
    };

    return (
        <div style={{
            position: 'absolute',
            top: isMobile ? '12px' : '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            width: isMobile ? '90%' : '450px'
        }}>
            <AutoComplete
                popupMatchSelectWidth={true}
                style={{ width: '100%' }}
                options={options}
                onSelect={handleSelect}
                onSearch={handleSearch}
                value={searchValue}
            >
                <Input.Search
                    placeholder={isMobile ? "장소 검색" : "🔍 가고 싶은 장소를 검색하세요"}
                    loading={loading}
                    size={isMobile ? "middle" : "large"}
                    style={{
                        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                        borderRadius: isMobile ? '8px' : '12px',
                    }}
                />
            </AutoComplete>
        </div>
    );
}
