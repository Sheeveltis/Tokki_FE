import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'solito/navigation'
import { Modal, Form, Space, Input, InputNumber, Switch, Tooltip, Typography, Tag, Button, Select } from 'antd'
import { EditOutlined, EyeOutlined, SearchOutlined, SaveOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons'
import { showAdminSuccess, showAdminError } from '../../../../components/HelperAdmin'
import { fetchSystemConfigs, updateSystemConfig } from '../api/system-config'
import ManagementLayout from '../../../../components/layout/management-layout'
import { useManagementFilters } from '../../back-office/hooks/use-management-filters'

const { Text } = Typography

export function SystemConfigManagement({ basePath = '/admin' }) {
  const router = useRouter()
  const [filters, setFilters] = useManagementFilters({
    search: '',
    isActive: undefined,
    page: 1,
    size: 20,
  })

  const [data, setData] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingConfig, setEditingConfig] = useState(null)

  const [form] = Form.useForm()

  const loadData = useCallback(async (currentFilters) => {
    try {
      setLoading(true)
      const params = {
        keyword: currentFilters.search?.trim() || undefined,
        isActive: currentFilters.isActive,
        pageNumber: currentFilters.page,
        pageSize: currentFilters.size,
      }
      const result = await fetchSystemConfigs(params)
      setData({
        items: result?.items || [],
        total: result?.totalCount || 0
      })
    } catch (err) {
      showAdminError(err?.message || 'Không thể tải danh sách cấu hình hệ thống')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData(filters)
  }, [filters.page, filters.size, filters.search, filters.isActive, loadData])

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }, [setFilters])

  const handlePaginationChange = useCallback((newPage, newSize) => {
    setFilters(prev => ({
      ...prev,
      size: newSize,
      page: prev.size !== newSize ? 1 : newPage
    }))
  }, [setFilters])

  const handleEdit = useCallback((record) => {
    setEditingConfig(record)
    form.setFieldsValue({
      ...record,
      value: record.dataType === 'int' ? Number(record.value) : record.value
    })
    setEditModalOpen(true)
  }, [form])

  const columns = useMemo(() => [
    {
      title: () => (
        <Tooltip title="Số thứ tự">
          <span>STT</span>
        </Tooltip>
      ),
      key: 'stt',
      align: 'center',
      width: 70,
      render: (_, __, index) => (filters.page - 1) * filters.size + index + 1,
    },
    {
      title: 'Khóa (Key)',
      dataIndex: 'key',
      key: 'key',
      width: 250,
      render: (key) => <Text strong style={{ color: '#262626', fontSize: 16 }}>{key}</Text>
    },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      key: 'value',
      width: 200,
      render: (value) => <Text ellipsis style={{ maxWidth: 180 }}>{value || '-'}</Text>
    },
    // {
    //   title: 'Loại dữ liệu',
    //   dataIndex: 'dataType',
    //   key: 'dataType',
    //   width: 120,
    //   align: 'center',
    //   render: (type) => <Text type="secondary" style={{ textTransform: 'uppercase' }}>{type || 'string'}</Text>
    // },
    // {
    //   title: 'Mô tả',
    //   dataIndex: 'description',
    //   key: 'description',
    //   ellipsis: true,
    //   render: (desc) => <Text type="secondary">{desc}</Text>
    // },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      align: 'center',
      render: (isActive) => {
        const color = isActive ? '#52c41a' : '#8c8c8c'
        const label = isActive ? 'Hoạt động' : 'Tạm dừng'
        return (
          <Tooltip title={label}>
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
      align: 'center',
      width: 120,
      render: (_, record) => {
        const iconStyle = { fontSize: 18, cursor: 'pointer', color: '#1890ff' }
        return (
          <Space size="large">
            <Tooltip title="Xem chi tiết">
              <EyeOutlined
                style={iconStyle}
                onClick={() => router.push(`${basePath}/system-config/${record.key}`)}
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <EditOutlined
                style={iconStyle}
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
          </Space>
        )
      },
    },
  ], [filters.page, filters.size, router, basePath, handleEdit])

  const extraFilters = (
    <Space wrap>
      <Select
        allowClear
        placeholder="Lọc trạng thái"
        suffixIcon={<FilterOutlined />}
        style={{ width: 180 }}
        value={filters.isActive}
        onChange={(val) => handleFilterChange('isActive', val)}
        options={[
          { value: true, label: 'Hoạt động' },
          { value: false, label: 'Tạm dừng' },
        ]}
      />
    </Space>
  )

  const actions = [
    {
      label: 'Làm mới',
      icon: <ReloadOutlined />,
      type: 'dashed',
      onPress: () => loadData(filters),
    }
  ]

  return (
    <>
      <ManagementLayout
        searchPlaceholder="Tìm kiếm theo khóa (key)..."
        searchValue={filters.search}
        onSearchChange={val => setFilters(prev => ({ ...prev, search: val }))}
        onSearchSubmit={() => handleFilterChange('search', filters.search)}
        extraFilters={extraFilters}
        actions={actions}
        tableProps={{
          columns,
          dataSource: data.items,
          loading,
          rowKey: "key",
          pagination: {
            current: filters.page,
            pageSize: filters.size,
            total: data.total,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} cấu hình`,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: handlePaginationChange
          }
        }}
      />

      <Modal
        title={
          <Space>
            <EditOutlined style={{ color: '#1890ff' }} />
            <Text strong>Chỉnh sửa cấu hình hệ thống</Text>
          </Space>
        }
        open={editModalOpen}
        onCancel={() => !saving && setEditModalOpen(false)}
        destroyOnClose
        centered
        footer={[
          <Button key="cancel" onClick={() => setEditModalOpen(false)} disabled={saving}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={() => form.submit()}
          >
            Lưu thay đổi
          </Button>
        ]}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={async (values) => {
            try {
              setSaving(true)
              const payload = {
                ...editingConfig,
                ...values,
                value: String(values.value)
              }
              await updateSystemConfig(payload)
              showAdminSuccess('Đã cập nhật cấu hình hệ thống thành công')
              setEditModalOpen(false)
              loadData(filters)
            } catch (err) {
              showAdminError(err?.message || 'Cập nhật cấu hình thất bại')
            } finally {
              setSaving(false)
            }
          }}
        >
          <Form.Item label="Khóa (Key)" name="key">
            <Input disabled placeholder="Mã cấu hình" />
          </Form.Item>

          <Form.Item label="Loại dữ liệu" name="dataType">
            <Input disabled placeholder="Kiểu dữ liệu" />
          </Form.Item>

          {editingConfig?.dataType === 'int' ? (
            <Form.Item
              label="Giá trị"
              name="value"
              rules={[{ required: true, message: 'Vui lòng nhập giá trị số' }]}
            >
              <InputNumber style={{ width: '100%' }} placeholder="Nhập số..." />
            </Form.Item>
          ) : (
            <Form.Item
              label="Giá trị"
              name="value"
              rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}
            >
              <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} placeholder="Nhập nội dung cấu hình..." />
            </Form.Item>
          )}

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Mô tả chi tiết tác dụng của cấu hình này..." />
          </Form.Item>

          <Form.Item label="Kích hoạt" name="isActive" valuePropName="checked">
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default SystemConfigManagement
