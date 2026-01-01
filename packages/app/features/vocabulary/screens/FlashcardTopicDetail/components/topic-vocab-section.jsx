'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'solito/navigation'
import { Card, Space, Select, Table, Typography, List, Tag, Modal } from 'antd'
import { ButtonV2 } from '../../../../../../components/buttonV2.jsx'

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
}) {
  const router = useRouter()
  const { Text } = Typography
  const [removeMode, setRemoveMode] = useState(false)
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const selectedOptions = useMemo(() => {
    if (!Array.isArray(selecting) || !Array.isArray(availableOptions)) return []
    const valueSet = new Set(selecting)
    return availableOptions.filter((opt) => valueSet.has(opt.value))
  }, [selecting, availableOptions])

  // Client-side pagination cho danh sách từ vựng
  const paginatedDataSource = useMemo(() => {
    if (!Array.isArray(dataSource)) return []
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return dataSource.slice(startIndex, endIndex)
  }, [dataSource, currentPage, pageSize])

  const totalItems = Array.isArray(dataSource) ? dataSource.length : 0

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
    <Card title="Từ vựng trong chủ đề">
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
              <ButtonV2
                title="Tạo từ vựng nhanh"
                onPress={onQuickAdd}
                color="#F1BE4B"
                style={{ minWidth: 160, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
              />
            )}

            <ButtonV2
              title={adding ? 'Đang thêm...' : 'Thêm vào chủ đề'}
              onPress={onAdd}
              disabled={!selecting?.length || adding}
              color="mint"
              style={{ minWidth: 180, paddingVertical: 10 }}
              textStyle={{ fontSize: 14 }}
            />
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
      <Space style={{ width: '100%', marginBottom: 8, justifyContent: 'space-between' }}>
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
          <ButtonV2
            title={removeMode ? 'Hủy chọn xóa' : 'Chọn từ để gỡ'}
            onPress={() => {
              if (removeMode) {
                // Tắt chế độ xóa thì clear selection
                onRemovingKeysChange([])
              }
              setRemoveMode(!removeMode)
            }}
            color={removeMode ? 'ivory' : 'charcoal'}
            style={{ paddingVertical: 8, minWidth: 150 }}
            textStyle={{ fontSize: 13 }}
          />
          <ButtonV2
            title={removing ? 'Đang gỡ...' : 'Gỡ từ vựng đã chọn'}
            onPress={() => {
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
            color="poppy"
            style={{ paddingVertical: 8, minWidth: 180 }}
            textStyle={{ fontSize: 13 }}
          />
        </Space>
      </Space>
      <Table
        rowSelection={
          removeMode
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
    </Card>
  )
}

export default TopicVocabSection

