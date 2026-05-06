'use client'

import { useState, useCallback, useMemo, useRef } from 'react'
import { PlusOutlined, UploadOutlined, AppstoreOutlined, TableOutlined, FilterOutlined } from '@ant-design/icons'
import { Modal, Space, message, Select } from 'antd'
import { useQueryClient } from '@tanstack/react-query'

import { 
  updateAlphabet, 
  deleteAlphabet, 
  createAlphabet, 
  importAlphabetFromExcel, 
  toggleAlphabetStatus,
  fetchAlphabetById
} from '../../api/index.js'
import { useAlphabet, useAlphabetPaginated } from '../../api/alphabet-hooks'
import ManagementLayout from '../../../../../components/layout/management-layout.jsx'
import { AlphabetTable } from '../../components/alphabet-study/alphabet-table'
import AlphabetDetailModal from '../../components/admin/alphabet-detail-modal'
import { getAlphabetColumns } from '../../components/admin/alphabet-management-columns'

const { Option } = Select

// Mapping for API (Enum AlphabetType: Vowel = 1, Consonant = 2)
const TYPE_MAP = {
  'all': undefined,
  'Vowel': 1,
  'Consonant': 2
}

const REVERSE_TYPE_MAP = {
  1: 'Vowel',
  2: 'Consonant'
}

export function AlphabetManagement() {
  const queryClient = useQueryClient()
  
  const [viewMode, setViewMode] = useState('grid') 
  const [searchText, setSearchText] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  
  // Pagination state for table view
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  
  // 1. Hook for GRID VIEW (Fetches all data)
  const { data: allDataResponse, isLoading: isAllLoading } = useAlphabet({
    type: TYPE_MAP[filterType],
    isActive: filterStatus === 'all' ? undefined : filterStatus === 'active'
  })
  const rawData = allDataResponse?.data || []

  // 2. Hook for TABLE VIEW (Paginated)
  const { data: paginatedResponse, isLoading: isPaginatedLoading } = useAlphabetPaginated({
    PageNumber: page,
    PageSize: pageSize,
    SearchTerm: searchText || undefined,
    Type: TYPE_MAP[filterType],
    IsActive: filterStatus === 'all' ? undefined : filterStatus === 'active'
  })
  
  const tableData = paginatedResponse?.items || []
  const totalItems = paginatedResponse?.totalCount || 0

  const [modalOpen, setModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  
  const fileInputRef = useRef(null)
  const [importing, setImporting] = useState(false)

  const handleEdit = useCallback(async (record) => {
    // If we only have basic info, fetch full detail including JSON
    if (record.id && (!record.displayDataJson || !record.validationDataJson)) {
      try {
        message.loading({ content: 'Đang tải chi tiết...', key: 'loading_detail' })
        const fullDetail = await fetchAlphabetById(record.id)
        if (fullDetail) {
          message.success({ content: 'Đã tải chi tiết', key: 'loading_detail', duration: 1 })
          const normalizedItem = {
            ...fullDetail,
            type: typeof fullDetail.type === 'number' ? REVERSE_TYPE_MAP[fullDetail.type] : fullDetail.type
          }
          setEditingItem(normalizedItem)
          setModalOpen(true)
          return
        }
      } catch (error) {
        message.error({ content: 'Không thể tải chi tiết', key: 'loading_detail' })
      }
    }

    const normalizedItem = {
      ...record,
      type: typeof record.type === 'number' ? REVERSE_TYPE_MAP[record.type] : record.type
    }
    setEditingItem(normalizedItem)
    setModalOpen(true)
  }, [])

  const handleDelete = useCallback((record) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa chữ cái "${record.letter}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await deleteAlphabet(record.id)
          if (res?.isSuccess) {
            message.success('Đã xóa thành công')
            queryClient.invalidateQueries({ queryKey: ['alphabet'] })
          } else {
            message.error(res?.message || 'Xóa thất bại')
          }
        } catch (error) {
          message.error('Lỗi khi xóa')
        }
      }
    })
  }, [queryClient])

  const handleToggleActive = useCallback(async (record) => {
    try {
      const res = await toggleAlphabetStatus(record.id)
      if (res?.isSuccess) {
        message.success('Cập nhật trạng thái thành công')
        queryClient.invalidateQueries({ queryKey: ['alphabet'] })
      } else {
        message.error(res?.message || 'Cập nhật thất bại')
      }
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái')
    }
  }, [queryClient])

  const handleModalSubmit = async (values) => {
    try {
      setModalLoading(true)
      const payload = {
        ...values,
        type: TYPE_MAP[values.type] || values.type
      }
      
      const res = values.id ? await updateAlphabet(payload) : await createAlphabet(payload)
      if (res?.isSuccess) {
        message.success(values.id ? 'Cập nhật thành công' : 'Thêm mới thành công')
        setModalOpen(false)
        queryClient.invalidateQueries({ queryKey: ['alphabet'] })
      } else {
        message.error(res?.message || 'Thao tác thất bại')
      }
    } catch (error) {
      message.error('Lỗi hệ thống')
    } finally {
      setModalLoading(false)
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setImporting(true)
    try {
      const res = await importAlphabetFromExcel(file)
      if (res?.isSuccess) {
        message.success(res.message || 'Import thành công')
        queryClient.invalidateQueries({ queryKey: ['alphabet'] })
      } else {
        message.error(res?.message || 'Import thất bại')
      }
    } catch (error) {
      message.error('Lỗi hệ thống khi import')
    } finally {
      setImporting(false)
    }
  }

  const mappedTableData = useMemo(() => {
    if (!Array.isArray(rawData)) return []
    const vowels = rawData.filter(d => d.type === 'Vowel' || d.type === 1).sort((a, b) => a.sortOrder - b.sortOrder)
    const consonants = rawData.filter(d => d.type === 'Consonant' || d.type === 2).sort((a, b) => a.sortOrder - b.sortOrder)
    return [
      ...consonants.map((c, i) => ({ ...c, word: c.letter, type: 'consonant', row: i < 11 ? 1 : 2 })),
      ...vowels.map((v, i) => ({ ...v, word: v.letter, type: 'vowel', row: i < 10 ? 1 : 2 })),
    ]
  }, [rawData])

  const columns = useMemo(() => getAlphabetColumns({ 
    onEdit: handleEdit, 
    onDelete: handleDelete, 
    onToggleActive: handleToggleActive 
  }), [handleEdit, handleDelete, handleToggleActive])

  const extraFilters = (
    <Space wrap>
      <Select defaultValue="all" style={{ width: 150 }} onChange={setFilterType} suffixIcon={<FilterOutlined />}>
        <Option value="all">Tất cả loại</Option>
        <Option value="Vowel">Nguyên âm</Option>
        <Option value="Consonant">Phụ âm</Option>
      </Select>
      <Select defaultValue="all" style={{ width: 150 }} onChange={setFilterStatus} suffixIcon={<FilterOutlined />}>
        <Option value="all">Tất cả trạng thái</Option>
        <Option value="active">Đang hoạt động</Option>
        <Option value="inactive">Đã ẩn</Option>
      </Select>
    </Space>
  )

  const actions = [
    { label: 'Import', icon: <UploadOutlined />, type: 'dashed', onPress: () => fileInputRef.current?.click(), loading: importing },
    { label: 'Thêm mới', icon: <PlusOutlined />, onPress: () => { setEditingItem(null); setModalOpen(true); } },
  ]

  const handlePaginationChange = (newPage, newSize) => {
    setPage(newPage)
    setPageSize(newSize)
  }

  return (
    <>
      <ManagementLayout
        searchPlaceholder="Tìm kiếm chữ cái, ý nghĩa..."
        searchValue={searchText}
        onSearchChange={setSearchText}
        onSearchSubmit={() => setPage(1)}
        actions={actions}
        extraFilters={extraFilters}
        showViewToggle 
        viewMode={viewMode === 'grid' ? 'card' : 'table'} 
        onViewModeChange={(mode) => setViewMode(mode === 'card' ? 'grid' : 'table')}
        tableProps={viewMode === 'table' ? {
          columns,
          dataSource: tableData,
          loading: isPaginatedLoading,
          rowKey: "id",
          pagination: { 
            current: page,
            pageSize: pageSize,
            total: totalItems,
            onChange: handlePaginationChange
          }
        } : null}
      >
        {viewMode === 'grid' && (
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', minHeight: '500px' }}>
            <AlphabetTable 
              data={mappedTableData} 
              onSelectLetter={(idx) => handleEdit(mappedTableData[idx])} 
              loading={isAllLoading}
            />
          </div>
        )}
      </ManagementLayout>

      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".xlsx, .xls" onChange={handleFileChange} />
      
      <AlphabetDetailModal 
        open={modalOpen}
        loading={modalLoading}
        initialValues={editingItem}
        onCancel={() => { setModalOpen(false); setEditingItem(null); }}
        onSubmit={handleModalSubmit}
      />
    </>
  )
}

export default AlphabetManagement
