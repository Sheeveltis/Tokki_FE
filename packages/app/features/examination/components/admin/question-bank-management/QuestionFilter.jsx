'use client'

import React from 'react'
import { Space, Select, Input, Button } from 'antd'
import { SearchOutlined, SendOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { getCurrentUserRole } from '../../../../../provider/api/client'

/**
 * QuestionFilter Component
 * Component để lọc câu hỏi theo các tiêu chí
 */
export function QuestionFilter({ 
  filters, 
  onFilterChange, 
  onSearchChange, 
  // Staff: gửi duyệt
  onSubmitSelectedForApproval, 
  selectedCount = 0, 
  // Admin: xác nhận duyệt/từ chối
  onConfirmApproval,
  approvalCount = 0,
  submitting = false,
}) {
  const { search, status } = filters
  const role = getCurrentUserRole()
  const isStaff = role === 'Staff'
  const isAdmin = role === 'Admin'

  return (
    <Space wrap size="middle" style={{ width: '100%', marginBottom: 16, justifyContent: 'space-between' }}>
      <Space wrap size="middle">
        <Input
          placeholder="Tìm kiếm theo nội dung..."
          allowClear
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <Select
          placeholder="Trạng thái"
          allowClear
          style={{ width: 180 }}
          value={status}
          onChange={(value) => onFilterChange({ ...filters, status: value })}
          options={[
            { value: 0, label: 'Nháp' },
            { value: 1, label: 'Đang hoạt động' },
            { value: 2, label: 'Đã xóa' },
            { value: 3, label: 'Chờ phê duyệt' },
            { value: 4, label: 'Bị từ chối' },
          ]}
        />
      </Space>

      <Space>
        {/* Staff: Nút gửi duyệt */}
        {isStaff && onSubmitSelectedForApproval && (
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={onSubmitSelectedForApproval}
            disabled={selectedCount === 0 || submitting}
            loading={submitting}
          >
            Gửi duyệt {selectedCount > 0 ? `(${selectedCount})` : ''}
          </Button>
        )}

        {/* Admin: Nút xác nhận duyệt/từ chối */}
        {isAdmin && onConfirmApproval && (
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={onConfirmApproval}
            disabled={approvalCount === 0 || submitting}
            loading={submitting}
          >
            Xác nhận {approvalCount > 0 ? `(${approvalCount})` : ''}
          </Button>
        )}
      </Space>
    </Space>
  )
}

