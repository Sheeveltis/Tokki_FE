import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native'
import { NavigationPill } from '../../../../../components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { normalizeImageSource } from '../../../study/api'
import BunnyStudy from '../../../../../assets/bunny/14.png'
import LightbulbIcon from '../../../../../assets/icon/icon-roadmap/lightbulb-minimalistic-svgrepo-com.svg'
import FolderIcon from '../../../../../assets/icon/icon-mainflow/folder.svg'

// Helper function để render icon - hỗ trợ cả SVG component và Image source
const renderIcon = (icon, style, resizeMode = 'contain') => {
  if (!icon) return null

  // Kiểm tra xem có phải là React component không (SVG component)
  const isReactComponent = icon && (
    (typeof icon === 'function') ||
    (typeof icon === 'object' && icon.$$typeof) ||
    (typeof icon === 'object' && icon.default && (typeof icon.default === 'function' || icon.default.$$typeof))
  )

  if (isReactComponent) {
    // Render SVG component
    const IconComponent = typeof icon === 'function' ? icon : (icon.default || icon)
    const flattenedStyle = StyleSheet.flatten(style)
    return (
      <View style={[style, { alignItems: 'center', justifyContent: 'center' }]}>
        <IconComponent
          width={flattenedStyle?.width || 28}
          height={flattenedStyle?.height || 28}
          fill={flattenedStyle?.tintColor || flattenedStyle?.color || '#111'}
        />
      </View>
    )
  }

  // Render Image với normalizeImageSource
  const iconSource = normalizeImageSource(icon)
  if (iconSource) {
    return (
      <Image
        source={iconSource}
        style={style}
        resizeMode={resizeMode}
      />
    )
  }

  return null
}

/**
 * AlphabetSelectModeMain (Web): Nội dung chính của trang chọn học phần chữ cái Hàn Quốc trên web
 */
export function AlphabetSelectModeMain({
  onBackPress,
  onLettersPress,
  onSyllablesPress,
}) {
  const [hoveredCard, setHoveredCard] = useState(null)

  const modes = [
    {
      id: 'letters',
      title: 'Học Chữ Cái',
      description: 'Khám phá bảng chữ cái Hangul cơ bản, cách viết và phát âm từng ký tự đơn lẻ.',
      primaryColor: '#79964E',
      icon: LightbulbIcon,
      badge: 'Cơ bản',
      onPress: onLettersPress
    },
    {
      id: 'syllables',
      title: 'Học Ghép Âm',
      description: 'Học cách kết hợp phụ âm và nguyên âm để tạo thành các âm tiết và từ hoàn chỉnh.',
      primaryColor: '#F1BE4B',
      icon: FolderIcon,
      badge: 'Nâng cao',
      onPress: onSyllablesPress
    }
  ]

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <NavigationPill
          label="Trở lại"
          to={undefined}
          icon={ArrowIcon}
          iconStyle={{ transform: [{ scaleX: -1 }], tintColor: '#1A1A1A' }}
          onPress={onBackPress}
          textStyle={{ fontWeight: '700' }}
        />
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>Bảng Chữ Cái Hàn Quốc</Text>
        <Text style={styles.subtitle}>Bắt đầu hành trình chinh phục tiếng Hàn từ những bước căn bản nhất</Text>
      </View>

      {/* Mode Selection Cards */}
      <View style={styles.grid}>
        {modes.map((mode) => (
          <View
            key={mode.id}
            onPointerEnter={() => setHoveredCard(mode.id)}
            onPointerLeave={() => setHoveredCard(null)}
            style={[
              styles.moduleCard,
              hoveredCard === mode.id && styles.moduleCardHovered
            ]}
          >
            {/* Top accent bar */}
            <View style={[styles.topAccentBar, { backgroundColor: mode.primaryColor }]} />
            
            {/* Header */}
            <View style={styles.moduleHeader}>
              <View style={styles.iconContainer}>
                {renderIcon(mode.icon, [styles.moduleIcon, { tintColor: mode.primaryColor }])}
              </View>
              <View>
                <Text style={[styles.moduleTitle, { color: mode.primaryColor }]}>{mode.title}</Text>
              </View>
            </View>

            {/* Image Content Container */}
            <View style={styles.imageContentContainer}>
              <Image
                source={normalizeImageSource(BunnyStudy)}
                style={styles.moduleImage}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay}>
                <Text style={styles.modeDescription}>{mode.description}</Text>
              </View>
            </View>

            {/* Action Button */}
            <Pressable
              onPress={mode.onPress}
              style={({ pressed }) => [
                styles.itemButton,
                { backgroundColor: mode.primaryColor },
                pressed && { transform: [{ scale: 0.98 }] },
                hoveredCard === mode.id && {
                  boxShadow: `0 8px 16px ${mode.primaryColor}40`,
                }
              ]}
            >
              <Text style={styles.itemLabel}>Bắt đầu học ngay</Text>
              {renderIcon(ArrowIcon, { width: 16, height: 16, tintColor: '#FFFFFF' })}
            </Pressable>

            {/* Badge */}
            <View style={[styles.badge, { backgroundColor: mode.primaryColor + '15' }]}>
              <Text style={[styles.badgeText, { color: mode.primaryColor }]}>{mode.badge}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 40,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  titleSection: {
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    maxWidth: 600,
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 32,
    justifyContent: 'flex-start',
  },
  moduleCard: {
    flex: 1,
    minWidth: 380,
    borderRadius: 24,
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(230, 230, 230, 0.5)',
    position: 'relative',
    overflow: 'hidden',
    gap: 32,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    }),
  },
  moduleCardHovered: {
    transform: [{ translateY: -12 }],
    borderColor: 'rgba(0,0,0,0.02)',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.12), 0 18px 36px -18px rgba(0, 0, 0, 0.15)',
    }),
  },
  topAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    opacity: 0.9,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleIcon: {
    width: 32,
    height: 32,
  },
  moduleTitle: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: -0.5,
  },
  imageContentContainer: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F7F7F9',
  },
  moduleImage: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 20,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(8px)',
    }),
  },
  modeDescription: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 20,
  },
  itemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 20,
    ...(Platform.OS === 'web' && {
      transition: 'all 0.3s ease',
    }),
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
  badge: {
    position: 'absolute',
    top: 28,
    right: 28,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})

