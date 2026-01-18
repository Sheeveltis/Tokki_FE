'use client'

import React, { useState, useEffect } from 'react'
import { Drawer, Descriptions, Tag, Spin, Alert, Space, Typography} from 'antd'
import ExamTemplatePartsForm from '../../components/admin/exam-template-detail/ExamTemplatePartsForm'
import { fetchExamTemplate } from '../../../api'

const { Title, Text } = Typography

export default function ExamTemplateDetailDrawer({ open, onClose, examTemplateId }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [examTemplate, setExamTemplate] = useState(null)

  useEffect(() => {
    if (!open || !examTemplateId) {
      setExamTemplate(null)
      return
    }

    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        // Gọi API để lấy thông tin exam template
        const data = await fetchExamTemplate(examTemplateId)
        if (mounted) {
          setExamTemplate(data)
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || 'Không thể tải thông tin mẫu đề.')
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
  }, [open, examTemplateId])

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  return (
    <Drawer
      title="Chi tiết mẫu đề"
      placement="right"
      size="large"
      onClose={onClose}
      open={open}
      width={800}
      styles={{
        body: {
          padding: 24,
        },
      }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert message="Lỗi" description={error} type="error" showIcon />
      ) : !examTemplate ? (
        <Alert message="Không tìm thấy mẫu đề" type="warning" showIcon />
      ) : (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Thông tin cơ bản */}
          <div>
            <Title level={4} style={{ marginBottom: 16 }}>
              Thông tin cơ bản
            </Title>
            <Descriptions column={1} bordered size="middle">
              <Descriptions.Item label="Tên mẫu đề">
                {examTemplate.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Loại đề">
                <Tag color="blue">{examTemplate.examType || '-'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {examTemplate.description || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={(examTemplate.status ?? 0) === 1 ? 'green' : 'default'}>
                  {(examTemplate.status ?? 0) === 1 ? 'Đã xuất bản' : 'Nháp'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng số phần">
                {examTemplate.totalParts || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng số câu hỏi">
                {examTemplate.totalQuestions || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {formatDate(examTemplate.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày cập nhật">
                {formatDate(examTemplate.updatedAt || examTemplate.createdAt)}
              </Descriptions.Item>
            </Descriptions>
          </div>

          {/* Quản lý các phần */}
          <div>
            <Title level={4} style={{ marginBottom: 16 }}>
              Quản lý các phần
            </Title>
            <ExamTemplatePartsForm 
              examTemplateId={examTemplateId} 
              initialParts={examTemplate.Parts || []} 
              examTemplate={examTemplate}
            />
          </div>
        </Space>
      )}
    </Drawer>
  )
}

