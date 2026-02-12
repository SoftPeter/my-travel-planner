import React from 'react';
import { Typography, Empty, theme, Button } from 'antd';
const { useToken } = theme;
import { EnvironmentOutlined, CompassOutlined, GlobalOutlined } from '@ant-design/icons';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Place, TravelSegment, TravelMode, ValidationResult } from '../types';
import { Grid } from 'antd';
const { useBreakpoint } = Grid;
import SmartCard from './SmartCard';
import DynamicGap from './DynamicGap';
import { generateMyLocationUrl } from '../utils/googleMaps';

const { Title, Text } = Typography;

interface ZoneBProps {
    places: Place[];
    segments: TravelSegment[];
    validationResults: ValidationResult[];
    editingPlaceId: number | null;
    loading?: boolean;
    onPlacesReorder: (places: Place[]) => void;
    onPlaceUpdate: (tempId: number, updates: Partial<Place>) => void;
    onPlaceRemove: (tempId: number) => void;
    onSegmentModeChange: (index: number, mode: TravelMode) => void;
    onEditingChange: (placeId: number | null) => void;
    onFocusedPlaceChange?: (placeId: number | null) => void;
    focusedPlaceId?: number | null;
}

/**
 * Zone B: 스토리보드 타임라인
 * 시간의 흐름을 시각화하는 중앙 타임라인
 */
export default function ZoneB_Timeline({
    places,
    segments,
    validationResults,
    editingPlaceId,
    loading,
    onPlacesReorder,
    onPlaceUpdate,
    onPlaceRemove,
    onSegmentModeChange,
    onEditingChange,
    onFocusedPlaceChange,
    focusedPlaceId,
}: ZoneBProps) {

    const { token } = useToken();
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const isDarkMode = token.colorBgContainer === '#141414' || token.colorBgContainer === '#000000';


    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    /**
     * 드래그 종료 핸들러
     */
    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = places.findIndex((p) => p.tempId === active.id);
            const newIndex = places.findIndex((p) => p.tempId === over.id);
            const reordered = arrayMove(places, oldIndex, newIndex);
            onPlacesReorder(reordered);
        }
    };

    return (
        <div className="timeline-inner" style={{
            padding: isMobile ? '12px 16px' : '24px',
            background: token.colorBgContainer, // 테마에 맞는 배경색
            borderRight: `1px solid ${token.colorBorderSecondary}`,
        }}>
            {/* 헤더 공간 절약을 위해 제거 */}


            {/* 타임라인 */}
            {places.length > 0 ? (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={places.map(p => p.tempId)}
                        strategy={verticalListSortingStrategy}
                    >
                        {places.map((place, index) => {
                            const segment = segments[index];
                            const validation = validationResults.find(v => v.placeIndex === index);
                            const isEditing = editingPlaceId === place.tempId;

                            // Google Maps URL 생성 (첫 번째 장소용)
                            const myLocationUrl = index === 0 ? generateMyLocationUrl(place.name) : '';

                            return (
                                <div
                                    key={place.tempId}
                                    data-id={place.tempId}
                                    className="smart-card-wrapper"
                                >
                                    {/* 첫 번째 장소 상단에 '현재 위치' 버튼 추가 */}
                                    {index === 0 && (
                                        <div style={{
                                            marginBottom: '12px',
                                            padding: '8px 16px',
                                            background: isDarkMode ? '#1f1f1f' : '#f8fafc',
                                            borderRadius: '12px',
                                            border: `1px solid ${isDarkMode ? '#303030' : '#e2e8f0'}`,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <CompassOutlined style={{ color: token.colorPrimary }} />
                                                <Text strong style={{ fontSize: '12px' }}>현지 도착 시 길찾기</Text>
                                            </div>
                                            <Button
                                                size="small"
                                                icon={<GlobalOutlined />}
                                                type="primary"
                                                style={{ backgroundColor: '#1a73e8', borderColor: '#1a73e8', fontSize: '11px', borderRadius: '6px' }}
                                                onClick={() => window.open(myLocationUrl, '_blank')}
                                            >
                                                현재 위치에서 {place.name} 경로
                                            </Button>
                                        </div>
                                    )}

                                    {/* Smart Card */}
                                    <SmartCard
                                        place={place}
                                        index={index}
                                        onRemove={onPlaceRemove}
                                        onUpdate={onPlaceUpdate}
                                        isEditing={isEditing}
                                        isFocused={focusedPlaceId === place.tempId}
                                        onEditStart={() => onEditingChange(place.tempId)}
                                        onFocus={() => {
                                            if (onFocusedPlaceChange) onFocusedPlaceChange(place.tempId);
                                        }}
                                    />

                                    {/* Dynamic Gap (마지막 카드 제외) */}
                                    {index < places.length - 1 && (
                                        <DynamicGap
                                            fromPlace={place}
                                            toPlace={places[index + 1]}
                                            segment={segment}
                                            mode={segment?.mode || 'WALKING'}
                                            onModeChange={(mode) => onSegmentModeChange(index, mode)}
                                            validationError={validation && !validation.isValid ? validation.message : undefined}
                                            loading={loading}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </SortableContext>
                </DndContext>
            ) : (
                <Empty
                    image={<EnvironmentOutlined style={{ fontSize: '64px', color: '#bfbfbf' }} />}
                    description={
                        <div>
                            <Text type="secondary" style={{ fontSize: '14px' }}>
                                지도에서 장소를 검색하여<br />
                                여행 코스를 만들어보세요!
                            </Text>
                        </div>
                    }
                    style={{ marginTop: '60px' }}
                />
            )}
        </div>
    );
}
