import React from 'react'
import { Modal, Typography, Tag, Space, Divider, Button } from 'antd'
import { EyeOutlined, KeyOutlined, CalendarOutlined, InfoCircleOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

const ConfigViewModal = ({ open, onCancel, config }) => {
  if (!config) return null

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <EyeOutlined style={{ color: '#1890ff', fontSize: 20 }} />
          <span>Chi tiết cấu hình</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="close" type="primary" onClick={onCancel} style={{ borderRadius: '6px' }}>
          Đóng
        </Button>
      ]}
      width={700}
      centered
    >
      <div style={{ padding: '8px 0' }}>
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              <KeyOutlined style={{ marginRight: 4 }} /> KHÓA CẤU HÌNH (KEY)
            </Text>
            <Title level={4} style={{ margin: 0, color: '#1677ff' }}>{config.key}</Title>
          </div>

          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              <InfoCircleOutlined style={{ marginRight: 4 }} /> MÔ TẢ
            </Text>
            <Text>{config.description || 'Không có mô tả chi tiết cho tham số này.'}</Text>
          </div>

          <Divider style={{ margin: '12px 0' }} />

          <div>
            <Space size="large" style={{ marginBottom: 16 }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>KIỂU DỮ LIỆU</Text>
                <Tag color="blue">{config.dataType?.toUpperCase()}</Tag>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>TRẠNG THÁI</Text>
                <Tag color={config.isActive ? 'green' : 'default'}>
                  {config.isActive ? 'ĐANG HOẠT ĐỘNG' : 'ĐANG TẮT'}
                </Tag>
              </div>
            </Space>

            <div style={{ 
              background: '#f5f5f5', 
              padding: '16px', 
              borderRadius: '8px', 
              border: '1px solid #e8e8e8',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>GIÁ TRỊ CẤU HÌNH:</Text>
              {config.dataType === 'boolean' ? (
                <Tag color={config.value === 'true' || config.value === true ? 'green' : 'red'} style={{ fontSize: 14, padding: '4px 12px' }}>
                  {config.value === 'true' || config.value === true ? 'BẬT (TRUE)' : 'TẮT (FALSE)'}
                </Tag>
              ) : (
                <Paragraph style={{ 
                  fontFamily: 'monospace', 
                  whiteSpace: 'pre-wrap', 
                  wordBreak: 'break-all',
                  margin: 0,
                  fontSize: 13,
                  lineHeight: '1.6'
                }}>
                  {config.value}
                </Paragraph>
              )}
            </div>
          </div>
        </Space>
      </div>
    </Modal>
  )
}

export default ConfigViewModal
