import { useEffect, useRef } from 'react'
import { Animated, Image, StyleSheet, Text, View, Platform, TouchableOpacity } from 'react-native'
import { TrophyFilled } from '@ant-design/icons'

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
  description = '',
  onPress = null
}) {
  // Nếu title là null hoặc rỗng, hiển thị "Chưa có danh hiệu"
  const displayTitle = title || 'Chưa có danh hiệu'
  const iconAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Animation nhẹ nhàng cho icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(iconAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start()
  }, [iconAnim])

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.titleLabel}>Danh hiệu hiện tại</Text>
        {onPress && (
          <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.content}>
        <Animated.View style={[styles.badgeContainer, { 
          backgroundColor: colorHex ? `${colorHex}15` : '#FFF9F0', 
          borderColor: colorHex || '#F1BE4B',
          transform: [{ scale: iconAnim }]
        }]}>
          {typeof icon === 'string' && icon.startsWith('http') ? (
            <Image source={{ uri: icon }} style={styles.iconImage} resizeMode="contain" />
          ) : Platform.OS === 'web' && (icon === '🏆' || !icon) ? (
            <TrophyFilled style={{ fontSize: 24, color: colorHex || '#F1BE4B' }} />
          ) : (
            <Text style={styles.badgeIcon}>{icon}</Text>
          )}
          <Text style={[styles.badgeText, { color: colorHex || '#20130A' }]}>{title || 'Chưa có danh hiệu'}</Text>
        </Animated.View>
        
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>Lần cập nhật cuối:</Text>
          <Text style={styles.dateText}>Hôm nay</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#20130A',
    fontFamily: 'Epilogue, sans-serif',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F1BE4B',
    fontFamily: 'Epilogue, sans-serif',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 10,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
      },
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
      },
    }),
  },
  badgeIcon: {
    fontSize: 24,
  },
  iconImage: {
    width: 24,
    height: 24,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'Epilogue, sans-serif',
  },
  infoSection: {
    alignItems: 'flex-end',
    gap: 2,
  },
  infoText: {
    fontSize: 12,
    color: '#A0A0A0',
    fontWeight: '500',
    fontFamily: 'Epilogue, sans-serif',
  },
  dateText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '700',
    fontFamily: 'Epilogue, sans-serif',
  },
})

