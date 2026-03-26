'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Modal, Form, Input, InputNumber, Select, Radio, message, Button, Space, Row, Col, Divider } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { createExam } from '../../api/exam-management.js'
import { fetchExamTemplates, fetchExamTemplate } from '../../../back-office/api/admin-index.js'

const skillMapping = {
  1: 'Listening',
  2: 'Reading',
  3: 'Writing'
}

const { Option } = Select

export function CreateExamModal({ open, onCancel, onSuccess }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [examType, setExamType] = useState(null)
  const [examTemplates, setExamTemplates] = useState([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)

  // Reset form và state khi modal đóng
  useEffect(() => {
    if (!open) {
      form.resetFields()
      setExamType(null)
      setExamTemplates([])
    }
  }, [open, form])

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

    if (open && examType) {
      loadTemplates()
    }
  }, [examType, form, open])

  // Tự động set up kỹ năng khi chọn mẫu đề
  const templateId = Form.useWatch('examTemplateId', form)

  useEffect(() => {
    const setupSkillsFromTemplate = async () => {
      if (!templateId) return

      try {
        const fullTemplate = await fetchExamTemplate(templateId)
        if (fullTemplate && (fullTemplate.parts || fullTemplate.Parts)) {
          const parts = fullTemplate.parts || fullTemplate.Parts
          // Lấy danh sách kỹ năng duy nhất từ các phần của mẫu đề
          const skillsSet = new Set()
          parts.forEach(part => {
            const skillValue = part.skill || part.Skill
            const skillName = skillMapping[skillValue]
            if (skillName) skillsSet.add(skillName)
          })

          if (skillsSet.size > 0) {
            const skillsList = Array.from(skillsSet).map(s => ({ name: s, duration: undefined }))
            form.setFieldsValue({ skills: skillsList })
          } else {
            // Fallback nếu không tìm thấy skill trong parts
            form.setFieldsValue({ skills: [{ name: undefined, duration: undefined }] })
          }
        }
      } catch (error) {
        console.error('Lỗi khi tải thông tin mẫu đề:', error)
        // Không dùng message.error ở đây để tránh gây phiền nhiễu nếu lỗi mạng tạm thời
      }
    }

    if (templateId) {
      setupSkillsFromTemplate()
    }
  }, [templateId, form])

  const handleSubmit = useCallback(async (values) => {
    if (!examType) {
      message.error('Vui lòng chọn loại đề')
      return
    }

    if (!values.examTemplateId) {
      message.error('Vui lòng chọn mẫu đề')
      return
    }

    if (!values.skills || values.skills.length === 0) {
      message.error('Vui lòng thêm ít nhất một kỹ năng')
      return
    }

    try {
      setLoading(true)

      // Chuyển đổi array skills sang object skillDurations
      const skillDurations = {}
      values.skills.forEach(skill => {
        if (skill.name && skill.duration) {
          skillDurations[skill.name] = skill.duration
        }
      })

      const payload = {
        title: values.title?.trim(),
        skillDurations,
        examTemplateId: values.examTemplateId,
      }

      const examId = await createExam(payload)

      if (examId) {
        message.success('Tạo đề thi thành công!')
        if (onSuccess) {
          await onSuccess(examId)
        }
        onCancel()
      } else {
        message.error('Tạo đề thi thất bại')
      }
    } catch (error) {
      message.error(error?.response?.data?.message || error?.message || 'Tạo đề thi thất bại')
    } finally {
      setLoading(false)
    }
  }, [examType, onSuccess, onCancel])

  const handleOk = useCallback(() => {
    form.submit()
  }, [form])

  const handleCancelClick = useCallback(() => {
    onCancel()
  }, [onCancel])

  return (
    <Modal
      title="Tạo đề thi mới"
      open={open}
      onCancel={handleCancelClick}
      onOk={handleOk}
      confirmLoading={loading}
      okText="Tạo đề thi"
      cancelText="Hủy"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        style={{ marginTop: 24 }}
      >
        <div style={{ padding: '0 8px' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>1. Thông tin cơ bản</div>

            <Form.Item
              label={<span style={{ fontWeight: 600, fontSize: 13 }}>Tiêu đề đề thi</span>}
              name="title"
              rules={[
                { required: true, message: 'Vui lòng nhập tiêu đề' },
                { max: 500, message: 'Tiêu đề không được quá 500 ký tự' },
              ]}
              style={{ marginBottom: 12 }}
            >
              <Input placeholder="Ví dụ: Đề thi thử TOPIK I số 01" size="middle" />
            </Form.Item>

            <Form.Item
              label={<span style={{ fontWeight: 600, fontSize: 13 }}>Loại đề</span>}
              name="examType"
              rules={[{ required: true, message: 'Vui lòng chọn loại đề' }]}
              style={{ marginBottom: 12 }}
            >
              <Radio.Group
                onChange={(e) => {
                  setExamType(e.target.value)
                  form.setFieldsValue({ examTemplateId: undefined })
                }}
                value={examType}
                buttonStyle="solid"
                size="middle"
                style={{ width: '100%', display: 'flex' }}
              >
                <Radio.Button value={1} style={{ flex: 1, textAlign: 'center' }}>TOPIK I</Radio.Button>
                <Radio.Button value={2} style={{ flex: 1, textAlign: 'center' }}>TOPIK II</Radio.Button>
              </Radio.Group>
            </Form.Item>

            {examType && (
              <Form.Item
                label={<span style={{ fontWeight: 600, fontSize: 13 }}>Mẫu đề</span>}
                name="examTemplateId"
                rules={[{ required: true, message: 'Vui lòng chọn mẫu đề' }]}
                style={{ marginBottom: 0 }}
                extra={
                  loadingTemplates ? (
                    <span style={{ color: '#888', fontSize: 11 }}>Đang tải...</span>
                  ) : examTemplates.length === 0 ? (
                    <span style={{ color: '#faad14', fontSize: 11 }}>Không có mẫu đề nào</span>
                  ) : null
                }
              >
                <Select
                  placeholder="Chọn mẫu cấu trúc đề"
                  loading={loadingTemplates}
                  disabled={loadingTemplates || examTemplates.length === 0}
                  showSearch
                  size="middle"
                  style={{ width: '100%' }}
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
                      {template.name || template.Name || '-'}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}
          </div>

          <Divider style={{ margin: '24px 0' }} />

          {/* Section 2: Thời lượng kỹ năng */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8
            }}>
              <div style={{ fontSize: 12, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>2. Thời lượng kỹ năng</div>
              <span style={{ fontSize: '10px', color: '#bfbfbf' }}>(phút)</span>
            </div>

            <Form.List
              name="skills"
              initialValue={[{ name: undefined, duration: undefined }]}
            >
              {(fields, { add, remove }) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {fields.map(({ key, name, ...restField }) => (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        padding: '10px 12px',
                        backgroundColor: '#fafafa',
                        borderRadius: '8px',
                        border: '1px solid #f0f0f0'
                      }}
                    >
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        rules={[{ required: true, message: 'Kỹ năng?' }]}
                        style={{ flex: 1, marginBottom: 0 }}
                      >
                        <Select
                          placeholder="Chọn kỹ năng..."
                          style={{ width: '100%' }}
                          size="middle"
                          disabled={!!templateId} // Vô hiệu hóa khi đã có mẫu đề
                        >
                          <Option value="Listening">Listening</Option>
                          <Option value="Reading">Reading</Option>
                          <Option value="Writting">Writting</Option>
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'duration']}
                        rules={[
                          { required: true, message: 'Phút?' },
                          { type: 'number', min: 1, message: '>0' }
                        ]}
                        style={{ width: 100, marginBottom: 0 }}
                      >
                        <InputNumber
                          placeholder="Phút"
                          min={1}
                          style={{ width: '100%' }}
                          size="middle"
                        />
                      </Form.Item>
                      {fields.length > 1 && !templateId && ( // Ẩn nút xóa khi đã có mẫu đề
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        />
                      )}
                    </div>
                  ))}

                  {!templateId && ( // Ẩn nút thêm bài khi đã có mẫu đề
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                      style={{
                        borderRadius: '8px',
                        height: '40px',
                        backgroundColor: '#fff',
                        color: '#1890ff',
                        fontWeight: 500,
                        marginTop: 4
                      }}
                    >
                      Thêm kỹ năng khác
                    </Button>
                  )}
                </div>
              )}
            </Form.List>
          </div>
        </div>
      </Form>
    </Modal>
  )
}

export default CreateExamModal

