import React from 'react'
import { Space, Typography, Button } from 'antd'
import { PlusOutlined, ExportOutlined, ImportOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const ConfigListHeader = ({ onCreate }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
      <Space direction="vertical" size={0}>
        <Title level={2} style={{ margin: 0 }}>Cấu hình hệ thống</Title>
        <Text type="secondary">Quản lý các tham số vận hành, AI, bảo mật và giao diện của Tokki</Text>
      </Space>
      <Space>
        <Button icon={<ExportOutlined />}>Xuất dữ liệu</Button>
        <Button icon={<ImportOutlined />}>Nhập dữ liệu</Button>
        <Button 
          type="primary" 
          size="large" 
          icon={<PlusOutlined />} 
          onClick={onCreate} 
          style={{ borderRadius: '8px', boxShadow: '0 2px 4px rgba(22, 119, 255, 0.2)' }}
        >
          Thêm cấu hình
        </Button>
      </Space>
    </div>
  )
}

export default ConfigListHeader
