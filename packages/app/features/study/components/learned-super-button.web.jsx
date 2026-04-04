import React from 'react'
import { Pressable, Text, View, StyleSheet, Platform } from 'react-native'
import { StudyIcon } from './study-icon.web'
import BookIcon from 'assets/icon/navigate-app/book.svg'

/**
 * StarSVG: Component SVG ngôi sao cho hiệu ứng button
 */
const StarSVG = ({ size, fill = "#FFD700" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 784.11 815.53"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    <path
      fill={fill}
      style={{ transition: 'all 0.4s ease-in-out' }}
      d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"
    />
  </svg>
)

/**
 * LearnedSuperButton (Web): Nút "Học siêu cấp" với chiều dài cố định và các ngôi sao ẩn hiện
 */
export function LearnedSuperButton({ onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered }) => [
        styles.button,
        hovered && styles.buttonHover
      ]}
    >
      {({ hovered }) => (
        <>
          <View style={styles.content}>
            <StudyIcon
              source={BookIcon}
              width={20}
              height={20}
              tintColor={hovered ? "#FFFFFF" : "#FFFFFF"}
            />
            <Text style={[
              styles.text,
              { color: hovered ? "#FFFFFF" : "#FFFFFF" }
            ]}>
              Học siêu cấp
            </Text>
          </View>

          {/* Stars */}
          <View style={[styles.star, styles.star1, hovered ? styles.star1Hover : styles.starNormal]}>
            <StarSVG size={25} fill={hovered ? "#FFD700" : "#2563EB"} />
          </View>
          <View style={[styles.star, styles.star2, hovered ? styles.star2Hover : styles.starNormal]}>
            <StarSVG size={15} fill={hovered ? "#FFD700" : "#2563EB"} />
          </View>
          <View style={[styles.star, styles.star3, hovered ? styles.star3Hover : styles.starNormal]}>
            <StarSVG size={5} fill={hovered ? "#FFD700" : "#2563EB"} />
          </View>
          <View style={[styles.star, styles.star4, hovered ? styles.star4Hover : styles.starNormal]}>
            <StarSVG size={8} fill={hovered ? "#FFD700" : "#2563EB"} />
          </View>
          <View style={[styles.star, styles.star5, hovered ? styles.star5Hover : styles.starNormal]}>
            <StarSVG size={15} fill={hovered ? "#FFD700" : "#2563EB"} />
          </View>
          <View style={[styles.star, styles.star6, hovered ? styles.star6Hover : styles.starNormal]}>
            <StarSVG size={5} fill={hovered ? "#FFD700" : "#2563EB"} />
          </View>
        </>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 25,
    minWidth: 175,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#2563EB',
    marginLeft: 12,
    overflow: 'visible',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
      transition: 'all 0.3s ease-in-out',
    }),
  },
  buttonHover: {
    backgroundColor: '#1E40AF',
    borderColor: '#2563EB',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 0 30px rgba(37, 99, 235, 0.6)',
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 10,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Epilogue, sans-serif',
    ...(Platform.OS === 'web' && {
      transition: 'color 0.4s ease-in-out',
    }),
  },
  star: {
    position: 'absolute',
    pointerEvents: 'none',
  },
  starNormal: {
    zIndex: -1,
    ...(Platform.OS === 'web' && {
      filter: 'drop-shadow(0 0 0 transparent)',
    }),
  },
  star1: {
    top: '20%',
    left: '20%',
    ...(Platform.OS === 'web' && {
      transition: 'all 1s cubic-bezier(0.05, 0.83, 0.43, 0.96)',
    }),
  },
  star1Hover: {
    top: '-80%',
    left: '-30%',
    zIndex: 2,
    ...(Platform.OS === 'web' && {
      filter: 'drop-shadow(0 0 10px #FFD700)',
    }),
  },
  star2: {
    top: '45%',
    left: '45%',
    ...(Platform.OS === 'web' && {
      transition: 'all 1s cubic-bezier(0, 0.4, 0, 1.01)',
    }),
  },
  star2Hover: {
    top: '-25%',
    left: '10%',
    zIndex: 2,
    ...(Platform.OS === 'web' && {
      filter: 'drop-shadow(0 0 10px #FFD700)',
    }),
  },
  star3: {
    top: '40%',
    left: '40%',
    ...(Platform.OS === 'web' && {
      transition: 'all 1s cubic-bezier(0, 0.4, 0, 1.01)',
    }),
  },
  star3Hover: {
    top: '55%',
    left: '25%',
    zIndex: 2,
    ...(Platform.OS === 'web' && {
      filter: 'drop-shadow(0 0 10px #FFD700)',
    }),
  },
  star4: {
    top: '20%',
    left: '40%',
    ...(Platform.OS === 'web' && {
      transition: 'all 0.8s cubic-bezier(0, 0.4, 0, 1.01)',
    }),
  },
  star4Hover: {
    top: '30%',
    left: '80%',
    zIndex: 2,
    ...(Platform.OS === 'web' && {
      filter: 'drop-shadow(0 0 10px #FFD700)',
    }),
  },
  star5: {
    top: '25%',
    left: '45%',
    ...(Platform.OS === 'web' && {
      transition: 'all 0.6s cubic-bezier(0, 0.4, 0, 1.01)',
    }),
  },
  star5Hover: {
    top: '25%',
    left: '115%',
    zIndex: 2,
    ...(Platform.OS === 'web' && {
      filter: 'drop-shadow(0 0 10px #FFD700)',
    }),
  },
  star6: {
    top: '5%',
    left: '50%',
    ...(Platform.OS === 'web' && {
      transition: 'all 0.8s ease',
    }),
  },
  star6Hover: {
    top: '5%',
    left: '60%',
    zIndex: 2,
    ...(Platform.OS === 'web' && {
      filter: 'drop-shadow(0 0 10px #FFD700)',
    }),
  },
})
