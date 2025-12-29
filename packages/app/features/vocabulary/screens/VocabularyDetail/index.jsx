'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Space, Typography, Spin, Alert, Modal } from 'antd'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { AdminLayout } from 'app/features/admin/components/admin-layout.web'
import { updateVocabulary, fetchVocabularyDetail, uploadVocabularyImageToCloudinary, deleteVocabulary } from '../../api'
import { showAdminSuccess, showAdminError } from '../../../../../components/HelperAdmin.jsx'
import VocabularyEditModal from './components/vocabulary-edit-modal'
import VocabularyInfoCard from './components/vocabulary-info-card'

const { Title, Text } = Typography

export function VocabularyDetailScreen() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const vocabId = params?.id
  const tabParam = searchParams?.get('tab')
  const defaultTab = tabParam || 'vocabulary-words'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [detailVocab, setDetailVocab] = useState(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

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
    if (key) {
      router.push(`/admin?tab=${key}`)
    }
  }

  const handleDelete = () => {
    const vocabularyId = detailVocab?.vocabularyId || detailVocab?.id
    if (!vocabularyId) {
      showAdminError('Không tìm thấy ID từ vựng')
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
          showAdminSuccess('Đã xóa từ vựng thành công')
          router.push('/admin?tab=vocabulary-words')
        } catch (err) {
          // err có thể là response object từ API hoặc error object
          if (err?.isSuccess === false || err?.errors) {
            // Là response từ API với lỗi
            const errorMessage = err?.message || err?.errors?.[0]?.description || 'Xóa từ vựng thất bại'
            showAdminError(errorMessage, err?.statusCode)
          } else {
            // Là error khác
            showAdminError(err?.message || 'Xóa từ vựng thất bại')
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
        showAdminError('Không tìm thấy ID từ vựng')
        return
      }

      // Đảm bảo definition không rỗng
      if (!values?.definition) {
        showAdminError('Vui lòng nhập định nghĩa')
        return
      }

      // Nếu có file ảnh mới, upload lên Cloudinary trước
      let imgURL = values?.imgURL || null
      if (values?.imageFile) {
        try {
          imgURL = await uploadVocabularyImageToCloudinary(values.imageFile)
          if (!imgURL) {
            showAdminError('Không thể upload ảnh lên Cloudinary')
            return
          }
        } catch (err) {
          showAdminError(err?.message || 'Không thể upload ảnh lên Cloudinary')
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
      
      showAdminSuccess('Đã cập nhật từ vựng thành công')
      setEditOpen(false)
    } catch (err) {
      // err có thể là response object từ API hoặc error object
      if (err?.isSuccess === false || err?.errors) {
        // Là response từ API với lỗi
        const errorMessage = err?.message || err?.errors?.[0]?.description || 'Cập nhật từ vựng thất bại'
        showAdminError(errorMessage, err?.statusCode)
      } else {
        // Là error khác
        showAdminError(err?.message || 'Cập nhật từ vựng thất bại')
      }
    } finally {
      setEditLoading(false)
    }
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
          <Alert type="error" message="Lỗi" description={error} />
          <ButtonV2 title="Quay lại Admin" style={{ marginTop: 10, minWidth: 120 }} onPress={() => router.push('/admin')} />
        </div>
      )
    }

    if (!detailVocab) {
      return (
        <div style={{ padding: 24 }}>
          <Alert type="warning" message="Không tìm thấy từ vựng" />
          <ButtonV2
            title="Quay lại danh sách"
            style={{ marginTop: 12, minWidth: 140 }}
            onPress={() => router.push('/admin?tab=vocabulary-words')}
          />
        </div>
      )
    }

    return (
      <div style={{ padding: 24 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space style={{ justifyContent: 'space-between', width: '100%' }}>
            <div>
              <Title level={3} style={{ marginBottom: 4 }}>
                Chi tiết từ vựng
              </Title>
              <Text type="secondary">ID: {detailVocab.vocabularyId || detailVocab.id}</Text>
            </div>
            <Space>
              <ButtonV2
                title="Quay lại"
                color="mint"
                onPress={() => router.push('/admin?tab=vocabulary-words')}
                style={{ minWidth: 100, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
              />
              <ButtonV2
                title={deleteLoading ? 'Đang xóa...' : 'Xóa'}
                color="charcoal"
                onPress={handleDelete}
                disabled={deleteLoading}
                style={{ minWidth: 90, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
              />
              <ButtonV2
                title="Chỉnh sửa"
                color="poppy"
                onPress={() => setEditOpen(true)}
                style={{ minWidth: 110, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
              />
            </Space>
          </Space>

          <VocabularyInfoCard vocab={detailVocab} />
          <VocabularyEditModal
            open={editOpen}
            loading={editLoading}
            initialValues={detailVocab || {}}
            onCancel={() => setEditOpen(false)}
            onSubmit={handleUpdate}
          />
        </Space>
      </div>
    )
  })()

  const screens = {
    'vocabulary-words': detailContent,
  }

  return (
    <AdminLayout
      screens={screens}
      defaultKey={defaultTab}
      onNavigate={handleNavigate}
      onLogout={() => router.push('/login')}
    />
  )
}

export default VocabularyDetailScreen

