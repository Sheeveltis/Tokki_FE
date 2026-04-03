import React from 'react'
import { Space, Select, Input, Button } from 'antd'
import { SearchOutlined, SendOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { getCurrentUserRole } from '../../../../../provider/api/client.js'

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
  hideStatusFilter = false,
  hidePendingOption = false,
  extraActions = null,
}) {
  const { search, status } = filters
  const role = getCurrentUserRole()
  const isStaff = role === 'Staff'
  const isAdmin = role === 'Admin'

  const statusOptions = [
    { value: 0, label: 'Nháp' },
    { value: 1, label: 'Đang hoạt động' },
    { value: 2, label: 'Đã xóa' },
    { value: 3, label: 'Chờ phê duyệt' },
    { value: 4, label: 'Bị từ chối' },
  ].filter((opt) => !(hidePendingOption && opt.value === 3))

  return (
    <Space wrap size="middle" align="center" style={{ width: '100%', marginBottom: 16, justifyContent: 'space-between' }}>
      <Space wrap size="middle" align="center">
        <Input
          placeholder="Tìm kiếm theo nội dung..."
          allowClear
          prefix={<SearchOutlined />}
          style={{ width: 300, height: 40, borderRadius: 20 }}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        {!hideStatusFilter && (
          <Select
            placeholder="Trạng thái"
            allowClear
            variant="outlined"
            style={{ width: 180, height: 40, borderRadius: 20 }}
            value={status}
            onChange={(value) => onFilterChange({ ...filters, status: value })}
            options={statusOptions}
          />
        )}
      </Space>

      <Space align="center">
        {extraActions}
        {/* Staff: Nút gửi duyệt */}
        {isStaff && onSubmitSelectedForApproval && (
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={onSubmitSelectedForApproval}
            disabled={selectedCount === 0 || submitting}
            loading={submitting}
            style={{ borderRadius: 20, height: 40, fontWeight: 600 }}
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
            style={{ borderRadius: 20, height: 40, fontWeight: 600 }}
          >
            Xác nhận {approvalCount > 0 ? `(${approvalCount})` : ''}
          </Button>
        )}
      </Space>
    </Space>
  )
}

