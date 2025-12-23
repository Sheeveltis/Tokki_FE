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
  pagination,
  onChange,
}) {
  // Đảm bảo dataSource luôn là array
  const safeDataSource = Array.isArray(dataSource) ? dataSource : []
  
  return (
    <Table
      size="middle"
      rowKey={rowKey}
      columns={columns}
      dataSource={safeDataSource}
      loading={loading}
      pagination={pagination !== undefined ? pagination : { pageSize: 8 }}
      onChange={onChange}
      onRow={(record) => ({
        onClick: () => onRowClick && onRowClick(record),
        style: { cursor: onRowClick ? 'pointer' : 'default' },
      })}
    />
  )
}

export default ManagementTable

