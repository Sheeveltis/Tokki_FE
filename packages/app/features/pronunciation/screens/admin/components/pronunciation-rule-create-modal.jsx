'use client'
import React from 'react'
import { Modal, Form, Input, Space } from 'antd'
import { 
  FontSizeOutlined, 
  FileTextOutlined, 
  AlignLeftOutlined 
} from '@ant-design/icons'

/**
 * Modal tạo mới quy tắc phát âm
 */
export function PronunciationRuleCreateModal({ open, loading, onCancel, onSubmit }) {
  const [form] = Form.useForm()

  // Reset form khi modal đóng
  React.useEffect(() => {
    if (!open) {
      form.resetFields()
    }
  }, [open, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      onSubmit?.(values)
    } catch (err) {
      // ignore validation errors
    }
  }

  return (
    <Modal
      title="Thêm quy tắc phát âm"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Tạo"
      cancelText="Hủy"
      confirmLoading={loading}
      okButtonProps={{ style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } }}
      cancelButtonProps={{ style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } }}
      destroyOnClose
      centered
      styles={{
        header: { fontSize: 18 },
        body: { fontSize: 16 },
      }}
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          label={<Space><FontSizeOutlined style={{ color: '#1677ff' }} />Tên quy tắc (Bắt buộc)</Space>}
          name="ruleName"
          rules={[{ required: true, message: 'Vui lòng nhập tên quy tắc' }]}
        >
          <Input placeholder="VD: Yeon-eum beop-chik" size="large" style={{ fontSize: 16 }} />
        </Form.Item>
        <Form.Item
          label={<Space><FileTextOutlined style={{ color: '#1677ff' }} />Mô tả (Bắt buộc)</Space>}
          name="description"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="VD: Quy tắc nối âm trong tiếng Hàn"
            style={{ fontSize: 16 }}
          />
        </Form.Item>
        <Form.Item
          label={<Space><AlignLeftOutlined style={{ color: '#1677ff' }} />Nội dung chi tiết (Bắt buộc)</Space>}
          name="content"
          rules={[{ required: true, message: 'Vui lòng nhập nội dung chi tiết' }]}
        >
          <Input.TextArea
            rows={5}
            placeholder="Nhập nội dung quy tắc..."
            style={{ fontSize: 16 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default PronunciationRuleCreateModal
