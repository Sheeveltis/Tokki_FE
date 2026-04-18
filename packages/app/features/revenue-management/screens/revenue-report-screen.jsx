'use client'

import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Typography,
  DatePicker,
  Select,
  Space,
  Button,
  ConfigProvider,
  message,
} from 'antd'
import {
  DollarCircleOutlined,
  CreditCardOutlined,
  RiseOutlined,
  DashboardOutlined,
  CalendarOutlined,
  DownloadOutlined,
  TransactionOutlined,
} from '@ant-design/icons'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { apiClient } from '../../../provider/api/client.js'
import { ENDPOINTS } from '../../../provider/api/endpoints.js'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

// Colors for Pie Chart - Premium Palette
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function RevenueReport() {
  const [loading, setLoading] = useState(true)
  const [tableLoading, setTableLoading] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [dateRange, setDateRange] = useState([dayjs().startOf('year'), dayjs().endOf('year')])
  
  // Data states
  const [overviewData, setOverviewData] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    averageAmount: 0,
    growthRate: 0,
  })
  const [distributionData, setDistributionData] = useState([])
  const [chartData, setChartData] = useState([])
  const [transactions, setTransactions] = useState({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
  })

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  // Fetch Overview Data
  const fetchOverview = async (dates) => {
    try {
      const params = {}
      if (dates && dates[0] && dates[1]) {
        params.startDate = dates[0].format('DD-MM-YYYY')
        params.endDate = dates[1].format('DD-MM-YYYY')
      }
      const response = await apiClient.get(ENDPOINTS.STATISTICS_PAYMENT.OVERVIEW, { params })
      if (response.data.isSuccess) setOverviewData(response.data.data)
    } catch (error) {
      console.error('Fetch overview error:', error)
    }
  }

  // Fetch Distribution Data
  const fetchDistribution = async (dates) => {
    try {
      const params = {}
      if (dates && dates[0] && dates[1]) {
        params.startDate = dates[0].format('DD-MM-YYYY')
        params.endDate = dates[1].format('DD-MM-YYYY')
      }
      const response = await apiClient.get(ENDPOINTS.STATISTICS_PAYMENT.PACKAGE_DISTRIBUTION, { params })
      if (response.data.isSuccess) setDistributionData(response.data.data)
    } catch (error) {
      console.error('Fetch distribution error:', error)
    }
  }

  // Fetch Chart Data
  const fetchChart = async (year) => {
    try {
      const response = await apiClient.get(ENDPOINTS.STATISTICS_PAYMENT.CHART(year))
      if (response.data.isSuccess) setChartData(response.data.data)
    } catch (error) {
      console.error('Fetch chart error:', error)
    }
  }

  // Fetch Transactions List
  const fetchTransactions = async (pageNumber = 1, pageSize = 10) => {
    setTableLoading(true)
    try {
      const response = await apiClient.get(ENDPOINTS.STATISTICS_PAYMENT.LIST, {
        params: { PageNumber: pageNumber, PageSize: pageSize },
      })
      if (response.data.isSuccess) setTransactions(response.data.data)
    } catch (error) {
      console.error('Fetch transactions error:', error)
      message.error('Không thể tải danh sách giao dịch')
    } finally {
      setTableLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([
        fetchOverview(dateRange),
        fetchDistribution(dateRange),
        fetchChart(selectedYear),
        fetchTransactions(1, 10),
      ])
      setLoading(false)
    }
    init()
  }, [])

  const handleYearChange = (year) => {
    setSelectedYear(year)
    fetchChart(year)
  }

  const handleDateRangeChange = (dates) => {
    setDateRange(dates)
    if (dates && dates[0] && dates[1]) {
      fetchOverview(dates)
      fetchDistribution(dates)
    }
  }

  const tableColumns = [
    {
      title: 'Mã GD',
      dataIndex: 'paymentId',
      key: 'paymentId',
      render: (text) => <Text copyable className="font-mono text-blue-600">{text}</Text>,
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.fullName}</Text>
          <Text type="secondary" className="text-xs">{record.userEmail}</Text>
        </Space>
      ),
    },
    {
      title: 'Gói đăng ký',
      dataIndex: 'packageName',
      key: 'packageName',
      render: (text) => <Tag color="processing" className="rounded-md border-none px-3">{text}</Tag>
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amount) => <Text strong className="text-slate-800">{formatCurrency(amount)}</Text>
    },
    {
      title: 'Thanh toán',
      key: 'method',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text size="small">{record.bankName !== 'Unknown' ? record.bankName : 'N/A'}</Text>
          <Text type="secondary" className="text-[10px]">{record.accountBankNumber !== 'N/A' ? record.accountBankNumber : ''}</Text>
        </Space>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const isPaid = status === 'Paid';
        return (
          <Tag color={isPaid ? 'green' : 'orange'} className="rounded-full border-none px-4 font-medium">
            {isPaid ? 'Thành công' : 'Đang xử lý'}
          </Tag>
        );
      }
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <Space direction="vertical" size={0}>
          <Text className="text-xs">{dayjs(date).format('DD/MM/YYYY')}</Text>
          <Text type="secondary" className="text-[10px]">{dayjs(date).format('HH:mm')}</Text>
        </Space>
      )
    },
  ];

  return (
    <ConfigProvider theme={{ 
      token: { fontFamily: 'Inter, sans-serif', colorPrimary: '#3b82f6' },
      components: {
        Card: { borderRadiusLG: 16, boxShadowSecondary: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' },
        Table: { borderColor: '#f1f5f9', headerBg: '#f8fafc', headerColor: '#64748b' }
      }
    }}>
      <div style={{ padding: '24px', minHeight: '100vh' }}>
        
        {/* HEADER SECTION - Separate from cards */}
        <div className="flex flex-col lg:flex-row justify-end items-center mb-10 gap-4 px-2">
          <Space className="flex-wrap bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
            <Select
              value={selectedYear}
              style={{ width: 130 }}
              variant="borderless"
              onChange={handleYearChange}
              suffixIcon={<CalendarOutlined className="text-blue-500" />}
            >
              {[2024, 2025, 2026].map(y => <Option key={y} value={y}>Năm {y}</Option>)}
            </Select>
            <div className="h-6 w-px bg-slate-200 mx-1" />
            <RangePicker
              format="DD/MM/YYYY"
              variant="borderless"
              value={dateRange}
              onChange={handleDateRangeChange}
              className="rounded-lg"
            />
            <Button 
              type="primary" 
              icon={<DownloadOutlined />} 
              onClick={() => message.info('Đang chuẩn bị dữ liệu báo cáo...')}
              className="h-10 px-6 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 border-none shadow-md"
            >
              Xuất báo cáo
            </Button>
          </Space>
        </div>

        {/* OVERVIEW CARDS */}
        <Row gutter={[24, 24]} className="mb-10">
          <Col xs={24} sm={12} lg={6}>
            <Card variant="borderless" className="shadow-sm hover:shadow-md transition-all duration-300">
              <Statistic
                title={<Text className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider mb-1 block">Tổng Doanh Thu</Text>}
                value={overviewData.totalRevenue}
                formatter={(val) => <span className="text-slate-800 font-bold text-2xl">{formatCurrency(val)}</span>}
                prefix={
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 mr-2">
                    <DollarCircleOutlined className="text-blue-600 text-2xl" />
                  </div>
                }
                className="flex items-center"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card variant="borderless" className="shadow-sm hover:shadow-md transition-all duration-300">
              <Statistic
                title={<Text className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider mb-1 block">Tổng Giao Dịch</Text>}
                value={overviewData.totalTransactions}
                formatter={(val) => <span className="text-slate-800 font-bold text-2xl">{val} <span className="text-sm font-medium text-slate-400">GD</span></span>}
                prefix={
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 mr-2">
                    <CreditCardOutlined className="text-emerald-600 text-2xl" />
                  </div>
                }
                className="flex items-center"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card variant="borderless" className="shadow-sm hover:shadow-md transition-all duration-300">
              <Statistic
                title={<Text className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider mb-1 block">Giá Trị Trung Bình</Text>}
                value={overviewData.averageAmount}
                formatter={(val) => <span className="text-slate-800 font-bold text-2xl">{formatCurrency(val)}</span>}
                prefix={
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 mr-2">
                    <DashboardOutlined className="text-indigo-600 text-2xl" />
                  </div>
                }
                className="flex items-center"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card variant="borderless" className="shadow-sm hover:shadow-md transition-all duration-300">
              <Statistic
                title={<Text className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider mb-1 block">Tỷ Lệ Tăng Trưởng</Text>}
                value={overviewData.growthRate}
                formatter={(val) => <span className={val >= 0 ? "text-emerald-600 font-bold text-2xl" : "text-rose-600 font-bold text-2xl"}>{val}%</span>}
                prefix={
                  <div className={overviewData.growthRate >= 0 ? "w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 mr-2" : "w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100 mr-2"}>
                    <RiseOutlined className={overviewData.growthRate >= 0 ? "text-emerald-600 text-2xl" : "text-rose-600 text-2xl"} />
                  </div>
                }
                className="flex items-center"
              />
            </Card>
          </Col>
        </Row>

        {/* CHARTS SECTION */}
        <Row gutter={[24, 24]} className="mb-10">
          <Col xs={24} lg={16}>
            <Card 
              title={<Space><div className="w-1.5 h-6 bg-blue-500 rounded-full" /><span className="text-slate-800 font-bold">Biểu Đồ Doanh Thu & Giao Dịch ({selectedYear})</span></Space>}
              variant="borderless"
              className="shadow-sm h-full"
              loading={loading}
            >
              <div style={{ height: 350, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis 
                      yAxisId="left" 
                      orientation="left" 
                      stroke="#3b82f6" 
                      axisLine={false} 
                      tickLine={false}
                      tickFormatter={(value) => `${value / 1000}k`}
                      tick={{fill: '#94a3b8', fontSize: 12}}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      stroke="#10b981" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{fill: '#94a3b8', fontSize: 12}}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xl">
                              <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2">{label}</p>
                              {payload.map((entry, index) => (
                                <p key={index} className="text-sm flex justify-between gap-4 py-1" style={{ color: entry.color }}>
                                  <span className="font-medium">{entry.name}:</span>
                                  <span className="font-bold">{entry.name === 'Doanh thu' ? formatCurrency(entry.value) : entry.value}</span>
                                </p>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }} 
                    />
                    <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px' }} iconType="circle" />
                    <Bar yAxisId="left" dataKey="value" name="Doanh thu" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={24} />
                    <Bar yAxisId="right" dataKey="count" name="Số giao dịch" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} lg={8}>
            <Card 
              title={<Space><div className="w-1.5 h-6 bg-indigo-500 rounded-full" /><span className="text-slate-800 font-bold">Phân Bổ Gói Đăng Ký</span></Space>}
              variant="borderless"
              className="shadow-sm h-full"
              loading={loading}
            >
              <div style={{ height: 350, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', height: 260, position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={75}
                        outerRadius={105}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="packageName"
                        labelLine={false}
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <Text className="text-[11px] uppercase tracking-tighter text-slate-400 font-bold">Tổng GD</Text>
                    <Title level={2} className="!m-0 text-slate-800 font-bold">{distributionData.reduce((a, b) => a + b.count, 0)}</Title>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 justify-center mt-6">
                  {distributionData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <Text className="text-xs font-semibold text-slate-600">{item.packageName}</Text>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* TRANSACTIONS TABLE SECTION */}
        <div style={{ marginTop: '24px' }}>
          <Card 
            title={<Space size="middle"><TransactionOutlined className="text-blue-500 text-lg" /><span className="text-slate-800 font-bold text-lg">Giao Dịch Gần Đây</span></Space>}
            variant="borderless"
            className="shadow-sm border border-slate-50"
            styles={{ body: { padding: 0 } }}
          >
            <Table
              columns={tableColumns}
              dataSource={transactions.items}
              rowKey="paymentId"
              loading={tableLoading}
              pagination={{
                pageSize: transactions.pageSize,
                total: transactions.totalCount,
                current: transactions.pageNumber,
                onChange: (page, pageSize) => fetchTransactions(page, pageSize),
                showTotal: (total) => <span className="text-slate-500">Tổng cộng {total} giao dịch</span>,
                className: "px-6 py-4",
              }}
              scroll={{ x: 1000 }}
              className="custom-table"
            />
          </Card>
        </div>

      </div>
      
      <style jsx global>{`
        .ant-statistic-title { margin-bottom: 4px; }
        .ant-card { overflow: hidden; }
        .ant-table-thead > tr > th { font-weight: 600 !important; }
        .font-bold { font-weight: 700 !important; }
        .tracking-tight { letter-spacing: -0.025em; }
        .custom-table .ant-table { border-radius: 0 0 16px 16px; }
      `}</style>
    </ConfigProvider>
  )
}

export default RevenueReport
