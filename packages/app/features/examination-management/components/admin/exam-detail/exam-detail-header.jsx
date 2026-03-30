import React from 'react';
import { Space, Button, Typography, Tag, Tooltip } from 'antd';
import { 
  ArrowLeftOutlined, 
  EyeOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  EditOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useRouter } from 'solito/navigation';

const { Title, Text } = Typography;

export const ExamDetailHeader = ({ exam, statusLoading, onStatusClick }) => {
  const router = useRouter();

  const getStatusConfig = (status) => {
    switch(status) {
      case 1: return { color: 'success', text: 'Đã xuất bản', icon: <CheckCircleOutlined /> };
      case 2: return { color: 'error', text: 'Hết hạn', icon: <ClockCircleOutlined /> };
      default: return { color: 'warning', text: 'Bản nháp', icon: <EditOutlined /> };
    }
  };

  const statusConfig = getStatusConfig(exam.status);

  return (
    <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 24 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
           <Title level={3} style={{ margin: 0 }}>
             {exam.title || 'Đề thi không tên'}
           </Title>
           <Tag color={statusConfig.color} icon={statusConfig.icon}>
             {statusConfig.text}
           </Tag>
        </div>
        <Space size="middle">
          <Text type="secondary">ID: {exam.examId}</Text>
          {exam.examTemplateName && <Text type="secondary">| Mẫu Đề: {exam.examTemplateName}</Text>}
        </Space>
      </div>

      <Space>
        <Button 
          onClick={() => router.back()} 
        >
          Quay lại
        </Button>

        <Button 
           onClick={() => router.push(`/admin/exams/${exam.examId}/preview`)}
        >
          Xem thử
        </Button>
        
        <Button 
          onClick={() => window.dispatchEvent(new CustomEvent('OPEN_EDIT_INFO_MODAL'))}
        >
          Chỉnh sửa
        </Button>

        <Button 
          type="primary" 
          loading={statusLoading}
          onClick={onStatusClick}
        >
          Đổi trạng thái
        </Button>
      </Space>
    </Space>
  );
};

export default ExamDetailHeader;
