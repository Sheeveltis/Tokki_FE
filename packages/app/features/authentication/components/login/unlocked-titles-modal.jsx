import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
  Animated,
} from 'react-native'
import confetti from 'canvas-confetti'


/**
 * UnlockedTitlesModal: Modal premium hiển thị danh sách các danh hiệu vừa mở khóa
 */
export const UnlockedTitlesModal = ({ visible, titles, onClose }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  // Sử dụng một Animated.Value chung cho các item để đơn giản hóa và đảm bảo hiển thị
  const listFadeAnim = useRef(new Animated.Value(0)).current

  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (visible && titles && titles.length > 0) {
      setIsReady(true)
      // Reset animations
      fadeAnim.setValue(0)
      scaleAnim.setValue(0.9)
      listFadeAnim.setValue(0) // 0 is invisible

      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(listFadeAnim, {
          toValue: 1, // Animate to 1 (visible)
          duration: 600,
          delay: 300,
          useNativeDriver: Platform.OS !== 'web',
        })
      ]).start()

      // Confetti
      if (Platform.OS === 'web') {
        const duration = 3 * 1000
        const animationEnd = Date.now() + duration
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }
        const randomInRange = (min, max) => Math.random() * (max - min) + min

        const interval = setInterval(function () {
          const timeLeft = animationEnd - Date.now()
          if (timeLeft <= 0) return clearInterval(interval)

          const particleCount = 50 * (timeLeft / duration)
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          })
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          })
        }, 250)
      }
    } else {
      setIsReady(false)
    }
  }, [visible, titles])

  if (!visible || !titles || titles.length === 0) return null

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.congratsText}>🎉 CHÚC MỪNG! 🎉</Text>
            <Text style={styles.subtitle}>
              Bạn vừa mở khóa {titles.length} danh hiệu mới!
            </Text>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {titles.map((title, index) => (
              <View
                key={title.titleId || index}
                style={[
                  styles.titleCard,
                  { borderLeftColor: title.colorHex || '#4C662B' },
                ]}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: (title.colorHex || '#4C662B') + '20' },
                  ]}
                >
                  <Image
                    source={{ uri: title.iconUrl }}
                    style={styles.titleIcon}
                  />
                </View>
                <View style={styles.titleInfo}>
                  <Text style={styles.titleName}>{title.name}</Text>
                  <Text style={styles.titleDesc}>{title.description}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeBtnText}>Tuyệt vời!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 20px 40px rgba(0,0,0,0.3)',
      },
      default: {
        elevation: 10,
      },
    }),
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  congratsText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4C662B',
    textAlign: 'center',
    fontFamily: 'Lexend, sans-serif',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
  },
  scrollArea: {
    width: '100%',
    marginVertical: 10,
  },
  scrollContent: {
    paddingBottom: 10,
    gap: 12,
  },
  titleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 6,
    ...Platform.select({
      web: {
        transition: 'transform 0.2s ease',
        ':hover': {
          transform: 'translateY(-2px)',
        },
      },
    }),
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  titleIcon: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
  },
  titleInfo: {
    flex: 1,
    gap: 4,
  },
  titleName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    fontFamily: 'Lexend, sans-serif',
  },
  titleDesc: {
    fontSize: 13,
    color: '#555',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 18,
  },
  closeBtn: {
    marginTop: 20,
    backgroundColor: '#4C662B',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 99,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  closeBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Lexend, sans-serif',
  },
})
