import { Typography, Empty, theme } from 'antd';
const { useToken } = theme;
import { EnvironmentOutlined } from '@ant-design/icons';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Place, TravelSegment, TravelMode, ValidationResult } from '../types';
import { Grid } from 'antd';
const { useBreakpoint } = Grid;
import SmartCard from './SmartCard';
import DynamicGap from './DynamicGap';

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
}: ZoneBProps) {

    // 드래그 센서 설정
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

    const { token } = useToken();
    const screens = useBreakpoint();
    const isMobile = !screens.md;

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

                            return (
                                <div key={place.tempId}>
                                    {/* Smart Card */}
                                    <SmartCard
                                        place={place}
                                        index={index}
                                        onRemove={onPlaceRemove}
                                        onUpdate={onPlaceUpdate}
                                        isEditing={isEditing}
                                        onEditStart={() => onEditingChange(place.tempId)}
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
