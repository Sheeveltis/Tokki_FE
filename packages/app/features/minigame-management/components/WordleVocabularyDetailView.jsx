'use client'

import React, { useState } from 'react'
import { Modal, Tabs, Table, Avatar, Tag, Space, Tooltip, Typography, List, Button } from 'antd'
import {
  EyeOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ArrowLeftOutlined,
  TeamOutlined,
  TrophyOutlined,
  GlobalOutlined
} from '@ant-design/icons'
import { message } from 'antd'
import { toggleWordleSubmissionVisibility } from '../api/wordle-list-api'
import { useWordlePlayers, useWordleLeaderboard } from '../api/wordle-list-hooks'
import DefaultAvatar from 'assets/user.png'

const { Title, Text } = Typography

/**
 * Màn hình chi tiết từ vựng Wordle (Tách tab giống Chi tiết chủ đề flashcard)
 */
export default function WordleVocabularyDetailView({ record, onBack }) {
  const dailyWordleId = record?.dailyWordleId

  const {
    data: players,
    loading: loadingPlayers,
    pagination: pagPlayers,
    loadData: loadPlayers
  } = useWordlePlayers(dailyWordleId)

  const {
    data: leaderboard,
    loading: loadingLeaderboard,
    pagination: pagLeaderboard,
    loadData: loadLeaderboard
  } = useWordleLeaderboard(dailyWordleId)

  const [guessModalOpen, setGuessModalOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  const handleShowGuesses = (player) => {
    setSelectedPlayer(player)
    setGuessModalOpen(true)
  }

  const handleToggleVisibility = (record) => {
    const newStatus = !record.isPublic
    Modal.confirm({
      title: 'Xác nhận thay đổi',
      content: `Bạn có chắc chắn muốn ${newStatus ? 'Công khai' : 'Gỡ công khai'} câu văn này không?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      centered: true,
      onOk: async () => {
        try {
          await toggleWordleSubmissionVisibility(record.submissionId, newStatus)
          message.success('Cập nhật trạng thái thành công')
          loadLeaderboard(pagLeaderboard.current, pagLeaderboard.pageSize)
        } catch (error) {
          message.error('Cập nhật thất bại: ' + (error.message || 'Lỗi hệ thống'))
        }
      }
    })
  }

  const playerColumns = [
    {
      title: 'Avatar',
      dataIndex: 'avatarUrl',
      key: 'avatarUrl',
      width: 80,
      align: 'center',
      render: (url) => <Avatar src={url || DefaultAvatar.src || DefaultAvatar} size="large" />,
    },
    {
      title: 'Tên người dùng',
      dataIndex: 'userName',
      key: 'userName',
      render: (text) => <Text strong>{text || 'Anonymous'}</Text>,
    },
    {
      title: 'Số lượt chơi',
      dataIndex: 'attemptCount',
      key: 'attemptCount',
      width: 120,
      align: 'center',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isWon',
      key: 'isWon',
      width: 120,
      align: 'center',
      render: (isWon) => (
        isWon ? (
          <CheckCircleFilled style={{ color: '#52c41a', fontSize: 20 }} />
        ) : (
          <CloseCircleFilled style={{ color: '#ff4d4f', fontSize: 20 }} />
        )
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="Xem chi tiết các lượt đoán">
          <EyeOutlined
            style={{ color: '#1890ff', fontSize: 18, cursor: 'pointer' }}
            onClick={() => handleShowGuesses(record)}
          />
        </Tooltip>
      ),
    },
  ]

  const leaderboardColumns = [
    {
      title: 'Người dùng',
      key: 'user',
      width: 250,
      render: (_, item) => (
        <Space>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong>{item.userName || 'Anonymous'}</Text>
            <Space size={4}>
              {item.titleIconUrl && (
                <img src={item.titleIconUrl} style={{ width: 16, height: 16, borderRadius: 8 }} />
              )}
              <span
                style={{
                  fontSize: 12,
                  color: item.titleName ? (item.titleColorHex || '#999') : '#bfbfbf',
                  fontWeight: 600
                }}
              >
                {item.titleName || 'Không có danh hiệu'}
              </span>
            </Space>
          </div>
        </Space>
      ),
    },
    {
      title: 'Câu văn',
      dataIndex: 'sentenceContent',
      key: 'sentenceContent',
      render: (text) => (
        <Tooltip title={text}>
          <div
            style={{
              maxWidth: 300,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {text}
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Điểm AI',
      dataIndex: 'aiScore',
      key: 'aiScore',
      width: 100,
      align: 'center',
      render: (score) => <Text strong style={{ color: '#52c41a' }}>{score || 0}</Text>,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 150,
      render: (_, item) => (
        <Space direction="vertical" size={0}>
          <Tag color={item.isPublic ? 'blue' : 'default'}>
            {item.isPublic ? 'Công khai' : 'Riêng tư'}
          </Tag>
          {item.isAnonymous && <Tag color="orange">Ẩn danh</Tag>}
        </Space>
      ),
    },
    {
      title: 'Lượt thích',
      dataIndex: 'likeCount',
      key: 'likeCount',
      width: 100,
      align: 'center',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Tooltip title={record.isPublic ? 'Gỡ công khai' : 'Công khai'}>
          <Button
            type="primary"
            icon={<GlobalOutlined />}
            size="small"
            style={{
              backgroundColor: '#fadb14',
              borderColor: '#fadb14',
              color: 'rgba(0, 0, 0, 0.88)'
            }}
            onClick={() => handleToggleVisibility(record)}
          />
        </Tooltip>
      ),
    },
  ]

  return (
    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header section similar to Flashcard Topic Detail */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 12
        }}
      >
        <div>
          <Title level={3} style={{ marginBottom: 4, marginTop: 0 }}>
            Chi tiết từ vựng Wordle
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Từ: <Text strong style={{ color: '#1890ff' }}>{record?.word}</Text> | ID: {dailyWordleId}
          </Text>
        </div>
        <Space size="small">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            style={{
              borderRadius: 20,
              height: 40,
              padding: '0 20px',
              fontWeight: 600
            }}
          >
            Quay lại
          </Button>
        </Space>
      </div>

      {/* Tabs section */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 8,
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          border: '1px solid #f0f0f0',
          overflow: 'hidden'
        }}
      >
        <Tabs
          defaultActiveKey="players"
          tabBarStyle={{
            padding: '4px 24px 0',
            borderBottom: '1px solid #f0f0f0',
            background: '#ffffff',
            margin: 0
          }}
          items={[
            {
              key: 'players',
              label: (
                <Space>
                  <TeamOutlined />
                  <span style={{ fontWeight: 500 }}>Danh sách người chơi</span>
                </Space>
              ),
              children: (
                <div style={{ padding: 24 }}>
                  <Table
                    columns={playerColumns}
                    dataSource={players}
                    loading={loadingPlayers}
                    rowKey="userId"
                    pagination={{
                      current: pagPlayers.current,
                      pageSize: pagPlayers.pageSize,
                      total: pagPlayers.total,
                      onChange: loadPlayers,
                      showSizeChanger: true,
                    }}
                  />
                </div>
              ),
            },
            {
              key: 'leaderboard',
              label: (
                <Space>
                  <TrophyOutlined />
                  <span style={{ fontWeight: 500 }}>Bảng Xếp Hạng</span>
                </Space>
              ),
              children: (
                <div style={{ padding: 24 }}>
                  <Table
                    columns={leaderboardColumns}
                    dataSource={leaderboard}
                    loading={loadingLeaderboard}
                    rowKey="submissionId"
                    pagination={{
                      current: pagLeaderboard.current,
                      pageSize: pagLeaderboard.pageSize,
                      total: pagLeaderboard.total,
                      onChange: loadLeaderboard,
                      showSizeChanger: true,
                    }}
                  />
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Modal con xem guesses */}
      <Modal
        title={`Lượt đoán của ${selectedPlayer?.userName || 'Anonymous'}`}
        open={guessModalOpen}
        onCancel={() => setGuessModalOpen(false)}
        footer={null}
        centered
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>Các từ đã đoán:</Text>
          <List
            bordered
            style={{ marginTop: 8 }}
            dataSource={selectedPlayer?.guesses || []}
            renderItem={(item, index) => (
              <List.Item>
                <Text strong style={{ marginRight: 8 }}>{index + 1}.</Text> {item}
              </List.Item>
            )}
            locale={{ emptyText: 'Chưa có lượt đoán nào' }}
          />
        </div>
      </Modal>
    </div>
  )
}
