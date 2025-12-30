'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'solito/navigation'
import { Card, Form, Input, Select, Space, Typography, message } from 'antd'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { statusUser } from '../../../../string.js'
import { AdminLayout } from '../../components/admin-layout.web'
import { createUser } from '../../api'

const { Title } = Typography

export function CreateUserScreen() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (values) => {
    try {
      setLoading(true)
      await createUser(values)
      message.success('Đã tạo người dùng mới thành công')
      router.push('/admin?tab=users-all')
    } catch (error) {
      // Error message đã được xử lý trong api/index.js với apiErrors
      message.error(error.message || 'Tạo người dùng thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    startTransition(() => {
      router.push('/admin?tab=users-all')
    })
  }

  const handleNavigate = (key) => {
    startTransition(() => {
      router.push(`/admin?tab=${key}`)
    })
  }

  return (
    <AdminLayout defaultKey="users-all" onNavigate={handleNavigate}>
      <div style={{ padding: 24 }}>
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={3} style={{ marginBottom: 4 }}>
                Tạo người dùng mới
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
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
              >
                <Input placeholder="Tên người dùng" size="large" />
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
                label="Vai trò"
                name="role"
                rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                initialValue="User"
              >
                <Select
                  size="large"
                  options={[
                    { value: 'User', label: 'User' },
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

export default CreateUserScreen


