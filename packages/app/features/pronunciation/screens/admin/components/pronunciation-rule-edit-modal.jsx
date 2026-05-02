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
 * Modal chỉnh sửa quy tắc phát âm
 */
export function PronunciationRuleEditModal({ open, loading, rule, onCancel, onSubmit }) {
  const [form] = Form.useForm()

  const quillModules = {
    toolbar: [
      ['bold']
    ],
  }

  // Điền dữ liệu vào form khi rule thay đổi hoặc modal mở
  React.useEffect(() => {
    if (open && rule) {
      form.setFieldsValue({
        ruleName: rule.title || rule.ruleName,
        description: rule.description,
        content: rule.content || rule._raw?.content,
      })
    } else if (!open) {
      form.resetFields()
    }
  }, [open, rule, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const payload = {
        pronunciationRuleId: rule.id,
        ...values
      }
      onSubmit?.(payload)
    } catch (err) {
      // ignore validation errors
    }
  }

  return (
    <Modal
      title="Chỉnh sửa quy tắc phát âm"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Lưu"
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

export default PronunciationRuleEditModal
