import React from 'react';
import { Row, Col, Card, Statistic, Typography, Progress, Space, Empty, Spin } from 'antd';
import {
  BarChartOutlined,
  TeamOutlined,
  TrophyOutlined,
  DownloadOutlined,
  FieldTimeOutlined,
  CheckOutlined,
  PieChartOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const { Title, Text } = Typography;

export const ExamAnalysisTab = ({ exam, statsData }) => {
  if (!exam) return <Spin />;

  const chartData = [
    { name: 'Listening (Nghe)', value: statsData?.skillQuestionCounts?.listening || 0, color: '#1890ff' },
    { name: 'Reading (Đọc)', value: statsData?.skillQuestionCounts?.reading || 0, color: '#52c41a' },
    { name: 'Writing (Viết)', value: statsData?.skillQuestionCounts?.writing || 0, color: '#faad14' },
  ].filter(d => d.value > 0);

  const totalParticipants = statsData?.totalParticipants || 0;
  const completedCount = statsData?.completedCount || 0;
  const inProgressCount = statsData?.inProgressCount || 0;
  const maxScore = statsData?.maxScore || exam?.maxScore || 100;

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <BarChartOutlined style={{ color: '#1890ff' }} />
        Báo cáo chi tiết & Phân tích
      </Title>

      <Row gutter={[24, 24]}>
        {/* KPI Row */}
        <Col xs={12} sm={12} md={6}>
          <Card bordered={false} style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', borderRadius: 8, border: '1px solid #f0f0f0' }}>
            <Statistic
              title={<Text type="secondary" strong>Tổng lượt thi</Text>}
              value={totalParticipants}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
              prefix={<TeamOutlined style={{ marginRight: 8 }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card bordered={false} style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', borderRadius: 8, border: '1px solid #f0f0f0' }}>
            <Statistic
              title={<Text type="secondary" strong>Trung bình điểm</Text>}
              value={statsData?.averageScore || 0}
              precision={1}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
              prefix={<BarChartOutlined style={{ marginRight: 8 }} />}
              suffix={<span style={{ fontSize: 14, color: '#bfbfbf', fontWeight: 'normal' }}>/ {maxScore}</span>}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card bordered={false} style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', borderRadius: 8, border: '1px solid #f0f0f0' }}>
            <Statistic
              title={<Text type="secondary" strong>Điểm cao nhất</Text>}
              value={statsData?.topScore || 0}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
              precision={1}
              prefix={<TrophyOutlined style={{ marginRight: 8 }} />}
              suffix={<span style={{ fontSize: 14, color: '#bfbfbf', fontWeight: 'normal' }}>/ {maxScore}</span>}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card bordered={false} style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', borderRadius: 8, border: '1px solid #f0f0f0' }}>
            <Statistic
              title={<Text type="secondary" strong>Thời gian TB</Text>}
              value={statsData?.averageDurationMinutes || 0}
              precision={1}
              valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
              prefix={<FieldTimeOutlined style={{ marginRight: 8 }} />}
              suffix={<span style={{ fontSize: 14, color: '#bfbfbf', fontWeight: 'normal' }}>phút</span>}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card
            title={<Space><PieChartOutlined style={{ color: '#1890ff' }} /><span>Tổ chức câu hỏi theo kỹ năng</span></Space>}
            bordered={false}
            style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', borderRadius: 8, border: '1px solid #f0f0f0', height: '100%' }}
          >
            <div style={{ height: 350, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={90}
                      outerRadius={130}
                      paddingAngle={5}
                      dataKey="value"
                      animationDuration={1000}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} câu hỏi`, 'Số lượng']} />
                    <Legend
                      iconType="circle"
                      verticalAlign="middle"
                      align="right"
                      layout="vertical"
                      wrapperStyle={{ paddingLeft: 40 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="Chưa có dữ liệu phân tích kỹ năng" />
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
            
            <Card title={<Space><TeamOutlined style={{ color: '#722ed1' }} /><span>Tình trạng tham gia</span></Space>} bordered={false} style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', borderRadius: 8, border: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '0 8px', marginTop: 8 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                    <Space><CheckOutlined style={{ color: '#52c41a' }} /><Text type="secondary">Đã hoàn thành</Text></Space>
                    <Text strong>{completedCount}</Text>
                  </div>
                  <Progress percent={totalParticipants ? (completedCount / totalParticipants * 100) : 0} strokeColor="#52c41a" trailColor="#f6ffed" strokeWidth={8} showInfo={false} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                    <Space><FieldTimeOutlined style={{ color: '#faad14' }} /><Text type="secondary">Đang làm bài</Text></Space>
                    <Text strong>{inProgressCount}</Text>
                  </div>
                  <Progress percent={totalParticipants ? (inProgressCount / totalParticipants * 100) : 0} strokeColor="#faad14" trailColor="#fffbe6" strokeWidth={8} showInfo={false} />
                </div>
              </div>
            </Card>

            <Row gutter={[16, 16]} style={{ flex: 1 }}>
              <Col span={12}>
                <Card bordered={false} style={{ backgroundColor: '#fafafa', borderRadius: 8, border: '1px solid #f0f0f0', height: '100%' }}>
                  <Statistic
                    title={<Text type="secondary" style={{ fontSize: 12 }}>Tổng câu hỏi</Text>}
                    value={statsData?.totalQuestions || exam?.totalQuestions || 0}
                    valueStyle={{ fontWeight: '600', fontSize: 20 }}
                    suffix={<span style={{ fontSize: 12, color: '#8c8c8c', marginLeft: 4 }}>câu</span>}
                    prefix={<QuestionCircleOutlined style={{ color: '#8c8c8c', marginRight: 4, fontSize: 16 }} />}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card bordered={false} style={{ backgroundColor: '#fafafa', borderRadius: 8, border: '1px solid #f0f0f0', height: '100%' }}>
                  <Statistic
                    title={<Text type="secondary" style={{ fontSize: 12 }}>Lượt tải PDF</Text>}
                    value={statsData?.pdfDownloadCount || 0}
                    valueStyle={{ fontWeight: '600', fontSize: 20 }}
                    suffix={<span style={{ fontSize: 12, color: '#8c8c8c', marginLeft: 4 }}>lượt</span>}
                    prefix={<DownloadOutlined style={{ color: '#8c8c8c', marginRight: 4, fontSize: 16 }} />}
                  />
                </Card>
              </Col>
            </Row>

          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ExamAnalysisTab;
