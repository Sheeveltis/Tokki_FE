'use client'

import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, Select } from 'antd'
import { ButtonV2 } from '../../../../../../components/buttonV2.jsx'
import { statusUser } from '../../../../../string.js'

/**
 * UpdateUserDetail: modal chỉnh sửa thông tin user (mock).
 * Props:
 *  - open: boolean
 *  - user: user object
 *  - onSave: (updatedUser) => void
 *  - onCancel: () => void
 */
export function UpdateUserDetail({ open, user, onSave, onCancel }) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
        status: user.status || '',
      })
    }
  }, [user, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      // mock save
      onSave?.({ ...user, ...values })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      title="Chỉnh sửa người dùng"
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
        >
          <Input placeholder="Tên người dùng" />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Email không hợp lệ' },
          ]}
        >
          <Input placeholder="email@example.com" />
        </Form.Item>
        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: 'Vui lòng chọn role' }]}
        >
          <Select
            options={[
              { value: 'Admin', label: 'Admin' },
              { value: 'Staff', label: 'Staff' },
              { value: 'User', label: 'User' },
            ]}
          />
        </Form.Item>
        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
        >
          <Select
            options={[
              { value: 'Active', label: statusUser.Active },
              { value: 'Suspended', label: statusUser.Suspended },
            ]}
          />
        </Form.Item>
      </Form>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <ButtonV2
          title="Hủy"
          color="charcoal"
          onPress={onCancel}
          style={{ minWidth: 80, paddingVertical: 10 }}
          textStyle={{ fontSize: 14 }}
        />
        <ButtonV2
          title={submitting ? 'Đang lưu...' : 'Lưu'}
          color="poppy"
          onPress={handleOk}
          style={{ minWidth: 100, paddingVertical: 10 }}
          textStyle={{ fontSize: 14 }}
        />
      </div>
    </Modal>
  )
}

export default UpdateUserDetail

