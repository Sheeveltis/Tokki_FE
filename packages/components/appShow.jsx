import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native'
import { NavigationPill } from 'components/navigation-pill'
import AppIcon from '../assets/icon/icon-mainflow/app.svg'
import FlashcardIcon from '../assets/icon/icon-mainflow/game-card.svg'
import StudyIcon from '../assets/icon/icon-mainflow/bookandsky.svg'
import FavoriteVocabIcon from '../assets/icon/icon-mainflow/heart.svg'

/**
 * AppShow: Icon hiển thị danh sách các app con (flashcard, học TOPIK, v.v.)
 *
 * @param {Object} props
 * @param {Array<{
 *   label: string
 *   to?: string
 *   icon?: any
 *   onPress?: () => void
 * }>} props.apps Danh sách app con
 * @param {string} [props.title] Tiêu đề khối (mặc định: "Ứng dụng học")
 * @param {any} [props.style] Style cho container ngoài
 */
export const AppShow = ({ apps, title = 'Ứng dụng học', style }) => {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [hoveredItemIndex, setHoveredItemIndex] = useState(null)

  const normalizeImageSource = (src) => {
    if (!src) return null
    if (typeof src === 'number' || typeof src === 'string') return src
    if (src.uri) return src
    if (src.src) return { uri: src.src }
    if (src.default) return src.default
    return src
  }

  const iconSource = normalizeImageSource(AppIcon)

  const defaultApps = [
    {
      label: 'Flashcard',
      to: '/flashcard',
      icon: FlashcardIcon,
    },
    {
      label: 'Học TOPIK',
      to: '/study',
      icon: StudyIcon,
    },
    {
      label: 'Từ vựng yêu thích',
      to: '/vocabulary/favorite',
      icon: FavoriteVocabIcon,
    },
  ]

  const finalApps = apps && apps.length > 0 ? apps : defaultApps

  const handleToggle = () => {
    setOpen((prev) => !prev)
  }

  return (
    <View style={[styles.wrapper, style]}>
      {/* Icon chính */}
      <TouchableOpacity
        style={[styles.iconButton, hovered && styles.iconButtonHovered]}
        activeOpacity={0.8}
        onPress={handleToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {iconSource ? <Image source={iconSource} style={styles.icon} /> : null}
      </TouchableOpacity>

      {/* Danh sách app con */}
      {open && finalApps.length > 0 && (
        <View style={styles.dropdown}>
          <Text style={styles.dropdownTitle}>Các ứng dụng</Text>

          <View style={styles.appList}>
            {finalApps.map((app, index) => (
              <View
                key={app.to || app.label || index}
                style={[
                  styles.appItemWrapper,
                  hoveredItemIndex === index && styles.appItemWrapperHovered,
                ]}
                onMouseEnter={() => setHoveredItemIndex(index)}
                onMouseLeave={() => setHoveredItemIndex(null)}
              >
                <NavigationPill
                  label={app.label}
                  to={app.to}
                  icon={app.icon}
                  onPress={app.onPress}
                  style={styles.appItem}
                  textStyle={{ fontSize: 14 }}
                />
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'flex-end',
    position: 'relative',
  },
  iconButton: {
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  iconButtonHovered: {
    // Hover: chỉ phóng to nhẹ giống bubble chat
    transform: [{ scale: 1.05 }],
  },
  icon: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  dropdown: {
    position: 'absolute',
    right: 72, // nằm ngang sang trái icon, giống chat-window
    bottom: 0, // căn cùng hàng với icon
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF', // nền trắng cho panel ứng dụng
    shadowColor: '#00000020',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    minWidth: 260,
  },
  dropdownTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
    color: '#5E4A3A',
    fontFamily: 'Epilogue, sans-serif',
  },
  appList: {
    gap: 10,
  },
  appItem: {
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  appItemWrapper: {
    borderRadius: 999,
    transform: [{ scale: 1.03 }],
  },
  appItemWrapperHovered: {
    transform: [{ scale: 1.02 }],
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
})


