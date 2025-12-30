'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'solito/navigation'
import { Input, Space, Select, Tag } from 'antd'
import { EyeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { fetchVocabularies } from '../../api'
import ManagementTable from '../../../../../components/ManagementTable'
import DetailDrawer from '../../../../../components/DetailDrawer'

const { Option } = Select

const STATUS_OPTIONS = [
  { value: undefined, label: 'Tất cả' },
  { value: 1, label: 'Hoạt động' },
  { value: 0, label: 'Không hoạt động' },
  { value: 2, label: 'Đã xóa' },
]

export function VocabularyManagement({ initialData = null }) {
  const router = useRouter()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(!initialData)
  const [drawerItem, setDrawerItem] = useState(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(undefined)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  })

  const loadData = useCallback(
    async (page = 1, pageSize = 20, statusFilter, searchText) => {
      try {
        setLoading(true)
        
        // Phân tích search: nếu là ID (vocabId) hoặc text (searchText)
        // VocabId thường có format: chữ và số, không có khoảng trắng, độ dài từ 10-20 ký tự
        let vocabId = null
        let searchQuery = null
        
        const trimmedSearch = searchText?.trim()
        if (trimmedSearch) {
          // Kiểm tra pattern: không có khoảng trắng, không có ký tự đặc biệt tiếng Hàn (한글), độ dài >= 10
          // Nếu có ký tự tiếng Hàn thì chắc chắn là searchText
          const hasKorean = /[가-힣]/.test(trimmedSearch)
          const hasSpace = trimmedSearch.includes(' ')
          const isLongId = trimmedSearch.length >= 10 && trimmedSearch.length <= 20
          
          if (!hasKorean && !hasSpace && isLongId && /^[a-zA-Z0-9_-]+$/.test(trimmedSearch)) {
            // Có vẻ như là ID
            vocabId = trimmedSearch
          } else {
            // Là searchText (tiếng Hàn hoặc text khác)
            searchQuery = trimmedSearch
          }
        }

        const res = await fetchVocabularies({
          pageNumber: page,
          pageSize,
          status: statusFilter,
          vocabId,
          searchText: searchQuery,
        })

        // Đảm bảo res.items là array
        const items = Array.isArray(res?.items) ? res.items : []
        setData(items)
        setPagination({
          current: res?.pageNumber || page,
          pageSize: res?.pageSize || pageSize,
          total: res?.totalCount || 0,
        })
      } catch (error) {
        console.error('Error loading vocabularies:', error)
        setData([])
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    // Chỉ dùng initialData khi mount lần đầu và không có search/filter
    if (initialData && Array.isArray(initialData) && initialData.length > 0 && !search && status === undefined) {
      setData(initialData)
      setPagination((prev) => ({
        ...prev,
        total: initialData.length,
      }))
    } else {
      // Có search hoặc filter, hoặc không có initialData, load từ API
      loadData(1, 20, status, search)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData])

  // Reload khi status thay đổi
  useEffect(() => {
    // Luôn load từ API khi có filter hoặc search
    loadData(1, pagination.pageSize, status, search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // Debounce search
  useEffect(() => {
    // Luôn load từ API khi search
    const timer = setTimeout(() => {
      loadData(1, pagination.pageSize, status, search)
    }, 500) // Debounce 500ms

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const handleTableChange = (newPagination) => {
    loadData(newPagination.current, newPagination.pageSize, status, search)
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'vocabularyId',
      key: 'vocabularyId',
      width: 250,
      render: (_, record) => record.vocabularyId || record.id || '-',
    },
    { title: 'Từ', dataIndex: 'text', key: 'text' },
    { title: 'Phiên âm', dataIndex: 'pronunciation', key: 'pronunciation' },
    { title: 'Nghĩa', dataIndex: 'definition', key: 'definition' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      align: 'center',
      render: (status) => {
        const statusMap = {
          1: { label: 'Hoạt động', color: 'green' },
          0: { label: 'Không hoạt động', color: 'orange' },
          2: { label: 'Đã xóa', color: 'red' },
        }
        const statusInfo = statusMap[status] || { label: 'Không xác định', color: 'default' }
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
      },
    },
    {
      title: 'Xem',
      key: 'actions',
      align: 'center',
      width: 90,
      render: (_, record) => (
        <div
          onClick={(e) => {
            e?.stopPropagation?.()
            router.push(`/admin/vocab/${record.vocabularyId || record.id}`)
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          <EyeOutlined style={{ fontSize: 18, color: '#111' }} />
        </div>
      ),
    },
  ]

  return (
    <>
      <Space style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }}>
        <Space>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm theo ID hoặc tiếng Hàn"
            style={{ maxWidth: 360 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            value={status}
            onChange={setStatus}
            placeholder="Lọc theo trạng thái"
            style={{ minWidth: 160 }}
            allowClear
          >
            {STATUS_OPTIONS.map((option) => (
              <Option key={option.value ?? 'all'} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Space>
        <ButtonV2
          title="Thêm"
          color="#F1BE4B"
          onPress={() => router.push('/admin/vocab/create')}
          style={{ minWidth: 80, paddingVertical: 10 }}
          textStyle={{ fontSize: 14 }}
          icon={<PlusOutlined />}
        />
      </Space>
      <ManagementTable
        columns={columns}
        dataSource={data}
        loading={loading}
        onRowClick={(record) => setDrawerItem(record)}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} từ vựng`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={handleTableChange}
      />
      <DetailDrawer
        open={!!drawerItem}
        onClose={() => setDrawerItem(null)}
        title="Chi tiết từ vựng"
        data={drawerItem || {}}
      />
    </>
  )
}

export default VocabularyManagement

