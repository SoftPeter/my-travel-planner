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
    CloseOutlined,
    SaveOutlined
} from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Place } from '../types';
import { Grid, Modal, Button as AntButton, App } from 'antd';

const { useBreakpoint } = Grid;

const { TextArea } = Input;
const { Text } = Typography;

// 상태별 아이콘 설정
const STATUS_ICONS = [
    { id: '1', key: 'booking', icon: <span style={{ fontSize: '13px' }}>📅</span>, label: '예약 완료', color: '#1890ff' },
    { id: '2', key: 'ticket', icon: <span style={{ fontSize: '13px' }}>🎫</span>, label: '티켓 구매', color: '#722ed1' },
    { id: '3', key: 'visit', icon: <span style={{ fontSize: '13px' }}>✅</span>, label: '방문 완료', color: '#52c41a' },
];

interface SmartCardProps {
    place: Place;
    index: number;
    onRemove: (tempId: number) => void;
    onUpdate: (tempId: number, updates: Partial<Place>) => void;
    isEditing: boolean;
    isFocused?: boolean; // 모바일 스크롤 연동 시 강조
    onEditStart: () => void;
    onFocus?: () => void; // 지도 이동 트리거
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
    isFocused,
    onEditStart,
    onFocus,
}: SmartCardProps) {
    const { message } = App.useApp();
    const { token } = useToken();
    const screens = useBreakpoint();
    const isMobile = !screens.md;

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
        const updatedChecklist = place.checklist.map((item: any) =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
        );
        onUpdate(place.tempId, { checklist: updatedChecklist });
    };

    const isAccommodation = place.type === 'accommodation';
    const isClosedToday = place.placeDetails?.closedOn && place.placeDetails.closedOn.length > 0;
    const isOpen = place.placeDetails?.isOpen;

    const isDarkMode = token.colorBgContainer === '#141414' || token.colorBgContainer === '#000000'; // AntD dark default

    // 카드 스타일 동적 계산
    const borderColor = (isEditing || (isMobile && isFocused)) ? token.colorPrimary : token.colorBorderSecondary;
    const cardBgColor = isEditing ? token.colorFillAlter : token.colorBgContainer;
    const titleColor = isAccommodation ? "#7c3aed" : (isEditing ? token.colorPrimary : token.colorText);

    // 활성화된 상태 아이콘 추출
    const activeStatusIcons = STATUS_ICONS.filter(status =>
        place.checklist.find((item: any) => item.id === status.id && item.checked)
    );

    // 모바일 전용 편집 모달 핸들러
    const handleMobileEditClose = () => {
        onEditStart(); // 토글 방식이므로 다시 호출하면 null이 됨
        message.success('수정사항이 저장되었습니다');
    };

    return (
        <div ref={setNodeRef} style={{ ...style, position: 'relative' }}>
            {/* 클릭 가능한 커스텀 번호 배지 (좌측 상단) */}
            <div
                onClick={(e) => {
                    e.stopPropagation(); // 카드 편집 모드 진입 방지
                    if (onFocus) onFocus();
                }}
                style={{
                    position: 'absolute',
                    top: -8,
                    left: -8,
                    zIndex: 10,
                    backgroundColor: isAccommodation ? "#7c3aed" : token.colorPrimary,
                    color: '#fff',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50% 50% 50% 0', // 물방울 모양 (좌측 하단이 뾰족한 형태는 아님, 일반적인 말풍선 느낌으로 조정하거나 원형+꼬리)
                    // 사용자가 "파란색 순번 아이콘"이라고 했으므로 심플한 원형이나 둥근 사각형 추천.
                    // 리본 느낌을 내기 위해 border-radius 조정.
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // 튕기는 효과
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                {index + 1}
            </div>

            <Card
                hoverable
                size={isMobile ? "default" : "small"}
                style={{
                    borderRadius: '12px',
                    border: `2px solid ${borderColor}`,
                    background: cardBgColor,
                    boxShadow: isEditing ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'all 0.3s ease',
                    minHeight: isMobile ? '90px' : 'auto', // 터치 영역 확보
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}
                onClick={onEditStart}
                actions={(!isMobile && isEditing) ? [
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
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '16px' : '12px' }}>
                    {/* 드래그 핸들 */}
                    <div
                        {...attributes}
                        {...listeners}
                        style={{
                            cursor: 'grab',
                            padding: isMobile ? '8px' : '4px',
                            borderRadius: '6px',
                            background: token.colorFillSecondary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MenuOutlined style={{ color: token.colorTextDescription, fontSize: isMobile ? '18px' : '14px' }} />
                    </div>

                    {/* 카드 내용 */}
                    <div style={{ flex: 1 }}>
                        <Space orientation="vertical" size={isMobile ? 4 : 2} style={{ width: '100%', paddingLeft: isMobile ? '8px' : '0' }}>
                            {/* 제목 영역 */}
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{
                                    fontWeight: 'bold',
                                    fontSize: isMobile ? '16px' : '14px',
                                    color: titleColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    flexWrap: 'wrap',
                                }}>
                                    {isAccommodation ? (
                                        <HomeOutlined style={{ color: '#7c3aed', fontSize: isMobile ? '15px' : '13px' }} />
                                    ) : (
                                        <EnvironmentOutlined style={{ color: token.colorPrimary, fontSize: isMobile ? '15px' : '13px' }} />
                                    )}
                                    {place.name}

                                    {/* 상태 아이콘 배지 (애니메이션 적용) */}
                                    {activeStatusIcons.length > 0 && (
                                        <div style={{ display: 'inline-flex', gap: '4px', marginLeft: '2px' }}>
                                            {activeStatusIcons.map(status => (
                                                <Tooltip key={status.id} title={status.label}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                                        fontSize: isMobile ? '14px' : '12px',
                                                        transformOrigin: 'center'
                                                    }}>
                                                        {status.icon}
                                                    </div>
                                                </Tooltip>
                                            ))}
                                            <style>{`
                                                @keyframes scaleIn {
                                                    from { transform: scale(0); opacity: 0; }
                                                    to { transform: scale(1); opacity: 1; }
                                                }
                                            `}</style>
                                        </div>
                                    )}

                                    {place.memo && <span style={{ marginLeft: '2px', fontSize: isMobile ? '14px' : '12px' }} title="메모 있음">📝</span>}
                                    {isAccommodation && <Badge status="processing" color="purple" text="숙소" style={{ marginLeft: '4px' }} />}

                                    {!isMobile && place.placeDetails?.rating && (
                                        <span style={{ fontSize: '11px', color: '#faad14', marginLeft: '4px' }}>
                                            <StarFilled /> {place.placeDetails.rating.toFixed(1)}
                                        </span>
                                    )}
                                </div>
                                <Text type="secondary" ellipsis style={{ fontSize: isMobile ? '12px' : '11px', maxWidth: isMobile ? '240px' : '280px' }}>
                                    {place.address}
                                </Text>
                            </div>

                            {/* 시간/예산 요약 (모바일에서는 가독성 강조) */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: isMobile ? '16px' : '12px',
                                marginTop: '4px',
                            }}>
                                <Space size={4} onClick={(e) => e.stopPropagation()}>
                                    <ClockCircleOutlined style={{ color: token.colorTextDescription, fontSize: isMobile ? '13px' : '11px' }} />
                                    {(!isMobile && isEditing) ? (
                                        <Input
                                            size="small"
                                            placeholder="HH:mm"
                                            value={place.startTime}
                                            style={{ width: '80px', fontSize: '11px' }}
                                            onChange={(e) => {
                                                let val = e.target.value.replace(/[^0-9]/g, '');
                                                if (val.length > 4) val = val.slice(0, 4);
                                                let formatted = val;
                                                if (val.length >= 3) {
                                                    formatted = val.slice(0, 2) + ':' + val.slice(2);
                                                }
                                                onUpdate(place.tempId, { startTime: formatted });
                                            }}
                                        />
                                    ) : (
                                        <Text style={{ fontSize: isMobile ? '13px' : '11px', fontWeight: isMobile ? 500 : 400 }}>
                                            {place.startTime || '시간 미설정'}
                                        </Text>
                                    )}
                                </Space>

                                <div style={{ height: '12px', width: '1px', background: token.colorBorderSecondary }} />

                                <Space size={4} onClick={(e) => e.stopPropagation()}>
                                    <DollarOutlined style={{ color: token.colorTextDescription, fontSize: isMobile ? '13px' : '11px' }} />
                                    {(!isMobile && isEditing) ? (
                                        <InputNumber
                                            size="small"
                                            min={0}
                                            value={place.budget}
                                            style={{ width: '100px', fontSize: '11px' }}
                                            onChange={(val) => onUpdate(place.tempId, { budget: val || 0 })}
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value) => value?.replace(/(,*)/g, '') as any}
                                        />
                                    ) : (
                                        <Text style={{ fontSize: isMobile ? '13px' : '11px', fontWeight: isMobile ? 500 : 400 }}>
                                            {place.budget > 0 ? `${place.budget.toLocaleString()}원` : '예산 미설정'}
                                        </Text>
                                    )}
                                </Space>
                            </div>

                            {/* PC 전용 아코디언 상세 모드 */}
                            {!isMobile && (
                                <Collapse
                                    ghost
                                    size="small"
                                    items={[
                                        {
                                            key: 'details',
                                            label: <Text type="secondary" style={{ fontSize: '11px' }}>상세 정보 & 메모</Text>,
                                            children: (
                                                <Space orientation="vertical" size={8} style={{ width: '100%' }}>
                                                    {/* 주요 상태 토글 (예약/티켓/방문) */}
                                                    <div style={{
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        gap: '12px',
                                                        padding: '8px',
                                                        background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                                        borderRadius: '8px',
                                                        border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
                                                    }}>
                                                        {place.checklist.map((item: any) => (
                                                            <Checkbox
                                                                key={item.id}
                                                                checked={item.checked}
                                                                onChange={() => handleChecklistToggle(item.id)}
                                                                style={{
                                                                    fontSize: '11px',
                                                                    fontWeight: item.checked ? 600 : 400,
                                                                    color: item.checked ? token.colorPrimary : token.colorTextDescription
                                                                }}
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
                                                </Space>
                                            )
                                        }
                                    ]}
                                    style={{ marginTop: '4px' }}
                                />
                            )}
                        </Space>
                    </div>
                </div>
            </Card>

            {/* 모바일 전용 전체 화면 편집 모달 */}
            {isMobile && (
                <Modal
                    title={null}
                    open={isEditing}
                    onCancel={handleMobileEditClose}
                    footer={null}
                    closeIcon={null}
                    className="mobile-full-modal"
                    styles={{ body: { padding: 0 } }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: isDarkMode ? '#141414' : '#fff' }}>
                        {/* 모달 헤더 */}
                        <div style={{
                            padding: '16px',
                            borderBottom: '1px solid #f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: isDarkMode ? '#1f1f1f' : '#fff',
                            paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))'
                        }}>
                            <AntButton type="text" icon={<CloseOutlined />} onClick={handleMobileEditClose} />
                            <Text strong style={{ fontSize: '16px' }}>장소 편집</Text>
                            <AntButton type="primary" size="small" icon={<SaveOutlined />} onClick={handleMobileEditClose}>저장</AntButton>
                        </div>

                        {/* 모바일 텍스트 마스킹 / 자동 포매팅 지원 함수 */}
                        <style>{`
                            .time-input-masked input {
                                letter-spacing: 1px;
                            }
                        `}</style>

                        {/* 모달 내용 */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                            <Space orientation="vertical" size={24} style={{ width: '100%' }}>
                                <div>
                                    <Text strong style={{ display: 'block', marginBottom: '8px' }}>📍 장소명</Text>
                                    <Input value={place.name} readOnly variant="filled" />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <Text strong style={{ display: 'block', marginBottom: '8px' }}>🕒 방문 시간</Text>
                                        <Input
                                            placeholder="예: 1400 → 14:00"
                                            value={place.startTime}
                                            inputMode="numeric"
                                            className="time-input-masked"
                                            onChange={(e) => {
                                                let val = e.target.value.replace(/[^0-9]/g, '');
                                                if (val.length > 4) val = val.slice(0, 4);

                                                let formatted = val;
                                                if (val.length >= 3) {
                                                    formatted = val.slice(0, 2) + ':' + val.slice(2);
                                                }
                                                onUpdate(place.tempId, { startTime: formatted });
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <Text strong style={{ display: 'block', marginBottom: '8px' }}>💰 예산(원)</Text>
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            min={0}
                                            value={place.budget}
                                            onChange={(val) => onUpdate(place.tempId, { budget: val || 0 })}
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value) => value?.replace(/(,*)/g, '') as any}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Text strong style={{ display: 'block', marginBottom: '8px' }}>📝 메모</Text>
                                    <TextArea
                                        placeholder="메모를 입력하세요..."
                                        value={place.memo}
                                        onChange={(e) => onUpdate(place.tempId, { memo: e.target.value })}
                                        autoSize={{ minRows: 4 }}
                                    />
                                </div>

                                <div>
                                    <Text strong style={{ display: 'block', marginBottom: '12px' }}>✅ 진행 상태 처리</Text>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                                        {place.checklist.map((item: any) => {
                                            const statusInfo = STATUS_ICONS.find(s => s.id === item.id);
                                            return (
                                                <div key={item.id} style={{
                                                    padding: '14px 16px',
                                                    background: item.checked
                                                        ? (isDarkMode ? 'rgba(24,144,255,0.15)' : 'rgba(24,144,255,0.05)')
                                                        : (isDarkMode ? '#1f1f1f' : '#f9f9f9'),
                                                    border: `1px solid ${item.checked ? token.colorPrimary : (isDarkMode ? '#303030' : '#f0f0f0')}`,
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    transition: 'all 0.2s ease'
                                                }} onClick={() => handleChecklistToggle(item.id)}>
                                                    <Checkbox checked={item.checked} />
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                                        <span style={{ fontSize: '18px' }}>{statusInfo?.icon}</span>
                                                        <Text strong={item.checked} style={{ color: item.checked ? token.colorPrimary : 'inherit' }}>
                                                            {item.label}
                                                        </Text>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
                                    <Popconfirm
                                        title="이 장소를 삭제하시겠습니까?"
                                        onConfirm={() => onRemove(place.tempId)}
                                        okText="삭제"
                                        cancelText="취소"
                                        okButtonProps={{ danger: true }}
                                    >
                                        <AntButton danger block size="large" icon={<DeleteOutlined />}>장소 삭제</AntButton>
                                    </Popconfirm>
                                </div>
                            </Space>
                        </div>
                    </div>
                </Modal>
            )}
        </div >
    );
}
