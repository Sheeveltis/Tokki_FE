'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'solito/navigation'
import { Card, Form, Input, Select, Typography, message, DatePicker, Row, Col, Avatar, Descriptions, Button } from 'antd'
import { statusUser } from '../../../../string.js'
import { AdminLayout } from 'app/features/back-office/components/admin/admin-layout.web.jsx'
import { createAdminStaff } from '../../api/create-admin-staff.js'

const { Title, Text } = Typography

export function CreateAdminStaffScreen() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [, startTransition] = useTransition()
  
  // Watch form values for header display
  const fullName = Form.useWatch('fullName', form)
  const email = Form.useWatch('email', form)
  const phoneNumber = Form.useWatch('phoneNumber', form)
  const role = Form.useWatch('role', form)

  const getApiErrorMessage = (err, fallback) => {
    const apiMessage = err?.response?.data?.message
    const apiErrors = err?.response?.data?.errors
    const firstError = Array.isArray(apiErrors) && apiErrors.length ? apiErrors[0]?.description : null
    return apiMessage || firstError || err?.message || fallback
  }

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
        status: 'Active',
      }
      const response = await createAdminStaff(payload)
      message.success(response?.data || response?.message || 'Đã tạo Admin/Staff mới thành công')
      router.push('/admin?tab=users-admin')
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Tạo Admin/Staff thất bại'))
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/admin?tab=users-admin')
  }

  const handleNavigate = (key) => {
    startTransition(() => {
      router.push(`/admin?tab=${key}`)
    })
  }

  const getRoleLabel = (val) => {
    if (val === 'Admin') return 'Quản trị viên'
    if (val === 'Staff') return 'Nhân viên'
    return val || ''
  }

  return (
    <AdminLayout defaultKey="users-admin" onNavigate={handleNavigate}>
      <div
        style={{
          padding: '24px',
          width: '100%',
          overflowX: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          {/* Back Button */}
          <div style={{ marginBottom: 8 }}>
            <Button
              onClick={handleBack}
              style={{ minWidth: 120, paddingTop: 10, paddingBottom: 10 }}
            >
              Quay lại
            </Button>
          </div>

          <Form
            form={form}
            layout="vertical"
            initialValues={{ role: 'Staff' }}
            onFinish={handleSubmit}
          >
            {/* Row 1: Header */}
            <Row gutter={[16, 0]} style={{ margin: 0, width: '100%' }}>
              {/* Card: Avatar + Thông tin */}
              <Col xs={24} sm={24} md={24}>
                <Card style={{ borderRadius: 8, height: '100%' }}>
                  <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                    {/* Avatar Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <Avatar
                        size={120}
                        style={{ border: '3px solid #e8e8e8' }}
                      >
                        {fullName?.[0]?.toUpperCase() || 'U'}
                      </Avatar>
                      <div style={{ textAlign: 'center' }}>
                        <Title level={4} style={{ margin: 0, marginBottom: 4 }}>
                          {fullName || 'Tên Admin/Staff'}
                        </Title>
                        <Text type="secondary" style={{ fontSize: 14 }}>
                          {getRoleLabel(role) || 'Nhân viên'}
                        </Text>
                      </div>
                    </div>

                    {/* Info Section */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <Row gutter={[24, 16]}>
                        <Col span={12}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                                Email:
                              </Text>
                              <Text strong style={{ fontSize: 14 }}>
                                {email || '-'}
                              </Text>
                            </div>
                            <div>
                              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                                Số điện thoại:
                              </Text>
                              <Text strong style={{ fontSize: 14 }}>
                                {phoneNumber || '-'}
                              </Text>
                            </div>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                                Ngày tạo:
                              </Text>
                              <Text strong style={{ fontSize: 14, color: '#d9d9d9' }}>
                                -
                              </Text>
                            </div>
                            <div>
                              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                                Ngày cập nhật:
                              </Text>
                              <Text strong style={{ fontSize: 14, color: '#d9d9d9' }}>
                                -
                              </Text>
                            </div>
                          </div>
                        </Col>
                      </Row>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        <Button
                          onClick={handleBack}
                          style={{ minWidth: 140, paddingTop: 10, paddingBottom: 10 }}
                        >
                          Hủy
                        </Button>
                        <Button
                          type="primary"
                          onClick={() => form.submit()}
                          loading={loading}
                          style={{ minWidth: 140, paddingTop: 10, paddingBottom: 10 }}
                        >
                          {loading ? 'Đang tạo...' : 'Tạo mới'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Row 2: Thông tin tài khoản */}
            <Row gutter={[16, 16]} style={{ margin: 0, width: '100%', marginTop: 16 }}>
              <Col xs={24} sm={24} md={24}>
                <Card
                  title="Thông tin tài khoản"
                  style={{ borderRadius: 8, height: '100%' }}
                >
                  <Descriptions column={1} size="small" bordered>
                    <Descriptions.Item label="Họ tên">
                      <Form.Item name="fullName" noStyle rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                        <Input placeholder="Tên Admin/Staff" size="middle" maxLength={35} />
                      </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày sinh">
                      <Form.Item name="dateOfBirth" noStyle rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}>
                        <DatePicker
                          format="YYYY-MM-DD"
                          style={{ width: '100%' }}
                          size="middle"
                          placeholder="Chọn ngày sinh"
                        />
                      </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      <Form.Item name="email" noStyle rules={[
                        { required: true, message: 'Vui lòng nhập email' },
                        { type: 'email', message: 'Email không hợp lệ' },
                      ]}>
                        <Input placeholder="email@example.com" size="middle" />
                      </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">
                      <Form.Item name="phoneNumber" noStyle rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                        <Input placeholder="Số điện thoại" size="middle" />
                      </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="Vai trò">
                      <Form.Item name="role" noStyle rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}>
                        <Select
                          style={{ width: '100%' }}
                            size="middle"
                          options={[
                            { value: 'Admin', label: 'Quản trị viên' },
                            { value: 'Staff', label: 'Nhân viên' },
                          ]}
                        />
                      </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      <Text style={{ fontSize: 12 }}>{statusUser.Active}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>

            {/* Bottom Save Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <Button
                type="primary"
                onClick={() => form.submit()}
                loading={loading}
                style={{ minWidth: 140, paddingTop: 10, paddingBottom: 10 }}
              >
                {loading ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </AdminLayout>
  )
}

export default CreateAdminStaffScreen

