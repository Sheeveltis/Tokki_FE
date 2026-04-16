import React from 'react';
import { Card, Statistic, Typography } from 'antd';
import { 
  FileTextOutlined, 
  ClockCircleOutlined, 
  TeamOutlined, 
  DownloadOutlined
} from '@ant-design/icons';

const { Text } = Typography;

export const ExamStatisticsBar = ({ exam, statsData }) => {
  const stats = [
    { title: 'Tổng câu hỏi', value: exam.totalQuestions || 0, suffix: 'câu', icon: <FileTextOutlined style={{ color: '#1890ff' }} />, color: '#e6f7ff', border: '#91d5ff' },
    { title: 'Thời gian thi', value: exam.duration || 0, suffix: 'phút', icon: <ClockCircleOutlined style={{ color: '#faad14' }} />, color: '#fffbe6', border: '#ffe58f' },
    { title: 'Lượt thi', value: statsData?.totalParticipants || 0, suffix: 'lượt', icon: <TeamOutlined style={{ color: '#eb2f96' }} />, color: '#fff0f6', border: '#ffadd2' },
    { title: 'Lượt tải PDF', value: statsData?.pdfDownloadCount || 0, suffix: 'lượt', icon: <DownloadOutlined style={{ color: '#52c41a' }} />, color: '#f6ffed', border: '#b7eb8f' },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {stats.map((item, idx) => (
          <div key={idx} style={{ flex: '1 1 200px' }}>
            <Card
              style={{
                borderRadius: 8,
                overflow: 'hidden',
                cursor: 'default',
                position: 'relative',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                borderBottom: `2px solid ${item.border}`,
                height: '100%'
              }}
              styles={{ body: { padding: 16 } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 48, height: 48, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                    backgroundColor: item.color,
                  }}
                >
                  {item.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    type="secondary"
                    style={{
                      display: 'block', marginBottom: 4, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'
                    }}
                  >
                    {item.title}
                  </Text>
                  <Statistic
                    value={item.value}
                    suffix={<span style={{ fontSize: 13, marginLeft: 4 }}>{item.suffix}</span>}
                    valueStyle={{ fontSize: 24, fontWeight: 'bold', color: '#262626' }}
                  />
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamStatisticsBar;
