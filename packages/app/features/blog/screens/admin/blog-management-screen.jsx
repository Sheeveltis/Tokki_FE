'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'solito/navigation'
import { Tag, Space, Row, Col } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import { statusArticle } from '../../../../string.js'
import DetailDrawer from '../../../../../components/DetailDrawer'
import { getBlogsAdmin, getBlogSummary, getTopBlogsByViews, getTopAuthors } from '../../api'
import { BlogSearchActions } from '../../components/blog-management/BlogSearchActions'
import { BlogStatsTable } from '../../components/blog-management/BlogStatsTable'
import { TopBlogsCard } from '../../components/blog-management/TopBlogsCard'
import { TopAuthorsCard } from '../../components/blog-management/TopAuthorsCard'

export function BlogManagement({ initialData = null }) {
  const router = useRouter()
  const [data, setData] = useState(initialData || [])
  const [loading, setLoading] = useState(!initialData)
  const [drawerItem, setDrawerItem] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState()
  const [pageNumber, setPageNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [summary, setSummary] = useState({ totalBlogs: 0, totalViews: 0, totalPublished: 0 })
  const [topBlogs, setTopBlogs] = useState([])
  const [topAuthors, setTopAuthors] = useState([])

  // Xác định cổng hiện tại dựa vào URL
  const getCurrentPortal = () => {
    if (typeof window === 'undefined') return 'admin'
    const pathname = window.location.pathname
    if (pathname === '/staff' || pathname.startsWith('/staff/')) return 'staff'
    if (pathname === '/moderator' || pathname.startsWith('/moderator/')) return 'moderator'
    return 'admin'
  }
  
  const currentPortal = getCurrentPortal()
  
  // Tính toán portalPrefix một lần dựa trên currentPortal
  const portalPrefix = useMemo(() => {
    return currentPortal === 'staff' ? '/staff' : currentPortal === 'moderator' ? '/moderator' : '/admin'
  }, [currentPortal])

  const PAGE_SIZE = 10

  // Load overview & list
  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [s, tb, ta] = await Promise.all([
          getBlogSummary(),
          getTopBlogsByViews(),
          getTopAuthors(),
        ])
        setSummary(s)
        setTopBlogs(tb)
        setTopAuthors(ta)
      } catch (err) {
        console.error('Load overview failed', err)
      }
    }
    loadOverview()
  }, [])

  useEffect(() => {
    if (initialData) return
    const load = async (page = 1, statusParam = statusFilter) => {
      try {
        setLoading(true)
        const res = await getBlogsAdmin({ pageNumber: page, pageSize: PAGE_SIZE, status: statusParam })
        setData(res.items || [])
        setTotalPages(res.totalPages || 1)
        setPageNumber(res.pageNumber || 1)
      } finally {
        setLoading(false)
      }
    }
    load(pageNumber, statusFilter)
  }, [initialData, statusFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = async (delta) => {
    const next = pageNumber + delta
    if (next < 1 || next > totalPages) return
    try {
      setLoading(true)
      const res = await getBlogsAdmin({ pageNumber: next, pageSize: PAGE_SIZE, status: statusFilter })
      setData(res.items || [])
      setTotalPages(res.totalPages || 1)
      setPageNumber(res.pageNumber || next)
    } finally {
      setLoading(false)
    }
  }

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase()
    const searched = !q
      ? data
      : data.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            (item.authorName || item.authorId || '').toLowerCase().includes(q) ||
            String(item.status).toLowerCase().includes(q),
        )
    if (statusFilter === undefined || statusFilter === null || statusFilter === '') return searched
    return searched.filter((item) => {
      const statusValue = item.status
      const statusNumber =
        statusValue === 'Nháp' ? 0 :
        statusValue === 'Đã đăng' ? 1 :
        statusValue === 'Đã ẩn' ? 2 :
        statusValue === 'Lưu trữ' ? 3 :
        undefined
      return statusNumber === statusFilter || statusValue === statusFilter
    })
  }, [data, search, statusFilter])

  const columns = useMemo(() => [
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
    { title: 'Tác giả', dataIndex: 'authorName', key: 'authorName' },
    { title: 'Lượt xem', dataIndex: 'viewCount', key: 'viewCount', width: 110, align: 'center' },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (val) => (val ? new Date(val).toLocaleString('vi-VN') : '--'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (val) => (
        <Tag color={val === 'Đã đăng' || val === 1 ? 'green' : 'orange'} style={{ fontSize: '12px', padding: '2px 8px' }}>
          {val ?? statusArticle.draft}
        </Tag>
      ),
    },
    {
      title: 'Xem',
      key: 'actions',
      align: 'center',
      width: 90,
      render: (_, record) => (
        <div
          onClick={(e) => {
            e?.stopPropagation?.()
            router.push(`${portalPrefix}/blog/${record.id}`)
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 4,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0'
            e.currentTarget.style.transform = 'scale(1.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <EyeOutlined style={{ fontSize: 18, color: '#111', transition: 'color 0.2s ease' }} />
        </div>
      ),
    },
  ], [portalPrefix, router])

  return (
    <>
      <Space direction="vertical" style={{ width: '100%', gap: 16 }}>
        <BlogSearchActions
          search={search}
          onSearchChange={setSearch}
          status={statusFilter}
          onStatusChange={(val) => {
            setPageNumber(1)
            setStatusFilter(val)
          }}
          onCreate={() => router.push(`${portalPrefix}/blog/create`)}
        />

        <Row gutter={16}>
          <Col span={16}>
            <BlogStatsTable
              summary={summary}
              columns={columns}
              data={filteredData}
              loading={loading}
              pageNumber={pageNumber}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onRowClick={(record) => setDrawerItem(record)}
            />
          </Col>

          <Col span={8}>
            <Space direction="vertical" style={{ width: '100%' }} size={16}>
              <TopBlogsCard topBlogs={topBlogs} />
              <TopAuthorsCard topAuthors={topAuthors} />
            </Space>
          </Col>
        </Row>

        <DetailDrawer
          open={!!drawerItem}
          onClose={() => setDrawerItem(null)}
          title="Chi tiết bài viết"
          data={drawerItem || {}}
        />
      </Space>
    </>
  )
}

export default BlogManagement
