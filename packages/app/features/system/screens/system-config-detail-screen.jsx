import React, { useEffect, useState } from 'react'
import { useRouter } from 'solito/navigation'
import { useParams } from 'react-router-dom'
import { Card, Descriptions, Tag, Button, Space, Typography, Spin, Empty } from 'antd'
import { ArrowLeftOutlined, EditOutlined, DatabaseOutlined } from '@ant-design/icons'
import { fetchSystemConfigByKey } from '../api/system-config'
import { showAdminError } from '../../../../components/HelperAdmin'

const { Title, Text } = Typography

export function SystemConfigDetailScreen() {
  const router = useRouter()
  const { key } = useParams()
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!key) return
      try {
        setLoading(true)
        const data = await fetchSystemConfigByKey(key)
        setConfig(data)
      } catch (err) {
        showAdminError(err?.message || 'Không thể tải chi tiết cấu hình')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [key])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <Spin size="large" tip="Đang tải chi tiết cấu hình..." />
      </div>
    )
  }

  if (!config) {
    return (
      <Card>
        <Empty description="Không tìm thấy thông tin cấu hình" />
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
            Quay lại
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => router.push('/admin?tab=system-config')}
              shape="circle"
            />
            <Title level={3} style={{ margin: 0 }}>Chi tiết cấu hình</Title>
          </Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => router.push('/admin?tab=system-config')} // Giả định quay lại để edit qua modal
          >
            Quản lý chung
          </Button>
        </div>

        <Card 
          title={
            <Space>
              <DatabaseOutlined style={{ color: '#1677ff' }} />
              <span>Thông tin chi tiết: <Text strong>{config.key}</Text></span>
            </Space>
          }
          bordered={false}
          className="shadow-sm"
        >
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Khóa (Key)">
              <Text strong>{config.key}</Text>
            </Descriptions.Item>
            
            <Descriptions.Item label="Giá trị hiện tại">
              <Text>{config.value || '(Trống)'}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="Kiểu dữ liệu">
              <Text type="secondary" style={{ textTransform: 'uppercase' }}>{config.dataType || 'string'}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái">
              {config.isActive ? (
                <Tag color="success">Đang hoạt động</Tag>
              ) : (
                <Tag color="default">Đang tạm dừng</Tag>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Mô tả">
              {config.description || <Text type="secondary">Không có mô tả</Text>}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>
    </div>
  )
}

export default SystemConfigDetailScreen
