import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'

export function UserTitle({ 
  title = null, 
  icon = '🏆', 
  colorHex = '',
  onPress = null
}) {
  const iconAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
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

  return (
    <View style={styles.container}>
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
          backgroundColor: colorHex ? `${colorHex}10` : '#FFF0F0', 
          borderColor: colorHex || '#FFB6C1',
          transform: [{ scale: iconAnim }]
        }]}>
          {icon && (icon.startsWith('http') || icon.startsWith('https')) ? (
            <Image source={{ uri: icon }} style={styles.iconImage} />
          ) : (
            <Text style={styles.badgeIcon}>{icon || '🏆'}</Text>
          )}
          <Text style={[styles.badgeText, { color: colorHex || '#F06292' }]}>
            {title || 'Chưa có danh hiệu'}
          </Text>
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
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
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 99,
    borderWidth: 1.5,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    minWidth: '80%',
  },
  badgeIcon: {
    fontSize: 24,
  },
  iconImage: {
    width: 28,
    height: 28,
    borderRadius: 6,
    resizeMode: 'contain',
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
  },
  dateText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '700',
  },
})
