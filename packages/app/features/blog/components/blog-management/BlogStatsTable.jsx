'use client'
import React from 'react'
import { Card, Space, Statistic, Row, Col } from 'antd'
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'
import ManagementTable from '../../../../../components/ManagementTable'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'

export function BlogStatsTable({
  summary,
  columns,
  data,
  loading,
  pageNumber,
  totalPages,
  onPageChange,
}) {
  return (
    <Card>
      <Row gutter={16} style={{ marginBottom: 8 }}>
        <Col xs={24} sm={8}>
          <Card size="small" bordered>
            <Statistic title="Tổng bài viết" value={summary.totalBlogs} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" bordered>
            <Statistic title="Đã đăng" value={summary.totalPublished} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" bordered>
            <Statistic title="Tổng lượt xem" value={summary.totalViews} />
          </Card>
        </Col>
      </Row>
      <ManagementTable
        columns={columns}
        dataSource={data}
        loading={loading}
      />
    </Card>
  )
}

export default BlogStatsTable

