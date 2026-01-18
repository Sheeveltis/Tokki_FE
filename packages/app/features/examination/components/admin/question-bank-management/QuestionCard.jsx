import React from 'react'
import { Card, Typography, Space, Button, Popconfirm, Tag, Checkbox, Input } from 'antd'
import { EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined, SendOutlined, CheckOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { QuestionEditForm } from './QuestionEditForm'
import { OptionsEditor } from './OptionsEditor'
import { OptionsDisplay } from './OptionsDisplay'
import { getCurrentUserRole } from '../../../../../provider/api/client.js'

const { Text, Paragraph } = Typography

/**
 * Component hiển thị 1 card câu hỏi
 */
export function QuestionCard({
  question,
  index,
  isEditing,
  editingId,
  saving,
  deletingId,
  editForm,
  setEditForm,
  editOptions,
  mediaObjectUrl,
  setMediaObjectUrl,
  passage,
  allPassages,
  loadingPassages,
  currentPassage,
  currentQuestionType,
  validatePassageSkillCompatibility,
  onEdit,
  onCancelEdit,
  onSave,
  onDeleteQuestion,
  onAddOption,
  onRemoveOption,
  onOptionChange,
  onSelectCorrect,
  onOpenTypeSelector,
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
  const canSelect = isStaff && status === 0
  
  // Admin có thể duyệt/từ chối các câu hỏi chờ phê duyệt (status = 3)
  const canApprove = isAdmin && status === 3
  
  // Staff chỉ được xem các status: 0 (Nháp), 3 (Chờ phê duyệt), 4 (Bị từ chối), 2 (Đã xóa), 1 (Hoạt động - xem tất cả)
  // Admin xem tất cả
  const canView = !isStaff || [0, 1, 2, 3, 4].includes(status)
  
  // Staff: Chỉ được sửa khi status = 0 (Nháp) hoặc 4 (Bị từ chối)
  // Admin: Không được sửa khi status = 1 (Hoạt động) hoặc 2 (Đã xóa)
  const canEdit = isStaff 
    ? (status === 0 || status === 4)
    : (status !== 1 && status !== 2)
  
  // Staff: Chỉ được xóa khi status = 0 (Nháp) hoặc 4 (Bị từ chối)
  // Admin: Không được xóa khi status = 2 (Đã xóa)
  const canDelete = isStaff
    ? (status === 0 || status === 4)
    : (status !== 2)
  
  // Staff: Chỉ được gửi duyệt lại khi status = 4 (Bị từ chối)
  const canResubmit = isStaff && status === 4

  return (
    <Card
      key={key}
      title={<Text>Câu {index + 1}</Text>}
      bordered={false}
      style={{
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        backgroundColor: '#fafafa',
      }}
      extra={
        <Space>
          {isEditing ? (
            <>
              <Button type="text" icon={<SaveOutlined />} onClick={onSave} disabled={saving} loading={saving}>
                Lưu
              </Button>
              <Button type="text" icon={<CloseOutlined />} onClick={onCancelEdit}>
                Hủy
              </Button>
            </>
          ) : (
            <>
              {/* Staff: Checkbox để chọn câu hỏi nháp gửi duyệt */}
              {canSelect && (
                <Checkbox
                  checked={isSelected}
                  onChange={(e) => onToggleSelect && onToggleSelect(key, e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  style={{ transform: 'scale(1.25)', transformOrigin: 'center', marginRight: 4 }}
                />
              )}

              {/* Admin: 2 nút duyệt/từ chối cho câu hỏi chờ phê duyệt */}
              {canApprove && (
                <Space size={4}>
                  <Button
                    type="text"
                    icon={<CheckOutlined />}
                    onClick={() => onSetApprovalStatus && onSetApprovalStatus(key, approvalStatus === 'approve' ? null : 'approve')}
                    style={{
                      color: approvalStatus === 'approve' ? '#fff' : '#52c41a',
                      backgroundColor: approvalStatus === 'approve' ? '#52c41a' : 'transparent',
                      borderRadius: 4,
                    }}
                    title="Duyệt"
                  />
                  <Button
                    type="text"
                    icon={<CloseCircleOutlined />}
                    onClick={() => onSetApprovalStatus && onSetApprovalStatus(key, approvalStatus === 'reject' ? null : 'reject')}
                    style={{
                      color: approvalStatus === 'reject' ? '#fff' : '#ff4d4f',
                      backgroundColor: approvalStatus === 'reject' ? '#ff4d4f' : 'transparent',
                      borderRadius: 4,
                    }}
                    title="Từ chối"
                  />
                </Space>
              )}

              {canEdit && (
                <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(key)}>
                  Sửa
                </Button>
              )}

              {canDelete && (
                <Popconfirm
                  title="Xóa câu hỏi"
                  description="Bạn có chắc chắn muốn xóa câu hỏi này?"
                  onConfirm={() => onDeleteQuestion(key)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button type="text" danger icon={<DeleteOutlined />} loading={deletingId === key} disabled={deletingId === key}>
                    Xóa
                  </Button>
                </Popconfirm>
              )}

              {canResubmit && onSubmitForApproval && (
                <Popconfirm
                  title="Gửi duyệt lại"
                  description="Bạn có chắc chắn muốn gửi câu hỏi này để phê duyệt lại?"
                  onConfirm={() => onSubmitForApproval(key)}
                  okText="Gửi"
                  cancelText="Hủy"
                >
                  <Button type="text" icon={<SendOutlined />} style={{ color: '#1890ff' }}>
                    Gửi duyệt lại
                  </Button>
                </Popconfirm>
              )}
            </>
          )}
        </Space>
      }
    >
      {isEditing ? (
        <>
          <QuestionEditForm
            editForm={editForm}
            setEditForm={setEditForm}
            mediaObjectUrl={mediaObjectUrl}
            setMediaObjectUrl={setMediaObjectUrl}
            allPassages={allPassages}
            loadingPassages={loadingPassages}
            currentPassage={currentPassage}
            currentQuestionType={currentQuestionType}
            validatePassageSkillCompatibility={validatePassageSkillCompatibility}
            onOpenTypeSelector={onOpenTypeSelector}
          />
          <OptionsEditor
            options={editOptions}
            onAddOption={onAddOption}
            onRemoveOption={onRemoveOption}
            onOptionChange={onOptionChange}
            onSelectCorrect={onSelectCorrect}
          />
        </>
      ) : (
        <>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            {/* Passage Display */}
            {hasPassage && (
              <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                <Text strong>Đoạn văn: {passage.title}</Text>
                {passage.mediaType === 1 && passage.imageUrl ? (
                  <div style={{ marginTop: 8 }}>
                    <img 
                      src={passage.imageUrl} 
                      alt={passage.title} 
                      style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 4 }} 
                    />
                  </div>
                ) : (
                  <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>{passage.content}</Paragraph>
                )}
              </div>
            )}

            {/* Content */}
            <Paragraph strong style={{ marginBottom: 4 }}>
              {question.content}
            </Paragraph>

            {/* Media URL */}
            {question.mediaUrl && (
              question.mediaUrl.match(/\.(mp3|wav|ogg)(\?|#|$)/i) ? (
                <audio controls style={{ width: '100%', marginTop: 4 }}>
                  <source src={question.mediaUrl} />
                  Trình duyệt không hỗ trợ phát audio.
                </audio>
              ) : (
                <img
                  src={question.mediaUrl}
                  alt="Question media"
                  style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 8, marginTop: 8 }}
                />
              )
            )}

            {/* Explanation */}
            {question.explanation && (
              <Text type="secondary" style={{ display: 'block' }}>
                {question.explanation}
              </Text>
            )}

            {/* Status */}
            {question.status !== undefined && question.status !== null && (() => {
              const statusMap = {
                0: { label: 'Nháp', color: 'default' },
                1: { label: 'Đang hoạt động', color: 'green' },
                2: { label: 'Đã xóa', color: 'red' },
                3: { label: 'Chờ phê duyệt', color: 'orange' },
                4: { label: 'Bị từ chối phê duyệt', color: 'volcano' },
              }
              const info = statusMap[question.status] || { label: `Trạng thái ${question.status}`, color: 'default' }
              return (
                <Space wrap>
                  <Tag color={info.color}>{info.label}</Tag>
                </Space>
              )
            })()}

            {/* Admin: Input lí do từ chối khi chọn reject */}
            {canApprove && approvalStatus === 'reject' && (
              <div style={{ marginTop: 8 }}>
                <Input.TextArea
                  placeholder="Nhập lí do từ chối..."
                  value={rejectReason || ''}
                  onChange={(e) => onSetRejectReason && onSetRejectReason(key, e.target.value)}
                  rows={2}
                  style={{ maxWidth: 400 }}
                />
              </div>
            )}
          </Space>

          {/* Options Display */}
          <OptionsDisplay options={options} />
        </>
      )}
    </Card>
  )
}

