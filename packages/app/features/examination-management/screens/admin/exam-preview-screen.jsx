'use client'

import React from 'react'
import { useParams, useRouter } from 'solito/navigation'
import { Spin, Alert, Button } from 'antd'
import { UndoOutlined } from '@ant-design/icons'
import { useExamDetailAdmin } from '../../api/exam-hooks.js'
import { ExamPreviewLayout } from '../../components/admin/exam-preview/exam-preview-layout.web.jsx'

export function ExamPreviewScreen() {
  const router = useRouter()
  const params = useParams()
  const examId = params?.id

  const { data: exam, isLoading, error } = useExamDetailAdmin(examId)

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" tip="Đang tải dữ liệu xem trước..." />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Lỗi"
          description={error?.message || 'Không thể tải thông tin đề thi để xem trước.'}
          type="error"
          showIcon
          action={
            <Button onClick={() => router.back()} icon={<UndoOutlined />}>
              Quay lại
            </Button>
          }
        />
      </div>
    )
  }

  if (!exam) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Không tìm thấy"
          description="Không tìm thấy đề thi với ID này."
          type="warning"
          showIcon
          action={
            <Button onClick={() => router.back()} icon={<UndoOutlined />}>
              Quay lại
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 110px)', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <ExamPreviewLayout examData={exam} />
    </div>
  )
}

export default ExamPreviewScreen
