'use client'

import React from 'react'
import { Modal, message } from 'antd'

/**
 * Modal chọn bộ câu hỏi (Question Type)
 */
export function QuestionTypeSelectorModal({
  open,
  onCancel,
  questionTypes,
  loadingTypes,
  editForm,
  validatePassageSkillCompatibility,
  onSelect,
}) {
  const handleTypeSelect = (type) => {
    onSelect(type)
    
    // Validate if passage is selected
    if (editForm?.passageId) {
      if (!validatePassageSkillCompatibility(editForm.passageId, type.questionTypeId)) {
        const skillName = ['Nghe', 'Đọc', 'Viết'][type.skill - 1]
        message.warning(`Cảnh báo: Kỹ năng ${skillName} không tương thích với đoạn văn đã chọn. Vui lòng chọn lại passage hoặc bộ câu hỏi.`)
      }
    }
  }

  return (
    <Modal
      title="Chọn bộ câu hỏi"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {loadingTypes ? (
          <div style={{ textAlign: 'center', padding: 20 }}>Đang tải...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
            {questionTypes.map((type) => {
              const isSelected = editForm?.questionTypeId === type.questionTypeId
              const isCompatible = !editForm?.passageId || validatePassageSkillCompatibility(editForm.passageId, type.questionTypeId)
              
              return (
                <div 
                  key={type.questionTypeId}
                  onClick={() => handleTypeSelect(type)}
                  style={{
                    border: `1px solid ${isSelected ? '#1890ff' : (!isCompatible ? '#ff4d4f' : '#d9d9d9')}`,
                    borderRadius: 4,
                    padding: 12,
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#e6f7ff' : (!isCompatible ? '#fff1f0' : '#fff'),
                    transition: 'all 0.3s',
                    opacity: !isCompatible ? 0.7 : 1,
                  }}
                >
                  <div><strong>{type.name}</strong></div>
                  <div>Kỹ năng: {['Nghe', 'Đọc', 'Viết'][type.skill - 1]}</div>
                  <div>Độ khó: {['Dễ', 'Trung bình', 'Khó'][type.difficulty - 1]}</div>
                  <div>Mã: {type.code}</div>
                  {!isCompatible && editForm?.passageId && (
                    <div style={{ color: '#ff4d4f', fontSize: '11px', marginTop: 4 }}>
                      ⚠️ Không tương thích với passage đã chọn
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Modal>
  )
}

