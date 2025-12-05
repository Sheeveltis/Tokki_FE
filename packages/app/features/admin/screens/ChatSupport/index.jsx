'use client'

import React, { useEffect, useState } from 'react'
import { Card, List, Avatar, Input, Space, Typography, Tag } from 'antd'
import { UserOutlined, SearchOutlined } from '@ant-design/icons'
import { statusUser } from '../../../../string.js'
import { fetchUsers } from '../../api'

const { Title, Text } = Typography
const { Search } = Input

export function ChatSupport({ initialData = null }) {
  const [users, setUsers] = useState(initialData || [])
  const [loading, setLoading] = useState(!initialData)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    if (initialData) return
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetchUsers()
        setUsers(res)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [initialData])

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div style={{ padding: 24, display: 'flex', gap: 16, height: 'calc(100vh - 200px)' }}>
      {/* Danh sách người dùng */}
      <Card
        style={{ width: 320, flexShrink: 0 }}
        title={
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Khung chat
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Chọn người dùng để chat
            </Text>
          </div>
        }
      >
        <Search
          placeholder="Tìm người dùng..."
          allowClear
          prefix={<SearchOutlined />}
          style={{ marginBottom: 16 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <List
          loading={loading}
          dataSource={filteredUsers}
          style={{ maxHeight: 'calc(100vh - 350px)', overflowY: 'auto' }}
          renderItem={(user) => (
            <List.Item
              style={{
                cursor: 'pointer',
                backgroundColor: selectedUser?.id === user.id ? '#f0f0f0' : 'transparent',
                padding: '12px',
                borderRadius: 8,
                marginBottom: 8,
              }}
              onClick={() => setSelectedUser(user)}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={user.name}
                description={
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {user.email}
                    </Text>
                    <br />
                    <Tag color={user.status === 'Active' ? 'green' : 'red'} style={{ marginTop: 4, fontSize: '12px', padding: '2px 8px' }}>
                      {statusUser[user.status] || user.status}
                    </Tag>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Khung chat */}
      <Card
        style={{ flex: 1 }}
        title={
          selectedUser ? (
            <div>
              <Title level={4} style={{ margin: 0 }}>
                Chat với {selectedUser.name}
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {selectedUser.email}
              </Text>
            </div>
          ) : (
            <Title level={4} style={{ margin: 0 }}>
              Chọn người dùng để bắt đầu chat
            </Title>
          )
        }
      >
        {selectedUser ? (
          <div
            style={{
              height: 'calc(100vh - 350px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#999',
            }}
          >
            <Text type="secondary">Khung chat sẽ được tích hợp tại đây</Text>
            <Text type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
              Người dùng: {selectedUser.name} ({selectedUser.email})
            </Text>
          </div>
        ) : (
          <div
            style={{
              height: 'calc(100vh - 350px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#999',
            }}
          >
            <Text type="secondary">Vui lòng chọn người dùng từ danh sách bên trái</Text>
          </div>
        )}
      </Card>
    </div>
  )
}

export default ChatSupport

