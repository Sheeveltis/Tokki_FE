'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'solito/navigation'
import { Card, Form, Input, Select, Space, Typography, message, Row, Col, Avatar, Descriptions, Button } from 'antd'
import { statusUser } from '../../../../string.js'
import { createUser } from 'app/features/back-office/api/admin-index.js'

const { Title, Text } = Typography

export function CreateUserScreen() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [, startTransition] = useTransition()
  
  // Watch form values for header display
  const name = Form.useWatch('name', form)
  const email = Form.useWatch('email', form)
  const role = Form.useWatch('role', form)

  const handleSubmit = async (values) => {
    try {
      setLoading(true)
      await createUser(values)
      message.success('Đã tạo người dùng mới thành công')
      router.push('/admin?tab=users-all')
    } catch (error) {
      // Lấy error message từ response
      const errorData = error.response?.data
      let errorMessage = 'Tạo người dùng thất bại'
      
      // Ưu tiên lấy description từ errors array
      if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        errorMessage = errorData.errors[0].description || errorData.message || errorMessage
      } else if (errorData?.message) {
        errorMessage = errorData.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    startTransition(() => {
      router.push('/admin?tab=users-all')
    })
  }

  return (
    <>
      <div
        style={{
          padding: '24px',
          width: '100%',
          overflowX: 'hidden',
          boxSizing: 'border-box',
          background: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        <Space
          size="large"
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Back Button */}
          <div style={{ marginBottom: 8 }}>
            <Button
              onClick={handleCancel}
              style={{ height: 'auto', padding: '8px 24px', backgroundColor: '#373039', color: '#fff', border: 'none' }}
            >
              Quay lại
            </Button>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            {/* Row 1: Header + Thông tin cá nhân */}
            <Row gutter={[16, 0]} style={{ margin: 0, width: '100%' }}>
              {/* Card: Avatar + Thông tin */}
              <Col xs={24} sm={24} md={12}>
                <Card style={{ borderRadius: 8, height: '100%' }}>
                  <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                    {/* Avatar Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <Avatar
                        size={120}
                        style={{ border: '3px solid #e8e8e8' }}
                      >
                        {name?.[0]?.toUpperCase() || 'U'}
                      </Avatar>
                      <div style={{ textAlign: 'center' }}>
                        <Title level={4} style={{ margin: 0, marginBottom: 4 }}>
                          {name || 'Tên người dùng'}
                        </Title>
                        <Text type="secondary" style={{ fontSize: 14 }}>
                          {role === 'User' ? 'Người dùng' : role || 'Người dùng'}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <strong>UID:</strong>
                        </Text>
                        <Text type="success" style={{ fontSize: 12 }}>
                          -
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
                              <Text strong style={{ fontSize: 14, color: '#d9d9d9' }}>
                                -
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
                          onClick={handleCancel}
                          style={{ height: 'auto', padding: '8px 24px', backgroundColor: '#373039', color: '#fff', border: 'none' }}
                        >
                          Hủy
                        </Button>
                        <Button
                          type="primary"
                          onClick={() => form.submit()}
                          loading={loading}
                          style={{ height: 'auto', padding: '8px 24px', backgroundColor: '#F87218', borderColor: '#F87218' }}
                        >
                          Tạo mới
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>

              {/* Card: Thông tin cá nhân */}
              <Col xs={24} sm={24} md={12}>
                <Card
                  title="Thông tin cá nhân"
                  style={{ borderRadius: 8, height: '100%' }}
                >
                  <Descriptions column={1} size="small" bordered>
                    <Descriptions.Item label="Họ tên">
                      <Form.Item name="name" noStyle rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                        <Input placeholder="Tên người dùng" size="small" />
                      </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày sinh">
                      <Text type="secondary" style={{ fontSize: 12 }}>-</Text>
                    </Descriptions.Item>
                  </Descriptions>
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
                    <Descriptions.Item label="Email">
                      <Form.Item name="email" noStyle rules={[
                        { required: true, message: 'Vui lòng nhập email' },
                        { type: 'email', message: 'Email không hợp lệ' },
                      ]}>
                        <Input placeholder="email@example.com" size="small" />
                      </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="Vai trò">
                      <Form.Item name="role" noStyle rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]} initialValue="User">
                        <Select
                          style={{ width: '100%' }}
                          size="small"
                          options={[
                            { value: 'User', label: 'Người dùng' },
                          ]}
                        />
                      </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      <Form.Item name="status" noStyle rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]} initialValue="Active">
                        <Select
                          style={{ width: '100%' }}
                          size="small"
                          options={[
                            { value: 'Active', label: statusUser.Active },
                            { value: 'Suspended', label: statusUser.Suspended },
                          ]}
                        />
                      </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="User ID">
                      <Text type="secondary" style={{ fontSize: 12 }}>-</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </Form>
        </Space>
      </div>
    </>
  )
}

export default CreateUserScreen


