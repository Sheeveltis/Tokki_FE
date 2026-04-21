import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native'
import { NavigationPill } from '../../../../../components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { normalizeImageSource } from '../../../study/api'
import BunnyStudy from '../../../../../assets/bunny/14.png'
import BunnySyllable from '../../../../../assets/bunny/13.png'
import LightbulbIcon from '../../../../../assets/icon/icon-roadmap/lightbulb-minimalistic-svgrepo-com.svg'
import FolderIcon from '../../../../../assets/icon/icon-mainflow/folder.svg'
import LockIcon from '../../../../../assets/icon/icon-mainflow/lock.svg'


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
      primaryColor: '#79964E', // Moss Green
      secondaryColor: '#E8F5E9',
      icon: LightbulbIcon,
      image: BunnyStudy,
      badge: 'Cơ bản',
      onPress: onLettersPress
    },
    {
      id: 'syllables',
      title: 'Học Ghép Âm',
      description: 'Học cách kết hợp phụ âm và nguyên âm để tạo thành các âm tiết và từ hoàn chỉnh.',
      primaryColor: '#F1BE4B', // Marigold
      secondaryColor: '#FFF8E1',
      icon: FolderIcon,
      image: BunnySyllable,
      badge: 'Đang phát triển',
      onPress: onSyllablesPress,
      isComingSoon: true
    }
  ]

  return (
    <View style={styles.container}>
      {/* Background Decorations */}
      <View style={styles.bgDecoration1} />
      <View style={styles.bgDecoration2} />

      {/* Header */}
      <View style={styles.header}>
        <NavigationPill
          label="Quay lại"
          to={undefined}
          icon={ArrowIcon}
          iconStyle={{ transform: [{ scaleX: -1 }], tintColor: '#1A1A1A' }}
          onPress={onBackPress}
          textStyle={{ fontWeight: '700' }}
        />
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>
          Bảng Chữ Cái <Text style={{ color: '#D32F2F' }}>Hàn Quốc</Text>
        </Text>
      </View>

      {/* Mode Selection Cards */}
      <View style={styles.grid}>
        {modes.map((mode) => (
          <Pressable
            key={mode.id}
            onPress={mode.isComingSoon ? undefined : mode.onPress}
            onPointerEnter={() => setHoveredCard(mode.id)}
            onPointerLeave={() => setHoveredCard(null)}
            style={[
              styles.moduleCard,
              hoveredCard === mode.id && styles.moduleCardHovered
            ]}
          >
            {/* Top accent gradient bar */}
            <View style={[styles.topAccentBar, { backgroundColor: mode.primaryColor }]} />

            {/* Header */}
            <View style={styles.moduleHeader}>
              <View style={[styles.iconContainer, { backgroundColor: mode.secondaryColor }]}>
                {renderIcon(mode.icon, [styles.moduleIcon, { tintColor: mode.primaryColor }])}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.moduleTitle, { color: '#1A1A1A' }]}>{mode.title}</Text>
                <View style={[styles.badgeInline, { backgroundColor: mode.primaryColor + '15' }]}>
                  <Text style={[styles.badgeText, { color: mode.primaryColor }]}>{mode.badge}</Text>
                </View>
              </View>
            </View>

            {/* Image Content Container */}
            <View style={styles.imageContentContainer}>
              <View style={styles.imageWrapper}>
                <Image
                  source={normalizeImageSource(mode.image)}
                  style={[
                    styles.moduleImage,
                    hoveredCard === mode.id && { transform: [{ scale: 1.05 }] }
                  ]}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.descriptionContainer}>
                <Text style={styles.modeDescription}>{mode.description}</Text>
              </View>
            </View>

            {/* Action Footer */}
            <View style={styles.footer}>
              <View
                style={[
                  styles.itemButton,
                  { backgroundColor: mode.isComingSoon ? '#E0E0E0' : mode.primaryColor },
                  !mode.isComingSoon && hoveredCard === mode.id && {
                    boxShadow: `0 8px 24px ${mode.primaryColor}50`,
                  }
                ]}
              >
                <Text style={[styles.itemLabel, mode.isComingSoon && { color: '#999' }]}>
                  {mode.isComingSoon ? 'Sắp ra mắt' : 'Học ngay'}
                </Text>
                <View style={[styles.arrowIconBg, mode.isComingSoon && { backgroundColor: '#F0F0F0' }]}>
                  {renderIcon(
                    mode.isComingSoon ? LockIcon : ArrowIcon,
                    { width: 12, height: 12, tintColor: mode.isComingSoon ? '#999' : mode.primaryColor }
                  )}
                </View>
              </View>
            </View>

            {/* Shine effect on hover */}
            {hoveredCard === mode.id && <View style={styles.shineEffect} />}
          </Pressable>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 32,
    position: 'relative',
  },
  bgDecoration1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(211, 47, 47, 0.03)',
    zIndex: -1,
  },
  bgDecoration2: {
    position: 'absolute',
    bottom: 50,
    left: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(121, 150, 78, 0.03)',
    zIndex: -1,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  titleSection: {
    alignItems: 'flex-start',
  },
  titleTag: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  titleTagText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 42,
    fontWeight: '950',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: -1.5,
    lineHeight: 48,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    maxWidth: 550,
    lineHeight: 28,
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 40,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  moduleCard: {
    flex: 1,
    minWidth: 380,
    maxWidth: 520,
    borderRadius: 32,
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    position: 'relative',
    overflow: 'hidden',
    gap: 32,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
      transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
      cursor: 'pointer',
    }),
  },
  moduleCardHovered: {
    transform: [{ translateY: -16 }, { scale: 1.02 }],
    borderColor: 'rgba(0,0,0,0.08)',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 40px 80px -15px rgba(0, 0, 0, 0.1), 0 20px 40px -20px rgba(0, 0, 0, 0.1)',
    }),
  },
  topAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleIcon: {
    width: 28,
    height: 28,
  },
  moduleTitle: {
    fontSize: 24,
    fontWeight: '900',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  badgeInline: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  imageContentContainer: {
    width: '100%',
    height: 240,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  moduleImage: {
    width: '80%',
    height: '80%',
    ...(Platform.OS === 'web' && {
      transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
    }),
  },
  descriptionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(10px)',
    }),
  },
  modeDescription: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 20,
    textAlign: 'center',
  },
  footer: {
    width: '100%',
  },
  itemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 14,
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
  arrowIconBg: {
    width: 24,
    height: 24,
    backgroundColor: '#FFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shineEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...(Platform.OS === 'web' && {
      background: 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%)',
    }),
    pointerEvents: 'none',
  },
})


