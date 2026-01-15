'use client'

import React from 'react'
import { Card, Typography } from 'antd'
import { QuestionFilter } from '../../QuestionBankManagement/components/QuestionFilter'
import { QuestionCardList } from '../../QuestionBankManagement/components/QuestionCardList'

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

