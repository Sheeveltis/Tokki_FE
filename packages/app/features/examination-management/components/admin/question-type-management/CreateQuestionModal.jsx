'use client'
import React, { useState, useEffect } from 'react'
import { Modal, Form, Space, Typography, Divider, Input, Button, message } from 'antd'
import { createQuestion, activateQuestionBanks, submitQuestionBanksForApproval } from '../../../api/create-question.js'
import { QuestionForm } from '../create-question/question-form.jsx'
import { AnswerForm } from '../create-question/answer-form.jsx'

const { Title } = Typography

import { Tabs } from 'antd'

export function CreateQuestionModal({ open, onCancel, onCreated, questionTypeId, basePath = '/admin', layout = 'admin' }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('1')

  useEffect(() => {
    if (open) {
      form.resetFields()
      form.setFieldsValue({
        options: [
          { keyOption: 1, content: '', imageUrl: '', isCorrect: false },
          { keyOption: 2, content: '', imageUrl: '', isCorrect: false },
        ],
      })
      setActiveTab('1')
    }
  }, [open, form])

  const getCreatedQuestionBankId = (created) => {
    const candidates = [
      created?.questionBankId,
      created?.questionBankID,
      created?.id,
      created?.data,
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
    if (!values.options || values.options.length < 2) {
      message.error('Cần ít nhất 2 đáp án')
      setActiveTab('2')
      return
    }

    const correctOptions = values.options.filter((a) => a?.isCorrect)
    if (correctOptions.length === 0) {
      message.error('Cần ít nhất 1 đáp án đúng')
      setActiveTab('2')
      return
    }

    if (!questionTypeId) {
      message.error('Vui lòng chọn loại câu hỏi')
      return
    }

    try {
      setLoading(true)
      const { uploadQuestionAudioToCloudinary, uploadQuestionImageToCloudinary, uploadOptionImageToCloudinary } = await import('../../../../back-office/api/cloudinary.js')

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
      const createdId = getCreatedQuestionBankId(created)

      if ((values.status ?? 0) === 1) {
        if (createdId) await activateQuestionBanks([createdId])
      } else if ((values.status ?? 0) === 3) {
        if (createdId) await submitQuestionBanksForApproval([createdId])
      }

      message.success('Đã tạo câu hỏi mới thành công')
      if (onCreated) onCreated()
    } catch (error) {
      message.error(error.message || 'Tạo câu hỏi thất bại')
    } finally {
      setLoading(false)
    }
  }

  const items = [
    {
      key: '1',
      label: <span style={{ fontWeight: 600 }}>1. Nội dung câu hỏi</span>,
      children: (
        <div style={{ padding: '0 4px' }}>
          <QuestionForm form={form} questionTypeId={questionTypeId} />
        </div>
      ),
    },
    {
      key: '2',
      label: <span style={{ fontWeight: 600 }}>2. Đáp án</span>,
      children: (
        <div style={{ padding: '0 4px' }}>
          <AnswerForm form={form} />
        </div>
      ),
    },
  ]

  return (
    <Modal
      title={
        <div style={{ padding: '8px 0' }}>
          <Title level={4} style={{ margin: 0 }}>Tạo câu hỏi mới</Title>
          <div style={{ fontSize: 13, color: '#8c8c8c', fontWeight: 400 }}>Điền thông tin và đáp án cho câu hỏi</div>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={900}
      centered
      destroyOnHidden
      styles={{
        body: { padding: '4px 24px 12px' }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={items}
          style={{ marginBottom: 12 }}
          type="line"
          size="middle"
        />
        
        <Form.Item name="mediaFile" hidden>
          <Input type="hidden" />
        </Form.Item>

        <Divider style={{ margin: '8px 0 16px' }} />

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space size="middle">
            <Button onClick={onCancel}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              Tạo mới
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}

