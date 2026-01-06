import { FileTextOutlined, DatabaseOutlined, FileDoneOutlined, FormOutlined, PoweroffOutlined } from '@ant-design/icons'

export const moderatorMenuItems = [
  {
    key: 'approve-blog',
    icon: <FileTextOutlined />,
    label: 'Duyệt blog',
  },
  {
    key: 'approve-vocabulary',
    icon: <DatabaseOutlined />,
    label: 'Duyệt từ vựng',
  },
  {
    key: 'approve-exam-template',
    icon: <FormOutlined />,
    label: 'Duyệt cấu trúc đề',
  },
  {
    key: 'approve-exam',
    icon: <FileDoneOutlined />,
    label: 'Duyệt đề',
  },
  {
    type: 'divider',
  },
  {
    key: 'logout',
    icon: <PoweroffOutlined />,
    label: <span style={{ color: '#ff4d4f', fontWeight: 600 }}>Đăng xuất</span>,
    danger: true,
  },
]


