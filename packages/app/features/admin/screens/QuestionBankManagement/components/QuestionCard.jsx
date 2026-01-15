'use client'

import React from 'react'
import { Card, Typography, Space, Button, Popconfirm, Tag } from 'antd'
import { EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons'
import { QuestionEditForm } from './QuestionEditForm'
import { OptionsEditor } from './OptionsEditor'
import { OptionsDisplay } from './OptionsDisplay'

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
}) {
  const key = question.questionBankId || question.id || index
  const options = question.options || question.answers || []
  const hasOptions = Array.isArray(options) && options.length > 0
  const hasPassage = !!question.passageId && !!passage

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
              {(question.status ?? 0) !== 1 && (question.status ?? 0) !== 2 ? (
                <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(key)}>
                  Sửa
                </Button>
              ) : null}

              {(question.status ?? 0) !== 2 ? (
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
              ) : null}
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
              }
              const info = statusMap[question.status] || { label: `Trạng thái ${question.status}`, color: 'default' }
              return (
                <Space wrap>
                  <Tag color={info.color}>{info.label}</Tag>
                </Space>
              )
            })()}
          </Space>

          {/* Options Display */}
          <OptionsDisplay options={options} />
        </>
      )}
    </Card>
  )
}

