'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'solito/navigation'
import { Space, Typography, Spin, Alert, Modal, Button, message } from 'antd'
import {
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons'
import { AdminLayout } from 'app/features/back-office/components/admin/admin-layout.web.jsx'
import { StaffLayout } from 'app/features/back-office/components/staff/staff-layout.web.jsx'
import { ModeratorLayout } from 'app/features/moderator/components/moderator-layout.web'
import { updateVocabulary, fetchVocabularyDetail, uploadVocabularyImageToCloudinary, deleteVocabulary, addExampleToVocabulary, updateExample, deleteExample } from '../../api/index.js'
import VocabularyEditModal from '../../components/admin/vocabulary-detail/vocabulary-edit-modal.jsx'
import VocabularyInfoCard from '../../components/admin/vocabulary-detail/vocabulary-info-card.jsx'
import ExampleAddModal from '../../components/admin/vocabulary-detail/example-add-modal.jsx'
import ExampleEditModal from '../../components/admin/vocabulary-detail/example-edit-modal.jsx'

const { Title, Text } = Typography

export function VocabularyDetailScreen() {
  const router = useRouter()
  const [messageApi, contextHolder] = message.useMessage()

  const getApiErrorMessage = (err, fallbackMessage) => {
    return (
      err?.response?.data?.message ||
      err?.data?.message ||
      err?.message ||
      err?.errors?.[0]?.description ||
      fallbackMessage
    )
  }
  const params = useParams()
  const searchParams = useSearchParams()
  const vocabId = params?.id
  const tabParam = searchParams?.get('tab')
  const defaultTab = tabParam || 'vocabulary-words'

  // Xác định cổng hiện tại dựa vào URL
  const getCurrentPortal = () => {
    if (typeof window === 'undefined') return 'admin'
    const pathname = window.location.pathname
    if (pathname === '/staff' || pathname.startsWith('/staff/')) return 'staff'
    if (pathname === '/moderator' || pathname.startsWith('/moderator/')) return 'moderator'
    return 'admin'
  }
  
  const currentPortal = getCurrentPortal()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [detailVocab, setDetailVocab] = useState(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [exampleAddOpen, setExampleAddOpen] = useState(false)
  const [exampleAddLoading, setExampleAddLoading] = useState(false)
  const [exampleEditOpen, setExampleEditOpen] = useState(false)
  const [exampleEditLoading, setExampleEditLoading] = useState(false)
  const [editingExample, setEditingExample] = useState(null)
  const [deletingExampleId, setDeletingExampleId] = useState(null)

  // Load chi tiết từ vựng khi có vocabId
  useEffect(() => {
    if (!vocabId) {
      setError('Không tìm thấy ID từ vựng')
      setLoading(false)
      return
    }

    let mounted = true
    const loadDetail = async () => {
      try {
        setLoading(true)
        setError('')
        const detail = await fetchVocabularyDetail(vocabId)
        if (mounted) {
          setDetailVocab(detail)
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || 'Không thể tải chi tiết từ vựng.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadDetail()
    return () => {
      mounted = false
    }
  }, [vocabId])

  const handleNavigate = (key) => {
    if (!key) return
    if (currentPortal === 'staff') {
      router.push(`/staff?tab=${key}`)
    } else if (currentPortal === 'moderator') {
      router.push(`/moderator?tab=${key}`)
    } else {
      router.push(`/admin?tab=${key}`)
    }
  }

  const handleDelete = () => {
    const vocabularyId = detailVocab?.vocabularyId || detailVocab?.id
    if (!vocabularyId) {
      messageApi.error('Không tìm thấy ID từ vựng')
      return
    }

    Modal.confirm({
      title: 'Xác nhận xóa từ vựng',
      content: `Bạn chắc chắn muốn xóa từ vựng "${detailVocab?.text || vocabularyId}"?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setDeleteLoading(true)
          await deleteVocabulary(vocabularyId)
          messageApi.success('Đã xóa từ vựng thành công')
          if (currentPortal === 'staff') {
            router.push('/staff?tab=vocabulary-words')
          } else if (currentPortal === 'moderator') {
            router.push('/moderator?tab=approve-vocabulary')
          } else {
            router.push('/admin?tab=vocabulary-words')
          }
        } catch (err) {
          // err có thể là response object từ API hoặc error object
          if (err?.isSuccess === false || err?.errors) {
            // Là response từ API với lỗi
            const errorMessage = getApiErrorMessage(err, 'Xóa từ vựng thất bại')
            messageApi.error(errorMessage)
          } else {
            // Là error khác
            messageApi.error(getApiErrorMessage(err, 'Xóa từ vựng thất bại'))
          }
        } finally {
          setDeleteLoading(false)
        }
      },
    })
  }

  const handleUpdate = async (values) => {
    try {
      setEditLoading(true)
      const vocabularyId = detailVocab?.vocabularyId || detailVocab?.id
      if (!vocabularyId) {
        messageApi.error('Không tìm thấy ID từ vựng')
        return
      }

      // Đảm bảo definition không rỗng
      if (!values?.definition) {
        messageApi.error('Vui lòng nhập định nghĩa')
        return
      }

      // Nếu có file ảnh mới, upload lên Cloudinary trước
      let imgURL = values?.imgURL || null
      if (values?.imageFile) {
        try {
          imgURL = await uploadVocabularyImageToCloudinary(values.imageFile)
          if (!imgURL) {
            messageApi.error('Không thể upload ảnh lên Cloudinary')
            return
          }
        } catch (err) {
          messageApi.error(err?.message || 'Không thể upload ảnh lên Cloudinary')
          return
        }
      }

      // Chỉ gửi các field mà API yêu cầu
      const payload = {
        vocabularyId,
        text: values?.text || '',
        pronunciation: values?.pronunciation || '',
        definition: values?.definition || '',
        imgURL: imgURL,
        status: values?.status !== undefined ? values.status : 1,
      }

      await updateVocabulary(payload)
      
      // Reload lại chi tiết từ vựng từ API để hiển thị dữ liệu mới nhất
      try {
        const refreshedDetail = await fetchVocabularyDetail(vocabularyId)
        setDetailVocab(refreshedDetail)
      } catch (reloadError) {
        console.error('Error reloading vocabulary detail:', reloadError)
        // Vẫn hiển thị success message dù reload fail
      }
      
      messageApi.success('Đã cập nhật từ vựng thành công')
      setEditOpen(false)
    } catch (err) {
      // err có thể là response object từ API hoặc error object
      if (err?.isSuccess === false || err?.errors) {
        // Là response từ API với lỗi
        const errorMessage = getApiErrorMessage(err, 'Cập nhật từ vựng thất bại')
        messageApi.error(errorMessage)
      } else {
        // Là error khác
        messageApi.error(getApiErrorMessage(err, 'Cập nhật từ vựng thất bại'))
      }
    } finally {
      setEditLoading(false)
    }
  }

  const handleAddExample = async (values) => {
    try {
      setExampleAddLoading(true)
      const vocabularyId = detailVocab?.vocabularyId || detailVocab?.id
      if (!vocabularyId) {
        messageApi.error('Không tìm thấy ID từ vựng')
        return
      }

      if (!values?.sentence) {
        messageApi.error('Vui lòng nhập câu mẫu')
        return
      }

      await addExampleToVocabulary(vocabularyId, {
        sentence: values.sentence || '',
        translation: values.translation || '',
      })

      // Reload lại chi tiết từ vựng từ API để hiển thị dữ liệu mới nhất
      try {
        const refreshedDetail = await fetchVocabularyDetail(vocabularyId)
        setDetailVocab(refreshedDetail)
      } catch (reloadError) {
        console.error('Error reloading vocabulary detail:', reloadError)
        // Vẫn hiển thị success message dù reload fail
      }

      messageApi.success('Đã thêm câu mẫu thành công')
      setExampleAddOpen(false)
    } catch (err) {
      // err có thể là response object từ API hoặc error object
      if (err?.isSuccess === false || err?.errors) {
        // Là response từ API với lỗi
        const errorMessage = getApiErrorMessage(err, 'Thêm câu mẫu thất bại')
        messageApi.error(errorMessage)
      } else {
        // Là error khác
        messageApi.error(getApiErrorMessage(err, 'Thêm câu mẫu thất bại'))
      }
    } finally {
      setExampleAddLoading(false)
    }
  }

  const handleEditExample = (example) => {
    setEditingExample(example)
    setExampleEditOpen(true)
  }

  const handleUpdateExample = async (values) => {
    try {
      setExampleEditLoading(true)
      const exampleId = editingExample?.exampleId
      if (!exampleId) {
        messageApi.error('Không tìm thấy ID câu mẫu')
        return
      }

      if (!values?.sentence) {
        messageApi.error('Vui lòng nhập câu mẫu')
        return
      }

      const vocabularyId = detailVocab?.vocabularyId || detailVocab?.id

      await updateExample(exampleId, {
        sentence: values.sentence || '',
        translation: values.translation || '',
        status: values.status !== undefined ? values.status : 1,
      })

      // Reload lại chi tiết từ vựng từ API để hiển thị dữ liệu mới nhất
      try {
        const refreshedDetail = await fetchVocabularyDetail(vocabularyId)
        setDetailVocab(refreshedDetail)
      } catch (reloadError) {
        console.error('Error reloading vocabulary detail:', reloadError)
        // Vẫn hiển thị success message dù reload fail
      }

      messageApi.success('Đã cập nhật câu mẫu thành công')
      setExampleEditOpen(false)
      setEditingExample(null)
    } catch (err) {
      // err có thể là response object từ API hoặc error object
      if (err?.isSuccess === false || err?.errors) {
        // Là response từ API với lỗi
        const errorMessage = getApiErrorMessage(err, 'Cập nhật câu mẫu thất bại')
        messageApi.error(errorMessage)
      } else {
        // Là error khác
        messageApi.error(getApiErrorMessage(err, 'Cập nhật câu mẫu thất bại'))
      }
    } finally {
      setExampleEditLoading(false)
    }
  }

  const handleDeleteExample = (example) => {
    const exampleId = example?.exampleId
    if (!exampleId) {
      messageApi.error('Không tìm thấy ID câu mẫu')
      return
    }

    Modal.confirm({
      title: 'Xác nhận xóa câu mẫu',
      content: `Bạn chắc chắn muốn xóa câu mẫu "${example?.sentence || exampleId}"?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setDeletingExampleId(exampleId)
          await deleteExample(exampleId)

          // Reload lại chi tiết từ vựng từ API để hiển thị dữ liệu mới nhất
          const vocabularyId = detailVocab?.vocabularyId || detailVocab?.id
          try {
            const refreshedDetail = await fetchVocabularyDetail(vocabularyId)
            setDetailVocab(refreshedDetail)
          } catch (reloadError) {
            console.error('Error reloading vocabulary detail:', reloadError)
          }

          messageApi.success('Đã xóa câu mẫu thành công')
        } catch (err) {
          // err có thể là response object từ API hoặc error object
          if (err?.isSuccess === false || err?.errors) {
            // Là response từ API với lỗi
            const errorMessage = getApiErrorMessage(err, 'Xóa câu mẫu thất bại')
            messageApi.error(errorMessage)
          } else {
            // Là error khác
            messageApi.error(getApiErrorMessage(err, 'Xóa câu mẫu thất bại'))
          }
        } finally {
          setDeletingExampleId(null)
        }
      },
    })
  }

  const detailContent = (() => {
    if (loading) {
      return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <Spin size="large" />
            <Text type="secondary">Đang tải từ vựng...</Text>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div style={{ padding: 24 }}>
          {contextHolder}
          <Alert
            type="error"
            description={(
              <div>
                <strong>Lỗi</strong>
                <div>{error}</div>
              </div>
            )}
          />
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            style={{ marginTop: 10, minWidth: 120, borderRadius: 20, height: 40, padding: '0 20px', fontWeight: 600 }}
            onClick={() => router.back()}
          >
            Quay lại
          </Button>
        </div>
      )
    }

    if (!detailVocab) {
      return (
        <div style={{ padding: 24 }}>
          {contextHolder}
          <Alert
            type="warning"
            description={(
              <div>
                <strong>Không tìm thấy từ vựng</strong>
              </div>
            )}
          />
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            style={{ marginTop: 12, minWidth: 140, borderRadius: 20, height: 40, padding: '0 20px', fontWeight: 600 }}
            onClick={() => router.back()}
          >
            Quay lại danh sách
          </Button>
        </div>
      )
    }

    return (
      <div>
        {contextHolder}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
          <Space style={{ justifyContent: 'space-between', width: '100%' }}>
            <div>
              <Title level={3} style={{ marginBottom: 4 }}>
                Chi tiết từ vựng
              </Title>
              <Text type="secondary">ID: {detailVocab.vocabularyId || detailVocab.id}</Text>
            </div>
            <Space>
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
              <Button danger icon={<DeleteOutlined />} loading={deleteLoading} onClick={handleDelete} style={{
                borderRadius: 20,
                height: 40,
                padding: '0 20px',
                fontWeight: 600
              }}>
                {deleteLoading ? 'Đang xóa...' : 'Xóa'}
              </Button>
              <Button type="primary" icon={<EditOutlined />} onClick={() => setEditOpen(true)} style={{
                borderRadius: 20,
                height: 40,
                padding: '0 20px',
                fontWeight: 600
              }}>
                Chỉnh sửa
              </Button>
            </Space>
          </Space>

          <VocabularyInfoCard
            vocab={detailVocab}
            onAddExample={() => setExampleAddOpen(true)}
            onEditExample={handleEditExample}
            onDeleteExample={handleDeleteExample}
            deletingExampleId={deletingExampleId}
          />
          <VocabularyEditModal
            open={editOpen}
            loading={editLoading}
            initialValues={detailVocab || {}}
            onCancel={() => setEditOpen(false)}
            onSubmit={handleUpdate}
          />
          <ExampleAddModal
            open={exampleAddOpen}
            loading={exampleAddLoading}
            onCancel={() => setExampleAddOpen(false)}
            onSubmit={handleAddExample}
          />
          <ExampleEditModal
            open={exampleEditOpen}
            loading={exampleEditLoading}
            initialValues={editingExample || {}}
            onCancel={() => {
              setExampleEditOpen(false)
              setEditingExample(null)
            }}
            onSubmit={handleUpdateExample}
          />
          </div>
        {/* </Space> */}
      </div>
    )
  })()

  return detailContent
}

export default VocabularyDetailScreen

