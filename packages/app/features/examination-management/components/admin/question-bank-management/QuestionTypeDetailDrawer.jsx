'use client'

import React from 'react'
import DetailDrawer from '../../../../../../components/DetailDrawer'

export function QuestionTypeDetailDrawer({ open, onClose, data }) {
  return (
    <DetailDrawer
      open={open}
      onClose={onClose}
      title="Chi tiết loại câu hỏi"
      data={data || {}}
    />
  )
}

export default QuestionTypeDetailDrawer

