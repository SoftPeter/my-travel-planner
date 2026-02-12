"use client";

import React from 'react';
import { Select, Typography, Alert, Spin, Tooltip, theme, Button, Space } from 'antd';
import { CarOutlined, ClockCircleOutlined, WarningOutlined, CompassOutlined, GlobalOutlined } from '@ant-design/icons';
import { TravelMode, TravelSegment, Place } from '../types';
import { TRAVEL_MODE_OPTIONS } from '../utils/constants';
import { calculateDirectDistance, estimateWalkingTime } from '../utils/timelineValidator';
import { generateGoogleMapsUrl, generateMyLocationUrl } from '../utils/googleMaps';
import { Grid } from 'antd';

const { useBreakpoint } = Grid;
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
 * Dynamic Gap (브릿지): 카드와 카드 사이의 이동 정보 표시 및 구글 맵 연동
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
    const { token } = theme.useToken();
    const screens = useBreakpoint();
    const isMobile = !screens.md;

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

    const isDarkMode = token.colorBgContainer === '#141414' || token.colorBgContainer === '#000000';

    // Google Maps 모드 매핑
    const getGoogleTravelMode = (m: TravelMode): any => {
        return m.toLowerCase() as any;
    };

    const handleOpenPlanningMap = () => {
        const url = generateGoogleMapsUrl({
            origin: fromPlace.name, // 명칭 우선 사용 (좌표보다 검색 결과가 더 정확할 수 있음)
            destination: toPlace.name,
            travelmode: getGoogleTravelMode(mode)
        });
        window.open(url, '_blank');
    };

    const handleOpenMyLocationMap = () => {
        const url = generateMyLocationUrl(
            toPlace.name,
            getGoogleTravelMode(mode)
        );
        window.open(url, '_blank');
    };

    return (
        <div style={{
            margin: '8px 0',
            padding: '12px 16px',
            background: validationError
                ? (isDarkMode ? 'rgba(255, 77, 79, 0.15)' : '#fff2e8')
                : (isDarkMode ? '#1f1f1f' : '#f8fafc'),
            borderRadius: '12px',
            border: validationError
                ? `1.5px solid ${token.colorError}`
                : `1px solid ${isDarkMode ? '#303030' : '#e2e8f0'}`,
            boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.02)',
            transition: 'all 0.3s ease',
        }}>
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: '12px',
                justifyContent: 'space-between'
            }}>
                {/* 왼쪽: 이동 수단 및 정보 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <Select
                        size="small"
                        variant="borderless"
                        value={mode}
                        onChange={onModeChange}
                        style={{
                            width: '105px',
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

                    {segment ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CarOutlined style={{ color: isDarkMode ? '#aaa' : '#8c8c8c', fontSize: '12px' }} />
                                <Text strong style={{ fontSize: '12px' }}>{formatDistance(segment.distance)}</Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <ClockCircleOutlined style={{ color: isDarkMode ? '#aaa' : '#8c8c8c', fontSize: '12px' }} />
                                <Text strong style={{ fontSize: '12px' }}>{formatDuration(segment.duration)}</Text>
                            </div>
                        </div>
                    ) : (
                        <Tooltip title="API 연동 전 직선거리 기준 예상치입니다.">
                            <Text type="secondary" style={{ fontSize: '11px', fontStyle: 'italic' }}>
                                약 {formatDistance(directDistance)} ({estimatedTime}분)
                                {loading && <Spin size="small" style={{ marginLeft: '6px' }} />}
                            </Text>
                        </Tooltip>
                    )}
                </div>

                {/* 오른쪽: 구글 맵 버튼 (Responsive) */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    width: isMobile ? '100%' : 'auto',
                    marginTop: isMobile ? '4px' : 0
                }}>
                    <Button
                        type="primary"
                        size="small"
                        icon={<GlobalOutlined />}
                        onClick={handleOpenPlanningMap}
                        style={{
                            flex: isMobile ? 1 : 'none',
                            backgroundColor: '#1a73e8', // Google Blue
                            borderColor: '#1a73e8',
                            fontSize: '11px',
                            fontWeight: 500,
                            borderRadius: '6px'
                        }}
                    >
                        {isMobile ? '이전 출발' : `${fromPlace.name}에서 가는 법`}
                    </Button>
                    <Button
                        size="small"
                        icon={<CompassOutlined />}
                        onClick={handleOpenMyLocationMap}
                        style={{
                            width: isMobile ? 'auto' : '32px',
                            padding: isMobile ? '0 12px' : 0,
                            fontSize: '11px',
                            borderRadius: '6px'
                        }}
                    >
                        {isMobile && '현위치'}
                    </Button>
                </div>
            </div>

            {/* 타임라인 정합성 체크 경고 */}
            {validationError && (
                <Alert
                    message={validationError}
                    type="error"
                    icon={<WarningOutlined />}
                    showIcon
                    style={{
                        marginTop: '10px',
                        fontSize: '11px',
                        padding: '4px 12px',
                        borderRadius: '6px'
                    }}
                />
            )}
        </div>
    );
}
