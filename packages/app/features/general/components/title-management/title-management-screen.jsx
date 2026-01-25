'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Alert, Card, Spin, Table, Typography, Space, Button, Popconfirm } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { showAdminSuccess, showAdminError } from '../../../../../components/HelperAdmin.jsx'
import { fetchTitles, createTitle, updateTitle, deleteTitle } from '../../api/title'
import { uploadTitleImageToCloudinary } from '../../../back-office/api/cloudinary'
import CreateTitleModal from './CreateTitleModal'
import UpdateTitleModal from './UpdateTitleModal'

const { Title, Text } = Typography

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

  const columns = useMemo(() => {
    const statusColors = {
      1: { color: 'green', label: 'Hoạt động' },
      0: { color: 'default', label: 'Nháp' },
      2: { color: 'red', label: 'Ẩn' },
    }

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
        width: 120,
        render: (val) => {
          const info = statusColors[val] || { color: 'default', label: val ?? '-' }
          return <Text style={{ color: info.color === 'default' ? undefined : info.color }}>{info.label}</Text>
        },
      },
      {
        title: 'Thao tác',
        key: 'action',
        width: 120,
        fixed: 'right',
        render: (_, record) => (
          <Space size="small">
            <Button
              size="small"
              onClick={() => {
                setSelectedTitle(record)
                setUpdateOpen(true)
              }}
              style={{
                color: '#000',
                borderColor: '#000',
                backgroundColor: '#fff',
                borderRadius: 4,
              }}
            >
              Sửa
            </Button>
            <Popconfirm
              title="Xác nhận xóa"
              description="Bạn có chắc chắn muốn xóa danh hiệu này?"
              onConfirm={() => handleDelete(record)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button
                size="small"
                loading={deletingId === (record?.titleId || record?.id || record?.TitleId)}
                style={{
                  color: '#ff4d4f',
                  borderColor: '#ff4d4f',
                  backgroundColor: '#fff',
                  borderRadius: 4,
                }}
              >
                Xóa
              </Button>
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
        <ButtonV2
          title="Thêm danh hiệu"
          color="#F1BE4B"
          onPress={() => setCreateOpen(true)}
          style={{ minWidth: 140, paddingVertical: 10 }}
          textStyle={{ fontSize: 14 }}
        />
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
            dataSource={data}
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


