'use client'

import React, { useState } from 'react'
import { Card, Space, Typography, DatePicker, Select, Button, Row, Col, Statistic, Table } from 'antd'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { DownloadOutlined, FilePdfOutlined } from '@ant-design/icons'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { mockRevenueData, mockPackageRevenueData } from '../../mockData.js'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

const reportColumns = [
  {
    title: 'Tháng',
    dataIndex: 'month',
    key: 'month',
  },
  {
    title: 'Doanh thu',
    dataIndex: 'revenue',
    key: 'revenue',
    render: (revenue) => (
      <Text strong style={{ color: '#F87218' }}>
        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(revenue)}
      </Text>
    ),
  },
  {
    title: 'Số đăng ký',
    dataIndex: 'subscriptions',
    key: 'subscriptions',
  },
]

export function RevenueReport() {
  const [dateRange, setDateRange] = useState(null)
  const [reportType, setReportType] = useState('monthly')

  const totalRevenue = mockRevenueData.reduce((sum, item) => sum + item.revenue, 0)
  const totalSubscriptions = mockRevenueData.reduce((sum, item) => sum + item.subscriptions, 0)
  const averageRevenue = Math.round(totalRevenue / mockRevenueData.length)

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting report...')
  }

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={3} style={{ marginBottom: 4 }}>
              Báo cáo và Thống kê Doanh thu
            </Title>
            <Text type="secondary">Theo dõi hiệu quả kinh doanh và xuất báo cáo</Text>
          </div>
          <Space>
            <Select
              value={reportType}
              onChange={setReportType}
              style={{ width: 150 }}
              size="large"
            >
              <Option value="monthly">Theo tháng</Option>
              <Option value="quarterly">Theo quý</Option>
              <Option value="yearly">Theo năm</Option>
            </Select>
            <RangePicker size="large" value={dateRange} onChange={setDateRange} />
            <ButtonV2
              title="Xuất báo cáo"
              color="#F1BE4B"
              onPress={handleExport}
              style={{ minWidth: 140, paddingVertical: 10 }}
              textStyle={{ fontSize: 14 }}
            />
          </Space>
        </div>

        {/* Thống kê tổng quan */}
        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Tổng doanh thu"
                value={totalRevenue}
                precision={0}
                valueStyle={{ color: '#F87218' }}
                prefix="₫"
                formatter={(value) => new Intl.NumberFormat('vi-VN').format(value)}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Tổng đăng ký"
                value={totalSubscriptions}
                valueStyle={{ color: '#3f8600' }}
                suffix="gói"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Doanh thu trung bình"
                value={averageRevenue}
                precision={0}
                valueStyle={{ color: '#1890ff' }}
                prefix="₫"
                formatter={(value) => new Intl.NumberFormat('vi-VN').format(value)}
              />
            </Card>
          </Col>
        </Row>

        {/* Biểu đồ doanh thu */}
        <Card title="Biểu đồ doanh thu theo tháng">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#F87218" strokeWidth={2} name="Doanh thu" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Biểu đồ doanh thu theo gói */}
        <Card title="Doanh thu theo gói thành viên">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockPackageRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="package" />
              <YAxis />
              <Tooltip
                formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#F87218" name="Doanh thu" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Bảng báo cáo chi tiết */}
        <Card title="Báo cáo doanh thu cơ bản">
          <Table
            columns={reportColumns}
            dataSource={mockRevenueData}
            rowKey="month"
            pagination={{ pageSize: 6 }}
          />
        </Card>
      </Space>
    </div>
  )
}

export default RevenueReport

