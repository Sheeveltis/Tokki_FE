'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Space, Typography, Tag, Select, DatePicker, Tooltip } from 'antd'
import { EyeOutlined, FilterOutlined } from '@ant-design/icons'
import { useRouter } from 'solito/navigation'
import ManagementLayout from '../../../../components/layout/management-layout.jsx'
import { useManagementFilters } from '../../back-office/hooks/use-management-filters.js'
import { apiClient } from '../../../provider/api/client.js'
import { ENDPOINTS } from '../../../provider/api/endpoints.js'
import { statusPayment } from '../../../string.js'
import { paymentStatusColors, paymentMethodLabels } from '../../admin/mockData.js'

const { Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

export function PaymentManagement() {
  const router = useRouter()
  const [filters, setFilters] = useManagementFilters({
    search: '',
    status: 'all',
    page: 1,
    size: 10,
    fromDate: undefined,
    toDate: undefined,
  })

  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  // Memoized total revenue for display
  const totalRevenue = useMemo(() => {
    return payments
      .filter((p) => p.status === 'completed' || p.status === 'paid')
      .reduce((sum, p) => sum + (p.amount || 0), 0)
  }, [payments])

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true)

        const params = {
          search: filters.search || undefined,
          status: filters.status !== 'all'
            ? filters.status.charAt(0).toUpperCase() + filters.status.slice(1)
            : undefined,
          fromDate: filters.fromDate,
          toDate: filters.toDate,
          page: filters.page,
          pageSize: filters.size,
        }

        const response = await apiClient.get(ENDPOINTS.STATISTICS.TRANSACTIONS, {
          params,
        })

        const apiData = response?.data?.data
        const items = apiData?.items || []

        const mapped = items.map((item) => ({
          ...item,
          paymentMethod: (item.paymentMethod || '').toLowerCase(),
          status: (item.status || '').toLowerCase(),
        }))

        setPayments(mapped)
        setTotalCount(apiData?.totalCount || 0)
      } catch (error) {
        console.error('Failed to fetch transactions', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [filters])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePaginationChange = (newPage, newSize) => {
    setFilters((prev) => ({
      ...prev,
      page: prev.size !== newSize ? 1 : newPage,
      size: newSize,
    }))
  }

  const columns = useMemo(() => [
    {
      title: 'STT',
      key: 'stt',
      align: 'center',
      width: 60,
      render: (_, __, index) => (filters.page - 1) * filters.size + index + 1,
    },
    {
      title: 'Mã giao dịch',
      dataIndex: 'transactionId',
      key: 'transactionId',
      width: 150,
      render: (text) => <Text code style={{ fontSize: '13px' }}>{text}</Text>,
    },
    {
      title: 'Người dùng',
      key: 'user',
      width: 200,
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: '13px' }}>{record.fullName || record.userName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.userEmail}
          </Text>
        </div>
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
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
        </Text>
      ),
    },
    {
      title: 'Phương thức',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => paymentMethodLabels[method] || method,
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
      title: 'Thời gian',
      dataIndex: 'paymentDate',
      key: 'createdAt',
      render: (date) => <Text style={{ fontSize: '12px', color: '#595959' }}>{date}</Text>,
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <EyeOutlined
            style={{ fontSize: 18, color: '#1890ff', cursor: 'pointer' }}
            onClick={() => console.log('View payment detail:', record.transactionId)}
          />
        </Tooltip>
      ),
    },
  ], [filters.page, filters.size])

  const extraFilters = (
    <Space wrap>
      <Select
        value={filters.status}
        onChange={(val) => handleFilterChange('status', val)}
        style={{ width: 160, borderRadius: '1rem' }}
        placeholder="Trạng thái"
        suffixIcon={<FilterOutlined />}
      >
        <Option value="all">Tất cả trạng thái</Option>
        <Option value="Paid">{statusPayment.completed}</Option>
        <Option value="Pending">{statusPayment.pending}</Option>
        <Option value="failed">{statusPayment.failed}</Option>
        <Option value="cancelled">{statusPayment.cancelled}</Option>
      </Select>
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
      <div style={{ marginLeft: 8, padding: '4px 12px', background: '#fff7e6', border: '1px solid #ffe7ba', borderRadius: '1rem' }}>
        <Text style={{ fontSize: 13 }}>
          Tổng doanh thu: <Text strong style={{ color: '#f5222d' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)}</Text>
        </Text>
      </div>
    </Space>
  )

  return (
    <ManagementLayout
      searchPlaceholder="Tìm kiếm người dùng, mã giao dịch..."
      searchValue={filters.search}
      onSearchChange={(val) => setFilters((prev) => ({ ...prev, search: val }))}
      onSearchSubmit={() => handleFilterChange('search', filters.search)}
      extraFilters={extraFilters}
      tableProps={{
        columns,
        dataSource: payments,
        rowKey: "transactionId",
        loading: loading,
        pagination: {
          current: filters.page,
          pageSize: filters.size,
          total: totalCount,
          onChange: handlePaginationChange,
        },
      }}
    />
  )
}

export default PaymentManagement


