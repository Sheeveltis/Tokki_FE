import React, { useState } from 'react';
import { Table, Avatar, Typography, Space, Tooltip, ConfigProvider } from 'antd';
import { UserOutlined, ClockCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import { useExamParticipantsAdmin } from '../../../api/exam-hooks.js';
import dayjs from 'dayjs';

const { Text } = Typography;

export const ExamParticipantsTab = ({ examId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState(0); // 0: SubmitTime, 1: Score
  const [isDescending, setIsDescending] = useState(true);

  const { data, isLoading } = useExamParticipantsAdmin({
    examId,
    PageNumber: currentPage,
    PageSize: pageSize,
    SortBy: sortBy,
    IsDescending: isDescending
  });

  const handleTableChange = (pagination, filters, sorter) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);

    if (sorter && sorter.field) {
      if (sorter.field === 'score') {
        setSortBy(1);
      } else if (sorter.field === 'submitTime') {
        setSortBy(0);
      }
      setIsDescending(sorter.order === 'descend');
    } else {
      // Default fallback
      setSortBy(0);
      setIsDescending(true);
    }
  };

  const columns = [
    {
      title: 'Học viên',
      key: 'user',
      render: (_, record) => (
        <Space size="middle">
          <Avatar 
            src={record.userAvatar} 
            icon={!record.userAvatar ? <UserOutlined /> : null} 
            size="large"
            style={{ backgroundColor: '#f0f2f5', border: '1px solid #d9d9d9' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong>{record.userName}</Text>
            <Text type="secondary" style={{ fontSize: 13 }}>{record.userEmail}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Mã bài làm',
      dataIndex: 'userExamId',
      key: 'userExamId',
      render: (text) => <Text copyable style={{ color: '#8c8c8c' }}>{text}</Text>,
    },
    {
      title: 'Điểm số',
      dataIndex: 'score',
      key: 'score',
      sorter: true,
      align: 'center',
      render: (score) => (
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: 6,
          backgroundColor: '#f6ffed', 
          border: '1px solid #b7eb8f',
          padding: '4px 12px',
          borderRadius: 16
        }}>
          <TrophyOutlined style={{ color: '#52c41a' }} />
          <Text strong style={{ color: '#389e0d' }}>{score}</Text>
        </div>
      )
    },
    {
      title: 'Thời gian nộp bài',
      dataIndex: 'submitTime',
      key: 'submitTime',
      sorter: true,
      defaultSortOrder: 'descend',
      render: (time) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#bfbfbf' }} />
          <Text>{time ? dayjs(time).format('DD/MM/YYYY HH:mm:ss') : '-'}</Text>
        </Space>
      )
    }
  ];

  return (
    <div style={{ backgroundColor: '#fff', padding: 24, borderRadius: 8 }}>
      <ConfigProvider theme={{ components: { Table: { headerBg: '#fafafa' } } }}>
        <Table
          columns={columns}
          dataSource={data?.items || []}
          rowKey="userExamId"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: data?.totalCount || 0,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} bài làm`,
          }}
          bordered
        />
      </ConfigProvider>
    </div>
  );
};

export default ExamParticipantsTab;
