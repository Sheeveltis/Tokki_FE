'use client'

import React from 'react'
import { Modal, Form, Input, Select, Space } from 'antd'
import { FontSizeOutlined, TranslationOutlined, CheckCircleOutlined } from '@ant-design/icons'

const { TextArea } = Input

/**
 * Modal chỉnh sửa câu mẫu
 */
export function ExampleEditModal({ open, loading, initialValues = {}, onCancel, onSubmit }) {
  const [form] = Form.useForm()

  // Reset form when modal closes
  React.useEffect(() => {
    if (open) {
      form.setFieldsValue({
        sentence: initialValues?.sentence || '',
        translation: initialValues?.translation || '',
        status: initialValues?.status !== undefined ? initialValues.status : 1,
      })
    } else {
      form.resetFields()
    }
  }, [open, initialValues, form])

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
      title="Chỉnh sửa câu mẫu"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Lưu"
      cancelText="Hủy"
      confirmLoading={loading}
      destroyOnClose
      centered
      styles={{
        header: { fontSize: 18 },
        body: { fontSize: 16 },
      }}
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          label={<Space><FontSizeOutlined style={{ color: '#1677ff' }} />Câu mẫu (Bắt buộc)</Space>}
          name="sentence"
          rules={[{ required: true, message: 'Vui lòng nhập câu mẫu' }]}
        >
          <TextArea
            placeholder="VD: 나는 은행에 가서 돈을 인출했다"
            rows={3}
            size="large"
            style={{ fontSize: 16 }}
          />
        </Form.Item>
        <Form.Item label={<Space><TranslationOutlined style={{ color: '#1677ff' }} />Bản dịch</Space>} name="translation">
          <TextArea
            placeholder="VD: Tôi đã đến ngân hàng để rút tiền"
            rows={3}
            size="large"
            style={{ fontSize: 16 }}
          />
        </Form.Item>
        <Form.Item 
          label={<Space><CheckCircleOutlined style={{ color: '#1677ff' }} />Trạng thái (Bắt buộc)</Space>} 
          name="status" 
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
        >
          <Select size="large" style={{ fontSize: 16 }}>
            <Select.Option value={0}>Bản nháp</Select.Option>
            <Select.Option value={1}>Hoạt động</Select.Option>
            <Select.Option value={2}>Đã xóa</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ExampleEditModal

