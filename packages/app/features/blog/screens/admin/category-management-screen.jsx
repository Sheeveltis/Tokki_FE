'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'solito/navigation'
import { Space, Tooltip, Modal, Form, Input, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import ManagementLayout from '../../../../../components/layout/management-layout.jsx'
import { getCategoriesPaged, createCategory, updateCategory, deleteCategory, importCategories, exportCategories } from '../../api'
import { useManagementFilters } from '../../../back-office/hooks/use-management-filters.js'

export function CategoryManagement() {
  const router = useRouter()
  const [form] = Form.useForm()

  const [filters, setFilters] = useManagementFilters({
    search: '',
    page: 1,
    size: 20,
  })

  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const fileInputRef = React.useRef(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await getCategoriesPaged({
        pageNumber: filters.page,
        pageSize: filters.size,
        searchTerm: filters.search
      })
      setData(res.items || [])
      setTotal(res.totalCount || 0)
    } catch (error) {
      console.error('Failed to load categories:', error)
      message.error('Không thể tải danh sách danh mục')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [filters.page, filters.size, filters.search])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePaginationChange = (newPage, newSize) => {
    setFilters(prev => ({
      ...prev,
      page: prev.size !== newSize ? 1 : newPage,
      size: newSize
    }))
  }

  const handleOpenModal = (item = null) => {
    setEditingItem(item)
    if (item) {
      form.setFieldsValue({
        name: item.name,
      })
    } else {
      form.resetFields()
    }
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingItem(null)
    form.resetFields()
  }

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true)
      if (editingItem) {
        await updateCategory(editingItem.id, values)
        message.success('Cập nhật danh mục thành công')
      } else {
        await createCategory(values)
        message.success('Thêm danh mục thành công')
      }
      handleCloseModal()
      loadData()
    } catch (error) {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = (item) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      centered: true,
      content: `Bạn có chắc chắn muốn xóa danh mục "${item.name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      okButtonProps: { 
        style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } 
      },
      cancelButtonProps: { 
        style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } 
      },
      onOk: async () => {
        try {
          await deleteCategory(item.id)
          message.success('Xóa danh mục thành công')
          loadData()
        } catch (error) {
          message.error('Không thể xóa danh mục này')
        }
      }
    })
  }

  const handleImport = async (file) => {
    try {
      setImporting(true)
      const res = await importCategories(file)
      if (res?.isSuccess) {
        message.success('Import danh mục thành công')
        loadData()
      } else {
        message.error(res?.message || 'Import thất bại')
      }
    } catch (error) {
      message.error('Lỗi khi import file')
    } finally {
      setImporting(false)
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const blob = await exportCategories()
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `DS_DanhMuc_Blog_${new Date().getTime()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      message.success('Xuất file thành công')
    } catch (error) {
      message.error('Không thể xuất file')
    } finally {
      setExporting(false)
    }
  }

  const columns = useMemo(() => [
    {
      title: 'STT',
      key: 'stt',
      align: 'center',
      width: 70,
      render: (_, __, index) => (filters.page - 1) * filters.size + index + 1
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (text) => <span style={{ color: '#666' }}>{text}</span>
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      render: (val) => val ? new Date(val).toLocaleString('vi-VN') : '--'
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      width: 150,
      render: (_, record) => {
        const iconStyle = { fontSize: 20, cursor: 'pointer', color: '#1890ff' }
        return (
          <Space size="middle">
            <Tooltip title="Chỉnh sửa">
              <EditOutlined style={iconStyle} onClick={() => handleOpenModal(record)} />
            </Tooltip>
            <Tooltip title="Xóa">
              <DeleteOutlined style={{ ...iconStyle }} onClick={() => handleDelete(record)} />
            </Tooltip>
          </Space>
        )
      }
    }
  ], [filters, data])

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
      onPress: () => handleOpenModal()
    }
  ]

  return (
    <>
      <ManagementLayout
        title="Quản lý Danh mục Blog"
        searchPlaceholder="Tìm kiếm tên danh mục..."
        searchValue={filters.search}
        onSearchChange={val => setFilters(prev => ({ ...prev, search: val }))}
        onSearchSubmit={() => handleFilterChange('search', filters.search)}
        actions={actions}
        tableProps={{
          columns,
          dataSource: data || [],
          loading: loading,
          rowKey: "id",
          pagination: {
            current: filters.page,
            pageSize: filters.size,
            total: total,
            onChange: handlePaginationChange
          }
        }}
      />

      <Modal
        title={editingItem ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        open={modalOpen}
        centered
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        okText={editingItem ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        okButtonProps={{ 
          style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } 
        }}
        cancelButtonProps={{ 
          style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } 
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="Tên danh mục"
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên danh mục' },
              { max: 100, message: 'Tên không quá 100 ký tự' }
            ]}
          >
            <Input placeholder="Ví dụ: Văn hóa & Đời sống" />
          </Form.Item>
        </Form>
      </Modal>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".xlsx, .xls"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleImport(file)
            e.target.value = ''
          }
        }}
      />
    </>
  )
}

export default CategoryManagement
