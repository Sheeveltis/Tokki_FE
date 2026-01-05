'use client'

import React, { useState, useEffect } from 'react'
import { Card, Table, Space, Typography, Tag, Select, DatePicker, Input } from 'antd'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { statusPayment } from '../../../../string.js'
import { paymentStatusColors, paymentMethodLabels } from '../../mockData.js'
import { apiClient } from '../../../../provider/api/client'
import { ENDPOINTS } from '../../../../provider/api/endpoints'
import { EyeOutlined } from '@ant-design/icons'
import { useRouter } from 'solito/navigation'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select
const { Search } = Input

export function PaymentManagement() {
  const router = useRouter()
  const [payments, setPayments] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true)

        const params = {
          search: search || undefined,
          status: statusFilter !== 'all'
            ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)
            : undefined,
          fromDate:
            dateRange && dateRange.length === 2 && dateRange[0]
              ? dateRange[0].format('YYYY-MM-DD')
              : undefined,
          toDate:
            dateRange && dateRange.length === 2 && dateRange[1]
              ? dateRange[1].format('YYYY-MM-DD')
              : undefined,
          page: pagination.current,
          pageSize: pagination.pageSize,
        }

        const response = await apiClient.get(ENDPOINTS.STATISTICS.TRANSACTIONS, {
          params,
        })

        const apiData = response?.data?.data

        const items = apiData?.items || []

        const mapped = items.map((item) => ({
          transactionId: item.transactionId,
          userEmail: item.userEmail,
          userName: item.fullName,
          packageName: item.packageName,
          amount: item.amount,
          paymentMethod: (item.paymentMethod || '').toLowerCase(),
          status: (item.status || '').toLowerCase(),
          createdAt: item.paymentDate,
        }))

        setPayments(mapped)

        setPagination((prev) => ({
          ...prev,
          current: apiData?.pageNumber || prev.current,
          pageSize: apiData?.pageSize || prev.pageSize,
          total: apiData?.totalCount || prev.total,
        }))
      } catch (error) {
        console.error('Failed to fetch transactions', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [statusFilter, dateRange, search, pagination.current, pagination.pageSize])

  const handleTableChange = (newPagination) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }))
  }

  const totalRevenue = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0)

  const columns = [
    {
      title: 'Mã giao dịch',
      dataIndex: 'transactionId',
      key: 'transactionId',
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: 'Người dùng',
      key: 'user',
      render: (_, record) => (
        <div>
          <Text strong>{record.userName || record.fullName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.userEmail}
          </Text>
        </div>
      ),
    },
    {
      title: 'Gói',
      dataIndex: 'packageName',
      key: 'packageName',
      render: (text) => <Tag color="blue" style={{ fontSize: '12px', padding: '2px 8px' }}>{text}</Tag>,
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Text strong style={{ color: '#F87218' }}>
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
        <Tag color={paymentStatusColors[status]} style={{ fontSize: '12px', padding: '2px 8px' }}>
          {statusPayment[status] || status}
        </Tag>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => <Text style={{ fontSize: 12 }}>{date}</Text>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space>
          <div
            onClick={() => {
              // TODO: Navigate to payment detail
              console.log('View payment detail:', record.id)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 4,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0'
              e.currentTarget.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <EyeOutlined style={{ fontSize: 18, color: '#111', transition: 'color 0.2s ease' }} />
          </div>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            Quản lý thanh toán
          </Title>
          <Text type="secondary">Theo dõi và quản lý các giao dịch thanh toán của người dùng</Text>
        </div>

        {/* Filters và thống kê */}
        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Space wrap>
              <Search
                placeholder="Tìm theo tên, email, mã giao dịch..."
                allowClear
                style={{ width: 300 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 150 }}
                placeholder="Trạng thái"
              >
                <Option value="all">Tất cả</Option>
                <Option value="Paid">{statusPayment.completed}</Option>
                <Option value="Pending">{statusPayment.pending}</Option>
                <Option value="failed">{statusPayment.failed}</Option>
                <Option value="cancelled">{statusPayment.cancelled}</Option>
              </Select>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                placeholder={['Từ ngày', 'Đến ngày']}
              />
            </Space>
            <div style={{ padding: '12px', backgroundColor: '#f5f5f5', borderRadius: 4 }}>
              <Text strong>
                Tổng doanh thu từ các giao dịch đã hoàn thành:{' '}
                <Text style={{ color: '#F87218', fontSize: 18 }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)}
                </Text>
              </Text>
            </div>
          </Space>
        </Card>

        {/* Bảng thanh toán */}
        <Card>
          <Table
            columns={columns}
            dataSource={payments}
            rowKey="transactionId"
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
            loading={loading}
          />
        </Card>
      </Space>
    </div>
  )
}

export default PaymentManagement

