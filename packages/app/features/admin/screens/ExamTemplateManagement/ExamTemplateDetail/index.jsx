'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'solito/navigation'
import { Card, Space, Typography, Spin, Alert, Descriptions, Tag, Divider, Modal, message } from 'antd'
import { ButtonV2 } from '../../../../../../components/buttonV2.jsx'
import { AdminLayout } from '../../../components/admin-layout.web'
import ExamTemplatePartsForm from './ExamTemplatePartsForm'
import EditExamTemplateModal from './EditExamTemplateModal'
import sampleData from './DB_SAMPLE.json'
// TODO: Thay thế bằng API thực tế khi có
// import { fetchExamTemplate, updateExamTemplate, deleteExamTemplate } from '../../api'

const { Title, Text } = Typography

// Transform TemplateParts từ API thành cấu trúc form (group theo Skill)
const transformTemplatePartsToFormParts = (templateParts) => {
  if (!templateParts || !Array.isArray(templateParts)) return []
  
  // Group TemplateParts theo Skill
  const groupedBySkill = {}
  templateParts.forEach((part) => {
    const skill = part.Skill
    if (!groupedBySkill[skill]) {
      groupedBySkill[skill] = []
    }
    // Chuyển TemplatePart thành QuestionGroup (bỏ ExamTemplateId, TemplatePartId)
    groupedBySkill[skill].push({
      Skill: part.Skill,
      QuestionFrom: part.QuestionFrom,
      QuestionTo: part.QuestionTo,
      PartTitle: part.PartTitle,
      Instruction: part.Instruction,
      Mark: part.Mark,
      ExampleUrl: part.ExampleUrl,
      QuestionTypeId: part.QuestionTypeId,
    })
  })
  
  // Convert thành mảng parts với QuestionGroups
  return Object.keys(groupedBySkill).map((skill) => ({
    Skill: skill,
    QuestionGroups: groupedBySkill[skill],
  }))
}

export function ExamTemplateDetailScreen() {
  const router = useRouter()
  const params = useParams()
  const examTemplateId = params?.id || params?.ExamTemplateId
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [examTemplate, setExamTemplate] = useState(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  // Debug log
  useEffect(() => {
    console.log('ExamTemplateDetailScreen mounted')
    console.log('examTemplateId:', examTemplateId)
    console.log('params:', params)
    console.log('params.id:', params?.id)
  }, [examTemplateId, params])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        // TODO: Thay bằng API call thực tế
        // const data = await fetchExamTemplate(examTemplateId)
        // Mock data từ DB_SAMPLE.json - simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 300))
        
        // Sử dụng dữ liệu mẫu từ DB_SAMPLE.json
        const sampleExamTemplate = sampleData.ExamTemplate
        const sampleTemplateParts = sampleData.TemplateParts
        
        // Transform TemplateParts thành cấu trúc form (group theo Skill)
        const transformedParts = transformTemplatePartsToFormParts(sampleTemplateParts)
        
        const data = {
          ExamTemplateId: sampleExamTemplate.ExamTemplateId,
          Name: sampleExamTemplate.Name,
          Description: sampleExamTemplate.Description,
          ExamType: sampleExamTemplate.ExamType,
          CreatedAt: sampleExamTemplate.CreatedAt,
          UpdatedAt: sampleExamTemplate.UpdatedAt,
          IsActive: sampleExamTemplate.IsActive,
          Parts: transformedParts, // Đã được transform thành cấu trúc form
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
    if (examTemplateId) {
      load()
    } else {
      setError('Không tìm thấy ID mẫu đề')
      setLoading(false)
    }
    return () => {
      mounted = false
    }
  }, [examTemplateId])

  const handleNavigate = (key) => {
    router.push(`/admin?tab=${key}`)
  }

  const handleEdit = () => {
    setEditModalOpen(true)
  }

  const handleEditSuccess = async (updatedData) => {
    try {
      // TODO: Thay bằng API call thực tế
      // await updateExamTemplate(examTemplateId, updatedData)
      console.log('Update payload:', updatedData)
      
      // Cập nhật state với dữ liệu mới
      setExamTemplate((prev) => ({
        ...prev,
        ...updatedData,
        UpdatedAt: new Date().toISOString(),
      }))
      
      message.success('Đã cập nhật thông tin mẫu đề thành công')
      setEditModalOpen(false)
    } catch (err) {
      message.error(err?.message || 'Cập nhật thất bại')
    }
  }

  const handleDelete = () => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa mẫu đề "${examTemplate?.Name}"? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setDeleting(true)
          // TODO: Thay bằng API call thực tế
          // await deleteExamTemplate(examTemplateId)
          console.log('Delete exam template:', examTemplateId)
          
          message.success('Đã xóa mẫu đề thành công')
          // Quay lại trang danh sách
          router.push('/admin?tab=exam-template')
        } catch (err) {
          message.error(err?.message || 'Xóa thất bại')
          setDeleting(false)
        }
      },
    })
  }

  if (loading) {
    return (
      <AdminLayout defaultKey="exam-template" onNavigate={handleNavigate}>
        <div style={{ padding: 24, textAlign: 'center' }}>
          <Spin size="large" />
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout defaultKey="exam-template" onNavigate={handleNavigate}>
        <div style={{ padding: 24 }}>
          <Alert message="Lỗi" description={error} type="error" showIcon />
        </div>
      </AdminLayout>
    )
  }

  if (!examTemplate) {
    return (
      <AdminLayout defaultKey="exam-template" onNavigate={handleNavigate}>
        <div style={{ padding: 24 }}>
          <Alert message="Không tìm thấy mẫu đề" type="warning" showIcon />
        </div>
      </AdminLayout>
    )
  }

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
    <AdminLayout defaultKey="exam-template" onNavigate={handleNavigate}>
      <div style={{ padding: 24 }}>
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Title level={3} style={{ marginBottom: 8 }}>
                Chi tiết mẫu đề
              </Title>
              <Text type="secondary">ID: {examTemplate.ExamTemplateId}</Text>
            </div>
            <Space>
              <ButtonV2
                title="Chỉnh sửa"
                color="#F1BE4B"
                onPress={handleEdit}
                style={{ minWidth: 100, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
              />
              <ButtonV2
                title="Xóa"
                color="#ff4d4f"
                onPress={handleDelete}
                disabled={deleting}
                style={{ minWidth: 100, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
              />
              <ButtonV2
                title="Quay lại"
                color="charcoal"
                onPress={() => router.push('/admin?tab=exam-template')}
                style={{ minWidth: 100, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
              />
            </Space>
          </div>

          {/* Thông tin cơ bản */}
          <Card title="Thông tin cơ bản">
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
          </Card>

          {/* Quản lý các phần */}
          <Card>
            <ExamTemplatePartsForm examTemplateId={examTemplateId} initialParts={examTemplate.Parts || []} />
          </Card>
        </Space>

        {/* Modal chỉnh sửa */}
        {editModalOpen && (
          <EditExamTemplateModal
            open={editModalOpen}
            examTemplate={examTemplate}
            onCancel={() => setEditModalOpen(false)}
            onSuccess={handleEditSuccess}
          />
        )}
      </div>
    </AdminLayout>
  )
}

export default ExamTemplateDetailScreen

