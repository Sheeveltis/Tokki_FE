'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Space } from 'antd'
import { EyeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { fetchVocabularies } from '../../api'
import ManagementTable from '../../../../../components/ManagementTable'
import DetailDrawer from '../../../../../components/DetailDrawer'

export function VocabularyManagement({ initialData = null }) {
  const router = useRouter()
  const [data, setData] = useState(initialData || [])
  const [loading, setLoading] = useState(!initialData)
  const [drawerItem, setDrawerItem] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (initialData) return
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetchVocabularies()
        setData(res)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [initialData])

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return data
    return data.filter((item) => {
      const inText = (item.text || '').toLowerCase().includes(q)
      const inPronounce = (item.pronunciation || '').toLowerCase().includes(q)
      const inDef = (item.definition || '').toLowerCase().includes(q)
      return inText || inPronounce || inDef
    })
  }, [data, search])

  const columns = [
    { title: 'Từ', dataIndex: 'text', key: 'text' },
    { title: 'Phiên âm', dataIndex: 'pronunciation', key: 'pronunciation' },
    { title: 'Nghĩa', dataIndex: 'definition', key: 'definition' },
    {
      title: 'Xem',
      key: 'actions',
      align: 'center',
      width: 90,
      render: (_, record) => (
        <div
          onClick={(e) => {
            e?.stopPropagation?.()
            router.push(`/admin/vocab/${record.vocabularyId || record.id}`)
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          <EyeOutlined style={{ fontSize: 18, color: '#111' }} />
        </div>
      ),
    },
  ]

  return (
    <>
      <Space style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }}>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm theo từ, nghĩa, level"
          style={{ maxWidth: 360 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ButtonV2
          title="Thêm"
          color="#F1BE4B"
          onPress={() => router.push('/admin/vocab/create')}
          style={{ minWidth: 80, paddingVertical: 10 }}
          textStyle={{ fontSize: 14 }}
          icon={<PlusOutlined />}
        />
      </Space>
      <ManagementTable
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        onRowClick={(record) => setDrawerItem(record)}
      />
      <DetailDrawer
        open={!!drawerItem}
        onClose={() => setDrawerItem(null)}
        title="Chi tiết từ vựng"
        data={drawerItem || {}}
      />
    </>
  )
}

export default VocabularyManagement

