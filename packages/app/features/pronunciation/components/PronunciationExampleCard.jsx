import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native'

/**
 * PronunciationExampleCard: Card hiển thị ví dụ phát âm với phân cấp thị giác rõ nét
 */
export function PronunciationExampleCard({ 
  text, 
  sortOrder, 
  onPress,
  subtitle = 'Chạm để luyện tập phát âm'
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPress}
        onHoverIn={() => Platform.OS === 'web' && setHovered(true)}
        onHoverOut={() => Platform.OS === 'web' && setHovered(false)}
        style={({ pressed }) => [
          styles.card,
          (pressed || hovered) && styles.cardActive,
        ]}
      >
        <View style={styles.left}>
          <View style={[
            styles.numberBox,
            hovered && styles.numberBoxHovered
          ]}>
             <Text style={styles.numberText}>{sortOrder}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {text}
          </Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={[
          styles.right,
          hovered && styles.rightHovered
        ]}>
          <View style={styles.playIconCircle}>
             <View style={styles.playArrow} />
          </View>
        </View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    ...(Platform.OS === 'web' && {
      transitionProperty: 'all',
      transitionDuration: '200ms',
      cursor: 'pointer',
    }),
  },
  cardActive: {
    shadowOpacity: 0.1,
    borderColor: '#7FB069',
    backgroundColor: '#FAFFF7',
    shadowColor: '#7FB069',
    ...(Platform.OS === 'web' && {
      transform: 'translateY(-2px)',
    }),
  },
  left: {
    marginRight: 20,
  },
  numberBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#7FB069',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7FB069',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    ...(Platform.OS === 'web' && {
      transitionProperty: 'all',
      transitionDuration: '200ms',
    }),
  },
  numberBoxHovered: {
    transform: [{ scale: 1.05 }],
    backgroundColor: '#6EA058',
  },
  numberText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    fontFamily: 'Epilogue, sans-serif',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: '#000000', // Đen tuyền để nổi bật hoàn toàn
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '500',
  },
  right: {
    marginLeft: 12,
    ...(Platform.OS === 'web' && {
      transitionProperty: 'transform',
      transitionDuration: '200ms',
    }),
  },
  rightHovered: {
    transform: [{ translateX: 6 }],
  },
  playIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playArrow: {
    width: 0,
    height: 0,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderLeftWidth: 12,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#7FB069',
    marginLeft: 3,
  }
})

export default PronunciationExampleCard
