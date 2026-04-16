import React from 'react'
import { View, Text, StyleSheet, Pressable, Image } from 'react-native'
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
          width={flattenedStyle?.width || 24}
          height={flattenedStyle?.height || 24}
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
 * AlphabetSelectModeMain (Mobile): Nội dung chính của trang chọn học phần chữ cái Hàn Quốc trên mobile
 */
export function AlphabetSelectModeMain({
  onBackPress,
  onLettersPress,
  onSyllablesPress,
}) {
  const modes = [
    {
      id: 'letters',
      title: 'Học Chữ Cái',
      description: 'Học các chữ cái Hangul đơn lẻ, cách viết và phát âm chuẩn.',
      primaryColor: '#79964E',
      icon: LightbulbIcon,
      badge: 'Cơ bản',
      onPress: onLettersPress
    },
    {
      id: 'syllables',
      title: 'Học Ghép Âm',
      description: 'Học cách ghép phụ âm và nguyên âm thành âm tiết hoàn chỉnh.',
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
          icon={ArrowIcon}
          iconStyle={{ transform: [{ scaleX: -1 }], tintColor: '#1A1A1A' }}
          onPress={onBackPress}
          textStyle={{ fontWeight: '700' }}
        />
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>Bảng Chữ Cái</Text>
        <Text style={styles.subtitle}>Bắt đầu hành trình chinh phục tiếng Hàn</Text>
      </View>

      {/* Mode Selection Cards */}
      <View style={styles.modesContainer}>
        {modes.map((mode) => (
          <Pressable
            key={mode.id}
            onPress={mode.onPress}
            style={({ pressed }) => [
              styles.moduleCard,
              pressed && { transform: [{ scale: 0.98 }] }
            ]}
          >
            {/* Top accent bar */}
            <View style={[styles.topAccentBar, { backgroundColor: mode.primaryColor }]} />
            
            <View style={styles.cardContent}>
              <View style={styles.moduleHeader}>
                <View style={[styles.iconWrapper, { backgroundColor: mode.primaryColor + '15' }]}>
                  {renderIcon(mode.icon, [styles.moduleIcon, { tintColor: mode.primaryColor }])}
                </View>
                <View style={styles.textColumn}>
                  <Text style={[styles.moduleTitle, { color: mode.primaryColor }]}>{mode.title}</Text>
                  <Text style={styles.modeDescription}>{mode.description}</Text>
                </View>
                {renderIcon(ArrowIcon, { width: 16, height: 16, tintColor: mode.primaryColor, opacity: 0.4 })}
              </View>

              <View style={styles.cardFooter}>
                <View style={[styles.badge, { backgroundColor: mode.primaryColor + '10' }]}>
                  <Text style={[styles.badgeText, { color: mode.primaryColor }]}>{mode.badge}</Text>
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 24,
  },
  header: {
    alignSelf: 'flex-start',
  },
  titleSection: {
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
    fontFamily: 'Epilogue, sans-serif',
  },
  modesContainer: {
    width: '100%',
    gap: 16,
  },
  moduleCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  topAccentBar: {
    height: 4,
  },
  cardContent: {
    padding: 20,
    gap: 12,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleIcon: {
    width: 24,
    height: 24,
  },
  textColumn: {
    flex: 1,
    gap: 4,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: -0.3,
  },
  modeDescription: {
    fontSize: 13,
    color: '#777',
    fontWeight: '500',
    lineHeight: 18,
    fontFamily: 'Epilogue, sans-serif',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})

