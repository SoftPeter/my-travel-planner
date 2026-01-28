"use client";

import React, { useEffect, useState } from 'react';
import { Layout, Typography, Card, Button, Row, Col, FloatButton, Empty, Skeleton, Input, Modal, App } from 'antd';
import { PlusOutlined, CalendarOutlined, UploadOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { Trip } from './types';
import { getAllTrips, createTrip, deleteTrip } from './utils/localStorage';
import { importTripFromFile } from './utils/fileHandler';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function Home() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 모든 여행 데이터 로드
    const loadedTrips = getAllTrips();
    setTrips(loadedTrips);
    setLoading(false);
  }, []);

  const handleCardClick = (id: string) => {
    router.push(`/travel/${id}`);
  };

  const handleCreateClick = () => {
    // 새 여행 생성 및 해당 상세 페이지로 이동
    const newTrip = createTrip();
    if (newTrip && newTrip.id) {
      router.push(`/travel/${newTrip.id}`);
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importTripFromFile(file);
      // 리스트 갱신
      setTrips(getAllTrips());
      // 입력 초기화 (같은 파일 다시 선택 가능하게)
      e.target.value = '';
    } catch (error) {
      console.error(error);
      alert('파일을 불러오는 데 실패했습니다.');
    }
  };

  // 날짜 계산 (N박 M일)
  const getDurationString = (trip: Trip) => {
    const nights = Math.max(0, trip.days.length - 1);
    const days = trip.days.length;
    return `${nights}박 ${days}일`;
  };

  // 여행 삭제
  const handleDeleteClick = (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    Modal.confirm({
      title: '여행을 삭제하시겠습니까?',
      icon: <ExclamationCircleOutlined />,
      content: '삭제된 여행은 복구할 수 없습니다.',
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk() {
        deleteTrip(tripId);
        setTrips(getAllTrips());
      },
    });
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* 헤더 */}
      <Header style={{
        background: 'white',
        padding: '0 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            ✈️ 여행갈래
          </Title>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".json"
            onChange={handleFileChange}
          />
          <Button
            icon={<UploadOutlined />}
            size="large"
            onClick={handleImportClick}
            style={{ borderRadius: '20px' }}
          >
            가져오기
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            style={{ borderRadius: '20px' }}
            onClick={handleCreateClick}
          >
            새 여행 만들기
          </Button>
        </div>
      </Header>

      {/* 컨텐츠 (리스트 화면) */}
      <Content style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '24px' }}>
          <Title level={3} style={{ marginBottom: '8px' }}>내 여행 리스트</Title>
          <Text type="secondary">떠나고 싶은 여행 계획을 관리해보세요.</Text>
        </div>

        {/* 여행 리스트 그리드 */}
        <Row gutter={[24, 24]}>
          {loading ? (
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card style={{ borderRadius: '12px' }} loading={true} />
            </Col>
          ) : trips.length > 0 ? (
            trips.map(trip => (
              <Col xs={24} sm={12} md={8} lg={6} key={trip.id}>
                <Card
                  hoverable
                  onClick={() => handleCardClick(trip.id)}
                  cover={
                    <div style={{
                      height: '160px',
                      background: trip.coverImage && !trip.coverImage.startsWith('http')
                        ? trip.coverImage
                        : (trip.coverImage ? '#f0f0f0' : 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '48px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {trip.coverImage && trip.coverImage.startsWith('http') ? (
                        <img
                          src={trip.coverImage}
                          alt="cover"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        // 이미지가 아닐 때만 이모지 표시
                        <div>🏰</div>
                      )}
                    </div>
                  }
                  actions={[
                    <div key="footer" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px' }}>
                      <span style={{ fontSize: '13px', color: '#666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CalendarOutlined style={{ color: '#8c8c8c' }} />
                        <span>{trip.startDate}</span>
                        <span style={{ color: '#e8e8e8' }}>|</span>
                        <span>{getDurationString(trip)}</span>
                      </span>
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={(e) => handleDeleteClick(e, trip.id)}
                        style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}
                      >
                        삭제
                      </Button>
                    </div>
                  ]}
                  style={{ borderRadius: '12px', overflow: 'hidden', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                >
                  <Card.Meta
                    title={trip.tripName || "나의 여행"}
                    description={
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <Text type="secondary" style={{ fontSize: '13px' }}>
                          {trip.days.length > 0 ? `${trip.days[0].places.length}개의 장소` : "일정 없음"}
                        </Text>
                        <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
                          <span style={{
                            background: '#e6f7ff',
                            color: '#1890ff',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 500
                          }}>
                            작성중
                          </span>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))
          ) : (
            /* 데이터가 없을 때 */
            <Col span={24}>
              <Empty
                description="아직 생성된 여행이 없습니다."
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ margin: '40px 0' }}
              >
                <Button type="primary" onClick={handleCreateClick}>첫 여행 만들기</Button>
              </Empty>
            </Col>
          )}
        </Row>
      </Content>

      {/* 모바일 플로팅 버튼 */}
      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        style={{ width: 56, height: 56 }}
        onClick={handleCreateClick}
      />
    </Layout>
  );
}
