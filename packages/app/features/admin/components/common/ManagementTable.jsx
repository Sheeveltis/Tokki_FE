import React from 'react'
import { Table } from 'antd'

/**
 * Thin wrapper quanh AntD Table để tái sử dụng trong Admin screens.
 */
export function ManagementTable({
  columns,
  dataSource,
  loading = false,
  onRowClick,
  rowKey = 'id',
}) {
  return (
    <Table
      size="middle"
      rowKey={rowKey}
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      pagination={{ pageSize: 8 }}
      onRow={(record) => ({
        onClick: () => onRowClick && onRowClick(record),
        style: { cursor: onRowClick ? 'pointer' : 'default' },
      })}
    />
  )
}

export default ManagementTable

