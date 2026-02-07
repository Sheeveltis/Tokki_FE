import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native'
import { SKILL_MODULES } from '../../mockData'
import { normalizeImageSource } from '../../api'

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
            {renderIcon(module.icon, styles.moduleIcon, module.isImageModule ? 'cover' : 'contain')}
            <Text style={styles.moduleTitle}>{module.title}</Text>
          </View>

          {/* Content */}
          {module.isImageModule ? (
            // Hiển thị hình ảnh trong card cho image modules
            <View style={styles.imageContentContainer}>
              {renderIcon(module.icon, styles.moduleImage, 'cover')}
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
                            {renderIcon(
                              item.icon, 
                              [styles.itemIcon, (pressed || isActive) && { tintColor: '#FFFFFF' }],
                              'contain'
                            )}
                            <Text style={[styles.itemLabel, (pressed || isActive) && { color: '#FFFFFF' }]}>
                              {item.label}
                            </Text>
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
    gap: Platform.OS === 'web' ? 20 : 16,
    justifyContent: 'center',
    paddingHorizontal: Platform.OS === 'web' ? 0 : 4,
  },
  moduleCard: {
    width: Platform.OS === 'web' ? '30%' : '100%',
    minWidth: Platform.OS === 'web' ? 250 : '100%',
    maxWidth: Platform.OS === 'web' ? 'none' : '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: Platform.OS === 'web' ? 16 : 14,
    padding: Platform.OS === 'web' ? 20 : 16,
    borderWidth: 2,
    borderColor: '#F4B8AF',
    shadowColor: '#00000015',
    shadowOpacity: 0.1,
    shadowRadius: Platform.OS === 'web' ? 8 : 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: Platform.OS === 'android' ? 3 : 0,
    gap: Platform.OS === 'web' ? 16 : 12,
    overflow: 'hidden',
    marginBottom: Platform.OS === 'web' ? 0 : 4,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transitionProperty: 'transform, box-shadow',
      transitionDuration: '150ms',
    }),
  },
  imageModulePressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.15,
  },
  imageContentContainer: {
    width: '100%',
    height: Platform.OS === 'web' ? 200 : 160,
    borderRadius: Platform.OS === 'web' ? 12 : 10,
    overflow: 'hidden',
    marginTop: Platform.OS === 'web' ? 8 : 6,
  },
  moduleImage: {
    width: '100%',
    height: '100%',
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Platform.OS === 'web' ? 12 : 10,
    borderBottomWidth: 2,
    borderBottomColor: '#F4B8AF',
    paddingBottom: Platform.OS === 'web' ? 12 : 10,
  },
  moduleIcon: {
    width: Platform.OS === 'web' ? 32 : 28,
    height: Platform.OS === 'web' ? 32 : 28,
    borderRadius: 4,
  },
  moduleTitle: {
    fontSize: Platform.OS === 'web' ? 20 : 18,
    fontWeight: '800',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
    flex: 1,
  },
  itemsContainer: {
    gap: Platform.OS === 'web' ? 12 : 10,
  },
  itemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Platform.OS === 'web' ? 12 : 10,
    paddingVertical: Platform.OS === 'web' ? 10 : 12,
    paddingHorizontal: Platform.OS === 'web' ? 12 : 14,
    borderRadius: Platform.OS === 'web' ? 8 : 10,
    backgroundColor: '#F4EDE7',
    minHeight: Platform.OS === 'web' ? 'auto' : 48,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transitionProperty: 'background-color, color',
      transitionDuration: '150ms',
    }),
  },
  itemButtonActive: {
    backgroundColor: '#FF9100',
  },
  itemIcon: {
    width: Platform.OS === 'web' ? 24 : 22,
    height: Platform.OS === 'web' ? 24 : 22,
  },
  itemLabel: {
    fontSize: Platform.OS === 'web' ? 14 : 15,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
    flex: 1,
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
})

