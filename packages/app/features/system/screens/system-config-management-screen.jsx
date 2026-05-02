import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'solito/navigation'
import {
  Form,
  Space,
  Typography,
  Tag,
  Button,
  Select,
  Tabs,
  Card,
  Empty,
  Badge,
  Row,
  Col,
  Tooltip
} from 'antd'
import {
  EditOutlined,
  ReloadOutlined,
  PlusOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { showAdminSuccess, showAdminError } from '../../../../components/HelperAdmin'
import ManagementLayout from '../../../../components/layout/management-layout'
import { useManagementFilters } from '../../back-office/hooks/use-management-filters'
import { Segmented } from 'antd'

// Import tách nhỏ components
import { SYSTEM_CONFIG_TYPES } from '../constants/config-types.jsx'
import ConfigFormModal from '../components/config-form-modal'
import ConfigViewModal from '../components/config-view-modal'
import ConfigTypeItem from '../components/config-type-item'
import ConfigListHeader from '../components/config-list-header'
import TopikConfigTable from '../components/topik-config-table'
import TopikConfigModal from '../components/topik-config-modal'
import TopikConfigView from '../components/topik-config-view'

import { fetchSystemConfigs, updateSystemConfig, createSystemConfig } from '../api/system-config'
import { fetchTopikConfigs, createTopikConfig, updateTopikConfig } from '../api/topik-config'

const { Text, Title } = Typography

export function SystemConfigManagement({ basePath = '/admin' }) {
  const router = useRouter()
  const [filters, setFilters] = useManagementFilters({
    search: '',
    isActive: undefined, // Mặc định là Tất cả
    page: 1,
    size: 20,
    configType: 0
  })

  const [data, setData] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editingConfig, setEditingConfig] = useState(null)
  const [viewingConfig, setViewingConfig] = useState(null)

  const [form] = Form.useForm()
  const [activeSubTab, setActiveSubTab] = useState('general') // 'general' or 'topik'
  const [topikData, setTopikData] = useState([])
  const [topikLoading, setTopikLoading] = useState(false)
  const [topikModalOpen, setTopikModalOpen] = useState(false)
  const [topikViewOpen, setTopikViewOpen] = useState(false)
  const [editingTopik, setEditingTopik] = useState(null)
  const [viewingTopik, setViewingTopik] = useState(null)
  const [topikForm] = Form.useForm()

  const activeType = useMemo(() => 
    SYSTEM_CONFIG_TYPES.find(t => t.value === filters.configType) || SYSTEM_CONFIG_TYPES[0]
  , [filters.configType])

  const loadData = useCallback(async (currentFilters) => {
    try {
      setLoading(true)
      const params = {
        search: currentFilters.search?.trim() || undefined,
        isActive: currentFilters.isActive,
        pageNumber: currentFilters.page,
        pageSize: currentFilters.size,
        configType: currentFilters.configType
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
    if (filters.configType === 6 && activeSubTab === 'topik') {
      const loadTopikData = async () => {
        try {
          setTopikLoading(true)
          const result = await fetchTopikConfigs()
          setTopikData(result?.items || result || [])
        } catch (err) {
          showAdminError('Không thể tải cấu hình TOPIK')
        } finally {
          setTopikLoading(false)
        }
      }
      loadTopikData()
    } else {
      loadData(filters)
    }
  }, [filters.page, filters.size, filters.search, filters.isActive, filters.configType, activeSubTab, loadData])

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

  const handleView = useCallback((record) => {
    setViewingConfig(record)
    setViewModalOpen(true)
  }, [])

  const handleCreate = useCallback(() => {
    setIsEdit(false)
    setEditingConfig(null)
    form.resetFields()
    form.setFieldsValue({
      dataType: 'string',
      isActive: true,
      configType: filters.configType
    })
    setModalOpen(true)
  }, [form, filters.configType])

  const handleFormFinish = async (values) => {
    // ... (rest of standard config finish)
  }

  const handleTopikFormFinish = async (values) => {
    try {
      setSaving(true)
      if (editingTopik) {
        await updateTopikConfig(editingTopik.topikLevelConfigID, values)
        showAdminSuccess('Đã cập nhật cấu hình TOPIK thành công')
      } else {
        await createTopikConfig(values)
        showAdminSuccess('Đã tạo mới cấu hình TOPIK thành công')
      }
      setTopikModalOpen(false)
      // Reload topik data
      const result = await fetchTopikConfigs()
      setTopikData(result?.items || result || [])
    } catch (err) {
      showAdminError(err?.message || 'Thao tác thất bại')
    } finally {
      setSaving(false)
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
      title: 'Khóa (Key)',
      dataIndex: 'key',
      key: 'key',
      width: 250,
      render: (key, record) => (
        <div style={{ width: 250 }}>
          <Space direction="vertical" size={0} style={{ width: '100%' }}>
            <Text
              strong
              style={{ color: '#1677ff', fontSize: 13, display: 'block' }}
              ellipsis={{ tooltip: key }}
            >
              {key}
            </Text>
            <Text
              type="secondary"
              style={{ fontSize: 11, display: 'block' }}
              ellipsis={{ tooltip: record.description }}
            >
              {record.description || 'Không có mô tả'}
            </Text>
          </Space>
        </div>
      )
    },
    {
      title: 'Giá trị cấu hình',
      dataIndex: 'value',
      key: 'value',
      render: (value, record) => {
        if (record.dataType === 'boolean') {
          return <Tag color={value === 'true' || value === true ? 'green' : 'red'}>{value === 'true' || value === true ? 'BẬT' : 'TẮT'}</Tag>
        }

        // Truncate if value is too long
        const isLong = value && value.length > 120
        const displayValue = isLong ? value.substring(0, 120) + '...' : value

        return (
          <div style={{
            background: '#f9f9f9',
            padding: '4px 10px',
            borderRadius: '4px',
            border: '1px solid #f0f0f0',
            display: 'inline-block',
            maxWidth: '350px',
            cursor: isLong ? 'pointer' : 'default'
          }} onClick={() => isLong && handleView(record)}>
            <Text code style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: 12 }}>{displayValue || '-'}</Text>
            {isLong && <div style={{ fontSize: 10, color: '#1890ff', marginTop: 2 }}>[Xem thêm]</div>}
          </div>
        )
      }
    },
    {
      title: 'Kiểu',
      dataIndex: 'dataType',
      key: 'dataType',
      width: 80,
      align: 'center',
      render: (type) => <Tag color="blue" style={{ borderRadius: '10px', fontSize: 11 }}>{type?.toUpperCase()}</Tag>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center',
      render: (isActive) => (
        <Tooltip title={isActive ? 'Đang hoạt động' : 'Đang tắt'}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              backgroundColor: isActive ? '#52c41a' : '#bfbfbf',
              margin: '0 auto',
              boxShadow: '0 0 4px rgba(0,0,0,0.2)',
              cursor: 'pointer',
            }}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      width: 100,
      render: (_, record) => {
        const iconStyle = { fontSize: 18, cursor: 'pointer', color: '#1890ff' }
        return (
          <Space size="large">
            <Tooltip title="Xem chi tiết">
              <EyeOutlined
                style={iconStyle}
                onClick={() => handleView(record)}
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
  ], [filters.page, filters.size, handleEdit, handleView])

  return (
    <div style={{
      height: 'calc(100vh - 140px)', // Tăng khoảng cách trừ đi để tránh bị che bởi footer admin
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      overflow: 'hidden' // Không cho scroll cả trang
    }}>
      <style>{`
        .system-config-tabs {
          height: 100%;
        }
        .system-config-tabs .ant-tabs-content-holder {
          height: 100%;
          display: flex;
        }
        .system-config-tabs .ant-tabs-content {
          height: 100%;
          width: 100%;
        }
        .system-config-tabs .ant-tabs-tabpane {
          height: 100% !important;
          display: flex !important;
          flex-direction: column;
        }
      `}</style>
      <ConfigListHeader onCreate={handleCreate} />

      <Card
        variant="borderless"
        styles={{ body: { padding: 0, height: '100%', display: 'flex', flexDirection: 'column' } }}
        style={{
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          flex: 1,
          minHeight: 0
        }}
      >
        <Tabs
          tabPlacement="left"
          activeKey={String(filters.configType)}
          onChange={(key) => handleFilterChange('configType', Number(key))}
          style={{ height: '100%', width: '100%', flex: 1 }}
          className="system-config-tabs"
          destroyInactiveTabPane
          items={SYSTEM_CONFIG_TYPES.map(type => ({
            key: String(type.value),
            label: <ConfigTypeItem type={type} isActive={filters.configType === type.value} />,
            children: (
              <div style={{
                height: '100%',
                padding: '0 24px 24px',
                display: 'flex',
                flexDirection: 'column',
                flex: 1
              }}>
                <div style={{ padding: '24px 0', borderBottom: '1px solid #f0f0f0', marginBottom: 24 }}>
                  <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                    <span style={{ color: activeType.color, marginRight: 12 }}>{activeType.icon}</span>
                    {activeType.fullLabel}
                  </Title>
                </div>

                <div style={{ flex: 1, minHeight: 0 }}> {/* Container cho ManagementLayout để nó tự scroll */}
                  {filters.configType === 6 && (
                    <div style={{ marginBottom: 16 }}>
                      <Segmented 
                        options={[
                          { label: 'Tham số chung', value: 'general' },
                          { label: 'Cấu hình cấp độ TOPIK', value: 'topik' },
                        ]} 
                        value={activeSubTab}
                        onChange={setActiveSubTab}
                      />
                    </div>
                  )}

                  {activeSubTab === 'topik' && filters.configType === 6 ? (
                    <TopikConfigTable 
                      data={topikData}
                      loading={topikLoading}
                      onEdit={(record) => {
                        setEditingTopik(record)
                        setTopikModalOpen(true)
                      }}
                      onView={(record) => {
                        setViewingTopik(record)
                        setTopikViewOpen(true)
                      }}
                    />
                  ) : (
                    <ManagementLayout
                      scrollOffset={520}
                      searchPlaceholder="Tìm kiếm theo khóa (key)..."
                      searchValue={filters.search}
                      onSearchChange={val => setFilters(prev => ({ ...prev, search: val }))}
                      onSearchSubmit={() => handleFilterChange('search', filters.search)}
                      extraFilters={
                        <Space>
                          <Select
                            placeholder="Trạng thái"
                            value={filters.isActive}
                            onChange={val => handleFilterChange('isActive', val)}
                            options={[
                              { label: 'Tất cả trạng thái', value: undefined },
                              { label: 'Đang hoạt động', value: true },
                              { label: 'Đang tắt', value: false },
                            ]}
                            style={{ width: 160 }}
                          />
                          <Button icon={<ReloadOutlined />} onClick={() => loadData(filters)} />
                        </Space>
                      }
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
                          showTotal: (total) => `Tổng cộng ${total} cấu hình`,
                          onChange: handlePaginationChange,
                        }
                      }}
                    />
                  )}

                  {((activeSubTab === 'general' && data.items.length === 0) || (activeSubTab === 'topik' && topikData.length === 0)) && !loading && !topikLoading && (
                    <div style={{ padding: '80px 0' }}>
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                          <Space direction="vertical" align="center">
                            <Text type="secondary">Nhóm này chưa có tham số cấu hình nào</Text>
                            <Button type="dashed" icon={<PlusOutlined />} onClick={handleCreate}>Tạo cấu hình đầu tiên</Button>
                          </Space>
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          }))}
        />
      </Card>

      <ConfigFormModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onFinish={handleFormFinish}
        saving={saving}
        isEdit={isEdit}
        editingConfig={editingConfig}
        form={form}
      />
      <ConfigViewModal
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        config={viewingConfig}
      />
      
      <TopikConfigModal
        open={topikModalOpen}
        onCancel={() => setTopikModalOpen(false)}
        onFinish={handleTopikFormFinish}
        saving={saving}
        config={editingTopik}
        form={topikForm}
      />

      <TopikConfigView
        open={topikViewOpen}
        onCancel={() => setTopikViewOpen(false)}
        config={viewingTopik}
      />
    </div>
  )
}

export default SystemConfigManagement
