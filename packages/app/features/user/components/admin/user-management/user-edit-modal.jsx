'use client'

import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, DatePicker, message, Spin, Space } from 'antd'
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  CalendarOutlined, 
  SafetyCertificateOutlined, 
  CheckCircleOutlined 
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { fetchUserDetail, updateUserProfile } from '../../../api/user-detail'

/**
 * UserEditModal: Modal để sửa thông tin cơ bản người dùng ngay tại trang danh sách.
 * Props:
 *  - open: boolean
 *  - userId: string | number
 *  - onOk: () => void (khi update xong thành công)
 *  - onCancel: () => void
 */
export function UserEditModal({ open, userId, onOk, onCancel }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [userData, setUserData] = useState(null)

  // Load chi tiết user khi mở modal hoặc đổi userId
  useEffect(() => {
    if (open && userId) {
      loadUserDetail()
    }
  }, [open, userId])

  const loadUserDetail = async () => {
    setLoading(true)
    try {
      const data = await fetchUserDetail(userId)
      setUserData(data)
      form.setFieldsValue({
        fullName: data.fullName || '',
        phoneNumber: data.phoneNumber || '',
        dateOfBirth: data.dateOfBirth ? dayjs(data.dateOfBirth) : null,
        role: Number(data.role ?? 0),
        status: Number(data.status ?? 0),
        email: data.email || ''
      })
    } catch (error) {
      message.error('Không thể tải thông tin chi tiết người dùng')
      onCancel()
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      
      const payload = {
        targetUserId: userId,
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : '',
        role: values.role,
        status: values.status,
        avatarUrl: userData?.avatarUrl || '' // giữ nguyên avatar cũ
      }

      await updateUserProfile(payload)
      message.success('Cập nhật tài khoản thành công')
      onOk?.()
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Cập nhật tài khoản thất bại'
      message.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Chỉnh sửa thông tin người dùng"
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText="Lưu thay đổi"
      cancelText="Hủy"
      confirmLoading={submitting}
      okButtonProps={{ style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } }}
      cancelButtonProps={{ style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } }}
      destroyOnHidden
      width={600}
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
          requiredMark={false}
        >
          <Form.Item
            label={<Space><UserOutlined style={{ color: '#1677ff' }} />Họ và tên (Bắt buộc)</Space>}
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Ví dụ: Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            label={<Space><MailOutlined style={{ color: '#1677ff' }} />Email (Không thể sửa)</Space>}
            name="email"
          >
            <Input disabled placeholder="Email của người dùng" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              label={<Space><PhoneOutlined style={{ color: '#1677ff' }} />Số điện thoại</Space>}
              name="phoneNumber"
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item
              label={<Space><CalendarOutlined style={{ color: '#1677ff' }} />Ngày sinh</Space>}
              name="dateOfBirth"
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              label={<Space><SafetyCertificateOutlined style={{ color: '#1677ff' }} />Vai trò (Bắt buộc)</Space>}
              name="role"
              rules={[{ required: true, message: 'Chọn vai trò' }]}
            >
              <Select options={[
                { value: 0, label: 'Người dùng' },
                { value: 1, label: 'Quản trị viên' },
                { value: 2, label: 'Nhân viên' },
                { value: 3, label: 'Thành viên VIP' }
              ]} />
            </Form.Item>

            <Form.Item
              label={<Space><CheckCircleOutlined style={{ color: '#1677ff' }} />Trạng thái (Bắt buộc)</Space>}
              name="status"
              rules={[{ required: true, message: 'Chọn trạng thái' }]}
            >
              <Select options={[
                { value: 1, label: 'Hoạt động' },
                { value: 0, label: 'Vô hiệu hóa' },
                { value: 2, label: 'Đã bị khóa' }
              ]} />
            </Form.Item>
          </div>
        </Form>
      </Spin>
    </Modal>
  )
}

export default UserEditModal
