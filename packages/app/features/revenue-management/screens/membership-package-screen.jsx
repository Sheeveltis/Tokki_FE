'use client'

import React, { useState, useMemo } from 'react'
import { Space, Typography, Tag, Modal, Form, Input, InputNumber, message, Tooltip, Select } from 'antd'
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  FontSizeOutlined, 
  IdcardOutlined, 
  HistoryOutlined, 
  DollarOutlined, 
  CheckCircleOutlined, 
  FileTextOutlined 
} from '@ant-design/icons'
import ManagementLayout from '../../../../components/layout/management-layout.jsx'
import { useManagementFilters } from '../../back-office/hooks/use-management-filters.js'
import { usePackagesQuery } from '../../back-office/api/useAdminQueries.js'
import { createPackage, updatePackage, deletePackage } from '../../back-office/api/admin-index.js'
import { statusPackage } from '../../../string.js'

const { Text } = Typography
const { TextArea } = Input
const { Option } = Select

export function MembershipPackage() {
  const { data: packages = [], isLoading, refetch } = usePackagesQuery()
  const [filters, setFilters] = useManagementFilters({
    search: '',
    page: 1,
    size: 10,
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [form] = Form.useForm()

  const handleAdd = () => {
    setEditingPackage(null)
    form.resetFields()
    form.setFieldsValue({ isActive: true, packageType: 'VIP' })
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditingPackage(record)
    form.setFieldsValue({
      ...record,
      isActive: record.isActive ?? (record.status === 'active'),
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa gói thành viên này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deletePackage(id)
          message.success('Đã xóa gói thành viên')
          refetch()
        } catch (error) {
          message.error('Lỗi khi xóa gói thành viên')
        }
      },
    })
  }

  const handleSubmit = async (values) => {
    try {
      if (editingPackage) {
        await updatePackage(editingPackage.id, values)
        message.success('Đã cập nhật gói thành viên')
      } else {
        await createPackage(values)
        message.success('Đã thêm gói thành viên mới')
      }
      setIsModalOpen(false)
      form.resetFields()
      refetch()
    } catch (error) {
      message.error('Lỗi khi lưu gói thành viên')
    }
  }

  const columns = useMemo(() => [
    {
      title: 'STT',
      key: 'stt',
      align: 'center',
      width: 60,
      render: (_, __, index) => (filters.page - 1) * filters.size + index + 1,
    },
    {
      title: 'Tên gói',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong style={{ fontSize: '14px' }}>{text}</Text>,
    },
    {
      title: 'Loại gói',
      dataIndex: 'packageType',
      key: 'packageType',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Thời hạn',
      dataIndex: 'durationDays',
      key: 'durationDays',
      align: 'center',
      render: (days) => `${days} ngày`,
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (price) => (
        <Text strong style={{ color: '#F87218', fontSize: '14px' }}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
        </Text>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => <Text type="secondary" style={{ fontSize: '13px' }}>{text}</Text>
    },
    {
      title: 'Trạng thái',
      key: 'status',
      align: 'center',
      render: (_, record) => {
        const active = record.isActive ?? (record.status === 'active')
        return (
          <Tag
            color={active ? 'green' : 'red'}
            style={{ borderRadius: 12, padding: '0 12px', fontSize: '11px' }}
          >
            {active ? 'Đang hoạt động' : 'Tạm dừng'}
          </Tag>
        )
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ fontSize: 18, color: '#1890ff', cursor: 'pointer' }}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ fontSize: 18, color: '#ff4d4f', cursor: 'pointer' }}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ], [filters.page, filters.size])

  const actions = [
    {
      label: 'Thêm gói mới',
      icon: <PlusOutlined />,
      type: 'primary',
      onPress: handleAdd
    }
  ]

  const filteredData = useMemo(() => {
    if (!filters.search) return packages
    return packages.filter(p => 
      p.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      p.description?.toLowerCase().includes(filters.search.toLowerCase())
    )
  }, [packages, filters.search])

  return (
    <>
      <ManagementLayout
        searchPlaceholder="Tìm kiếm tên gói, mô tả..."
        searchValue={filters.search}
        onSearchChange={(val) => setFilters(prev => ({ ...prev, search: val }))}
        actions={actions}
        tableProps={{
          columns,
          dataSource: filteredData,
          rowKey: "id",
          loading: isLoading,
          pagination: {
            current: filters.page,
            pageSize: filters.size,
            total: filteredData.length,
            onChange: (page, size) => setFilters(prev => ({ ...prev, page, size })),
          },
        }}
      />

      <Modal
        title={editingPackage ? 'Chỉnh sửa gói thành viên' : 'Thêm gói thành viên mới'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        width={600}
        okText={editingPackage ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        okButtonProps={{ style: { borderRadius: '2rem', height: 40, padding: '0 24px' } }}
        cancelButtonProps={{ style: { borderRadius: '2rem', height: 40, padding: '0 24px' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }} requiredMark={false}>
          <Form.Item
            label={<Space><FontSizeOutlined style={{ color: '#1677ff' }} />Tên gói (Bắt buộc)</Space>}
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên gói' }]}
          >
            <Input placeholder="VD: VIP MONTHLY" size="large" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              label={<Space><IdcardOutlined style={{ color: '#1677ff' }} />Loại gói (Bắt buộc)</Space>}
              name="packageType"
              style={{ width: 260 }}
              rules={[{ required: true, message: 'Vui lòng chọn loại gói' }]}
            >
              <Select size="large" style={{ borderRadius: 8 }}>
                <Option value="VIP">VIP</Option>
                <Option value="PREMIUM">PREMIUM</Option>
                <Option value="BASIC">BASIC</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label={<Space><HistoryOutlined style={{ color: '#1677ff' }} />Thời hạn (ngày) (Bắt buộc)</Space>}
              name="durationDays"
              style={{ width: 260 }}
              rules={[{ required: true, message: 'Vui lòng nhập thời hạn' }]}
            >
              <InputNumber
                min={1}
                placeholder="VD: 30, 180, 365"
                style={{ width: '100%', borderRadius: 8 }}
                size="large"
              />
            </Form.Item>
          </Space>

          <Form.Item
            label={<Space><DollarOutlined style={{ color: '#1677ff' }} />Giá (VND) (Bắt buộc)</Space>}
            name="price"
            rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
          >
            <InputNumber
              min={0}
              placeholder="VD: 99000"
              style={{ width: '100%', borderRadius: 8 }}
              size="large"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            label={<Space><CheckCircleOutlined style={{ color: '#1677ff' }} />Trạng thái</Space>}
            name="isActive"
            valuePropName="checked"
          >
            <Select size="large" style={{ borderRadius: 8 }}>
              <Option value={true}>Hoạt động</Option>
              <Option value={false}>Tạm dừng</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={<Space><FileTextOutlined style={{ color: '#1677ff' }} />Mô tả (Bắt buộc)</Space>}
            name="description"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea rows={4} placeholder="Mô tả về gói thành viên" style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default MembershipPackage


