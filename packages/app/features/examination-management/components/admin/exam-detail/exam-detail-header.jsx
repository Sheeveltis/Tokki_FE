import React, { useState } from 'react';
import { Space, Button, Typography, Tag, Tooltip, message, Modal } from 'antd';
import {
  ArrowLeftOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  SettingOutlined,
  DownloadOutlined,
  SwapOutlined
} from '@ant-design/icons';
import { useRouter } from 'solito/navigation';
import { exportExamPdf } from '../../../api/exam-management';

const { Title, Text } = Typography;

export const ExamDetailHeader = ({ exam, statusLoading, onStatusClick }) => {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);

  const [exportModalVisible, setExportModalVisible] = useState(false);

  const handleExportPdf = async (showExplanation = true) => {
    try {
      setDownloading(true);
      const blob = await exportExamPdf(exam.examId, showExplanation);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${exam.title || 'Exam'}${showExplanation ? '_co_giai_thich' : ''}.pdf`);
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
      case 2: return { color: 'error', text: 'Đã xóa', icon: <ClockCircleOutlined /> };
      case 3: return { color: 'processing', text: 'Công khai (Làm thử)', icon: <CheckCircleOutlined /> };
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
          icon={<EyeOutlined />}
          onClick={() => router.push(`/admin/exams/${exam.examId}/preview`)}
          style={{
            borderRadius: 20,
            height: 40,
            padding: '0 20px',
            fontWeight: 600
          }}
        >
          Xem thử
        </Button>

        <Button
          type="dashed"
          icon={<DownloadOutlined />}
          loading={downloading}
          onClick={() => setExportModalVisible(true)}
          style={{
            borderRadius: 20,
            height: 40,
            padding: '0 20px',
            fontWeight: 600
          }}
        >
          Xuất PDF
        </Button>

        <Modal
          title="Tùy chọn xuất PDF"
          open={exportModalVisible}
          onCancel={() => setExportModalVisible(false)}
          centered
          footer={[
            <Button 
              key="no" 
              onClick={() => { setExportModalVisible(false); handleExportPdf(false); }}
              style={{ borderRadius: 20 }}
            >
              Không kèm giải thích
            </Button>,
            <Button 
              key="yes" 
              type="primary" 
              onClick={() => { setExportModalVisible(false); handleExportPdf(true); }}
              style={{ borderRadius: 20 }}
            >
              Có kèm giải thích
            </Button>,
          ]}
        >
          <p>Bạn có muốn xuất đề thi bao gồm phần giải thích chi tiết cho các câu hỏi không?</p>
        </Modal>

        <Button
          type="primary"
          icon={<SwapOutlined />}
          loading={statusLoading}
          onClick={onStatusClick}
          style={{
            borderRadius: 20,
            height: 40,
            padding: '0 20px',
            fontWeight: 600
          }}
        >
          Chuyển trạng thái
        </Button>

        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => window.dispatchEvent(new CustomEvent('OPEN_EDIT_INFO_MODAL'))}
          style={{
            borderRadius: 20,
            height: 40,
            padding: '0 20px',
            fontWeight: 600
          }}
        >
          Chỉnh sửa
        </Button>

        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
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
  );
};

export default ExamDetailHeader;
