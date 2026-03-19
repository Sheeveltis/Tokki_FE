import { Input, Space, Select, Button } from 'antd'
import { SearchOutlined, PlusOutlined } from '@ant-design/icons'
import { getCurrentUserRole } from '../../../../../provider/api/client.js'

const { Option } = Select

export function QuestionTypeToolbar({ filters, onFilterChange, onCreate }) {
  // Ưu tiên lấy từ token (decode role), fallback userLevel trong localStorage (1 = Admin, 2 = Staff)
  const role = getCurrentUserRole()
  const isStaffFromToken = role === 'Staff'
  const isStaffFromLocalStorage =
    typeof window !== 'undefined' &&
    typeof window.localStorage !== 'undefined' &&
    window.localStorage.getItem('userLevel') === '2'
  const isStaff = isStaffFromToken || isStaffFromLocalStorage
  const handleInputChange = (e) => {
    onFilterChange({ ...filters, keyword: e.target.value })
  }

  const handleSelectChange = (name, value) => {
    onFilterChange({ ...filters, [name]: value })
  }

  const handleCreate = () => {
    if (onCreate) onCreate()
  }

  return (
    <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} wrap>
      <Space wrap>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm theo keyword..."
          style={{ minWidth: 250, flexGrow: 1 }}
          value={filters.keyword}
          onChange={handleInputChange}
        />
        <Select
          placeholder="Lọc theo kỹ năng"
          allowClear
          style={{ minWidth: 150 }}
          value={filters.skill}
          onChange={(value) => handleSelectChange('skill', value)}
        >
          <Option value={1}>Nghe</Option>
          <Option value={2}>Đọc</Option>
          <Option value={3}>Viết</Option>
        </Select>
        <Select
          placeholder="Lọc theo mức độ"
          allowClear
          style={{ minWidth: 150 }}
          value={filters.difficulty}
          onChange={(value) => handleSelectChange('difficulty', value)}
        >
          <Option value={1}>Dễ</Option>
          <Option value={2}>Trung bình</Option>
          <Option value={3}>Khó</Option>
        </Select>
        <Select
          placeholder="Lọc theo loại đề"
          allowClear
          style={{ minWidth: 150 }}
          value={filters.examType}
          onChange={(value) => handleSelectChange('examType', value)}
        >
          <Option value={1}>TOPIK I</Option>
          <Option value={2}>TOPIK II</Option>
          <Option value={3}>Test đầu vào</Option>
        </Select>
      </Space>

      {/* {onCreate && !isStaff ? (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ minWidth: 150 }}
          onClick={handleCreate}
        >
          Thêm bộ câu hỏi
        </Button>
      ) : null} */}
    </Space>
  )
}

export default QuestionTypeToolbar

