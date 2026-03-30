import React from 'react';
import { Row, Col, Card, Statistic, Typography, Progress, Space, Empty, Spin, Badge } from 'antd';
import {
  BarChartOutlined,
  TeamOutlined,
  TrophyOutlined,
  DownloadOutlined,
  FieldTimeOutlined,
  CheckOutlined,
  CloseOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const { Title, Text } = Typography;

export const ExamAnalysisTab = ({ exam, statsData }) => {
  if (!exam) return <Spin />;

  const chartData = [
    { name: 'Listening', value: statsData?.skillQuestionCounts?.listening || 0, color: '#1890ff' },
    { name: 'Reading', value: statsData?.skillQuestionCounts?.reading || 0, color: '#52c41a' },
  ].filter(d => d.value > 0);

  const completionData = [
    { name: 'Hoàn thành', value: statsData?.completedCount || 0, color: '#52c41a' },
    { name: 'Đang làm', value: statsData?.inProgressCount || 0, color: '#faad14' },
  ].filter(d => d.value > 0);

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <BarChartOutlined style={{ color: '#1890ff' }} />
        Báo cáo chi tiết & Phân tích
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Card bordered={false} style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', borderRadius: 8, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
                  <Statistic
                    title={<Text type="secondary">Trung bình điểm</Text>}
                    value={statsData?.averageScore || 0}
                    precision={1}
                    valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                    prefix={<TrophyOutlined style={{ marginRight: 8, color: '#52c41a' }} />}
                    suffix="/ 100"
                  />
                  <Progress percent={statsData?.averageScore} strokeColor="#52c41a" showInfo={false} style={{ marginTop: 16 }} strokeWidth={8} />
                </Card>
              </Col>
              <Col span={12}>
                <Card bordered={false} style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', borderRadius: 8, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
                  <Statistic
                    title={<Text type="secondary">Lượt tải PDF</Text>}
                    value={statsData?.pdfDownloadCount || 0}
                    valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                    prefix={<DownloadOutlined style={{ marginRight: 8, color: '#1890ff' }} />}
                  />
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>Số lượt in đề lưu trữ và sử dụng</Text>
                    {/* <Badge dot color="#1890ff" /> */}
                  </div>
                </Card>
              </Col>
            </Row>

            <Card
              title={<Space><PieChartOutlined style={{ color: '#1890ff' }} /><span>Tổ chức câu hỏi theo kỹ năng</span></Space>}
              bordered={false}
              style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', borderRadius: 8, overflow: 'hidden', border: '1px solid #f0f0f0' }}
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
                      <Tooltip />
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
                  <Empty description="Chưa có dữ liệu phân tích" />
                )}
              </div>
            </Card>
          </div>
        </Col>

        <Col xs={24} lg={8}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
            <Card title={<Space><TeamOutlined style={{ color: '#722ed1' }} /><span>Tình trạng tham gia</span></Space>} bordered={false} style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', borderRadius: 8, overflow: 'hidden', border: '1px solid #f0f0f0', height: '100%' }}>
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 32 }}>
                <div style={{ backgroundColor: '#fafafa', padding: 24, borderRadius: 8, border: '1px solid #f0f0f0', textAlign: 'center' }}>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Tổng lượt thi</Text>
                  <Title level={2} style={{ margin: 0, color: '#1890ff' }}>{statsData?.totalParticipants || 0}</Title>
                  {/* <div style={{ marginTop: 12 }}>
                    <Text type="success" style={{ fontSize: 13 }}>+12% tháng này</Text>
                  </div> */}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '0 8px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                      <Space><CheckOutlined style={{ color: '#52c41a' }} /><Text type="secondary">Hoàn thành</Text></Space>
                      <Text strong>{statsData?.completedCount || 0}</Text>
                    </div>
                    <Progress percent={statsData?.totalParticipants ? (statsData?.completedCount / statsData?.totalParticipants * 100) : 0} strokeColor="#52c41a" trailColor="#f6ffed" strokeWidth={8} showInfo={false} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                      <Space><FieldTimeOutlined style={{ color: '#faad14' }} /><Text type="secondary">Đang thực hiện</Text></Space>
                      <Text strong>{statsData?.inProgressCount || 0}</Text>
                    </div>
                    <Progress percent={statsData?.totalParticipants ? (statsData?.inProgressCount / statsData?.totalParticipants * 100) : 0} strokeColor="#faad14" trailColor="#fffbe6" strokeWidth={8} showInfo={false} />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ExamAnalysisTab;
