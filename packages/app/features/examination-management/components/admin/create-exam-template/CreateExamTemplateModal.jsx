import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'solito/navigation'
import { Modal, Form, Input, Select, message } from 'antd'
import { createExamTemplate } from '../../../../back-office/api/admin-index.js'

const { TextArea } = Input

// TODO: Lấy từ API hoặc constants
const examTypeOptions = [
  { value: 'TOPIK I', label: 'TOPIK I' },
  { value: 'TOPIK II', label: 'TOPIK II' },
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
        description: values.description || '',
        examType: values.examType,
      }

      // Gọi API để tạo exam template
      const result = await createExamTemplate(payload)
      const examTemplateId = result.examTemplateId || result.ExamTemplateId
      
      if (!examTemplateId) {
        throw new Error('Không nhận được ID mẫu đề từ server')
      }
      
      message.success('Đã tạo mẫu đề mới thành công')
      onCancel()
      
      // Navigate đến trang detail để quản lý parts
      if (onSuccess) {
        onSuccess(examTemplateId)
      } else {
        router.push(`/admin/exam-templates/${examTemplateId}`)
      }
    } catch (error) {
      // Hiển thị error message từ API
      const errorMessage = error.message || 'Tạo mẫu đề thất bại'
      message.error(errorMessage)
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

