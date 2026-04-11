import React from 'react'
import { Card, Typography, Space, Button, Popconfirm, Tag, Checkbox, Input } from 'antd'
import { EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined, SendOutlined, CheckOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { QuestionEditForm } from './QuestionEditForm'
import { OptionsEditor } from './OptionsEditor'
import { OptionsDisplay } from './OptionsDisplay'
import { getCurrentUserRole } from '../../../../../provider/api/client.js'

const { Text, Paragraph } = Typography

const QUESTION_BANK_STATUS = {
  DRAFT: 0,
  ACTIVE: 1,
  DELETED: 2,
  PENDING_APPROVAL: 3,
  REJECTED: 4,
  ASSIGNED: 5,
}

/**
 * Component hiển thị 1 card câu hỏi
 */
export function QuestionCard({
  question,
  index,
  deletingId,
  passage,
  onEdit,
  onDeleteQuestion,
  onSubmitForApproval,
  isSelected,
  onToggleSelect,
  // Admin approval props
  approvalStatus,
  rejectReason,
  onSetApprovalStatus,
  onSetRejectReason,
}) {
  const key = question.questionBankId || question.id || index
  const options = question.options || question.answers || []
  const hasOptions = Array.isArray(options) && options.length > 0
  const hasPassage = !!question.passageId && !!passage
  const role = getCurrentUserRole()
  const isStaff = role === 'Staff'
  const isAdmin = role === 'Admin'
  const status = question.status ?? 0
  
  // Staff chỉ được tick chọn các câu hỏi nháp (status = 0)
  const canSelect = isStaff && status === QUESTION_BANK_STATUS.DRAFT
  
  // Admin có thể duyệt/từ chối các câu hỏi chờ phê duyệt (status = 3)
  const canApprove = isAdmin && status === QUESTION_BANK_STATUS.PENDING_APPROVAL
  
  // Staff chỉ được xem các status: 0 (Nháp), 3 (Chờ phê duyệt), 4 (Bị từ chối), 2 (Đã xóa), 1 (Hoạt động - xem tất cả)
  // Admin xem tất cả
  const canView = !isStaff || [
    QUESTION_BANK_STATUS.DRAFT,
    QUESTION_BANK_STATUS.ACTIVE,
    QUESTION_BANK_STATUS.DELETED,
    QUESTION_BANK_STATUS.PENDING_APPROVAL,
    QUESTION_BANK_STATUS.REJECTED,
  ].includes(status)
  
  // Chỉ cho phép chỉnh sửa khi trạng thái là Draft hoặc Active (không cho PendingApproval/Assigned/Deleted)
  const canEdit = status === QUESTION_BANK_STATUS.DRAFT || status === QUESTION_BANK_STATUS.ACTIVE
  
  // Staff: Chỉ được xóa khi status = Draft; Admin: không được xóa khi Deleted
  const canDelete = isStaff
    ? status === QUESTION_BANK_STATUS.DRAFT
    : status !== QUESTION_BANK_STATUS.DELETED
  
  // Staff: Chỉ được gửi duyệt lại khi status = Rejected
  const canResubmit = isStaff && status === QUESTION_BANK_STATUS.REJECTED

  return (
    <Card
      key={key}
      bordered
      style={{
        marginBottom: 24,
        borderRadius: 12,
        overflow: 'hidden',
        border: isSelected ? '2px solid #1890ff' : '1px solid #f0f0f0',
        backgroundColor: isSelected ? '#e6f7ff' : '#ffffff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease'
      }}
      bodyStyle={{ padding: 24 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <Space direction="vertical" size={4}>
          <Space size={12}>
            {canSelect && (
              <Checkbox
                checked={isSelected}
                onChange={(e) => onToggleSelect && onToggleSelect(key, e.target.checked)}
                style={{ transform: 'scale(1.2)' }}
              />
            )}
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#1890ff',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 14,
              boxShadow: '0 2px 4px rgba(24, 144, 255, 0.3)'
            }}>
              {index + 1}
            </div>
            <Tag color="blue" bordered={false} style={{ margin: 0, fontWeight: 600, borderRadius: 4, padding: '0 8px' }}>
              CÂU HỎI {index + 1}
            </Tag>
            {question.status !== undefined && (() => {
              const statusMap = {
                0: { label: 'Nháp', color: 'default' },
                1: { label: 'Hoạt động', color: 'success' },
                2: { label: 'Đã xóa', color: 'error' },
                3: { label: 'Chờ duyệt', color: 'warning' },
                4: { label: 'Từ chối', color: 'magenta' },
              }
              const info = statusMap[question.status] || { label: `TT: ${question.status}`, color: 'default' }
              return <Tag color={info.color} variant="filled" style={{ borderRadius: 4, margin: 0 }}>{info.label}</Tag>
            })()}
          </Space>
        </Space>

        <Space>
          <div style={{ display: 'flex', gap: 8 }}>
            {canApprove && (
              <div style={{ display: 'flex', gap: 4, marginRight: 8, paddingRight: 8, borderRight: '1px solid #f0f0f0' }}>
                <Button
                  icon={<CheckOutlined />}
                  onClick={() => onSetApprovalStatus && onSetApprovalStatus(key, approvalStatus === 'approve' ? null : 'approve')}
                  style={{
                    borderColor: approvalStatus === 'approve' ? '#52c41a' : '#d9d9d9',
                    color: approvalStatus === 'approve' ? '#fff' : '#52c41a',
                    backgroundColor: approvalStatus === 'approve' ? '#52c41a' : 'transparent',
                  }}
                >Duyệt</Button>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => onSetApprovalStatus && onSetApprovalStatus(key, approvalStatus === 'reject' ? null : 'reject')}
                  style={{
                    backgroundColor: approvalStatus === 'reject' ? '#ff4d4f' : 'transparent',
                    color: approvalStatus === 'reject' ? '#fff' : '#ff4d4f',
                  }}
                >Từ chối</Button>
              </div>
            )}
            {canEdit && <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(key)}>Sửa</Button>}
            {canDelete && (
              <Popconfirm title="Xóa câu hỏi?" onConfirm={() => onDeleteQuestion(key)}>
                <Button type="text" danger icon={<DeleteOutlined />} loading={deletingId === key} />
              </Popconfirm>
            )}
            {canResubmit && onSubmitForApproval && (
              <Button type="primary" ghost icon={<SendOutlined />} onClick={() => onSubmitForApproval(key)}>Gửi duyệt</Button>
            )}
          </div>
        </Space>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Passage Area */}
        {hasPassage && (
          <div style={{ 
            padding: 16, 
            backgroundColor: '#f9f9f9', 
            borderRadius: 8, 
            borderLeft: '4px solid #1890ff',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Text strong style={{ color: '#1890ff', fontSize: 13, textTransform: 'uppercase' }}>Dữ liệu dùng chung / Đoạn văn</Text>
              <Tag color="processing">{passage.title}</Tag>
            </div>
            {passage.mediaType === 1 && passage.imageUrl ? (
              <div style={{ marginTop: 8 }}>
                <img src={passage.imageUrl} alt={passage.title} style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8, border: '1px solid #eee' }} />
              </div>
            ) : (
              <Text style={{ fontSize: 15, lineHeight: 1.6, color: '#434343' }}>{passage.content}</Text>
            )}
          </div>
        )}

        {/* Question Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Audio Display */}
          {question.mediaUrl && (question.mediaUrl.includes('.mp3') || question.mediaUrl.includes('.wav')) && (
            <div style={{ 
              backgroundColor: '#f0f5ff', 
              padding: '12px 16px', 
              borderRadius: 40, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 16, 
              border: '1px solid #adc6ff' 
            }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <SendOutlined style={{ transform: 'rotate(-45deg)' }} />
              </div>
              <audio controls style={{ flex: 1, height: 36 }}>
                <source src={question.mediaUrl} />
              </audio>
            </div>
          )}

          {/* Question Text */}
          {question.content && (
            <Paragraph style={{ fontSize: 17, fontWeight: 500, color: '#1f1f1f', margin: 0, lineHeight: 1.6 }}>
              {question.content}
            </Paragraph>
          )}

          {/* Image Placeholder if mediaUrl is not audio */}
          {question.mediaUrl && !(question.mediaUrl.includes('.mp3') || question.mediaUrl.includes('.wav')) && (
            <div style={{ marginTop: 8 }}>
              <img src={question.mediaUrl} alt="Question" style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 12, border: '1px solid #f0f0f0' }} />
            </div>
          )}

          {/* Transcript / Explanation Area */}
          {question.explanation && (
            <div style={{ 
              backgroundColor: '#fffbe6', 
              padding: 16, 
              borderRadius: 8, 
              border: '1px solid #ffe58f',
              position: 'relative'
            }}>
              <div style={{ 
                position: 'absolute', 
                top: -10, 
                left: 16, 
                backgroundColor: '#faad14', 
                color: '#fff', 
                padding: '2px 10px', 
                borderRadius: 4, 
                fontSize: 12, 
                fontWeight: 600 
              }}>
                GIẢI THÍCH / TRANSCRIPT
              </div>
              <div 
                style={{ fontSize: 15, color: '#434343', lineHeight: 1.6, paddingTop: 4 }}
                dangerouslySetInnerHTML={{ __html: question.explanation }}
              />
            </div>
          )}
        </div>

        {/* Admin Rejection Reason */}
        {canApprove && approvalStatus === 'reject' && (
          <div style={{ backgroundColor: '#fff2f0', padding: 16, borderRadius: 8, border: '1px solid #ffccc7' }}>
            <Text strong type="danger" style={{ display: 'block', marginBottom: 8 }}>Lí do từ chối:</Text>
            <Input.TextArea
              placeholder="Nhập lí do từ chối cụ thể..."
              value={rejectReason || ''}
              onChange={(e) => onSetRejectReason && onSetRejectReason(key, e.target.value)}
              rows={3}
              style={{ borderRadius: 8 }}
            />
          </div>
        )}

        {/* Options Display */}
        <OptionsDisplay options={options} />
      </div>
    </Card>
  )
}

