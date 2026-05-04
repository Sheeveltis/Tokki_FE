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
  EyeOutlined,
  ControlOutlined,
  BookOutlined
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
import { useTopikColumns } from '../components/topik-config-table'
import TopikConfigModal from '../components/topik-config-modal'
import TopikConfigView from '../components/topik-config-view'

import { fetchSystemConfigs, updateSystemConfig, createSystemConfig } from '../api/system-config'
import { fetchTopikConfigs, createTopikConfig, updateTopikConfig } from '../api/topik-config'

const { Text, Title } = Typography

export function SystemConfigManagement({ basePath = '/admin' }) {
  const router = useRouter()
  const [filters, setFilters] = useManagementFilters({
    search: '',
    isActive: true, // Mặc định là Đang hoạt động
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
  const [topikData, setTopikData] = useState({ items: [], total: 0 })
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

  const loadTopikData = useCallback(async (currentFilters) => {
    try {
      setTopikLoading(true)
      const result = await fetchTopikConfigs({
        pageNumber: currentFilters.page,
        pageSize: currentFilters.size,
        search: currentFilters.search,
        isActive: currentFilters.isActive
      })
      setTopikData({
        items: result?.items || result || [],
        total: result?.totalCount || (Array.isArray(result) ? result.length : (result?.items?.length || 0))
      })
    } catch (err) {
      showAdminError('Không thể tải cấu hình TOPIK')
    } finally {
      setTopikLoading(false)
    }
  }, [])

  useEffect(() => {
    if (filters.configType === 6 && activeSubTab === 'topik') {
      loadTopikData(filters)
    } else {
      loadData(filters)
    }
  }, [filters.page, filters.size, filters.search, filters.isActive, filters.configType, activeSubTab, loadData, loadTopikData])

  // Reset activeSubTab when category changes
  useEffect(() => {
    if (filters.configType !== 6 && activeSubTab !== 'general') {
      setActiveSubTab('general')
    }
  }, [filters.configType])

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
    try {
      setSaving(true)
      const payload = { ...values }
      
      // Chuyển đổi dữ liệu về string trước khi gửi lên API (vì DB lưu Value là string)
      if (payload.dataType === 'int') {
        payload.value = String(payload.value)
      } else if (payload.dataType === 'boolean') {
        payload.value = String(payload.value)
      }

      if (isEdit) {
        // API Update yêu cầu truyền command chứa thông tin
        // Giả sử UpdateSystemConfigCommand cần ID hoặc Key
        // Ở đây BE Controller dùng [FromBody] UpdateSystemConfigCommand
        await updateSystemConfig({
          ...payload,
          systemConfigID: editingConfig.systemConfigID
        })
        showAdminSuccess('Cập nhật cấu hình thành công')
      } else {
        await createSystemConfig(payload)
        showAdminSuccess('Tạo mới cấu hình thành công')
      }
      
      setModalOpen(false)
      loadData(filters)
    } catch (err) {
      showAdminError(err?.message || 'Thao tác thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleTopikFormFinish = async (values) => {
    try {
      setSaving(true)
      if (editingTopik) {
        await updateTopikConfig({
          ...values,
          topikLevelConfigID: editingTopik.topikLevelConfigID
        })
        showAdminSuccess('Đã cập nhật cấu hình TOPIK thành công')
      } else {
        await createTopikConfig(values)
        showAdminSuccess('Đã tạo mới cấu hình TOPIK thành công')
      }
      setTopikModalOpen(false)
      // Reload topik data
      loadTopikData(filters)
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
              style={{ color: '#1677ff', fontSize: 13, display: 'block', wordBreak: 'break-all' }}
            >
              {key}
            </Text>
            <Text
              type="secondary"
              style={{ fontSize: 11, display: 'block', wordBreak: 'break-word' }}
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
      width: 400,
      render: (value, record) => {
        if (record.dataType === 'boolean') {
          return <Tag color={value === 'true' || value === true ? 'green' : 'red'}>{value === 'true' || value === true ? 'BẬT' : 'TẮT'}</Tag>
        }

        return (
          <div style={{
            background: '#f9f9f9',
            padding: '4px 10px',
            borderRadius: '4px',
            border: '1px solid #f0f0f0',
            display: 'inline-block',
            maxWidth: '350px',
            maxHeight: '120px',
            overflowY: 'auto'
          }}>
            <Text code style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: 12 }}>{value || '-'}</Text>
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

  const topikColumns = useTopikColumns({
    onEdit: (record) => {
      setEditingTopik(record)
      setTopikModalOpen(true)
    },
    onView: (record) => {
      setViewingTopik(record)
      setTopikViewOpen(true)
    },
    pagination: {
      current: filters.page,
      pageSize: filters.size
    }
  })

  return (
    <div style={{
      height: 'calc(100vh - 160px)', // Tăng khoảng cách trừ đi để tránh bị che bởi footer admin
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
        .system-config-tabs .ant-tabs-nav-operations {
          display: none !important;
        }
        .system-config-tabs .ant-tabs-nav-wrap {
          overflow-y: auto !important;
        }
        .system-config-tabs .ant-tabs-nav-wrap::-webkit-scrollbar {
          width: 4px;
        }
        .system-config-tabs .ant-tabs-nav-wrap::-webkit-scrollbar-thumb {
          background: #f0f0f0;
          border-radius: 2px;
        }
        .ant-table-wrapper .ant-table,
        .ant-table-wrapper .ant-table-container,
        .ant-table-wrapper .ant-table-thead > tr > th:first-child,
        .ant-table-wrapper .ant-table-thead > tr > th:last-child {
          border-radius: 0 !important;
        }
        .system-config-tabs, 
        .system-config-tabs .ant-tabs-nav, 
        .system-config-tabs .ant-tabs-content-holder {
          border: none !important;
          background: transparent !important;
          border-radius: 0 !important;
        }
        .system-config-tabs .ant-tabs-nav::before {
          display: none !important;
        }
        .ant-card, .ant-card-body {
          border: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          background: transparent !important;
        }
        .config-type-item:hover {
          background-color: #f5f5f5 !important;
        }
        
        /* Đưa phân trang xuống góc */
        .system-config-tabs .management-layout-box {
          border-radius: 0 !important;
          box-shadow: none !important;
          background: transparent !important;
        }
        
        .system-config-tabs .management-pagination-wrapper {
          padding: 12px 0 !important;
          background: transparent !important;
          border-top: none !important;
        }

        .system-config-tabs .ant-table-wrapper .ant-table-thead > tr > th {
          background: #fafafa !important;
        }
      `}</style>
      <ConfigListHeader onCreate={handleCreate} />

      <Card
        variant="borderless"
        styles={{ body: { padding: 0, height: '100%', display: 'flex', flexDirection: 'column' } }}
        style={{
          flex: 1,
          minHeight: 0,
          background: 'transparent'
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
                flex: 1,
                maxWidth: '1400px',
                margin: '0 auto',
                width: '100%'
              }}>
                <div style={{ padding: '12px 0' }}>
                  <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                    <span style={{ color: activeType.color, marginRight: 12 }}>{activeType.icon}</span>
                    {activeType.fullLabel}
                  </Title>
                </div>

                <div style={{ flex: 1, minHeight: 0 }}> {/* Container cho ManagementLayout để nó tự scroll */}
                  <ManagementLayout
                    scrollOffset={580}
                    searchPlaceholder="Tìm kiếm..."
                    searchValue={filters.search}
                    onSearchChange={val => setFilters(prev => ({ ...prev, search: val }))}
                    onSearchSubmit={() => handleFilterChange('search', filters.search)}
                    leftExtra={
                      <Select
                        placeholder="Trạng thái"
                        allowClear
                        value={filters.isActive}
                        onChange={val => handleFilterChange('isActive', val)}
                        options={[
                          { label: 'Đang hoạt động', value: true },
                          { label: 'Đang tắt', value: false },
                        ]}
                        style={{ width: 160 }}
                      />
                    }
                    extraFilters={
                      <Space>
                        {filters.configType === 6 && (
                          <Segmented 
                            options={[
                              { 
                                label: 'Tham số chung', 
                                value: 'general',
                                icon: <ControlOutlined />
                              },
                              { 
                                label: 'Cấu hình cấp độ TOPIK', 
                                value: 'topik',
                                icon: <BookOutlined />
                              },
                            ]} 
                            value={activeSubTab}
                            onChange={setActiveSubTab}
                          />
                        )}
                        <Button icon={<ReloadOutlined />} onClick={() => activeSubTab === 'topik' ? loadTopikData(filters) : loadData(filters)} />
                      </Space>
                    }
                    tableProps={(activeSubTab === 'topik' && filters.configType === 6) ? {
                      columns: topikColumns,
                      dataSource: topikData.items,
                      loading: topikLoading,
                      rowKey: "topikLevelConfigID",
                      pagination: {
                        current: filters.page,
                        pageSize: filters.size,
                        total: topikData.total,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng cộng ${total} mục`,
                        onChange: handlePaginationChange,
                      }
                    } : {
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
                  >
                    {/* Content specific to active tab handled by tableProps */}
                  </ManagementLayout>

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
