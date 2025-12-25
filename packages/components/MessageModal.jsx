import React from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import SmallFoot from '../assets/smallfoot.png'
import Bunny9 from '../assets/bunny/9.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) {
    return { uri: src.src }
  }
  if (typeof src === 'string') {
    return { uri: src }
  }
  return src
}

/**
 * MessageModal: Component hiển thị thông báo với khả năng tùy chỉnh tin nhắn và hình ảnh
 * 
 * @param {Object} props
 * @param {string} props.title - Tiêu đề chính (bắt buộc)
 * @param {string} [props.message] - Nội dung thông báo (tùy chọn)
 * @param {any} [props.image] - Hình ảnh chính (tùy chọn, có thể là require(), uri string, hoặc object). Mặc định: bunny 9.
 * @param {any} [props.decorationImage] - Hình ảnh trang trí ở góc (tùy chọn, mặc định là SmallFoot)
 * @param {string} [props.buttonText] - Text của nút hành động (mặc định: "Xác nhận")
 * @param {Function} [props.onButtonPress] - Callback khi nhấn nút hành động
 * @param {Function} [props.onClose] - Callback khi nhấn nút đóng
 * @param {boolean} [props.showCloseButton] - Hiển thị nút đóng (mặc định: true)
 * @param {boolean} [props.showButton] - Hiển thị nút hành động (mặc định: true)
 * @param {string} [props.backgroundColor] - Màu nền (mặc định: '#F5F0DD')
 * @param {string} [props.buttonColor] - Màu nút hành động (mặc định: '#89A455')
 * @param {Object} [props.containerStyle] - Style tùy chỉnh cho container
 * @param {Object} [props.imageStyle] - Style tùy chỉnh cho hình ảnh chính
 * @param {React.ReactNode} [props.customButtons] - Custom buttons để render thay cho nút mặc định
 */
export const MessageModal = ({
  title,
  message,
  image = Bunny9,
  decorationImage = SmallFoot,
  buttonText = 'Xác nhận',
  onButtonPress,
  onClose,
  showCloseButton = true,
  showButton = true,
  backgroundColor = '#F5F0DD',
  buttonColor = '#89A455',
  containerStyle,
  imageStyle,
  customButtons,
}) => {
  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  const handleButtonPress = () => {
    if (onButtonPress) {
      onButtonPress()
    }
  }

  return (
    <View
      style={{
        backgroundColor,
        borderRadius: 30,
        paddingVertical: 32,
        paddingHorizontal: 28,
        width: '40%',
        height: '50%',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative',
        overflow: 'hidden',
        gap: 12,
        ...containerStyle,
      }}
    >
      {/* Close button */}
      {showCloseButton && (
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
      )}

      {/* Decoration image */}
      {decorationImage && (
        <Image
          source={normalizeImageSource(decorationImage)}
          style={{
            position: 'absolute',
            bottom: -30,
            right: -60,
            width: 300,
            height: 250,
            resizeMode: 'contain',
            opacity: 0.1,
            transform: [{ rotate: '-60deg' }],
          }}
        />
      )}

      <View
        style={{
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          flexGrow: 1,
          gap: 12,
        }}
      >
        {/* Main image */}
        {image && (
          <Image
            source={normalizeImageSource(image)}
            style={{
              width: '60%',
              height: '60%',
              resizeMode: 'contain',
              ...imageStyle,
            }}
          />
        )}

        {/* Title */}
        {title && (
          <Text
            style={{
              fontSize: '2vw',
              fontWeight: '800',
              color: '#222',
              fontFamily: 'Epilogue, sans-serif',
              textAlign: 'center',
            }}
          >
            {title}
          </Text>
        )}

        {/* Message */}
        {message && (
          <Text
          style={{
            fontSize: '1vw',
            color: '#555',
            fontFamily: 'Epilogue, sans-serif',
            textAlign: 'center',
            lineHeight: '1.6', // Thêm dòng này
          }}
          >
            {message}
          </Text>
        )}
      </View>

      {/* Action button pinned to bottom */}
      {customButtons ? (
        <View
          style={{
            alignSelf: 'stretch',
            marginTop: 'auto',
            alignItems: 'center',
          }}
        >
          {customButtons}
        </View>
      ) : (
        showButton && onButtonPress && (
          <View
            style={{
              alignSelf: 'stretch',
              marginTop: 'auto',
              alignItems: 'center',
            }}
          >
            <TouchableOpacity
              onPress={handleButtonPress}
              style={{
                backgroundColor: buttonColor,
                paddingVertical: 14,
                paddingHorizontal: 32,
                borderRadius: 22,
                minWidth: 180,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.85}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#FFFFFF',
                  fontFamily: 'Epilogue, sans-serif',
                }}
              >
                {buttonText}
              </Text>
            </TouchableOpacity>
          </View>
        )
      )}
    </View>
  )
}

