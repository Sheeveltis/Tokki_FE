import React, { useEffect, useState } from 'react'
import { 
  Modal, 
  Form, 
  Row, 
  Col, 
  Input, 
  InputNumber, 
  Switch, 
  Select, 
  Space, 
  Button, 
  Card, 
  Typography 
} from 'antd'
import { 
  EditOutlined, 
  PlusOutlined, 
  SaveOutlined 
} from '@ant-design/icons'
import { SYSTEM_CONFIG_TYPES } from '../constants/config-types.jsx'
import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'
import { BookOutlined } from '@ant-design/icons'

const { Text } = Typography

const ConfigFormModal = ({ 
  open, 
  onCancel, 
  onFinish, 
  saving, 
  isEdit, 
  editingConfig, 
  form 
}) => {
  const [exams, setExams] = useState([])
  const [loadingExams, setLoadingExams] = useState(false)
  const [examType, setExamType] = useState(2) // Default to TOPIK II

  // Fetch exams for selection helper
  const fetchExams = async (type) => {
    try {
      setLoadingExams(true)
      const res = await apiClient.get(ENDPOINTS.EXAMS.ADMIN_LIST, {
        params: {
          PageNumber: 1,
          PageSize: 100,
          Status: 1, // Published
          Type: type,
          CreatorFilter: 2 // Human
        }
      })
      setExams(res.data?.data?.items || [])
    } catch (err) {
      console.error('Failed to fetch exams for config helper', err)
    } finally {
      setLoadingExams(false)
    }
  }

  useEffect(() => {
    if (open && form.getFieldValue('configType') === 6) {
      fetchExams(examType)
    }
  }, [open, examType, form.getFieldValue('configType')])

  // Auto detect exam type from key
  useEffect(() => {
    if (open && form.getFieldValue('configType') === 6) {
      const key = form.getFieldValue('key') || ''
      if (key.toUpperCase().includes('TOPIK_1')) {
        setExamType(1)
      } else if (key.toUpperCase().includes('TOPIK_2')) {
        setExamType(2)
      }
    }
  }, [open, form.getFieldValue('configType'), form.getFieldValue('key')])

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ 
            width: 44, 
            height: 44, 
            borderRadius: '12px', 
            background: isEdit ? '#e6f7ff' : '#f6ffed', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            marginRight: 16,
            boxShadow: isEdit ? '0 2px 8px rgba(24, 144, 255, 0.15)' : '0 2px 8px rgba(82, 196, 26, 0.15)'
          }}>
            {isEdit ? <EditOutlined style={{ color: '#1890ff', fontSize: 22 }} /> : <PlusOutlined style={{ color: '#52c41a', fontSize: 22 }} />}
          </div>
          <div>
            <Text strong style={{ fontSize: 18 }}>{isEdit ? 'Cập nhật cấu hình' : 'Tạo cấu hình mới'}</Text>
            <div style={{ fontSize: 13, color: '#8c8c8c', marginTop: 2 }}>
              {isEdit ? `Chỉnh sửa tham số: ${editingConfig?.key}` : 'Điền thông tin để thêm tham số vào hệ thống'}
            </div>
          </div>
        </div>
      }
      open={open}
      onCancel={() => !saving && onCancel()}
      destroyOnHidden
      centered
      width={650}
      footer={[
        <Button key="cancel" size="large" onClick={onCancel} disabled={saving} style={{ borderRadius: '8px' }}>
          Hủy bỏ
        </Button>,
        <Button
          key="submit"
          type="primary"
          size="large"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={() => form.submit()}
          style={{ borderRadius: '8px', padding: '0 24px' }}
        >
          {isEdit ? 'Lưu thay đổi' : 'Tạo cấu hình'}
        </Button>
      ]}
    >
      <Form
        layout="vertical"
        form={form}
        requiredMark={false}
        style={{ paddingTop: 24 }}
        onFinish={onFinish}
      >
        <Row gutter={20}>
          <Col span={24}>
            <Form.Item
              label={<Text strong>Nhóm cấu hình</Text>}
              name="configType"
              rules={[{ required: true, message: 'Vui lòng chọn nhóm' }]}
            >
              <Select size="large" placeholder="Chọn nhóm tham số...">
                {SYSTEM_CONFIG_TYPES.map(t => (
                  <Select.Option key={t.value} value={t.value}>
                    <Space>
                      <span style={{ color: t.color }}>{t.icon}</span>
                      {t.fullLabel}
                    </Space>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={15}>
            <Form.Item
              label={<Text strong>Khóa cấu hình (Key)</Text>}
              name="key"
              rules={[
                { required: true, message: 'Nhập khóa (key)' },
                !isEdit && { pattern: /^[a-zA-Z0-9_]+$/, message: 'Khóa chỉ gồm chữ cái, số và dấu gạch dưới' }
              ].filter(Boolean)}
            >
              <Input size="large" disabled={isEdit} placeholder="VÍ_DỤ: MAX_LOGIN_ATTEMPTS" style={{ borderRadius: '8px' }} />
            </Form.Item>
          </Col>

          <Col span={9}>
            <Form.Item
              label={<Text strong>Kiểu dữ liệu</Text>}
              name="dataType"
              rules={[{ required: true, message: 'Chọn kiểu' }]}
            >
              <Select size="large" placeholder="Kiểu...">
                <Select.Option value="string">Văn bản (String)</Select.Option>
                <Select.Option value="int">Số nguyên (Integer)</Select.Option>
                <Select.Option value="boolean">Bật/Tắt (Boolean)</Select.Option>
                <Select.Option value="json">Cấu hình JSON</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item dependencies={['dataType', 'configType']} noStyle>
              {({ getFieldValue }) => {
                const dataType = getFieldValue('dataType')
                const configType = getFieldValue('configType')
                if (dataType === 'int') {
                  return (
                    <Form.Item
                      label={<Text strong>Giá trị tham số</Text>}
                      name="value"
                      rules={[{ required: true, message: 'Vui lòng nhập số' }]}
                    >
                      <InputNumber size="large" style={{ width: '100%', borderRadius: '8px' }} placeholder="Nhập số..." />
                    </Form.Item>
                  )
                }
                if (dataType === 'boolean') {
                  return (
                    <Form.Item
                      label={<Text strong>Giá trị tham số</Text>}
                      name="value"
                      valuePropName="checked"
                    >
                      <Card size="small" style={{ borderRadius: '8px', borderStyle: 'dashed' }}>
                        <Space>
                          <Switch checkedChildren="BẬT" unCheckedChildren="TẮT" />
                          <Text type="secondary">Trạng thái hiện tại</Text>
                        </Space>
                      </Card>
                    </Form.Item>
                  )
                }
                if (configType === 6 && dataType === 'string') {
                  return (
                    <div style={{ marginBottom: 24 }}>
                      <Form.Item
                        label={<Text strong>Giá trị tham số (Mã đề thi)</Text>}
                        name="value"
                        rules={[{ required: true, message: 'Vui lòng chọn hoặc nhập mã đề' }]}
                        style={{ marginBottom: 12 }}
                      >
                        <Input.TextArea 
                          size="large" 
                          placeholder="Nhập mã đề hoặc chọn từ danh sách bên dưới..." 
                          style={{ borderRadius: '8px' }} 
                        />
                      </Form.Item>
                      
                      <div style={{ 
                        background: '#f0f5ff', 
                        padding: '16px', 
                        borderRadius: '12px', 
                        border: '1px solid #adc6ff',
                        boxShadow: '0 2px 6px rgba(24, 144, 255, 0.1)'
                      }}>
                        <Space direction="vertical" style={{ width: '100%' }} size={12}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong style={{ color: '#1d39c4' }}>
                              <BookOutlined /> Hỗ trợ chọn mã đề nhanh
                            </Text>
                            <Select 
                              value={examType} 
                              onChange={setExamType}
                              size="small"
                              style={{ width: 100 }}
                              options={[
                                { label: 'TOPIK I', value: 1 },
                                { label: 'TOPIK II', value: 2 },
                              ]}
                            />
                          </div>
                          
                          <Select
                            showSearch
                            loading={loadingExams}
                            placeholder="Tìm kiếm và chọn đề thi..."
                            style={{ width: '100%' }}
                            optionFilterProp="children"
                            onChange={(val) => form.setFieldsValue({ value: val })}
                            filterOption={(input, option) =>
                              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={exams.map(ex => ({
                              value: ex.examId,
                              label: `[${ex.examId}] ${ex.title}`
                            }))}
                          />
                          <Text type="secondary" style={{ fontSize: 12, fontStyle: 'italic' }}>
                            * Khi chọn, mã đề sẽ được tự động điền vào ô giá trị phía trên.
                          </Text>
                        </Space>
                      </div>
                    </div>
                  )
                }

                return (
                  <Form.Item
                    label={<Text strong>Giá trị tham số</Text>}
                    name="value"
                    rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}
                  >
                    <Input.TextArea size="large" autoSize={{ minRows: 3, maxRows: 12 }} placeholder="Nhập giá trị cấu hình..." style={{ borderRadius: '8px' }} />
                  </Form.Item>
                )
              }}
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label={<Text strong>Mô tả chi tiết</Text>} name="description">
              <Input.TextArea rows={3} placeholder="Ghi chú về tác dụng của tham số này..." style={{ borderRadius: '8px' }} />
            </Form.Item>
          </Col>

          <Col span={24} style={{ display: 'none' }}>
            <div style={{ background: '#fcfcfc', padding: '16px', borderRadius: '10px', border: '1px solid #f0f0f0' }}>
              <Form.Item 
                label={<Text strong>Trạng thái kích hoạt</Text>} 
                name="isActive" 
                valuePropName="checked" 
                style={{ marginBottom: 0 }}
              >
                <Space size="large">
                  <Switch />
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Khi tắt, tham số sẽ không có hiệu lực và hệ thống sẽ dùng giá trị mặc định trong code.
                  </Text>
                </Space>
              </Form.Item>
            </div>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default ConfigFormModal
