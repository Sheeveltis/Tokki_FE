import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'solito/navigation'
import { Space, message, Modal, Tooltip, Tag } from 'antd'
import { EyeOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import ManagementLayout from '../../../../../components/layout/management-layout.jsx'
import { getPronunciationRules } from '../../api/index.js'
import PronunciationRuleDetail from './components/pronunciation-rule-detail.jsx'

export function PronunciationManagementScreen({ basePath = '/admin' }) {
  const router = useRouter()
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRule, setSelectedRule] = useState(null)

  const fetchRules = async () => {
    try {
      setLoading(true)
      const data = await getPronunciationRules()
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

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      align: 'center',
      width: 60,
      render: (_, __, index) => index + 1
    },
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
      width: 120,
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
        </Space>
      ),
    },
  ]

  const actions = [
    {
      label: 'Thêm quy tắc',
      icon: <PlusOutlined />,
      type: 'primary',
      onPress: () => router.push(`${basePath}/pronunciation/rules/create`)
    }
  ]

  if (selectedRule) {
    return (
      <PronunciationRuleDetail 
        rule={selectedRule} 
        onBack={() => setSelectedRule(null)} 
      />
    )
  }

  return (
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
  )
}

export default PronunciationManagementScreen
