import React, { useState, useEffect } from 'react'
import { Typography, Card, Table, Tag, Button, Space, message, Descriptions, Divider, Input } from 'antd'
import { ArrowLeftOutlined, SoundOutlined, SearchOutlined } from '@ant-design/icons'
import { apiClient } from '../../../../../provider/api/client'
import { API_BASE_URL } from '../../../../../provider/api/endpoints'

const { Title, Text } = Typography

export default function PronunciationRuleDetail({ rule, onBack }) {
  const [examples, setExamples] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchExamples = async () => {
    if (!rule?.id) return
    try {
      setLoading(true)
      // Sử dụng đường dẫn tương đối vì apiClient đã có baseURL là API_BASE_URL (/api)
      const response = await apiClient.get(`/PronunciationExample`, {
        params: {
          PronunciationRuleId: rule.id,
          PageNumber: 1,
          PageSize: 100,
          SearchTerm: searchTerm || undefined
        }
      })
      if (response.data?.isSuccess) {
        setExamples(response.data.data.items || [])
      } else {
        message.error(response.data?.message || 'Không thể tải ví dụ')
      }
    } catch (error) {
      console.error('Error fetching examples:', error)
      message.error('Lỗi khi tải danh sách ví dụ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExamples()
  }, [rule?.id, searchTerm])

  const playAudio = (url) => {
    if (!url) return
    const audio = new Audio(url)
    audio.play().catch(e => message.error('Không thể phát âm thanh'))
  }

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1
    },
    {
      title: 'Câu mẫu (Raw)',
      dataIndex: 'rawScript',
      key: 'rawScript',
      width: '30%',
    },
    {
      title: 'Phiên âm',
      dataIndex: 'phoneticScript',
      key: 'phoneticScript',
      width: '25%',
      render: (text) => <Text type="secondary">{text}</Text>
    },
    {
      title: 'Ý nghĩa',
      dataIndex: 'meaning',
      key: 'meaning',
      width: '25%',
    },
    {
      title: 'Âm thanh',
      dataIndex: 'audioUrl',
      key: 'audioUrl',
      align: 'center',
      width: 100,
      render: (url) => (
        <Button 
          type="primary" 
          shape="circle" 
          icon={<SoundOutlined />} 
          disabled={!url}
          onClick={() => playAudio(url)}
        />
      )
    }
  ]

  return (
    <div style={{ padding: '4px' }}>
      <Button 
        type="link" 
        icon={<ArrowLeftOutlined />} 
        onClick={onBack}
        style={{ marginBottom: 16, paddingLeft: 0 }}
      >
        Quay lại danh sách
      </Button>

      <Card 
        title={<Title level={4} style={{ margin: 0 }}>Chi tiết quy tắc: {rule?.title}</Title>}
        variant="outlined"
        style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
      >
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Tên quy tắc">
            <Text strong>{rule?.title}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Mô tả">
            {rule?.description}
          </Descriptions.Item>
          <Descriptions.Item label="Nội dung chi tiết">
            <div dangerouslySetInnerHTML={{ __html: rule?._raw?.content || rule?.content }} />
          </Descriptions.Item>
          <Descriptions.Item label="Thứ tự hiển thị">
            <Tag color="blue">{rule?.sortOrder}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Danh sách ví dụ</Title>
        <Input
          placeholder="Tìm trong ví dụ..."
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          style={{ width: 300, borderRadius: 20 }}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          allowClear
        />
      </div>
      <Table
        dataSource={examples}
        columns={columns}
        loading={loading}
        rowKey="exampleId"
        pagination={{ pageSize: 10 }}
        style={{ 
          background: '#fff', 
          borderRadius: 12, 
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
      />
    </div>
  )
}
