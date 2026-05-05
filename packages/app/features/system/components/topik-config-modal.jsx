import React, { useEffect, useState } from 'react'
import { 
  Modal, 
  Form, 
  Row, 
  Col, 
  Input, 
  InputNumber, 
  Switch, 
  Typography, 
  Divider, 
  Space, 
  Button, 
  Card,
  Tabs,
  Select
} from 'antd'
import { 
  SaveOutlined, 
  BookOutlined, 
  TrophyOutlined, 
  ThunderboltOutlined,
  SettingOutlined,
  DotChartOutlined
} from '@ant-design/icons'
import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

const { Text } = Typography

const TopikConfigModal = ({ 
  open, 
  onCancel, 
  onFinish, 
  saving, 
  config, 
  form 
}) => {
  const [activeTab, setActiveTab] = useState('1')
  const [exams, setExams] = useState([])
  const [loadingExams, setLoadingExams] = useState(false)

  // Fetch exams for selection helper
  const fetchExams = async (type) => {
    try {
      setLoadingExams(true)
      const res = await apiClient.get(ENDPOINTS.EXAMS.ADMIN_LIST, {
        params: {
          PageNumber: 1,
          PageSize: 100,
          Status: 1,
          Type: type,
          CreatorFilter: 2
        }
      })
      setExams(res.data?.data?.items || [])
    } catch (err) {
      console.error('Failed to fetch exams for topik helper', err)
    } finally {
      setLoadingExams(false)
    }
  }

  const currentExamGroup = Form.useWatch('examGroup', form)

  useEffect(() => {
    if (open) {
      fetchExams(currentExamGroup || 1)
    }
  }, [open, currentExamGroup])

  useEffect(() => {
    if (open && config) {
      form.setFieldsValue(config)
    } else if (open) {
      form.resetFields()
      form.setFieldsValue({
        isActive: true,
        examGroup: 1,
        listeningMaxScore: 100,
        readingMaxScore: 100,
        writingMaxScore: 0,
        listeningMaxQuestions: 0,
        readingMaxQuestions: 0,
        writingMaxQuestions: 0,
        totalScore: 200
      })
    }
    setActiveTab('1') // Reset về tab đầu tiên khi mở
  }, [open, config, form])

  const items = [
    {
      key: '1',
      label: <Space><SettingOutlined />Cấu hình cơ bản</Space>,
      children: (
        <div style={{ padding: '16px 0' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Tên hiển thị" name="displayName" rules={[{ required: true, message: 'Vui lòng nhập tên hiển thị' }]}>
                <Input placeholder="Ví dụ: Cấp 1" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Thứ tự hiển thị" name="sortOrder">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Config Key" name="configKey" rules={[{ required: true, message: 'Vui lòng nhập config key' }]}>
                <Input placeholder="Ví dụ: ENTRANCE_EXAM_TOPIK_1" />
              </Form.Item>
              
              <div style={{ 
                marginTop: -12, 
                marginBottom: 16,
                background: '#f0f5ff', 
                padding: '12px', 
                borderRadius: '8px', 
                border: '1px solid #adc6ff' 
              }}>
                <Space direction="vertical" style={{ width: '100%' }} size={4}>
                  <Text strong style={{ color: '#1d39c4', fontSize: 12 }}>
                    <BookOutlined /> Hỗ trợ chọn mã đề nhanh
                  </Text>
                  <Select
                    showSearch
                    loading={loadingExams}
                    placeholder="Tìm kiếm và chọn đề thi..."
                    size="small"
                    style={{ width: '100%' }}
                    optionFilterProp="children"
                    onChange={(val) => form.setFieldsValue({ configKey: val })}
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={exams.map(ex => ({
                      value: ex.examId,
                      label: `[${ex.examId}] ${ex.title}`
                    }))}
                  />
                </Space>
              </div>
            </Col>
            <Col span={6}>
              <Form.Item label="Cấp độ (Aim)" name="targetAimLevel">
                <InputNumber min={1} max={7} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Nhóm đề" name="examGroup">
                <Select options={[
                  { label: 'Nhóm 1 (TOPIK I)', value: 1 },
                  { label: 'Nhóm 2 (TOPIK II)', value: 2 }
                ]} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Điểm đạt" name="passScore">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Tổng điểm" name="totalScore">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12} style={{ display: 'none' }}>
              <Form.Item label="Kích hoạt" name="isActive" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: '2',
      label: <Space><DotChartOutlined />Kỹ năng & Câu hỏi</Space>,
      forceRender: true,
      children: (
        <div style={{ padding: '16px 0' }}>
          <Row gutter={16}>
            <Col span={8}>
              <Card size="small" title="Nghe (Listening)" headStyle={{ background: '#e6f7ff' }}>
                <Form.Item label="Max Câu" name="listeningMaxQuestions">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="Max Điểm" name="listeningMaxScore">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="Câu mục tiêu" name="targetListeningQuestions">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="Điểm mục tiêu" name="targetListeningScore">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="Đọc (Reading)" headStyle={{ background: '#f6ffed' }}>
                <Form.Item label="Max Câu" name="readingMaxQuestions">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="Max Điểm" name="readingMaxScore">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="Câu mục tiêu" name="targetReadingQuestions">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="Điểm mục tiêu" name="targetReadingScore">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="Viết (Writing)" headStyle={{ background: '#fff7e6' }}>
                <Form.Item label="Max Câu" name="writingMaxQuestions">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="Max Điểm" name="writingMaxScore">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="Câu mục tiêu" name="targetWritingQuestions">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="Điểm mục tiêu" name="targetWritingScore">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: '3',
      label: <Space><ThunderboltOutlined />Chiến thuật</Space>,
      forceRender: true,
      children: (
        <div style={{ padding: '16px 0' }}>
          <Form.Item label="Nội dung chiến thuật làm bài" name="strategy">
            <Input.TextArea rows={12} placeholder="Nhập chiến thuật cụ thể cho cấp độ này..." />
          </Form.Item>
        </div>
      )
    }
  ]

  return (
    <Modal
      title={
        <Space>
          <TrophyOutlined style={{ color: '#1890ff' }} />
          <span>{config ? 'Chỉnh sửa cấu hình TOPIK' : 'Thêm mới cấu hình TOPIK'}</span>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      width={900}
      destroyOnHidden
      centered
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={saving}>Hủy bỏ</Button>,
        <Button 
          key="submit" 
          type="primary" 
          icon={<SaveOutlined />} 
          loading={saving} 
          onClick={() => form.submit()}
        >
          Lưu cấu hình
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={items}
          style={{ minHeight: 450 }}
        />
      </Form>
    </Modal>
  )
}

export default TopikConfigModal
