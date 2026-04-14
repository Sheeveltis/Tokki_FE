import React from 'react'
import { Button, Typography, Space, Row, Col } from 'antd'
import { motion } from 'framer-motion'
import {
  CompassOutlined,
  BookOutlined,
  TrophyOutlined,
  CrownFilled
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

/**
 * LandingPage: Premium Landing Page for Tokki
 * Refactored with the new playful design system.
 */
export const LandingPage = ({
  onRoadmapPress,
  onFlashcardPress,
  onBlogPress,
  onProfilePress
}) => {

  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "easeOut" }
  }

  return (
    <div className="landing-content" style={{ backgroundColor: '#FDFBF4', color: '#5D4037', overflowX: 'hidden' }}>
      
      {/* Premium CSS Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        
        .landing-content {
          font-family: 'Plus Jakarta Sans', 'Epilogue', sans-serif !important;
        }

        .hero-container {
          background: white;
          border-radius: 3rem;
          padding: 40px 60px;
          border: 1px solid #EEDCC5;
          box-shadow: 0 10px 40px rgba(93, 64, 55, 0.05);
          position: relative;
          overflow: hidden;
          margin-top: 16px;
          margin-bottom: 32px;
        }

        .hero-decor-1 {
          position: absolute;
          top: -100px;
          right: -100px;
          width: 250px;
          height: 250px;
          background: rgba(255, 213, 79, 0.1);
          border-radius: 50%;
          filter: blur(60px);
        }

        .hero-decor-2 {
          position: absolute;
          bottom: -100px;
          left: -100px;
          width: 250px;
          height: 250px;
          background: rgba(242, 232, 207, 0.4);
          border-radius: 50%;
          filter: blur(60px);
        }


        .main-title {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          line-height: 1.1;
          color: #5D4037;
          margin-bottom: 24px;
        }

        .highlight-text {
          color: #FFB300;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: #8D6E63;
          max-width: 500px;
          margin-bottom: 40px;
          line-height: 1.6;
        }

        .hero-btn-primary {
          background: #5D4037 !important;
          color: white !important;
          border: none !important;
          height: 56px !important;
          padding: 0 40px !important;
          font-size: 18px !important;
          font-weight: 700 !important;
          border-radius: 16px !important;
          box-shadow: 0 10px 20px rgba(93, 64, 55, 0.2) !important;
          transition: all 0.3s ease !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .hero-btn-primary:hover {
          background: #4E342E !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(93, 64, 55, 0.15) !important;
        }

        .hero-btn-secondary {
          background: #FDFBF4 !important;
          color: #5D4037 !important;
          border: 1px solid #EEDCC5 !important;
          height: 56px !important;
          padding: 0 40px !important;
          font-size: 18px !important;
          font-weight: 700 !important;
          border-radius: 16px !important;
          transition: all 0.3s ease !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .hero-btn-secondary:hover {
          background: white !important;
          border-color: #FFB300 !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }

        .mascot-container {
          position: relative;
          background: linear-gradient(135deg, #F2E8CF 0%, #FFFBF0 100%);
          width: 380px;
          height: 380px;
          border-radius: 4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 4px 20px rgba(93, 64, 55, 0.05);
          transform: rotate(-3deg);
          transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .mascot-container:hover {
          transform: rotate(0deg);
          box-shadow: 0 20px 40px rgba(93, 64, 55, 0.1), inset 0 4px 20px rgba(93, 64, 55, 0.05);
        }

        .mascot-emoji {
          font-size: 160px;
          user-select: none;
          animation: bounce 3s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .floating-badge {
          position: absolute;
          background: white;
          padding: 12px 20px;
          border-radius: 20px;
          box-shadow: 0 10px 25px rgba(93, 64, 55, 0.1);
          border: 1px solid #EEDCC5;
          z-index: 10;
        }

        .badge-1 { top: -20px; right: -20px; transform: rotate(-12deg); }
        .badge-2 { bottom: 40px; left: -40px; transform: rotate(6deg); }

        .feature-card {
          background: white;
          border-radius: 32px;
          padding: 40px;
          height: 100%;
          border: 1px solid #EEDCC5;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          border-color: #FFB300;
          box-shadow: 0 15px 30px rgba(255, 179, 0, 0.1);
        }

        .icon-box {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin-bottom: 24px;
        }

        .section-padding { padding: 48px 24px; }
        .max-w-7xl { max-width: 1280px; margin: 0 auto; }
        
        .cta-btn-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.1) !important;
          color: #FF8F00 !important;
          background: white !important;
        }

        @media (max-width: 768px) {
          .hero-container { padding: 40px 24px; border-radius: 2rem; margin-top: 20px; }
          .mascot-container { width: 280px; height: 280px; margin-top: 20px; }
          .mascot-emoji { font-size: 100px; }
          .section-padding { padding: 40px 20px; }
          .main-title { font-size: 2.5rem; }
        }
      ` }} />

      <main className="max-w-7xl px-4">
        {/* Hero Section */}
        <div className="hero-container">
          <div className="hero-decor-1" />
          <div className="hero-decor-2" />

          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} md={13}>
              <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                
                <h1 className="main-title">
                  Học tiếng Hàn <br />
                  <span className="highlight-text">vui như chơi!</span>
                </h1>
                
                <p className="hero-subtitle">
                  Cùng Tokki chinh phục TOPIK và giao tiếp tự tin chỉ với 15 phút mỗi ngày qua các bài học trực quan.
                </p>

                <Space size={16} wrap>
                  <Button 
                    type="primary" 
                    className="hero-btn-primary"
                    onClick={onRoadmapPress}
                  >
                    Học ngay
                  </Button>
                  <Button 
                    className="hero-btn-secondary"
                    onClick={() => {
                      const el = document.getElementById('features')
                      el?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    Xem lộ trình
                  </Button>
                </Space>
              </motion.div>
            </Col>

            <Col xs={24} md={11} style={{ display: 'flex', justifyContent: 'center' }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mascot-container"
              >
                <div className="mascot-emoji">🐰</div>
                
                <div className="floating-badge badge-1">
                  <Text strong style={{ color: '#FFB300', fontSize: 18 }}>Top 1! 🏆</Text>
                </div>
                
                <div className="floating-badge badge-2">
                  <Text italic style={{ color: '#8D6E63', fontWeight: 700 }}>"Annyeonghaseyo!"</Text>
                </div>
              </motion.div>
            </Col>
          </Row>
        </div>

        {/* Features Section */}
        <section id="features" className="section-padding">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <Text strong style={{ color: '#FFB300', textTransform: 'uppercase', letterSpacing: 2 }}>Tính năng nổi bật</Text>
            <Title level={2} style={{ color: '#5D4037', fontSize: 42, fontWeight: 900, marginTop: 12 }}>
              Học tiếng Hàn chuyên nghiệp, hiệu quả
            </Title>
          </div>

          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <motion.div {...fadeIn} className="feature-card">
                <div className="icon-box" style={{ background: '#FFF8E7', color: '#FFB300' }}>
                  <CompassOutlined />
                </div>
                <Title level={4} style={{ color: '#5D4037', fontWeight: 800 }}>Lộ trình cá nhân</Title>
                <Paragraph style={{ color: '#8D6E63' }}>
                  AI tự động thiết kế lộ trình học phù hợp với trình độ và mục tiêu của riêng bạn.
                </Paragraph>
              </motion.div>
            </Col>

            <Col xs={24} md={8}>
              <motion.div {...fadeIn} className="feature-card">
                <div className="icon-box" style={{ background: '#F2E8CF', color: '#78905E' }}>
                  <BookOutlined />
                </div>
                <Title level={4} style={{ color: '#5D4037', fontWeight: 800 }}>Từ vựng phong phú</Title>
                <Paragraph style={{ color: '#8D6E63' }}>
                  Hơn 5000+ từ vựng được phân loại theo chủ đề, kèm ví dụ và phát âm chuẩn.
                </Paragraph>
              </motion.div>
            </Col>

            <Col xs={24} md={8}>
              <motion.div {...fadeIn} className="feature-card">
                <div className="icon-box" style={{ background: '#FFF0F0', color: '#D45A54' }}>
                  <TrophyOutlined />
                </div>
                <Title level={4} style={{ color: '#5D4037', fontWeight: 800 }}>Thi đua cùng bạn bè</Title>
                <Paragraph style={{ color: '#8D6E63' }}>
                  Hệ thống xếp hạng và thành tích giúp việc học trở nên thú vị và đầy động lực.
                </Paragraph>
              </motion.div>
            </Col>
          </Row>
        </section>

        {/* Call to Action */}
        <section className="section-padding" style={{ paddingBottom: 100 }}>
          <motion.div 
            {...fadeIn}
            style={{ 
              background: 'linear-gradient(135deg, #FFB300 0%, #FF8F00 100%)', 
              borderRadius: '3rem', 
              padding: '60px 40px',
              textAlign: 'center',
              color: 'white',
              boxShadow: '0 20px 40px rgba(255, 179, 0, 0.2)'
            }}
          >
            <Title level={2} style={{ color: 'white', fontSize: 36, fontWeight: 900 }}>Sẵn sàng chinh phục tiếng Hàn?</Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, marginBottom: 40 }}>
              Tham gia cùng cộng đồng 100,000+ người học và bắt đầu hành trình của bạn ngay hôm nay.
            </Paragraph>
            <Button 
               size="large" 
               shape="round" 
               icon={<CrownFilled />}
               className="cta-btn-premium"
               style={{ 
                 height: 56, 
                 padding: '0 40px', 
                 fontSize: 18, 
                 fontWeight: 800, 
                 color: '#FFB300',
                 border: 'none',
                 boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                 display: 'inline-flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 transition: 'all 0.3s ease'
               }}
               onClick={onRoadmapPress}
            >
              Nâng cấp VIP ngay
            </Button>
          </motion.div>
        </section>
      </main>
    </div>
  )
}
