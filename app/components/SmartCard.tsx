"use client";

import React, { useState } from 'react';
import { Card, Input, InputNumber, Checkbox, Collapse, Badge, Space, Typography, Tooltip, Popconfirm, theme } from 'antd';
const { useToken } = theme;
import {
    DeleteOutlined,
    MenuOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    CheckSquareOutlined,
    StarFilled,
    HomeOutlined,
    CarOutlined,
} from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Place } from '../types';

const { TextArea } = Input;
const { Text } = Typography;

interface SmartCardProps {
    place: Place;
    index: number;
    onRemove: (tempId: number) => void;
    onUpdate: (tempId: number, updates: Partial<Place>) => void;
    isEditing: boolean;
    onEditStart: () => void;
}

/**
 * Smart Card: 장소 정보를 표시하고 편집할 수 있는 카드
 */
export default function SmartCard({
    place,
    index,
    onRemove,
    onUpdate,
    isEditing,
    onEditStart,
}: SmartCardProps) {
    const { token } = useToken();
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: place.tempId
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        marginBottom: '12px',
        zIndex: transform ? 999 : 1,
    };

    const handleChecklistToggle = (itemId: string) => {
        const updatedChecklist = place.checklist.map(item =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
        );
        onUpdate(place.tempId, { checklist: updatedChecklist });
    };

    const isAccommodation = place.type === 'accommodation';
    const isClosedToday = place.placeDetails?.closedOn && place.placeDetails.closedOn.length > 0;
    const isOpen = place.placeDetails?.isOpen;

    const isDarkMode = token.colorBgContainer === '#141414' || token.colorBgContainer === '#000000'; // AntD dark default

    // 카드 배경색 및 테두리 설정 (테마 토큰 활용)
    const cardBgColor = isEditing
        ? (isAccommodation ? (isDarkMode ? '#3b0a6b' : '#f9f0ff') : token.controlItemBgActive)
        : (isAccommodation ? (isDarkMode ? '#2d004d' : '#fffbfe') : token.colorBgContainer);

    const borderColor = isEditing
        ? (isAccommodation ? '#d3adf7' : token.colorPrimary)
        : (isAccommodation ? '#efdbff' : token.colorBorderSecondary);

    const titleColor = isEditing
        ? (isAccommodation ? '#d8b4fe' : token.colorPrimaryText)
        : (isAccommodation ? '#7c3aed' : token.colorText);

    return (
        <div ref={setNodeRef} style={style}>
            <Badge.Ribbon
                text={`${index + 1}`}
                color={isAccommodation ? "#7c3aed" : token.colorPrimary}
                style={{ fontSize: '14px', fontWeight: 'bold' }}
            >
                <Card
                    hoverable
                    size="small"
                    style={{
                        borderRadius: '12px',
                        border: `2px solid ${borderColor}`,
                        background: cardBgColor,
                        boxShadow: isEditing ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
                        transition: 'all 0.3s ease',
                    }}
                    onClick={onEditStart}
                    actions={isEditing ? [
                        <Popconfirm
                            key="delete"
                            title="장소를 삭제하시겠습니까?"
                            onConfirm={(e) => {
                                e?.stopPropagation();
                                onRemove(place.tempId);
                            }}
                            onCancel={(e) => e?.stopPropagation()}
                            okText="삭제"
                            cancelText="취소"
                            okButtonProps={{ danger: true }}
                        >
                            <DeleteOutlined onClick={(e) => e.stopPropagation()} style={{ color: '#ff4d4f', fontSize: '16px' }} />
                        </Popconfirm>
                    ] : []}
                >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        {/* 드래그 핸들 */}
                        <div
                            {...attributes}
                            {...listeners}
                            style={{
                                cursor: 'grab',
                                marginTop: '8px',
                                padding: '4px',
                                borderRadius: '4px',
                                background: token.colorFillSecondary,
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MenuOutlined style={{ color: token.colorTextDescription, fontSize: '14px' }} />
                        </div>

                        {/* 카드 내용 */}
                        <div style={{ flex: 1 }}>
                            <Space orientation="vertical" size={2} style={{ width: '100%' }}>
                                {/* 제목 영역 */}
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{
                                        fontWeight: 'bold',
                                        fontSize: '14px',
                                        color: titleColor,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        flexWrap: 'wrap',
                                    }}>
                                        {isAccommodation ? (
                                            <HomeOutlined style={{ color: '#7c3aed', fontSize: '13px' }} />
                                        ) : (
                                            <EnvironmentOutlined style={{ color: token.colorPrimary, fontSize: '13px' }} />
                                        )}
                                        {place.name}
                                        {isAccommodation && <Badge status="processing" color="purple" text="숙소" style={{ marginLeft: '4px' }} />}

                                        {place.placeDetails?.rating && (
                                            <span style={{ fontSize: '11px', color: '#faad14', marginLeft: '4px' }}>
                                                <StarFilled /> {place.placeDetails.rating.toFixed(1)}
                                            </span>
                                        )}
                                        {isClosedToday && <Badge count="휴무일" style={{ backgroundColor: '#ff4d4f', marginLeft: '4px' }} />}
                                        {isOpen !== undefined && (
                                            <Badge status={isOpen ? 'success' : 'error'} text={isOpen ? '영업 중' : '종료'} style={{ marginLeft: '4px' }} />
                                        )}
                                    </div>
                                    <Text type="secondary" ellipsis style={{ fontSize: '11px', maxWidth: '280px' }}>
                                        {place.address}
                                    </Text>
                                </div>

                                {/* 하이브리드 시간/예산 입력 영역 */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    marginTop: '4px',
                                    background: isEditing ? (isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.8)') : 'transparent',
                                    padding: isEditing ? '4px 8px' : '0',
                                    borderRadius: '6px',
                                    border: isEditing ? `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}` : 'none'
                                }}>
                                    <Space size={4}>
                                        <ClockCircleOutlined style={{ color: token.colorTextDescription, fontSize: '11px' }} />
                                        {isEditing ? (
                                            <Input
                                                size="small"
                                                variant="filled"
                                                placeholder="HH:mm"
                                                value={place.startTime}
                                                onChange={(e) => onUpdate(place.tempId, { startTime: e.target.value })}
                                                style={{
                                                    width: '70px',
                                                    fontSize: '11px',
                                                    textAlign: 'center',
                                                    color: isDarkMode ? '#fff' : 'inherit'
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        ) : (
                                            <Text style={{ fontSize: '11px' }}>{place.startTime || '시간 미설정'}</Text>
                                        )}
                                    </Space>

                                    <div style={{ height: '12px', width: '1px', background: token.colorBorderSecondary }} />

                                    <Space size={4}>
                                        <DollarOutlined style={{ color: token.colorTextDescription, fontSize: '11px' }} />
                                        {isEditing ? (
                                            <InputNumber
                                                size="small"
                                                variant="filled"
                                                placeholder="예산"
                                                min={0}
                                                value={place.budget}
                                                onChange={(val) => onUpdate(place.tempId, { budget: val || 0 })}
                                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={(value) => value?.replace(/(,*)/g, '') as any}
                                                style={{ width: '90px', fontSize: '11px' }}
                                                onClick={(e) => e.stopPropagation()}
                                                controls={false}
                                            />
                                        ) : (
                                            <Text style={{ fontSize: '11px' }}>{place.budget.toLocaleString()}원</Text>
                                        )}
                                    </Space>
                                </div>

                                {/* 아코디언 상세 모드 (편집 시 또는 명시적 확장 시) */}
                                <Collapse
                                    ghost
                                    size="small"
                                    items={[
                                        {
                                            key: 'details',
                                            label: <Text type="secondary" style={{ fontSize: '11px' }}>상세 정보 & 메모</Text>,
                                            children: (
                                                <Space orientation="vertical" size={8} style={{ width: '100%' }}>
                                                    {/* 체크리스트 */}
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                        {place.checklist.map(item => (
                                                            <Checkbox
                                                                key={item.id}
                                                                checked={item.checked}
                                                                onChange={() => handleChecklistToggle(item.id)}
                                                                style={{ fontSize: '11px' }}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {item.label}
                                                            </Checkbox>
                                                        ))}
                                                    </div>

                                                    {/* 메모 입력 */}
                                                    <TextArea
                                                        placeholder="여기에 메모를 입력하세요..."
                                                        value={place.memo}
                                                        onChange={(e) => onUpdate(place.tempId, { memo: e.target.value })}
                                                        autoSize={{ minRows: 1, maxRows: 4 }}
                                                        style={{ fontSize: '11px', borderRadius: '6px' }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />

                                                    {/* 부가 정보 UI */}
                                                    {place.placeDetails && (
                                                        <div style={{ fontSize: '10px', color: '#64748b' }}>
                                                            {place.placeDetails.phoneNumber && <div>📞 {place.placeDetails.phoneNumber}</div>}
                                                            <Space size={8} style={{ marginTop: '2px' }}>
                                                                <a href={`https://www.google.com/maps/search/?api=1&query=${place.name}&query_place_id=${place.placeId}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                                                                    📍 구글맵 보기
                                                                </a>
                                                                {place.placeDetails.website && (
                                                                    <a href={place.placeDetails.website} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                                                                        🌐 웹사이트
                                                                    </a>
                                                                )}
                                                            </Space>
                                                        </div>
                                                    )}
                                                </Space>
                                            )
                                        }
                                    ]}
                                    style={{ marginTop: '4px' }}
                                />
                            </Space>
                        </div>
                    </div>
                </Card>
            </Badge.Ribbon>
        </div>
    );
}
