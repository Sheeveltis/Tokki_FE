'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Modal, Form, Input, InputNumber, Select, message } from 'antd'
import { updateExamInfo } from '../../../api/exam-management.js'
import { fetchExamTemplates } from '../../../../back-office/api/admin-index.js'

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

      form.setFieldsValue({
        title: exam.title || '',
        duration: exam.duration || undefined,
        examTemplateId: examTemplateId,
      })
    }
  }, [open, exam, form])

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

    try {
      setLoading(true)

      const payload = {
        examId: exam.examId,
        title: values.title?.trim(),
        duration: values.duration,
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
      throw error
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
        {/* Chọn mẫu đề */}
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

export default EditExamInfoModal
