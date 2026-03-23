import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'solito/navigation'
import { Card, Space, Typography, Spin, Alert, Descriptions, Modal, message, Button, Tooltip } from 'antd'
import { QuestionCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { AdminLayout } from '../../../back-office/components/admin/admin-layout.web.jsx'
import ExamTemplatePartsForm from '../../components/admin/exam-template-detail/ExamTemplatePartsForm.jsx'
import EditExamTemplateModal from '../../components/admin/exam-template-detail/EditExamTemplateModal.jsx'
import ExamTemplateApprovalModal from '../../components/admin/exam-template-detail/exam-template-approval-modal.jsx'
import ExamTemplateStatusChangeModal from '../../components/admin/exam-template-detail/exam-template-status-change-modal.jsx'
import { fetchExamTemplate, updateExamTemplate, deleteExamTemplate, submitExamTemplate, approveExamTemplate, rejectExamTemplate, updateExamTemplateStatus } from '../../../back-office/api/admin-index.js'
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
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [approvalLoading, setApprovalLoading] = useState(false)
  const [approvalMode, setApprovalMode] = useState('approve') // 'approve' | 'reject'
  const [submittingForApproval, setSubmittingForApproval] = useState(false)
  const [statusChangeModalOpen, setStatusChangeModalOpen] = useState(false)
  const [statusChangeLoading, setStatusChangeLoading] = useState(false)

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

  const handleOpenApprovalModal = (type) => {
    if (!examTemplate) return

    if (examTemplate.status !== 3) {
      message.warning('Chỉ có thể phê duyệt hoặc từ chối khi đề ở trạng thái Chờ phê duyệt.')
      return
    }

    setApprovalMode(type)
    setApprovalModalOpen(true)
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

  const handleApprovalSubmit = async (values) => {
    if (!examTemplate) return

    try {
      setApprovalLoading(true)

      if (values.approvalType === 'approve') {
        const success = await approveExamTemplate(examTemplateId)
        if (success) {
          message.success('Đã phê duyệt mẫu đề thành công')
        } else {
          message.error('Phê duyệt mẫu đề thất bại')
        }
      } else {
        const rejectReason = values.rejectionReason?.trim() || ''
        if (!rejectReason || rejectReason.length < 10) {
          message.warning('Lý do từ chối phải có ít nhất 10 ký tự')
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
      setApprovalMode('approve')
    } catch (err) {
      message.error(err?.message || 'Thao tác phê duyệt / từ chối thất bại')
    } finally {
      setApprovalLoading(false)
    }
  }

  const handleStatusChange = async (values) => {
    if (!examTemplate) return

    try {
      setStatusChangeLoading(true)
      const newStatus = values.status

      // Sử dụng updateExamTemplateStatus để cập nhật status
      const success = await updateExamTemplateStatus(examTemplateId, newStatus)

      if (success) {
        message.success(`Đã chuyển trạng thái sang "${getStatusInfo(newStatus).label}" thành công`)
        
        // Reload lại dữ liệu
        const data = await fetchExamTemplate(examTemplateId)
        setExamTemplate(data)
        setStatusChangeModalOpen(false)
      } else {
        message.error('Chuyển trạng thái thất bại')
      }
    } catch (err) {
      message.error(err?.message || 'Chuyển trạng thái thất bại')
    } finally {
      setStatusChangeLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Alert message="Lỗi" description={error} type="error" showIcon />
      </div>
    )
  }

  if (!examTemplate) {
    return (
      <div style={{ padding: 24 }}>
        <Alert message="Không tìm thấy mẫu đề" type="warning" showIcon />
      </div>
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
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <Title level={3} style={{ marginBottom: 4 }}>
                Chi tiết mẫu đề
              </Title>
              <Text type="secondary">ID: {examTemplate.examTemplateId}</Text>
            </div>
            <Space size="small" wrap>
              {/* Staff: nút Gửi duyệt khi Nháp hoặc Từ chối */}
              {isStaff && [0, 4].includes(examTemplate.status ?? 0) && (
                <Button
                  type="primary"
                  onClick={handleSubmitForApproval}
                  loading={submittingForApproval}
                >
                  Gửi duyệt
                </Button>
              )}
              {/* Admin: nút chuyển trạng thái */}
              {isAdmin && (
                <Button
                  type="primary"
                  onClick={() => setStatusChangeModalOpen(true)}
                  loading={statusChangeLoading}
                >
                  Chuyển trạng thái
                </Button>
              )}
              {/* Chỉnh sửa thông tin cơ bản
                  - Admin: luôn được chỉnh sửa
                  - Staff: chỉ được chỉnh sửa khi trạng thái là Draft (0) hoặc Từ chối (4)
              */}
              <Button
                onClick={handleEdit}
                disabled={isStaff && ![0, 4].includes(examTemplate.status ?? 0)}
              >
                Chỉnh sửa
              </Button>
              {/* Chỉ cho phép xóa khi không phải trạng thái Đã xuất bản */}
              {examTemplate.status !== 1 && (
                <Button danger onClick={handleDelete} loading={deleting}>
                  Xóa
                </Button>
              )}
              <Button onClick={() => router.push('/admin?tab=exam-template')}>
                Quay lại
              </Button>
            </Space>
          </div>

          {/* Thông tin cơ bản */}
          <Card
            size="small"
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
            <Descriptions
              column={{ xs: 1, sm: 2 }}
              bordered
              size="small"
            >
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
                <Space size="small" align="center">
                  <Text>{getStatusInfo(examTemplate.status ?? 0).label}</Text>
                  {examTemplate.status === 3 && isAdmin && (
                    <>
                      <div
                        onClick={(e) => {
                          e?.stopPropagation?.()
                          handleOpenApprovalModal('approve')
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: approvalLoading ? 'not-allowed' : 'pointer',
                          padding: '2px 4px',
                          borderRadius: 4,
                          transition: 'all 0.2s ease',
                          opacity: approvalLoading ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!approvalLoading) {
                            e.currentTarget.style.backgroundColor = '#f6ffed'
                            e.currentTarget.style.transform = 'scale(1.2)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!approvalLoading) {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.transform = 'scale(1)'
                          }
                        }}
                        title="Phê duyệt"
                      >
                        <CheckCircleOutlined style={{ fontSize: 16, color: '#52c41a', transition: 'color 0.2s ease' }} />
                      </div>
                      <div
                        onClick={(e) => {
                          e?.stopPropagation?.()
                          handleOpenApprovalModal('reject')
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: approvalLoading ? 'not-allowed' : 'pointer',
                          padding: '2px 4px',
                          borderRadius: 4,
                          transition: 'all 0.2s ease',
                          opacity: approvalLoading ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!approvalLoading) {
                            e.currentTarget.style.backgroundColor = '#fff1f0'
                            e.currentTarget.style.transform = 'scale(1.2)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!approvalLoading) {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.transform = 'scale(1)'
                          }
                        }}
                        title="Từ chối"
                      >
                        <CloseCircleOutlined style={{ fontSize: 16, color: '#ff4d4f', transition: 'color 0.2s ease' }} />
                      </div>
                    </>
                  )}
                </Space>
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
            size="small"
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
        <ExamTemplateApprovalModal
          open={approvalModalOpen}
          loading={approvalLoading}
          initialApprovalType={approvalMode}
          onCancel={() => {
            setApprovalModalOpen(false)
            setApprovalMode('approve')
          }}
          onSubmit={handleApprovalSubmit}
        />

        {/* Modal chuyển trạng thái */}
        <ExamTemplateStatusChangeModal
          open={statusChangeModalOpen}
          loading={statusChangeLoading}
          currentStatus={examTemplate?.status ?? 0}
          onCancel={() => setStatusChangeModalOpen(false)}
          onSubmit={handleStatusChange}
        />

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
  )
}

export default ExamTemplateDetailScreen

