"use client";

import React from 'react';
import { Select, Typography, Alert, Spin, Tooltip, theme } from 'antd';
import { CarOutlined, ClockCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { TravelMode, TravelSegment, Place } from '../types';
import { TRAVEL_MODE_OPTIONS } from '../utils/constants';
import { calculateDirectDistance, estimateWalkingTime } from '../utils/timelineValidator';

const { Text } = Typography;

interface DynamicGapProps {
    fromPlace: Place;
    toPlace: Place;
    segment: TravelSegment | null;
    mode: TravelMode;
    onModeChange: (mode: TravelMode) => void;
    validationError?: string;
    loading?: boolean;
}

/**
 * Dynamic Gap (브릿지): 카드와 카드 사이의 이동 정보 표시
 */
export default function DynamicGap({
    fromPlace,
    toPlace,
    segment,
    mode,
    onModeChange,
    validationError,
    loading = false,
}: DynamicGapProps) {

    /**
     * 거리 포맷
     */
    const formatDistance = (meters: number): string => {
        if (meters < 1000) return `${meters.toFixed(0)}m`;
        return `${(meters / 1000).toFixed(1)}km`;
    };

    /**
     * 시간 포맷
     */
    const formatDuration = (minutes: number): string => {
        if (minutes < 60) return `${minutes}분`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
    };

    // 직선거리 계산 (Fallback)
    const directDistance = calculateDirectDistance(fromPlace.position, toPlace.position);
    const estimatedTime = estimateWalkingTime(directDistance);

    const { token } = theme.useToken();
    const isDarkMode = token.colorBgContainer === '#141414' || token.colorBgContainer === '#000000';

    return (
        <div style={{
            margin: '8px 0',
            padding: '10px 16px',
            background: validationError
                ? (isDarkMode ? 'rgba(255, 77, 79, 0.15)' : '#fff2e8')
                : (isDarkMode ? '#1f1f1f' : '#f8fafc'), // 기획: 배경보다 약간 더 밝은 다크 그레이
            borderRadius: '12px',
            border: validationError
                ? `1.5px solid ${token.colorError}`
                : `1px solid ${isDarkMode ? '#303030' : '#e2e8f0'}`, // 기획: 테두리를 살짝 주어 영역 정의
            boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.02)',
            transition: 'all 0.3s ease',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {/* 이동 수단 선택 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Select
                        size="small"
                        variant="borderless"
                        value={mode}
                        onChange={onModeChange}
                        style={{
                            width: '100px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: isDarkMode ? '#fff' : token.colorPrimary
                        }}
                        options={TRAVEL_MODE_OPTIONS.map(opt => ({
                            value: opt.value,
                            label: (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {opt.icon} {opt.label}
                                </span>
                            ),
                        }))}
                    />
                </div>

                {/* 이동 정보 (API 데이터 우선, 없으면 직선거리) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {segment ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CarOutlined style={{ color: isDarkMode ? '#fff' : token.colorPrimary, fontSize: '11px' }} />
                                <Text strong style={{
                                    fontSize: '11px',
                                    color: isDarkMode ? '#fff' : token.colorPrimary,
                                    textShadow: isDarkMode ? '0 0 4px rgba(0,0,0,0.5)' : 'none'
                                }}>
                                    {formatDistance(segment.distance)}
                                </Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <ClockCircleOutlined style={{ color: isDarkMode ? '#fff' : token.colorPrimary, fontSize: '11px' }} />
                                <Text strong style={{
                                    fontSize: '11px',
                                    color: isDarkMode ? '#fff' : token.colorPrimary,
                                    textShadow: isDarkMode ? '0 0 4px rgba(0,0,0,0.5)' : 'none'
                                }}>
                                    {formatDuration(segment.duration)}
                                </Text>
                            </div>
                        </>
                    ) : (
                        <Tooltip title="API 연동 전 직선거리 기준 예상치입니다.">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Text type="secondary" style={{ fontSize: '11px', fontStyle: 'italic', color: isDarkMode ? 'rgba(255,255,255,0.45)' : undefined }}>
                                    직선거리 약 {formatDistance(directDistance)} (주변 도보 {estimatedTime}분)
                                </Text>
                                {loading && <Spin size="small" style={{ marginLeft: '4px' }} />}
                            </div>
                        </Tooltip>
                    )}
                </div>
            </div>
            {/* 타임라인 정합성 체크 경고 */}
            {validationError && (
                <Alert
                    title={validationError}
                    type="error"
                    icon={<WarningOutlined />}
                    showIcon
                    style={{
                        marginTop: '8px',
                        fontSize: '11px',
                        padding: '4px 8px',
                        borderRadius: '6px'
                    }}
                />
            )}
        </div>
    );
}
