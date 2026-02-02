"use client";

import React from 'react';
import { Card, Typography, Button, Space, Badge, Tooltip, DatePicker, theme, App } from 'antd';
const { useToken } = theme;
import { PlusOutlined, CalendarOutlined, CarOutlined, ClockCircleOutlined, DollarOutlined, UserOutlined, MedicineBoxOutlined, SettingOutlined } from '@ant-design/icons';
import { Day, TravelMode } from '../types';
import { format, addDays, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import dayjs from 'dayjs';
import { Grid } from 'antd';

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

interface ZoneAProps {
    days: Day[];
    currentDayId: string;
    startDate: string;
    onDaySelect: (dayId: string) => void;
    onAddDay: () => void;
    onRemoveDay: (dayId: string) => void;
    onStartDateChange: (date: string) => void;
}

/**
 * Zone A: 일차별 퀵 내비게이터
 * 전체 일정의 뼈대를 보여주고, 각 날짜별 요약 정보 표시
 */
export default function ZoneA_DayNavigator({
    days,
    currentDayId,
    startDate,
    onDaySelect,
    onAddDay,
    onRemoveDay,
    onStartDateChange,
}: ZoneAProps) {

    /**
     * 거리를 km 단위로 포맷
     */
    const formatDistance = (meters: number): string => {
        if (meters < 1000) return `${meters}m`;
        return `${(meters / 1000).toFixed(1)}km`;
    };

    /**
     * 시간을 시간/분 단위로 포맷
     */
    const formatDuration = (minutes: number): string => {
        if (minutes < 60) return `${minutes}분`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
    };

    /**
     * 예산을 포맷 (천 단위 콤마)
     */
    const formatBudget = (amount: number): string => {
        return `₩${amount.toLocaleString()}`;
    };

    /**
     * 날짜 포맷 (date-fns 사용)
     */
    const formatDate = (index: number): string => {
        if (!startDate) return `Day ${index + 1}`;
        const date = addDays(parseISO(startDate), index);
        return format(date, 'MM/dd (eee)', { locale: ko });
    };

    /**
     * 일정이 과한지 체크 (총 이동 시간 + 체류 시간이 12시간 이상)
     */
    const isOverloaded = (day: Day): boolean => {
        const totalTime = day.totalDuration + day.places.reduce((sum, p) => sum + p.duration, 0);
        return totalTime > 720; // 12시간
    };

    /**
     * 가장 많이 사용된 이동 수단을 반환 (다수결)
     */
    const getRepresentativeMode = (modes: TravelMode[]): TravelMode => {
        if (!modes || modes.length === 0) return 'DRIVING';

        const counts: Record<string, number> = {};
        modes.forEach(m => {
            counts[m] = (counts[m] || 0) + 1;
        });

        return Object.keys(counts).reduce((a, b) => counts[a] >= counts[b] ? a : b) as TravelMode;
    };

    const { modal, message: antdMessage } = App.useApp();
    const { token } = useToken();
    const isDarkMode = token.colorBgContainer === '#141414' || token.colorBgContainer === '#000000';
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    // 롱프레서 타이머
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);

    const handleLongPress = (dayId: string, dayIndex: number) => {
        if (days.length <= 1) {
            antdMessage.warning('최소 한 개의 날짜는 유지해야 합니다.');
            return;
        }

        modal.confirm({
            title: `Day ${dayIndex + 1} 삭제`,
            content: `Day ${dayIndex + 1}의 모든 일정이 삭제되며, 이후 일정이 하루씩 당겨집니다. 삭제하시겠습니까?`,
            okText: '삭제',
            okType: 'danger',
            cancelText: '취소',
            maskClosable: true,
            onOk: () => onRemoveDay(dayId),
        });
    };

    const onTouchStart = (dayId: string, index: number) => {
        timerRef.current = setTimeout(() => {
            handleLongPress(dayId, index);
            timerRef.current = null;
        }, 600);
    };

    const onTouchEnd = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    // 모바일 뷰: 수평 스크롤 가능한 칩 형태
    if (isMobile) {
        return (
            <div style={{
                background: isDarkMode ? '#1f1f1f' : '#fff',
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                padding: '12px 16px',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch',
                }}>
                    <style>{`
                        .mobile-day-nav::-webkit-scrollbar { display: none; }
                    `}</style>
                    <div className="mobile-day-nav" style={{ display: 'flex', gap: '8px' }}>
                        {days.map((day, index) => {
                            const isSelected = day.id === currentDayId;
                            return (
                                <div
                                    key={day.id}
                                    onClick={() => onDaySelect(day.id)}
                                    onContextMenu={(e) => { e.preventDefault(); handleLongPress(day.id, index); }}
                                    onTouchStart={() => onTouchStart(day.id, index)}
                                    onTouchEnd={onTouchEnd}
                                    onTouchMove={onTouchEnd}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        background: isSelected ? token.colorPrimary : (isDarkMode ? '#303030' : '#f0f2f5'),
                                        color: isSelected ? '#fff' : (isDarkMode ? '#d9d9d9' : '#595959'),
                                        fontWeight: isSelected ? 'bold' : 'normal',
                                        whiteSpace: 'nowrap',
                                        cursor: 'pointer',
                                        border: `1px solid ${isSelected ? token.colorPrimary : (isDarkMode ? '#434343' : '#d9d9d9')}`,
                                        fontSize: '14px',
                                        transition: 'all 0.2s',
                                        userSelect: 'none',
                                        WebkitUserSelect: 'none',
                                    }}
                                >
                                    Day {index + 1}
                                </div>
                            );
                        })}
                        <Tooltip title="날짜 추가">
                            <Button
                                type="dashed"
                                shape="circle"
                                icon={<PlusOutlined />}
                                onClick={onAddDay}
                                style={{ flexShrink: 0 }}
                            />
                        </Tooltip>
                        <Tooltip title="길게 눌러 날짜 삭제">
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                color: isDarkMode ? '#8c8c8c' : '#bfbfbf',
                                fontSize: '11px',
                                gap: '4px',
                                whiteSpace: 'nowrap',
                                paddingLeft: '8px'
                            }}>
                                <Text type="secondary" style={{ fontSize: '10px' }}>롱프레스 삭제</Text>
                            </div>
                        </Tooltip>
                        <DatePicker
                            value={startDate ? dayjs(startDate) : null}
                            onChange={(date) => {
                                if (date) {
                                    onStartDateChange(date.format('YYYY-MM-DD'));
                                }
                            }}
                            picker="date"
                            inputReadOnly
                            suffixIcon={<SettingOutlined />}
                            style={{
                                width: '40px',
                                padding: 0,
                                border: 'none',
                                background: 'transparent',
                                flexShrink: 0
                            }}
                            allowClear={false}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="daynav-inner" style={{
            padding: '20px',
            background: isDarkMode ? '#000000' : token.colorBgContainer, // 다크모드에서 더 깊은 배경
            borderRight: `1px solid ${token.colorBorderSecondary}`,
        }}>
            {/* 여행 설정 */}
            <div style={{ marginBottom: '20px' }}>
                <Title level={5} style={{ margin: 0, marginBottom: '4px' }}>
                    ✈️ 여행 설정
                </Title>
                <div style={{ marginBottom: '16px' }}>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                        여행 시작일
                    </Text>
                    <DatePicker
                        value={startDate ? dayjs(startDate) : null}
                        onChange={(date) => {
                            if (date) {
                                onStartDateChange(date.format('YYYY-MM-DD'));
                            }
                        }}
                        style={{ width: '100%' }}
                        placeholder="시작일 선택"
                        allowClear={false}
                    />
                </div>
                <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={onAddDay}
                    block
                    style={{ borderRadius: '8px' }}
                >
                    날짜 추가 (D+{days.length})
                </Button>
            </div>

            {/* 일차별 카드 */}
            <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                {days.map((day, index) => {
                    const isSelected = day.id === currentDayId;
                    const overloaded = isOverloaded(day);

                    return (
                        <Badge.Ribbon
                            key={day.id}
                            text={overloaded ? '⚠️ 과밀' : undefined}
                            color={overloaded ? 'red' : undefined}
                        >
                            <Card
                                hoverable
                                onClick={() => onDaySelect(day.id)}
                                style={{
                                    borderRadius: '12px',
                                    border: isSelected ? `2px solid ${token.colorPrimary}` : `1px solid ${isDarkMode ? '#303030' : '#e8e8e8'}`,
                                    background: isSelected
                                        ? (overloaded ? (isDarkMode ? '#5a1a1a' : '#fff1f0') : (isDarkMode ? token.colorPrimary : '#e6f7ff'))
                                        : 'transparent',
                                    cursor: 'pointer',
                                    boxShadow: isSelected ? `0 4px 12px ${isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(24, 144, 255, 0.2)'}` : 'none',
                                    transition: 'all 0.3s ease',
                                }}
                                styles={{ body: { padding: '16px' } }}
                            >
                                {/* 날짜 */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '12px',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <CalendarOutlined style={{ color: isSelected && isDarkMode ? '#fff' : token.colorPrimary, fontSize: '16px' }} />
                                        <Text strong style={{
                                            fontSize: '15px',
                                            color: isSelected && isDarkMode ? '#fff' : token.colorText,
                                            fontWeight: isSelected ? 700 : 600
                                        }}>
                                            Day {index + 1} - {formatDate(index)}
                                        </Text>
                                    </div>
                                    <Badge count={day.places.length} style={{ backgroundColor: isSelected && isDarkMode ? '#fff' : '#52c41a', color: isSelected && isDarkMode ? token.colorPrimary : '#fff' }} />
                                </div>

                                {/* 요약 정보 (종합 요약 칩 방식) */}
                                {day.places.length > 0 ? (
                                    <Space orientation="vertical" size={10} style={{ width: '100%' }}>
                                        {/* 이동 수단별 상세 요약 (기획 요구: 모든 수단 나열) */}
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            columnGap: '10px',
                                            rowGap: '4px',
                                            padding: '10px',
                                            background: isSelected && isDarkMode ? 'rgba(255,255,255,0.15)' : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                                            borderRadius: '8px',
                                            border: isSelected && isDarkMode ? '1px solid rgba(255,255,255,0.2)' : 'none'
                                        }}>
                                            {day.modeStats && Object.keys(day.modeStats).length > 0 ? (
                                                Object.entries(day.modeStats).map(([mode, stats], idx, arr) => (
                                                    <div key={mode} style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        fontSize: '11px',
                                                        color: isSelected && isDarkMode ? '#FFFFFF' : token.colorTextDescription,
                                                        fontWeight: isSelected ? 700 : 500
                                                    }}>
                                                        {mode === 'WALKING' ? <UserOutlined style={{ fontSize: '10px' }} /> :
                                                            mode === 'TRANSIT' ? <MedicineBoxOutlined style={{ fontSize: '10px' }} /> :
                                                                <CarOutlined style={{ fontSize: '10px' }} />}
                                                        <span>{formatDistance(stats.distance)}</span>
                                                        {idx < arr.length - 1 && <span style={{ opacity: 0.5, marginLeft: '4px' }}>/</span>}
                                                    </div>
                                                ))
                                            ) : (
                                                <Text style={{
                                                    fontSize: '11px',
                                                    color: isSelected && isDarkMode ? '#FFFFFF' : token.colorTextDescription,
                                                    fontWeight: isSelected ? 700 : 500
                                                }}>
                                                    {formatDistance(day.totalDistance)}
                                                </Text>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Space size={12}>
                                                <Tooltip title="총 이동 시간">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <ClockCircleOutlined style={{ color: isSelected && isDarkMode ? '#FFFFFF' : token.colorTextDescription, fontSize: '11px' }} />
                                                        <Text style={{
                                                            fontSize: '11px',
                                                            color: isSelected && isDarkMode ? '#FFFFFF' : token.colorTextDescription,
                                                            fontWeight: isSelected ? 700 : 500
                                                        }}>
                                                            {formatDuration(day.totalDuration)}
                                                        </Text>
                                                    </div>
                                                </Tooltip>
                                                <Tooltip title="총 예산">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <DollarOutlined style={{ color: isSelected && isDarkMode ? '#FFFFFF' : token.colorTextDescription, fontSize: '11px' }} />
                                                        <Text style={{
                                                            fontSize: '11px',
                                                            color: isSelected && isDarkMode ? '#FFFFFF' : token.colorTextDescription,
                                                            fontWeight: isSelected ? 700 : 500
                                                        }}>
                                                            {formatBudget(day.totalBudget)}
                                                        </Text>
                                                    </div>
                                                </Tooltip>
                                            </Space>
                                        </div>
                                    </Space>
                                ) : (
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        장소를 추가해주세요
                                    </Text>
                                )}
                            </Card>
                        </Badge.Ribbon>
                    );
                })}
            </Space>

            {/* 빈 상태 */}
            {days.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    background: 'white',
                    borderRadius: '12px',
                    border: '2px dashed #d9d9d9',
                }}>
                    <CalendarOutlined style={{ fontSize: '48px', color: '#bfbfbf', marginBottom: '16px' }} />
                    <Text type="secondary" style={{ display: 'block', fontSize: '14px' }}>
                        날짜 추가 버튼을 눌러<br />여행 일정을 시작하세요!
                    </Text>
                </div>
            )}
        </div>
    );
}
