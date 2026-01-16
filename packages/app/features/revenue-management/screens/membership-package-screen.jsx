'use client'

import React, { useState } from 'react'
import { Card, Table, Space, Typography, Tag, Button, Modal, Form, Input, InputNumber, message } from 'antd'
import { ButtonV2 } from '../../../../components/buttonV2.jsx'
import { statusPackage } from '../../../string.js'
import { createPackage, updatePackage, deletePackage } from '../../admin/api/index.js'
import { usePackagesQuery } from '../../admin/api/useAdminQueries.js'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'

const { Title, Text } = Typography
const { TextArea } = Input

export function MembershipPackage() {
  const { data: packages = [], isLoading, refetch } = usePackagesQuery()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [form] = Form.useForm()

  const handleAdd = () => {
    setEditingPackage(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditingPackage(record)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa gói thành viên này?',
      onOk: async () => {
        await deletePackage(id)
        setPackages(packages.filter((p) => p.id !== id))
        message.success('Đã xóa gói thành viên')
      },
    })
  }

  const handleSubmit = async (values) => {
    if (editingPackage) {
      const result = await updatePackage(editingPackage.id, values)
      setPackages(packages.map((p) => (p.id === editingPackage.id ? { ...p, ...result } : p)))
      message.success('Đã cập nhật gói thành viên')
    } else {
      const result = await createPackage(values)
      setPackages([...packages, result])
      message.success('Đã thêm gói thành viên mới')
    }
    setIsModalOpen(false)
    form.resetFields()
  }

  const columns = [
    {
      title: 'Tên gói',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Thời hạn',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <Text strong style={{ color: '#F87218' }}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
        </Text>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'} style={{ fontSize: '12px', padding: '2px 8px' }}>
          {statusPackage[status] || status}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ color: '#111' }}
          >
            Sửa
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={3} style={{ marginBottom: 4 }}>
              Quản lý các gói thành viên
            </Title>
            <Text type="secondary">Thiết lập và điều chỉnh các gói thành viên mang lại doanh thu</Text>
          </div>
          <ButtonV2
            title="Thêm gói mới"
            color="#F1BE4B"
            onPress={handleAdd}
            style={{ minWidth: 120, paddingVertical: 10 }}
            textStyle={{ fontSize: 14 }}
          />
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={packages}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            loading={isLoading}
            expandable={{
              expandedRowRender: (record) => (
                <div style={{ padding: '16px 0' }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>
                    Tính năng:
                  </Text>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {record.features?.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              ),
            }}
          />
        </Card>
      </Space>

      <Modal
        title={editingPackage ? 'Chỉnh sửa gói thành viên' : 'Thêm gói thành viên mới'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Tên gói"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên gói' }]}
          >
            <Input placeholder="VD: VIP MONTHLY" size="large" />
          </Form.Item>

          <Form.Item
            label="Thời hạn (tháng)"
            name="durationMonths"
            rules={[{ required: true, message: 'Vui lòng nhập thời hạn' }]}
          >
            <InputNumber
              min={1}
              max={12}
              placeholder="VD: 1, 6, 12"
              style={{ width: '100%' }}
              size="large"
              onChange={(value) => {
                const durations = {
                  1: '1 tháng',
                  6: '6 tháng',
                  12: '1 năm',
                }
                form.setFieldsValue({ duration: durations[value] || `${value} tháng` })
              }}
            />
          </Form.Item>

          <Form.Item name="duration" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label="Giá (VND)"
            name="price"
            rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
          >
            <InputNumber
              min={0}
              placeholder="VD: 99000"
              style={{ width: '100%' }}
              size="large"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea rows={4} placeholder="Mô tả về gói thành viên" />
          </Form.Item>

          <Form.Item>
            <Space>
              <ButtonV2
                title={editingPackage ? 'Cập nhật' : 'Thêm mới'}
                color="#F1BE4B"
                onPress={() => form.submit()}
                style={{ minWidth: 120, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
              />
              <ButtonV2
                title="Hủy"
                color="mint"
                onPress={() => {
                  setIsModalOpen(false)
                  form.resetFields()
                }}
                style={{ minWidth: 100, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
              />
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MembershipPackage

