'use client'

import React, { useEffect, useState } from 'react'
import { Card, Space, Typography, Row, Col, Statistic, Table, Tag } from 'antd'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { fetchAIStatistics, handleApiError } from '../../api'
import { message } from 'antd'

const { Title, Text } = Typography

const COLORS = ['#F87218', '#F1BE4B', '#1890ff', '#52c41a', '#722ed1']

const usageByFeatureColumns = [
  {
    title: 'Tính năng',
    dataIndex: 'feature',
    key: 'feature',
  },
  {
    title: 'Số lượt sử dụng',
    dataIndex: 'count',
    key: 'count',
    render: (count) => new Intl.NumberFormat('vi-VN').format(count),
  },
  {
    title: 'Tỷ lệ',
    dataIndex: 'percentage',
    key: 'percentage',
    render: (percentage) => `${percentage}%`,
  },
]

const accuracyColumns = [
  {
    title: 'Tính năng',
    dataIndex: 'feature',
    key: 'feature',
  },
  {
    title: 'Độ chính xác',
    dataIndex: 'accuracy',
    key: 'accuracy',
    render: (accuracy) => (
      <Tag color={accuracy >= 95 ? 'green' : accuracy >= 90 ? 'orange' : 'red'}>
        {accuracy}%
      </Tag>
    ),
  },
  {
    title: 'Tổng truy vấn',
    dataIndex: 'totalQueries',
    key: 'totalQueries',
    render: (count) => new Intl.NumberFormat('vi-VN').format(count),
  },
]

const topUsersColumns = [
  {
    title: 'Người dùng',
    dataIndex: 'userName',
    key: 'userName',
  },
  {
    title: 'Số truy vấn',
    dataIndex: 'queries',
    key: 'queries',
    render: (queries) => new Intl.NumberFormat('vi-VN').format(queries),
  },
  {
    title: 'Lần sử dụng cuối',
    dataIndex: 'lastUsed',
    key: 'lastUsed',
  },
]

const costColumns = [
  {
    title: 'Tháng',
    dataIndex: 'month',
    key: 'month',
  },
  {
    title: 'Tokens sử dụng',
    dataIndex: 'tokens',
    key: 'tokens',
    render: (tokens) => new Intl.NumberFormat('vi-VN').format(tokens),
  },
  {
    title: 'Chi phí (VND)',
    dataIndex: 'cost',
    key: 'cost',
    render: (cost) => (
      <Text strong style={{ color: '#F87218' }}>
        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cost)}
      </Text>
    ),
  },
  {
    title: 'Số truy vấn',
    dataIndex: 'queries',
    key: 'queries',
    render: (queries) => new Intl.NumberFormat('vi-VN').format(queries),
  },
]

export function AIStatisticsReport() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const result = await fetchAIStatistics()
        setData(result)
      } catch (error) {
        message.error(handleApiError(error, 'Không thể tải thống kê A.I'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading || !data) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Text>Đang tải dữ liệu...</Text>
      </div>
    )
  }

  const { overview, usageByFeature, usageByDay, accuracyByFeature, topUsers, costAnalysis } = data

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            Báo cáo thống kê dữ liệu A.I
          </Title>
          <Text type="secondary">Theo dõi hiệu suất và sử dụng các tính năng A.I</Text>
        </div>

        {/* Thống kê tổng quan */}
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng truy vấn"
                value={overview.totalQueries}
                valueStyle={{ color: '#1890ff' }}
                formatter={(value) => new Intl.NumberFormat('vi-VN').format(value)}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Người dùng sử dụng"
                value={overview.totalUsers}
                valueStyle={{ color: '#52c41a' }}
                suffix="người"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Thời gian phản hồi TB"
                value={overview.averageResponseTime}
                valueStyle={{ color: '#F87218' }}
                suffix="giây"
                precision={1}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Độ chính xác"
                value={overview.accuracyRate}
                valueStyle={{ color: '#52c41a' }}
                suffix="%"
                precision={1}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Card>
              <Statistic
                title="Tokens đã sử dụng"
                value={overview.totalTokensUsed}
                valueStyle={{ color: '#722ed1' }}
                formatter={(value) => new Intl.NumberFormat('vi-VN').format(value)}
              />
            </Card>
          </Col>
        </Row>

        {/* Biểu đồ sử dụng theo ngày */}
        <Card title="Xu hướng sử dụng theo ngày">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={usageByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="queries"
                stroke="#1890ff"
                strokeWidth={2}
                name="Số truy vấn"
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#52c41a"
                strokeWidth={2}
                name="Số người dùng"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Biểu đồ sử dụng theo tính năng */}
        <Row gutter={16}>
          <Col span={12}>
            <Card title="Sử dụng theo tính năng">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={usageByFeature}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ feature, percentage }) => `${feature}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {usageByFeature.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Bảng sử dụng theo tính năng">
              <Table
                columns={usageByFeatureColumns}
                dataSource={usageByFeature}
                rowKey="feature"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>

        {/* Biểu đồ độ chính xác */}
        <Card title="Độ chính xác theo tính năng">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={accuracyByFeature}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="feature" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Bar dataKey="accuracy" fill="#52c41a" name="Độ chính xác (%)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Bảng độ chính xác */}
        <Card title="Chi tiết độ chính xác">
          <Table
            columns={accuracyColumns}
            dataSource={accuracyByFeature}
            rowKey="feature"
            pagination={false}
          />
        </Card>

        {/* Top người dùng */}
        <Card title="Top người dùng sử dụng A.I nhiều nhất">
          <Table
            columns={topUsersColumns}
            dataSource={topUsers}
            rowKey="userId"
            pagination={false}
          />
        </Card>

        {/* Phân tích chi phí */}
        <Card title="Phân tích chi phí theo tháng">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'cost') {
                    return new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(value)
                  }
                  return new Intl.NumberFormat('vi-VN').format(value)
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="tokens" fill="#722ed1" name="Tokens" />
              <Bar yAxisId="right" dataKey="queries" fill="#1890ff" name="Số truy vấn" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Bảng chi phí */}
        <Card title="Bảng chi phí chi tiết">
          <Table
            columns={costColumns}
            dataSource={costAnalysis}
            rowKey="month"
            pagination={false}
          />
        </Card>
      </Space>
    </div>
  )
}

export default AIStatisticsReport

