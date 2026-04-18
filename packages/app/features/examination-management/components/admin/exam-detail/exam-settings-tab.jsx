import React, { useEffect, useState } from 'react';
import { Form, Switch, Button, Spin, Typography, message, Tag, Table, ConfigProvider } from 'antd';
import { SaveOutlined, SwapOutlined } from '@ant-design/icons';
import { fetchSystemConfigs, updateSystemConfig } from '../../../../system/api/system-config.js';

const { Text } = Typography;

export const ExamSettingsTab = ({ examId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [configs, setConfigs] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await fetchSystemConfigs({ pageSize: 20 });
      const items = result?.items || [];

      // Get only keys containing ENTRANCE_EXAM
      const entranceConfigs = items.filter(item => item.key.includes('ENTRANCE_EXAM'));
      setConfigs(entranceConfigs);

      const initialValues = {};
      entranceConfigs.forEach(item => {
        initialValues[item.key] = item.value === examId;
      });
      form.setFieldsValue(initialValues);
    } catch (err) {
      message.error('Không thể tải cấu hình hệ thống');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (examId) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  const onFinish = async (values) => {
    try {
      setSaving(true);

      const promises = configs.map(config => {
        const isChecked = values[config.key];
        let newStringValue = config.value;

        if (isChecked) {
          // If enabled, forcibly set this exam ID to the global config
          newStringValue = examId;
        } else {
          // If deactivated, we only erase it if it was previously set to THIS exam ID.
          if (config.value === examId) {
            newStringValue = "";
          }
        }

        if (newStringValue !== config.value) {
          return updateSystemConfig({
            ...config,
            value: newStringValue
          });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      message.success('Đã lưu cấu hình bài kiểm tra đầu vào thành công!');
      loadData();
    } catch (err) {
      message.error(err?.message || 'Có lỗi xảy ra khi lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Spin tip="Đang tải cấu hình cài đặt..." />
      </div>
    );
  }

  const columns = [
    {
      title: 'Khóa cấu hình Hệ thống',
      key: 'key',
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: 14 }}>{record.key}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 13 }}>{record.description}</Text>
        </div>
      )
    },
    {
      title: 'Hiện trạng gán đề',
      key: 'status',
      width: 250,
      render: (_, record) => {
        if (record.value === examId) {
          return <Tag color="green">Đang gán đúng đề này</Tag>;
        }
        if (record.value && record.value !== examId) {
          return <Tag color="orange">Đang gán đề khác: {record.value}</Tag>;
        }
        return <Tag color="default">Chưa gán đề nào</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Form.Item
          name={record.key}
          valuePropName="checked"
          style={{ margin: 0 }}
        >
          <Switch checkedChildren="Bật (Gán)" unCheckedChildren="Tắt (Hủy)" />
        </Form.Item>
      )
    }
  ];

  return (
    <div style={{ backgroundColor: '#fff', padding: 24, borderRadius: 8 }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: 12 }}>
        <SwapOutlined style={{ marginRight: 8, color: '#1890ff', fontSize: 18 }} />
        <Text strong style={{ color: '#262626', textTransform: 'uppercase', fontSize: 13, letterSpacing: 1 }}>
          Gán đề thi cho bài kiểm tra đầu vào
        </Text>
      </div>

      <Form
        form={form}
        onFinish={onFinish}
      >
        <ConfigProvider theme={{ components: { Table: { headerBg: '#fafafa' } } }}>
          <Table
            columns={columns}
            dataSource={configs}
            rowKey="key"
            pagination={false}
            bordered
          />
        </ConfigProvider>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            htmlType="submit"
            loading={saving}
            style={{ borderRadius: 20, height: 40, padding: '0 20px', fontWeight: 600 }}
          >
            Lưu
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ExamSettingsTab;
