import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'solito/navigation'
import { Alert, Modal, Form, Space, Select, Button, Input } from 'antd'
import { PlusOutlined, FilterOutlined, SearchOutlined } from '@ant-design/icons'
import DetailDrawer from '../../../../../components/DetailDrawer.jsx'
import { showAdminSuccess, showAdminError } from '../../../../../components/HelperAdmin.jsx'
import { useQuestionTypeColumns } from '../../components/admin/question-type-management/QuestionTypeTable.jsx'
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

  const [drawerItem, setDrawerItem] = useState(null)
  const [filters, setFilters] = useState({
    keyword: '',
    skill: null,
    difficulty: null,
    examType: null,
  })

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form] = Form.useForm()

  const onView = (record) => router.push(`${basePath}/question-type/${record.questionTypeId}`)
  const columns = useQuestionTypeColumns(onView)

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const params = {
        ...(filters.keyword?.trim() ? { keyword: filters.keyword.trim() } : {}),
        ...(filters.skill ? { skill: filters.skill } : {}),
        ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
        ...(filters.examType ? { examType: filters.examType } : {}),
      }

      const list = await fetchQuestionTypes(params)
      setData(list)
    } catch (err) {
      setError(err?.message || 'Không thể tải danh sách loại câu hỏi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [filters])

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }))
  }

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
    const list = []
    if (!isStaff) {
      list.push({
        label: 'Tạo bộ câu hỏi',
        icon: <PlusOutlined />,
        onPress: () => {
          form.resetFields()
          form.setFieldsValue({ isActive: true })
          setCreateModalOpen(true)
        }
      })
    }
    return list
  }, [isStaff, form])

  return (
    <>
      <ManagementLayout
        searchPlaceholder="Tìm kiếm..."
        searchValue={filters.keyword}
        onSearchChange={(val) => handleFilterChange('keyword', val)}
        extraFilters={extraFilters}
        actions={actions}
        tableProps={{
          columns: columns,
          dataSource: data || [],
          loading: loading,
          onRowClick: (record) => setDrawerItem(record),
          rowKey: "questionTypeId",
        }}
      />

      {error ? (
        <Alert type="error" showIcon message="Lỗi" description={error} style={{ marginTop: 16 }} />
      ) : null}

      <DetailDrawer
        open={!!drawerItem}
        onClose={() => setDrawerItem(null)}
        title="Chi tiết loại câu hỏi"
        data={drawerItem || {}}
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
              loadData()
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

