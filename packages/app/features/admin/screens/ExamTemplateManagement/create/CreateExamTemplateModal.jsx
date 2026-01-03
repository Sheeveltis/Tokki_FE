'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'solito/navigation'
import { Modal, Form, Input, Select, message } from 'antd'
// TODO: Thay thế bằng API thực tế khi có
// import { createExamTemplate } from '../../api'

const { TextArea } = Input

// TODO: Lấy từ API hoặc constants
const examTypeOptions = [
  { value: 'TOPIK I', label: 'TOPIK I' },
  { value: 'TOPIK II', label: 'TOPIK II' },
  { value: 'Test đầu vào', label: 'Test đầu vào' },
]

function CreateExamTemplateModal({ open, onCancel, onSuccess }) {
  const router = useRouter()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // Reset form khi modal đóng
  useEffect(() => {
    if (!open) {
      form.resetFields()
    }
  }, [open, form])

  const handleSubmit = useCallback(async (values) => {
    try {
      setLoading(true)
      
      // Format data để gửi lên API
      const payload = {
        name: values.name,
        description: values.description,
        examType: values.examType,
      }

      // TODO: Thay bằng API call thực tế
      // const result = await createExamTemplate(payload)
      // const examTemplateId = result.ExamTemplateId
      const examTemplateId = `temp_${Date.now()}` // Mock ID
      console.log('Payload:', payload)
      
      message.success('Đã tạo mẫu đề mới thành công')
      onCancel()
      
      // Navigate đến trang detail để quản lý parts
      if (onSuccess) {
        onSuccess(examTemplateId)
      } else {
        router.push(`/admin/exam-templates/${examTemplateId}`)
      }
    } catch (error) {
      message.error(error.message || 'Tạo mẫu đề thất bại')
    } finally {
      setLoading(false)
    }
  }, [onCancel, onSuccess, router])

  const handleCancelClick = useCallback(() => {
    onCancel()
  }, [onCancel])

  const handleOk = useCallback(() => {
    form.submit()
  }, [form])

  return (
    <Modal
      title="Tạo mẫu đề mới"
      open={open}
      onCancel={handleCancelClick}
      onOk={handleOk}
      confirmLoading={loading}
      okText="Tạo mới"
      cancelText="Hủy"
      width={600}
      destroyOnClose
      maskClosable={false}
      transitionName=""
      maskTransitionName=""
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ maxWidth: 600 }}
        preserve={false}
        validateTrigger="onSubmit"
      >
        <Form.Item
          label="Tên mẫu đề"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên mẫu đề' }]}
          validateTrigger="onSubmit"
        >
          <Input placeholder="VD: Mẫu Đề TOPIK I" />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
          validateTrigger="onSubmit"
        >
          <TextArea
            rows={3}
            placeholder="VD: Đề gồm 30 câu nghe, 40 câu đọc và 3 câu viết"
          />
        </Form.Item>

        <Form.Item
          label="Loại đề"
          name="examType"
          rules={[{ required: true, message: 'Vui lòng chọn loại đề' }]}
          validateTrigger="onSubmit"
        >
          <Select
            placeholder="Chọn loại đề"
            options={examTypeOptions}
            showSearch={false}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default React.memo(CreateExamTemplateModal)

