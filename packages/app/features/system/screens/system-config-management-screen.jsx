import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'solito/navigation'
import { Modal, Form, Space, Input, InputNumber, Switch, Tooltip, Typography, Tag, Button, Select } from 'antd'
import { 
  EditOutlined, 
  EyeOutlined, 
  SearchOutlined, 
  SaveOutlined, 
  FilterOutlined, 
  ReloadOutlined, 
  PlusOutlined,
  KeyOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import { showAdminSuccess, showAdminError } from '../../../../components/HelperAdmin'
import { fetchSystemConfigs, updateSystemConfig, createSystemConfig } from '../api/system-config'
import ManagementLayout from '../../../../components/layout/management-layout'
import { useManagementFilters } from '../../back-office/hooks/use-management-filters'

const { Text } = Typography

export function SystemConfigManagement({ basePath = '/admin' }) {
  const router = useRouter()
  const [filters, setFilters] = useManagementFilters({
    search: '',
    isActive: true,
    page: 1,
    size: 20,
  })

  const [data, setData] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
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
    setIsEdit(true)
    setEditingConfig(record)
    form.setFieldsValue({
      ...record,
      value: record.dataType === 'int' ? Number(record.value) : record.value
    })
    setModalOpen(true)
  }, [form])

  const handleCreate = useCallback(() => {
    setIsEdit(false)
    setEditingConfig(null)
    form.resetFields()
    form.setFieldsValue({
      dataType: 'string',
      isActive: true
    })
    setModalOpen(true)
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
      label: 'Thêm mới',
      icon: <PlusOutlined />,
      type: 'primary',
      onPress: handleCreate,
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
            {isEdit ? <EditOutlined style={{ color: '#1890ff' }} /> : <PlusOutlined style={{ color: '#52c41a' }} />}
            <Text strong>{isEdit ? 'Chỉnh sửa cấu hình hệ thống' : 'Thêm mới cấu hình hệ thống'}</Text>
          </Space>
        }
        open={modalOpen}
        onCancel={() => !saving && setModalOpen(false)}
        destroyOnClose
        centered
        footer={[
          <Button key="cancel" onClick={() => setModalOpen(false)} disabled={saving}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={() => form.submit()}
          >
            {isEdit ? 'Lưu thay đổi' : 'Tạo mới cấu hình'}
          </Button>
        ]}
      >
        <Form
          layout="vertical"
          form={form}
          requiredMark={false}
          onFinish={async (values) => {
            try {
              setSaving(true)
              const payload = {
                ...editingConfig,
                ...values,
                value: String(values.value)
              }
              if (isEdit) {
                await updateSystemConfig(payload)
                showAdminSuccess('Đã cập nhật cấu hình hệ thống thành công')
              } else {
                await createSystemConfig(payload)
                showAdminSuccess('Đã tạo mới cấu hình hệ thống thành công')
              }
              setModalOpen(false)
              loadData(filters)
            } catch (err) {
              showAdminError(err?.message || (isEdit ? 'Cập nhật cấu hình thất bại' : 'Tạo mới cấu hình thất bại'))
            } finally {
              setSaving(false)
            }
          }}
        >
          <Form.Item
            label={<Space><KeyOutlined style={{ color: '#1677ff' }} />Khóa (Key) (Bắt buộc)</Space>}
            name="key"
            rules={[{ required: true, message: 'Vui lòng nhập khóa (key)' }]}
          >
            <Input disabled={isEdit} placeholder="Ví dụ: TOKEN_EXPIRATION_TIME" />
          </Form.Item>

          <Form.Item
            label={<Space><AppstoreOutlined style={{ color: '#1677ff' }} />Loại dữ liệu (Bắt buộc)</Space>}
            name="dataType"
            rules={[{ required: true, message: 'Vui lòng chọn loại dữ liệu' }]}
          >
            <Select placeholder="Chọn kiểu dữ liệu">
              <Select.Option value="string">String</Select.Option>
              <Select.Option value="int">Integer</Select.Option>
              <Select.Option value="boolean">Boolean</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item dependencies={['dataType']} noStyle>
            {({ getFieldValue }) => {
              const dataType = getFieldValue('dataType')
              if (dataType === 'int') {
                return (
                  <Form.Item
                    label={<Space><EditOutlined style={{ color: '#1677ff' }} />Giá trị (Bắt buộc)</Space>}
                    name="value"
                    rules={[{ required: true, message: 'Vui lòng nhập giá trị số' }]}
                  >
                    <InputNumber style={{ width: '100%' }} placeholder="Nhập số..." />
                  </Form.Item>
                )
              }
              if (dataType === 'boolean') {
                return (
                  <Form.Item
                    label={<Space><EditOutlined style={{ color: '#1677ff' }} />Giá trị</Space>}
                    name="value"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                  </Form.Item>
                )
              }
              return (
                <Form.Item
                  label={<Space><EditOutlined style={{ color: '#1677ff' }} />Giá trị (Bắt buộc)</Space>}
                  name="value"
                  rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}
                >
                  <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} placeholder="Nhập nội dung cấu hình..." />
                </Form.Item>
              )
            }}
          </Form.Item>

          <Form.Item label={<Space><FileTextOutlined style={{ color: '#1677ff' }} />Mô tả</Space>} name="description">
            <Input.TextArea rows={3} placeholder="Mô tả chi tiết tác dụng của cấu hình này..." />
          </Form.Item>

          <Form.Item label={<Space><CheckCircleOutlined style={{ color: '#1677ff' }} />Kích hoạt</Space>} name="isActive" valuePropName="checked">
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default SystemConfigManagement
