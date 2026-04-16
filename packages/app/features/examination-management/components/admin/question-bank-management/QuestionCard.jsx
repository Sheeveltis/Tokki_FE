import React from 'react'
import { Card, Typography, Space, Button, Tag, Checkbox, Input } from 'antd'
import { EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined, SendOutlined, CheckOutlined, CloseCircleOutlined, SoundOutlined } from '@ant-design/icons'
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
      variant="outlined"
      hoverable
      style={{
        marginBottom: 20,
        borderRadius: 16,
        overflow: 'hidden',
        border: isSelected ? '2px solid #1677ff' : '1px solid #f0f0f0',
        backgroundColor: isSelected ? '#f0faff' : '#ffffff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      styles={{ body: { padding: '20px 24px' } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space size={12} align="center">
          <div style={{
            padding: '4px 12px',
            borderRadius: 8,
            backgroundColor: '#1677ff',
            color: '#fff',
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: '0.5px',
            boxShadow: '0 4px 10px rgba(22, 119, 255, 0.2)'
          }}>
            #{index + 1}
          </div>
          
          <Text strong style={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Question
          </Text>

          {question.status !== undefined && (() => {
            const statusMap = {
              0: { label: 'Nháp', color: 'default' },
              1: { label: 'Hoạt động', color: 'success' },
              2: { label: 'Đã xóa', color: 'error' },
              3: { label: 'Chờ duyệt', color: 'warning' },
              4: { label: 'Từ chối', color: 'magenta' },
            }
            const info = statusMap[question.status] || { label: `TT: ${question.status}`, color: 'default' }
            return <Tag color={info.color} variant="filled" style={{ borderRadius: 6, margin: 0, fontWeight: 500 }}>{info.label}</Tag>
          })()}
        </Space>

        <Space>
          {canApprove && (
            <Space size={4} style={{ marginRight: 8, paddingRight: 8, borderRight: '1px solid #f0f0f0' }}>
              <Button
                type={approvalStatus === 'approve' ? 'primary' : 'default'}
                icon={<CheckOutlined />}
                size="small"
                onClick={() => onSetApprovalStatus && onSetApprovalStatus(key, approvalStatus === 'approve' ? null : 'approve')}
                style={approvalStatus !== 'approve' ? { color: '#52c41a', borderColor: '#52c41a' } : {}}
              >Duyệt</Button>
              <Button
                danger
                type={approvalStatus === 'reject' ? 'primary' : 'default'}
                icon={<CloseCircleOutlined />}
                size="small"
                onClick={() => onSetApprovalStatus && onSetApprovalStatus(key, approvalStatus === 'reject' ? null : 'reject')}
              >Từ chối</Button>
            </Space>
          )}
          <Space size={4}>
            {canEdit && <Button type="text" size="small" icon={<EditOutlined />} onClick={() => onEdit(key)} style={{ color: '#1677ff' }}>Sửa</Button>}
            {canDelete && (
              <Button type="text" danger size="small" icon={<DeleteOutlined />} loading={deletingId === key} onClick={() => onDeleteQuestion(key)} />
            )}
            {canResubmit && onSubmitForApproval && (
              <Button type="primary" size="small" ghost icon={<SendOutlined />} onClick={() => onSubmitForApproval(key)}>Gửi duyệt</Button>
            )}
          </Space>
        </Space>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Passage Area */}
        {hasPassage && (
          <div style={{ 
            padding: '16px 20px', 
            backgroundColor: '#fafafa', 
            borderRadius: 12, 
            borderLeft: '4px solid #1677ff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <Text strong style={{ color: '#1677ff', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Context / Passage
              </Text>
              <Tag color="blue" variant="filled" style={{ fontSize: 11 }}>{passage.title}</Tag>
            </div>
            {passage.mediaType === 1 && passage.imageUrl ? (
              <div style={{ marginTop: 12 }}>
                <img src={passage.imageUrl} alt={passage.title} style={{ maxWidth: '100%', maxHeight: 250, borderRadius: 10, border: '1px solid #f0f0f0' }} />
              </div>
            ) : (
              <Text style={{ fontSize: 15, lineHeight: 1.7, color: '#262626' }}>{passage.content}</Text>
            )}
          </div>
        )}

        {/* Question Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Audio Display */}
          {question.mediaUrl && (question.mediaUrl.includes('.mp3') || question.mediaUrl.includes('.wav')) && (
            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '10px 16px', 
              borderRadius: 12, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12,
              border: '1px solid #f0f0f0'
            }}>
              <div style={{ 
                width: 36, 
                height: 36, 
                borderRadius: 10, 
                backgroundColor: '#fff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#1677ff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <SoundOutlined />
              </div>
              <audio controls style={{ flex: 1, height: 32 }}>
                <source src={question.mediaUrl} />
              </audio>
            </div>
          )}

          {/* Question Text */}
          {question.content && (
            <Paragraph style={{ fontSize: 16, fontWeight: 500, color: '#141414', margin: 0, lineHeight: 1.6 }}>
              {question.content}
            </Paragraph>
          )}

          {/* Image media */}
          {question.mediaUrl && !(question.mediaUrl.includes('.mp3') || question.mediaUrl.includes('.wav')) && (
            <div style={{ marginTop: 4 }}>
              <img src={question.mediaUrl} alt="Question" style={{ maxWidth: '100%', maxHeight: 350, borderRadius: 12, border: '1px solid #f0f0f0' }} />
            </div>
          )}

          {/* Transcript / Explanation Area */}
          {question.explanation && (
            <div style={{ 
              backgroundColor: '#fffcf0', 
              padding: '16px 20px', 
              borderRadius: 12, 
              border: '1px solid #ffe58f',
              marginTop: 4
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 10
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#faad14' }} />
                <Text strong style={{ fontSize: 12, color: '#faad14', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Explanation & Transcript
                </Text>
              </div>
              <div 
                style={{ fontSize: 14, color: '#595959', lineHeight: 1.7 }}
                dangerouslySetInnerHTML={{ __html: question.explanation }}
              />
            </div>
          )}
        </div>

        {/* Admin Rejection Reason */}
        {canApprove && approvalStatus === 'reject' && (
          <div style={{ backgroundColor: '#fff1f0', padding: 16, borderRadius: 12, border: '1px solid #ffccc7', marginTop: 8 }}>
            <Text strong type="danger" style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>Lí do từ chối:</Text>
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

