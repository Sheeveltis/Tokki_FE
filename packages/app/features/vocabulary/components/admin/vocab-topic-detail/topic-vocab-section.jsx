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
        <Space direction="vertical" size="small" style={{ marginBottom: 12, width: '100%' }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
            <Text type="secondary">
              Đã chọn <Text strong>{selecting?.length || 0}</Text> từ vựng để thêm vào chủ đề
            </Text>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddVocabModalOpen(true)} style={{ borderRadius: 20, height: 40, padding: '0 20px', fontWeight: 600 }}>
                Thêm (Hệ thống)
              </Button>
              {onQuickAdd && <Button type="primary" icon={<PlusOutlined />} onClick={onQuickAdd} style={{ borderRadius: 20, height: 40, padding: '0 20px', fontWeight: 600 }}>Thêm (Mới)</Button>}
              <Button type="primary" icon={<PlusOutlined />} onClick={onAdd} disabled={!selecting?.length || adding} loading={adding} style={{ borderRadius: 20, height: 40, padding: '0 20px', fontWeight: 600 }}>
                {adding ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </Space>
          </Space>

          {selectedOptions.length > 0 && (
            <Card
              size="small"
              style={{
                marginTop: 4,
                background: '#fafafa',
                borderStyle: 'dashed',
              }}
              title={
                <span>
                  Từ vựng đang chọn để thêm{' '}
                  <Tag color="blue" style={{ marginLeft: 4 }}>
                    {selectedOptions.length}
                  </Tag>
                </span>
              }
            >
              <List
                size="small"
                dataSource={selectedOptions}
                style={{ maxHeight: 160, overflow: 'auto' }}
                renderItem={(item, index) => (
                  <List.Item key={item.value || index}>
                    <Space direction="vertical" size={0} style={{ width: '100%' }}>
                      <Text strong>{item.label?.split(' - ')[0]}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.label}
                      </Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Space>
      )}
      {!isModerator && (
        <Modal
          title="Chọn từ vựng từ hệ thống"
          open={addVocabModalOpen}
          onCancel={() => setAddVocabModalOpen(false)}
          footer={null}
          width={760}
          centered
        >
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Select
              mode="multiple"
              allowClear
              placeholder="Tìm và chọn từ vựng để thêm"
              style={{
                width: '100%',
                ...selectStyle,
              }}
              value={selecting}
              options={availableOptions}
              onChange={onSelectingChange}
              onSearch={onSearch}
              onFocus={onFocus}
              showSearch
              filterOption={false}
              loading={searching}
              size="middle"
              optionFilterProp="label"
              maxTagCount="responsive"
            />
            <Text type="secondary">
              Chọn nhiều từ vựng rồi bấm "Thêm vào chủ đề" ở màn hình chính.
            </Text>
          </Space>
        </Modal>
      )}
      <div
        style={{
          width: '100%',
          marginBottom: 10,
          padding: 10,
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          background: '#fcfcfc',
        }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
            <Space direction="vertical" size={2}>
              <Text strong>Từ vựng hiện có trong chủ đề</Text>
              {removeMode && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Đang ở chế độ chọn để gỡ. Tick vào các từ vựng muốn gỡ rồi bấm "Gỡ từ vựng đã chọn".
                </Text>
              )}
            </Space>
          </Space>
          <Space
            style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}
            wrap
          >
            <Input.Search
              placeholder="Tìm kiếm theo từ, định nghĩa"
              allowClear
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ width: '20vw', flex: 1 }}
              size="middle"
            />
            <Space wrap>
              {!isModerator && (
                <>
                  <Button
                    icon={removeMode ? <CloseOutlined /> : <DeleteOutlined />}
                    onClick={() => {
                      if (removeMode) onRemovingKeysChange([])
                      setRemoveMode(!removeMode)
                    }}
                    style={{ borderRadius: 20, height: 40, padding: '0 20px', fontWeight: 600 }}
                  >
                    {removeMode ? 'Hủy' : 'Chọn để xóa'}
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      if (!removeMode || !removingKeys?.length || removing) return

                      Modal.confirm({
                        title: 'Xác nhận xóa từ vựng',
                        content: `Bạn có chắc muốn xóa ${removingKeys?.length || 0} từ vựng khỏi chủ đề này?`,
                        okText: 'Xóa',
                        cancelText: 'Hủy',
                        okButtonProps: { danger: true },
                        onOk: onRemove,
                      })
                    }}
                    disabled={!removeMode || !removingKeys?.length || removing}
                    loading={removing}
                    style={{ borderRadius: 20, height: 40, padding: '0 20px', fontWeight: 600 }}
                  >
                    {removing ? 'Đang xóa...' : 'Xóa'}
                  </Button>
                </>
              )}
            </Space>
          </Space>
        </Space>
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

      {/* Pagination Section styled like ManagementLayout */}
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
          showTotal={(total) => <span style={{ fontSize: 13, fontWeight: 500 }}>Tổng {total} mục</span>}
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

