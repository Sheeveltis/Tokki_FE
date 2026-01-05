'use client'

import React from 'react'
import { Descriptions, Tag, Typography } from 'antd'

const { Text } = Typography

/**
 * QuestionDetail Component
 * Hiển thị thông tin chi tiết câu hỏi
 */
export function QuestionDetail({ question, questionTypeName }) {
  const difficultyColorMap = {
    easy: 'green',
    medium: 'orange',
    hard: 'red',
  }

  const difficultyLabelMap = {
    easy: 'Dễ',
    medium: 'Trung bình',
    hard: 'Khó',
  }

  const typeLabelMap = {
    'multiple-choice': 'Trắc nghiệm',
    'true-false': 'Đúng/Sai',
    'fill-blank': 'Điền vào chỗ trống',
    matching: 'Nối câu',
    essay: 'Tự luận',
  }

  const skillLabelMap = {
    listening: 'Nghe',
    reading: 'Đọc',
    writing: 'Viết',
    speaking: 'Nói',
  }

  return (
    <Descriptions bordered column={2}>
      <Descriptions.Item label="Nội dung câu hỏi" span={2}>
        <Text>{question.content}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="Loại câu hỏi">
        <Tag color="blue">{questionTypeName}</Tag>
      </Descriptions.Item>
      <Descriptions.Item label="Loại đề">
        <Tag color="blue">{question.examType}</Tag>
      </Descriptions.Item>
      <Descriptions.Item label="Mức độ">
        <Tag color={difficultyColorMap[question.difficulty] || 'default'}>
          {difficultyLabelMap[question.difficulty] || question.difficulty}
        </Tag>
      </Descriptions.Item>
      <Descriptions.Item label="Loại câu hỏi">
        {typeLabelMap[question.type] || question.type}
      </Descriptions.Item>
      <Descriptions.Item label="Kỹ năng">
        {skillLabelMap[question.skill] || question.skill}
      </Descriptions.Item>
      <Descriptions.Item label="Ngày tạo">
        {question.createdAt ? new Date(question.createdAt).toLocaleString('vi-VN') : '-'}
      </Descriptions.Item>
      <Descriptions.Item label="Ngày cập nhật">
        {question.updatedAt ? new Date(question.updatedAt).toLocaleString('vi-VN') : '-'}
      </Descriptions.Item>
    </Descriptions>
  )
}

