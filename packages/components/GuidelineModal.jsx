import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Platform,
  Pressable,
} from 'react-native'

/**
 * GuidelineModal: A premium onboarding/tutorial modal with pagination
 * 
 * @param {Object} props
 * @param {boolean} props.visible - Controls visibility
 * @param {Array} props.steps - Array of { title, description, image }
 * @param {Function} props.onClose - Callback when closed or finished
 * @param {string} props.primaryColor - Primary theme color (default: #F1BE4B)
 */
export const GuidelineModal = ({ 
  visible, 
  steps = [], 
  onClose,
  primaryColor = '#F1BE4B'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const fadeAnim = useRef(new Animated.Value(1)).current
  const slideAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (visible) {
      setCurrentIndex(0)
      fadeAnim.setValue(1)
      slideAnim.setValue(0)
      scaleAnim.setValue(1)
    }
  }, [visible])

  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      animateTransition(() => setCurrentIndex(currentIndex + 1), 1)
    } else {
      onClose && onClose()
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      animateTransition(() => setCurrentIndex(currentIndex - 1), -1)
    }
  }

  const animateTransition = (updateState, direction) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: Platform.OS !== 'web',
      })
    ]).start(() => {
      updateState()
      slideAnim.setValue(direction * 30)
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start()
    })
  }

  if (!visible || steps.length === 0) return null

  const currentStep = steps[currentIndex]

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <View style={styles.modalWrapper}>
          <View style={styles.container}>
            {/* Header / Close */}
            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>

            {/* Content Area */}
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateX: slideAnim },
                    { scale: scaleAnim }
                  ],
                },
              ]}
            >
              {/* Image Section */}
              <View style={styles.imageContainer}>
                <View style={[styles.imageBg, { backgroundColor: primaryColor + '15' }]} />
                <Image
                  source={typeof currentStep.image === 'string' ? { uri: currentStep.image } : currentStep.image}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>

              {/* Text Section */}
              <View style={styles.textContainer}>
                <Text style={styles.title}>{currentStep.title}</Text>
                <Text style={styles.description}>{currentStep.description}</Text>
              </View>
            </Animated.View>

            {/* Footer Navigation */}
            <View style={styles.footer}>
              {/* Left Arrow */}
              <TouchableOpacity
                style={[styles.navArrow, currentIndex === 0 && styles.disabledArrow]}
                onPress={handlePrev}
                disabled={currentIndex === 0}
                activeOpacity={0.6}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke={currentIndex === 0 ? '#CBD5E1' : primaryColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </TouchableOpacity>

              {/* Pagination Dots */}
              <View style={styles.pagination}>
                {steps.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      currentIndex === index ? [styles.activeDot, { backgroundColor: primaryColor }] : styles.inactiveDot,
                    ]}
                  />
                ))}
              </View>

              {/* Right Arrow / Finish */}
              <TouchableOpacity 
                style={[styles.navArrow, styles.nextArrow, { backgroundColor: primaryColor }]} 
                onPress={handleNext}
                activeOpacity={0.8}
              >
                {currentIndex === steps.length - 1 ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalWrapper: {
    width: '95%',
    maxWidth: 750, // Tăng từ 450 lên 750 để rộng rãi hơn
    zIndex: 10,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 32, // Tăng padding
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  closeText: {
    fontSize: 28,
    color: '#64748B',
    fontWeight: '300',
    marginTop: -2,
  },
  content: {
    alignItems: 'center',
    paddingTop: 10,
  },
  imageContainer: {
    width: '100%',
    height: 350, // Tăng chiều cao ảnh tương ứng với chiều rộng
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  imageBg: {
    position: 'absolute',
    width: 280, // Tăng vòng tròn nền
    height: 280,
    borderRadius: 140,
  },
  image: {
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 28, // Tăng kích thước chữ
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Epilogue, sans-serif',
  },
  description: {
    fontSize: 17, // Tăng kích thước chữ
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 26,
    fontFamily: 'Epilogue, sans-serif',
    maxWidth: '90%',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  navArrow: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  disabledArrow: {
    opacity: 0.5,
  },
  nextArrow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  arrowText: {
    fontSize: 20,
    fontWeight: '700',
  },
  nextArrowText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#E2E8F0',
  },
})

export default GuidelineModal
