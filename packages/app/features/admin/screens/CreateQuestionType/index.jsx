'use client'

import React, { useState } from 'react'
import { useRouter } from 'solito/navigation'
import { Card, Form, Space, Typography, message, Divider } from 'antd'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { AdminLayout } from '../../components/admin-layout.web'
import { createQuestionType } from './api/api'
import { QuestionTypeForm } from './components/QuestionTypeForm'

const { Title } = Typography

export function CreateQuestionTypeScreen() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values) => {
    try {
      setLoading(true)

      // Prepare payload
      const payload = {
        code: values.code?.toUpperCase().trim(),
        name: values.name?.trim(),
        description: values.description?.trim(),
        skill: values.skill,
        isActive: values.isActive ? 1 : 0,
      }

      await createQuestionType(payload)
      message.success('Đã tạo loại câu hỏi mới thành công')
      router.push('/admin?tab=question-bank')
    } catch (error) {
      message.error(error.message || 'Tạo loại câu hỏi thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin?tab=question-bank')
  }

  const handleNavigate = (key) => {
    router.push(`/admin?tab=${key}`)
  }

  return (
    <AdminLayout defaultKey="question-bank" onNavigate={handleNavigate}>
      <div style={{ padding: 24 }}>
        <Card>
          <Space orientation="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={3} style={{ marginBottom: 4 }}>
                Tạo loại câu hỏi mới
              </Title>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <QuestionTypeForm form={form} />

              <Divider />

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

export default CreateQuestionTypeScreen

