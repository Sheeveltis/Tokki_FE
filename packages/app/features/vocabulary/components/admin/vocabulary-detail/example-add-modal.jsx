'use client'

import React from 'react'
import { Modal, Form, Input } from 'antd'

const { TextArea } = Input

/**
 * Modal thêm câu mẫu vào từ vựng
 */
export function ExampleAddModal({ open, loading, onCancel, onSubmit }) {
  const [form] = Form.useForm()

  // Reset form when modal closes
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
      title="Thêm câu mẫu"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Thêm"
      cancelText="Hủy"
      confirmLoading={loading}
      destroyOnClose
      centered
      styles={{
        header: { fontSize: 18 },
        body: { fontSize: 16 },
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Câu mẫu"
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
        <Form.Item label="Bản dịch" name="translation">
          <TextArea
            placeholder="VD: Tôi đã đến ngân hàng để rút tiền"
            rows={3}
            size="large"
            style={{ fontSize: 16 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ExampleAddModal

