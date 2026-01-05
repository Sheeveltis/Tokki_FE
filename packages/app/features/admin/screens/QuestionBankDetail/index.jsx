'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'solito/navigation'
import { Card, Space, Typography, Spin, Alert, Divider, Popconfirm, message } from 'antd'
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { AdminLayout } from '../../components/admin-layout.web'
import { QuestionDetail } from './components/QuestionDetail'
import { AnswerDetail } from './components/AnswerDetail'
import { mockQuestions, mockQuestionTypes } from '../QuestionBankManagement/api/api'
// TODO: Thay thế bằng API thực tế khi có
// import { fetchQuestion, updateQuestion, deleteQuestion } from './api/api'

const { Title } = Typography

export function QuestionBankDetailScreen() {
  const router = useRouter()
  const params = useParams()
  const questionId = params?.id

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [question, setQuestion] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        // TODO: Thay bằng API call thực tế
        // const data = await fetchQuestion(questionId)
        // Mock data - simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 300))

        const foundQuestion = mockQuestions.find((q) => q.id === questionId)
        if (!foundQuestion) {
          throw new Error('Không tìm thấy câu hỏi')
        }

        if (mounted) {
          setQuestion(foundQuestion)
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Không thể tải thông tin câu hỏi')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [questionId])

  const handleDelete = async () => {
    try {
      setDeleting(true)
      // TODO: Call API to delete
      // await deleteQuestion(questionId)
      message.success('Đã xóa câu hỏi thành công')
      router.push('/admin?tab=question-bank')
    } catch (err) {
      message.error(err.message || 'Xóa câu hỏi thất bại')
    } finally {
      setDeleting(false)
    }
  }

  const handleEdit = () => {
    router.push(`/admin/question-bank/${questionId}/edit`)
  }

  const handleNavigate = (key) => {
    router.push(`/admin?tab=${key}`)
  }

  const getQuestionTypeName = (questionTypeId) => {
    const questionType = mockQuestionTypes.find((qt) => qt.questionTypeId === questionTypeId)
    return questionType?.name || questionTypeId || '-'
  }

  if (loading) {
    return (
      <AdminLayout defaultKey="question-bank" onNavigate={handleNavigate}>
        <div style={{ padding: 24, textAlign: 'center' }}>
          <Spin size="large" />
        </div>
      </AdminLayout>
    )
  }

  if (error || !question) {
    return (
      <AdminLayout defaultKey="question-bank" onNavigate={handleNavigate}>
        <div style={{ padding: 24 }}>
          <Alert
            message="Lỗi"
            description={error || 'Không tìm thấy câu hỏi'}
            type="error"
            showIcon
            action={
              <ButtonV2
                title="Quay lại"
                color="charcoal"
                onPress={() => router.push('/admin?tab=question-bank')}
                style={{ minWidth: 100 }}
              />
            }
          />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout defaultKey="question-bank" onNavigate={handleNavigate}>
      <div style={{ padding: 24 }}>
        <Card>
          <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
            <ButtonV2
              title="Quay lại"
              color="charcoal"
              onPress={() => router.push('/admin?tab=question-bank')}
              icon={<ArrowLeftOutlined />}
              style={{ minWidth: 100, paddingVertical: 10 }}
              textStyle={{ fontSize: 14 }}
            />
            <Space>
              <ButtonV2
                title="Sửa câu hỏi"
                color="charcoal"
                onPress={handleEdit}
                icon={<EditOutlined />}
                style={{ minWidth: 120, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
              />
              <Popconfirm
                title="Xóa câu hỏi"
                description="Bạn có chắc chắn muốn xóa câu hỏi này?"
                onConfirm={handleDelete}
                okText="Xóa"
                cancelText="Hủy"
              >
                <ButtonV2
                  title={deleting ? 'Đang xóa...' : 'Xóa câu hỏi'}
                  color="#ff4d4f"
                  icon={<DeleteOutlined />}
                  style={{ minWidth: 120, paddingVertical: 10 }}
                  textStyle={{ fontSize: 14 }}
                />
              </Popconfirm>
            </Space>
          </Space>

          <Divider />

          <Space orientation="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={3} style={{ marginBottom: 16 }}>
                Chi tiết câu hỏi
              </Title>
            </div>

            <QuestionDetail
              question={question}
              questionTypeName={getQuestionTypeName(question.questionTypeId)}
            />

            <Divider />

            <AnswerDetail answers={question.answers} />
          </Space>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default QuestionBankDetailScreen

