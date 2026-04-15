import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'solito/navigation'
import { Card, Space, Typography, Spin, Alert, Descriptions, Modal, message, Button, Tooltip, Tag } from 'antd'
import {
  QuestionCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  ProfileOutlined,
  FileTextOutlined,
  AlignLeftOutlined,
  CalendarOutlined,
  SendOutlined,
  SwapOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons'
import { useQueryClient } from '@tanstack/react-query'
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
  0: { label: 'Nháp', colorHex: '#8c8c8c' },
  1: { label: 'Đã xuất bản', colorHex: '#52c41a' },
  2: { label: 'Đã xóa', colorHex: '#f5222d' },
  3: { label: 'Chờ phê duyệt', colorHex: '#fa8c16' },
  4: { label: 'Từ chối', colorHex: '#f5222d' },
}

// Helper function để lấy thông tin trạng thái
const getStatusInfo = (status) => {
  return statusMap[status] || { label: `Trạng thái ${status}`, color: 'default' }
}

export function ExamTemplateDetailScreen() {
  const router = useRouter()
  const queryClient = useQueryClient()
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
  const [isPartsDirty, setIsPartsDirty] = useState(false)
  const [infoCollapsed, setInfoCollapsed] = useState(false)

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

      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'exam-templates'] })
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

          // Invalidate list queries
          queryClient.invalidateQueries({ queryKey: ['admin', 'exam-templates'] })

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

            // Invalidate list queries
            queryClient.invalidateQueries({ queryKey: ['admin', 'exam-templates'] })
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

      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'exam-templates'] })
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

        // Invalidate list queries
        queryClient.invalidateQueries({ queryKey: ['admin', 'exam-templates'] })
      } else {
        message.error('Chuyển trạng thái thất bại')
      }
    } catch (err) {
      message.error(err?.message || 'Chuyển trạng thái thất bại')
    } finally {
      setStatusChangeLoading(false)
    }
  }

  const handleBack = () => {
    if (isPartsDirty) {
      Modal.confirm({
        title: 'Cảnh báo',
        content: 'Bạn đã có thay đổi trong cấu trúc bộ câu hỏi mà chưa lưu. Bạn có chắc chắn muốn quay lại?',
        okText: 'Rời đi',
        cancelText: 'Hủy',
        onOk: () => {
          router.back()
        }
      })
    } else {
      router.back()
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
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <Title level={3} style={{ marginBottom: 4, marginTop: 0 }}>
              Chi tiết mẫu đề
            </Title>
            <Text type="secondary">ID: {examTemplate.examTemplateId}</Text>
          </div>
          <Space size="small" wrap>
            {/* Staff: nút Gửi duyệt khi Nháp hoặc Từ chối */}
            {isStaff && [0, 4].includes(examTemplate.status ?? 0) && (
              <Button
                type="primary"
                icon={<SendOutlined />}
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
                icon={<SwapOutlined />}
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
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
              disabled={isStaff && ![0, 4].includes(examTemplate.status ?? 0)}
            >
              Chỉnh sửa
            </Button>
            {/* Chỉ cho phép xóa khi không phải trạng thái Đã xuất bản */}
            {examTemplate.status !== 1 && (
              <Button danger icon={<DeleteOutlined />} onClick={handleDelete} loading={deleting}>
                Xóa
              </Button>
            )}
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
              Quay lại
            </Button>
          </Space>
        </div>

        {/* Main Content Area: Flex Layout */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Left Column: Exam Structure */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Card
              size="small"
              title={<Text strong style={{ fontSize: 16 }}>Quản lý các phần của đề thi</Text>}
              styles={{ body: { padding: '20px 24px' } }}
              extra={
                <Tooltip title="Hướng dẫn Quản lý các phần">
                  <QuestionCircleOutlined
                    onClick={() => openGuide('parts')}
                    style={{ fontSize: 18, cursor: 'pointer', color: '#8c8c8c' }}
                  />
                </Tooltip>
              }
            >
              <ExamTemplatePartsForm
                examTemplateId={examTemplateId}
                initialParts={examTemplate.Parts || []}
                examTemplate={examTemplate}
                onDirtyChange={setIsPartsDirty}
                onPartsAdded={async () => {
                  try {
                    setIsPartsDirty(false)
                    setLoading(true)
                    const data = await fetchExamTemplate(examTemplateId)
                    setExamTemplate(data)

                    // Invalidate list queries
                    queryClient.invalidateQueries({ queryKey: ['admin', 'exam-templates'] })
                  } catch (err) {
                    message.error(err?.message || 'Không thể tải lại thông tin mẫu đề')
                  } finally {
                    setLoading(false)
                  }
                }}
              />
            </Card>
          </div>

          {/* Right Column: Basic Information (Collapsible) */}
          <div
            style={{
              width: infoCollapsed ? 60 : 400,
              flexShrink: 0,
              transition: 'all 0.3s ease',
              position: 'sticky',
              top: 20,
              zIndex: 10
            }}
          >
            <Card
              size="small"
              title={!infoCollapsed && <Text strong style={{ fontSize: 16 }}>Thông tin cơ bản</Text>}
              extra={
                <Space>
                  {!infoCollapsed && (
                    <Tooltip title="Hướng dẫn">
                      <QuestionCircleOutlined
                        onClick={() => openGuide('info')}
                        style={{ fontSize: 16, cursor: 'pointer', color: '#8c8c8c' }}
                      />
                    </Tooltip>
                  )}
                  <Button
                    type="text"
                    size="small"
                    icon={infoCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setInfoCollapsed(!infoCollapsed)}
                    title={infoCollapsed ? "Mở rộng" : "Thu gọn"}
                  />
                </Space>
              }
              styles={{
                body: {
                  padding: infoCollapsed ? '12px 0' : '16px 20px',
                  display: infoCollapsed ? 'none' : 'block'
                }
              }}
              style={{ overflow: 'hidden' }}
            >
              {!infoCollapsed && (
                <div style={{ padding: '4px 0' }}>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Tooltip title={getStatusInfo(examTemplate.status ?? 0).label}>
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: statusMap[examTemplate.status ?? 0]?.colorHex || '#d9d9d9',
                            boxShadow: `0 0 6px ${statusMap[examTemplate.status ?? 0]?.colorHex || '#d9d9d9'}80`,
                            cursor: 'default',
                            flexShrink: 0
                          }}
                        />
                      </Tooltip>
                      <Title level={4} style={{ margin: 0, fontSize: 19, flex: 1 }}>
                        {examTemplate.name || '-'}
                      </Title>

                      {examTemplate.status === 3 && isAdmin && (
                        <Space size={8} style={{ flexShrink: 0 }}>
                          <Tooltip title="Phê duyệt">
                            <CheckCircleOutlined 
                              style={{ color: '#52c41a', cursor: 'pointer', fontSize: 18 }} 
                              onClick={() => handleOpenApprovalModal('approve')}
                            />
                          </Tooltip>
                          <Tooltip title="Từ chối">
                            <CloseCircleOutlined 
                              style={{ color: '#ff4d4f', cursor: 'pointer', fontSize: 18 }} 
                              onClick={() => handleOpenApprovalModal('reject')}
                            />
                          </Tooltip>
                        </Space>
                      )}
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: 12, 
                    marginBottom: 20,
                    background: '#fafafa',
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid #f0f0f0'
                  }}>
                    <div style={{ padding: '4px 8px' }}>
                      <Text type="secondary" style={{ fontSize: 17, display: 'block', marginBottom: 4 }}>
                        <AppstoreOutlined style={{ marginRight: 6 }} /> Số phần
                      </Text>
                      <Text strong style={{ fontSize: 17, color: '#1890ff' }}>{examTemplate.totalParts || 0}</Text>
                    </div>
                    <div style={{ padding: '4px 8px' }}>
                      <Text type="secondary" style={{ fontSize: 17, display: 'block', marginBottom: 4 }}>
                        <ProfileOutlined style={{ marginRight: 6 }} /> Tổng số câu
                      </Text>
                      <Text strong style={{ fontSize: 17, color: '#52c41a' }}>{examTemplate.totalQuestions || 0}</Text>
                    </div>
                  </div>

                  {/* Details List */}
                  <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 17, display: 'block', marginBottom: 4 }}>
                        <FileTextOutlined style={{ marginRight: 8 }} /> Loại đề
                      </Text>
                      <Tag color="processing" variant="filled" style={{ margin: 0, border: 'none', fontSize: 17 }}>
                        {examTemplate.examType || '-'}
                      </Tag>
                    </div>

                    <div>
                      <Text type="secondary" style={{ fontSize: 17, display: 'block', marginBottom: 4 }}>
                        <AlignLeftOutlined style={{ marginRight: 8 }} /> Mô tả
                      </Text>
                      <div style={{ 
                        maxHeight: 120, 
                        overflowY: 'auto', 
                        whiteSpace: 'pre-wrap', 
                        fontSize: 17, 
                        color: '#595959',
                        padding: '8px 12px',
                        background: '#fff',
                        borderRadius: 6,
                        border: '1px solid #f0f0f0',
                        lineHeight: '1.6'
                      }}>
                        {examTemplate.description || 'Chưa có mô tả'}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, marginTop: 4 }}>
                      <Space size="middle">
                        <div>
                          <Text type="secondary" style={{ fontSize: 17 }}>
                            <CalendarOutlined style={{ marginRight: 6 }} /> Cập nhật lần cuối:
                          </Text>
                          <br />
                          <Text style={{ fontSize: 17 }}>
                            {formatDate(examTemplate.updatedAt || examTemplate.createdAt)}
                          </Text>
                        </div>
                      </Space>
                    </div>
                  </Space>
                </div>
              )}
              {infoCollapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, paddingTop: 10 }}>
                  <Tooltip title="Xem thông tin" placement="left">
                    <InfoCircleOutlined
                      style={{ fontSize: 20, color: '#1890ff', cursor: 'pointer' }}
                      onClick={() => setInfoCollapsed(false)}
                    />
                  </Tooltip>
                </div>
              )}
            </Card>
          </div>
        </div>
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

