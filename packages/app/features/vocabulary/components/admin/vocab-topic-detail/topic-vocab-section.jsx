'use client'

import { useMemo, useState, useEffect } from 'react'
import { Card, Space, Select, Table, Typography, List, Tag, Modal, Input, Button, Pagination } from 'antd'
import { UploadOutlined, DownloadOutlined, PlusOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons'
import { VocabularyGuideButton } from './vocabulary-guide-modal'

export function TopicVocabSection({
  selecting,
  onSelectingChange,
  removingKeys,
  onRemovingKeysChange,
  availableOptions,
  onSearch,
  onFocus,
  searching,
  onAdd,
  adding,
  onRemove,
  removing,
  dataSource,
  selectStyle,
  onQuickAdd,
  onExcelUpload,
  uploadingExcel,
  fileInputRef,
  onExportExcel,
  exportingExcel,
  onOpenGuide,
  isModerator = false, // Prop để ẩn các chức năng không được phép cho moderator
  excelImportResult = null,
}) {
  const { Text } = Typography
  const [removeMode, setRemoveMode] = useState(false)
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [addVocabModalOpen, setAddVocabModalOpen] = useState(false)

  const selectedOptions = useMemo(() => {
    if (!Array.isArray(selecting) || !Array.isArray(availableOptions)) return []
    const valueSet = new Set(selecting)
    return availableOptions.filter((opt) => valueSet.has(opt.value))
  }, [selecting, availableOptions])

  // Filter danh sách từ vựng dựa trên keyword (tìm trong text, definition, và id)
  const filteredDataSource = useMemo(() => {
    if (!Array.isArray(dataSource)) return []
    if (!searchKeyword || searchKeyword.trim() === '') return dataSource

    const keyword = searchKeyword.toLowerCase().trim()
    return dataSource.filter((item) => {
      const text = (item.text || '').toLowerCase()
      const definition = (item.definition || '').toLowerCase()
      const id = (item.vocabularyId || item.id || '').toLowerCase()

      return text.includes(keyword) || definition.includes(keyword) || id.includes(keyword)
    })
  }, [dataSource, searchKeyword])

  // Client-side pagination cho danh sách từ vựng đã filter
  const paginatedDataSource = useMemo(() => {
    if (!Array.isArray(filteredDataSource)) return []
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredDataSource.slice(startIndex, endIndex)
  }, [filteredDataSource, currentPage, pageSize])

  const totalItems = Array.isArray(filteredDataSource) ? filteredDataSource.length : 0

  // Reset về trang đầu khi search keyword thay đổi
  useEffect(() => {
    setCurrentPage(1)
  }, [searchKeyword])

  const columns = [
    {
      title: 'Từ',
      dataIndex: 'text',
      key: 'text',
      width: 180,
      ellipsis: true,
      render: (text, record) => {
        const id = record.vocabularyId || record.id
        if (!id) return text
        return (
          <a
            href={`/admin/vocab/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault()
              window.open(`/admin/vocab/${id}`, '_blank', 'noopener,noreferrer')
            }}
            style={{ fontWeight: 600 }}
          >
            {text}
          </a>
        )
      },
    },
    { title: 'Phiên âm', dataIndex: 'pronunciation', key: 'pronunciation', width: 200, ellipsis: true },
    {
      title: 'Định nghĩa',
      dataIndex: 'definition',
      key: 'definition',
      width: 300,
      ellipsis: true,
      render: (value) => value || '-',
    },
  ]

  return (
    <Card
      size="small"
      style={{ borderRadius: 10 }}
      title={
        <Space
          style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}
          wrap
        >
          <Space>
            <Text strong style={{ fontSize: 16 }}>Từ vựng trong chủ đề</Text>
            {onOpenGuide && <VocabularyGuideButton onOpen={onOpenGuide} />}
          </Space>
          <Space wrap>
            {onExcelUpload && !isModerator && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  style={{ display: 'none' }}
                  onChange={onExcelUpload}
                />
                <Button
                  type="dashed"
                  icon={<UploadOutlined />}
                  onClick={() => fileInputRef?.current?.click()}
                  disabled={uploadingExcel}
                  loading={uploadingExcel}
                  style={{ borderRadius: 20, height: 40, padding: '0 20px', fontWeight: 600 }}
                >
                  {uploadingExcel ? 'Đang import...' : 'Import'}
                </Button>
              </>
            )}
            {onExportExcel && !isModerator && (
              <Button
                type="dashed"
                icon={<DownloadOutlined />}
                onClick={onExportExcel}
                disabled={exportingExcel}
                loading={exportingExcel}
                style={{ borderRadius: 20, height: 40, padding: '0 20px', fontWeight: 600 }}
              >
                {exportingExcel ? 'Đang export...' : 'Export'}
              </Button>
            )}
          </Space>
        </Space>
      }
    >
      {!isModerator && (
        <div style={{ marginBottom: 24, padding: '16px', background: '#f9f9f9', borderRadius: 12, border: '1px solid #f0f0f0' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <Space size="middle">
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => setAddVocabModalOpen(true)} 
                  style={{ borderRadius: 20, height: 40, padding: '0 24px', fontWeight: 600, backgroundColor: '#1890ff' }}
                >
                  Thêm từ hệ thống
                </Button>
                {onQuickAdd && (
                  <Button 
                    icon={<PlusOutlined />} 
                    onClick={onQuickAdd} 
                    style={{ borderRadius: 20, height: 40, padding: '0 24px', fontWeight: 600 }}
                  >
                    Tạo mới & Thêm
                  </Button>
                )}
              </Space>

              <Space size="middle">
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Đã chọn <Text strong>{selecting?.length || 0}</Text> từ vựng
                </Text>
                <Button 
                  type="primary" 
                  onClick={onAdd} 
                  disabled={!selecting?.length || adding} 
                  loading={adding} 
                  style={{ borderRadius: 20, height: 40, padding: '0 32px', fontWeight: 600, backgroundColor: selecting?.length > 0 ? '#52c41a' : undefined, borderColor: selecting?.length > 0 ? '#52c41a' : undefined }}
                >
                  {adding ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </Space>
            </div>

            {selectedOptions.length > 0 && (
              <div style={{ background: '#fff', padding: '12px', borderRadius: 8, border: '1px dashed #d9d9d9' }}>
                <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#8c8c8c' }}>
                  Danh sách chờ thêm ({selectedOptions.length})
                </div>
                <Space wrap size={[8, 8]}>
                  {selectedOptions.map((item, index) => (
                    <Tag 
                      key={item.value || index} 
                      closable 
                      onClose={() => {
                        const newSelecting = selecting.filter(v => v !== item.value)
                        onSelectingChange(newSelecting)
                      }}
                      style={{ padding: '4px 10px', borderRadius: 4, margin: 0 }}
                    >
                      {item.label?.split(' - ')[0]}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}
          </Space>
        </div>
      )}

      {!isModerator && (
        <Modal
          title={<Text strong style={{ fontSize: 18 }}>Chọn từ vựng từ hệ thống</Text>}
          open={addVocabModalOpen}
          onCancel={() => setAddVocabModalOpen(false)}
          footer={null}
          width={800}
          centered
        >
          <Space direction="vertical" size="large" style={{ width: '100%', padding: '10px 0' }}>
            <Select
              mode="multiple"
              allowClear
              placeholder="Tìm kiếm theo từ hoặc nghĩa để thêm..."
              style={{ width: '100%', ...selectStyle }}
              value={selecting}
              options={availableOptions}
              onChange={onSelectingChange}
              onSearch={onSearch}
              onFocus={onFocus}
              showSearch
              filterOption={false}
              loading={searching}
              size="large"
              optionFilterProp="label"
              maxTagCount="responsive"
              dropdownStyle={{ borderRadius: 8 }}
            />
            <div style={{ background: '#e6f7ff', padding: '12px 16px', borderRadius: 8, border: '1px solid #91d5ff' }}>
              <Text type="secondary" style={{ color: '#0050b3' }}>
                <PlusOutlined style={{ marginRight: 8 }} />
                Tìm và chọn nhiều từ vựng, sau đó đóng modal này và bấm <b>"Lưu thay đổi"</b> ở màn hình chính để hoàn tất.
              </Text>
            </div>
          </Space>
        </Modal>
      )}

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <div style={{ marginBottom: 8, fontWeight: 600, fontSize: 15, color: '#262626' }}>
              Từ vựng hiện có trong chủ đề
            </div>
            <Input.Search
              placeholder="Tìm kiếm nhanh trong danh sách hiện tại..."
              allowClear
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ width: '100%', maxWidth: 400 }}
              size="middle"
            />
          </div>

          {!isModerator && (
            <Space size="middle">
              {removeMode && (
                <Text type="danger" style={{ fontSize: 13, fontWeight: 500 }}>
                  Đã chọn {removingKeys?.length || 0} từ vựng để xóa
                </Text>
              )}
              <Button
                icon={removeMode ? <CloseOutlined /> : <DeleteOutlined />}
                onClick={() => {
                  if (removeMode) onRemovingKeysChange([])
                  setRemoveMode(!removeMode)
                }}
                style={{ borderRadius: 20, height: 40, padding: '0 20px', fontWeight: 600 }}
              >
                {removeMode ? 'Hủy bỏ' : 'Chọn để xóa'}
              </Button>
              <Button
                danger
                type="primary"
                icon={<DeleteOutlined />}
                onClick={() => {
                  if (!removeMode || !removingKeys?.length || removing) return
                  Modal.confirm({
                    title: 'Xác nhận xóa từ vựng',
                    content: `Bạn có chắc muốn gỡ bỏ ${removingKeys?.length || 0} từ vựng khỏi chủ đề này? Hành động này không thể hoàn tác.`,
                    okText: 'Xác nhận xóa',
                    cancelText: 'Hủy',
                    okButtonProps: { danger: true, style: { borderRadius: 8 } },
                    cancelButtonProps: { style: { borderRadius: 8 } },
                    onOk: onRemove,
                  })
                }}
                disabled={!removeMode || !removingKeys?.length || removing}
                loading={removing}
                style={{ borderRadius: 20, height: 40, padding: '0 24px', fontWeight: 600 }}
              >
                Xóa từ vựng đã chọn
              </Button>
            </Space>
          )}
        </div>
        {removeMode && (
          <div style={{ marginBottom: 12, padding: '8px 12px', background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 8 }}>
            <Text type="danger" style={{ fontSize: 12 }}>
              <b>Chế độ xóa:</b> Vui lòng tick chọn các dòng từ vựng trong bảng bên dưới, sau đó bấm <b>"Xóa mục đã chọn"</b> để gỡ bỏ.
            </Text>
          </div>
        )}
      </div>

      <Table
        rowSelection={
          removeMode && !isModerator
            ? {
              selectedRowKeys: removingKeys,
              onChange: onRemovingKeysChange,
            }
            : undefined
        }
        columns={columns}
        dataSource={paginatedDataSource}
        size="small"
        bordered
        tableLayout="fixed"
        scroll={{ x: '100%', y: 400 }}
        pagination={false}
        locale={{ emptyText: 'Chưa có từ vựng trong chủ đề' }}
        rowKey={(record) => record.vocabularyId || record.id}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '16px 0 0 0',
          borderTop: '1px solid #f0f0f0',
          marginTop: 16,
        }}
      >
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={totalItems}
          showSizeChanger
          showTotal={(total) => <span style={{ fontSize: 13, fontWeight: 500 }}>Tổng {total} từ vựng</span>}
          onChange={(page, size) => {
            setCurrentPage(page)
            setPageSize(size)
          }}
          pageSizeOptions={['10', '20', '50', '100']}
          size="middle"
        />
      </div>

      {excelImportResult && (
        <Card
          size="large"
          style={{ marginTop: 12, background: '#f6ffed', borderColor: '#b7eb8f' }}
          title={<Text strong>Kết quả import Excel</Text>}
        >
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <Text style={{ color: '#389e0d' }}>
              <Text strong style={{ color: '#389e0d' }}>
                Thêm mới:
              </Text>{' '}
              {excelImportResult.addedNewCount ?? 0}
            </Text>
            <Text>
              <Text strong>
                Link vào Topic:
              </Text>{' '}
              {excelImportResult.linkedExistingCount ?? 0}
            </Text>
            <Text style={{ color: '#cf1322' }}>
              <Text strong style={{ color: '#cf1322' }}>
                Thất bại:
              </Text>{' '}
              {excelImportResult.failureCount ?? 0}
            </Text>
          </Space>
        </Card>
      )}
    </Card>
  )
}

export default TopicVocabSection

