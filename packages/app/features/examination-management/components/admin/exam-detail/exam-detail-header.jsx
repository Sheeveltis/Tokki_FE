import React, { useState } from 'react';
import { Space, Button, Typography, Tag, Tooltip, message } from 'antd';
import {
  ArrowLeftOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  SettingOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useRouter } from 'solito/navigation';
import { exportExamPdf } from '../../../api/exam-management';

const { Title, Text } = Typography;

export const ExamDetailHeader = ({ exam, statusLoading, onStatusClick }) => {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);

  const handleExportPdf = async () => {
    try {
      setDownloading(true);
      const blob = await exportExamPdf(exam.examId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${exam.title || 'Exam'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      message.success('Xuất PDF thành công!');
    } catch (err) {
      console.error('Lỗi khi xuất PDF:', err);
      message.error('Xuất PDF thất bại. Vui lòng thử lại sau.');
    } finally {
      setDownloading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 1: return { color: 'success', text: 'Đã xuất bản', icon: <CheckCircleOutlined /> };
      case 2: return { color: 'error', text: 'Hết hạn', icon: <ClockCircleOutlined /> };
      default: return { color: 'warning', text: 'Bản nháp', icon: <EditOutlined /> };
    }
  };

  const statusConfig = getStatusConfig(exam.status);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Title level={3} style={{ marginBottom: 4, marginTop: 0 }}>
            Chi tiết đề
          </Title>
        </div>
        <Text type="secondary">ID: {exam.examId}</Text>
      </div>

      <Space size="small" wrap>
        <Button
          onClick={() => router.push(`/admin/exams/${exam.examId}/preview`)}
        >
          Xem thử
        </Button>

        <Button
          icon={<DownloadOutlined />}
          loading={downloading}
          onClick={handleExportPdf}
        >
          Xuất PDF
        </Button>

        <Button
          type="primary"
          loading={statusLoading}
          onClick={onStatusClick}
        >
          Chuyển trạng thái
        </Button>

        <Button
          onClick={() => window.dispatchEvent(new CustomEvent('OPEN_EDIT_INFO_MODAL'))}
        >
          Chỉnh sửa
        </Button>

        <Button
          onClick={() => router.back()}
        >
          Quay lại
        </Button>
      </Space>
    </div>
  );
};

export default ExamDetailHeader;
