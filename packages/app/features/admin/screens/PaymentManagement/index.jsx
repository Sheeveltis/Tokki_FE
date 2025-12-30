'use client'

import React, { useState, useMemo } from 'react'
import { Card, Table, Space, Typography, Tag, Select, DatePicker, Input, Button } from 'antd'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { statusPayment } from '../../../../string.js'
import { paymentStatusColors, paymentMethodLabels } from '../../mockData.js'
import { approvePayment, rejectPayment } from '../../api'
import { usePaymentsQuery } from '../../api/useAdminQueries'
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useRouter } from 'solito/navigation'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select
const { Search } = Input

export function PaymentManagement() {
  const router = useRouter()
  const { data: payments = [], isLoading } = usePaymentsQuery()
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState(null)
  const [search, setSearch] = useState('')

  const filteredPayments = useMemo(() => {
    let filtered = payments

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter)
    }

    // Filter by date range
    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange
      filtered = filtered.filter((p) => {
        const paymentDate = new Date(p.createdAt)
        return paymentDate >= start && paymentDate <= end
      })
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.userName.toLowerCase().includes(searchLower) ||
          p.userEmail.toLowerCase().includes(searchLower) ||
          p.transactionId.toLowerCase().includes(searchLower) ||
          p.packageName.toLowerCase().includes(searchLower),
      )
    }

    return filtered
  }, [payments, statusFilter, dateRange, search])

  const handleApprove = async (id) => {
    const result = await approvePayment(id)
    setPayments(
      payments.map((p) =>
        p.id === id
          ? { ...p, status: result.status, completedAt: result.completedAt }
          : p,
      ),
    )
  }

  const handleReject = async (id) => {
    const result = await rejectPayment(id)
    setPayments(payments.map((p) => (p.id === id ? { ...p, status: result.status } : p)))
  }

  const totalRevenue = filteredPayments
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
          <Text strong>{record.userName}</Text>
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
          {record.status === 'pending' && (
            <>
              <Button
                type="text"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record.id)}
                style={{ color: '#52c41a' }}
              >
                Duyệt
              </Button>
              <Button
                type="text"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleReject(record.id)}
              >
                Từ chối
              </Button>
            </>
          )}
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
            }}
          >
            <EyeOutlined style={{ fontSize: 18, color: '#111' }} />
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
                <Option value="completed">{statusPayment.completed}</Option>
                <Option value="pending">{statusPayment.pending}</Option>
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
            dataSource={filteredPayments}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1200 }}
            loading={isLoading}
          />
        </Card>
      </Space>
    </div>
  )
}

export default PaymentManagement

