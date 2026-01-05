'use client'

import React, { useState } from 'react'
import { Card, Form, Input, Select, Button, Space, Typography, Switch, Divider, Tag, message } from 'antd'
import { ButtonV2 } from '../../../components/buttonV2.jsx'
import { mockEmailTemplates } from '../admin/mockData.js'
import { sendEmail } from '../admin/api'
import { MailOutlined, SendOutlined } from '@ant-design/icons'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

export function AutoEmail() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSend = async (values) => {
    setLoading(true)
    try {
      const result = await sendEmail(values)
      message.success(result.message || 'Email đã được gửi thành công')
      form.resetFields()
    } catch (error) {
      message.error('Gửi email thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            Gửi mail tự động
          </Title>
          <Text type="secondary">Cấu hình và gửi email tự động cho người dùng</Text>
        </div>

        <Card>
          <Form form={form} layout="vertical" onFinish={handleSend}>
            <Form.Item
              label="Chọn mẫu email"
              name="template"
              rules={[{ required: true, message: 'Vui lòng chọn mẫu email' }]}
            >
              <Select placeholder="Chọn mẫu email" size="large">
                {mockEmailTemplates.map((template) => (
                  <Option key={template.id} value={template.id}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{template.name}</div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {template.description}
                      </Text>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Gửi đến"
              name="recipients"
              rules={[{ required: true, message: 'Vui lòng chọn đối tượng nhận email' }]}
            >
              <Select mode="multiple" placeholder="Chọn đối tượng nhận email" size="large">
                <Option value="all">Tất cả người dùng</Option>
                <Option value="active">Người dùng đang hoạt động</Option>
                <Option value="inactive">Người dùng không hoạt động</Option>
                <Option value="premium">Người dùng premium</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Tiêu đề email" name="subject" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
              <Input placeholder="Nhập tiêu đề email" size="large" />
            </Form.Item>

            <Form.Item
              label="Nội dung email"
              name="content"
              rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
            >
              <TextArea rows={10} placeholder="Nhập nội dung email..." />
            </Form.Item>

            <Form.Item label="Tùy chọn" name="options" valuePropName="checked">
              <Space direction="vertical">
                <div>
                  <Switch /> <Text>Gửi ngay lập tức</Text>
                </div>
                <div>
                  <Switch /> <Text>Lên lịch gửi</Text>
                </div>
                <div>
                  <Switch /> <Text>Gửi bản sao cho admin</Text>
                </div>
              </Space>
            </Form.Item>

            <Divider />

            <Form.Item>
              <Space>
                <ButtonV2
                  title="Gửi email"
                  color="#F1BE4B"
                  onPress={() => form.submit()}
                  style={{ minWidth: 120, paddingVertical: 10 }}
                  textStyle={{ fontSize: 14 }}
                />
                <ButtonV2
                  title="Lưu nháp"
                  color="mint"
                  onPress={() => {
                    // TODO: Save draft
                    console.log('Save draft')
                  }}
                  style={{ minWidth: 120, paddingVertical: 10 }}
                  textStyle={{ fontSize: 14 }}
                />
              </Space>
            </Form.Item>
          </Form>
        </Card>

        <Card title="Lịch sử gửi email">
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            <Text type="secondary">Chưa có lịch sử gửi email</Text>
          </div>
        </Card>
      </Space>
    </div>
  )
}

export default AutoEmail

