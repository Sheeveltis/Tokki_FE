'use client'

import React, { useState } from 'react'
import { Card, List, Avatar, Tag, Space, Typography, Input, Select, Button } from 'antd'
import { UserOutlined, MessageOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons'
import { statusFeedback } from '../../../string.js'
import { feedbackStatusColors, feedbackCategoryLabels } from '../../admin/mockData.js'
import { updateFeedbackStatus } from '../../back-office/api/admin-index.js'
import { useFeedbacksQuery } from '../../back-office/api/useAdminQueries.js'
import { ButtonV2 } from '../../../../components/buttonV2.jsx'

const { Title, Text } = Typography
const { Search } = Input
const { Option } = Select

export function FeedbackInbox() {
  const { data: feedbacks = [], isLoading } = useFeedbacksQuery()
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchesSearch =
      fb.subject.toLowerCase().includes(search.toLowerCase()) ||
      fb.content.toLowerCase().includes(search.toLowerCase()) ||
      fb.userName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || fb.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || fb.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleStatusChange = async (feedbackId, newStatus) => {
    await updateFeedbackStatus(feedbackId, newStatus)
    setFeedbacks(
      feedbacks.map((fb) => (fb.id === feedbackId ? { ...fb, status: newStatus } : fb)),
    )
    if (selectedFeedback?.id === feedbackId) {
      setSelectedFeedback({ ...selectedFeedback, status: newStatus })
    }
  }

  return (
    <div style={{ padding: 24, display: 'flex', gap: 16, height: 'calc(100vh - 200px)' }}>
      {/* Danh sách feedback */}
      <Card
        style={{ width: 400, flexShrink: 0 }}
        title={
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Hòm thư feedback
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {filteredFeedbacks.length} phản hồi
            </Text>
          </div>
        }
      >
        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }} size="small">
          <Search
            placeholder="Tìm feedback..."
            allowClear
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Space>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              size="small"
            >
              <Option value="all">Tất cả</Option>
              <Option value="new">Mới</Option>
              <Option value="in-progress">Đang xử lý</Option>
              <Option value="resolved">Đã giải quyết</Option>
            </Select>
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: 120 }}
              size="small"
            >
              <Option value="all">Tất cả</Option>
              <Option value="ui">Giao diện</Option>
              <Option value="bug">Lỗi</Option>
              <Option value="feature">Tính năng</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Space>
        </Space>
        <List
          dataSource={filteredFeedbacks}
          style={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}
          loading={isLoading}
          renderItem={(feedback) => (
            <List.Item
              style={{
                cursor: 'pointer',
                backgroundColor: selectedFeedback?.id === feedback.id ? '#f0f0f0' : 'transparent',
                padding: '12px',
                borderRadius: 8,
                marginBottom: 8,
                borderLeft: selectedFeedback?.id === feedback.id ? '3px solid #F87218' : 'none',
              }}
              onClick={() => setSelectedFeedback(feedback)}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<MessageOutlined />} />}
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Text strong style={{ fontSize: 14 }}>
                      {feedback.subject}
                    </Text>
                    <Tag color={feedbackStatusColors[feedback.status]} style={{ marginLeft: 8, fontSize: '12px', padding: '2px 8px' }}>
                      {statusFeedback[feedback.status] || feedback.status}
                    </Tag>
                  </div>
                }
                description={
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {feedback.userName} • {feedback.createdAt}
                    </Text>
                    <br />
                    <Tag size="small" style={{ marginTop: 4, fontSize: '12px', padding: '2px 8px' }}>
                      {feedbackCategoryLabels[feedback.category]}
                    </Tag>
                    <Text
                      ellipsis
                      style={{ display: 'block', marginTop: 4, fontSize: 12, color: '#666' }}
                    >
                      {feedback.content}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Chi tiết feedback */}
      <Card
        style={{ flex: 1 }}
        title={
          selectedFeedback ? (
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {selectedFeedback.subject}
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {selectedFeedback.userName} ({selectedFeedback.userEmail})
              </Text>
            </div>
          ) : (
            <Title level={4} style={{ margin: 0 }}>
              Chọn feedback để xem chi tiết
            </Title>
          )
        }
        extra={
          selectedFeedback && (
            <Space>
              <Select
                value={selectedFeedback.status}
                onChange={(value) => handleStatusChange(selectedFeedback.id, value)}
                style={{ width: 150 }}
              >
                <Option value="new">{statusFeedback.new}</Option>
                <Option value="in-progress">{statusFeedback['in-progress']}</Option>
                <Option value="resolved">{statusFeedback.resolved}</Option>
                <Option value="closed">{statusFeedback.closed}</Option>
              </Select>
            </Space>
          )
        }
      >
        {selectedFeedback ? (
          <div style={{ height: 'calc(100vh - 350px)', overflowY: 'auto' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text type="secondary">Người gửi</Text>
                <div style={{ marginTop: 4 }}>
                  <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
                  <Text strong>{selectedFeedback.userName}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {selectedFeedback.userEmail}
                  </Text>
                </div>
              </div>

              <div>
                <Text type="secondary">Thời gian</Text>
                <div style={{ marginTop: 4 }}>
                  <Text>{selectedFeedback.createdAt}</Text>
                </div>
              </div>

              <div>
                <Text type="secondary">Phân loại</Text>
                <div style={{ marginTop: 4 }}>
                  <Tag style={{ fontSize: '12px', padding: '2px 8px' }}>{feedbackCategoryLabels[selectedFeedback.category]}</Tag>
                </div>
              </div>

              <div>
                <Text type="secondary">Nội dung</Text>
                <Card
                  style={{
                    marginTop: 8,
                    backgroundColor: '#f9f9f9',
                    border: '1px solid #e8e8e8',
                  }}
                >
                  <Text style={{ whiteSpace: 'pre-wrap' }}>{selectedFeedback.content}</Text>
                </Card>
              </div>

              <div>
                <Space>
                  <ButtonV2
                    title="Trả lời"
                    color="#F1BE4B"
                    onPress={() => {
                      // TODO: Implement reply functionality
                      console.log('Reply to feedback')
                    }}
                    style={{ minWidth: 100, paddingVertical: 10 }}
                    textStyle={{ fontSize: 14 }}
                  />
                  <ButtonV2
                    title="Đánh dấu đã đọc"
                    color="mint"
                    onPress={() => {
                      handleStatusChange(selectedFeedback.id, 'resolved')
                    }}
                    style={{ minWidth: 140, paddingVertical: 10 }}
                    textStyle={{ fontSize: 14 }}
                  />
                </Space>
              </div>
            </Space>
          </div>
        ) : (
          <div
            style={{
              height: 'calc(100vh - 350px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#999',
            }}
          >
            <Text type="secondary">Vui lòng chọn feedback từ danh sách bên trái</Text>
          </div>
        )}
      </Card>
    </div>
  )
}

export default FeedbackInbox

