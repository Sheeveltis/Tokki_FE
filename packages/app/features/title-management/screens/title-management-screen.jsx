'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Alert, Card, Spin, Table, Typography, Space, Button, Input, Select, Tooltip, message, Modal } from 'antd'
import { PlusOutlined, FilterOutlined, EditOutlined, DeleteOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import { fetchTitles, createTitle, updateTitle, deleteTitle, importTitles, exportTitles } from '../api/title'
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
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)

  const fileInputRef = React.useRef(null)

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
        title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>STT</span>,
        key: 'stt',
        align: 'center',
        width: '5%',
        render: (_, __, index) => (
          <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>
            {(filters.page - 1) * filters.size + index + 1}
          </span>
        )
      },
      {
        title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>Icon</span>,
        dataIndex: 'iconUrl',
        key: 'iconUrl',
        width: '10%',
        align: 'center',
        render: (val) =>
          val ? (
            <img
              src={val}
              alt="icon"
              style={{
                width: 'clamp(40px, 4vw, 60px)',
                height: 'clamp(40px, 4vw, 60px)',
                objectFit: 'contain',
                borderRadius: 8,
                border: '1px solid #f0f0f0'
              }}
            />
          ) : (
            <div style={{
              width: 'clamp(40px, 4vw, 60px)',
              height: 'clamp(40px, 4vw, 60px)',
              backgroundColor: '#f5f5f5',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto'
            }}>-</div>
          ),
      },
      {
        title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>Tên danh hiệu</span>,
        dataIndex: 'name',
        key: 'name',
        width: '20%',
        render: (val, record) => <Text strong style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>{val ?? record?.titleName ?? record?.TitleName ?? '-'}</Text>,
      },
      {
        title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>Mô tả</span>,
        dataIndex: 'description',
        key: 'description',
        render: (val) => <Text type="secondary" style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>{val || '-'}</Text>,
      },
      {
        title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>Điều kiện nhận</span>,
        key: 'requirement',
        width: '15%',
        render: (_, record) => {
          const type = record?.requirementType ?? 0
          const quant = record?.requirementQuantity ?? 0
          const cfg = REQUIREMENT_TYPE_CONFIG[type]
          return (
            <Space direction="vertical" size={0}>
              <Text style={{ fontSize: 'clamp(11px, 0.9vw, 13px)', color: cfg?.color }}>{cfg?.label}</Text>
              <Text strong style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>{quant?.toLocaleString()} {type === 0 ? 'Lv' : type === 1 ? 'XP' : 'Ngày'}</Text>
            </Space>
          )
        },
      },
      {
        title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>Màu sắc</span>,
        dataIndex: 'colorHex',
        key: 'colorHex',
        width: '12%',
        align: 'center',
        render: (val) =>
          val ? (
            <Space size={6}>
              <div
                style={{
                  width: 'clamp(16px, 1.2vw, 22px)',
                  height: 'clamp(16px, 1.2vw, 22px)',
                  borderRadius: 6,
                  backgroundColor: val,
                  border: '1px solid #d9d9d9',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Text code style={{ fontSize: 'clamp(12px, 0.9vw, 14px)' }}>{val.toUpperCase()}</Text>
            </Space>
          ) : (
            '-'
          ),
      },
      {
        title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>Trạng thái</span>,
        dataIndex: 'status',
        key: 'status',
        align: 'center',
        width: '12%',
        render: (val) => {
          const cfg = STATUS_CONFIG[Number(val)] || STATUS_CONFIG[0]
          return (
            <Tooltip title={cfg.label} color={cfg.color} placement="top">
              <div
                style={{
                  width: 'clamp(14px, 1.2vw, 18px)',
                  height: 'clamp(14px, 1.2vw, 18px)',
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
        title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>Hành động</span>,
        key: 'action',
        width: '15%',
        align: 'center',
        render: (_, record) => (
          <Space size="large">
            <Tooltip title="Chỉnh sửa">
              <EditOutlined
                style={{ ...iconStyle, fontSize: 'clamp(18px, 1.4vw, 22px)' }}
                onClick={() => {
                  setSelectedTitle(record)
                  setUpdateOpen(true)
                }}
              />
            </Tooltip>
            <Tooltip title="Xóa">
              <DeleteOutlined
                style={{ ...iconStyle, fontSize: 'clamp(18px, 1.4vw, 22px)' }}
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

  const handleImport = async (file) => {
    try {
      setImporting(true)
      const res = await importTitles(file)
      // Nếu API trả về trực tiếp data mà không bắn exception (status 200)
      if (res?.isSuccess) {
        message.success(res.message || 'Import danh hiệu thành công')
        await loadData()
      } else if (res?.message) {
        Modal.error({
          title: 'Lỗi Import Excel',
          content: (
            <div style={{ whiteSpace: 'pre-line' }}>
              {res.message}
            </div>
          ),
          width: 600,
        })
      }
    } catch (e) {
      // Xử lý lỗi từ catch (thường là 400, 500...)
      const apiData = e?.response?.data
      if (apiData?.message) {
        Modal.error({
          title: 'Lỗi Import Excel',
          content: (
            <div style={{ whiteSpace: 'pre-line' }}>
              {apiData.message}
            </div>
          ),
          width: 600,
        })
      } else {
        message.error(getApiErrorMessage(e, 'Không thể import danh hiệu'))
      }
    } finally {
      setImporting(false)
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const blob = await exportTitles()
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `DS_DanhHieu_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '')}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      message.success('Xuất file Excel thành công')
    } catch (e) {
      message.error(getApiErrorMessage(e, 'Không thể xuất file Excel'))
    } finally {
      setExporting(false)
    }
  }

  const actions = [
    {
      label: 'Import',
      icon: <UploadOutlined />,
      type: 'dashed',
      loading: importing,
      onPress: () => fileInputRef.current?.click()
    },
    {
      label: 'Export',
      icon: <DownloadOutlined />,
      type: 'dashed',
      loading: exporting,
      onPress: handleExport
    },
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
        style={{ width: 'clamp(140px, 12vw, 200px)', height: 'clamp(32px, 4vh, 40px)', borderRadius: '1rem', fontSize: 'clamp(13px, 1.1vw, 14px)' }}
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
        style={{ width: 'clamp(140px, 12vw, 180px)', height: 'clamp(32px, 4vh, 40px)', borderRadius: '1rem', fontSize: 'clamp(13px, 1.1vw, 14px)' }}
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

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".xlsx, .xls"
        onChange={(e) => {
          const file = e.target.files[0]
          if (file) {
            handleImport(file)
            e.target.value = ''
          }
        }}
      />
    </>
  )
}

export default TitleManagementScreen


