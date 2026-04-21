import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native'

const getDifficultyStyles = (level) => {
  switch (level) {
    case 'Easy': return { bg: '#E8F5E9', text: '#4CAF50', label: 'Dễ' }
    case 'Medium': return { bg: '#FFF8E1', text: '#FFB800', label: 'Trung bình' }
    case 'Hard': return { bg: '#FFEBEE', text: '#F44336', label: 'Khó' }
    default: return { bg: '#F5F5F5', text: '#94A3B8', label: level }
  }
}

export function PronunciationExampleCard({ 
  text, 
  sortOrder, 
  onPress,
  subtitle = 'Chạm để bắt đầu luyện tập',
  isCompleted = false,
  difficulty = 'Medium'
}) {
  const [hovered, setHovered] = useState(false)
  const diffStyle = getDifficultyStyles(difficulty)

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPress}
        onHoverIn={() => Platform.OS === 'web' && setHovered(true)}
        onHoverOut={() => Platform.OS === 'web' && setHovered(false)}
        style={({ pressed }) => [
          styles.card,
          isCompleted && styles.cardCompleted,
          (pressed || hovered) && styles.cardActive,
        ]}
      >
        <View style={styles.left}>
          <View style={[
            styles.numberBox,
            isCompleted && styles.completedBox,
          ]}>
            {isCompleted ? (
              <View style={styles.checkmark} />
            ) : (
              <Text style={styles.numberText}>{sortOrder}</Text>
            )}
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {text}
          </Text>
          <View style={styles.bottomRow}>
            <View style={[styles.diffBadge, { backgroundColor: diffStyle.bg }]}>
              <Text style={[styles.diffText, { color: diffStyle.text }]}>{diffStyle.label}</Text>
            </View>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>

        <View style={styles.right}>
          <View style={[styles.playIconCircle, { backgroundColor: isCompleted ? '#FF7E5F' : '#F5F5F5' }]}>
            <View style={[styles.playArrow, { borderLeftColor: isCompleted ? '#FFF' : '#4B5563' }]} />
          </View>
        </View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 6,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardActive: {
    transform: [{ scale: 0.99 }],
    backgroundColor: '#FBFBFB',
  },
  cardCompleted: {
    borderLeftWidth: 6,
    borderLeftColor: '#8B4513',
  },
  left: {
    marginRight: 16,
  },
  numberBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E6E2D3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBox: {
    backgroundColor: '#8B4513',
  },
  numberText: {
    color: '#4B5563',
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Epilogue, sans-serif',
  },
  checkmark: {
    width: 14,
    height: 8,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
    marginTop: -2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 4,
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 12,
    color: '#8E9AAF',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  diffBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  diffText: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: 'Epilogue, sans-serif',
    textTransform: 'uppercase',
  },
  right: {
    marginLeft: 8,
  },
  playIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  playArrow: {
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#4B5563',
    marginLeft: 3,
  }
})

export default PronunciationExampleCard
