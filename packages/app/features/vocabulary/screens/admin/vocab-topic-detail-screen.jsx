'use client'

import React, { useEffect, useMemo, useState, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'solito/navigation'
import { Card, Space, Typography, Spin, Alert, Modal, Button, Tabs, Divider, notification, message } from 'antd'
import {
  EditOutlined,
  SendOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined,
  UnorderedListOutlined
} from '@ant-design/icons'
import {
  fetchFlashcardTopicDetail,
  searchVocabulariesForTopic,
  addVocabulariesToTopicAndReload,
  removeVocabulariesFromTopicAndReload,
  updateFlashcardTopic,
  deleteTopic,
  uploadTopicImageToCloudinary,
  uploadExcelToTopic,
  exportTopicToExcel,
  submitTopicForApproval,
  approveTopic,
  rejectTopic,
} from '../../api'
import { getCurrentUserRole } from '../../../../provider/api/client.js'
import TopicInfoCard from '../../components/admin/vocab-topic-detail/topic-info-card'
import TopicVocabSection from '../../components/admin/vocab-topic-detail/topic-vocab-section'
import FlashcardTopicEditModal from '../../components/admin/vocab-topic-detail/vocab-topic-edit-modal.jsx'
import QuickAddVocabularyModal from '../../components/admin/vocab-topic-detail/quick-add-vocabulary-modal'
import VocabularyGuideModal from '../../components/admin/vocab-topic-detail/vocabulary-guide-modal'
import TopicApprovalModal from '../../components/admin/vocab-topic-detail/topic-approval-modal'
import TopicStatusChangeModal from '../../components/admin/vocab-topic-detail/topic-status-change-modal'

const { Title, Text } = Typography

export function FlashcardTopicDetailScreen() {
  const router = useRouter()
  const [messageApi, contextHolder] = message.useMessage()
  const params = useParams()
  const searchParams = useSearchParams()
  const topicId = params?.id
  const tabParam = searchParams?.get('tab')
  const defaultTab = tabParam || 'vocabulary-topics'

  // Xác định cổng hiện tại dựa vào URL - đọc trực tiếp mỗi lần render để đảm bảo luôn lấy giá trị mới nhất
  const getCurrentPortal = () => {
    if (typeof window === 'undefined') return 'admin'
    const pathname = window.location.pathname
    // Kiểm tra exact match hoặc startsWith để cover cả /staff và /staff/...
    if (pathname === '/staff' || pathname.startsWith('/staff/')) return 'staff'
    if (pathname === '/moderator' || pathname.startsWith('/moderator/')) return 'moderator'
    return 'admin'
  }

  const currentPortal = getCurrentPortal()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchVocabList, setSearchVocabList] = useState([]) // Danh sách từ vựng từ API search (để thêm vào chủ đề)
  const [topicVocabularies, setTopicVocabularies] = useState([]) // Danh sách từ vựng đã có trong chủ đề
  const [topicVocabIds, setTopicVocabIds] = useState([])
  const [selecting, setSelecting] = useState([])
  const [removingKeys, setRemovingKeys] = useState([])
  const [searching, setSearching] = useState(false)
  const [detailTopic, setDetailTopic] = useState(null)
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [submittingForApproval, setSubmittingForApproval] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false)
  const [uploadingExcel, setUploadingExcel] = useState(false)
  const [exportingExcel, setExportingExcel] = useState(false)
  const [guideModalOpen, setGuideModalOpen] = useState(false)
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [approvalLoading, setApprovalLoading] = useState(false)
  const [topicIdForApproval, setTopicIdForApproval] = useState(null)
  const [approvalType, setApprovalType] = useState('approve')
  const [statusChangeModalOpen, setStatusChangeModalOpen] = useState(false)
  const [statusChangeLoading, setStatusChangeLoading] = useState(false)
  const [excelImportResult, setExcelImportResult] = useState(null)
  const searchTimeoutRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const resDetail = await fetchFlashcardTopicDetail(topicId)
        if (mounted && resDetail?.topic) {
          setDetailTopic(resDetail.topic)
          setTopicVocabIds(resDetail.topic.vocabIds || [])
          setTopicVocabularies(resDetail.vocabularies || []) // Lưu danh sách từ vựng đã có trong chủ đề
          setSearchVocabList([]) // Reset danh sách search
          setSelecting([])
          setRemovingKeys([])
        }
      } catch (err) {
        if (mounted) setError(err?.message || 'Không thể tải chủ đề.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [topicId])

  const availableOptions = useMemo(() => {
    // Chỉ hiển thị các từ vựng từ kết quả search (không phải từ vựng đã có trong chủ đề)
    const safeSearchVocabList = Array.isArray(searchVocabList) ? searchVocabList : []
    return safeSearchVocabList.map((v) => ({
      label: `${v.text} - ${v.definition || ''}`,
      value: v.vocabularyId || v.id,
    }))
  }, [searchVocabList])

  const handleSearchVocab = async (keyword, immediate = false) => {
    // Clear timeout trước đó nếu có
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    const performSearch = async () => {
      setSearching(true)
      try {
        // Sử dụng function API đã được tách ra
        const items = await searchVocabulariesForTopic(keyword, { pageSize: 10 })
        // Cập nhật danh sách từ vựng từ API search (để hiển thị trong Select)
        setSearchVocabList(items)
      } catch (err) {
        console.error('Error searching vocabularies:', err)
        setSearchVocabList([])
      } finally {
        setSearching(false)
      }
    }

    // Nếu immediate = true, gọi ngay lập tức (không debounce)
    if (immediate) {
      performSearch()
    } else {
      // Debounce: đợi 300ms sau khi người dùng ngừng gõ
      searchTimeoutRef.current = setTimeout(performSearch, 300)
    }
  }

  // Tự động load 10 từ vựng đầu tiên khi focus vào Select
  const handleSelectFocus = () => {
    // Chỉ load nếu danh sách đang trống và không đang searching
    if (searchVocabList.length === 0 && !searching) {
      // Gọi search ngay lập tức (không debounce) khi focus lần đầu
      handleSearchVocab('', true)
    }
  }

  // Cleanup timeout khi component unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const handleRemoveVocab = async () => {
    if (!removingKeys?.length || !topicId) return

    setRemoving(true)
    try {
      const { response, topicDetail } = await removeVocabulariesFromTopicAndReload(topicId, removingKeys)

      if (response?.isSuccess) {
        if (topicDetail?.topic) {
          setDetailTopic(topicDetail.topic)
          setTopicVocabIds(topicDetail.topic.vocabIds || [])
          setTopicVocabularies(topicDetail.vocabularies || [])
          setRemovingKeys([])
        }
        messageApi.success('Đã gỡ từ vựng thành công')
      } else {
        messageApi.error(response?.message || 'Không thể gỡ từ vựng khỏi chủ đề')
      }
    } catch (err) {
      console.error('Error removing vocabularies:', err)
      messageApi.error(err?.message || 'Không thể gỡ từ vựng khỏi chủ đề')
    } finally {
      setRemoving(false)
    }
  }

  const topicVocabData = useMemo(() => {
    // Sử dụng topicVocabularies (danh sách từ vựng đã có trong chủ đề) thay vì searchVocabList
    const safeTopicVocabularies = Array.isArray(topicVocabularies) ? topicVocabularies : []
    const safeTopicVocabIds = Array.isArray(topicVocabIds) ? topicVocabIds : []

    // Lọc và map các từ vựng theo topicVocabIds
    return safeTopicVocabIds
      .map((id) => safeTopicVocabularies.find((v) => v.vocabularyId === id || v.id === id))
      .filter(Boolean)
      .map((v) => ({ key: v.vocabularyId || v.id, ...v }))
  }, [topicVocabIds, topicVocabularies])

  const handleAddVocab = async () => {
    if (!selecting?.length || !topicId) return

    setAdding(true)
    try {
      const { response, topicDetail } = await addVocabulariesToTopicAndReload(topicId, selecting)

      if (response?.isSuccess) {
        if (topicDetail?.topic) {
          setDetailTopic(topicDetail.topic)
          setTopicVocabIds(topicDetail.topic.vocabIds || [])
          setTopicVocabularies(topicDetail.vocabularies || [])

          setSelecting([])
          setSearchVocabList([])
        }
        messageApi.success('Đã thêm từ vựng thành công')
      } else {
        messageApi.error(response?.message || 'Không thể thêm từ vựng vào chủ đề')
      }
    } catch (err) {
      console.error('Error adding vocabularies:', err)
      messageApi.error(err?.message || 'Không thể thêm từ vựng vào chủ đề')
    } finally {
      setAdding(false)
    }
  }

  // Cleanup timeout khi component unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

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
    const topicId = detailTopic?.id || detailTopic?._raw?.topicId
    if (!topicId) {
      messageApi.error('Không tìm thấy ID chủ đề')
      return
    }

    Modal.confirm({
      title: 'Xác nhận xóa chủ đề',
      centered: true,
      content: `Bạn chắc chắn muốn xóa chủ đề "${detailTopic?.title || detailTopic?._raw?.topicName || topicId}"?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { 
        danger: true,
        style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } 
      },
      cancelButtonProps: { 
        style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } 
      },
      onOk: async () => {
        try {
          setDeleteLoading(true)
          await deleteTopic(topicId)
          messageApi.success('Đã xóa chủ đề thành công')
          if (currentPortal === 'staff') {
            router.push('/staff?tab=vocabulary-topics')
          } else if (currentPortal === 'moderator') {
            router.push('/moderator?tab=vocabulary-topics')
          } else {
            router.push('/admin?tab=vocabulary-topics')
          }
        } catch (err) {
          const errorMessage = err?.message || err?.errors?.[0]?.description || 'Xóa chủ đề thất bại'
          messageApi.error(errorMessage)
        } finally {
          setDeleteLoading(false)
        }
      },
    })
  }

  const handleUpdate = async (values) => {
    try {
      setEditLoading(true)
      const topicId = detailTopic?.id || detailTopic?._raw?.topicId
      if (!topicId) {
        messageApi.error('Không tìm thấy ID chủ đề')
        return
      }

      if (!values?.topicName || !values?.description) {
        messageApi.error('Vui lòng nhập đầy đủ thông tin')
        return
      }

      // Nếu có file ảnh mới, upload lên Cloudinary trước
      let imgUrl = values?.imgUrl || null
      if (values?.imageFile) {
        try {
          imgUrl = await uploadTopicImageToCloudinary(values.imageFile)
          if (!imgUrl) {
            messageApi.error('Không thể upload ảnh lên Cloudinary')
            return
          }
        } catch (err) {
          messageApi.error(err?.message || 'Không thể upload ảnh lên Cloudinary')
          return
        }
      }

      // Moderator không được thay đổi status, giữ nguyên status hiện tại
      const currentStatus = detailTopic?._raw?.status ?? detailTopic?.status ?? 1
      const finalStatus = currentPortal === 'moderator' ? currentStatus : (values.status !== undefined ? values.status : currentStatus)

      await updateFlashcardTopic(topicId, {
        topicName: values.topicName || '',
        description: values.description || '',
        level: values.level || 1,
        status: finalStatus,
        imgUrl: imgUrl,
      })

      // Reload lại chi tiết chủ đề từ API để hiển thị dữ liệu mới nhất
      try {
        const refreshedDetail = await fetchFlashcardTopicDetail(topicId)
        if (refreshedDetail?.topic) {
          setDetailTopic(refreshedDetail.topic)
          setTopicVocabIds(refreshedDetail.topic.vocabIds || [])
          setTopicVocabularies(refreshedDetail.vocabularies || [])
        }
      } catch (reloadError) {
        console.error('Error reloading topic detail:', reloadError)
      }

      messageApi.success('Đã cập nhật chủ đề thành công')
      setEditOpen(false)
    } catch (err) {
      const errorMessage = err?.message || err?.errors?.[0]?.description || 'Cập nhật chủ đề thất bại'
      messageApi.error(errorMessage)
    } finally {
      setEditLoading(false)
    }
  }

  const handleSubmitForApproval = async () => {
    const topicStatus = detailTopic?._raw?.status ?? detailTopic?.status
    const isDraft = topicStatus === 0
    const isRejected = topicStatus === 4
    const hasVocab =
      (typeof detailTopic?.vocabularyCount === 'number'
        ? detailTopic.vocabularyCount
        : Array.isArray(topicVocabIds)
          ? topicVocabIds.length
          : Array.isArray(topicVocabData)
            ? topicVocabData.length
            : 0) > 0

    // Cho phép gửi lại khi status = 0 (Draft) hoặc 4 (Rejected)
    if (!isDraft && !isRejected) {
      messageApi.error('Chỉ có thể gửi chủ đề ở trạng thái Bản nháp hoặc Bị từ chối phê duyệt')
      return
    }

    if (!hasVocab) {
      messageApi.error('Chủ đề phải có ít nhất 1 từ vựng mới được gửi phê duyệt')
      return
    }

    const topicIdForSubmit = detailTopic?.id || detailTopic?._raw?.topicId
    if (!topicIdForSubmit) {
      messageApi.error('Không tìm thấy ID chủ đề')
      return
    }

    try {
      setSubmittingForApproval(true)

      const response = await submitTopicForApproval(topicIdForSubmit)

      if (response?.isSuccess) {
        // Reload lại chi tiết chủ đề sau khi gửi duyệt
        try {
          const refreshedDetail = await fetchFlashcardTopicDetail(topicIdForSubmit)
          if (refreshedDetail?.topic) {
            setDetailTopic(refreshedDetail.topic)
            setTopicVocabIds(refreshedDetail.topic.vocabIds || [])
            setTopicVocabularies(refreshedDetail.vocabularies || [])
          }
        } catch (reloadError) {
          console.error('Error reloading topic detail after submit for approval:', reloadError)
        }
        messageApi.success('Gửi chủ đề chờ phê duyệt thành công')
      } else {
        messageApi.error(response?.message || 'Không thể gửi chủ đề chờ phê duyệt')
      }
    } catch (err) {
      console.error('Error submitting topic for approval:', err)
      messageApi.error(err?.message || 'Không thể gửi chủ đề chờ phê duyệt')
    } finally {
      setSubmittingForApproval(false)
    }
  }

  const handleOpenApprovalModal = (type) => {
    const topicIdForApproval = detailTopic?.id || detailTopic?._raw?.topicId
    if (!topicIdForApproval) {
      messageApi.error('Không tìm thấy ID chủ đề')
      return
    }
    setTopicIdForApproval(topicIdForApproval)
    setApprovalType(type)
    setApprovalModalOpen(true)
  }

  const handleStatusChange = async (values) => {
    if (!topicId) {
      messageApi.error('Không tìm thấy ID chủ đề')
      return
    }

    const newStatus = values.status
    const currentStatus = detailTopic?._raw?.status ?? detailTopic?.status

    if (newStatus === currentStatus) {
      messageApi.error('Trạng thái đã được chọn')
      setStatusChangeModalOpen(false)
      return
    }

    setStatusChangeLoading(true)

    try {
      await updateFlashcardTopic(topicId, {
        status: newStatus,
      })

      // Reload lại chi tiết chủ đề sau khi chuyển trạng thái
      try {
        const refreshedDetail = await fetchFlashcardTopicDetail(topicId)
        if (refreshedDetail?.topic) {
          setDetailTopic(refreshedDetail.topic)
          setTopicVocabIds(refreshedDetail.topic.vocabIds || [])
          setTopicVocabularies(refreshedDetail.vocabularies || [])
        }
      } catch (reloadError) {
        console.error('Error reloading topic detail after status change:', reloadError)
      }

      const statusLabels = {
        0: 'Bản nháp',
        1: 'Đang hoạt động',
        2: 'Đã xóa',
        3: 'Chờ phê duyệt',
        4: 'Bị từ chối phê duyệt',
      }

      messageApi.success(`Chuyển trạng thái sang "${statusLabels[newStatus]}" thành công`)
      setStatusChangeModalOpen(false)
    } catch (err) {
      console.error('Error changing topic status:', err)
      const errorMessage = err?.message || err?.errors?.[0]?.description || 'Không thể chuyển trạng thái chủ đề'
      messageApi.error(errorMessage)
    } finally {
      setStatusChangeLoading(false)
    }
  }

  const handleApproval = async (values) => {
    if (!topicIdForApproval) {
      messageApi.error('Không tìm thấy ID chủ đề')
      return
    }

    setApprovalLoading(true)

    try {
      if (values.approvalType === 'approve') {
        // Đồng ý phê duyệt
        await approveTopic(topicIdForApproval)

        // Reload lại chi tiết chủ đề sau khi phê duyệt
        try {
          const refreshedDetail = await fetchFlashcardTopicDetail(topicIdForApproval)
          if (refreshedDetail?.topic) {
            setDetailTopic(refreshedDetail.topic)
            setTopicVocabIds(refreshedDetail.topic.vocabIds || [])
            setTopicVocabularies(refreshedDetail.vocabularies || [])
          }
        } catch (reloadError) {
          console.error('Error reloading topic detail after approval:', reloadError)
        }

        messageApi.success('Phê duyệt chủ đề thành công')
        setApprovalModalOpen(false)
      } else {
        // Từ chối phê duyệt
        const rejectReason = values.rejectionReason?.trim() || ''
        if (!rejectReason || rejectReason.length < 10) {
          messageApi.error('Lý do từ chối phải có ít nhất 10 ký tự')
          setApprovalLoading(false)
          return
        }

        await rejectTopic(topicIdForApproval, rejectReason)

        // Reload lại chi tiết chủ đề sau khi từ chối
        try {
          const refreshedDetail = await fetchFlashcardTopicDetail(topicIdForApproval)
          if (refreshedDetail?.topic) {
            setDetailTopic(refreshedDetail.topic)
            setTopicVocabIds(refreshedDetail.topic.vocabIds || [])
            setTopicVocabularies(refreshedDetail.vocabularies || [])
          }
        } catch (reloadError) {
          console.error('Error reloading topic detail after rejection:', reloadError)
        }

        messageApi.success('Từ chối phê duyệt chủ đề thành công')
        setApprovalModalOpen(false)
        setTopicIdForApproval(null)
      }
    } catch (err) {
      console.error('Error approving/rejecting topic:', err)
      const errorMessage = err?.message || err?.errors?.[0]?.description || 'Không thể phê duyệt chủ đề'
      messageApi.error(errorMessage)
    } finally {
      setApprovalLoading(false)
    }
  }

  const handleExcelUpload = async (file) => {
    if (!topicId || !file) return

    setUploadingExcel(true)
    setExcelImportResult(null)

    try {
      const response = await uploadExcelToTopic(topicId, file)

      if (response?.isSuccess) {
        const successCount = response?.data?.successList?.length || 0
        const failureCount = response?.data?.failureList?.length || 0

        // Reload lại chi tiết chủ đề từ API để hiển thị dữ liệu mới nhất
        try {
          const refreshedDetail = await fetchFlashcardTopicDetail(topicId)
          if (refreshedDetail?.topic) {
            setDetailTopic(refreshedDetail.topic)
            setTopicVocabIds(refreshedDetail.topic.vocabIds || [])
            setTopicVocabularies(refreshedDetail.vocabularies || [])
          }
        } catch (reloadError) {
          console.error('Error reloading topic detail:', reloadError)
        }

        messageApi.success(response?.message || `Import thành công ${successCount} từ vựng${failureCount > 0 ? `, thất bại ${failureCount} từ vựng` : ''}`)

        setExcelImportResult({
          addedNewCount: response?.data?.addedNewCount ?? 0,
          linkedExistingCount: response?.data?.linkedExistingCount ?? 0,
          failureCount: response?.data?.failureCount ?? 0,
        })
      } else {
        throw new Error(response?.message || 'Import từ vựng thất bại')
      }
    } catch (err) {
      console.error('Error uploading Excel:', err)
      const errorMessage = err?.message || err?.errors?.[0]?.description || 'Không thể import từ vựng từ Excel'
      messageApi.error(errorMessage)
      setExcelImportResult(null)
    } finally {
      setUploadingExcel(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleExcelFileSelect = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Kiểm tra định dạng file
    const validExtensions = ['.xlsx', '.xls']
    const fileName = file.name.toLowerCase()
    const isValidExtension = validExtensions.some((ext) => fileName.endsWith(ext))

    if (!isValidExtension) {
      messageApi.error('Vui lòng chọn file Excel (.xlsx hoặc .xls)')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Tự động upload khi chọn file
    handleExcelUpload(file)
  }

  const handleExportExcel = async () => {
    if (!topicId) {
      messageApi.error('Không tìm thấy ID chủ đề')
      return
    }

    setExportingExcel(true)

    try {
      // Gọi API để lấy file Excel
      const blob = await exportTopicToExcel(topicId)

      // Tạo URL tạm thời từ blob và trigger download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // Lấy tên file từ topic hoặc dùng tên mặc định
      const topicName = detailTopic?.title || detailTopic?._raw?.topicName || 'topic'
      const fileName = `${topicName}_${topicId}.xlsx`
      link.download = fileName

      // Trigger download
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      messageApi.success('Xuất file Excel thành công')
    } catch (err) {
      console.error('Error exporting Excel:', err)
      const errorMessage = err?.message || err?.errors?.[0]?.description || 'Không thể xuất file Excel'
      messageApi.error(errorMessage)
    } finally {
      setExportingExcel(false)
    }
  }

  const detailContent = (() => {
    if (loading) {
      return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <Spin size="large" />
            <Text type="secondary">Đang tải chủ đề...</Text>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div style={{ padding: 24 }}>
          {contextHolder}
          <Alert type="error" message="Lỗi" description={error} />
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

    if (!detailTopic) {
      return (
        <div style={{ padding: 24 }}>
          {contextHolder}
          <Alert type="warning" message="Không tìm thấy chủ đề" />
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
      <div
        style={{
          width: '100%',
          height: '100%',
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        {contextHolder}
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            minHeight: 0,
            overflow: 'auto',
            paddingRight: 4,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <Title level={3} style={{ marginBottom: 4, marginTop: 0 }}>
                  Chi tiết chủ đề flashcard
                </Title>
                <Text type="secondary" style={{ fontSize: 14 }}>ID: {detailTopic.id}</Text>
              </div>
              <Space size="small" wrap>
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

                <Divider orientation="vertical" style={{ height: 24, margin: '0 12px', borderLeft: '2px solid #e8e8e8ff' }} />

                {(() => {
                  const topicStatus = detailTopic?._raw?.status ?? detailTopic?.status
                  const isDraft = topicStatus === 0
                  const isActive = topicStatus === 1
                  const isDeleted = topicStatus === 2
                  const isRejected = topicStatus === 4
                  const userRole = getCurrentUserRole()
                  const isStaff = userRole === 'Staff'
                  const isModerator = userRole === 'Moderator'

                  const cannotEditForStaffModerator = (isStaff || isModerator) && (isActive || isDeleted)
                  const hasVocab =
                    (typeof detailTopic?.vocabularyCount === 'number'
                      ? detailTopic.vocabularyCount
                      : Array.isArray(topicVocabIds)
                        ? topicVocabIds.length
                        : Array.isArray(topicVocabData)
                          ? topicVocabData.length
                          : 0) > 0

                  const canSubmitForApproval = isStaff && (isDraft || isRejected) && hasVocab && !isDeleted

                  return (
                    <>
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => setEditOpen(true)}
                        disabled={isDeleted || editLoading || cannotEditForStaffModerator}
                        style={{
                          borderRadius: 20,
                          height: 40,
                          padding: '0 20px',
                          fontWeight: 600
                        }}
                      >
                        Chỉnh sửa
                      </Button>

                      {canSubmitForApproval && (
                        <Button
                          type="primary"
                          icon={<SendOutlined />}
                          onClick={handleSubmitForApproval}
                          disabled={submittingForApproval}
                          style={{
                            borderRadius: 20,
                            height: 40,
                            padding: '0 20px',
                            fontWeight: 600
                          }}
                        >
                          {submittingForApproval ? 'Đang gửi...' : 'Gửi chờ duyệt'}
                        </Button>
                      )}

                      {!isDeleted && !isModerator && (
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={handleDelete}
                          disabled={deleteLoading}
                          style={{
                            borderRadius: 20,
                            height: 40,
                            padding: '0 20px',
                            fontWeight: 600
                          }}
                        >
                          {deleteLoading ? 'Đang xóa...' : 'Xóa'}
                        </Button>
                      )}
                    </>
                  )
                })()}
              </Space>
            </div>



            <div style={{ backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
              <Tabs
                defaultActiveKey="vocabulary-list"
                tabBarStyle={{ padding: '4px 24px 0', borderBottom: '1px solid #f0f0f0', background: '#ffffff', margin: 0 }}
                items={[
                  {
                    key: 'basic-info',
                    label: (
                      <Space>
                        <InfoCircleOutlined />
                        <span style={{ fontWeight: 500 }}>Thông tin cơ bản</span>
                      </Space>
                    ),
                    children: (
                      <div style={{ padding: 24 }}>
                        <TopicInfoCard
                          topic={detailTopic}
                          isAdmin={(() => {
                            const userRole = getCurrentUserRole()
                            return userRole === 'Admin'
                          })()}
                          onApprove={() => handleOpenApprovalModal('approve')}
                          onReject={() => handleOpenApprovalModal('reject')}
                          approvalLoading={approvalLoading}
                        />
                      </div>
                    )
                  },
                  {
                    key: 'vocabulary-list',
                    label: (
                      <Space>
                        <UnorderedListOutlined />
                        <span style={{ fontWeight: 500 }}>Danh sách từ vựng</span>
                      </Space>
                    ),
                    children: (
                      <div style={{ padding: 24 }}>
                        <TopicVocabSection
                          selecting={selecting}
                          onSelectingChange={setSelecting}
                          removingKeys={removingKeys}
                          onRemovingKeysChange={setRemovingKeys}
                          availableOptions={availableOptions}
                          onSearch={handleSearchVocab}
                          onFocus={handleSelectFocus}
                          searching={searching}
                          onAdd={handleAddVocab}
                          adding={adding}
                          onRemove={handleRemoveVocab}
                          removing={removing}
                          dataSource={topicVocabData}
                          onQuickAdd={currentPortal !== 'moderator' ? () => setQuickAddModalOpen(true) : undefined}
                          onExcelUpload={currentPortal !== 'moderator' ? handleExcelFileSelect : undefined}
                          uploadingExcel={uploadingExcel}
                          fileInputRef={fileInputRef}
                          onExportExcel={currentPortal !== 'moderator' ? handleExportExcel : undefined}
                          exportingExcel={exportingExcel}
                          onOpenGuide={() => setGuideModalOpen(true)}
                          isModerator={currentPortal === 'moderator'}
                          excelImportResult={excelImportResult}
                        />
                      </div>
                    )
                  }
                ]}
              />
            </div>
            <FlashcardTopicEditModal
              open={editOpen}
              loading={editLoading}
              initialValues={{
                topicName: detailTopic?.title || detailTopic?._raw?.topicName || '',
                description: detailTopic?.subtitle || detailTopic?._raw?.description || '',
                level: detailTopic?.level ?? detailTopic?._raw?.level ?? 1,
                status: detailTopic?._raw?.status ?? detailTopic?.status ?? 1,
                imgUrl: detailTopic?.imgUrl || detailTopic?._raw?.imgUrl || '',
              }}
              onCancel={() => setEditOpen(false)}
              onSubmit={handleUpdate}
              isModerator={currentPortal === 'moderator'}
              isStaff={currentPortal === 'staff'}
            />
            <QuickAddVocabularyModal
              open={quickAddModalOpen}
              onCancel={() => setQuickAddModalOpen(false)}
              topicId={topicId}
              onAddToTopic={async (vocabIds) => {
                try {
                  // Gọi API thêm vào topic
                  const { response, topicDetail } = await addVocabulariesToTopicAndReload(topicId, vocabIds)

                  if (response?.isSuccess) {
                    if (topicDetail?.topic) {
                      setDetailTopic(topicDetail.topic)
                      setTopicVocabIds(topicDetail.topic.vocabIds || [])
                      setTopicVocabularies(topicDetail.vocabularies || [])
                      setSelecting([])
                    }
                    messageApi.success('Đã thêm từ vựng thành công')
                  } else {
                    messageApi.error(response?.message || 'Không thể thêm từ vựng vào chủ đề')
                  }
                  return { success: response?.isSuccess, response }
                } catch (err) {
                  console.error('Error adding vocab to topic:', err)
                  messageApi.error(err?.message || 'Không thể thêm từ vựng vào chủ đề')
                  return { success: false, error: err }
                }
              }}
              onSuccess={(createdVocab) => {
                // Reload lại danh sách từ vựng để hiển thị từ vựng mới
                if (createdVocab?.vocabularyId) {
                  // Từ vựng đã được thêm vào topic trong onAddToTopic
                  // Không cần làm gì thêm
                }
              }}
            />
            <VocabularyGuideModal open={guideModalOpen} onCancel={() => setGuideModalOpen(false)} />
            <TopicApprovalModal
              open={approvalModalOpen}
              loading={approvalLoading}
              initialApprovalType={approvalType}
              onCancel={() => {
                setApprovalModalOpen(false)
                setTopicIdForApproval(null)
                setApprovalType('approve')
              }}
              onSubmit={handleApproval}
            />
            <TopicStatusChangeModal
              open={statusChangeModalOpen}
              loading={statusChangeLoading}
              currentStatus={detailTopic?._raw?.status ?? detailTopic?.status}
              onCancel={() => setStatusChangeModalOpen(false)}
              onSubmit={handleStatusChange}
            />
          </div>
        </div>
      </div>
    )
  })()

  const screens = {
    'vocabulary-topics': detailContent,
  }

  return detailContent
}

export default FlashcardTopicDetailScreen




