import React, { useRef } from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

export const AddImage = ({
  onFiles,
  onPreview,
  onRemove,
  images = [],
  hoverIndex,
  setHoverIndex,
}) => {
  const fileInputRef = useRef(null)

  const handleAdd = () => {
    if (typeof document !== 'undefined' && fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
  }

  const handleChange = (e) => {
    if (onFiles) {
      onFiles(e.target.files)
    }
  }

  return (
    <View style={{ width: '100%' }}>
      <TouchableOpacity
        onPress={handleAdd}
        style={{
          backgroundColor: '#006EFF',
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 10,
          alignSelf: 'flex-start',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.2,
          shadowRadius: 5,
          elevation: 3,
        }}
        activeOpacity={0.85}
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: '700',
            color: '#FFFFFF',
            fontFamily: 'Epilogue, sans-serif',
          }}
        >
          Thêm ảnh
        </Text>
      </TouchableOpacity>

      {images.length > 0 && (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
            marginTop: 4,
          }}
        >
          {images.map((img, idx) => (
            <View
              key={`${img}-${idx}`}
              onMouseEnter={() => setHoverIndex && setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex && setHoverIndex(null)}
              style={{ position: 'relative' }}
            >
              <TouchableOpacity onPress={() => onPreview && onPreview(img)} activeOpacity={0.8}>
                <Image
                  source={normalizeImageSource(img)}
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#DDD',
                    backgroundColor: '#FFF',
                    left: 10,
                  }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              {hoverIndex === idx && (
                <TouchableOpacity
                  onPress={() => onRemove && onRemove(idx)}
                  style={{
                    position: 'absolute',
                    top: -8,
                    left: -8,
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    left: 5,
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={{
                      color: '#FFF',
                      fontSize: 16,
                      fontWeight: '700',
                      fontFamily: 'Epilogue, sans-serif',
                    }}
                  >
                    ×
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}

      {typeof document !== 'undefined' && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleChange}
        />
      )}
    </View>
  )
}

