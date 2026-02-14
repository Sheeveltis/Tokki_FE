'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Modal, Form, Input, InputNumber, Select, Radio, message } from 'antd'
import { createExam } from '../../api/exam-management.js'
import { fetchExamTemplates } from '../../../back-office/api/admin-index.js'

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

  const handleSubmit = useCallback(async (values) => {
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
        if (onSuccess) {
          await onSuccess(examId)
        }
        onCancel()
      } else {
        message.error('Tạo đề thi thất bại')
      }
    } catch (error) {
      message.error(error?.response?.data?.message || error?.message || 'Tạo đề thi thất bại')
      throw error
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
                <span style={{ color: '#888', fontSize: 12 }}>Đang tải danh sách mẫu đề...</span>
              ) : examTemplates.length === 0 ? (
                <span style={{ color: '#faad14', fontSize: 12 }}>Không có mẫu đề nào cho loại đề này</span>
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
          normalize={(value) => {
            if (value === '' || value === null || value === undefined) {
              return undefined
            }
            const num = Number(value)
            return isNaN(num) ? value : num
          }}
        >
          <InputNumber
            placeholder="Nhập thời gian làm bài (phút)"
            min={1}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CreateExamModal

