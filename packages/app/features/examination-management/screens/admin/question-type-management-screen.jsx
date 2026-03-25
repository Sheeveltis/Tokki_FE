import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'solito/navigation'
import { Modal, Form, Space, Select, Tooltip } from 'antd'
import { PlusOutlined, FilterOutlined, EyeOutlined } from '@ant-design/icons'
import { showAdminSuccess, showAdminError } from '../../../../../components/HelperAdmin.jsx'
import { fetchQuestionTypes } from '../../api/question-type-management.js'
import { QuestionTypeForm } from '../../components/admin/create-question-type/QuestionTypeForm.jsx'
import { createQuestionType } from '../../api/create-question-type.js'
import ManagementLayout from '../../../../../components/layout/management-layout.jsx'
import { getCurrentUserRole } from '../../../../provider/api/client.js'

const { Option } = Select

export function QuestionTypeManagement({ basePath = '/admin' }) {
  const router = useRouter()
  const role = getCurrentUserRole()
  const isStaff = role === 'Staff'

  const [filters, setFilters] = useState({
    search: '',
    skill: null,
    difficulty: null,
    examType: null,
    page: 1,
    size: 20,
  })

  const [data, setData] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form] = Form.useForm()

  const loadData = async (currentFilters) => {
    try {
      setLoading(true)
      const params = {
        ...(currentFilters.search?.trim() ? { keyword: currentFilters.search.trim() } : {}),
        ...(currentFilters.skill ? { skill: currentFilters.skill } : {}),
        ...(currentFilters.difficulty ? { difficulty: currentFilters.difficulty } : {}),
        ...(currentFilters.examType ? { examType: currentFilters.examType } : {}),
      }
      const list = await fetchQuestionTypes(params)
      // Giả sử API chưa phân trang server-side, ta bọc lại cho đúng format
      setData({ items: list || [], total: (list || []).length })
    } catch (err) {
      showAdminError(err?.message || 'Không thể tải danh sách loại câu hỏi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(filters)
  }, [filters.skill, filters.difficulty, filters.examType])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePaginationChange = (newPage, newSize) => {
    setFilters(prev => {
      const isSizeChanged = prev.size !== newSize;
      return {
        ...prev,
        size: newSize,
        page: isSizeChanged ? 1 : newPage
      }
    })
  }

  const columns = useMemo(() => [
    {
      title: () => (
        <Tooltip title="Số thứ tự">
          <span>STT</span>
        </Tooltip>
      ),
      key: 'stt',
      align: 'center',
      width: 60,
      render: (_, __, index) => (filters.page - 1) * filters.size + index + 1,
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: 'Tên loại câu hỏi',
      dataIndex: 'name',
      key: 'name',
      width: 250,
    },
    {
      title: 'Kỹ năng',
      dataIndex: 'skill',
      key: 'skill',
      width: 120,
      render: (skill) => {
        const skillMap = { 1: 'Nghe', 2: 'Đọc', 3: 'Viết' }
        return <span>{skillMap[skill] || skill}</span>
      },
    },
    {
      title: 'Mức độ',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 120,
      render: (difficulty) => {
        const difficultyMap = { 1: 'Dễ', 2: 'Trung bình', 3: 'Khó' }
        return <span>{difficultyMap[difficulty] || difficulty}</span>
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      align: 'center',
      render: (isActive) => {
        const color = isActive ? '#52c41a' : '#8c8c8c'
        return (
          <Tooltip title={isActive ? 'Hoạt động' : 'Tạm ẩn'}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: color,
                margin: '0 auto',
                boxShadow: '0 0 4px rgba(0,0,0,0.3)',
                cursor: 'pointer'
              }}
            />
          </Tooltip>
        )
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      width: 90,
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <EyeOutlined
            style={{ fontSize: 18, cursor: 'pointer', color: '#1890ff' }}
            onClick={(e) => {
              e?.stopPropagation?.()
              router.push(`${basePath}/question-type/${record.questionTypeId}`)
            }}
          />
        </Tooltip>
      ),
    },
  ], [filters, router, basePath])

  const extraFilters = (
    <Space wrap>
      <Select
        placeholder="Kỹ năng"
        allowClear
        style={{ width: 140 }}
        value={filters.skill}
        onChange={(val) => handleFilterChange('skill', val)}
        suffixIcon={<FilterOutlined />}
      >
        <Option value={1}>Nghe</Option>
        <Option value={2}>Đọc</Option>
        <Option value={3}>Viết</Option>
      </Select>
      <Select
        placeholder="Mức độ"
        allowClear
        style={{ width: 140 }}
        value={filters.difficulty}
        onChange={(val) => handleFilterChange('difficulty', val)}
        suffixIcon={<FilterOutlined />}
      >
        <Option value={1}>Dễ</Option>
        <Option value={2}>Trung bình</Option>
        <Option value={3}>Khó</Option>
      </Select>
      <Select
        placeholder="Loại đề"
        allowClear
        style={{ width: 140 }}
        value={filters.examType}
        onChange={(val) => handleFilterChange('examType', val)}
        suffixIcon={<FilterOutlined />}
      >
        <Option value={1}>TOPIK I</Option>
        <Option value={2}>TOPIK II</Option>
        <Option value={3}>Test đầu vào</Option>
      </Select>
    </Space>
  )

  const actions = useMemo(() => {
    if (isStaff) return []
    return [{
      label: 'Thêm mới',
      icon: <PlusOutlined />,
      type: 'primary',
      onPress: () => {
        form.resetFields()
        form.setFieldsValue({ isActive: true })
        setCreateModalOpen(true)
      }
    }]
  }, [isStaff, form])

  return (
    <>
      <ManagementLayout
        searchPlaceholder="Tìm kiếm..."
        searchValue={filters.search}
        onSearchChange={val => setFilters(prev => ({ ...prev, search: val }))}
        onSearchSubmit={() => loadData(filters)}
        extraFilters={extraFilters}
        actions={actions}
        tableProps={{
          columns,
          dataSource: data.items,
          loading,
          rowKey: "questionTypeId",
          pagination: {
            current: filters.page,
            pageSize: filters.size,
            total: data.total,
            showSizeChanger: true,
            onChange: handlePaginationChange
          }
        }}
      />


      <Modal
        title="Tạo bộ câu hỏi mới"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        destroyOnClose
        centered
        okText="Tạo"
        cancelText="Hủy"
        confirmLoading={creating}
        onOk={() => form.submit()}
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={{ isActive: true }}
          onFinish={async (values) => {
            try {
              setCreating(true)
              const payload = {
                ...values,
                code: values.code?.trim()?.toUpperCase(),
                name: values.name?.trim(),
                description: values.description?.trim(),
                isActive: values.isActive ? 1 : 0,
              }
              await createQuestionType(payload)
              showAdminSuccess('Đã tạo bộ câu hỏi mới')
              setCreateModalOpen(false)
              loadData(filters)
            } catch (err) {
              showAdminError(err?.message || 'Tạo bộ câu hỏi thất bại')
            } finally {
              setCreating(false)
            }
          }}
        >
          <QuestionTypeForm form={form} />
        </Form>
      </Modal>
    </>
  )
}

export default QuestionTypeManagement
