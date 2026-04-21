import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'solito/navigation'
import { Space, message, Modal, Tooltip, Tag, InputNumber } from 'antd'
import { EyeOutlined, EditOutlined, PlusOutlined, DeleteOutlined, SwapOutlined } from '@ant-design/icons'
import ManagementLayout from '../../../../../components/layout/management-layout.jsx'
import { getPronunciationRules, createPronunciationRule, deletePronunciationRule } from '../../api/index.js'
import PronunciationRuleDetail from './components/pronunciation-rule-detail.jsx'
import PronunciationRuleCreateModal from './components/pronunciation-rule-create-modal.jsx'

export function PronunciationManagementScreen({ basePath = '/admin' }) {
  const router = useRouter()
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRule, setSelectedRule] = useState(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [orderRule, setOrderRule] = useState(null)
  const [orderValue, setOrderValue] = useState(null)

  const fetchRules = async () => {
    try {
      setLoading(true)
      const data = await getPronunciationRules('admin')
      setRules(data)
    } catch (error) {
      message.error(error.message || 'Không thể tải danh sách quy tắc phát âm')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRules()
  }, [])

  const filteredRules = useMemo(() => {
    return rules.filter(rule => 
      rule.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [rules, searchTerm])

  const handleCreate = async (values) => {
    try {
      setCreateLoading(true)
      await createPronunciationRule(values)
      message.success('Đã tạo quy tắc phát âm thành công')
      setCreateModalOpen(false)
      fetchRules()
    } catch (err) {
      message.error(err.message || 'Tạo quy tắc phát âm thất bại')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDeleteRule = (record) => {
    Modal.confirm({
      title: 'Xác nhận xóa quy tắc',
      centered: true,
      content: `Bạn chắc chắn muốn xóa quy tắc "${record.title}"?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { 
        danger: true,
        style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } 
      },
      cancelButtonProps: { 
        style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } 
      },
      onOk: async () => {
        try {
          await deletePronunciationRule(record.id)
          message.success('Đã xóa quy tắc phát âm thành công')
          fetchRules()
        } catch (err) {
          message.error(err.message || 'Xóa quy tắc phát âm thất bại')
        }
      },
    })
  }

  const handleOpenOrderIndexModal = (record, e) => {
    e?.stopPropagation?.()
    setOrderRule(record)
    setOrderValue(record?.sortOrder ?? 1)
    setOrderModalOpen(true)
  }

  const handleUpdateOrderIndex = async () => {
    // Logic API cho phần chuyển đổi sẽ làm sau như yêu cầu
    message.info('Tính năng cập nhật thứ tự đang được phát triển')
    setOrderModalOpen(false)
    setOrderRule(null)
  }

  const columns = [
    {
      title: 'Tên quy tắc',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      render: (text) => (
        <span style={{ 
          fontWeight: 600,
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          wordBreak: 'break-word'
        }}>
          {text}
        </span>
      )
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (text) => (
        <span style={{ 
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          wordBreak: 'break-word',
          color: '#8c8c8c'
        }}>
          {text}
        </span>
      )
    },
    {
      title: 'Thứ tự',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      align: 'center',
      width: 100,
      render: (order) => <Tag color="blue">{order}</Tag>
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      width: 180,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <EyeOutlined
              style={{ fontSize: 18, cursor: 'pointer', color: '#1890ff' }}
              onClick={() => setSelectedRule(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ fontSize: 18, cursor: 'pointer', color: '#1890ff' }}
              onClick={() => router.push(`${basePath}/pronunciation/rules/${record.id}/edit`)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ fontSize: 18, cursor: 'pointer', color: '#ff4d4f' }}
              onClick={() => handleDeleteRule(record)}
            />
          </Tooltip>
          <Tooltip title="Đổi vị trí">
            <SwapOutlined
              style={{ fontSize: 18, cursor: 'pointer', color: '#1890ff' }}
              onClick={(e) => handleOpenOrderIndexModal(record, e)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  const actions = [
    {
      label: 'Thêm quy tắc',
      icon: <PlusOutlined />,
      type: 'primary',
      onPress: () => setCreateModalOpen(true)
    }
  ]

  if (selectedRule) {
    return (
      <PronunciationRuleDetail 
        rule={selectedRule} 
        onBack={() => setSelectedRule(null)} 
        onEdit={() => router.push(`${basePath}/pronunciation/rules/${selectedRule.id}/edit`)}
        onDelete={handleDeleteRule}
      />
    )
  }

  return (
    <>
      <ManagementLayout
        title="Quản lý Phát âm"
        searchPlaceholder="Tìm theo tên quy tắc, mô tả..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        actions={actions}
        tableProps={{
          columns,
          dataSource: filteredRules,
          loading: loading,
          rowKey: 'id',
          pagination: {
            pageSize: 10,
            showSizeChanger: true,
          }
        }}
      />
      <PronunciationRuleCreateModal
        open={createModalOpen}
        loading={createLoading}
        onCancel={() => setCreateModalOpen(false)}
        onSubmit={handleCreate}
      />
      
      <Modal
        title="Đổi vị trí quy tắc"
        open={orderModalOpen}
        onOk={handleUpdateOrderIndex}
        onCancel={() => {
          setOrderModalOpen(false)
          setOrderRule(null)
          setOrderValue(null)
        }}
        okText="Lưu"
        cancelText="Hủy"
        okButtonProps={{ 
          style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } 
        }}
        cancelButtonProps={{ 
          style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } 
        }}
        centered
        width={420}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 0' }}>
          <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 8, padding: '10px 12px', fontSize: 13 }}>
            <div style={{ color: '#8c8c8c', marginBottom: 4 }}>Quy tắc</div>
            <div style={{ fontWeight: 600 }}>{orderRule?.title || '-'}</div>
          </div>
          <div>
            <div style={{ marginBottom: 6, fontWeight: 500 }}>Thứ tự mới</div>
            <InputNumber
              min={1}
              value={orderValue}
              onChange={(value) => setOrderValue(value)}
              style={{ width: '100%' }}
              placeholder="Nhập thứ tự mới"
            />
          </div>
        </div>
      </Modal>
    </>
  )
}

export default PronunciationManagementScreen
