import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'solito/navigation'
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
  ArrowLeftOutlined,
  BookOutlined,
  UserOutlined
} from '@ant-design/icons'
import { Space, Typography, Spin, Alert, Descriptions, Modal, message, Button, Tooltip, Tag, Row, Col, Tabs, Table, Card } from 'antd'
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
  const [activeTab, setActiveTab] = useState('info')

  const currentRole = getCurrentUserRole()
  const isAdmin = currentRole === 'Admin'
  const isStaff = currentRole === 'Staff'

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        setError('')
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

  const handleEdit = () => {
    setEditModalOpen(true)
  }

  const handleEditSuccess = async (updatedData) => {
    try {
      await updateExamTemplate(examTemplateId, updatedData)
      const data = await fetchExamTemplate(examTemplateId)
      setExamTemplate(data)
      message.success('Đã cập nhật thông tin mẫu đề thành công')
      setEditModalOpen(false)
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
            <Text>Sử dụng nút "Chỉnh sửa" để cập nhật thông tin tổng quan của mẫu đề.</Text>
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
          await deleteExamTemplate(examTemplateId)
          message.success('Đã xóa mẫu đề thành công')
          queryClient.invalidateQueries({ queryKey: ['admin', 'exam-templates'] })
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
        if (success) message.success('Đã phê duyệt mẫu đề thành công')
        else message.error('Phê duyệt mẫu đề thất bại')
      } else {
        const rejectReason = values.rejectionReason?.trim() || ''
        if (!rejectReason || rejectReason.length < 10) {
          message.warning('Lý do từ chối phải có ít nhất 10 ký tự')
          setApprovalLoading(false)
          return
        }
        const success = await rejectExamTemplate(examTemplateId, rejectReason)
        if (success) message.success('Đã từ chối mẫu đề thành công')
        else message.error('Từ chối mẫu đề thất bại')
      }
      const data = await fetchExamTemplate(examTemplateId)
      setExamTemplate(data)
      setApprovalModalOpen(false)
      setApprovalMode('approve')
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
      const success = await updateExamTemplateStatus(examTemplateId, newStatus)
      if (success) {
        message.success(`Đã chuyển trạng thái sang "${getStatusInfo(newStatus).label}" thành công`)
        const data = await fetchExamTemplate(examTemplateId)
        setExamTemplate(data)
        setStatusChangeModalOpen(false)
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
        content: 'Bạn đã có thay đổi chưa lưu. Bạn có chắc chắn muốn quay lại?',
        okText: 'Rời đi',
        cancelText: 'Hủy',
        onOk: () => router.back()
      })
    } else {
      router.back()
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleString('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" tip={<Text style={{ display: 'block', marginTop: 16 }}>Đang tải dữ liệu mẫu đề...</Text>} />
      </div>
    )
  }

  if (error || !examTemplate) {
    return (
      <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: 600, width: '100%' }}>
          <Alert
            message={<span style={{ fontWeight: 500, fontSize: 16 }}>{error ? "Lỗi hệ thống" : "Không tìm thấy dữ liệu"}</span>}
            description={error || "Mẫu đề này không tồn tại hoặc đã bị xóa."}
            type="error"
            showIcon
            action={<Button size="small" type="primary" danger onClick={() => router.back()}>Quay lại</Button>}
            style={{ borderRadius: 8, padding: 24 }}
          />
        </div>
      </div>
    )
  }

  const tabItems = [
    {
      key: 'info',
      label: <Space><InfoCircleOutlined /><span style={{ fontWeight: 500 }}>Thông tin cơ bản</span></Space>,
      children: (() => {
        const generalDataSource = [
          {
            key: '1',
            label: 'Mã mẫu đề',
            value: (
              <Space size="large">
                <Text>{examTemplate.examTemplateId}</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    height: '8px', width: '8px',
                    backgroundColor: statusMap[examTemplate.status ?? 0]?.colorHex || '#d9d9d9',
                    borderRadius: '50%', display: 'inline-block'
                  }} />
                  <span style={{ color: statusMap[examTemplate.status ?? 0]?.colorHex || '#8c8c8c' }}>
                    {getStatusInfo(examTemplate.status ?? 0).label}
                  </span>
                </div>
              </Space>
            )
          },
          { key: '2', label: 'Tên mẫu đề', value: <Text strong>{examTemplate.name}</Text> },
          { key: '3', label: 'Loại đề', value: <Tag color="processing">{examTemplate.examType || '-'}</Tag> },
          { key: '4', label: 'Mô tả', value: examTemplate.description || 'Chưa có mô tả' },
          { key: '5', label: 'Ngày tạo', value: <Space><CalendarOutlined style={{ color: '#bfbfbf' }} />{formatDate(examTemplate.createdAt)}</Space> },
          { key: '6', label: 'Cập nhật cuối', value: <Space><CalendarOutlined style={{ color: '#bfbfbf' }} />{formatDate(examTemplate.updatedAt || examTemplate.createdAt)}</Space> },
        ];

        return (
          <div style={{ padding: 24, backgroundColor: '#fff' }}>
            <Row gutter={[0, 32]}>
              <Col span={24}>
                <Table
                  dataSource={generalDataSource}
                  columns={[
                    { title: 'Trường thông tin', dataIndex: 'label', key: 'label', width: '250px', render: (text) => <Text type="secondary" style={{ fontWeight: 500 }}>{text}</Text> },
                    { title: 'Giá trị', dataIndex: 'value', key: 'value' },
                  ]}
                  pagination={false} bordered size="middle" showHeader={false}
                />
              </Col>
            </Row>
          </div>
        );
      })()
    },
    {
      key: 'parts',
      label: <Space><BookOutlined /><span style={{ fontWeight: 500 }}>Cấu trúc phần thi</span></Space>,
      children: (
        <div style={{ padding: 24, backgroundColor: '#fff' }}>
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
                queryClient.invalidateQueries({ queryKey: ['admin', 'exam-templates'] })
              } catch (err) {
                message.error(err?.message || 'Không thể tải lại thông tin mẫu đề')
              } finally {
                setLoading(false)
              }
            }}
          />
        </div>
      )
    }
  ]


  return (
    <div style={{ height: 'calc(100vh - 90px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', padding: '0 24px' }}>
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24, marginTop: 24 }}>
          <div>
            <Title level={3} style={{ marginBottom: 4, marginTop: 0 }}>Chi tiết mẫu đề</Title>
            <Text type="secondary">ID: {examTemplate.examTemplateId}</Text>
          </div>
          <Space size="small" wrap>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}
              style={{ borderRadius: 20, height: 40, padding: '0 20px', fontWeight: 600 }}>Quay lại</Button>
            
            <Divider type="vertical" style={{ height: 24, margin: '0 8px' }} />

            {isStaff && [0, 4].includes(examTemplate.status ?? 0) && (
              <Button type="primary" icon={<SendOutlined />} onClick={handleSubmitForApproval} loading={submittingForApproval}
                style={{ borderRadius: 20, height: 40, padding: '0 20px', fontWeight: 600 }}>
                Gửi duyệt
              </Button>
            )}
            {isAdmin && (
              <Button icon={<SwapOutlined />} onClick={() => setStatusChangeModalOpen(true)} loading={statusChangeLoading}
                style={{ borderRadius: 20, height: 40, padding: '0 20px', fontWeight: 600 }}>
                Chuyển trạng thái
              </Button>
            )}
            {examTemplate.status === 3 && isAdmin && (
              <Space size={8}>
                <Button icon={<CheckCircleOutlined />} onClick={() => handleOpenApprovalModal('approve')}
                  style={{ borderRadius: 20, height: 40, padding: '0 20px', fontWeight: 600, color: '#52c41a' }}>Phê duyệt</Button>
                <Button icon={<CloseCircleOutlined />} onClick={() => handleOpenApprovalModal('reject')}
                  style={{ borderRadius: 20, height: 40, padding: '0 20px', fontWeight: 600, color: '#ff4d4f' }}>Từ chối</Button>
              </Space>
            )}
            <Button type="primary" icon={<EditOutlined />} onClick={handleEdit} disabled={isStaff && ![0, 4].includes(examTemplate.status ?? 0)}
              style={{ borderRadius: 20, height: 40, padding: '0 20px', fontWeight: 600 }}>Chỉnh sửa</Button>
            {examTemplate.status !== 1 && (
              <Button danger icon={<DeleteOutlined />} onClick={handleDelete} loading={deleting}
                style={{ borderRadius: 20, height: 40, padding: '0 20px', fontWeight: 600 }}>Xóa</Button>
            )}
          </Space>
        </div>


        {/* Main Content Sections (Tabs) */}
        <div style={{ flex: 1, minHeight: 0, paddingBottom: 24 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0', height: '100%', overflowY: 'auto' }}>
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} centered={false}
              tabBarStyle={{ padding: '16px 24px 0', borderBottom: '1px solid #f0f0f0', background: '#ffffff', position: 'sticky', top: 0, zIndex: 10, margin: 0 }} />
          </div>
        </div>
      </div>

      {/* Global Modals */}
      {editModalOpen && <EditExamTemplateModal open={editModalOpen} examTemplate={examTemplate} onCancel={() => setEditModalOpen(false)} onSuccess={handleEditSuccess} />}
      <ExamTemplateApprovalModal open={approvalModalOpen} loading={approvalLoading} initialApprovalType={approvalMode} onCancel={() => { setApprovalModalOpen(false); setApprovalMode('approve'); }} onSubmit={handleApprovalSubmit} />
      <ExamTemplateStatusChangeModal open={statusChangeModalOpen} loading={statusChangeLoading} currentStatus={examTemplate?.status ?? 0} onCancel={() => setStatusChangeModalOpen(false)} onSubmit={handleStatusChange} />
      <Modal title={guideSection === 'parts' ? 'Hướng dẫn: Quản lý các phần' : 'Hướng dẫn: Thông tin cơ bản'} open={guideModalOpen} onCancel={() => setGuideModalOpen(false)} footer={[<Button key="close" onClick={() => setGuideModalOpen(false)}>Đóng</Button>]} width={700}>
        <div style={{ padding: '8px 0' }}>{renderGuideContent()}</div>
      </Modal>
    </div>
  )
}

export default ExamTemplateDetailScreen
