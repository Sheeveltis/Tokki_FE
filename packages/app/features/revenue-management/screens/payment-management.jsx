'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Space, Typography, Tag, Select, DatePicker, Tooltip } from 'antd'
import { FilterOutlined, BankOutlined } from '@ant-design/icons'
import ManagementLayout from '../../../../components/layout/management-layout.jsx'
import { useManagementFilters } from '../../back-office/hooks/use-management-filters.js'
import { apiClient } from '../../../provider/api/client.js'
import { ENDPOINTS } from '../../../provider/api/endpoints.js'
import { statusPayment, paymentStatusColors } from '../../../string.js'

const { Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

const formatVND = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount ?? 0)

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function PaymentManagement() {
  const [filters, setFilters] = useManagementFilters({
    status: 'all',
    hasTransaction: 'all',
    page: 1,
    size: 20,
    fromDate: undefined,
    toDate: undefined,
  })

  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  // Tổng doanh thu của trang hiện tại (chỉ Paid)
  const totalRevenue = useMemo(
    () =>
      payments
        .filter((p) => p.status === 'Paid')
        .reduce((sum, p) => sum + (p.amount || 0), 0),
    [payments]
  )

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true)

        const params = {
          PageNumber: filters.page,
          PageSize: filters.size,
        }

        if (filters.status !== 'all') params.Status = filters.status
        if (filters.hasTransaction !== 'all')
          params.HasTransaction = filters.hasTransaction === 'true'
        if (filters.fromDate) params.FromDate = filters.fromDate
        if (filters.toDate) params.ToDate = filters.toDate

        const response = await apiClient.get(ENDPOINTS.STATISTICS_PAYMENT.LIST, { params })

        const apiData = response?.data?.data
        setPayments(apiData?.items || [])
        setTotalCount(apiData?.totalCount || 0)
      } catch (error) {
        console.error('Failed to fetch payments', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [filters])

  const handleFilterChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))

  const handlePaginationChange = (newPage, newSize) =>
    setFilters((prev) => ({
      ...prev,
      page: prev.size !== newSize ? 1 : newPage,
      size: newSize,
    }))

  const columns = useMemo(
    () => [
      {
        title: 'STT',
        key: 'stt',
        align: 'center',
        width: 60,
        render: (_, __, index) => (filters.page - 1) * filters.size + index + 1,
      },
      {
        title: 'Mã thanh toán',
        dataIndex: 'paymentId',
        key: 'paymentId',
        width: 130,
        render: (text) => (
          <Text code style={{ fontSize: '12px' }}>
            {text}
          </Text>
        ),
      },
      {
        title: 'Người dùng',
        key: 'user',
        width: 200,
        render: (_, record) => (
          <div>
            <Text strong style={{ fontSize: '13px' }}>
              {record.fullName}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.userEmail}
            </Text>
          </div>
        ),
      },
      {
        title: 'Ngân hàng',
        key: 'bank',
        width: 200,
        render: (_, record) => (
          <Space>
            <BankOutlined style={{ color: '#1890ff' }} />
            <div>
              <Text style={{ fontSize: '13px' }}>{record.bankName}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '11px' }}>
                {record.accountBankNumber}
              </Text>
            </div>
          </Space>
        ),
      },
      {
        title: 'Gói',
        dataIndex: 'packageName',
        key: 'packageName',
        render: (text) => (
          <Tag color="blue" style={{ borderRadius: 4, fontSize: '12px' }}>
            {text}
          </Tag>
        ),
      },
      {
        title: 'Số tiền',
        dataIndex: 'amount',
        key: 'amount',
        align: 'right',
        render: (amount) => (
          <Text strong style={{ color: '#F87218', fontSize: '13px' }}>
            {formatVND(amount)}
          </Text>
        ),
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        align: 'center',
        render: (status) => (
          <Tag
            color={paymentStatusColors[status] || 'default'}
            style={{ borderRadius: 12, padding: '0 12px', fontSize: '11px' }}
          >
            {statusPayment[status] || status}
          </Tag>
        ),
      },
      {
        title: 'Thời gian tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (date) => (
          <Text style={{ fontSize: '12px', color: '#595959' }}>{formatDate(date)}</Text>
        ),
      },
    ],
    [filters.page, filters.size]
  )

  const extraFilters = (
    <Space wrap>
      {/* Lọc trạng thái thanh toán */}
      <Select
        value={filters.status}
        onChange={(val) => handleFilterChange('status', val)}
        style={{ width: 170 }}
        placeholder="Trạng thái"
        suffixIcon={<FilterOutlined />}
      >
        <Option value="all">Tất cả trạng thái</Option>
        <Option value="Paid">{statusPayment.Paid}</Option>
        <Option value="Pending">{statusPayment.Pending}</Option>
      </Select>

      {/* Lọc có biên lai / chưa có biên lai */}
      <Select
        value={filters.hasTransaction}
        onChange={(val) => handleFilterChange('hasTransaction', val)}
        style={{ width: 190 }}
        placeholder="Biên lai"
        suffixIcon={<FilterOutlined />}
      >
        <Option value="all">Tất cả</Option>
        <Option value="true">Có biên lai (đã tạo phiên)</Option>
        <Option value="false">Chưa có biên lai</Option>
      </Select>

      {/* Lọc khoảng thời gian */}
      <RangePicker
        onChange={(dates) => {
          setFilters((prev) => ({
            ...prev,
            fromDate: dates ? dates[0].format('YYYY-MM-DD') : undefined,
            toDate: dates ? dates[1].format('YYYY-MM-DD') : undefined,
            page: 1,
          }))
        }}
        placeholder={['Từ ngày', 'Đến ngày']}
        style={{ borderRadius: '1rem' }}
      />

      {/* Tổng doanh thu trang hiện tại */}
      <div
        style={{
          marginLeft: 8,
          padding: '4px 12px',
          background: '#fff7e6',
          border: '1px solid #ffe7ba',
          borderRadius: '1rem',
        }}
      >
        <Text style={{ fontSize: 13 }}>
          Tổng (trang):{' '}
          <Text strong style={{ color: '#f5222d' }}>
            {formatVND(totalRevenue)}
          </Text>
        </Text>
      </div>
    </Space>
  )

  return (
    <ManagementLayout
      searchPlaceholder="Tìm kiếm người dùng, mã thanh toán..."
      searchValue={filters.search}
      onSearchChange={(val) => setFilters((prev) => ({ ...prev, search: val }))}
      onSearchSubmit={() => handleFilterChange('search', filters.search)}
      extraFilters={extraFilters}
      tableProps={{
        columns,
        dataSource: payments,
        rowKey: 'paymentId',
        loading,
        pagination: {
          current: filters.page,
          pageSize: filters.size,
          total: totalCount,
          onChange: handlePaginationChange,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total) => `Tổng ${total} bản ghi`,
        },
      }}
    />
  )
}

export default PaymentManagement
