import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native'
import { SKILL_MODULES } from '../../../mockData'
import { normalizeImageSource } from '../../../api'

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
    return (
      <View style={[style, { alignItems: 'center', justifyContent: 'center' }]}>
        <IconComponent width={style.width || 28} height={style.height || 28} />
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
  const [hoveredItem, setHoveredItem] = useState(null)

  return (
    <View style={styles.grid}>
      {SKILL_MODULES.map((module) => (
        <Pressable
          key={module.id}
          onPress={() => module.isImageModule && onModulePress?.(module.id)}
          onHoverIn={() => Platform.OS === 'web' && module.isImageModule && setHoveredItem(module.id)}
          onHoverOut={() => Platform.OS === 'web' && module.isImageModule && setHoveredItem(null)}
          style={({ pressed }) => [
            styles.moduleCard,
            module.isImageModule && (pressed || hoveredItem === module.id) && styles.imageModulePressed,
          ]}
        >
          {/* Header - luôn hiển thị cho tất cả modules */}
          <View style={styles.moduleHeader}>
            <View style={styles.iconContainer}>
              {renderIcon(module.icon, styles.moduleIcon, module.isImageModule ? 'cover' : 'contain')}
            </View>
            <Text style={styles.moduleTitle}>{module.title}</Text>
          </View>

          {/* Content */}
          {module.isImageModule ? (
            // Hiển thị hình ảnh trong card cho image modules
            <View style={styles.imageContentContainer}>
              {renderIcon(module.icon, styles.moduleImage, 'cover')}
              <View style={styles.imageOverlay}>
                <Text style={styles.exploreText}>Khám phá ngay →</Text>
              </View>
            </View>
          ) : (
            // Hiển thị items cho các module thông thường
            <>
              {module.items.length > 0 ? (
                <View style={styles.itemsContainer}>
                  {module.items.map((item, index) => {
                    const isActive = hoveredItem === `${module.id}-${index}`
                    return (
                      <Pressable
                        key={index}
                        onPress={() => onModulePress?.(module.id, item.label)}
                        onHoverIn={() => Platform.OS === 'web' && setHoveredItem(`${module.id}-${index}`)}
                        onHoverOut={() => Platform.OS === 'web' && setHoveredItem(null)}
                        style={({ pressed }) => [
                          styles.itemButton,
                          (pressed || isActive) && styles.itemButtonActive,
                        ]}
                      >
                        {({ pressed }) => (
                          <>
                            <View style={[styles.itemIconWrapper, (pressed || isActive) && styles.itemIconWrapperActive]}>
                              {renderIcon(
                                item.icon, 
                                [styles.itemIcon, (pressed || isActive) && { tintColor: '#FFFFFF' }],
                                'contain'
                              )}
                            </View>
                            <Text style={[styles.itemLabel, (pressed || isActive) && { color: '#FFFFFF' }]}>
                              {item.label}
                            </Text>
                            <Text style={[styles.arrowIcon, (pressed || isActive) && { color: '#FFFFFF' }]}>→</Text>
                          </>
                        )}
                      </Pressable>
                    )
                  })}
                </View>
              ) : (
                <View style={styles.emptyContent} />
              )}
            </>
          )}
        </Pressable>
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
    paddingBottom: 20,
  },
  moduleCard: {
    width: Platform.OS === 'web' ? 'calc(50% - 12px)' : '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    }),
    gap: 20,
    overflow: 'hidden',
  },
  imageModulePressed: {
    transform: [{ scale: 0.99 }],
    borderColor: '#FFCF6C',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 15px 40px rgba(255, 207, 108, 0.15)',
    }),
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F9F9F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  moduleIcon: {
    width: 28,
    height: 28,
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: -0.5,
  },
  imageContentContainer: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
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
    height: '40%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 20,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(4px)',
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: 'transparent',
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
    }),
  },
  itemButtonActive: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  itemIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIconWrapperActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  itemIcon: {
    width: 18,
    height: 18,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    fontFamily: 'Epilogue, sans-serif',
    flex: 1,
  },
  arrowIcon: {
    fontSize: 16,
    color: '#CCC',
    fontWeight: '300',
  },
  emptyContent: {
    minHeight: 100,
  },
})
