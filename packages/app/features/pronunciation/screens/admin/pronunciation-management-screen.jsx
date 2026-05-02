import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'solito/navigation'
import { Space, message, Modal, Tooltip, Tag, InputNumber, Button, Table } from 'antd'
import { 
  getPronunciationRules, 
  createPronunciationRule, 
  deletePronunciationRule, 
  reorderPronunciationRule, 
  updatePronunciationRule,
  importPronunciationRulesFromExcel,
  exportPronunciationRulesToExcel,
  downloadPronunciationTemplate
} from '../../api/index.js'
import { PlusOutlined, DownloadOutlined, UploadOutlined, FileExcelOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import PronunciationRuleDetail from './components/pronunciation-rule-detail.jsx'
import PronunciationRuleCreateModal from './components/pronunciation-rule-create-modal.jsx'
import PronunciationRuleList from './components/pronunciation-rule-list.jsx'
import PronunciationRuleEditModal from './components/pronunciation-rule-edit-modal.jsx'

export function PronunciationManagementScreen({ basePath = '/admin' }) {
  const router = useRouter()
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRule, setSelectedRule] = useState(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState(null)
  const [editLoading, setEditLoading] = useState(false)

  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [orderRule, setOrderRule] = useState(null)
  const [orderValue, setOrderValue] = useState(null)

  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const fileInputRef = React.useRef(null)

  const fetchRules = async () => {
    try {
      setLoading(true)
      const data = await getPronunciationRules('admin')
      // Đảm bảo rules luôn là mảng, hỗ trợ cả trường hợp API trả về object phân trang { items, totalCount }
      setRules(Array.isArray(data) ? data : (data?.items || []))
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
    if (!Array.isArray(rules)) return []
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

  const handleEdit = async (payload) => {
    try {
      setEditLoading(true)
      await updatePronunciationRule(payload.pronunciationRuleId, payload)
      message.success('Đã cập nhật quy tắc phát âm thành công')
      setEditModalOpen(false)
      setEditingRule(null)
      
      // Update selectedRule if we are in detail view
      if (selectedRule && selectedRule.id === payload.pronunciationRuleId) {
        setSelectedRule(prev => ({ ...prev, ...payload, title: payload.ruleName }))
      }
      
      fetchRules()
    } catch (err) {
      message.error(err.message || 'Cập nhật quy tắc phát âm thất bại')
    } finally {
      setEditLoading(false)
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

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleUpdateOrderIndex = async () => {
    if (!orderRule || orderValue === null) return

    try {
      setLoading(true)
      await reorderPronunciationRule(orderRule.id, orderValue)
      message.success('Đã thay đổi vị trí quy tắc thành công')
      setOrderModalOpen(false)
      setOrderRule(null)
      fetchRules()
    } catch (err) {
      message.error(err.message || 'Thay đổi vị trí thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setImporting(true)
      const result = await importPronunciationRulesFromExcel(file)
      setImportResult(result)
      fetchRules()
    } catch (err) {
      message.error(err.message || 'Import thất bại')
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleExportExcel = async () => {
    try {
      message.loading({ content: 'Đang chuẩn bị dữ liệu...', key: 'export' })
      const blob = await exportPronunciationRulesToExcel()
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `PronunciationRules_${new Date().getTime()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      message.success({ content: 'Xuất file thành công', key: 'export' })
    } catch (err) {
      message.error({ content: err.message || 'Xuất file thất bại', key: 'export' })
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      message.loading({ content: 'Đang tải template...', key: 'template' })
      const blob = await downloadPronunciationTemplate()
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'PronunciationTemplate.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      message.success({ content: 'Tải template thành công', key: 'template' })
    } catch (err) {
      message.error({ content: err.message || 'Tải template thất bại', key: 'template' })
    }
  }


  const actions = [
    {
      label: 'Import',
      icon: <UploadOutlined />,
      type: 'dashed',
      loading: importing,
      onPress: handleImportClick
    },
    {
      label: 'Export',
      icon: <DownloadOutlined />,
      type: 'dashed',
      onPress: handleExportExcel
    },
    {
      label: 'Tải Template',
      icon: <DownloadOutlined />,
      type: 'dashed',
      onPress: handleDownloadTemplate
    },
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
        onEdit={(rule) => {
          setEditingRule(rule)
          setEditModalOpen(true)
        }}
        onDelete={handleDeleteRule}
      />
    )
  }

  return (
    <>
      <PronunciationRuleList
        rules={filteredRules}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        actions={actions}
        onViewDetail={setSelectedRule}
        onEdit={(record) => {
          setEditingRule(record)
          setEditModalOpen(true)
        }}
        onDelete={handleDeleteRule}
        onReorder={handleOpenOrderIndexModal}
      />
      <PronunciationRuleCreateModal
        open={createModalOpen}
        loading={createLoading}
        onCancel={() => setCreateModalOpen(false)}
        onSubmit={handleCreate}
      />
      <PronunciationRuleEditModal
        open={editModalOpen}
        loading={editLoading}
        rule={editingRule}
        onCancel={() => {
          setEditModalOpen(false)
          setEditingRule(null)
        }}
        onSubmit={handleEdit}
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
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".xlsx, .xls"
        onChange={handleFileChange}
      />

      <Modal
        title="Kết quả Import Excel"
        open={!!importResult}
        onCancel={() => setImportResult(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setImportResult(null)}>
            Đóng
          </Button>
        ]}
        width={800}
        centered
      >
        {importResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              padding: 12,
              borderRadius: 8,
              backgroundColor: importResult.isSuccess ? '#f6ffed' : '#fff2f0',
              border: `1px solid ${importResult.isSuccess ? '#b7eb8f' : '#ffccc7'}`,
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              {importResult.isSuccess ? (
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />
              ) : (
                <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 24 }} />
              )}
              <div strong style={{ fontSize: 16, fontWeight: 600 }}>{importResult.message}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontWeight: 600 }}>Chi tiết:</div>
              <Table
                size="small"
                dataSource={[
                  ...(importResult.data?.successList?.map((item, idx) => ({ ...item, type: 'success', key: `s-${idx}` })) || []),
                  ...(importResult.data?.failureList?.map((item, idx) => ({ ...item, type: 'failure', key: `f-${idx}` })) || [])
                ]}
                columns={[
                  {
                    title: 'Tên quy tắc',
                    dataIndex: 'title',
                    key: 'title',
                  },
                  {
                    title: 'Mô tả',
                    dataIndex: 'description',
                    key: 'description',
                  },
                  {
                    title: 'Kết quả',
                    dataIndex: 'type',
                    key: 'type',
                    width: 120,
                    render: (type) => (
                      <Tag color={type === 'success' ? 'green' : 'red'}>
                        {type === 'success' ? 'Thành công' : 'Thất bại'}
                      </Tag>
                    )
                  },
                  {
                    title: 'Lý do',
                    dataIndex: 'reason',
                    key: 'reason',
                  }
                ]}
                pagination={{ pageSize: 10 }}
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

export default PronunciationManagementScreen
