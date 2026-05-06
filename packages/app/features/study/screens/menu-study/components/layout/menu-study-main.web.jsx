import React from 'react'
import {
  Row,
  Col,
  Progress,
  Button,
  Avatar,
  Card,
  List,
  Typography,
  Badge,
  Timeline,
} from 'antd'
import {
  HomeOutlined,
  ReadOutlined,
  CompassOutlined,
  SearchOutlined,
  NumberOutlined,
  BookOutlined,
  TrophyOutlined,
  BellOutlined,
  UserOutlined,
  FireFilled,
  PlayCircleOutlined,
  RightOutlined,
  AudioOutlined,
  BlockOutlined,
  PlaySquareOutlined,
  HistoryOutlined,
  CheckCircleFilled,
  CrownFilled,
} from '@ant-design/icons'
import { SKILL_MODULES } from '@tokki/app/features/study/mockData'
import { LoginRequest } from 'components/loginRequest'
import ButtonUI1 from 'components/decor/buttonUI1'


const { Title, Text } = Typography

/**
 * MenuStudyMain (Web): Nội dung chính của trang menu học tập với giao diện hiện đại
 */
export function MenuStudyMain({
  levelId,
  streakDays,
  isCompletedToday,
  lessonsLearned,
  onModulePress,
  showLoginRequest,
  onCloseLoginRequest,
  onAlphabetPress,
  onTopikRoadmapPress,
  roadmapData,
  gamificationData,
  leaderboardData,
}) {
  const hasRoadmap = !!roadmapData
  const progressPercent = hasRoadmap ? roadmapData.progressPercent : 0

  return (
    <div className="study-main-container">
      <style dangerouslySetInnerHTML={{
        __html: `
        .study-main-container {
          width: 100%;
          font-family: 'Plus Jakarta Sans', 'Epilogue', sans-serif;
        }
        .main-banner {
          background: white;
          border-radius: 20px;
          padding: 20px 26px;
          border: 1px solid #FFF8E1;
          box-shadow: 0 10px 30px rgba(255, 179, 0, 0.05);
          margin-bottom: 16px;
          position: relative;
          overflow: hidden;
          min-height: 140px;
          display: flex;
          align-items: center;
        }
        .banner-mascot {
          width: 36px;
          height: 36px;
          background: #FFF3E0;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .progress-card {
          background: #F8FAFC;
          padding: 10px 14px;
          border-radius: 14px;
          border: 1px solid #F1F5F9;
          margin: 10px 0;
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .section-dot {
          width: 5px;
          height: 18px;
          background: #FFB300;
          border-radius: 10px;
        }
        .category-card {
          border-radius: 20px;
          padding: 20px 24px;
          border: 1px solid rgba(255,255,255,0.8);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        }
        .item-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 18px;
          background: #F8FAFC;
          border-radius: 12px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid transparent;
        }
        .item-row:last-child {
          margin-bottom: 0;
        }
        .item-row:hover {
          background: white;
          border-color: var(--module-color);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transform: translateX(4px);
        }
        .item-row:hover .category-item-icon,
        .item-row:hover .item-text {
          color: var(--module-color) !important;
        }
        .item-row:hover .arrow-icon {
          color: var(--module-color) !important;
          transform: translateX(2px);
        }
        .arrow-icon {
          transition: all 0.3s ease;
        }
        .streak-card {
          background: white;
          border-radius: 20px;
          padding: 16px 20px;
          text-align: center;
          border: 1px solid #FFF8E1;
          box-shadow: 0 10px 30px rgba(255, 179, 0, 0.08);
          position: relative;
        }
        .flame-icon {
          font-size: 56px;
          color: #FF5722;
          margin-bottom: 4px;
          filter: drop-shadow(0 0 15px rgba(255, 87, 34, 0.6));
          animation: flameAnimation 1.5s ease-in-out infinite;
          display: inline-block;
        }
        @keyframes flameAnimation {
          0% { transform: scale(1) rotate(-1deg); filter: drop-shadow(0 0 10px rgba(255, 87, 34, 0.5)); }
          25% { transform: scale(1.05) rotate(1deg); filter: drop-shadow(0 0 20px rgba(255, 87, 34, 0.8)); }
          50% { transform: scale(1.02) rotate(-1deg); filter: drop-shadow(0 0 15px rgba(255, 87, 34, 0.6)); }
          75% { transform: scale(1.08) rotate(1deg); filter: drop-shadow(0 0 25px rgba(255, 87, 34, 0.9)); }
          100% { transform: scale(1) rotate(-1deg); filter: drop-shadow(0 0 10px rgba(255, 87, 34, 0.5)); }
        }
        .streak-day-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
        }
        .mission-card {
          background: white;
          border-radius: 20px;
          padding: 16px 20px;
          border: 1px solid #F1F5F9;
        }
        .mission-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: #F8FAFC;
          border-radius: 16px;
          margin-bottom: 8px;
        }
        .leaderboard-card {
          background: #1E293B;
          border-radius: 20px;
          padding: 16px 20px;
          color: white;
          position: relative;
          overflow: hidden;
        }
        .leaderboard-bg-icon {
          position: absolute;
          right: -20px;
          bottom: -20px;
          font-size: 120px;
          opacity: 0.1;
          transform: rotate(15deg);
        }
        .topik-badge {
          background: #E6FFFA;
          color: #0694a2;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
        }
        .learn-now-btn {
          height: 48px;
          padding: 0 24px;
          background: linear-gradient(135deg, #FFB300 0%, #FF8F00 100%);
          color: white !important;
          border: none;
          border-radius: 12px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 179, 0, 0.3);
          cursor: pointer;
        }
        .learn-now-btn:hover {
          background: linear-gradient(135deg, #FFC107 0%, #FFA000 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 179, 0, 0.4);
          color: white !important;
        }
      ` }} />

      <Row gutter={[20, 20]}>
        {/* Left Column (Main Content) */}
        <Col xs={24} lg={16}>
          {/* Banner Section */}
          <section className="main-banner">
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px', position: 'relative', zIndex: 1, width: '100%' }}>
              <div style={{ flex: 1, minWidth: '300px', position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div>
                      <Title level={4} style={{ margin: 0, textTransform: 'uppercase', fontWeight: 900, color: '#1E293B', fontSize: '18px' }}>
                        {hasRoadmap ? `Lộ trình tuần ${roadmapData.weekIndex}` : 'Chưa có lộ trình học'}
                      </Title>
                      <Text type="secondary" style={{ fontSize: '13px' }}>
                        {hasRoadmap ? 'Hôm nay học tiếp nhé!' : 'Bắt đầu hành trình chinh phục tiếng Hàn ngay hôm nay!'}
                      </Text>
                    </div>
                  </div>

                  <ButtonUI1 onClick={() => onTopikRoadmapPress?.(levelId)}>
                    {hasRoadmap ? 'HỌC NGAY' : 'TẠO LỘ TRÌNH'}
                  </ButtonUI1>
                </div>

                {hasRoadmap && (
                  <div className="progress-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Tiến độ tuần này</Text>
                        <Text style={{ fontSize: '18px', fontWeight: 900, color: '#334155' }}>
                          {roadmapData.completedTasks} <span style={{ fontSize: '13px', color: '#94A3B8' }}>/ {roadmapData.totalTasks} bài học</span>
                        </Text>
                      </div>
                      <Text style={{ fontSize: '16px', fontWeight: 900, color: '#FFB300' }}>{progressPercent}%</Text>
                    </div>
                    <Progress
                      percent={progressPercent}
                      strokeColor={{ '0%': '#FFD54F', '100%': '#FFB300' }}
                      showInfo={false}
                      strokeWidth={12}
                      strokeLinecap="round"
                    />
                  </div>
                )}

                {!hasRoadmap && (
                  <div>
                    <Text style={{ color: '#64748B', maxWidth: '400px' }}>
                      AI sẽ giúp bạn thiết kế một lộ trình học tập tối ưu, phù hợp với trình độ và mục tiêu riêng của bạn.
                    </Text>
                  </div>
                )}
              </div>

            </div>
          </section>

          {/* Categories Grid */}
          <div className="section-header">
            <div className="section-dot" />
            <Title level={4} style={{ margin: 0, textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.5px' }}>Chương trình đào tạo</Title>
          </div>

          <Row gutter={[20, 20]}>
            {SKILL_MODULES.map((module) => (
              <Col xs={24} md={module.id === 'topik' ? 24 : 12} key={module.id}>
                <div
                  className="category-card"
                  style={{
                    '--module-color': module.primaryColor,
                    backgroundColor: module.backgroundColor || 'white',
                    borderTop: `2px solid ${module.primaryColor}30`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="category-icon" style={{ width: 32, height: 32, borderRadius: 10, background: `${module.primaryColor}15`, color: module.primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                        {module.id === 'vocabulary' && <BlockOutlined />}
                        {module.id === 'skills' && <AudioOutlined />}
                        {module.id === 'topik' && <TrophyOutlined />}
                      </div>
                      <Title level={5} style={{ margin: 0, color: module.primaryColor, fontWeight: 800, fontSize: 16 }}>{module.title}</Title>
                    </div>
                    {module.id === 'topik' && <span className="topik-badge">Phổ biến nhất</span>}
                  </div>

                  <div style={{ display: module.id === 'topik' ? 'grid' : 'block', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    {module.items.map((item, idx) => {
                      // Map icons for display
                      let DisplayIcon = RightOutlined
                      if (item.label.includes('chủ đề')) DisplayIcon = ReadOutlined
                      if (item.label.includes('Minigame')) DisplayIcon = PlaySquareOutlined
                      if (item.label.includes('Ôn tập')) DisplayIcon = HistoryOutlined
                      if (item.label.includes('AI')) DisplayIcon = AudioOutlined
                      if (item.label.includes('bảng chữ cái')) DisplayIcon = NumberOutlined
                      if (item.label.includes('Roadmap')) DisplayIcon = CompassOutlined

                      return (
                        <div
                          key={idx}
                          className="item-row"
                          onClick={() => {
                            if (item.route === 'alphabet') onAlphabetPress?.()
                            else if (item.route === 'roadmap') onTopikRoadmapPress?.(levelId)
                             else onModulePress?.(module.id, item.label, null, item.route)
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <DisplayIcon className="category-item-icon" style={{ fontSize: '18px', color: '#94A3B8', transition: 'all 0.3s ease' }} />
                            <Text className="item-text" style={{ fontSize: '15px', fontWeight: 600, color: '#334155', transition: 'all 0.3s ease' }}>{item.label}</Text>
                          </div>
                          <RightOutlined className="arrow-icon" style={{ fontSize: '12px', color: '#CBD5E1' }} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Col>

        {/* Right Column (Sidebar) */}
        <Col xs={24} lg={8}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Streak Card */}
            <div className="streak-card">
              <Text style={{ fontSize: '11px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '2px' }}>Chuỗi học tập</Text>
              <div style={{ margin: '24px 0 16px' }}>
                <FireFilled className="flame-icon" />
              </div>
              <Title level={4} style={{ margin: 0, fontWeight: 900 }}>{streakDays} Ngày</Title>
            </div>

            {/* Experience / Level Progress Card */}
            <div className="mission-card" style={{ background: 'linear-gradient(135deg, white 0%, #F8FAFC 100%)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    background: '#FFF3E0',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CrownFilled style={{ color: '#FFB300', fontSize: 18 }} />
                  </div>
                  <Title level={5} style={{ margin: 0, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kinh nghiệm</Title>
                </div>
                <Badge
                  count={`Cấp ${gamificationData?.level || 1}`}
                  style={{ backgroundColor: '#1E293B', color: 'white', fontWeight: 800 }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text style={{ fontSize: 12, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Hành trình hiện tại</Text>
                    <Title level={3} style={{ margin: 0, fontWeight: 900, color: '#334155' }}>
                      {gamificationData?.xpInCurrentLevel || 0} <span style={{ fontSize: 14, color: '#94A3B8' }}>/ {gamificationData?.maxXPOfLevel || 100} XP</span>
                    </Title>
                  </div>
                  <Text style={{ fontSize: 14, fontWeight: 900, color: '#FFB300' }}>{gamificationData?.progressPercentage || 0}%</Text>
                </div>
                <Progress
                  percent={gamificationData?.progressPercentage || 0}
                  strokeColor={{ '0%': '#FFD54F', '100%': '#FFB300' }}
                  showInfo={false}
                  strokeWidth={12}
                  strokeLinecap="round"
                />
              </div>

              <Text type="secondary" style={{ fontSize: 12, fontStyle: 'italic' }}>
                Cố gắng đạt thêm {Math.max(0, (gamificationData?.maxXPOfLevel || 0) - (gamificationData?.xpInCurrentLevel || 0))} XP nữa để lên cấp tiếp theo!
              </Text>

              {/* Decorative background element */}
              <CrownFilled style={{
                position: 'absolute',
                right: -10,
                bottom: -10,
                fontSize: 60,
                color: '#FFB300',
                opacity: 0.05,
                transform: 'rotate(15deg)'
              }} />
            </div>

            {/* Leaderboard Shortcut */}
            <div className="leaderboard-card">
              <TrophyOutlined className="leaderboard-bg-icon" />
              <Title level={5} style={{ color: 'white', margin: 0, fontWeight: 800 }}>Bảng xếp hạng</Title>
              <Text style={{ color: '#94A3B8', fontSize: '13px', fontStyle: 'italic', display: 'block', marginBottom: '16px' }}>
                Hôm nay bạn đã nỗ lực rất nhiều!
              </Text>

              <List
                size="small"
                dataSource={(leaderboardData || []).slice(0, 5)}
                renderItem={(item) => (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <Text strong style={{
                        color: item.rank === 1 ? '#FFD700' : item.rank === 2 ? '#C0C0C0' : item.rank === 3 ? '#CD7F32' : '#94A3B8',
                        width: '20px',
                        fontSize: '12px'
                      }}>
                        {item.rank}
                      </Text>
                      <Avatar
                        size={24}
                        src={item.avatarUrl}
                        icon={<UserOutlined />}
                        style={{ border: item.rank <= 3 ? `1px solid ${item.rank === 1 ? '#FFD700' : '#94A3B8'}` : 'none' }}
                      />
                      <Text style={{ color: 'white', fontWeight: 600 }}>{item.fullName}</Text>
                    </div>
                    <Text strong style={{ color: '#FFB300' }}>{item.totalXP} XP</Text>
                  </div>
                )}
              />
            </div>
          </div>
        </Col>
      </Row>

      {/* Login Request Modal */}
      {showLoginRequest && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{ maxWidth: '600px', width: '100%', background: 'white', borderRadius: '24px', overflow: 'hidden' }}>
            <LoginRequest onClose={onCloseLoginRequest} />
          </div>
        </div>
      )}
    </div>
  )
}
