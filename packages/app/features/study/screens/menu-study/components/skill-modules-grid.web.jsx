import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native'
import { SKILL_MODULES } from '@tokki/app/features/study/mockData'
import { normalizeImageSource } from '@tokki/app/features/study/api'
import ArrowIcon from 'assets/icon/icon-mainflow/arrow.svg'

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
          fill={flattenedStyle?.tintColor}
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

export function SkillModulesGrid({ levelId, onModulePress }) {
  const [hoveredCard, setHoveredCard] = useState(null)
  const [hoveredItem, setHoveredItem] = useState(null)

  return (
    <View style={styles.grid}>
      {SKILL_MODULES.map((module) => (
        <View
          key={module.id}
          onPointerEnter={() => setHoveredCard(module.id)}
          onPointerLeave={() => setHoveredCard(null)}
          style={[
            styles.moduleCard,
            hoveredCard === module.id && styles.moduleCardHovered
          ]}
        >
          {/* Top accent bar */}
          <View style={[styles.topAccentBar, { backgroundColor: module.primaryColor }]} />

          {/* Header */}
          <View style={styles.moduleHeader}>
            <View style={styles.iconContainer}>
              {renderIcon(module.icon, [styles.moduleIcon, { tintColor: module.primaryColor }], module.isImageModule ? 'cover' : 'contain')}
            </View>
            <View>
              <Text style={[styles.moduleTitle, { color: module.primaryColor }]}>{module.title}</Text>
            </View>
          </View>

          {/* Content */}
          {module.isImageModule ? (
            <Pressable
              onPress={() => onModulePress?.(module.id, 'Main')}
              style={({ pressed }) => [
                styles.imageContentContainer,
                pressed && { transform: [{ scale: 0.98 }] }
              ]}
            >
              {renderIcon(module.icon, styles.moduleImage, 'cover')}
              <View style={styles.imageOverlay}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.exploreText}>Khám phá ngay</Text>
                  {renderIcon(ArrowIcon, { width: 12, height: 12, tintColor: '#FFFFFF' })}
                </View>
              </View>
            </Pressable>
          ) : (
            <View style={styles.itemsContainer}>
              {module.items.length > 0 ? (
                module.items.map((item, index) => {
                  const isItemHovered = hoveredItem === `${module.id}-${index}`
                  return (
                    <Pressable
                      key={index}
                      onPress={() => onModulePress?.(module.id, item.label)}
                      onHoverIn={() => Platform.OS === 'web' && setHoveredItem(`${module.id}-${index}`)}
                      onHoverOut={() => Platform.OS === 'web' && setHoveredItem(null)}
                      style={({ pressed }) => [
                        styles.itemButton,
                        (pressed || isItemHovered) && {
                          backgroundColor: module.primaryColor,
                          boxShadow: `0 8px 16px ${module.primaryColor}20`,
                          transform: [{ translateX: 8 }]
                        },
                      ]}
                    >
                      {({ pressed }) => (
                        <>
                          <View style={[
                            styles.itemIconWrapper, 
                            { backgroundColor: (pressed || isItemHovered) ? 'rgba(255,255,255,0.2)' : `${module.primaryColor}15` }
                          ]}>
                            {renderIcon(
                              item.icon,
                              [styles.itemIcon, { tintColor: (pressed || isItemHovered) ? '#FFFFFF' : module.primaryColor }],
                              'contain'
                            )}
                          </View>
                          <Text style={[styles.itemLabel, (pressed || isItemHovered) && { color: '#FFFFFF' }]}>
                            {item.label}
                          </Text>
                          {renderIcon(ArrowIcon, [
                            styles.arrowIconStyle,
                            { tintColor: (pressed || isItemHovered) ? '#FFFFFF' : module.primaryColor, opacity: isItemHovered ? 1 : 0.4 }
                          ])}
                        </>
                      )}
                    </Pressable>
                  )
                })
              ) : (
                <View style={styles.emptyContent} />
              )}
            </View>
          )}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'flex-start',
    // paddingBottom: 20,
    // marginTop: 10,
  },
  moduleCard: {
    width: Platform.OS === 'web' ? 'calc(33.33% - 16px)' : '100%',
    borderRadius: 24,
    padding: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(230, 230, 230, 0.5)',
    position: 'relative',
    overflow: 'hidden',
    gap: 32, // Tăng gap để thoáng hơn
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
    height: 6,
    opacity: 0.9,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 4, // Thêm padding bottom nhẹ
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleIcon: {
    width: 30,
    height: 30,
  },
  moduleTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: -0.5,
  },
  moduleSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    fontWeight: '500',
  },
  imageContentContainer: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 15px 30px rgba(0,0,0,0.08)',
    }),
  },
  moduleImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 24,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(10px)',
    }),
  },
  exploreText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Epilogue, sans-serif',
  },
  itemsContainer: {
    gap: 12,
  },
  itemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#F7F7F9',
    borderWidth: 1,
    borderColor: 'transparent',
    ...(Platform.OS === 'web' && {
      transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
    }),
  },
  itemIconWrapper: {
    width: 28, // Tăng nhẹ kích thước wrapper
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    // backgroundColor: 'rgba(0,0,0,0.03)', // Thêm background nhẹ để icon nổi bật hơn
  },
  itemIcon: {
    width: 22, // Tăng nhẹ kích thước icon
    height: 22,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#444',
    fontFamily: 'Epilogue, sans-serif',
    flex: 1,
  },
  arrowIconStyle: {
    width: 16,
    height: 16,
  },
  emptyContent: {
    minHeight: 100,
  },
});
