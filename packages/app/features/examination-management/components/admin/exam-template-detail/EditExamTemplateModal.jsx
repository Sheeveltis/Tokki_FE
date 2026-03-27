import React, { useState, useCallback, useEffect } from 'react'
import { Modal, Form, Input, Select, message } from 'antd'
// TODO: Thay thế bằng API thực tế khi có
// import { updateExamTemplate } from '../../api'

const { TextArea } = Input

// TODO: Lấy từ API hoặc constants
const examTypeOptions = [
  { value: 'TOPIK I', label: 'TOPIK I' },
  { value: 'TOPIK II', label: 'TOPIK II' },
]

function EditExamTemplateModal({ open, examTemplate, onCancel, onSuccess }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // Set form values khi modal mở và có dữ liệu
  useEffect(() => {
    if (open && examTemplate) {
      form.setFieldsValue({
        name: examTemplate.name,
        description: examTemplate.description,
        examType: examTemplate.examType,
      })
    }
  }, [open, examTemplate, form])

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
      // Lưu ý: API update hiện tại KHÔNG cho phép cập nhật status,
      // nên chỉ gửi name, description, examType
      const payload = {
        name: values.name,
        description: values.description,
        examType: values.examType,
      }

      // TODO: Thay bằng API call thực tế
      // await updateExamTemplate(examTemplate.examTemplateId, payload)
      
      if (onSuccess) {
        // Chờ screen cha gọi API update và tự hiển thị message.success / message.error
        await onSuccess(payload)
      }
    } catch (error) {
      message.error(error.message || 'Cập nhật mẫu đề thất bại')
      throw error
    } finally {
      setLoading(false)
    }
  }, [examTemplate, onSuccess])

  const handleCancelClick = useCallback(() => {
    onCancel()
  }, [onCancel])

  const handleOk = useCallback(() => {
    form.submit()
  }, [form])

  return (
    <Modal
      title="Chỉnh sửa mẫu đề"
      open={open}
      onCancel={handleCancelClick}
      onOk={handleOk}
      confirmLoading={loading}
      okText="Lưu"
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

export default React.memo(EditExamTemplateModal)

