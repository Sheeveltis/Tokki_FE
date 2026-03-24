'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'solito/navigation'
import { Card, Form, Space, Typography, Input, Select, Radio, message } from 'antd'
import { createExam } from '../../api/exam-management.js'
import { fetchExamTemplates } from '../../../back-office/api/admin-index.js'

const { Title, Text } = Typography
const { Option } = Select

// Map type enum values to display text
const TYPE_MAP = {
  1: 'TOPIK I',
  2: 'TOPIK II',
  3: 'Test đầu vào',
}

export function CreateExamScreen() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [examType, setExamType] = useState(null)
  const [examTemplates, setExamTemplates] = useState([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)


  // Fetch exam templates khi examType thay đổi
  useEffect(() => {
    const loadTemplates = async () => {
      if (!examType) {
        setExamTemplates([])
        form.setFieldsValue({ examTemplateId: undefined })
        return
      }

      try {
        setLoadingTemplates(true)
        const result = await fetchExamTemplates({
          pageNumber: 1,
          pageSize: 999,
          status: 1, // Chỉ lấy đã xuất bản
          type: examType,
        })
        setExamTemplates(result?.items || [])
      } catch (error) {
        message.error(error?.message || 'Không thể tải danh sách mẫu đề')
        setExamTemplates([])
      } finally {
        setLoadingTemplates(false)
      }
    }

    loadTemplates()
  }, [examType, form])

  const handleSubmit = async (values) => {
    if (!examType) {
      message.error('Vui lòng chọn loại đề')
      return
    }

    if (!values.examTemplateId) {
      message.error('Vui lòng chọn mẫu đề')
      return
    }

    try {
      setLoading(true)

      const payload = {
        title: values.title?.trim(),
        duration: values.duration,
        examTemplateId: values.examTemplateId,
      }

      const examId = await createExam(payload)

      if (examId) {
        message.success('Tạo đề thi thành công!')
        router.push(`/admin/exams/${examId}`)
      } else {
        message.error('Tạo đề thi thất bại')
      }
    } catch (error) {
      message.error(error?.response?.data?.message || error?.message || 'Tạo đề thi thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Tạo đề thi mới
            </Title>
            <Text type="secondary">Tạo đề thi từ mẫu đề có sẵn</Text>
          </div>

          {/* Form */}
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
            >
              {/* Chọn loại đề */}
              <Form.Item
                label="Loại đề"
                name="examType"
                rules={[{ required: true, message: 'Vui lòng chọn loại đề' }]}
              >
                <Radio.Group
                  onChange={(e) => {
                    setExamType(e.target.value)
                    form.setFieldsValue({ examTemplateId: undefined })
                  }}
                  value={examType}
                >
                  <Radio value={1}>TOPIK I</Radio>
                  <Radio value={2}>TOPIK II</Radio>
                  <Radio value={3}>Test đầu vào</Radio>
                </Radio.Group>
              </Form.Item>

              {/* Chọn mẫu đề */}
              {examType && (
                <Form.Item
                  label="Mẫu đề"
                  name="examTemplateId"
                  rules={[{ required: true, message: 'Vui lòng chọn mẫu đề' }]}
                  extra={
                    loadingTemplates ? (
                      <Text type="secondary">Đang tải danh sách mẫu đề...</Text>
                    ) : examTemplates.length === 0 ? (
                      <Text type="warning">Không có mẫu đề nào cho loại đề này</Text>
                    ) : null
                  }
                >
                  <Select
                    placeholder="Chọn mẫu đề"
                    loading={loadingTemplates}
                    disabled={loadingTemplates || examTemplates.length === 0}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {examTemplates.map((template) => (
                      <Option
                        key={template.examTemplateId || template.id || template.ExamTemplateId}
                        value={template.examTemplateId || template.id || template.ExamTemplateId}
                        label={template.name || template.Name}
                      >
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            {template.name || template.Name || '-'}
                          </div>
                          {template.description && (
                            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                              {template.description}
                            </div>
                          )}
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}

              {/* Tiêu đề */}
              <Form.Item
                label="Tiêu đề đề thi"
                name="title"
                rules={[
                  { required: true, message: 'Vui lòng nhập tiêu đề' },
                  { max: 500, message: 'Tiêu đề không được quá 500 ký tự' },
                ]}
              >
                <Input placeholder="Nhập tiêu đề đề thi" />
              </Form.Item>

              {/* Thời gian */}
              <Form.Item
                label="Thời gian làm bài (phút)"
                name="duration"
                rules={[
                  { required: true, message: 'Vui lòng nhập thời gian' },
                  { type: 'number', min: 1, message: 'Thời gian phải lớn hơn 0' },
                ]}
              >
                <Input
                  type="number"
                  placeholder="Nhập thời gian làm bài (phút)"
                  min={1}
                />
              </Form.Item>

              {/* Buttons */}
              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    onClick={() => form.submit()}
                    loading={loading}
                    style={{ height: 'auto', padding: '8px 24px', backgroundColor: '#F1BE4B', borderColor: '#F1BE4B' }}
                  >
                    Tạo đề thi
                  </Button>
                  <Button
                    onClick={() => router.push('/admin?tab=exam-management')}
                    style={{ height: 'auto', padding: '8px 24px', backgroundColor: '#373039', color: '#fff', border: 'none' }}
                  >
                    Hủy
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Space>
      </div>
    </>
  )
}

export default CreateExamScreen



