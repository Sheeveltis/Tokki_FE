'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Alert, Card, Spin, Table, Typography, Space, Button, Popconfirm, Input, Select, Tooltip } from 'antd'
import { PlusOutlined, FilterOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { showAdminSuccess, showAdminError } from '../../../../components/HelperAdmin.jsx'
import { fetchTitles, createTitle, updateTitle, deleteTitle } from '../api/title'
import { uploadTitleImageToCloudinary } from '../../back-office/api/cloudinary'
import CreateTitleModal from '../components/CreateTitleModal'
import UpdateTitleModal from '../components/UpdateTitleModal'

const { Title, Text } = Typography

const STATUS_CONFIG = {
  0: { label: 'Nháp', color: '#8c8c8c' },
  1: { label: 'Hoạt động', color: '#52c41a' },
  2: { label: 'Ẩn', color: '#f5222d' },
}

export function TitleManagementScreen() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState([])
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [selectedTitle, setSelectedTitle] = useState(null)

  const [filters, setFilters] = useState({
    search: '',
    status: null,
  })
  
  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const items = await fetchTitles()
      setData(Array.isArray(items) ? items : [])
    } catch (e) {
      setError(e?.message || 'Không thể tải danh sách danh hiệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const titleName = item?.name ?? item?.titleName ?? item?.TitleName ?? ''
      const itemStatus = item?.status

      const matchSearch = titleName
        .toLowerCase()
        .includes((filters.search || '').trim().toLowerCase())

      const matchStatus =
        filters.status === null || filters.status === undefined
          ? true
          : Number(itemStatus) === Number(filters.status)

      return matchSearch && matchStatus
    })
  }, [data, filters])

  const columns = useMemo(() => {
    return [
      {
        title: 'Tên danh hiệu',
        dataIndex: 'name',
        key: 'name',
        render: (val, record) => val ?? record?.titleName ?? record?.TitleName ?? '-',
      },
      {
        title: 'Mô tả',
        dataIndex: 'description',
        key: 'description',
        render: (val) => val ?? '-',
      },
      {
        title: 'XP yêu cầu',
        dataIndex: 'requiredXP',
        key: 'requiredXP',
        width: 120,
        render: (val) => val ?? 0,
      },
      
      {
        title: 'Màu',
        dataIndex: 'colorHex',
        key: 'colorHex',
        width: 120,
        render: (val) =>
          val ? (
            <Space size={6}>
              <span
                style={{
                  display: 'inline-block',
                  width: 14,
                  height: 14,
                  borderRadius: 4,
                  backgroundColor: val,
                  border: '1px solid #d9d9d9',
                }}
              />
              <Text code>{val}</Text>
            </Space>
          ) : (
            '-'
          ),
      },
      {
        title: 'Icon',
        dataIndex: 'iconUrl',
        key: 'iconUrl',
        width: 80,
        render: (val) =>
          val ? (
            <img
              src={val}
              alt="icon"
              style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 4, border: '1px solid #d9d9d9' }}
            />
          ) : (
            '-'
          ),
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        align: 'center',
        width: 100,
        render: (val) => {
          const cfg = STATUS_CONFIG[Number(val)] || STATUS_CONFIG[0]
      
          return (
            <Tooltip title={cfg.label} color={cfg.color} placement="top">
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  backgroundColor: cfg.color,
                  margin: '0 auto',
                  boxShadow: '0 0 4px rgba(0,0,0,0.3)',
                  cursor: 'pointer',
                }}
              />
            </Tooltip>
          )
        },
      },
      {
        title: 'Thao tác',
        key: 'action',
        width: 120,
        fixed: 'right',
        align: 'center',
        render: (_, record) => (
          <Space size="small">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedTitle(record)
                setUpdateOpen(true)
              }}
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
      
            <Popconfirm
              title="Xác nhận xóa"
              description="Bạn có chắc chắn muốn xóa danh hiệu này?"
              onConfirm={() => handleDelete(record)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                loading={deletingId === (record?.titleId || record?.id || record?.TitleId)}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
            </Popconfirm>
          </Space>
        ),
      },
    ]
  }, [deletingId])

  const rowKey = (record) => record?.titleId ?? record?.id ?? record?.TitleId ?? JSON.stringify(record)

  const handleCreate = async (payload) => {
    try {
      setCreating(true)
      
      // Upload ảnh lên Cloudinary nếu có iconFile
      let iconUrl = payload.iconUrl
      if (payload.iconFile) {
        try {
          const uploadResult = await uploadTitleImageToCloudinary(payload.iconFile)
          iconUrl = uploadResult?.url || uploadResult?.secureUrl || uploadResult
        } catch (uploadError) {
          showAdminError(uploadError?.message || 'Không thể upload ảnh lên Cloudinary')
          return
        }
      }

      // Tạo payload cuối cùng với iconUrl từ Cloudinary
      const finalPayload = {
        name: payload.name,
        description: payload.description,
        requiredXP: payload.requiredXP,
        colorHex: payload.colorHex,
        iconUrl: iconUrl || '',
        isSystemGiven: payload.isSystemGiven,
      }

      const result = await createTitle(finalPayload)
      showAdminSuccess(result?.message || 'Đã tạo danh hiệu mới thành công')
      setCreateOpen(false)
      await loadData()
    } catch (e) {
      showAdminError(e?.message || 'Không thể tạo danh hiệu')
    } finally {
      setCreating(false)
    }
  }

  const handleUpdate = async (payload) => {
    try {
      setUpdating(true)
      const titleId = payload.titleId || selectedTitle?.titleId || selectedTitle?.id || selectedTitle?.TitleId
      if (!titleId) {
        showAdminError('Không tìm thấy ID danh hiệu')
        return
      }

      // Upload ảnh lên Cloudinary nếu có iconFile mới
      let iconUrl = payload.iconUrl || selectedTitle?.iconUrl
      if (payload.iconFile) {
        try {
          const uploadResult = await uploadTitleImageToCloudinary(payload.iconFile)
          iconUrl = uploadResult?.url || uploadResult?.secureUrl || uploadResult
        } catch (uploadError) {
          showAdminError(uploadError?.message || 'Không thể upload ảnh lên Cloudinary')
          return
        }
      }

      // Tạo payload cuối cùng với iconUrl từ Cloudinary
      const finalPayload = {
        name: payload.name,
        description: payload.description,
        requiredXP: payload.requiredXP,
        colorHex: payload.colorHex,
        iconUrl: iconUrl || '',
        isSystemGiven: payload.isSystemGiven,
      }

      const result = await updateTitle(titleId, finalPayload)
      showAdminSuccess(result?.message || 'Đã cập nhật danh hiệu thành công')
      setUpdateOpen(false)
      setSelectedTitle(null)
      await loadData()
    } catch (e) {
      showAdminError(e?.message || 'Không thể cập nhật danh hiệu')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (record) => {
    const titleId = record?.titleId || record?.id || record?.TitleId
    if (!titleId) {
      showAdminError('Không tìm thấy ID danh hiệu')
      return
    }

    try {
      setDeletingId(titleId)
      const result = await deleteTitle(titleId)
      showAdminSuccess(result?.message || 'Đã xóa danh hiệu thành công')
      await loadData()
    } catch (e) {
      showAdminError(e?.message || 'Không thể xóa danh hiệu')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>Quản lí danh hiệu</Title>
          <Text type="secondary">Danh sách danh hiệu (Titles)</Text>
        </div>
        <Button
          icon={<PlusOutlined />}
          onClick={() => setCreateOpen(true)}
          style={{
            backgroundColor: '#F1BE4B',
            borderColor: '#F1BE4B',
            color: '#111',
            borderRadius: 6,
            fontWeight: 500,
          }}
        >
          Thêm mới
        </Button>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <Input.Search
          placeholder="Tìm theo tên..."
          allowClear
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          style={{ width: 280 }}
        />

        <Space wrap>
          <Select
            allowClear
            placeholder="Lọc trạng thái"
            suffixIcon={<FilterOutlined />}
            style={{ width: 160 }}
            value={filters.status}
            onChange={(val) => handleFilterChange('status', val)}
            options={Object.entries(STATUS_CONFIG).map(([val, cfg]) => ({
              value: Number(val),
              label: cfg.label,
            }))}
          />
        </Space>
      </div>

      <Card>

        {error ? <Alert type="error" showIcon message="Lỗi" description={error} style={{ marginBottom: 16 }} /> : null}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
            <Spin />
          </div>
        ) : (
          <Table
            rowKey={rowKey}
            columns={columns}
            dataSource={filteredData}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>

      <CreateTitleModal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        loading={creating}
      />

      <UpdateTitleModal
        open={updateOpen}
        onCancel={() => {
          setUpdateOpen(false)
          setSelectedTitle(null)
        }}
        onSubmit={handleUpdate}
        loading={updating}
        initialData={selectedTitle}
      />
    </Space>
  )
}

export default TitleManagementScreen


