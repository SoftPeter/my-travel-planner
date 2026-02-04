"use client";

import React, { useState, useEffect } from 'react';
import { Layout, Typography, Space, Badge, Tooltip, ConfigProvider, theme, Button, App, Input, Modal, Tabs, Grid } from 'antd';
import {
  CheckCircleFilled,
  LoadingOutlined,
  WalletOutlined,
  CompassOutlined,
  EnvironmentOutlined,
  BulbOutlined,
  BulbFilled,
  ArrowLeftOutlined,
  EditOutlined,
  DownloadOutlined,
  PictureOutlined,
  MenuOutlined,
  PlusOutlined,
  ShareAltOutlined,
  CloudSyncOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';
import { Drawer } from 'antd';
import { useRouter, useParams } from 'next/navigation';
import { Trip, Day, Place, TravelMode } from '../../types';
import { DEFAULT_CHECKLIST, DEFAULT_DURATION } from '../../utils/constants';
import { saveTrip, getTrip } from '../../utils/localStorage';
import { exportTripToFile } from '../../utils/fileHandler';
import { validateTimeline } from '../../utils/timelineValidator';
import { GRADIENT_PRESETS, IMAGE_PRESETS, getRecommendedCover } from '../../utils/coverPresets';
import { useDirections } from '../../hooks/useDirections';
import ZoneA_DayNavigator from '../../components/ZoneA_DayNavigator';
import ZoneB_Timeline from '../../components/ZoneB_Timeline';
import ZoneC_MapEngine from '../../components/ZoneC_MapEngine';
import { useTripData } from '../../hooks/useTripData';

// ...

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

interface TravelPlannerProps {
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

function TravelPlanner({ isDarkMode, setIsDarkMode }: TravelPlannerProps) {
  const { message } = App.useApp();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const screens = useBreakpoint();
  const isMobile = !screens.md;



  // Firebase 실시간 데이터 훅 사용
  const { trip: remoteTrip, setTrip: setRemoteTrip, loading: dataLoading, isSaving } = useTripData(id);

  // 로컬 초기화 상태 (새 여행 생성 시)
  const [initialized, setInitialized] = useState(false);

  // 전체 여행 데이터 (로컬 상태 제거 -> 훅 데이터 사용)
  const trip: Trip = remoteTrip || {
    id: id || '',
    days: [],
    currentDayId: '',
    tripName: '로딩 중...',
    startDate: new Date().toISOString().split('T')[0],
  };

  // 현재 선택된 일차 ID (로컬 전용 상태로 관리하여 다른 사용자와 동기화되지 않음)
  const [currentDayId, setCurrentDayId] = useState<string>('');

  // 데이터 로드 시 초기 일차 설정
  useEffect(() => {
    if (trip.days.length > 0 && !currentDayId) {
      setCurrentDayId(trip.days[0].id);
    }
  }, [trip.days, currentDayId]);


  // 데이터가 없으면 초기화 (새 여행)
  useEffect(() => {
    if (!dataLoading && !remoteTrip && !initialized && id) {
      const newTrip: Trip = {
        id: id,
        tripName: '나의 여행',
        startDate: new Date().toISOString().split('T')[0],
        days: [{
          id: 'day-1',
          date: new Date().toISOString().split('T')[0],
          places: [],
          travelModes: [],
          totalDistance: 0,
          totalDuration: 0,
          totalBudget: 0
        }],
        currentDayId: 'day-1',
      };
      setRemoteTrip(newTrip);
      setInitialized(true);
    }
  }, [dataLoading, remoteTrip, initialized, id, setRemoteTrip]);

  // Trip Setter Wrapper
  const setTrip = (newTrip: Trip | ((prev: Trip) => Trip)) => {
    if (typeof newTrip === 'function') {
      // 함수형 업데이트 지원을 위해 현재 trip 값 사용
      setRemoteTrip(newTrip(trip));
    } else {
      setRemoteTrip(newTrip);
    }
  };

  // 현재 선택된 날짜의 장소들
  const currentDay = trip.days.find(d => d.id === currentDayId);

  // useMemo를 사용하여 places 배열의 참조 안정성 확보 (무한 루프 방지 핵심)
  const places = React.useMemo(() => {
    return currentDay?.places || [];
  }, [currentDay ? JSON.stringify(currentDay.places) : '']);

  // 이동 수단 (각 구간별)
  const [travelModes, setTravelModes] = useState<TravelMode[]>([]);

  // 편집 중인 장소 ID
  const [editingPlaceId, setEditingPlaceId] = useState<number | null>(null);

  // (모바일 전용) 스크롤에 의해 포커스된 장소 ID
  const [focusedPlaceId, setFocusedPlaceId] = useState<number | null>(null);

  // 모바일 메뉴(햄버거) 열림 상태
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Google Directions API로 이동 정보 가져오기
  const { segments, loading: directionsLoading } = useDirections(places, travelModes);

  // 타임라인 정합성 체크
  const validationResults = validateTimeline(places, segments);

  // 전역 통계 정보 (대시보드용) - 실시간성 확보
  const currentDayStats = {
    distance: segments?.reduce((sum, s) => sum + (s.distance || 0), 0) || 0,
    budget: places?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0,
  };

  const globalStats = {
    totalDays: trip.days?.length || 0,
    totalPlaces: trip.days?.reduce((sum, d) => sum + (d.places?.length || 0), 0) || 0,
    // 현재 일차의 데이터는 trip.days의 이전 데이터 대신 실시간 계산된 값을 우선 사용
    totalBudget: trip.days?.reduce((sum, d) => {
      if (d.id === trip.currentDayId) return sum + currentDayStats.budget;
      return sum + (d.totalBudget || 0);
    }, 0) || 0,
    totalDistance: trip.days?.reduce((sum, d) => {
      if (d.id === trip.currentDayId) return sum + currentDayStats.distance;
      return sum + (d.totalDistance || 0);
    }, 0) || 0,
  };
  // 공유 기능 핸들러
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        message.success('여행 공유 링크가 복사되었습니다! ✈️', 1.5);
      });
    }
  };





  /**
   * 시작일 변경
   */
  const handleStartDateChange = (date: string) => {
    setTrip(prev => {
      if (prev.startDate === date) return prev;
      return { ...prev, startDate: date };
    });
  };

  /**
   * 날짜 추가
   */
  const addDay = () => {
    const newDay: Day = {
      id: `day-${Date.now()}`,
      date: '', // startDate 기준으로 자동 계산됨
      places: [],
      travelModes: [], // 초기값
      totalDistance: 0,
      totalDuration: 0,
      totalBudget: 0,
    };

    setTrip(prev => ({
      ...prev,
      days: [...prev.days, newDay],
      currentDayId: prev.currentDayId || newDay.id,
    }));
  };

  /**
   * 날짜 선택
   */
  const selectDay = (dayId: string) => {
    const selectedDay = trip.days.find(d => d.id === dayId);
    if (selectedDay) {
      // 해당 날짜의 이동 수단들로 UI 상태 동기화
      setTravelModes(selectedDay.travelModes || []);
    }
    setCurrentDayId(dayId);
    setEditingPlaceId(null);
  };

  /**
   * 장소 선택/해제 토글
   */
  const togglePlaceSelection = (tempId: number | null) => {
    setEditingPlaceId(prev => (prev === tempId ? null : tempId));
  };

  /**
   * 날짜 삭제
   */
  const removeDay = (dayId: string) => {
    const deletedIndex = trip.days.findIndex(d => d.id === dayId);
    const newDays = trip.days.filter(d => d.id !== dayId);

    // 삭제 후 어떤 날짜를 선택할지 결정
    let nextDayId = currentDayId;
    if (currentDayId === dayId) {
      if (newDays.length > 0) {
        const nextIndex = Math.min(deletedIndex, newDays.length - 1);
        nextDayId = newDays[nextIndex].id;
      } else {
        nextDayId = '';
      }
    }

    setTrip(prev => ({
      ...prev,
      days: newDays,
    }));
    setCurrentDayId(nextDayId);
  };

  /**
   * 장소 추가
   */
  const addPlace = (placeData: Partial<Place>) => {
    if (!currentDayId) {
      message.warning('먼저 날짜를 추가해주세요!');
      return;
    }

    const newPlace: Place = {
      tempId: Date.now(),
      placeId: placeData.placeId || '',
      name: placeData.name || '',
      address: placeData.address || '',
      position: placeData.position || { lat: 0, lng: 0 },
      startTime: '',
      duration: DEFAULT_DURATION,
      budget: 0,
      memo: '',
      checklist: [...DEFAULT_CHECKLIST],
    };

    updateCurrentDay(day => ({
      ...day,
      places: [...day.places, newPlace],
    }));

    // 이동 수단 기본값 추가
    setTravelModes(prev => [...prev, 'WALKING']);

    message.success(`${newPlace.name} 추가 완료!`);
  };

  /**
   * 장소 업데이트
   */
  const updatePlace = (tempId: number, updates: Partial<Place>) => {
    updateCurrentDay(day => ({
      ...day,
      places: day.places.map(p => p.tempId === tempId ? { ...p, ...updates } : p),
    }));
  };

  /**
   * 장소 삭제
   */
  const removePlace = (tempId: number) => {
    updateCurrentDay(day => ({
      ...day,
      places: day.places.filter(p => p.tempId !== tempId),
    }));

    // 이동 수단도 함께 삭제
    setTravelModes(prev => prev.slice(0, -1));
  };

  /**
   * 장소 순서 변경
   */
  const reorderPlaces = (newPlaces: Place[]) => {
    updateCurrentDay(day => ({
      ...day,
      places: newPlaces,
    }));
  };

  /**
   * 이동 수단 변경
   */
  const changeSegmentMode = (index: number, mode: TravelMode) => {
    setTravelModes(prev => {
      const newModes = [...prev];
      newModes[index] = mode;

      // trip 상태에도 반영하여 영속성 유지
      updateCurrentDay(day => ({
        ...day,
        travelModes: newModes
      }));

      return newModes;
    });
  };

  /**
   * 현재 날짜 업데이트 헬퍼
   */
  const updateCurrentDay = (updater: (day: Day) => Day) => {
    setTrip(prev => {
      const newDays = prev.days.map(d => {
        if (d.id === currentDayId) {
          const updated = updater(d);
          return JSON.stringify(d) === JSON.stringify(updated) ? d : updated;
        }
        return d;
      });

      if (newDays.every((d, i) => d === prev.days[i])) return prev;
      return { ...prev, days: newDays };
    });
  };

  /**
   * 일차별 요약 정보 계산 (무한 루프 방지 비교)
   */
  useEffect(() => {
    if (!currentDayId || !currentDay) return;

    const totalDistance = segments.reduce((sum, s) => sum + s.distance, 0);
    const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0);
    const totalBudget = places.reduce((sum, p) => sum + p.budget, 0);

    // 이동 수단별 합계 계산
    const modeStats: NonNullable<Day['modeStats']> = {};
    segments.forEach(s => {
      if (s && s.mode) {
        if (!modeStats[s.mode]) {
          modeStats[s.mode] = { distance: 0, duration: 0 };
        }
        modeStats[s.mode]!.distance += (s.distance || 0);
        modeStats[s.mode]!.duration += (s.duration || 0);
      }
    });

    // 변경 사항이 있을 때만 업데이트 (Deep Compare)
    const isStatsChanged =
      currentDay.totalDistance !== totalDistance ||
      currentDay.totalDuration !== totalDuration ||
      currentDay.totalBudget !== totalBudget ||
      JSON.stringify(currentDay.modeStats) !== JSON.stringify(modeStats);

    // segments나 places가 바뀌어도 통계치가 같다면 업데이트 스킵
    if (isStatsChanged) {
      updateCurrentDay(day => ({
        ...day,
        totalDistance,
        totalDuration,
        totalBudget,
        modeStats,
      }));
    }
  }, [segments, places, trip.currentDayId]);

  // 제목 수정 모드
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  // 표지 설정 모달
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);

  // ... (existing hooks)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTrip(prev => ({ ...prev, tripName: e.target.value }));
  };

  const toggleEditTitle = () => {
    setIsEditingTitle(!isEditingTitle);
  };

  // 초기 로딩 화면 (모든 Hook 정의 후 위치해야 함)
  if (dataLoading && !remoteTrip && !initialized) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', background: isDarkMode ? '#141414' : '#fff' }}>
        <LoadingOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
        <Text type="secondary" style={{ color: isDarkMode ? 'rgba(255,255,255,0.45)' : undefined }}>
          여행 데이터를 불러오고 있습니다...
        </Text>
      </div>
    );
  }

  return (
    <Layout className="travel-planner-container" style={{ minHeight: '100vh', background: isDarkMode ? '#141414' : 'white' }}>
      <Header style={{
        backgroundImage: trip?.coverImage
          ? (trip.coverImage.startsWith('http')
            ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${trip.coverImage})`
            : trip.coverImage)
          : (isDarkMode
            ? 'linear-gradient(135deg, #001529 0%, #001f3f 100%)'
            : 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: isMobile ? '0 12px' : '0 24px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px',
        zIndex: 100,
        transition: 'background-image 0.3s ease',
        position: 'relative',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* 뒤로가기 버튼 */}
          <Button
            type="text"
            icon={<ArrowLeftOutlined style={{ fontSize: '18px', color: 'white' }} />}
            onClick={() => router.push('/')}
            style={{ marginRight: '8px' }}
          />

          {/* 제목 (수정 가능) */}
          {isEditingTitle ? (
            <Input
              value={trip.tripName}
              onChange={handleTitleChange}
              onBlur={toggleEditTitle}
              onPressEnter={toggleEditTitle}
              autoFocus
              style={{
                width: isMobile ? '120px' : '300px',
                fontSize: '16px',
                fontWeight: 'bold',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white'
              }}
            />
          ) : (
            <div
              onClick={toggleEditTitle}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              title="클릭하여 제목 수정"
            >
              <Title level={isMobile ? 5 : 4} style={{
                color: 'white',
                margin: 0,
                fontWeight: 'bold',
                maxWidth: isMobile ? '120px' : 'none',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {isMobile ? trip.tripName : `✈️ ${trip.tripName}`}
              </Title>
              {!isMobile && <EditOutlined style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }} />}
            </div>
          )}

          {/* PC 전용 부가 기능 버튼들 */}
          {!isMobile && (
            <>
              {/* 공유 버튼 (PC) */}
              <Button
                type="text"
                icon={<ShareAltOutlined />}
                onClick={handleShare}
                style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span style={{ fontSize: '13px' }}>공유하기</span>
              </Button>

              {/* 표지 변경 버튼 */}
              <Tooltip title="여행 분위기에 맞는 표지를 설정해보세요!">
                <Button
                  type="text"
                  icon={<PictureOutlined />}
                  onClick={() => setIsCoverModalOpen(true)}
                  style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span style={{ fontSize: '13px' }}>꾸미기</span>
                </Button>
              </Tooltip>

              {/* 내보내기 버튼 */}
              <Tooltip title="여행 계획을 파일로 저장하여 공유합니다.">
                <Button
                  type="text"
                  icon={<DownloadOutlined />}
                  onClick={() => exportTripToFile(trip)}
                  style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span style={{ fontSize: '13px' }}>내보내기</span>
                </Button>
              </Tooltip>

              {/* 다크 모드 토글 */}
              <Button
                type="text"
                icon={isDarkMode ? <BulbFilled style={{ color: '#ffcc00' }} /> : <BulbOutlined />}
                onClick={() => setIsDarkMode(!isDarkMode)}
                style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span style={{ fontSize: '13px' }}>{isDarkMode ? '다크 모드' : '라이트 모드'}</span>
              </Button>
            </>
          )}
        </div>

        {/* 저장 인디케이터 & 공유 (모바일 포함) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 2 }}>
          {isSaving ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>
              <CloudSyncOutlined spin />
              {!isMobile && <span>저장 중...</span>}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>
              <CloudUploadOutlined style={{ color: '#b7eb8f' }} />
              {!isMobile && <span>자동 저장됨</span>}
            </div>
          )}

          {isMobile && (
            <Space size={4}>
              <Button
                type="text"
                icon={<ShareAltOutlined style={{ color: 'white', fontSize: '18px' }} />}
                onClick={handleShare}
              />
              <Button
                type="text"
                icon={<MenuOutlined style={{ fontSize: '20px', color: 'white' }} />}
                onClick={() => setIsMenuOpen(true)}
              />
            </Space>
          )}
        </div>

      </Header>

      {/* 모바일 사이드 메뉴 (Drawer) */}
      <Drawer
        title="메뉴"
        placement="right"
        onClose={() => setIsMenuOpen(false)}
        open={isMenuOpen}
        size="default"
      >
        <Space orientation="vertical" style={{ width: '100%' }} size={16}>
          <Button
            block
            icon={<PictureOutlined />}
            onClick={() => {
              setIsCoverModalOpen(true);
              setIsMenuOpen(false);
            }}
          >
            표지 꾸미기
          </Button>
          <Button
            block
            icon={<DownloadOutlined />}
            onClick={() => {
              exportTripToFile(trip);
              setIsMenuOpen(false);
            }}
          >
            내보내기
          </Button>
          <Button
            block
            icon={isDarkMode ? <BulbFilled style={{ color: '#ffcc00' }} /> : <BulbOutlined />}
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? '라이트 모드' : '다크 모드'}
          </Button>
          <div style={{ padding: '8px 0', borderTop: '1px solid #f0f0f0' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {isSaving ? '저장 중...' : '자동 저장 완료'}
            </Text>
          </div>
        </Space>
      </Drawer>



      {/* 표지 설정 모달 */}
      <Modal
        title="여행 표지 꾸미기"
        open={isCoverModalOpen}
        onCancel={() => setIsCoverModalOpen(false)}
        footer={null}
        width={700}
      >
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: '🎨 색상/그라데이션',
              children: (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', padding: '12px 0' }}>
                  {GRADIENT_PRESETS.map((gradient, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setTrip(prev => ({ ...prev, coverImage: gradient }));
                        setIsCoverModalOpen(false);
                        message.success('표지가 변경되었습니다!');
                      }}
                      style={{
                        aspectRatio: '1',
                        background: gradient,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: trip.coverImage === gradient ? '3px solid #1890ff' : '1px solid #f0f0f0',
                        transition: 'transform 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  ))}
                </div>
              )
            },
            {
              key: '2',
              label: '📷 고화질 사진',
              children: (
                <div>
                  {/* 추천 섹션 */}
                  {(() => {
                    const recommendedUrl = getRecommendedCover(trip.tripName);
                    const recommendedPreset = IMAGE_PRESETS.find(p => p.imageUrl === recommendedUrl);

                    if (recommendedPreset) {
                      return (
                        <div style={{ marginBottom: '24px' }}>
                          <Text strong style={{ display: 'block', marginBottom: '8px', color: '#1890ff' }}>
                            ✨ '{trip.tripName}'에 어울리는 추천 표지
                          </Text>
                          <div
                            onClick={() => {
                              setTrip(prev => ({ ...prev, coverImage: recommendedPreset.imageUrl }));
                              setIsCoverModalOpen(false);
                              message.success('추천 표지가 적용되었습니다!');
                            }}
                            style={{
                              position: 'relative',
                              aspectRatio: '2.5', // 더 넓게
                              borderRadius: '12px',
                              cursor: 'pointer',
                              overflow: 'hidden',
                              border: '3px solid #1890ff',
                              boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
                            }}
                          >
                            <img
                              src={recommendedPreset.imageUrl}
                              alt={recommendedPreset.category}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{
                              position: 'absolute',
                              top: 12,
                              left: 12,
                              padding: '4px 12px',
                              background: '#1890ff',
                              color: 'white',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              AI 추천
                            </div>
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              padding: '8px 16px',
                              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                              color: 'white',
                              fontWeight: 'bold'
                            }}>
                              {recommendedPreset.category} 스타일
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <Text type="secondary" style={{ display: 'block', marginBottom: '12px' }}>
                    다양한 테마의 사진을 골라보세요. (출처: Unsplash)
                  </Text>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    {IMAGE_PRESETS.map((preset, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setTrip(prev => ({ ...prev, coverImage: preset.imageUrl }));
                          setIsCoverModalOpen(false);
                          message.success('표지가 변경되었습니다!');
                        }}
                        style={{
                          position: 'relative',
                          aspectRatio: '1.5',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          border: trip.coverImage === preset.imageUrl ? '3px solid #1890ff' : 'none',
                        }}
                      >
                        <img
                          src={preset.imageUrl}
                          alt={preset.category}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: '4px 8px',
                          background: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {preset.category}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }
          ]}
        />
      </Modal>

      {/* 실시간 통계 대시보드 (조건부 렌더링 또는 간소화) */}
      {
        !isMobile && (
          <div style={{
            background: isDarkMode ? '#1f1f1f' : '#f8fafc',
            borderBottom: `1px solid ${isDarkMode ? '#303030' : '#e2e8f0'}`,
            padding: '8px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
            boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.02)',
            flexWrap: 'wrap', // 줄 바꿈 허용
            width: '100%',
            maxWidth: '100vw',
            overflowX: 'hidden'
          }}>
            <Space size={4}>
              <EnvironmentOutlined style={{ color: '#64748b' }} />
              <Text type="secondary" style={{ fontSize: '12px' }}>총 장소:</Text>
              <Text strong style={{ fontSize: '13px' }}>{globalStats.totalPlaces}개</Text>
            </Space>
            <Space size={4}>
              <CompassOutlined style={{ color: '#64748b' }} />
              <Text type="secondary" style={{ fontSize: '12px' }}>총 거리:</Text>
              <Text strong style={{ fontSize: '13px' }}>{(globalStats.totalDistance / 1000).toFixed(1)}km</Text>
            </Space>
            <Space size={4}>
              <WalletOutlined style={{ color: '#64748b' }} />
              <Text type="secondary" style={{ fontSize: '12px' }}>총 예산:</Text>
              <Text strong style={{ fontSize: '13px', color: '#059669' }}>
                {globalStats.totalBudget.toLocaleString()}원
              </Text>
            </Space>
            <div style={{ marginLeft: 'auto' }}>
              <Badge status="processing" text={<Text type="secondary" style={{ fontSize: '11px' }}>실시간 분석 중</Text>} />
            </div>
          </div>
        )
      }

      {/* 3-Zone 레이아웃 */}
      <Content style={{
        display: 'flex',
        height: isMobile ? 'calc(100vh - 56px)' : 'calc(100vh - 56px - 40px)',
        overflow: 'hidden'
      }}>
        {/* Zone A & B Container (Desktop: Row, Mobile: Scrollable Column) */}
        <div className="panel-container" style={{ display: 'flex', height: '100%' }}>
          {/* Zone A: 일차별 퀵 내비게이터 (260px Fixed) */}
          <div className="zone-nav" style={{ width: '260px', flexShrink: 0, borderRight: '1px solid #f0f0f0', overflow: 'hidden' }}>
            <ZoneA_DayNavigator
              days={trip.days || []}
              currentDayId={currentDayId}
              startDate={trip.startDate}
              onDaySelect={selectDay}
              onAddDay={addDay}
              onRemoveDay={removeDay}
              onStartDateChange={handleStartDateChange}
            />
          </div>

          {/* Zone B: 스토리보드 타임라인 (450px Fixed) */}
          <div className="zone-timeline" style={{ width: '450px', flexShrink: 0, borderRight: '1px solid #f0f0f0', overflow: 'hidden', zIndex: 10 }}>
            <ZoneB_Timeline
              places={places || []}
              segments={segments || []}
              validationResults={validationResults || []}
              editingPlaceId={editingPlaceId}
              loading={directionsLoading}
              onPlacesReorder={reorderPlaces}
              onPlaceUpdate={updatePlace}
              onPlaceRemove={removePlace}
              onSegmentModeChange={changeSegmentMode}
              onEditingChange={togglePlaceSelection}
              onFocusedPlaceChange={setFocusedPlaceId}
            />
          </div>
        </div>

        {/* Zone C: 동선 시각화 엔진 (Flexible) */}
        <div className="zone-map" style={{ flex: 1, position: 'relative' }}>
          <ZoneC_MapEngine
            places={places || []}
            segments={segments || []}
            editingPlaceId={editingPlaceId} // 마커 스타일링용
            focusedPlaceId={focusedPlaceId} // 지도 중심 이동용 (모바일 스크롤)
            onPlaceAdd={addPlace}
            onPlaceSelect={togglePlaceSelection}
          />
        </div>
      </Content>
    </Layout >
  );
}

export default function DetailPage() {
  // 다크 모드 상태
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // 초기 다크 모드 로드
  useEffect(() => {
    const saved = localStorage.getItem('dark_mode');
    if (saved === 'true') setIsDarkMode(true);
  }, []);

  // 다크 모드 변경 시 저장
  useEffect(() => {
    localStorage.setItem('dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <App>
        <TravelPlanner isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      </App>
    </ConfigProvider>
  );
}
