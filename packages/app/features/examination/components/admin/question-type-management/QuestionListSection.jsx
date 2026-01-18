'use client'

import React from 'react'
import { Card, Typography } from 'antd'
import { QuestionFilter } from '../question-bank-management/QuestionFilter'
import { QuestionCardList } from '../question-bank-management/QuestionCardList'

const { Title } = Typography

export function QuestionListSection({
  title,
  total,
  filters,
  onFilterChange,
  onSearchChange,
  data,
  loading,
  onDeleted,
  onRefresh,
  pagination,
}) {
  return (
    <Card>
      <Title level={4} style={{ marginBottom: 16 }}>
        {title} ({total})
      </Title>

      <QuestionFilter filters={filters} onFilterChange={onFilterChange} onSearchChange={onSearchChange} />

      <QuestionCardList
        data={data}
        loading={loading}
        onDeleted={onDeleted}
        onRefresh={onRefresh}
        pagination={pagination}
      />
    </Card>
  )
}

export default QuestionListSection

