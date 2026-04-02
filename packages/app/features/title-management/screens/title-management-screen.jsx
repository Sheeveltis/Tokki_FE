'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Alert, Card, Spin, Table, Typography, Space, Button, Input, Select, Tooltip, message } from 'antd'
import { PlusOutlined, FilterOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { fetchTitles, createTitle, updateTitle, deleteTitle } from '../api/title'
import { uploadTitleImageToCloudinary } from '../../back-office/api/cloudinary'
import CreateTitleModal from '../components/CreateTitleModal'
import UpdateTitleModal from '../components/UpdateTitleModal'
import { showDeleteTitleConfirm } from '../components/DeleteTitleConfirm'

import ManagementLayout from '../../../../components/layout/management-layout'

const { Title, Text } = Typography

const STATUS_CONFIG = {
  0: { label: 'Ẩn', color: '#8c8c8c' },
  1: { label: 'Hoạt động', color: '#52c41a' },
}

const REQUIREMENT_TYPE_CONFIG = {
  0: { label: 'Cấp độ (Level)', color: '#1890ff' },
  1: { label: 'XP', color: '#faad14' },
  2: { label: 'Chuỗi ngày (Streak)', color: '#ff4d4f' },
  3: { label: 'Tổng ngày học', color: '#52c41a' },
  4: { label: 'Ngày vắng mặt (Inactivity)', color: '#ff7875' },
}

export function TitleManagementScreen() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [selectedTitle, setSelectedTitle] = useState(null)
  const [totalCount, setTotalCount] = useState(0)

  const getApiErrorMessage = (err, fallback) => {
    const apiMessage = err?.response?.data?.message
    const apiErrors = err?.response?.data?.errors
    const firstError = Array.isArray(apiErrors) && apiErrors.length ? apiErrors[0]?.description : null
    return apiMessage || firstError || err?.message || fallback
  }

  const [filters, setFilters] = useState({
    search: '',
    status: null,
    requirementType: null,
    page: 1,
    size: 10
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const resData = await fetchTitles(filters)
      if (resData?.items) {
        setData(resData.items)
        setTotalCount(resData.totalCount || 0)
      } else {
        setData(Array.isArray(resData) ? resData : [])
        setTotalCount(Array.isArray(resData) ? resData.length : 0)
      }
    } catch (e) {
      message.error(getApiErrorMessage(e, 'Không thể tải danh sách danh hiệu'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [filters.page, filters.size, filters.status, filters.requirementType]) // Only load on these changes. For search, we will trigger manually or on button click.

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1
    }))
  }

  const handleSearchSubmit = () => {
    setFilters(prev => ({ ...prev, page: 1 }))
    loadData()
  }

  const columns = useMemo(() => {
    const iconStyle = { fontSize: 18, cursor: 'pointer', color: '#1890ff' }
    return [
      {
        title: 'STT',
        key: 'stt',
        align: 'center',
        width: 60,
        render: (_, __, index) => (filters.page - 1) * filters.size + index + 1
      },
      {
        title: 'Icon',
        dataIndex: 'iconUrl',
        key: 'iconUrl',
        width: 80,
        align: 'center',
        render: (val) =>
          val ? (
            <img
              src={val}
              alt="icon"
              style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 4, border: '1px solid #f0f0f0' }}
            />
          ) : (
            <div style={{ width: 40, height: 40, backgroundColor: '#f5f5f5', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>-</div>
          ),
      },
      {
        title: 'Tên danh hiệu',
        dataIndex: 'name',
        key: 'name',
        width: 250,
        render: (val, record) => <Text strong>{val ?? record?.titleName ?? record?.TitleName ?? '-'}</Text>,
      },
      {
        title: 'Mô tả',
        dataIndex: 'description',
        key: 'description',
        render: (val) => <Text type="secondary">{val || '-'}</Text>,
      },
      {
        title: 'Điều kiện nhận',
        key: 'requirement',
        width: 180,
        render: (_, record) => {
          const type = record?.requirementType ?? 0
          const quant = record?.requirementQuantity ?? 0
          const cfg = REQUIREMENT_TYPE_CONFIG[type]
          return (
            <Space direction="vertical" size={0}>
              <Text style={{ fontSize: 12, color: cfg?.color }}>{cfg?.label}</Text>
              <Text strong>{quant?.toLocaleString()} {type === 0 ? 'Lv' : type === 1 ? 'XP' : 'Ngày'}</Text>
            </Space>
          )
        },
      },
      {
        title: 'Màu sắc',
        dataIndex: 'colorHex',
        key: 'colorHex',
        width: 120,
        align: 'center',
        render: (val) =>
          val ? (
            <Space size={6}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  backgroundColor: val,
                  border: '1px solid #d9d9d9',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
              <Text code>{val.toUpperCase()}</Text>
            </Space>
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
        title: 'Hành động',
        key: 'action',
        width: 120,
        align: 'center',
        render: (_, record) => (
          <Space size="large">
            <Tooltip title="Chỉnh sửa">
              <EditOutlined
                style={iconStyle}
                onClick={() => {
                  setSelectedTitle(record)
                  setUpdateOpen(true)
                }}
              />
            </Tooltip>
            <Tooltip title="Xóa">
              <DeleteOutlined
                style={{ ...iconStyle, color: '#ff4d4f' }}
                loading={deletingId === (record?.titleId || record?.id || record?.TitleId)}
                onClick={() => {
                  showDeleteTitleConfirm({
                    titleName: record?.name || record?.titleName || record?.TitleName || 'không tên',
                    onConfirm: () => handleDelete(record)
                  })
                }}
              />
            </Tooltip>
          </Space>
        ),
      },
    ]
  }, [deletingId, filters.page, filters.size, data])

  const rowKey = (record) => record?.titleId ?? record?.id ?? record?.TitleId ?? JSON.stringify(record)

  const handleCreate = async (payload) => {
    try {
      setCreating(true)
      let iconUrl = payload.iconUrl
      if (payload.iconFile) {
        try {
          const uploadResult = await uploadTitleImageToCloudinary(payload.iconFile)
          iconUrl = uploadResult?.url || uploadResult?.secureUrl || uploadResult
        } catch (uploadError) {
          api.error({
            message: 'Lỗi upload',
            description: 'Không thể upload ảnh lên Cloudinary',
          })
          return
        }
      }

      const finalPayload = {
        name: payload.name,
        description: payload.description,
        requirementType: payload.requirementType,
        requirementQuantity: payload.requirementQuantity,
        colorHex: payload.colorHex,
        iconUrl: iconUrl || '',
        isSystemGiven: payload.isSystemGiven,
      }

      const result = await createTitle(finalPayload)
      message.success(result?.message || 'Đã tạo danh hiệu mới thành công')
      setCreateOpen(false)
      await loadData()
    } catch (e) {
      message.error(getApiErrorMessage(e, 'Không thể tạo danh hiệu'))
    } finally {
      setCreating(false)
    }
  }

  const handleUpdate = async (payload) => {
    try {
      setUpdating(true)
      const titleId = payload.titleId || selectedTitle?.titleId || selectedTitle?.id || selectedTitle?.TitleId
      if (!titleId) {
        message.error('Không tìm thấy ID danh hiệu')
        return
      }

      let iconUrl = payload.iconUrl || selectedTitle?.iconUrl
      if (payload.iconFile) {
        try {
          const uploadResult = await uploadTitleImageToCloudinary(payload.iconFile)
          iconUrl = uploadResult?.url || uploadResult?.secureUrl || uploadResult
        } catch (uploadError) {
          message.error('Không thể upload ảnh lên Cloudinary')
          return
        }
      }

      const finalPayload = {
        name: payload.name,
        description: payload.description,
        requirementType: payload.requirementType,
        requirementQuantity: payload.requirementQuantity,
        colorHex: payload.colorHex,
        iconUrl: iconUrl || '',
        isSystemGiven: payload.isSystemGiven,
      }

      const result = await updateTitle(titleId, finalPayload)
      message.success(result?.message || 'Đã cập nhật danh hiệu thành công')
      setUpdateOpen(false)
      setSelectedTitle(null)
      await loadData()
    } catch (e) {
      message.error(getApiErrorMessage(e, 'Không thể cập nhật danh hiệu'))
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (record) => {
    const titleId = record?.titleId || record?.id || record?.TitleId
    if (!titleId) {
      message.error('Không tìm thấy ID danh hiệu')
      return
    }

    try {
      setDeletingId(titleId)
      const result = await deleteTitle(titleId)
      message.success(result?.message || 'Đã xóa danh hiệu thành công')
      await loadData()
    } catch (e) {
      message.error(getApiErrorMessage(e, 'Không thể xóa danh hiệu'))
    } finally {
      setDeletingId(null)
    }
  }

  const actions = [
    {
      label: 'Thêm mới',
      icon: <PlusOutlined />,
      type: 'primary',
      onPress: () => setCreateOpen(true)
    }
  ]

  const extraFilters = (
    <Space wrap>
      <Select
        allowClear
        placeholder="Lọc điều kiện"
        suffixIcon={<FilterOutlined />}
        style={{ width: 180, height: 32, borderRadius: 16, fontSize: 13 }}
        value={filters.requirementType}
        onChange={(val) => handleFilterChange('requirementType', val)}
        options={Object.entries(REQUIREMENT_TYPE_CONFIG).map(([val, cfg]) => ({
          value: Number(val),
          label: cfg.label,
        }))}
      />
      <Select
        allowClear
        placeholder="Lọc trạng thái"
        suffixIcon={<FilterOutlined />}
        style={{ width: 160, height: 32, borderRadius: 16, fontSize: 13 }}
        value={filters.status}
        onChange={(val) => handleFilterChange('status', val)}
        options={Object.entries(STATUS_CONFIG).map(([val, cfg]) => ({
          value: Number(val),
          label: cfg.label,
        }))}
      />
    </Space>
  )

  return (
    <>
      <ManagementLayout
        title="Quản lí danh hiệu"
        searchPlaceholder="Tìm theo tên..."
        searchValue={filters.search}
        onSearchChange={val => setFilters(prev => ({ ...prev, search: val }))}
        onSearchSubmit={handleSearchSubmit}
        extraFilters={extraFilters}
        actions={actions}
        tableProps={{
          columns,
          dataSource: data,
          loading,
          rowKey: rowKey,
          pagination: {
            current: filters.page,
            pageSize: filters.size,
            total: totalCount,
            showSizeChanger: true,
            onChange: (p, s) => setFilters(prev => ({ ...prev, page: p, size: s }))
          }
        }}
      />

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
    </>
  )
}

export default TitleManagementScreen


