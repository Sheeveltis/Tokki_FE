'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, Typography, Table, Tag, Space, Select, Input } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { fetchEmailTemplates } from '../../api/auto-email'

const { Text } = Typography

/**
 * EmailHistory Component for Auto Email
 * Hiển thị lịch sử email template tự động
 */
export function EmailHistory() {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [type, setType] = useState(undefined)
  const [targetGroup, setTargetGroup] = useState(undefined)
  const [searchName, setSearchName] = useState('')
  const [searchSubject, setSearchSubject] = useState('')

  // EmailTemplateType enum: 1=OfflineReminder, 2=VipExpiringReminder
  const typeOptions = useMemo(
    () => [
      { value: 1, label: 'Nhắc nhở học (Offline X ngày)' },
      { value: 2, label: 'Thông báo sắp hết hạn VIP (Còn X ngày)' },
    ],
    [],
  )

  // UserTargetGroup enum: 0=None, 1=All, 2=VipUsers, 3=FreeUsers
  const targetGroupOptions = useMemo(
    () => [
      { value: 0, label: 'Không gửi cho ai' },
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
        Type: typeof type === 'number' ? type : undefined,
        TargetGroup: typeof targetGroup === 'number' ? targetGroup : undefined,
        SearchName: searchName?.trim() || undefined,
        SearchSubject: searchSubject?.trim() || undefined,
      }

      const res = await fetchEmailTemplates(params)
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
  }, [pageNumber, pageSize, type, targetGroup, searchName, searchSubject])

  const renderStatusTag = (value) => {
    // EmailTemplateStatus enum: 0=Draft, 1=Active, 2=Deleted
    const enumMap = {
      0: { color: 'default', icon: <ClockCircleOutlined />, text: 'Chưa gửi' },
      1: { color: 'green', icon: <CheckCircleOutlined />, text: 'Đang hoạt động' },
      2: { color: 'red', icon: <CloseCircleOutlined />, text: 'Đã xóa' },
    }

    const statusInfo = enumMap[value] || { color: 'default', text: typeof value === 'number' ? String(value) : '-' }
    return (
      <Tag color={statusInfo.color} icon={statusInfo.icon}>
        {statusInfo.text}
      </Tag>
    )
  }

  const renderType = (value) => {
    // EmailTemplateType enum: 1=OfflineReminder, 2=VipExpiringReminder
    const map = {
      1: 'Nhắc nhở học (Offline X ngày)',
      2: 'Thông báo sắp hết hạn VIP (Còn X ngày)',
    }
    if (typeof value === 'number') return map[value] || String(value)
    return value || '-'
  }

  const renderTargetGroup = (value) => {
    // UserTargetGroup enum: 0=None, 1=All, 2=VipUsers, 3=FreeUsers
    const map = {
      0: 'Không gửi cho ai',
      1: 'Gửi cho toàn bộ người dùng',
      2: 'Gửi cho người dùng đang trả phí',
      3: 'Gửi cho người dùng miễn phí',
    }
    if (typeof value === 'number') return map[value] || String(value)
    return value || '-'
  }

  const columns = [
    {
      title: 'Tên template',
      dataIndex: 'templateName',
      key: 'templateName',
      ellipsis: true,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (value) => renderType(value),
    },
    {
      title: 'Nhóm người nhận',
      dataIndex: 'targetGroup',
      key: 'targetGroup',
      render: (value) => renderTargetGroup(value),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
    },
    {
      title: 'Nội dung',
      dataIndex: 'body',
      key: 'body',
      ellipsis: { showTitle: true },
      render: (body) => (body ? <Text ellipsis={{ tooltip: body }}>{body}</Text> : '-'),
    },
  ]

  if (!items || items.length === 0) {
    return (
      <Card title="Lịch sử gửi email">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space wrap>
            <div style={{ minWidth: 280 }}>
              <div style={{ marginBottom: 6, color: '#666' }}>Type</div>
              <Select
                allowClear
                style={{ width: 280 }}
                placeholder="Select type"
                value={type}
                onChange={(v) => {
                  setPageNumber(1)
                  setType(v)
                }}
                options={typeOptions}
              />
            </div>
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
            <div style={{ minWidth: 200 }}>
              <div style={{ marginBottom: 6, color: '#666' }}>Search by Name</div>
              <Input
                placeholder="Enter template name"
                value={searchName}
                onChange={(e) => {
                  setPageNumber(1)
                  setSearchName(e.target.value)
                }}
                allowClear
              />
            </div>
            <div style={{ minWidth: 200 }}>
              <div style={{ marginBottom: 6, color: '#666' }}>Search by Subject</div>
              <Input
                placeholder="Enter subject"
                value={searchSubject}
                onChange={(e) => {
                  setPageNumber(1)
                  setSearchSubject(e.target.value)
                }}
                allowClear
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
          <div style={{ minWidth: 280 }}>
            <div style={{ marginBottom: 6, color: '#666' }}>Type</div>
            <Select
              allowClear
              style={{ width: 280 }}
              placeholder="Select type"
              value={type}
              onChange={(v) => {
                setPageNumber(1)
                setType(v)
              }}
              options={typeOptions}
            />
          </div>
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
          <div style={{ minWidth: 200 }}>
            <div style={{ marginBottom: 6, color: '#666' }}>Search by Name</div>
            <Input
              placeholder="Enter template name"
              value={searchName}
              onChange={(e) => {
                setPageNumber(1)
                setSearchName(e.target.value)
              }}
              allowClear
            />
          </div>
          <div style={{ minWidth: 200 }}>
            <div style={{ marginBottom: 6, color: '#666' }}>Search by Subject</div>
            <Input
              placeholder="Enter subject"
              value={searchSubject}
              onChange={(e) => {
                setPageNumber(1)
                setSearchSubject(e.target.value)
              }}
              allowClear
            />
          </div>
        </Space>

        <Table
          columns={columns}
          dataSource={items}
          loading={loading}
          rowKey={(r) => r?.id || r?.templateName || `${r?.templateName || 'row'}-${r?.createdAt || ''}`}
          pagination={{
            current: pageNumber,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `Tổng ${t} template`,
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

