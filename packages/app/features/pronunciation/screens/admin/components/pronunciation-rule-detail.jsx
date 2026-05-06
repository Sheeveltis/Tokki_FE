import React, { useState, useEffect } from 'react'
import { Typography, Card, Table, Tag, Button, Space, message, Descriptions, Divider, Input, Tabs, Tooltip, Modal } from 'antd'
import { 
  ArrowLeftOutlined, 
  SoundOutlined, 
  SearchOutlined, 
  InfoCircleOutlined, 
  UnorderedListOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons'
import { 
  getPronunciationExamples, 
  updatePronunciationExample, 
  deletePronunciationExample,
  importPronunciationExamplesFromExcel,
  exportPronunciationExamplesToExcel,
  downloadPronunciationExampleTemplate
} from '../../../api/index.js'
import PronunciationExampleEditModal from './pronunciation-example-edit-modal.jsx'

const { Title, Text } = Typography

export default function PronunciationRuleDetail({ rule, onBack, onEdit, onDelete }) {
  const [examples, setExamples] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [editExampleModalOpen, setEditExampleModalOpen] = useState(false)
  const [editingExample, setEditingExample] = useState(null)
  const [editExampleLoading, setEditExampleLoading] = useState(false)

  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const fileInputRef = React.useRef(null)

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

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setImporting(true)
      const result = await importPronunciationExamplesFromExcel(file, rule?.id)
      setImportResult(result)
      fetchExamples()
    } catch (err) {
      message.error(err.message || 'Import thất bại')
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleExportExcel = async () => {
    try {
      message.loading({ content: 'Đang chuẩn bị dữ liệu...', key: 'export' })
      const blob = await exportPronunciationExamplesToExcel(rule?.id)
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `PronunciationExamples_${new Date().getTime()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      message.success({ content: 'Xuất file thành công', key: 'export' })
    } catch (err) {
      message.error({ content: err.message || 'Xuất file thất bại', key: 'export' })
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      message.loading({ content: 'Đang tải template...', key: 'template' })
      const blob = await downloadPronunciationExampleTemplate()
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'PronunciationExampleTemplate.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      message.success({ content: 'Tải template thành công', key: 'template' })
    } catch (err) {
      message.error({ content: err.message || 'Tải template thất bại', key: 'template' })
    }
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
            <Space>
              <Button 
                icon={<UploadOutlined />} 
                onClick={handleImportClick}
                loading={importing}
                style={{ borderRadius: 20 }}
              >
                Import
              </Button>
              <Button 
                icon={<DownloadOutlined />} 
                onClick={handleExportExcel}
                style={{ borderRadius: 20 }}
              >
                Export
              </Button>
              <Button 
                icon={<DownloadOutlined />} 
                onClick={handleDownloadTemplate}
                style={{ borderRadius: 20 }}
              >
                Template
              </Button>
              <Input
                placeholder="Tìm trong ví dụ..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                style={{ width: 300, borderRadius: 20 }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                allowClear
              />
            </Space>
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

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".xlsx, .xls"
        onChange={handleFileChange}
      />

      <Modal
        title="Kết quả Import Excel"
        open={!!importResult}
        onCancel={() => setImportResult(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setImportResult(null)}>
            Đóng
          </Button>
        ]}
        width={800}
        centered
      >
        {importResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              padding: 12,
              borderRadius: 8,
              backgroundColor: importResult.isSuccess ? '#f6ffed' : '#fff2f0',
              border: `1px solid ${importResult.isSuccess ? '#b7eb8f' : '#ffccc7'}`,
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              {importResult.isSuccess ? (
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />
              ) : (
                <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 24 }} />
              )}
              <div strong style={{ fontSize: 16, fontWeight: 600 }}>{importResult.message}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontWeight: 600 }}>Chi tiết:</div>
              <Table
                size="small"
                dataSource={[
                  ...(importResult.data?.successList?.map((item, idx) => ({ ...item, type: 'success', key: `s-${idx}` })) || []),
                  ...(importResult.data?.failureList?.map((item, idx) => ({ ...item, type: 'failure', key: `f-${idx}` })) || [])
                ]}
                columns={[
                  {
                    title: 'Câu mẫu',
                    dataIndex: 'targetScript',
                    key: 'targetScript',
                    render: (text) => <div dangerouslySetInnerHTML={{ __html: text }} />
                  },
                  {
                    title: 'Phiên âm',
                    dataIndex: 'phoneticScript',
                    key: 'phoneticScript',
                  },
                  {
                    title: 'Kết quả',
                    dataIndex: 'type',
                    key: 'type',
                    width: 120,
                    render: (type) => (
                      <Tag color={type === 'success' ? 'green' : 'red'}>
                        {type === 'success' ? 'Thành công' : 'Thất bại'}
                      </Tag>
                    )
                  },
                  {
                    title: 'Lý do',
                    dataIndex: 'reason',
                    key: 'reason',
                  }
                ]}
                pagination={{ pageSize: 10 }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
