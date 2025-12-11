import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, Image, Modal, ScrollView } from 'react-native'
import { useRouter } from 'solito/navigation'
import BigFoot from '../assets/bigfoot.png'
import SmallFoot from '../assets/smallfoot.png'
import { ErrorType } from './errorType'
import { ContentError } from './contentError'
import { AddImage } from './addImage'
import { ErrorBtn } from './Errorbtn'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

export const Report = ({ onClose, onSubmit }) => {
  const router = useRouter()
  const [type, setType] = useState('')
  const [isDropdownOpen, setDropdownOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [images, setImages] = useState([])
  const [previewImage, setPreviewImage] = useState(null)
  const [hoverIndex, setHoverIndex] = useState(null)

  const handleClose = () => {
    if (onClose) onClose()
  }

  const handleToggleDropdown = () => {
    setDropdownOpen((prev) => !prev)
  }

  const handleSelectType = (value) => {
    setType(value)
    setDropdownOpen(false)
  }

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit({ type, description, images })
    } else {
      // placeholder action
      router.back()
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
          type={type}
          isOpen={isDropdownOpen}
          onToggle={handleToggleDropdown}
          onSelect={handleSelectType}
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

      <ErrorBtn onPress={handleSubmit} />

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

