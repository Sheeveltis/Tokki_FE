'use client'

import React from 'react'
import { Card, Space, Select, Button, Table } from 'antd'

export function TopicVocabSection({
  selecting,
  onSelectingChange,
  availableOptions,
  onSearch,
  searching,
  onAdd,
  dataSource,
  selectStyle,
}) {
  const columns = [
    { title: 'Từ', dataIndex: 'text', key: 'text' },
    { title: 'Phiên âm', dataIndex: 'pronunciation', key: 'pronunciation' },
    { title: 'Định nghĩa', dataIndex: 'definition', key: 'definition' },
  ]

  return (
    <Card title="Từ vựng trong chủ đề">
      <Space style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }}>
        <Select
          mode="multiple"
          allowClear
          placeholder="Chọn từ vựng để thêm"
          style={{
            flex: 1,
            minWidth: 800,
            maxWidth: '80%',
            ...selectStyle,
          }}
          value={selecting}
          options={availableOptions}
          onChange={onSelectingChange}
          onSearch={onSearch}
          showSearch
          filterOption={false}
          loading={searching}
          size="middle"
          optionFilterProp="label"
        />
        <Button type="primary" onClick={onAdd} disabled={!selecting.length} size="middle">
          Thêm vào chủ đề
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={{ pageSize: 5 }}
        locale={{ emptyText: 'Chưa có từ vựng trong chủ đề' }}
      />
    </Card>
  )
}

export default TopicVocabSection

