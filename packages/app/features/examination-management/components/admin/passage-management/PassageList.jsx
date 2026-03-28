import { useEffect, useMemo, useState } from 'react'
import { Select, Space, Typography, Popconfirm, Button, Image, Tooltip, message, Tag } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, FilterOutlined } from '@ant-design/icons'
import { showAdminSuccess, showAdminError } from '../../../../../../components/HelperAdmin.jsx'

import { fetchPassages, createPassage, updatePassage, deletePassage } from '../../../api/passage-management'
import { uploadPassageImageToCloudinary, uploadPassageAudioToCloudinary } from '../../../../back-office/api/cloudinary.js'
import CreatePassageModal from './CreatePassageModal'
import UpdatePassageModal from './UpdatePassageModal'
import ManagementLayout from '../../../../../../components/layout/management-layout'
import { useManagementFilters } from '../../../../back-office/hooks/use-management-filters.js'

const { Text } = Typography

const MEDIA_TYPE_LABEL = {
  0: 'Văn bản',
  1: 'Hình ảnh',
  2: 'Audio',
}

export function PassageList() {
  const [data, setData] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [selectedPassage, setSelectedPassage] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const [filters, setFilters] = useManagementFilters({
    search: '',
    mediaType: null,
    status: null,
    page: 1,
    size: 50,
  })

  const loadData = async (currentFilters) => {
    setLoading(true)
    try {
      const params = {
        ...(currentFilters.search?.trim() ? { SearchTerm: currentFilters.search.trim() } : {}),
        ...(currentFilters.mediaType !== null && currentFilters.mediaType !== undefined ? { MediaType: currentFilters.mediaType } : {}),
        ...(currentFilters.status !== null && currentFilters.status !== undefined ? { Status: currentFilters.status } : {}),
        PageNumber: currentFilters.page,
        PageSize: currentFilters.size,
      }
      const res = await fetchPassages(params)
      // Cấu trúc API có thể là { items: [], total: 0 } hoặc mảng trực tiếp
      if (Array.isArray(res)) {
        setData({ items: res, total: res.length })
      } else {
        setData({ items: res?.items || [], total: res?.total || res?.totalCount || 0 })
      }
    } catch (e) {
      message.error(e?.message || 'Không thể tải danh sách passage')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(filters)
  }, [filters.page, filters.size, filters.mediaType, filters.status])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePaginationChange = (newPage, newSize) => {
    setFilters(prev => {
      const isSizeChanged = prev.size !== newSize;
      return {
        ...prev,
        size: newSize,
        page: isSizeChanged ? 1 : newPage
      }
    })
  }

  const columns = useMemo(
    () => [
      {
        title: () => (
          <Tooltip title="Số thứ tự">
            <span>STT</span>
          </Tooltip>
        ),
        key: 'stt',
        align: 'center',
        width: 60,
        render: (_value, _record, index) => (filters.page - 1) * filters.size + index + 1,
      },
      {
        title: 'Tiêu đề',
        dataIndex: 'title',
        key: 'title',
        width: 250,
        render: (v) => <Text strong>{v || '-'}</Text>,
      },
      {
        title: 'Nội dung',
        dataIndex: 'content',
        key: 'content',
        width: 500,
        render: (v, record) => {
          const imgUrl = (record?.imageUrl || record?.imageUrl1 || '').trim();
          return (
            <div style={{ maxWidth: 520 }}>
              {record?.mediaType === 1 && imgUrl ? (
                <div style={{ marginBottom: 8 }}>
                  <Image
                    width={180}
                    src={imgUrl}
                    alt={record.title || 'Passage image'}
                    preview={{
                      mask: 'Xem ảnh',
                    }}
                  />
                </div>
              ) : null}
              <Text type="secondary">{(v || '').slice(0, 140)}{(v || '').length > 140 ? '…' : ''}</Text>
            </div>
          )
        },
      },
      {
        title: 'Loại',
        dataIndex: 'mediaType',
        key: 'mediaType',
        width: 120,
        render: (v) => <Tag color="blue">{MEDIA_TYPE_LABEL[v] ?? v}</Tag>,
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        align: 'center',
        render: (v) => {
          const color = v === 1 ? '#52c41a' : '#8c8c8c'
          return (
            <Tooltip title={v === 1 ? 'Đang hoạt động' : 'Đã ẩn'}>
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  backgroundColor: color,
                  margin: '0 auto',
                  boxShadow: '0 0 4px rgba(0,0,0,0.3)',
                  cursor: 'pointer'
                }}
              />
            </Tooltip>
          )
        },
      },
      {
        title: 'Hành động',
        key: 'actions',
        width: 140,
        align: 'center',
        render: (_, record) => (
          <Space size="large">
            <Tooltip title="Chỉnh sửa">
              <EditOutlined
                style={{ fontSize: 18, cursor: 'pointer', color: '#1890ff' }}
                onClick={() => {
                  setSelectedPassage(record)
                  setUpdateOpen(true)
                }}
              />
            </Tooltip>
            <Tooltip title="Xóa">
              <Popconfirm
                title="Xóa Passage"
                description="Bạn có chắc chắn muốn xóa passage này?"
                okText="Xóa"
                cancelText="Hủy"
                onConfirm={async () => {
                  try {
                    setDeletingId(record.passageId)
                    await deletePassage(record.passageId)
                    showAdminSuccess('Đã xóa passage')
                    await loadData(filters)
                  } catch (e) {
                    showAdminError(e?.message || 'Xóa passage thất bại')
                  } finally {
                    setDeletingId(null)
                  }
                }}
              >
                <DeleteOutlined style={{ fontSize: 18, cursor: 'pointer', color: '#1890ff' }} />
              </Popconfirm>
            </Tooltip>
          </Space>
        ),
      },
    ],
    [filters, deletingId],
  )

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
        placeholder="MediaType"
        value={filters.mediaType}
        onChange={(v) => handleFilterChange('mediaType', v)}
        style={{ width: 180 }}
        allowClear
        suffixIcon={<FilterOutlined />}
        options={[
          { value: 0, label: 'Văn bản' },
          { value: 1, label: 'Hình ảnh' },
          { value: 2, label: 'Audio' },
        ]}
      />

      <Select
        placeholder="Status"
        value={filters.status}
        onChange={(v) => handleFilterChange('status', v)}
        style={{ width: 180 }}
        allowClear
        suffixIcon={<FilterOutlined />}
        options={[
          { value: 1, label: 'Đang hoạt động' },
          { value: 2, label: 'Đã ẩn' },
        ]}
      />
    </Space>
  )

  return (
    <>
      <ManagementLayout
        searchPlaceholder="Tìm kiếm tiêu đề, nội dung..."
        searchValue={filters.search}
        onSearchChange={val => setFilters(prev => ({ ...prev, search: val }))}
        onSearchSubmit={() => handleFilterChange('search', filters.search)}
        extraFilters={extraFilters}
        actions={actions}
        tableProps={{
          columns,
          dataSource: data.items,
          loading,
          rowKey: "passageId",
          pagination: {
            current: filters.page,
            pageSize: filters.size,
            total: data.total,
            showSizeChanger: true,
            onChange: handlePaginationChange
          }
        }}
      />

      <CreatePassageModal
        open={createOpen}
        loading={creating}
        onCancel={() => setCreateOpen(false)}
        onSubmit={async (values) => {
          try {
            setCreating(true)
            let imageUrl = null

            if (values.mediaType === 1) {
              if (!values.imageFile) throw new Error('MediaType = Hình ảnh: bắt buộc chọn hình ảnh')
              imageUrl = await uploadPassageImageToCloudinary(values.imageFile)
            } else if (values.mediaType === 2) {
              if (!values.audioFile) throw new Error('MediaType = Audio: bắt buộc chọn audio')
              imageUrl = await uploadPassageAudioToCloudinary(values.audioFile)
            }

            const payload = {
              title: values.title?.trim(),
              content: values.mediaType === 0 ? values.content?.trim() : null,
              imageUrl: imageUrl,
              mediaType: values.mediaType,
            }

            await createPassage(payload)
            showAdminSuccess('Đã tạo passage')
            setCreateOpen(false)
            await loadData(filters)
          } catch (e) {
            showAdminError(e?.message || 'Tạo passage thất bại')
          } finally {
            setCreating(false)
          }
        }}
      />

      <UpdatePassageModal
        open={updateOpen}
        loading={updating}
        initialValues={selectedPassage}
        onCancel={() => {
          setUpdateOpen(false)
          setSelectedPassage(null)
        }}
        onSubmit={async (values) => {
          try {
            setUpdating(true)
            const payload = {
              passageId: values.passageId,
              title: values.title?.trim(),
              mediaType: values.mediaType,
              status: values.status,
            }

            if (values.mediaType === 0) payload.content = values.content?.trim()

            if (values.mediaType === 1 && values.imageFile) {
              payload.imageUrl = await uploadPassageImageToCloudinary(values.imageFile)
            } else if (values.mediaType === 2 && values.audioFile) {
              payload.imageUrl = await uploadPassageAudioToCloudinary(values.audioFile)
            }

            await updatePassage(payload)
            showAdminSuccess('Đã cập nhật passage')
            setUpdateOpen(false)
            setSelectedPassage(null)
            await loadData(filters)
          } catch (e) {
            showAdminError(e?.message || 'Cập nhật passage thất bại')
          } finally {
            setUpdating(false)
          }
        }}
      />
    </>
  )
}

export default PassageList
