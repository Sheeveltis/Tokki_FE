import React from 'react'
import { Button, Card, Col, Row, Typography, Input, Space, Divider } from 'antd'
import { motion } from 'framer-motion'
import {
  RocketOutlined,
  ThunderboltOutlined,
  ReadOutlined,
  GlobalOutlined,
  MessageOutlined,
  ArrowRightOutlined,
  SendOutlined,
  PlayCircleOutlined,
  CompassOutlined,
  EditOutlined,
  BookOutlined,
  AppstoreOutlined,
  TrophyOutlined,
  SoundOutlined,
  UsergroupAddOutlined
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

/**
 * LandingPage: Giao diện Landing Page cao cấp cho Tokki
 * Được tích hợp với Navbar và Footer chung của hệ thống.
 * Đã sửa lỗi CSS bằng cách sử dụng Ant Design và CSS thuần thay vì Tailwind.
 */
export const LandingPage = ({
  onRoadmapPress,
  onFlashcardPress,
  onBlogPress,
  onProfilePress
}) => {

  // Helper for smooth scrolling
  const scrollTo = (id) => {
    const element = document.getElementById(id.replace('#', ''))
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="landing-content" style={{ backgroundColor: '#fff', color: '#1a1a1a', overflowX: 'hidden' }}>

      {/* Premium CSS Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        
        .landing-content {
          font-family: 'Plus Jakarta Sans', sans-serif !important;
          background: linear-gradient(180deg, #FEF7E6 0%, #FFFFFF 15%, #FFFFFF 85%, #FEF7E6 100%);
          min-height: 100vh;
        }

        .premium-gradient-text {
          background: linear-gradient(135deg, #F1BE4B 0%, #D9A635 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
        }

        .hero-section {
          padding: 80px 24px 80px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .hero-title {
          font-size: clamp(2.5rem, 8vw, 5rem) !important;
          font-weight: 900 !important;
          line-height: 1.1 !important;
          margin-bottom: 32px !important;
          color: #0f172a !important;
        }

        .hero-subtitle {
          font-size: 1.25rem !important;
          color: #64748b !important;
          max-width: 650px;
          margin: 0 auto 48px !important;
          line-height: 1.6 !important;
        }

        .hero-image-wrap {
          margin-top: 64px;
          position: relative;
          display: inline-block;
        }

        .hero-image {
          width: 100%;
          max-width: 1000px;
          height: auto;
          max-height: 550px;
          object-fit: cover;
        }

        .section-padding {
          padding: 100px 24px;
        }

        .feature-card-premium {
          border-radius: 40px !important;
          padding: 48px !important;
          height: 100%;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid #f1f5f9 !important;
          overflow: hidden;
          position: relative;
        }

        .feature-card-premium:hover {
          transform: translateY(-12px);
          box-shadow: 0 20px 25px -5px rgba(241, 190, 75, 0.1) !important;
          border-color: #F1BE4B !important;
        }

        .grid-feature-card {
          background: white;
          padding: 40px;
          border-radius: 32px;
          height: 100%;
          border: 1px solid #f1f5f9;
          transition: all 0.3s ease;
        }

        .grid-feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 10px 20px rgba(241, 190, 75, 0.05);
          border-color: #F1BE4B;
        }

        .blog-card-img-wrap {
          border-radius: 24px;
          overflow: hidden;
          margin-bottom: 24px;
          aspect-ratio: 16/10;
        }

        .blog-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .blog-card:hover .blog-card-img {
          transform: scale(1.08);
        }

        .hero-btn {
          height: 60px !important;
          padding: 0 36px !important;
          font-size: 18px !important;
          font-weight: 700 !important;
          border-radius: 18px !important;
        }

        .section-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #D9A635;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 13px;
          margin-bottom: 24px;
        }

        .tag-dot {
          width: 8px;
          height: 8px;
          background: #F1BE4B;
          border-radius: 50%;
        }

        .floating {
          animation: floatAnimation 6s ease-in-out infinite;
        }

        @keyframes floatAnimation {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .mascot-wrap {
          position: absolute;
          z-index: 20;
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .hero-section { padding-top: 80px; }
          .section-padding { padding: 60px 20px; }
        }
      ` }} />

      {/* Hero Section */}
      <section className="hero-section">
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <motion.div {...fadeIn}>
            <h1 className="hero-title">
              Chào mừng đến với <span className="premium-gradient-text">Tokki</span>
            </h1>
            <p className="hero-subtitle">
              Nền tảng học tiếng Hàn thông minh tích hợp trí tuệ nhân tạo, giúp bạn học nhanh hơn, nhớ lâu hơn và tự tin giao tiếp cùng thế giới.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Button
              type="primary"
              className="hero-btn"
              style={{ backgroundColor: '#0f172a', borderColor: '#0f172a' }}
              onClick={onRoadmapPress}
              icon={<ThunderboltOutlined />}
            >
              Tạo lộ trình cá nhân hóa
            </Button>
            <Button
              className="hero-btn"
              style={{ backgroundColor: 'white' }}
              onClick={() => scrollTo('#features')}
              icon={<PlayCircleOutlined />}
            >
              Khám phá tính năng
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="hero-image-wrap floating"
          >
            <img src="/Logo.png" alt="Tokki Mascot" className="hero-image" style={{ width: '200px', height: 'auto', objectFit: 'contain' }} />
          </motion.div>

          {/* Floating Mascot */}
          <div className="mascot-wrap" style={{ right: '-50px', top: '30%', display: window.innerWidth > 1200 ? 'block' : 'none' }}>
            <motion.img
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, type: 'spring' }}
              src="/homepage_hero.png"
              style={{ width: '280px', height: '280px', objectFit: 'contain' }}
            // className="floating"
            />
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="section-padding" id="features">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '64px' }}>
            <div className="section-tag">
              <span className="tag-dot"></span>
              Đột phá công nghệ
            </div>
            <Title level={2} style={{ fontSize: '42px', fontWeight: 900 }}>AI hỗ trợ học tập thông minh</Title>
          </div>

          <Row gutter={[32, 32]}>
            <Col xs={24} md={12}>
              <div className="feature-card-premium" style={{ backgroundColor: '#0f172a', color: 'white' }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ background: 'rgba(241, 190, 75, 0.15)', width: '72px', height: '72px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
                    <CompassOutlined style={{ color: '#D9A635', fontSize: '32px' }} />
                  </div>
                  <Title level={3} style={{ color: 'white', fontSize: '28px', marginBottom: '20px', fontWeight: '900' }}>Lộ trình học cá nhân hóa</Title>
                  <Paragraph style={{ color: '#94a3b8', fontSize: '17px', lineHeight: 1.6, marginBottom: '32px' }}>
                    AI phân tích trình độ và mục tiêu của bạn để tự động kiến tạo một kế hoạch học tập chi tiết từng ngày, tối ưu hóa thời gian.
                  </Paragraph>
                  <Button type="link" onClick={onRoadmapPress} style={{ color: '#F1BE4B', fontSize: '16px', fontWeight: 700, padding: 0 }}>
                    Trải nghiệm AI Roadmap <ArrowRightOutlined />
                  </Button>
                </div>
                <GlobalOutlined style={{ position: 'absolute', right: '-40px', bottom: '-40px', fontSize: '240px', color: 'rgba(255,255,255,0.03)' }} />
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className="feature-card-premium" style={{ backgroundColor: '#FEF7E6', border: '1px solid #F8E2A7' }}>
                <div style={{ background: '#F1BE4B', width: '72px', height: '72px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', boxShadow: '0 10px 15px -3px rgba(241, 190, 75, 0.2)' }}>
                  <EditOutlined style={{ color: 'white', fontSize: '32px' }} />
                </div>
                <Title level={3} style={{ color: '#855E00', fontSize: '28px', marginBottom: '20px', fontWeight: '900' }}>Viết & Feedback AI</Title>
                <Paragraph style={{ color: '#926C15', fontSize: '17px', lineHeight: 1.6, marginBottom: '32px', opacity: 0.8 }}>
                  Viết bài luận và nhận đánh giá tức thì từ AI. Chữa lỗi ngữ pháp, gợi ý từ vựng và tối ưu văn phong chuyên nghiệp.
                </Paragraph>
                <Button type="link" onClick={onRoadmapPress} style={{ color: '#D9A635', fontSize: '16px', fontWeight: 700, padding: 0 }}>
                  Gửi bài viết ngay <ArrowRightOutlined />
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section className="section-padding" id="ecosystem">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <Title level={2} style={{ fontSize: '40px', fontWeight: 900, marginBottom: '20px' }}>Mọi thứ bạn cần để giỏi tiếng Hàn</Title>
            <Paragraph style={{ color: '#64748b', fontSize: '18px' }}>Từ căn bản đến nâng cao, Tokki đồng hành cùng bạn trên mọi phương diện.</Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            <FeatureGrid icon={<BookOutlined />} title="Từ vựng" desc="Hàng ngàn từ vựng có sẵn với ví dụ chuẩn." color="#fff7ed" iconColor="#ea580c" span={8} onClick={onFlashcardPress} />
            <Col xs={24} lg={16}>
              <div
                className="grid-feature-card"
                onClick={onBlogPress}
                style={{ display: 'flex', alignItems: 'center', gap: '32px', backgroundColor: '#FEF7E6', borderColor: '#F1BE4B', cursor: 'pointer' }}
              >
                <div style={{ background: 'white', width: '96px', height: '96px', borderRadius: '32px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(241,190,75,0.2)' }}>
                  <UsergroupAddOutlined style={{ color: '#D9A635', fontSize: '42px' }} />
                </div>
                <div>
                  <Title level={4} style={{ marginBottom: '12px', fontWeight: 800, fontSize: '24px' }}>Cộng đồng Tokki</Title>
                  <Paragraph style={{ color: '#64748b', margin: 0, fontSize: '17px', lineHeight: 1.6 }}>Kết nối với hàng ngàn học viên khác, trao đổi kinh nghiệm, bí quyết luyện thi và cùng nhau thăng tiến mỗi ngày.</Paragraph>
                </div>
              </div>
            </Col>

            {/* Row 2 */}
            <FeatureGrid icon={<AppstoreOutlined />} title="Chủ đề" desc="Từ vựng theo phim, đời sống, công sở." color="#eff6ff" iconColor="#2563eb" span={8} onClick={onFlashcardPress} />
            <FeatureGrid icon={<PlayCircleOutlined />} title="Mini Games" desc="Vừa chơi vừa nhớ với tương tác thú vị." color="#fdf2f8" iconColor="#db2777" span={8} onClick={onFlashcardPress} />
            <FeatureGrid icon={<SoundOutlined />} title="Phát âm" desc="AI giúp chỉnh sửa âm điệu và ngữ điệu." color="#fef2f2" iconColor="#dc2626" span={8} onClick={onRoadmapPress} />

            {/* Row 3 */}
            <Col xs={24} lg={16}>
              <div
                className="grid-feature-card"
                onClick={onRoadmapPress}
                style={{ display: 'flex', gap: '32px', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(90deg, #F9FBFF 0%, #FFFFFF 100%)', cursor: 'pointer' }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ background: '#eef2ff', color: '#4f46e5', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', fontSize: '24px' }}>
                    <ReadOutlined />
                  </div>
                  <Title level={4} style={{ marginBottom: '12px', fontWeight: 800 }}>Luyện thi TOPIK</Title>
                  <Paragraph style={{ color: '#64748b', fontSize: '16px', margin: 0 }}>Ngân hàng đề thi đa dạng, sát với cấu trúc thực tế giúp bạn tự tin đạt điểm cao.</Paragraph>
                </div>
                <div style={{ padding: '0 24px' }}>
                  <TrophyOutlined style={{ fontSize: '100px', color: '#eef2ff' }} />
                </div>
              </div>
            </Col>
            <FeatureGrid icon={<TrophyOutlined />} title="Xếp hạng" desc="Thi đua cùng cộng đồng." color="#fefce8" iconColor="#ca8a04" span={8} onClick={onProfilePress} />
          </Row>

        </div>
      </section>

      {/* Blog Section */}
      <section className="section-padding">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '64px' }}>
            <div>
              <div className="section-tag">Góc chia sẻ</div>
              <Title level={2} style={{ fontSize: '42px', fontWeight: 900, margin: 0 }}>Blog Cộng đồng</Title>
            </div>
            <Button type="link" onClick={onBlogPress} style={{ color: '#D9A635', fontWeight: 700, fontSize: '16px' }}>
              Tất cả bài viết <ArrowRightOutlined />
            </Button>
          </div>

          <Row gutter={[40, 40]} onClick={onBlogPress} style={{ cursor: 'pointer' }}>
            <BlogCardItem
              img="https://images.unsplash.com/photo-1547036967-23d1199d3b21?auto=format&fit=crop&q=80&w=600"
              tag="Kinh nghiệm" title="Cách vượt qua nỗi sợ nói tiếng Hàn"
              desc="5 bước giúp bạn tự tin hơn khi giao tiếp với người bản xứ."
            />
            <BlogCardItem
              img="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=600"
              tag="Học thuật" title="Phân biệt 3 loại kính ngữ phổ biến"
              desc="Học cách dùng kính ngữ chuẩn xác nhất trong đời sống Hàn Quốc."
            />
            <BlogCardItem
              img="https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?auto=format&fit=crop&q=80&w=600"
              tag="Văn hóa" title="Những điều cấm kỵ khi ăn uống"
              desc="Biết quy tắc này sẽ giúp bạn ghi điểm trong mắt bạn bè người Hàn."
            />
          </Row>
        </div>
      </section>

      <Divider style={{ margin: 0 }} />
    </div>
  )
}

const FeatureGrid = ({ icon, title, desc, color, iconColor, span = 8, onClick }) => (
  <Col xs={24} sm={12} lg={span}>
    <div className="grid-feature-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ background: color, color: iconColor, width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', fontSize: '24px' }}>
        {icon}
      </div>
      <Title level={4} style={{ marginBottom: '12px', fontWeight: 800 }}>{title}</Title>
      <Paragraph style={{ color: '#64748b', fontSize: '15px', marginBottom: 0 }}>{desc}</Paragraph>
    </div>
  </Col>
)

const BlogCardItem = ({ img, tag, title, desc }) => (
  <Col xs={24} md={8}>
    <div className="blog-card" style={{ cursor: 'pointer' }}>
      <div className="blog-card-img-wrap">
        <img src={img} className="blog-card-img" alt={title} />
      </div>
      <Text style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '12px' }}>{tag}</Text>
      <Title level={4} style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px' }}>{title}</Title>
      <Paragraph style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.5 }}>{desc}</Paragraph>
    </div>
  </Col>
)
