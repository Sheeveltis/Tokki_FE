'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Form, Input, Select, Space, Typography, message, DatePicker } from 'antd'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { statusUser } from '../../../../string.js'
import { AdminLayout } from '../../components/admin-layout.web'
import { createAdminStaff } from './api/api'

const { Title } = Typography

export function CreateAdminStaffScreen() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (values) => {
    try {
      setLoading(true)
      // Map role text -> enum number
      const roleEnum = values.role === 'Admin' ? 1 : 2 // Staff = 2
      const payload = {
        email: values.email,
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        dateOfBirth: values.dateOfBirth?.format('YYYY-MM-DD'),
        role: roleEnum,
      }
      await createAdminStaff(payload)
      message.success('Đã tạo Admin/Staff mới thành công')
      router.push('/admin?tab=users-admin')
    } catch (error) {
      // Error message đã được xử lý trong api/index.js với apiErrors
      message.error(error.message || 'Tạo Admin/Staff thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    startTransition(() => {
      router.push('/admin?tab=users-admin')
    })
  }

  const handleNavigate = (key) => {
    startTransition(() => {
      router.push(`/admin?tab=${key}`)
    })
  }

  return (
    <AdminLayout defaultKey="users-admin" onNavigate={handleNavigate}>
      <div style={{ padding: 24 }}>
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={3} style={{ marginBottom: 4 }}>
                Tạo Admin/Staff mới
              </Title>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              style={{ maxWidth: 600 }}
            >
              <Form.Item
                label="Tên"
                name="fullName"
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
              >
                <Input placeholder="Tên Admin/Staff" size="large" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' },
                ]}
              >
                <Input placeholder="email@example.com" size="large" />
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="phoneNumber"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input placeholder="Số điện thoại" size="large" />
              </Form.Item>

              <Form.Item
                label="Ngày sinh"
                name="dateOfBirth"
                rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
              >
                <DatePicker format="YYYY-MM-DD" size="large" style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                label="Vai trò"
                name="role"
                rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                initialValue="Staff"
              >
                <Select
                  size="large"
                  options={[
                    { value: 'Admin', label: 'Admin' },
                    { value: 'Staff', label: 'Staff' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label="Trạng thái"
                name="status"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                initialValue="Active"
              >
                <Select
                  size="large"
                  options={[
                    { value: 'Active', label: statusUser.Active },
                    { value: 'Suspended', label: statusUser.Suspended },
                  ]}
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <ButtonV2
                    title="Hủy"
                    color="charcoal"
                    onPress={handleCancel}
                    style={{ minWidth: 100, paddingVertical: 10 }}
                    textStyle={{ fontSize: 14 }}
                  />
                  <ButtonV2
                    title={loading ? 'Đang tạo...' : 'Tạo mới'}
                    color="poppy"
                    onPress={() => form.submit()}
                    style={{ minWidth: 120, paddingVertical: 10 }}
                    textStyle={{ fontSize: 14 }}
                  />
                </Space>
              </Form.Item>
            </Form>
          </Space>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default CreateAdminStaffScreen

