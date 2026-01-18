import React, { useEffect, useMemo, useState } from 'react'
import { Alert, Card, Input, Select, Space, Spin, Table, Tag, Typography, message, Popconfirm, Button, Image } from 'antd'
import { ButtonV2 } from '../../../../../../components/buttonV2.jsx'

import { fetchPassages, createPassage, updatePassage, deletePassage } from '../../../api/passage-management'
import { uploadQuestionAudioToCloudinary, uploadQuestionImageToCloudinary } from '../../../../back-office/api/cloudinary.js'
import CreatePassageModal from './CreatePassageModal'
import UpdatePassageModal from './UpdatePassageModal'

const { Title, Text } = Typography

const MEDIA_TYPE_LABEL = {
  0: 'Văn bản',
  1: 'Hình ảnh',
  2: 'Audio',
}

const STATUS_LABEL = {
  1: 'Hoạt động',
  2: 'Đã ẩn',
}

export function PassageList() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [selectedPassage, setSelectedPassage] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const [filters, setFilters] = useState({
    searchTerm: '',
    mediaType: null,
    status: null,
  })

  const load = async () => {
    try {
      setLoading(true)
      setError('')
      const params = {
        ...(filters.searchTerm?.trim() ? { SearchTerm: filters.searchTerm.trim() } : {}),
        ...(filters.mediaType !== null && filters.mediaType !== undefined ? { MediaType: filters.mediaType } : {}),
        ...(filters.status !== null && filters.status !== undefined ? { Status: filters.status } : {}),
        PageNumber: 1,
        PageSize: 50,
      }
      const res = await fetchPassages(params)
      setData(res?.items || res || [])
    } catch (e) {
      setError(e?.message || 'Không thể tải danh sách passage')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.searchTerm, filters.mediaType, filters.status])

  const columns = useMemo(
    () => [
      {
        title: 'ID',
        dataIndex: 'passageId',
        key: 'passageId',
        width: 160,
        render: (v) => <Text code>{v}</Text>,
      },
      {
        title: 'Tiêu đề',
        dataIndex: 'title',
        key: 'title',
        width: 220,
        render: (v) => <Text strong>{v || '-'}</Text>,
      },
      {
        title: 'Nội dung',
        dataIndex: 'content',
        key: 'content',
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
        title: 'MediaType',
        dataIndex: 'mediaType',
        key: 'mediaType',
        width: 120,
        render: (v) => <Tag>{MEDIA_TYPE_LABEL[v] ?? v}</Tag>,
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 140,
        render: (v) => (
          <Tag color={v === 1 ? 'green' : 'default'}>
            {STATUS_LABEL[v] ?? v}
          </Tag>
        ),
      },
      {
        title: 'CreatedAt',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 180,
        render: (v) => <Text type="secondary">{v || '-'}</Text>,
      },
      {
        title: 'Thao tác',
        key: 'actions',
        width: 180,
        fixed: 'right',
        render: (_, record) => (
          <Space>
            <Button
              size="small"
              onClick={() => {
                setSelectedPassage(record)
                setUpdateOpen(true)
              }}
            >
              Sửa
            </Button>
            <Popconfirm
              title="Xóa Passage"
              description="Bạn có chắc chắn muốn xóa passage này?"
              okText="Xóa"
              cancelText="Hủy"
              onConfirm={async () => {
                try {
                  setDeletingId(record.passageId)
                  await deletePassage(record.passageId)
                  message.success('Đã xóa passage')
                  await load()
                } catch (e) {
                  message.error(e?.message || 'Xóa passage thất bại')
                } finally {
                  setDeletingId(null)
                }
              }}
            >
              <Button danger size="small" loading={deletingId === record.passageId}>
                Xóa
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [],
  )

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>Quản lí Passage</Title>
          <Text type="secondary">Danh sách đoạn văn (Passages)</Text>
        </div>
        <ButtonV2
          title="Thêm Passage"
          color="#F1BE4B"
          onPress={() => setCreateOpen(true)}
          style={{ minWidth: 140, paddingVertical: 10 }}
          textStyle={{ fontSize: 14 }}
        />
      </div>

      <Card>
        <Space wrap style={{ width: '100%' }}>
          <Input
            placeholder="Tìm theo SearchTerm"
            value={filters.searchTerm}
            onChange={(e) => setFilters((p) => ({ ...p, searchTerm: e.target.value }))}
            style={{ width: 260 }}
            allowClear
          />

          <Select
            placeholder="MediaType"
            value={filters.mediaType}
            onChange={(v) => setFilters((p) => ({ ...p, mediaType: v }))}
            style={{ width: 180 }}
            allowClear
            options={[
              { value: 0, label: 'Văn bản' },
              { value: 1, label: 'Hình ảnh' },
              { value: 2, label: 'Audio' },
            ]}
          />

          <Select
            placeholder="Status"
            value={filters.status}
            onChange={(v) => setFilters((p) => ({ ...p, status: v }))}
            style={{ width: 180 }}
            allowClear
            options={[
              { value: 1, label: 'Đang hoạt động' },
              { value: 2, label: 'Đã ẩn' },
            ]}
          />
        </Space>
      </Card>

      {error ? <Alert type="error" showIcon message="Lỗi" description={error} /> : null}

      <Card>
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <Spin />
          </div>
        ) : (
          <Table
            rowKey="passageId"
            columns={columns}
            dataSource={data}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1100 }}
          />
        )}
      </Card>

      <CreatePassageModal
        open={createOpen}
        loading={creating}
        onCancel={() => setCreateOpen(false)}
        onSubmit={async (values) => {
          try {
            setCreating(true)

            let imageUrl = null

            // Upload only when click "Tạo"
            if (values.mediaType === 1) {
              // Image: upload image và gửi vào imageUrl
              if (!values.imageFile) {
                throw new Error('MediaType = Hình ảnh: bắt buộc chọn hình ảnh')
              }
              imageUrl = await uploadQuestionImageToCloudinary(values.imageFile)
            } else if (values.mediaType === 2) {
              // Audio: upload audio và gửi vào imageUrl (theo API spec)
              if (!values.audioFile) {
                throw new Error('MediaType = Audio: bắt buộc chọn audio')
              }
              imageUrl = await uploadQuestionAudioToCloudinary(values.audioFile)
            }

            const payload = {
              title: values.title?.trim(),
              content: values.mediaType === 0 ? values.content?.trim() : null,
              imageUrl: imageUrl, // Backend mong đợi imageUrl cho cả Image và Audio
              mediaType: values.mediaType,
            }

            await createPassage(payload)
            message.success('Đã tạo passage')
            setCreateOpen(false)
            await load()
          } catch (e) {
            message.error(e?.message || 'Tạo passage thất bại')
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

            // Theo quy tắc update: field nào truyền "" hoặc null => không cập nhật
            // Chỉ field có giá trị "thực" mới update
            const payload = {
              passageId: values.passageId,
            }

            // Title: chỉ update nếu có giá trị
            if (values.title?.trim()) {
              payload.title = values.title.trim()
            }

            // MediaType: chỉ update nếu có giá trị
            if (values.mediaType !== undefined && values.mediaType !== null) {
              payload.mediaType = values.mediaType
            }

            // Content: chỉ update nếu mediaType = 0 và có giá trị
            if (values.mediaType === 0 && values.content?.trim()) {
              payload.content = values.content.trim()
            } else if (values.mediaType === 0 && !values.content?.trim()) {
              // Nếu mediaType = 0 nhưng content rỗng, không update content (giữ nguyên DB)
            }

            // ImageUrl: chỉ update nếu có file mới upload
            // Theo quy tắc: chỉ field có giá trị "thực" mới update
            // Nếu không upload file mới, không gửi imageUrl (giữ nguyên DB)
            if (values.mediaType === 1 && values.imageFile) {
              // Upload image mới
              const imageUrl = await uploadQuestionImageToCloudinary(values.imageFile)
              payload.imageUrl = imageUrl
            } else if (values.mediaType === 2 && values.audioFile) {
              // Upload audio mới
              const imageUrl = await uploadQuestionAudioToCloudinary(values.audioFile)
              payload.imageUrl = imageUrl
            }
            // Nếu không có file mới, không gửi imageUrl (giữ nguyên DB theo quy tắc update)

            // Status: chỉ update nếu có giá trị
            if (values.status !== undefined && values.status !== null) {
              payload.status = values.status
            }

            await updatePassage(payload)
            message.success('Đã cập nhật passage')
            setUpdateOpen(false)
            setSelectedPassage(null)
            await load()
          } catch (e) {
            message.error(e?.message || 'Cập nhật passage thất bại')
          } finally {
            setUpdating(false)
          }
        }}
      />
    </Space>
  )
}

export default PassageList

