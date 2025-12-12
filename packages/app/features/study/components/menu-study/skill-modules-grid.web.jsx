import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native'
import { SKILL_MODULES } from '../../mockData'
import { normalizeImageSource } from '../../api'

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
            <Image
              source={normalizeImageSource(module.icon)}
              style={styles.moduleIcon}
              resizeMode={module.isImageModule ? 'cover' : 'contain'}
            />
            <Text style={styles.moduleTitle}>{module.title}</Text>
          </View>

          {/* Content */}
          {module.isImageModule ? (
            // Hiển thị hình ảnh trong card cho image modules
            <View style={styles.imageContentContainer}>
              <Image
                source={normalizeImageSource(module.icon)}
                style={styles.moduleImage}
                resizeMode="cover"
              />
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
                            <Image
                              source={normalizeImageSource(item.icon)}
                              style={[styles.itemIcon, (pressed || isActive) && { tintColor: '#FFFFFF' }]}
                              resizeMode="contain"
                            />
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
    gap: 20,
    justifyContent: 'center',
  },
  moduleCard: {
    width: '30%',
    minWidth: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#F4B8AF',
    shadowColor: '#00000015',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    gap: 16,
    overflow: 'hidden',
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
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  moduleImage: {
    width: '100%',
    height: '100%',
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#F4B8AF',
    paddingBottom: 12,
  },
  moduleIcon: {
    width: 32,
    height: 32,
    borderRadius: 4,
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  itemsContainer: {
    gap: 12,
  },
  itemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F4EDE7',
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
    width: 24,
    height: 24,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
})

