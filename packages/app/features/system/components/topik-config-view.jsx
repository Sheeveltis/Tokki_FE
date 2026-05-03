import React from 'react'
import { Modal, Descriptions, Tag, Divider, Row, Col, Card, Typography, Space } from 'antd'
import { TrophyOutlined, BookOutlined, ThunderboltOutlined, InfoCircleOutlined } from '@ant-design/icons'

const { Text, Title, Paragraph } = Typography

const TopikConfigView = ({ open, onCancel, config }) => {
  if (!config) return null

  return (
    <Modal
      title={
        <Space>
          <TrophyOutlined style={{ color: '#faad14' }} />
          <span>Chi tiết cấu hình TOPIK: {config.displayName}</span>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={850}
      destroyOnHidden
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 }}>
        <Descriptions bordered title={<Space><InfoCircleOutlined /> Thông tin chung</Space>} size="small" column={2}>
          <Descriptions.Item label="Cấp độ mục tiêu"><Text strong>{config.targetAimLevel}</Text></Descriptions.Item>
          <Descriptions.Item label="Nhóm đề (Group)"><Tag color="blue">Nhóm {config.examGroup}</Tag></Descriptions.Item>
          <Descriptions.Item label="Config Key"><Text code>{config.configKey}</Text></Descriptions.Item>
          <Descriptions.Item label="Thứ tự">{config.sortOrder}</Descriptions.Item>
          <Descriptions.Item label="Điểm đạt / Tổng"><Text strong style={{ color: '#52c41a' }}>{config.passScore}</Text> / {config.totalScore}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={config.isActive ? 'success' : 'default'}>{config.isActive ? 'Hoạt động' : 'Đang tắt'}</Tag>
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left" plain>
          <Space><BookOutlined /> <Text strong>Chi tiết kỹ năng & Mục tiêu</Text></Space>
        </Divider>

        <Row gutter={16}>
          {/* Listening */}
          <Col span={8}>
            <Card size="small" title="Nghe (Listening)" headStyle={{ background: '#e6f7ff' }} bodyStyle={{ padding: '12px' }}>
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary">Cấu trúc đề:</Text>
                <div style={{ marginLeft: 8 }}>- {config.listeningMaxQuestions} câu / {config.listeningMaxScore} điểm</div>
              </div>
              <div>
                <Text type="secondary">Mục tiêu đạt:</Text>
                <div style={{ marginLeft: 8, color: '#1890ff', fontWeight: 'bold' }}>
                  - {config.targetListeningQuestions} câu / {config.targetListeningScore} điểm
                </div>
              </div>
            </Card>
          </Col>

          {/* Reading */}
          <Col span={8}>
            <Card size="small" title="Đọc (Reading)" headStyle={{ background: '#f6ffed' }} bodyStyle={{ padding: '12px' }}>
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary">Cấu trúc đề:</Text>
                <div style={{ marginLeft: 8 }}>- {config.readingMaxQuestions} câu / {config.readingMaxScore} điểm</div>
              </div>
              <div>
                <Text type="secondary">Mục tiêu đạt:</Text>
                <div style={{ marginLeft: 8, color: '#52c41a', fontWeight: 'bold' }}>
                  - {config.targetReadingQuestions} câu / {config.targetReadingScore} điểm
                </div>
              </div>
            </Card>
          </Col>

          {/* Writing */}
          <Col span={8}>
            <Card 
              size="small" 
              title="Viết (Writing)" 
              headStyle={{ background: config.writingMaxScore > 0 ? '#fff7e6' : '#f5f5f5' }} 
              bodyStyle={{ padding: '12px', opacity: config.writingMaxScore > 0 ? 1 : 0.5 }}
            >
              {config.writingMaxScore > 0 ? (
                <>
                  <div style={{ marginBottom: 8 }}>
                    <Text type="secondary">Cấu trúc đề:</Text>
                    <div style={{ marginLeft: 8 }}>- {config.writingMaxQuestions} câu / {config.writingMaxScore} điểm</div>
                  </div>
                  <div>
                    <Text type="secondary">Mục tiêu đạt:</Text>
                    <div style={{ marginLeft: 8, color: '#fa8c16', fontWeight: 'bold' }}>
                      - {config.targetWritingQuestions} câu / {config.targetWritingScore} điểm
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>Không yêu cầu</div>
              )}
            </Card>
          </Col>
        </Row>

        <Divider orientation="left" plain>
          <Space><ThunderboltOutlined /> <Text strong>Chiến thuật làm bài</Text></Space>
        </Divider>
        
        <div style={{ 
          background: '#f9f9f9', 
          padding: '16px', 
          borderRadius: '8px', 
          borderLeft: '4px solid #faad14' 
        }}>
          <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
            {config.strategy || 'Chưa có chiến thuật cụ thể.'}
          </Paragraph>
        </div>

        <div style={{ marginTop: 24, textAlign: 'right', fontSize: 11, color: '#bfbfbf' }}>
          ID: {config.topikLevelConfigID} | Ngày tạo: {new Date(config.createdAt).toLocaleDateString('vi-VN')}
        </div>
      </div>
    </Modal>
  )
}

export default TopikConfigView
