'use client'

import React, { useEffect } from 'react'
import { Modal, Form, Input, InputNumber, Select, Switch, Button, message } from 'antd'

export default function AlphabetEditModal({ open, loading, initialValues, onCancel, onSubmit }) {
  const [form] = Form.useForm()

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues)
      } else {
        form.resetFields()
        form.setFieldsValue({ isActive: true, sortOrder: 1, type: 'Vowel' })
      }
    }
  }, [open, initialValues, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      onSubmit({ ...initialValues, ...values })
    } catch (error) {
      // Validation failed
    }
  }

  return (
    <Modal
      title={initialValues?.id ? 'Chỉnh sửa chữ cái' : 'Thêm chữ cái mới'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="Lưu"
      cancelText="Hủy"
      width={600}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 20 }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <Form.Item
            name="letter"
            label="Chữ cái (Hangul)"
            rules={[{ required: true, message: 'Vui lòng nhập chữ cái' }]}
          >
            <Input placeholder="VD: ㅏ" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="Vowel">Nguyên âm</Select.Option>
              <Select.Option value="Consonant">Phụ âm</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="meaning"
            label="Ý nghĩa"
            rules={[{ required: true, message: 'Vui lòng nhập ý nghĩa' }]}
          >
            <Input placeholder="VD: a" />
          </Form.Item>

          <Form.Item
            name="pronunciation"
            label="Phát âm"
            rules={[{ required: true, message: 'Vui lòng nhập cách phát âm' }]}
          >
            <Input placeholder="VD: a" />
          </Form.Item>

          <Form.Item
            name="audioUrl"
            label="Đường dẫn âm thanh"
          >
            <Input placeholder="URL từ Cloudinary..." />
          </Form.Item>

          <Form.Item
            name="sortOrder"
            label="Thứ tự sắp xếp"
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <Form.Item
          name="isActive"
          label="Trạng thái hoạt động"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  )
}
