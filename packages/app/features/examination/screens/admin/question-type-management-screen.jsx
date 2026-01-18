import React, { useEffect, useState } from 'react'
import { useRouter } from 'solito/navigation'
import { Alert, Modal, Form, message } from 'antd'
import DetailDrawer from '../../../../../components/DetailDrawer.jsx'
import QuestionTypeToolbar from '../../components/admin/question-type-management/QuestionTypeToolbar'
import QuestionTypeTable from '../../components/admin/question-type-management/QuestionTypeTable'
import { fetchQuestionTypes } from '../../api/question-type-management.js'
import { QuestionTypeForm } from '../../components/admin/create-question-type/QuestionTypeForm.jsx'
import { createQuestionType } from '../../api/create-question-type.js'

export function QuestionTypeManagement({ basePath = '/admin' }) {
  const router = useRouter()

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

  useEffect(() => {
    let mounted = true

    const load = async () => {
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
        if (mounted) setData(list)
      } catch (err) {
        if (mounted) setError(err?.message || 'Không thể tải danh sách loại câu hỏi')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [filters])

  return (
    <>
      <QuestionTypeToolbar
        filters={filters}
        onFilterChange={setFilters}
        onCreate={() => {
          form.resetFields()
          form.setFieldsValue({ isActive: true })
          setCreateModalOpen(true)
        }}
      />

      {error ? (
        <Alert type="error" showIcon message="Lỗi" description={error} style={{ marginBottom: 16 }} />
      ) : null}

      <QuestionTypeTable
        data={data}
        loading={loading}
        onRowClick={(record) => setDrawerItem(record)}
        rowKey="questionTypeId"
        onView={(record) => router.push(`${basePath}/question-type/${record.questionTypeId}`)}
      />

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
        styles={{ body: { paddingTop: 8 } }}
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
              message.success('Đã tạo bộ câu hỏi mới')
              setCreateModalOpen(false)
              // reload list
              setFilters((prev) => ({ ...prev })) // trigger useEffect
            } catch (err) {
              message.error(err?.message || 'Tạo bộ câu hỏi thất bại')
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

