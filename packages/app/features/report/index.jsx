import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, Image, Modal, ScrollView } from 'react-native'
import { useRouter } from 'solito/navigation'
import BigFoot from '../../../assets/bigfoot.png'
import SmallFoot from '../../../assets/smallfoot.png'
import { ErrorType } from './components/errorType'
import { ContentError } from './components/contentError'
import { AddImage } from './components/addImage'
import { ErrorBtn } from './components/Errorbtn'
import { createReport } from './api/api'
import { showAdminSuccess, showAdminError } from 'components/HelperAdmin'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

const REPORT_TYPES = ['Lỗi từ vựng', 'Lỗi câu hỏi - đáp án']

export const Report = ({ onClose, onSubmit, vocabularyId, questionBankId, targetUrl }) => {
  const router = useRouter()
  const [errorType, setErrorType] = useState('')
  const [isErrorTypeOpen, setIsErrorTypeOpen] = useState(false)
  // Tự động set reportType dựa trên vocabularyId hoặc questionBankId
  const [reportType, setReportType] = useState(
    vocabularyId ? 'Lỗi từ vựng' : questionBankId ? 'Lỗi câu hỏi - đáp án' : ''
  )
  const [isReportTypeOpen, setIsReportTypeOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [images, setImages] = useState([])
  const [previewImage, setPreviewImage] = useState(null)
  const [hoverIndex, setHoverIndex] = useState(null)
  const [loading, setLoading] = useState(false)

  // Auto-set reportType khi vocabularyId hoặc questionBankId thay đổi
  useEffect(() => {
    if (vocabularyId) {
      setReportType('Lỗi từ vựng')
    } else if (questionBankId) {
      setReportType('Lỗi câu hỏi - đáp án')
    }
  }, [vocabularyId, questionBankId])

  const handleClose = () => {
    if (onClose) onClose()
  }

  const handleToggleErrorType = () => {
    setIsErrorTypeOpen((prev) => !prev)
  }

  const handleSelectErrorType = (value) => {
    setErrorType(value)
    setIsErrorTypeOpen(false)
  }

  const handleToggleReportType = () => {
    setIsReportTypeOpen((prev) => !prev)
  }

  const handleSelectReportType = (value) => {
    setReportType(value)
    setIsReportTypeOpen(false)
  }

  /**
   * Lấy userId từ localStorage
   */
  const getUserId = () => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('userId') || localStorage.getItem('user_id') || ''
    }
    return ''
  }

  /**
   * Convert image file to base64 hoặc lấy URL
   * Nếu images là blob URLs, có thể cần convert sang base64 hoặc upload lên server
   * Tạm thời lấy URL đầu tiên (có thể là blob URL hoặc đã được upload)
   */
  const getImageUrl = async () => {
    if (images.length === 0) return ''
    
    // Lấy URL đầu tiên từ images array
    // Nếu là blob URL từ URL.createObjectURL, có thể cần convert sang base64
    // Hoặc upload lên server trước để lấy URL thực
    const firstImage = images[0]
    
    // Nếu là blob URL, có thể cần convert sang base64
    if (typeof firstImage === 'string' && firstImage.startsWith('blob:')) {
      // Tạm thời trả về blob URL, backend có thể xử lý
      // Hoặc có thể convert sang base64 nếu backend yêu cầu
      return firstImage
    }
    
    return firstImage || ''
  }

  const handleSubmit = async () => {
    // Validation
    if (!errorType) {
      showAdminError('Vui lòng chọn loại lỗi')
      return
    }

    if (!reportType) {
      showAdminError('Vui lòng chọn loại báo cáo')
      return
    }

    if (!description || description.trim() === '') {
      showAdminError('Vui lòng nhập mô tả lỗi')
      return
    }

    // Validate reportType với vocabularyId/questionBankId
    if (reportType === 'Lỗi từ vựng') {
      if (!vocabularyId) {
        showAdminError('Không tìm thấy từ vựng để báo cáo')
        return
      }
    } else if (reportType === 'Lỗi câu hỏi - đáp án') {
      if (!questionBankId) {
        showAdminError('Không tìm thấy câu hỏi để báo cáo')
        return
      }
    }

    setLoading(true)
    try {
      const userId = getUserId()
      if (!userId) {
        showAdminError('Không tìm thấy thông tin người dùng')
        setLoading(false)
        return
      }

      const imageUrl = await getImageUrl()

      const payload = {
        userId,
        description: description.trim(),
        reportType,
        ...(imageUrl && { imageUrl }),
        ...(targetUrl && { targetUrl }),
        ...(vocabularyId && reportType === 'Lỗi từ vựng' && { vocabularyId }),
        ...(questionBankId && reportType === 'Lỗi câu hỏi - đáp án' && { questionBankId }),
      }

      await createReport(payload)
      
      showAdminSuccess('Báo cáo lỗi đã được gửi thành công!')
      
      if (onSubmit) {
        onSubmit({ errorType, reportType, description, images })
      }
      
      // Reset form
      setErrorType('')
      setReportType('')
      setDescription('')
      setImages([])
      
      if (onClose) {
        onClose()
      } else {
        router.back()
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      showAdminError(error?.response?.data?.message || error?.message || 'Không thể gửi báo cáo lỗi')
    } finally {
      setLoading(false)
    }
  }

  const handleFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return
    const newImages = []
    Array.from(fileList).forEach((file) => {
      const url = URL.createObjectURL(file)
      newImages.push(url)
    })
    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages])
    }
  }

  const handleRemoveImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

  // paste handler for web
  useEffect(() => {
    if (typeof document === 'undefined') return
    const onPaste = (event) => {
      const { clipboardData } = event
      if (!clipboardData) return
      const items = clipboardData.items
      if (!items) return
      const files = []
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.kind === 'file') {
          const file = item.getAsFile()
          if (file) files.push(file)
        }
      }
      if (files.length > 0) {
        event.preventDefault()
        handleFiles(files)
      }
    }
    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
  }, [])

  return (
    <View
      style={{
        backgroundColor: '#F5F0DD',
        borderRadius: 30,
        paddingVertical: 32,
        paddingHorizontal: 28,
        minWidth: 520,
        minHeight: 360,
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* Close button */}
      <TouchableOpacity
        onPress={handleClose}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 40,
          height: 40,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        activeOpacity={0.7}
      >
        <Text
          style={{
            fontSize: 30,
            fontWeight: '700',
            color: '#333',
            fontFamily: 'Epilogue, sans-serif',
          }}
        >
          ×
        </Text>
      </TouchableOpacity>

      {/* Footprint decorations */}
      <Image
        source={normalizeImageSource(SmallFoot)}
        style={{
          position: 'absolute',
          bottom: -30,
          right: -60,
          width: 300,
          height: 250,
          resizeMode: 'contain',
          opacity: 0.08,
          transform: [{ rotate: '-60deg' }],
        }}
      />
      <Image
        source={normalizeImageSource(BigFoot)}
        style={{
          position: 'absolute',
          top: 12,
          right: 64,
          width: 40,
          height: 40,
          resizeMode: 'contain',
          opacity: 0.7,
        }}
      />

      <View style={{ alignItems: 'center', marginBottom: 18 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: '800',
            color: '#3A342E',
            fontFamily: 'Epilogue, sans-serif',
            textAlign: 'center',
          }}
        >
          BÁO CÁO LỖI
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ rowGap: 14, paddingBottom: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <ErrorType
          type={errorType}
          isOpen={isErrorTypeOpen}
          onToggle={handleToggleErrorType}
          onSelect={handleSelectErrorType}
        />

        <ErrorType
          type={reportType}
          isOpen={isReportTypeOpen}
          onToggle={handleToggleReportType}
          onSelect={handleSelectReportType}
          options={REPORT_TYPES}
          placeholder="Loại báo cáo"
        />

        <ContentError value={description} onChangeText={setDescription} />

        <AddImage
          images={images}
          onFiles={handleFiles}
          onPreview={setPreviewImage}
          onRemove={handleRemoveImage}
          hoverIndex={hoverIndex}
          setHoverIndex={setHoverIndex}
        />

        {/* Info text */}
        <Text
          style={{
            fontSize: 14,
            color: '#353535',
            fontFamily: 'Epilogue, sans-serif',
            marginTop: 6,
          }}
        >
          Nếu bạn có ý tưởng để cải thiện sản phẩm hoặc nếu cần trợ giúp để khắc phục vấn đề cụ
          thể thì hãy cho chúng tôi biết nhé.
        </Text>
      </ScrollView>

      <ErrorBtn onPress={handleSubmit} disabled={loading} />

      {/* Preview modal */}
      <Modal visible={!!previewImage} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <TouchableOpacity
            onPress={() => setPreviewImage(null)}
            style={{ position: 'absolute', top: 40, right: 24, padding: 8 }}
          >
            <Text style={{ color: '#FFF', fontSize: 28, fontWeight: '700' }}>×</Text>
          </TouchableOpacity>
          {previewImage && (
            <Image
              source={normalizeImageSource(previewImage)}
              style={{
                width: '90%',
                height: '70%',
                borderRadius: 12,
                backgroundColor: '#000',
              }}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  )
}

