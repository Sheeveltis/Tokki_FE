'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { Modal, Table, Input, Image, Button, message } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

const { Search } = Input

/**
 * Modal chọn từ vựng thủ công cho Wordle
 */
export default function WordleSelectVocabModal({ 
  open, 
  onCancel, 
  onSelect, 
  level, 
  fetchSuitableVocabs 
}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  })
  const [selectedId, setSelectedId] = useState(null)

  const loadData = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true)
      const res = await fetchSuitableVocabs({
        level: level,
        page: page,
        size: pagination.pageSize,
        searchTerm: search,
      })
      setData(res.items || [])
      setPagination(prev => ({
        ...prev,
        current: page,
        total: res.totalCount || 0,
      }))
      // Reset selection when loading new data if search/page changes
      // setSelectedId(null) 
    } catch (error) {
      message.error('Không thể tải danh sách từ vựng')
    } finally {
      setLoading(false)
    }
  }, [level, pagination.pageSize, fetchSuitableVocabs])

  useEffect(() => {
    if (open) {
      loadData(1, '')
      setSearchTerm('')
      setSelectedId(null)
    }
  }, [open, loadData])

  const handleSearch = (value) => {
    setSearchTerm(value)
    setSelectedId(null)
    loadData(1, value)
  }

  const handleTableChange = (paging) => {
    loadData(paging.current, searchTerm)
  }

  const handleConfirm = () => {
    if (!selectedId) {
      message.warning('Vui lòng chọn một từ vựng')
      return
    }

    Modal.confirm({
      title: 'Xác nhận thay đổi',
      content: 'Bạn có chắc chắn muốn chọn từ vựng này không?',
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      centered: true,
      onOk: () => {
        onSelect(selectedId)
      },
    })
  }

  const columns = [
    {
      title: 'Từ vựng',
      dataIndex: 'text',
      key: 'text',
      render: (text, record) => (
        <span style={{ fontWeight: selectedId === record.vocabularyId ? 700 : 500 }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Định nghĩa',
      dataIndex: 'definition',
      key: 'definition',
      ellipsis: true,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'imgURL',
      key: 'imgURL',
      width: 100,
      render: (url) => url ? (
        <Image 
          src={url} 
          alt="vocab" 
          width={50} 
          height={50} 
          style={{ objectFit: 'cover', borderRadius: 4 }} 
        />
      ) : '-',
    },
  ]

  return (
    <Modal
      title="Chọn từ vựng phù hợp"
      open={open}
      onCancel={onCancel}
      width={700}
      centered
      destroyOnClose
      footer={(
        <div style={{ textAlign: 'center', width: '100%' }}>
          <Button 
            type="primary" 
            size="large"
            disabled={!selectedId}
            onClick={handleConfirm}
            style={{ borderRadius: '0.5rem', minWidth: 150 }}
          >
            Xác nhận
          </Button>
        </div>
      )}
    >
      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="Tìm kiếm từ vựng..."
          allowClear
          enterButton={<SearchOutlined />}
          onSearch={handleSearch}
          loading={loading}
        />
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="vocabularyId"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: false,
          size: 'small',
        }}
        onChange={handleTableChange}
        onRow={(record) => ({
          onClick: () => setSelectedId(record.vocabularyId),
          style: { 
            cursor: 'pointer',
            backgroundColor: selectedId === record.vocabularyId ? '#e6f7ff' : 'inherit',
          }
        })}
        size="small"
      />
    </Modal>
  )
}
