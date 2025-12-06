'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Form, Input, Space, Typography, message } from 'antd'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { AdminLayout } from '../../components/admin-layout.web'
import { createLesson } from '../../api'

const { Title } = Typography
const { TextArea } = Input

export function CreateLessonScreen() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values) => {
    try {
      setLoading(true)
      await createLesson(values)
      message.success('Đã tạo bài học mới thành công')
      router.push('/admin?tab=lessons')
    } catch (error) {
      message.error('Tạo bài học thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin?tab=lessons')
  }

  return (
    <AdminLayout defaultKey="lessons" onNavigate={(key) => router.push(`/admin?tab=${key}`)}>
      <div style={{ padding: 24 }}>
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={3} style={{ marginBottom: 4 }}>
                Tạo bài học mới
              </Title>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              style={{ maxWidth: 600 }}
            >
              <Form.Item
                label="Tiêu đề"
                name="title"
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
              >
                <Input placeholder="VD: Lesson 1: Greetings" size="large" />
              </Form.Item>

              <Form.Item
                label="Tác giả"
                name="author"
                rules={[{ required: true, message: 'Vui lòng nhập tác giả' }]}
                initialValue="Team Tokki"
              >
                <Input placeholder="Tác giả" size="large" />
              </Form.Item>

              <Form.Item
                label="Mô tả"
                name="description"
              >
                <TextArea
                  rows={4}
                  placeholder="Mô tả bài học..."
                  size="large"
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

export default CreateLessonScreen




