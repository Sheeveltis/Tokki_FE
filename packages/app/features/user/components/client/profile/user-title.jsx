import { useEffect, useRef } from 'react'
import { Animated, Image, StyleSheet, Text, View } from 'react-native'

/**
 * Component hiển thị danh hiệu (Title/Badge) của người dùng
 * @param {Object} props
 * @param {string} props.title - Tên danh hiệu hiện tại
 * @param {string} props.icon - Icon/Emoji cho danh hiệu (mặc định "🏆")
 * @param {string} props.label - Label hiển thị (mặc định "Danh hiệu")
 * @param {string} props.description - Mô tả về danh hiệu
 */
export function UserTitle({ 
  title = null, 
  icon = '🏆', 
  colorHex = '',
  label = 'Danh hiệu',
  description = ''
}) {
  // Nếu title là null hoặc rỗng, hiển thị "Chưa có danh hiệu"
  const displayTitle = title || 'Chưa có danh hiệu'
  const displayIcon = title ? icon : '📭'
  const isIconUrl = typeof displayIcon === 'string' && displayIcon.startsWith('http')
  const iconAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Animation nhẹ nhàng cho icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(iconAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [iconAnim])

  // Danh sách danh hiệu mẫu với màu sắc tương ứng
  const getTitleStyle = (titleName) => {
    const titleLower = titleName?.toLowerCase() || ''
    if (titleLower.includes('kim cương') || titleLower.includes('diamond')) {
      return { backgroundColor: '#E8F4F8', borderColor: '#4A90E2', iconColor: '#4A90E2' }
    }
    if (titleLower.includes('vàng') || titleLower.includes('gold')) {
      return { backgroundColor: '#FFF9E6', borderColor: '#FFD700', iconColor: '#FFA500' }
    }
    if (titleLower.includes('bạc') || titleLower.includes('silver')) {
      return { backgroundColor: '#F5F5F5', borderColor: '#C0C0C0', iconColor: '#808080' }
    }
    if (titleLower.includes('đồng') || titleLower.includes('bronze')) {
      return { backgroundColor: '#FFF4E6', borderColor: '#CD7F32', iconColor: '#CD7F32' }
    }
    // Mặc định
    return { backgroundColor: '#F0F0F0', borderColor: '#D9D9D9', iconColor: '#666666' }
  }

  const titleStyle = getTitleStyle(displayTitle)
  const effectiveTitleColor = colorHex || titleStyle.iconColor

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
      </View>

      <View style={[styles.titleContainer, { backgroundColor: titleStyle.backgroundColor, borderColor: titleStyle.borderColor }]}>
        <Animated.View
          style={{
            transform: [{ scale: iconAnim }],
          }}
        >
          {isIconUrl ? (
            <Image source={{ uri: displayIcon }} style={styles.titleIconImage} resizeMode="contain" />
          ) : (
            <Text style={styles.titleIcon}>{displayIcon}</Text>
          )}
        </Animated.View>
        <View style={styles.titleContent}>
          <Text style={[styles.titleText, { color: effectiveTitleColor }]}>{displayTitle}</Text>
          {description && (
            <Text style={styles.titleDescription}>{description}</Text>
          )}
        </View>
      </View>

      {!title && (
        <View style={styles.footer}>
          <Text style={styles.hintText}>
            💡 Tìm thêm kinh nghiệm để có được danh hiệu mới!
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 16,
    gap: 5,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E3DC',
    width: '100%',
    minWidth: '100%', // Ensure full width on native
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: '#F0F0F0',
  },
  titleIcon: {
    fontSize: 40,
    textAlign: 'center',
  },
  titleIconImage: {
    width: 60,
    height: 60,
    borderRadius: 22,
  },
  titleContent: {
    flex: 1,
    gap: 4,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#666666',
    fontFamily: 'Epilogue, sans-serif',
  },
  titleDescription: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8F8F8F',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 18,
  },
  footer: {
    paddingTop: 4,
  },
  hintText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8F8F8F',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    fontStyle: 'italic',
  },
})

