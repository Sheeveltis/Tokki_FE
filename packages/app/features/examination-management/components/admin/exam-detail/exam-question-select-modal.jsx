'use client'

import React, { useEffect, useState } from 'react'
import { Modal, Input, Table, Tag, Pagination, Space, Spin, Button, Typography } from 'antd'
import { SearchOutlined, FileSearchOutlined } from '@ant-design/icons'
import { fetchQuestionsByPart } from '../../../api/exam-management.js'

const { Search } = Input
const { Text } = Typography

/**
 * Modal chọn câu hỏi cho một câu trong đề thi
 * - Hiển thị danh sách question bank theo templatePartId
 * - Có search + phân trang
 * - Khi chọn 1 dòng sẽ gọi onSelect(question)
 */
export function ExamQuestionSelectModal({ open, templatePartId, onCancel, onSelect }) {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [questionTypeCode, setQuestionTypeCode] = useState(null)
  const [questionTypeName, setQuestionTypeName] = useState(null)
  const [searchText, setSearchText] = useState('')

  const loadData = async (page = pageNumber, size = pageSize, search = searchText) => {
    if (!templatePartId) return
    try {
      setLoading(true)
      const res = await fetchQuestionsByPart({
        templatePartId,
        PageNumber: page,
        PageSize: size,
        Search: search?.trim() || undefined,
      })
      setItems(res.items || [])
      setPageNumber(res.pageNumber || page)
      setPageSize(res.pageSize || size)
      setTotalCount(res.totalCount || 0)
      setQuestionTypeCode(res.questionTypeCode)
      setQuestionTypeName(res.questionTypeName)
    } catch (err) {
      console.error('Failed to load questions by part', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && templatePartId) {
      // Reset về trang 1 mỗi lần mở
      setPageNumber(1)
      setSearchText('')
      loadData(1, pageSize, '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, templatePartId])

  const handleSearch = (value) => {
    const newSearch = value || ''
    setSearchText(newSearch)
    setPageNumber(1)
    loadData(1, pageSize, newSearch)
  }

  const handlePageChange = (page, size) => {
    setPageNumber(page)
    setPageSize(size)
    loadData(page, size)
  }

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 70,
      render: (_, __, index) => (pageNumber - 1) * pageSize + index + 1,
    },
    {
      title: 'Nội dung câu hỏi',
      dataIndex: 'content',
      key: 'content',
      render: (text) => (
        <div style={{ maxWidth: 420, whiteSpace: 'pre-wrap', fontWeight: 500, color: '#111827' }}>
          {text || '-'}
        </div>
      ),
    },
    {
      title: 'Giải thích',
      dataIndex: 'explanation',
      key: 'explanation',
      render: (text) => (
        <div style={{ maxWidth: 420, fontSize: 12, color: '#6b7280', whiteSpace: 'pre-wrap' }}>
          {text || '-'}
        </div>
      ),
    },
    {
      title: 'Đáp án đúng',
      key: 'correctOption',
      width: 180,
      align: 'center',
      render: (_, record) => {
        const correct = (record.options || []).find((o) => o.isCorrect)
        if (!correct) return <span>-</span>
        return <span>{correct.keyOption}. {correct.content}</span>
      },
    },
    {
      title: '',
      key: 'action',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button type="primary" size="small" onClick={() => onSelect?.(record)} icon={<FileSearchOutlined />}>
            Xem
          </Button>
        </div>
      ),
    },
  ]

  return (
    <Modal
      title={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>Chọn câu hỏi cho bộ:</span>
            {questionTypeCode && <Tag color="blue" style={{ fontSize: 14, margin: 0 }}>{questionTypeCode}</Tag>}
          </div>
          {questionTypeName && (
             <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>{questionTypeName}</Text>
          )}
          <Text type="secondary" style={{ fontSize: 12 }}>
            Tìm và chọn một câu hỏi trong ngân hàng để thay cho câu hiện tại.
          </Text>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={960}
      centered
      destroyOnHidden
      styles={{
        header: {
          padding: '20px 24px 12px',
          borderBottom: '1px solid #f3f4f6',
        },
        body: {
          padding: '12px 24px 20px',
          backgroundColor: '#f9fafb',
        },
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          padding: 16,
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
          maxHeight: 520,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
            gap: 12,
          }}
        >
          <div style={{ flex: 1 }}>
            <Search
              allowClear
              placeholder="Tìm kiếm câu hỏi"
              enterButton={
                <>
                  <SearchOutlined /> Tìm kiếm
                </>
              }
              onSearch={handleSearch}
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
            />
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <Spin spinning={loading}>
            <Table
              rowKey="questionBankId"
              columns={columns}
              dataSource={items}
              pagination={false}
              size="middle"
            />
          </Spin>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 12,
            gap: 12,
          }}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>
            Tổng số câu: <strong>{totalCount}</strong>
          </Text>
          <Pagination
            current={pageNumber}
            pageSize={pageSize}
            total={totalCount}
            showSizeChanger={false}
            onChange={handlePageChange}
            size="small"
          />
        </div>
      </div>
    </Modal>
  )
}

export default ExamQuestionSelectModal

