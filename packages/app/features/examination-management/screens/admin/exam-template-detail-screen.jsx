import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'solito/navigation'
import { Card, Space, Typography, Spin, Alert, Descriptions, Tag, Modal, message, Button, Tooltip, Input } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { AdminLayout } from '../../../back-office/components/admin/admin-layout.web.jsx'
import ExamTemplatePartsForm from '../../components/admin/exam-template-detail/ExamTemplatePartsForm.jsx'
import EditExamTemplateModal from '../../components/admin/exam-template-detail/EditExamTemplateModal.jsx'
import { fetchExamTemplate, updateExamTemplate, deleteExamTemplate, updateExamTemplateStatus, submitExamTemplate, approveExamTemplate, rejectExamTemplate } from '../../../back-office/api/admin-index.js'
import { getCurrentUserRole } from '../../../../provider/api/client.js'

const { Title, Text } = Typography

// Mapping trạng thái theo enum ExamTemplateStatus
const statusMap = {
  0: { label: 'Nháp', color: 'default' },
  1: { label: 'Đã xuất bản', color: 'green' },
  2: { label: 'Đã xóa', color: 'red' },
  3: { label: 'Chờ phê duyệt', color: 'orange' },
  4: { label: 'Từ chối', color: 'volcano' },
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
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [approvalLoading, setApprovalLoading] = useState(false)
  const [approvalMode, setApprovalMode] = useState('approve') // 'approve' | 'reject'
  const [rejectReason, setRejectReason] = useState('')
  const [submittingForApproval, setSubmittingForApproval] = useState(false)

  const currentRole = getCurrentUserRole()
  const isAdmin = currentRole === 'Admin'
  const isStaff = currentRole === 'Staff'

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

    const currentRole = getCurrentUserRole()
    const isAdmin = currentRole === 'Admin'
    const isStaff = currentRole === 'Staff'
    const currentStatus = examTemplate.status ?? 0

    // Staff: chỉ cho phép chuyển từ Từ chối (4) về Nháp (0)
    if (isStaff) {
      if (currentStatus !== 4) {
        message.warning('Chỉ có thể chuyển về Nháp khi mẫu đề đang ở trạng thái Từ chối.')
        return
      }

      Modal.confirm({
        title: 'Xác nhận chuyển về Nháp',
        content: 'Bạn có chắc chắn muốn chuyển mẫu đề này về trạng thái Nháp để chỉnh sửa lại?',
        okText: 'Xác nhận',
        cancelText: 'Hủy',
        onOk: async () => {
          try {
            setUpdatingStatus(true)
            const success = await updateExamTemplateStatus(examTemplateId, 0)

            if (success) {
              const data = await fetchExamTemplate(examTemplateId)
              setExamTemplate(data)
              message.success('Đã chuyển mẫu đề về trạng thái Nháp')
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
      return
    }

    // Admin: chỉ cho phép toggle giữa Nháp (0) và Đã xuất bản (1)
    if (isAdmin) {
      if (currentStatus !== 0 && currentStatus !== 1) {
        message.warning('Chỉ có thể thay đổi trạng thái khi đề đang là Nháp hoặc Đã xuất bản.')
        return
      }

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
  }

  const handleSubmitForApproval = async () => {
    if (!examTemplate) return

    const currentStatus = examTemplate.status ?? 0
    // Chỉ gửi duyệt khi Nháp hoặc Từ chối
    if (![0, 4].includes(currentStatus)) {
      message.warning('Chỉ có thể gửi duyệt khi mẫu đề đang ở trạng thái Nháp hoặc Từ chối.')
      return
    }

    Modal.confirm({
      title: 'Xác nhận gửi duyệt',
      content: `Bạn có chắc chắn muốn gửi mẫu đề "${examTemplate?.name || ''}" để phê duyệt?`,
      okText: 'Gửi duyệt',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setSubmittingForApproval(true)
          const success = await submitExamTemplate(examTemplateId)
          if (success) {
            message.success('Đã gửi mẫu đề để phê duyệt')
            const data = await fetchExamTemplate(examTemplateId)
            setExamTemplate(data)
          } else {
            message.error('Gửi duyệt mẫu đề thất bại')
          }
        } catch (err) {
          message.error(err?.message || 'Gửi duyệt mẫu đề thất bại')
        } finally {
          setSubmittingForApproval(false)
        }
      },
    })
  }

  const openApprovalModal = () => {
    if (!examTemplate) return

    if (examTemplate.status !== 3) {
      message.warning('Chỉ có thể phê duyệt hoặc từ chối khi đề ở trạng thái Chờ phê duyệt.')
      return
    }

    setApprovalMode('approve')
    setRejectReason('')
    setApprovalModalOpen(true)
  }

  const handleApprovalSubmit = async () => {
    if (!examTemplate) return

    try {
      setApprovalLoading(true)

      if (approvalMode === 'approve') {
        const success = await approveExamTemplate(examTemplateId)
        if (success) {
          message.success('Đã phê duyệt mẫu đề thành công')
        } else {
          message.error('Phê duyệt mẫu đề thất bại')
        }
      } else {
        if (!rejectReason || !rejectReason.trim()) {
          message.warning('Vui lòng nhập lý do từ chối')
          setApprovalLoading(false)
          return
        }
        const success = await rejectExamTemplate(examTemplateId, rejectReason)
        if (success) {
          message.success('Đã từ chối mẫu đề thành công')
        } else {
          message.error('Từ chối mẫu đề thất bại')
        }
      }

      // Reload lại dữ liệu sau khi phê duyệt / từ chối
      const data = await fetchExamTemplate(examTemplateId)
      setExamTemplate(data)
      setApprovalModalOpen(false)
    } catch (err) {
      message.error(err?.message || 'Thao tác phê duyệt / từ chối thất bại')
    } finally {
      setApprovalLoading(false)
    }
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
              {/* Staff: nút Gửi duyệt khi Nháp hoặc Từ chối */}
              {isStaff && [0, 4].includes(examTemplate.status ?? 0) && (
                <ButtonV2
                  title="Gửi duyệt"
                  color="#52c41a"
                  onPress={handleSubmitForApproval}
                  disabled={submittingForApproval}
                  style={{ minWidth: 120, paddingVertical: 10 }}
                  textStyle={{ fontSize: 14 }}
                />
              )}
              {/* Admin: nút phê duyệt / từ chối - chỉ hiển thị khi Chờ phê duyệt */}
              {isAdmin && examTemplate.status === 3 && (
                <ButtonV2
                  title="Phê duyệt / Từ chối"
                  color="#52c41a"
                  onPress={openApprovalModal}
                  disabled={approvalLoading}
                  style={{ minWidth: 130, paddingVertical: 10 }}
                  textStyle={{ fontSize: 14 }}
                />
              )}
              {/* Admin: nút thay đổi trạng thái */}
              {isAdmin && (
                <ButtonV2
                  title={
                    examTemplate.status === 1
                      ? 'Chuyển về Nháp'
                      : examTemplate.status === 0
                        ? 'Xuất bản'
                        : getStatusInfo(examTemplate.status ?? 0).label
                  }
                  color="#1890ff"
                  onPress={handleToggleStatus}
                  disabled={
                    updatingStatus || ![0, 1].includes(examTemplate.status ?? 0)
                  }
                  style={{ minWidth: 100, paddingVertical: 10 }}
                  textStyle={{ fontSize: 14 }}
                />
              )}
              {/* Chỉnh sửa thông tin cơ bản
                  - Admin: luôn được chỉnh sửa
                  - Staff: chỉ được chỉnh sửa khi trạng thái là Draft (0) hoặc Từ chối (4)
              */}
              <ButtonV2
                title="Chỉnh sửa"
                color="#F1BE4B"
                onPress={handleEdit}
                disabled={isStaff && ![0, 4].includes(examTemplate.status ?? 0)}
                style={{ minWidth: 100, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
              />
              {/* Staff: nút chuyển về Nháp khi đang ở trạng thái Từ chối */}
              {isStaff && examTemplate.status === 4 && (
                <ButtonV2
                  title="Chuyển về Nháp"
                  color="#1890ff"
                  onPress={handleToggleStatus}
                  disabled={updatingStatus}
                  style={{ minWidth: 120, paddingVertical: 10 }}
                  textStyle={{ fontSize: 14 }}
                />
              )}
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

        {/* Modal phê duyệt / từ chối */}
        <Modal
          title="Phê duyệt / Từ chối mẫu đề"
          open={approvalModalOpen}
          onCancel={() => {
            if (!approvalLoading) {
              setApprovalModalOpen(false)
            }
          }}
          footer={null}
          confirmLoading={approvalLoading}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text>Chọn hành động:</Text>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <Button
                  type={approvalMode === 'approve' ? 'primary' : 'default'}
                  onClick={() => setApprovalMode('approve')}
                  disabled={approvalLoading}
                >
                  Phê duyệt
                </Button>
                <Button
                  type={approvalMode === 'reject' ? 'primary' : 'default'}
                  danger
                  onClick={() => setApprovalMode('reject')}
                  disabled={approvalLoading}
                >
                  Từ chối
                </Button>
              </div>
            </div>

            {approvalMode === 'reject' && (
              <div>
                <Text>Lý do từ chối:</Text>
                <Input.TextArea
                  rows={4}
                  placeholder="Nhập lý do từ chối..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  disabled={approvalLoading}
                  style={{ marginTop: 8 }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={() => !approvalLoading && setApprovalModalOpen(false)} disabled={approvalLoading}>
                Hủy
              </Button>
              <Button type="primary" loading={approvalLoading} onClick={handleApprovalSubmit}>
                Xác nhận
              </Button>
            </div>
          </Space>
        </Modal>

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

