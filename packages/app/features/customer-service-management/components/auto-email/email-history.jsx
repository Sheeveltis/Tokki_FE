'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, Typography, Table, Tag, Space, Select, DatePicker } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { fetchEmailCampaigns } from '../../api/manual-email'

const { Text } = Typography
const { RangePicker } = DatePicker

/**
 * EmailHistory Component
 * Hiển thị lịch sử gửi email
 */
export function EmailHistory() {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [targetGroup, setTargetGroup] = useState(undefined)
  const [createdRange, setCreatedRange] = useState(null)

  const targetGroupOptions = useMemo(
    () => [
      { value: 0, label: 'Gửi riêng' },
      { value: 1, label: 'Gửi cho toàn bộ người dùng' },
      { value: 2, label: 'Gửi cho người dùng đang trả phí' },
      { value: 3, label: 'Gửi cho người dùng miễn phí' },
    ],
    [],
  )

  const loadData = async () => {
    setLoading(true)
    try {
      const params = {
        PageNumber: pageNumber,
        PageSize: pageSize,
        TargetGroup: typeof targetGroup === 'number' ? targetGroup : undefined,
        CreatedFrom: createdRange?.[0]?.toISOString?.(),
        CreatedTo: createdRange?.[1]?.toISOString?.(),
      }

      const res = await fetchEmailCampaigns(params)
      const data = res?.data

      const nextItems = Array.isArray(data) ? data : data?.items || []
      const nextTotal =
        typeof data?.total === 'number'
          ? data.total
          : typeof data?.totalItems === 'number'
            ? data.totalItems
            : typeof data?.count === 'number'
              ? data.count
              : Array.isArray(nextItems)
                ? nextItems.length
                : 0

      setItems(Array.isArray(nextItems) ? nextItems : [])
      setTotal(nextTotal)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, pageSize, targetGroup, createdRange])

  const renderStatusTag = (value) => {
    // Nếu backend trả string status (legacy), map theo string; nếu trả int, map theo enum user gửi
    const stringMap = {
      success: { color: 'green', icon: <CheckCircleOutlined />, text: 'Thành công' },
      failed: { color: 'red', icon: <CloseCircleOutlined />, text: 'Thất bại' },
      pending: { color: 'orange', icon: <ClockCircleOutlined />, text: 'Đang chờ' },
    }

    if (typeof value === 'string') {
      const statusInfo = stringMap[value] || { color: 'default', text: value || '-' }
      return (
        <Tag color={statusInfo.color} icon={statusInfo.icon}>
          {statusInfo.text}
        </Tag>
      )
    }

    const enumMap = {
      0: { color: 'default', icon: <ClockCircleOutlined />, text: 'Nháp' },
      1: { color: 'green', icon: <CheckCircleOutlined />, text: 'Đã xuất bản' },
      2: { color: 'red', icon: <CloseCircleOutlined />, text: 'Đã xoá' },
      3: { color: 'orange', icon: <ClockCircleOutlined />, text: 'Chờ phê duyệt' },
      4: { color: 'red', icon: <CloseCircleOutlined />, text: 'Từ chối' },
    }

    const statusInfo = enumMap[value] || { color: 'default', text: typeof value === 'number' ? String(value) : '-' }
    return (
      <Tag color={statusInfo.color} icon={statusInfo.icon}>
        {statusInfo.text}
      </Tag>
    )
  }

  const renderTargetGroup = (value) => {
    const map = {
      0: 'Không gửi cho ai (Gửi riêng)',
      1: 'Gửi cho toàn bộ người dùng',
      2: 'Gửi cho người dùng đang trả phí',
      3: 'Gửi cho người dùng miễn phí',
    }
    if (typeof value === 'number') return map[value] || String(value)
    return value || '-'
  }

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
    },
    {
      title: 'Người nhận',
      dataIndex: 'specificEmails',
      key: 'recipients',
      render: (_, record) => {
        const tg = record?.targetGroup
        const emails = record?.specificEmails
        if (typeof tg === 'number' && tg === 0) return 'Gửi riêng'
        if (typeof tg === 'number' && tg !== 0) return renderTargetGroup(tg)
        if (Array.isArray(emails)) return emails.length > 0 ? `${emails.length} email` : '-'
        return '-'
      },
    },
    {
      title: 'Nội dung',
      dataIndex: 'body',
      key: 'body',
      ellipsis: { showTitle: true },
      render: (body) => (body ? <Text ellipsis={{ tooltip: body }}>{body}</Text> : '-'),
    },
    {
      title: 'Tạo lúc',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => (createdAt ? new Date(createdAt).toLocaleString('vi-VN') : '-'),
    },
  ]

  if (!items || items.length === 0) {
    return (
      <Card title="Lịch sử gửi email">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space wrap>
            <div style={{ minWidth: 260 }}>
              <div style={{ marginBottom: 6, color: '#666' }}>Target Group</div>
              <Select
                allowClear
                style={{ width: 260 }}
                placeholder="Select group"
                value={targetGroup}
                onChange={(v) => {
                  setPageNumber(1)
                  setTargetGroup(v)
                }}
                options={targetGroupOptions}
              />
            </div>
            <div>
              <div style={{ marginBottom: 6, color: '#666' }}>Created Date</div>
              <RangePicker
                showTime
                value={createdRange}
                onChange={(v) => {
                  setPageNumber(1)
                  setCreatedRange(v)
                }}
              />
            </div>
          </Space>

          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            <Text type="secondary">{loading ? 'Đang tải...' : 'Chưa có lịch sử gửi email'}</Text>
          </div>
        </Space>
      </Card>
    )
  }

  return (
    <Card title="Lịch sử gửi email">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Space wrap>
          <div style={{ minWidth: 260 }}>
            <div style={{ marginBottom: 6, color: '#666' }}>Target Group</div>
            <Select
              allowClear
              style={{ width: 260 }}
              placeholder="Select group"
              value={targetGroup}
              onChange={(v) => {
                setPageNumber(1)
                setTargetGroup(v)
              }}
              options={targetGroupOptions}
            />
          </div>
          <div>
            <div style={{ marginBottom: 6, color: '#666' }}>Created Date</div>
            <RangePicker
              showTime
              value={createdRange}
              onChange={(v) => {
                setPageNumber(1)
                setCreatedRange(v)
              }}
            />
          </div>
        </Space>

      <Table
        columns={columns}
        dataSource={items}
        loading={loading}
        rowKey={(r) => r?.jobId || r?.id || `${r?.subject || 'row'}-${r?.createdAt || ''}`}
        pagination={{
          current: pageNumber,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `Tổng ${t} email`,
          onChange: (nextPage, nextSize) => {
            setPageNumber(nextPage)
            setPageSize(nextSize)
          },
        }}
      />
      </Space>
    </Card>
  )
}

