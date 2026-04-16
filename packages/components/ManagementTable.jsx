import React from 'react'
import { Table } from 'antd'

/**
 * Thin wrapper quanh AntD Table để tái sử dụng trong Admin screens.
 */
export default function ManagementTable({
  columns,
  dataSource,
  loading = false,
  onRowClick,
  rowKey = (record) => record.id || record.userId || record.key || record.email,
  pagination,
  onChange,
  scroll,
  size = 'middle',
}) {
  const safeDataSource = Array.isArray(dataSource) ? dataSource : []
  return (
    <Table
      size={size}
      rowKey={rowKey}
      columns={columns}
      dataSource={safeDataSource}
      loading={loading}
      pagination={pagination !== undefined ? pagination : { pageSize: 8 }}
      onChange={onChange}
      scroll={scroll}
      onRow={(record) => ({
        onClick: () => onRowClick && onRowClick(record),
        style: { cursor: onRowClick ? 'pointer' : 'default' },
      })}
    />
  )
}

