'use client'

import React, { useMemo } from 'react'
import { Space, Tooltip, Tag, Select, DatePicker, Modal, message } from 'antd'
import { EditOutlined, ReloadOutlined, FilterOutlined, EyeOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import ManagementLayout from '../../../../components/layout/management-layout.jsx'
import { useWordleVocabularyManagement } from '../api/wordle-list-hooks'
import WordleSelectVocabModal from './WordleSelectVocabModal'

const LEVEL_LABELS = {
  1: { label: 'Dễ', color: 'green' },
  2: { label: 'Trung bình', color: 'blue' },
  3: { label: 'Khó', color: 'red' },
}

/**
 * Component hiển thị danh sách từ vựng Wordle cho admin
 */
export function WordleVocabularyList({ onOpenDetail }) {
  const {
    data,
    loading,
    pagination,
    filters,
    handleFilterChange,
    handlePaginationChange,
    handleReroll,
    handleFetchSuitableVocabs,
    handleAssignVocab,
    refreshData,
  } = useWordleVocabularyManagement()

  const [selectModalVisible, setSelectModalVisible] = React.useState(false)
  const [selectedRecord, setSelectedRecord] = React.useState(null)

  const handleOpenSelectModal = (record) => {
    setSelectedRecord(record)
    setSelectModalVisible(true)
  }

  const handleOpenDetailModal = (record) => {
    if (onOpenDetail) {
      onOpenDetail(record)
    }
  }

  const handleSelectVocab = async (vocabId) => {
    if (!selectedRecord) return
    const res = await handleAssignVocab(selectedRecord.dailyWordleId, vocabId)
    if (res.success) {
      message.success('Cập nhật từ vựng thành công')
      setSelectModalVisible(false)
      setSelectedRecord(null)
    } else {
      message.error('Cập nhật từ vựng thất bại')
    }
  }

  const handleReset = (record) => {
    Modal.confirm({
      title: 'Xác nhận đổi từ',
      content: 'Bạn xác nhận đổi ngẫu nhiên thành 1 từ khác chứ?',
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      centered: true,
      onOk: async () => {
        const res = await handleReroll(record.dailyWordleId)
        if (res.success) {
          message.success('Đổi từ vựng thành công')
        } else {
          message.error('Đổi từ vựng thất bại')
        }
      },
    })
  }

  const columns = useMemo(
    () => [
      {
        title: 'STT',
        key: 'stt',
        width: 60,
        align: 'center',
        render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
      },
      {
        title: 'Từ vựng',
        dataIndex: 'word',
        key: 'word',
        width: 150,
        render: (text) => <span style={{ fontWeight: 600, fontSize: 16 }}>{text}</span>,
      },
      {
        title: 'Ngày áp dụng',
        dataIndex: 'gameDate',
        key: 'gameDate',
        width: 120,
        render: (date) => (date ? dayjs(date).format('DD/MM/YYYY') : '-'),
      },
      {
        title: 'Mức độ',
        dataIndex: 'level',
        key: 'level',
        width: 120,
        align: 'center',
        render: (level) => {
          const info = LEVEL_LABELS[level] || { label: 'Không xác định', color: 'default' }
          return <Tag color={info.color}>{info.label}</Tag>
        },
      },
      {
        title: 'Định nghĩa',
        dataIndex: 'definition',
        key: 'definition',
        render: (text) => (
          <Tooltip title={text}>
            <div
              style={{
                maxWidth: 300,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {text}
            </div>
          </Tooltip>
        ),
      },
      {
        title: 'Trạng thái',
        dataIndex: 'isLocked',
        key: 'isLocked',
        width: 120,
        align: 'center',
        render: (isLocked) => (
          <Tag color={isLocked ? 'error' : 'success'}>{isLocked ? 'Đang khóa' : 'Đang mở'}</Tag>
        ),
      },
      {
        title: 'Hành động',
        key: 'actions',
        width: 120,
        align: 'center',
        render: (_, record) => {
          const isLocked = record.isLocked
          const disabledStyle = isLocked
            ? { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' }
            : { cursor: 'pointer' }

          const tooltipTitle = isLocked
            ? 'Hôm nay đã có người đoán trúng từ này nên bạn không được phép chỉnh sửa'
            : 'Đổi ngẫu nhiên'

          return (
            <Space size="middle">
              <Tooltip title="Xem chi tiết">
                <EyeOutlined
                  style={{
                    fontSize: 18,
                    color: '#1890ff',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleOpenDetailModal(record)}
                />
              </Tooltip>
              <Tooltip title={tooltipTitle}>
                <ReloadOutlined
                  style={{
                    fontSize: 18,
                    color: '#1890ff',
                    ...disabledStyle,
                    // Nếu bị khóa thì hover vẫn hiện tooltip nhưng không bấm được
                    pointerEvents: isLocked ? 'auto' : 'auto',
                  }}
                  onClick={() => !isLocked && handleReset(record)}
                />
              </Tooltip>
              <Tooltip title={isLocked ? tooltipTitle : 'Đổi từ vựng'}>
                <EditOutlined
                  style={{
                    fontSize: 18,
                    color: '#1890ff',
                    ...disabledStyle,
                    pointerEvents: isLocked ? 'auto' : 'auto',
                  }}
                  onClick={() => !isLocked && handleOpenSelectModal(record)}
                />
              </Tooltip>
            </Space>
          )
        },
      },
    ],
    [pagination.current, pagination.pageSize]
  )

  const extraFilters = (
    <Space wrap>
      <Select
        allowClear
        placeholder="Mức độ"
        suffixIcon={<FilterOutlined />}
        style={{ width: 140, borderRadius: '1rem' }}
        value={filters.level === 'all' ? undefined : filters.level}
        onChange={(val) => handleFilterChange('level', val || 'all')}
        options={[
          { value: 1, label: 'Dễ' },
          { value: 2, label: 'Trung bình' },
          { value: 3, label: 'Khó' },
        ]}
      />
      <DatePicker
        placeholder="Ngày áp dụng"
        style={{ width: 160, borderRadius: '1rem' }}
        value={filters.date ? dayjs(filters.date) : null}
        onChange={(date) => handleFilterChange('date', date ? date.format('YYYY-MM-DD') : null)}
        format="DD/MM/YYYY"
      />
    </Space>
  )

  return (
    <>
      <ManagementLayout
        title="Quản lý Từ vựng Wordle"
        searchPlaceholder="Tìm kiếm từ vựng..."
        searchValue={filters.searchTerm}
        onSearchChange={(val) => handleFilterChange('searchTerm', val)}
        extraFilters={extraFilters}
        tableProps={{
          columns,
          dataSource: data,
          loading,
          pagination: {
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            pageSizeOptions: ['10', '20', '50', '100'],
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} từ vựng`,
            onChange: handlePaginationChange,
          },
        }}
      />

      <WordleSelectVocabModal
        open={selectModalVisible}
        onCancel={() => {
          setSelectModalVisible(false)
          setSelectedRecord(null)
        }}
        onSelect={handleSelectVocab}
        level={selectedRecord?.level}
        fetchSuitableVocabs={handleFetchSuitableVocabs}
      />
    </>
  )
}

export default WordleVocabularyList
