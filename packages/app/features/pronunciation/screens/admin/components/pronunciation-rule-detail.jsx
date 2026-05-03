import React, { useState, useEffect } from 'react'
import { Typography, Card, Table, Tag, Button, Space, message, Descriptions, Divider, Input, Tabs, Tooltip } from 'antd'
import { 
  ArrowLeftOutlined, 
  SoundOutlined, 
  SearchOutlined, 
  InfoCircleOutlined, 
  UnorderedListOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import { getPronunciationExamples, updatePronunciationExample, deletePronunciationExample } from '../../../api/index.js'
import PronunciationExampleEditModal from './pronunciation-example-edit-modal.jsx'
import { Modal } from 'antd'

const { Title, Text } = Typography

export default function PronunciationRuleDetail({ rule, onBack, onEdit, onDelete }) {
  const [examples, setExamples] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [editExampleModalOpen, setEditExampleModalOpen] = useState(false)
  const [editingExample, setEditingExample] = useState(null)
  const [editExampleLoading, setEditExampleLoading] = useState(false)

  const fetchExamples = async () => {
    if (!rule?.id) return
    try {
      setLoading(true)
      const data = await getPronunciationExamples({
        pronunciationRuleId: rule.id,
        pageNumber: 1,
        pageSize: 100,
        searchTerm: searchTerm || undefined
      })
      setExamples(data.items || [])
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

  const handleEditExample = async (payload) => {
    try {
      setEditExampleLoading(true)
      await updatePronunciationExample(payload.exampleId, payload)
      message.success('Đã cập nhật ví dụ thành công')
      setEditExampleModalOpen(false)
      setEditingExample(null)
      fetchExamples()
    } catch (err) {
      message.error(err.message || 'Cập nhật ví dụ thất bại')
    } finally {
      setEditExampleLoading(false)
    }
  }

  const handleDeleteExample = (record) => {
    Modal.confirm({
      title: 'Xác nhận xóa ví dụ',
      centered: true,
      content: 'Bạn chắc chắn muốn xóa ví dụ này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true, style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } },
      cancelButtonProps: { style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } },
      onOk: async () => {
        try {
          await deletePronunciationExample(record.exampleId)
          message.success('Đã xóa ví dụ thành công')
          fetchExamples()
        } catch (err) {
          message.error(err.message || 'Xóa ví dụ thất bại')
        }
      },
    })
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
      title: 'Câu mẫu',
      dataIndex: 'targetScript',
      key: 'targetScript',
      width: '30%',
      render: (text) => <div dangerouslySetInnerHTML={{ __html: text }} />
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
    },
    {
      title: 'Hoạt động',
      key: 'action',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="text" 
              icon={<EditOutlined style={{ color: '#1890ff' }} />} 
              onClick={() => {
                setEditingExample(record)
                setEditExampleModalOpen(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDeleteExample(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  const tabItems = [
    {
      key: 'basic-info',
      label: (
        <Space>
          <InfoCircleOutlined />
          <span style={{ fontWeight: 500 }}>Thông tin cơ bản</span>
        </Space>
      ),
      children: (
        <div style={{ padding: 24 }}>
          <Card
            title={<Text strong style={{ fontSize: 18 }}>Thông tin cơ bản</Text>}
            variant="outlined"
            style={{ width: '100%', borderRadius: 12 }}
            styles={{ body: { padding: 24 } }}
          >
            <Descriptions 
              column={1} 
              bordered 
              size="middle"
              labelStyle={{
                width: 160,
                fontWeight: 600,
                backgroundColor: '#fafafa',
                fontSize: 14,
              }}
              contentStyle={{
                fontSize: 14,
                backgroundColor: '#fff',
              }}
            >
              <Descriptions.Item label="Tên quy tắc">
                <Text strong style={{ fontSize: 16, color: '#1890ff' }}>{rule?.title}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                <div style={{ color: '#434343', lineHeight: 1.6 }}>{rule?.description}</div>
              </Descriptions.Item>
              <Descriptions.Item label="Nội dung chi tiết">
                <div 
                  style={{ color: '#434343', lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: rule?._raw?.content || rule?.content }} 
                />
              </Descriptions.Item>
              <Descriptions.Item label="Thứ tự hiển thị">
                <Tag color="blue" style={{ borderRadius: 4 }}>{rule?.sortOrder}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      )
    },
    {
      key: 'examples',
      label: (
        <Space>
          <UnorderedListOutlined />
          <span style={{ fontWeight: 500 }}>Danh sách ví dụ</span>
        </Space>
      ),
      children: (
        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
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
  ]

  return (
    <div style={{ padding: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ marginBottom: 4, marginTop: 0 }}>
            Chi tiết quy tắc phát âm
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>ID: {rule?.id}</Text>
        </div>
        
        <Space size="small" wrap>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={onBack}
            style={{ 
              borderRadius: 20, 
              height: 40, 
              padding: '0 20px', 
              fontWeight: 600 
            }}
          >
            Quay lại
          </Button>

          <Divider orientation="vertical" style={{ height: 24, margin: '0 12px', borderLeft: '2px solid #e8e8e8' }} />

          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEdit?.(rule)}
            style={{
              borderRadius: 20,
              height: 40,
              padding: '0 20px',
              fontWeight: 600
            }}
          >
            Chỉnh sửa
          </Button>

          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete?.(rule)}
            style={{
              borderRadius: 20,
              height: 40,
              padding: '0 20px',
              fontWeight: 600
            }}
          >
            Xóa
          </Button>
        </Space>
      </div>

      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
        <Tabs
          defaultActiveKey="basic-info"
          tabBarStyle={{ padding: '4px 24px 0', borderBottom: '1px solid #f0f0f0', background: '#ffffff', margin: 0 }}
          items={tabItems}
        />
      </div>

      <PronunciationExampleEditModal
        open={editExampleModalOpen}
        loading={editExampleLoading}
        example={editingExample}
        onCancel={() => {
          setEditExampleModalOpen(false)
          setEditingExample(null)
        }}
        onSubmit={handleEditExample}
      />
    </div>
  )
}
