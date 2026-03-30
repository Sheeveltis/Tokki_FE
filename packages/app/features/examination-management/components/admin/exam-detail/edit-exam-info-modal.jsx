'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Modal, Form, Input, InputNumber, Select, message, Button, Space } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { updateExamInfo } from '../../../api/exam-management.js'
import { fetchExamTemplates, fetchExamTemplate } from '../../../../back-office/api/admin-index.js'

const skillMapping = {
  1: 'Listening',
  2: 'Reading',
  3: 'Writing'
}

const { Option } = Select

export function EditExamInfoModal({ open, onCancel, onSuccess, exam }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [examTemplates, setExamTemplates] = useState([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)

  // Load exam templates khi mở modal
  useEffect(() => {
    const loadTemplates = async () => {
      if (!open || !exam?.type) {
        setExamTemplates([])
        return
      }

      try {
        setLoadingTemplates(true)
        const result = await fetchExamTemplates({
          pageNumber: 1,
          pageSize: 999,
          status: 1, // Chỉ lấy đã xuất bản
          type: exam.type,
        })
        setExamTemplates(result?.items || [])
      } catch (error) {
        message.error(error?.message || 'Không thể tải danh sách mẫu đề')
        setExamTemplates([])
      } finally {
        setLoadingTemplates(false)
      }
    }

    if (open) {
      loadTemplates()
    }
  }, [open, exam?.type])

  // Set giá trị form khi mở modal hoặc exam thay đổi
  useEffect(() => {
    if (open && exam) {
      // examTemplateId có thể là field trực tiếp hoặc nằm trong examTemplate object
      const examTemplateId =
        exam.examTemplateId ||
        exam.examTemplate?.examTemplateId ||
        exam.examTemplate?.id ||
        undefined

      // Chuyển đổi skillDurations object sang array cho Form.List
      const skillDurations = exam.skillDurations || {}
      const skillsArray = Object.entries(skillDurations).map(([name, duration]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1), // Normalize to capitalized if needed
        duration,
      }))

      form.setFieldsValue({
        title: exam.title || '',
        skills: skillsArray.length > 0 ? skillsArray : [{ name: undefined, duration: undefined }],
        examTemplateId: examTemplateId,
      })
    }
  }, [open, exam, form])

  // Tự động set up kỹ năng khi chọn mẫu đề
  const templateId = Form.useWatch('examTemplateId', form)
  
  useEffect(() => {
    const setupSkillsFromTemplate = async () => {
      // Chỉ tự động setup nếu templateId khác với giá trị ban đầu của exam, 
      // hoặc nếu user chủ động muốn thay đổi cấu trúc
      if (!templateId) return

      // Tránh lặp vô tận or reset nếu đang mở đúng template hiện tại
      const initialTemplateId = exam.examTemplateId || exam.examTemplate?.examTemplateId || exam.examTemplate?.id
      if (templateId === initialTemplateId) return

      try {
        const fullTemplate = await fetchExamTemplate(templateId)
        if (fullTemplate && (fullTemplate.parts || fullTemplate.Parts)) {
          const parts = fullTemplate.parts || fullTemplate.Parts
          const skillsSet = new Set()
          parts.forEach(part => {
             const skillValue = part.skill || part.Skill
             const skillName = skillMapping[skillValue]
             if (skillName) skillsSet.add(skillName)
          })
          
          if (skillsSet.size > 0) {
            const skillsList = Array.from(skillsSet).map(s => ({ name: s, duration: undefined }))
            form.setFieldsValue({ skills: skillsList })
          }
        }
      } catch (error) {
        console.error('Lỗi khi tải thông tin mẫu đề:', error)
      }
    }

    if (templateId && open) {
      setupSkillsFromTemplate()
    }
  }, [templateId, form, open, exam])

  // Reset form khi đóng modal
  useEffect(() => {
    if (!open) {
      form.resetFields()
      setExamTemplates([])
    }
  }, [open, form])

  const handleSubmit = useCallback(async (values) => {
    if (!exam?.examId) {
      message.error('Không tìm thấy ID đề thi')
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
        examId: exam.examId,
        title: values.title?.trim(),
        skillDurations,
        examTemplateId: values.examTemplateId,
      }

      await updateExamInfo(payload)
      message.success('Cập nhật thông tin đề thi thành công!')
      if (onSuccess) {
        await onSuccess()
      }
      onCancel()
    } catch (error) {
      message.error(error?.response?.data?.message || error?.message || 'Cập nhật thông tin đề thi thất bại')
    } finally {
      setLoading(false)
    }
  }, [exam?.examId, onSuccess, onCancel])

  const handleOk = useCallback(() => {
    form.submit()
  }, [form])

  const handleCancelClick = useCallback(() => {
    onCancel()
  }, [onCancel])

  return (
    <Modal
      title="Chỉnh sửa thông tin đề thi"
      open={open}
      onCancel={handleCancelClick}
      onOk={handleOk}
      confirmLoading={loading}
      okText="Lưu thay đổi"
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
              style={{ marginBottom: 16 }}
            >
              <Input placeholder="Ví dụ: Đề thi thử TOPIK I số 01" size="middle" />
            </Form.Item>

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
          </div>

          <div style={{ height: 1.5, background: '#f0f0f0', margin: '24px 0' }} />

          {/* Section 2: Thời lượng kỹ năng */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 12 
            }}>
              <div style={{ fontSize: 12, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>2. Thời lượng kỹ năng</div>
              <span style={{ fontSize: '10px', color: '#bfbfbf' }}>(phút)</span>
            </div>

            <Form.List name="skills">
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
                          disabled={!!templateId}
                        >
                          <Option value="Listening">Listening</Option>
                          <Option value="Reading">Reading</Option>
                          <Option value="Writing">Writing</Option>
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
                      {fields.length > 1 && !templateId && (
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        />
                      )}
                    </div>
                  ))}
                  {!templateId && (
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

export default EditExamInfoModal
