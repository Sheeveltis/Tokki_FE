'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Form, Input, Select, Space, Typography, message } from 'antd'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { AdminLayout } from '../../components/admin-layout.web'
import { createVocabulary } from '../../api'

const { Title } = Typography

export function CreateVocabularyScreen() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values) => {
    try {
      setLoading(true)
      await createVocabulary(values)
      message.success('Đã tạo từ vựng mới thành công')
      router.push('/admin?tab=vocab')
    } catch (error) {
      message.error('Tạo từ vựng thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin?tab=vocab')
  }

  return (
    <AdminLayout defaultKey="vocab" onNavigate={(key) => router.push(`/admin?tab=${key}`)}>
      <div style={{ padding: 24 }}>
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={3} style={{ marginBottom: 4 }}>
                Tạo từ vựng mới
              </Title>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              style={{ maxWidth: 600 }}
            >
              <Form.Item
                label="Từ tiếng Hàn"
                name="word"
                rules={[{ required: true, message: 'Vui lòng nhập từ tiếng Hàn' }]}
              >
                <Input placeholder="VD: 안녕하세요" size="large" />
              </Form.Item>

              <Form.Item
                label="Nghĩa tiếng Việt"
                name="meaning"
                rules={[{ required: true, message: 'Vui lòng nhập nghĩa' }]}
              >
                <Input placeholder="VD: Xin chào" size="large" />
              </Form.Item>

              <Form.Item
                label="Cấp độ"
                name="level"
                rules={[{ required: true, message: 'Vui lòng chọn cấp độ' }]}
              >
                <Select
                  size="large"
                  options={[
                    { value: 'Sơ cấp', label: 'Sơ cấp' },
                    { value: 'Trung cấp', label: 'Trung cấp' },
                    { value: 'Cao cấp', label: 'Cao cấp' },
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

export default CreateVocabularyScreen


