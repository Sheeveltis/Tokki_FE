'use client'

import React, { useState } from 'react'
import { useRouter } from 'solito/navigation'
import { Card, Form, Space, Typography, message, Divider } from 'antd'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { AdminLayout } from '../../components/admin-layout.web'
import { createQuestion } from './api/api'
import { QuestionForm } from './components/QuestionForm'
import { AnswerForm } from './components/AnswerForm'

const { Title } = Typography

export function CreateQuestionScreen() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values) => {
    try {
      setLoading(true)
      
      // Validate answers
      if (!values.answers || values.answers.length < 2) {
        message.error('Cần ít nhất 2 đáp án')
        return
      }

      const correctAnswers = values.answers.filter((a) => a?.isCorrect)
      if (correctAnswers.length === 0) {
        message.error('Cần ít nhất 1 đáp án đúng')
        return
      }

      // Prepare payload
      const payload = {
        content: values.content,
        type: values.type,
        difficulty: values.difficulty,
        skill: values.skill,
        examType: values.examType,
        answers: values.answers.map((answer) => ({
          content: answer.content,
          isCorrect: answer.isCorrect || false,
        })),
      }

      await createQuestion(payload)
      message.success('Đã tạo câu hỏi mới thành công')
      router.push('/admin?tab=question-bank')
    } catch (error) {
      message.error(error.message || 'Tạo câu hỏi thất bại')
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
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={3} style={{ marginBottom: 4 }}>
                Tạo câu hỏi mới
              </Title>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                answers: [
                  { content: '', isCorrect: false },
                  { content: '', isCorrect: false },
                ],
              }}
            >
              <QuestionForm form={form} />

              <Divider />

              <AnswerForm form={form} />

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

export default CreateQuestionScreen

