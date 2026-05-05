import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, ActivityIndicator } from 'react-native'
import { Modal, Button, Tag, Space, Divider, Typography, Tabs } from 'antd'
import { apiClient } from '../../../../provider/api/client'
import { ENDPOINTS } from '../../../../provider/api/endpoints'
import { useRouter } from 'solito/navigation'
import { NavigationPill } from '../../../../../components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { 
  ClockCircleOutlined, 
  FileTextOutlined, 
  InfoCircleOutlined, 
  RocketOutlined,
  PlayCircleOutlined,
  ThunderboltFilled,
  StarFilled,
  BookOutlined,
  EditOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons'

const { Title, Paragraph, Text: AntText } = Typography

export function TopikTrialExamsWeb({ onBackPress }) {
  const router = useRouter()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedExam, setSelectedExam] = useState(null)
  const [selectedType, setSelectedType] = useState('1')
  const [isModalVisible, setIsModalVisible] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await apiClient.get(ENDPOINTS.EXAMS.TRIAL_EXAMS(1, 20, selectedType))
      
      let items = []
      if (res.data?.isSuccess && res.data?.data?.items) {
        items = res.data.data.items
      }
      setData(items)
    } catch (error) {
      console.error('Failed to fetch trial exams:', error)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [selectedType])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleExamClick = (exam) => {
    setSelectedExam(exam)
    setIsModalVisible(true)
  }

  const handleStartExam = () => {
    if (selectedExam) {
      router.push(`/roadmap/test?examId=${selectedExam.examId}`)
      setIsModalVisible(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.fixedHeader}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <NavigationPill
                  label="Quay lại"
                  icon={ArrowIcon}
                  iconStyle={{ transform: [{ scaleX: -1 }] }}
                  onPress={onBackPress}
                  textStyle={{ fontWeight: '700' }}
                />
              </View>
              <View style={styles.headerCenter}>
                <Text style={styles.title}>Đề thi thử TOPIK</Text>
              </View>
              <View style={styles.headerRight} />
            </View>
            <View style={styles.subtitleSection}>
              <Text style={styles.subtitle}>Thử sức với bộ đề thi TOPIK chuẩn cấu trúc, đánh giá năng lực chính xác</Text>
            </View>
          </View>
        </View>

        <View style={styles.filterContainer}>
          <Tabs 
            activeKey={selectedType}
            onChange={setSelectedType}
            centered
            items={[
              { 
                key: '1', 
                label: (
                  <Space size={8}>
                    <StarFilled style={{ fontSize: 16 }} />
                    <span style={{ fontWeight: 700, fontSize: 16 }}>TOPIK I</span>
                  </Space>
                ) 
              },
              { 
                key: '2', 
                label: (
                  <Space size={8}>
                    <ThunderboltFilled style={{ fontSize: 16 }} />
                    <span style={{ fontWeight: 700, fontSize: 16 }}>TOPIK II</span>
                  </Space>
                ) 
              }
            ]}
            className="topik-filter-tabs"
          />
        </View>

        <View style={styles.scrollContainer}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.centerBox}>
                <ActivityIndicator size="large" color="#F1BE4B" />
                <Text style={{ marginTop: 12, color: '#94A3B8', fontWeight: '600' }}>Đang tải danh sách đề thi...</Text>
              </View>
            ) : data.length === 0 ? (
              <View style={styles.centerBox}>
                <div style={{ fontSize: 60, marginBottom: 20 }}>📚</div>
                <Text style={styles.emptyTitle}>Chưa có đề thi nào</Text>
                <Text style={styles.emptySubtitle}>Các bộ đề thi mới đang được đội ngũ Tokki biên soạn.</Text>
                <Button 
                  type="primary" 
                  size="large" 
                  style={{ marginTop: 24, borderRadius: 12, height: 48, background: '#F1BE4B', border: 'none', fontWeight: 'bold' }}
                  onClick={fetchData}
                >
                  TẢI LẠI TRANG
                </Button>
              </View>
            ) : (
              <View style={styles.grid}>
                {data.map((exam, index) => (
                  <Pressable
                    key={exam.examId}
                    style={({ hovered, pressed }) => [
                      styles.card,
                      hovered && styles.cardHover,
                      pressed && styles.cardPressed
                    ]}
                    onPress={() => handleExamClick(exam)}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.cardInfo}>
                        <View style={styles.tagRow}>
                          <Tag color="gold" icon={<ThunderboltFilled />}>TOPIK MỚI</Tag>
                          <Tag color={exam.type === 1 ? 'blue' : 'purple'}>
                            {exam.type === 1 ? 'TOPIK I' : 'TOPIK II'}
                          </Tag>
                        </View>
                        <Text style={styles.cardTitle} numberOfLines={2}>{exam.title}</Text>
                      </View>
                      <View style={styles.cardMeta}>
                        <View style={styles.metaItem}>
                          <ClockCircleOutlined style={styles.metaIcon} />
                          <Text style={styles.metaText}>{exam.duration} Phút</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <FileTextOutlined style={styles.metaIcon} />
                          <Text style={styles.metaText}>{exam.totalQuestions} Câu hỏi</Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.cardFooter}>
                      <View style={styles.skillsPreview}>
                        {exam.skillDurations?.listening && (
                          <View style={styles.skillDot}>
                            <CustomerServiceOutlined style={{ fontSize: 12, color: '#20BF6B' }} />
                            <Text style={styles.skillDotText}>Nghe</Text>
                          </View>
                        )}
                        {exam.skillDurations?.reading && (
                          <View style={styles.skillDot}>
                            <BookOutlined style={{ fontSize: 12, color: '#4834D4' }} />
                            <Text style={styles.skillDotText}>Đọc</Text>
                          </View>
                        )}
                        {exam.skillDurations?.writing && (
                          <View style={styles.skillDot}>
                            <EditOutlined style={{ fontSize: 12, color: '#FF9F43' }} />
                            <Text style={styles.skillDotText}>Viết</Text>
                          </View>
                        )}
                      </View>
                      <Pressable 
                        className="card-action-btn"
                        style={({ hovered }) => [
                          styles.cardActionBtn,
                          hovered && styles.cardActionBtnHover
                        ]}
                        onPress={() => handleExamClick(exam)}
                      >
                        <Text style={styles.cardActionText}>Làm bài</Text>
                        <PlayCircleOutlined style={{ color: '#1A1A1A', fontSize: 18 }} />
                      </Pressable>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      <Modal
        title={null}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
        centered
        className="exam-detail-modal"
        bodyStyle={{ padding: 0 }}
      >
        {selectedExam && (
          <div style={{ padding: '32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                backgroundColor: '#FFF8E1', 
                borderRadius: '20px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <RocketOutlined style={{ fontSize: '32px', color: '#F1BE4B' }} />
              </div>
              <Title level={3} style={{ margin: 0, fontWeight: 800 }}>Thông tin bài thi</Title>
              <Paragraph type="secondary">{selectedExam.title}</Paragraph>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Space direction="vertical" size={2}>
                    <AntText type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 700 }}>Tổng thời gian</AntText>
                    <Space>
                      <ClockCircleOutlined style={{ color: '#F1BE4B' }} />
                      <AntText strong style={{ fontSize: '16px' }}>{selectedExam.duration} phút</AntText>
                    </Space>
                  </Space>
                </Col>
                <Col span={12}>
                  <Space direction="vertical" size={2}>
                    <AntText type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 700 }}>Tổng số câu</AntText>
                    <Space>
                      <FileTextOutlined style={{ color: '#F1BE4B' }} />
                      <AntText strong style={{ fontSize: '16px' }}>{selectedExam.totalQuestions} câu</AntText>
                    </Space>
                  </Space>
                </Col>
              </Row>

              <Divider style={{ margin: '16px 0' }} />

              <Title level={5} style={{ marginBottom: '12px', fontSize: '14px', textTransform: 'uppercase', color: '#94A3B8' }}>Phân bổ thời gian</Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedExam.skillDurations?.listening && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space><CustomerServiceOutlined style={{ color: '#20BF6B' }} /> <AntText>Phần Nghe</AntText></Space>
                    <AntText strong>{selectedExam.skillDurations.listening} phút</AntText>
                  </div>
                )}
                {selectedExam.skillDurations?.reading && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space><BookOutlined style={{ color: '#4834D4' }} /> <AntText>Phần Đọc</AntText></Space>
                    <AntText strong>{selectedExam.skillDurations.reading} phút</AntText>
                  </div>
                )}
                {selectedExam.skillDurations?.writing && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space><EditOutlined style={{ color: '#FF9F43' }} /> <AntText>Phần Viết</AntText></Space>
                    <AntText strong>{selectedExam.skillDurations.writing} phút</AntText>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <InfoCircleOutlined style={{ color: '#F1BE4B' }} /> Lưu ý khi làm bài
              </Title>
              <ul style={{ paddingLeft: '20px', color: '#64748B', lineHeight: '1.6' }}>
                <li>Bạn nên chuẩn bị không gian yên tĩnh và tai nghe cho phần Nghe.</li>
                <li>Thời gian làm bài sẽ đếm ngược ngay sau khi bạn bắt đầu.</li>
                <li>Hệ thống sẽ tự động nộp bài khi hết thời gian quy định.</li>
                <li>Kết quả và lời giải chi tiết sẽ có ngay sau khi bạn hoàn thành.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button 
                block 
                size="large" 
                className="btn-cancel"
                style={{ height: '52px', borderRadius: '14px', fontWeight: 600 }}
                onClick={() => setIsModalVisible(false)}
              >
                Hủy bỏ
              </Button>
              <Button 
                type="primary" 
                block 
                size="large" 
                className="btn-start"
                icon={<RocketOutlined />}
                style={{ 
                  height: '52px', 
                  borderRadius: '14px', 
                  fontWeight: 700, 
                  backgroundColor: '#F1BE4B', 
                  borderColor: '#F1BE4B',
                  color: '#1A1A1A'
                }}
                onClick={handleStartExam}
              >
                BẮT ĐẦU LÀM BÀI
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .topik-filter-tabs .ant-tabs-nav {
          margin-bottom: 0 !important;
        }
        .topik-filter-tabs .ant-tabs-tab {
          padding: 12px 32px !important;
          transition: all 0.3s ease !important;
        }
        .topik-filter-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #F1BE4B !important;
          transform: scale(1.05);
        }
        .topik-filter-tabs .ant-tabs-ink-bar {
          background: #F1BE4B !important;
          height: 3px !important;
          border-radius: 3px 3px 0 0;
        }
        .exam-detail-modal .ant-modal-content {
          border-radius: 24px;
          overflow: hidden;
        }
        .btn-cancel:hover {
          border-color: #F1BE4B !important;
          color: #F1BE4B !important;
          background: #FFFBEB !important;
        }
        .btn-start {
          transition: all 0.3s ease !important;
        }
        .btn-start:hover {
          background-color: #EAB308 !important;
          border-color: #EAB308 !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(241, 190, 75, 0.4) !important;
        }
        .card-action-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .card-action-btn:hover {
          transform: scale(1.05) translateY(-2px) !important;
          background-color: #EAB308 !important;
          box-shadow: 0 8px 20px rgba(241, 190, 75, 0.3) !important;
        }
      `}} />
    </View>
  )
}

// Reuse Ant Design grid system in React Native Web
const Row = ({ children, gutter }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -(gutter[0] / 2) }}>
    {children}
  </View>
)
const Col = ({ children, span }) => (
  <View style={{ width: `${(span / 24) * 100}%`, paddingHorizontal: 8 }}>
    {children}
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    paddingVertical: 40,
    height: '100vh',
    overflow: 'hidden',
  },
  contentWrapper: {
    width: '80%',
    maxWidth: 1200,
    height: 'calc(100vh - 80px)',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 40px rgba(0,0,0,0.02)',
    }),
  },
  fixedHeader: {
    paddingTop: 32,
    paddingHorizontal: 40,
    paddingBottom: 12,
  },
  header: {
    width: '100%',
    gap: 12,
  },
  headerTop: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
  },
  subtitleSection: {
    alignItems: 'center',
    marginTop: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FBFBFC',
  },
  scroll: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 40,
    paddingTop: 24,
    paddingBottom: 40,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    zIndex: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  card: {
    width: 'calc(33.33% - 16px)',
    minWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: 220,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    }),
  },
  cardHover: {
    borderColor: '#F1BE4B',
    transform: [{ translateY: -8 }],
    ...(Platform.OS === 'web' && {
      boxShadow: '0 20px 40px rgba(241, 190, 75, 0.12)',
    })
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  cardHeader: {
    gap: 16,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    lineHeight: 28,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaIcon: {
    fontSize: 14,
    color: '#94A3B8',
  },
  metaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  skillsPreview: {
    flexDirection: 'row',
    gap: 12,
  },
  skillDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  skillDotText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  cardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: '#F1BE4B',
    gap: 10,
    ...(Platform.OS === 'web' && {
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 4px 10px rgba(241, 190, 75, 0.2)',
    }),
  },
  cardActionBtnHover: {
    backgroundColor: '#EAB308',
    transform: [{ scale: 1.05 }],
    ...(Platform.OS === 'web' && {
      boxShadow: '0 6px 15px rgba(241, 190, 75, 0.3)',
    }),
  },
  cardActionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  centerBox: {
    flex: 1,
    paddingVertical: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  }
})
