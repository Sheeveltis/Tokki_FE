'use client'

import { useMemo, useState, useEffect } from 'react'
import { Card, Space, Select, Table, Typography, List, Tag, Modal, Input, Button } from 'antd'
import { UploadOutlined, FileExcelOutlined } from '@ant-design/icons'
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
      title: 'ID',
      dataIndex: 'vocabularyId',
      key: 'vocabularyId',
      width: 250,
      render: (_, record) => {
        const id = record.vocabularyId || record.id
        if (!id) return '-'
        return (
          <a
            href={`/admin/vocab/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault()
              window.open(`/admin/vocab/${id}`, '_blank', 'noopener,noreferrer')
            }}
          >
            {id}
          </a>
        )
      },
    },
    { title: 'Từ', dataIndex: 'text', key: 'text' },
    { title: 'Phiên âm', dataIndex: 'pronunciation', key: 'pronunciation' },
    { title: 'Định nghĩa', dataIndex: 'definition', key: 'definition' },
  ]

  return (
    <Card
      title={
        <Space
          style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Space>
            <Text strong>Từ vựng trong chủ đề</Text>
            {onOpenGuide && <VocabularyGuideButton onOpen={onOpenGuide} />}
          </Space>
          <Space>
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
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={() => fileInputRef?.current?.click()}
                  disabled={uploadingExcel}
                  loading={uploadingExcel}
                >
                  {uploadingExcel ? 'Đang import...' : 'Import'}
                </Button>
              </>
            )}
            {onExportExcel && !isModerator && (
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={onExportExcel}
                disabled={exportingExcel}
                loading={exportingExcel}
              >
                {exportingExcel ? 'Đang xuất...' : 'Export'}
              </Button>
            )}
          </Space>
        </Space>
      }
    >
      {!isModerator && (
        <Space direction="vertical" size="small" style={{ marginBottom: 12, width: '100%' }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }} align="start">
            <div style={{ flex: 1 }}>
              <Select
                mode="multiple"
                allowClear
                placeholder="Tìm và chọn từ vựng để thêm"
                style={{
                  width: '100%',
                  minWidth: 600,
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
              <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                Đã chọn <Text strong>{selecting?.length || 0}</Text> từ vựng để thêm vào chủ đề
              </Text>
            </div>
            <Space>
              {onQuickAdd && (
                <Button onClick={onQuickAdd}>Tạo từ vựng nhanh</Button>
              )}

              <Button type="primary" onClick={onAdd} disabled={!selecting?.length || adding} loading={adding}>
                {adding ? 'Đang thêm...' : 'Thêm vào chủ đề'}
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
      <Space direction="vertical" size="small" style={{ width: '100%', marginBottom: 8 }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space direction="vertical" size={2}>
            <Space align="center">
              <Text strong>Từ vựng hiện có trong chủ đề</Text>
              <Text type="secondary" style={{ fontSize: 13 }}>
                (Tổng: <Text strong>{totalItems}</Text> từ vựng)
              </Text>
            </Space>
            {removeMode && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Đang ở chế độ chọn để gỡ. Tick vào các từ vựng muốn gỡ rồi bấm "Gỡ từ vựng đã chọn".
              </Text>
            )}
          </Space>
          <Space>
          <Space align="center">
            <Text type="secondary" style={{ fontSize: 13 }}>Hiển thị:</Text>
            <Select
              value={pageSize}
              onChange={(value) => {
                setPageSize(value)
                setCurrentPage(1) // Reset về trang đầu khi đổi pageSize
              }}
              style={{ width: 100 }}
              options={[
                { label: '5', value: 5 },
                { label: '10', value: 10 },
                { label: '20', value: 20 },
                { label: '50', value: 50 },
                { label: '100', value: 100 },
              ]}
            />
          </Space>
          {!isModerator && (
            <>
              <Button
                onClick={() => {
                  if (removeMode) {
                    // Tắt chế độ xóa thì clear selection
                    onRemovingKeysChange([])
                  }
                  setRemoveMode(!removeMode)
                }}
              >
                {removeMode ? 'Hủy chọn xóa' : 'Chọn từ để gỡ'}
              </Button>
              <Button
                danger
                onClick={() => {
                  if (!removeMode || !removingKeys?.length || removing) return

                  Modal.confirm({
                    title: 'Xác nhận gỡ từ vựng',
                    content: `Bạn có chắc muốn gỡ ${removingKeys?.length || 0} từ vựng khỏi chủ đề này?`,
                    okText: 'Gỡ',
                    cancelText: 'Hủy',
                    okButtonProps: { danger: true },
                    onOk: onRemove,
                  })
                }}
                disabled={!removeMode || !removingKeys?.length || removing}
                loading={removing}
              >
                {removing ? 'Đang gỡ...' : 'Gỡ từ vựng đã chọn'}
              </Button>
            </>
          )}
          </Space>
        </Space>
        <Input.Search
          placeholder="Tìm kiếm theo từ, định nghĩa hoặc ID..."
          allowClear
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ width: '100%', maxWidth: 600 }}
          size="middle"
        />
      </Space>
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
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalItems,
          showSizeChanger: false, // Đã có Select riêng ở trên
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} từ vựng`,
          onChange: (page) => setCurrentPage(page),
          pageSizeOptions: ['5', '10', '20', '50', '100'],
        }}
        locale={{ emptyText: 'Chưa có từ vựng trong chủ đề' }}
        rowKey={(record) => record.vocabularyId || record.id}
      />
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

