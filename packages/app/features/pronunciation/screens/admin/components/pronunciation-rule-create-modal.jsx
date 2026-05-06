'use client'
import React from 'react'
import { Modal, Form, Input, Space } from 'antd'
import { 
  FontSizeOutlined, 
  FileTextOutlined, 
  AlignLeftOutlined,
  BoldOutlined 
} from '@ant-design/icons'
import { ReactQuillWrapper } from '../../../../blog/components/create-blog/react-quill-wrapper.jsx'

/**
 * Modal tạo mới quy tắc phát âm
 */
export function PronunciationRuleCreateModal({ open, loading, onCancel, onSubmit }) {
  const [form] = Form.useForm()

  const quillModules = {
    toolbar: [
      ['bold']
    ],
  }

  // Reset form khi modal đóng
  React.useEffect(() => {
    if (!open) {
      form.resetFields()
    }
  }, [open, form])

  const cleanHtml = (html) => {
    if (!html) return ''
    return html
      .replace(/&nbsp;/g, ' ')
      .replace(/<strong>/g, '<b>')
      .replace(/<\/strong>/g, '</b>')
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      
      // Làm sạch HTML cho phần nội dung và mô tả
      const cleanedContent = cleanHtml(values.content)
      const cleanedDescription = cleanHtml(values.description)

      const payload = {
        ...values,
        content: cleanedContent,
        description: cleanedDescription
      }
      onSubmit?.(payload)
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
          <ReactQuillWrapper 
            className="pronunciation-editor"
            modules={quillModules}
            placeholder="Nhập nội dung quy tắc (Sử dụng nút B để in đậm)..."
            style={{ 
              border: '1px solid #d9d9d9', 
              borderRadius: 8,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default PronunciationRuleCreateModal
