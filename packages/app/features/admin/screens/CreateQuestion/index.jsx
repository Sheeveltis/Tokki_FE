'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'solito/navigation'
import { Card, Form, Space, Typography, message, Divider, Input } from 'antd'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { AdminLayout } from '../../components/admin-layout.web'
import { createQuestion, activateQuestionBanks, submitQuestionBanksForApproval } from './api/api'
import { QuestionForm } from './components/QuestionForm'
import { AnswerForm } from './components/AnswerForm'

const { Title } = Typography

export function CreateQuestionScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const questionTypeId = searchParams?.get('questionTypeId')
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const getCreatedQuestionBankId = (created) => {
    // `createQuestion()` returns axios `response.data` (not the full axios response),
    // but backend responses may still be nested (e.g. { data: {...} } or { data: { data: {...} } }).
    const candidates = [
      created?.questionBankId,
      created?.questionBankID,
      created?.id,
      created?.data, // backend trả trực tiếp id ở field data (string) theo ví dụ
      created?.data?.questionBankId,
      created?.data?.questionBankID,
      created?.data?.id,
      created?.data?.data?.questionBankId,
      created?.data?.data?.questionBankID,
      created?.data?.data?.id,
    ]

    return candidates.find((x) => x !== undefined && x !== null && String(x).trim() !== '')
  }

  const handleSubmit = async (values) => {
    try {
      setLoading(true)

      // Validate options
      if (!values.options || values.options.length < 2) {
        message.error('Cần ít nhất 2 đáp án')
        return
      }

      const correctOptions = values.options.filter((a) => a?.isCorrect)
      if (correctOptions.length === 0) {
        message.error('Cần ít nhất 1 đáp án đúng')
        return
      }

      if (!questionTypeId) {
        message.error('Vui lòng chọn loại câu hỏi')
        return
      }

      // Upload media (nếu user chọn file) chỉ khi bấm Tạo mới
      const { uploadQuestionAudioToCloudinary, uploadQuestionImageToCloudinary, uploadOptionImageToCloudinary } = await import('../../api/cloudinary')

      let mediaUrl = values.mediaUrl || null
      if (values.mediaFile) {
        const isAudio = values.mediaFile?.type?.startsWith('audio/')
        mediaUrl = isAudio
          ? await uploadQuestionAudioToCloudinary(values.mediaFile)
          : await uploadQuestionImageToCloudinary(values.mediaFile)
      }

      const uploadedOptions = await Promise.all(
        (values.options || []).map(async (option, index) => {
          let imageUrl = option.imageUrl || null
          if (option.imageFile) {
            imageUrl = await uploadOptionImageToCloudinary(option.imageFile)
          }
          return {
            keyOption: String(option.keyOption || index + 1),
            content: option.content?.trim(),
            imageUrl,
            isCorrect: option.isCorrect || false,
          }
        }),
      )

      // Prepare payload theo API
      const payload = {
        passageId: values.passageId || null,
        questionTypeId: questionTypeId,
        content: values.content?.trim(),
        mediaUrl,
        explanation: values.explanation?.trim() || null,
        options: uploadedOptions,
        status: values.status ?? 0,
      }

      const created = await createQuestion(payload)

      // Nếu chọn Hoạt động (admin) hoặc Gửi duyệt (staff) thì gọi thêm API tương ứng
      const createdId = getCreatedQuestionBankId(created)
      if ((values.status ?? 0) === 1) {
        if (!createdId) {
          throw new Error('Tạo câu hỏi thành công nhưng không lấy được ID để kích hoạt (activate).')
        }
        await activateQuestionBanks([createdId])
      } else if ((values.status ?? 0) === 3) {
        if (!createdId) {
          throw new Error('Tạo câu hỏi thành công nhưng không lấy được ID để gửi duyệt.')
        }
        await submitQuestionBanksForApproval([createdId])
      }

      message.success('Đã tạo câu hỏi mới thành công')

      if (questionTypeId) {
        router.push(`/admin/question-type/${questionTypeId}`)
      } else {
        router.push('/admin?tab=question-bank')
      }
    } catch (error) {
      message.error(error.message || 'Tạo câu hỏi thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Nếu có questionTypeId, quay về trang detail của questionType đó
    if (questionTypeId) {
      router.push(`/admin/question-type/${questionTypeId}`)
    } else {
      router.push('/admin?tab=question-bank')
    }
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
                options: [
                  { keyOption: 1, content: '', imageUrl: '', isCorrect: false },
                  { keyOption: 2, content: '', imageUrl: '', isCorrect: false },
                ],
              }}
            >
              <QuestionForm form={form} questionTypeId={questionTypeId} />

              {/* hidden fields for local files */}
              <Form.Item name="mediaFile" hidden>
                <Input type="hidden" />
              </Form.Item>

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

