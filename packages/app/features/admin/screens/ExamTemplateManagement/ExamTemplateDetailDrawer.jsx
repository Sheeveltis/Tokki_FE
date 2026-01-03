'use client'

import React, { useState, useEffect } from 'react'
import { Drawer, Descriptions, Tag, Spin, Alert, Space, Typography, Button } from 'antd'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import ExamTemplatePartsForm from './ExamTemplateDetail/ExamTemplatePartsForm'
// TODO: Thay thế bằng API thực tế khi có
// import { fetchExamTemplate } from '../api'

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
        // TODO: Thay bằng API call thực tế
        // const data = await fetchExamTemplate(examTemplateId)
        // Mock data - simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 300))
        
        const data = {
          ExamTemplateId: examTemplateId,
          Name: 'Mẫu Đề TOPIK I',
          Description: 'Đề gồm 30 câu nghe, 40 câu đọc và 3 câu viết',
          ExamType: 'TOPIK I',
          CreatedAt: '2024-01-15T10:00:00Z',
          UpdatedAt: '2024-01-15T10:00:00Z',
          IsActive: true,
          Parts: [
            {
              TemplatePartId: 1,
              Skill: 'Reading',
              QuestionFrom: 1,
              QuestionTo: 10,
              PartTitle: 'Đọc hiểu đoạn văn ngắn',
              Instruction: '다음을 읽고 맞는 답을 고르세요',
              Mark: 1.0,
              ExampleUrl: null,
              QuestionTypeId: 1,
            },
          ],
        }
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
                {examTemplate.Name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Loại đề">
                <Tag color="blue">{examTemplate.ExamType || '-'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {examTemplate.Description || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={examTemplate.IsActive ? 'green' : 'default'}>
                  {examTemplate.IsActive ? 'Đang hoạt động' : 'Không hoạt động'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {formatDate(examTemplate.CreatedAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày cập nhật">
                {formatDate(examTemplate.UpdatedAt)}
              </Descriptions.Item>
            </Descriptions>
          </div>

          {/* Quản lý các phần */}
          <div>
            <Title level={4} style={{ marginBottom: 16 }}>
              Quản lý các phần
            </Title>
            <ExamTemplatePartsForm examTemplateId={examTemplateId} initialParts={examTemplate.Parts || []} />
          </div>
        </Space>
      )}
    </Drawer>
  )
}

