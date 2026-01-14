'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'solito/navigation'
import { Card, Space, Typography, Spin, Alert, Descriptions, Tag, Modal, message, Button, Tooltip } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { ButtonV2 } from '../../../../../../components/buttonV2.jsx'
import { AdminLayout } from '../../../components/admin-layout.web'
import ExamTemplatePartsForm from './ExamTemplatePartsForm'
import EditExamTemplateModal from './EditExamTemplateModal'
import { fetchExamTemplate, updateExamTemplate, deleteExamTemplate, updateExamTemplateStatus } from '../../../api'

const { Title, Text } = Typography

// Mapping trạng thái theo enum ExamTemplateStatus
const statusMap = {
  0: { label: 'Nháp', color: 'default' },
  1: { label: 'Đã xuất bản', color: 'green' },
  2: { label: 'Đã xóa', color: 'red' },
}

// Helper function để lấy thông tin trạng thái
const getStatusInfo = (status) => {
  return statusMap[status] || { label: `Trạng thái ${status}`, color: 'default' }
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
  const [guideModalOpen, setGuideModalOpen] = useState(false)
  const [guideSection, setGuideSection] = useState(null) // 'info' | 'parts'
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
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
      // Gọi API để cập nhật exam template
      await updateExamTemplate(examTemplateId, updatedData)
      
      // Reload lại dữ liệu từ API để đảm bảo đồng bộ
      const data = await fetchExamTemplate(examTemplateId)
      setExamTemplate(data)
      
      message.success('Đã cập nhật thông tin mẫu đề thành công')
      setEditModalOpen(false)
    } catch (err) {
      message.error(err?.message || 'Cập nhật thất bại')
    }
  }

  const openGuide = (sectionKey) => {
    setGuideSection(sectionKey)
    setGuideModalOpen(true)
  }

  const renderGuideContent = () => {
    if (guideSection === 'info') {
      return (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Title level={5}>Thông tin cơ bản</Title>
            <Text>Thẻ này hiển thị các trường chính của mẫu đề: tên, loại đề, mô tả, trạng thái và thời gian tạo/cập nhật.</Text>
          </div>
          <div>
            <Title level={5}>Khi nào cần chỉnh sửa?</Title>
            <Text>Sử dụng nút "Chỉnh sửa" ở góc trên để cập nhật thông tin tổng quan của mẫu đề (tên, loại đề, mô tả, trạng thái).</Text>
          </div>
        </Space>
      )
    }

    if (guideSection === 'parts') {
      return (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Title level={5}>Quản lý các phần của đề thi</Title>
            <Text>Phần này cho phép xem, thêm, chỉnh sửa hoặc xóa các phần (Parts) thuộc mẫu đề.</Text>
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>Xem danh sách Parts hiện có và thông tin chi tiết.</li>
              <li>Thêm Part mới với skill, số câu hỏi, hướng dẫn và điểm.</li>
              <li>Chỉnh sửa Part để điều chỉnh phạm vi câu hỏi hoặc nội dung hướng dẫn.</li>
              <li>Xóa Part không còn sử dụng.</li>
            </ul>
          </div>
          <div>
            <Title level={5}>Lưu ý</Title>
            <Text>Nhấn lưu sau mỗi thay đổi và kiểm tra lại thứ tự/điểm số để đảm bảo đề thi hợp lệ.</Text>
          </div>
        </Space>
      )
    }

    return null
  }

  const handleDelete = () => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa mẫu đề "${examTemplate?.name}"? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setDeleting(true)
          // Gọi API để xóa exam template
          await deleteExamTemplate(examTemplateId)
          
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

  const handleToggleStatus = async () => {
    if (!examTemplate) return

    // Giả sử chỉ toggle giữa Nháp (0) và Đã xuất bản (1)
    const currentStatus = examTemplate.status ?? 0
    const isDraft = currentStatus === 0
    const targetStatus = isDraft ? 1 : 0

    Modal.confirm({
      title: 'Xác nhận thay đổi trạng thái',
      content: isDraft
        ? 'Bạn có chắc chắn muốn xuất bản mẫu đề này? Sau khi xuất bản, một số thông tin sẽ bị hạn chế chỉnh sửa.'
        : 'Bạn có chắc chắn muốn chuyển mẫu đề này về trạng thái Nháp?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setUpdatingStatus(true)
          const success = await updateExamTemplateStatus(examTemplateId, targetStatus)

          if (success) {
            // Reload lại dữ liệu để cập nhật trạng thái mới
            const data = await fetchExamTemplate(examTemplateId)
            setExamTemplate(data)

            message.success(
              targetStatus === 1
                ? 'Đã xuất bản mẫu đề thành công'
                : 'Đã chuyển mẫu đề về trạng thái Nháp'
            )
          } else {
            message.error('Cập nhật trạng thái mẫu đề thất bại')
          }
        } catch (err) {
          message.error(err?.message || 'Cập nhật trạng thái mẫu đề thất bại')
        } finally {
          setUpdatingStatus(false)
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
              <Text type="secondary">ID: {examTemplate.examTemplateId}</Text>
            </div>
            <Space>
              {/* Nút thay đổi trạng thái */}
              <ButtonV2
                title={examTemplate.status === 1 ? 'Chuyển về Nháp' : 'Xuất bản'}
                color="#1890ff"
                onPress={handleToggleStatus}
                disabled={updatingStatus}
                style={{ minWidth: 100, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
              />
              {/* Luôn cho phép chỉnh sửa thông tin cơ bản của mẫu đề */}
              <ButtonV2
                title="Chỉnh sửa"
                color="#F1BE4B"
                onPress={handleEdit}
                style={{ minWidth: 100, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
              />
              {/* Chỉ cho phép xóa khi không phải trạng thái Đã xuất bản */}
              {examTemplate.status !== 1 && (
                <ButtonV2
                  title="Xóa"
                  color="#ff4d4f"
                  onPress={handleDelete}
                  disabled={deleting}
                  style={{ minWidth: 100, paddingVertical: 10 }}
                  textStyle={{ fontSize: 14 }}
                />
              )}
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
          <Card
            title="Thông tin cơ bản"
            extra={
              <Tooltip title="Hướng dẫn Thông tin cơ bản">
                <QuestionCircleOutlined
                  onClick={() => openGuide('info')}
                  style={{ fontSize: 18, cursor: 'pointer' }}
                />
              </Tooltip>
            }
          >
            <Descriptions column={1} bordered size="middle">
              <Descriptions.Item label="Tên mẫu đề">
                {examTemplate.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Loại đề">
                {examTemplate.examType || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {examTemplate.description || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusInfo(examTemplate.status ?? 0).color}>
                  {getStatusInfo(examTemplate.status ?? 0).label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {formatDate(examTemplate.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày cập nhật">
                {formatDate(examTemplate.updatedAt || examTemplate.createdAt)}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Quản lý các phần */}
          <Card
            title="Quản lý các phần của đề thi"
            extra={
              <Tooltip title="Hướng dẫn Quản lý các phần">
                <QuestionCircleOutlined
                  onClick={() => openGuide('parts')}
                  style={{ fontSize: 18, cursor: 'pointer' }}
                />
              </Tooltip>
            }
          >
            <ExamTemplatePartsForm 
              examTemplateId={examTemplateId} 
              initialParts={examTemplate.Parts || []}
              examTemplate={examTemplate}
              onPartsAdded={async () => {
                // Reload lại dữ liệu exam template sau khi add parts thành công
                try {
                  setLoading(true)
                  const data = await fetchExamTemplate(examTemplateId)
                  setExamTemplate(data)
                } catch (err) {
                  message.error(err?.message || 'Không thể tải lại thông tin mẫu đề')
                } finally {
                  setLoading(false)
                }
              }}
            />
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

        {/* Modal hướng dẫn */}
        <Modal
          title={guideSection === 'parts' ? 'Hướng dẫn: Quản lý các phần' : 'Hướng dẫn: Thông tin cơ bản'}
          open={guideModalOpen}
          onCancel={() => setGuideModalOpen(false)}
          footer={[
            <Button key="close" onClick={() => setGuideModalOpen(false)}>
              Đóng
            </Button>,
          ]}
          width={700}
        >
          <div style={{ padding: '8px 0' }}>
            {renderGuideContent()}
          </div>
        </Modal>
      </div>
    </AdminLayout>
  )
}

export default ExamTemplateDetailScreen

