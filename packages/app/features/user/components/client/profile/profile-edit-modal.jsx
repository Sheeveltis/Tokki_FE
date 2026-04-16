import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, DatePicker, message, Spin } from 'antd'
import dayjs from 'dayjs'

/**
 * ProfileEditModal: Modal dành cho người dùng tự sửa thông tin cá nhân
 */
export function ProfileEditModal({ open, initialValues, onOk, onCancel }) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue({
        fullName: initialValues.username || '',
        phoneNumber: initialValues.phone || '',
        dateOfBirth: initialValues.dateOfBirth ? dayjs(initialValues.dateOfBirth) : null,
        email: initialValues.email || ''
      })
    }
  }, [open, initialValues])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      
      // Truyền trực tiếp values (chứa dayjs object) để handler xử lý linh hoạt hơn
      await onOk(values)
      form.resetFields()
    } catch (error) {
      console.error('Validate failed:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title={<span style={{ fontWeight: 800, fontSize: 20, fontFamily: 'Epilogue, sans-serif' }}>Chỉnh sửa thông tin cá nhân</span>}
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText="Lưu thay đổi"
      cancelText="Hủy"
      confirmLoading={submitting}
      destroyOnHidden
      width={500}
      centered
      okButtonProps={{
        style: { backgroundColor: '#F1BE4B', borderColor: '#F1BE4B', borderRadius: 10, height: 40, fontWeight: 700 }
      }}
      cancelButtonProps={{
        style: { borderRadius: 10, height: 40 }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 24 }}
      >
        <Form.Item
          label={<span style={{ fontWeight: 600 }}>Họ và tên</span>}
          name="fullName"
          rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
        >
          <Input 
            placeholder="Ví dụ: Nguyễn Văn A" 
            style={{ borderRadius: 10, padding: '8px 12px' }}
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ fontWeight: 600 }}>Email (Không thể thay đổi)</span>}
          name="email"
        >
          <Input 
            disabled 
            style={{ borderRadius: 10, padding: '8px 12px', backgroundColor: '#F5F5F5' }}
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ fontWeight: 600 }}>Số điện thoại</span>}
          name="phoneNumber"
        >
          <Input 
            placeholder="Nhập số điện thoại" 
            style={{ borderRadius: 10, padding: '8px 12px' }}
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ fontWeight: 600 }}>Ngày sinh</span>}
          name="dateOfBirth"
        >
          <DatePicker 
            style={{ width: '100%', borderRadius: 10, padding: '8px 12px' }} 
            format="YYYY-MM-DD" 
            placeholder="Chọn ngày sinh" 
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
