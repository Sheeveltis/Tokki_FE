import React from 'react'
import { TouchableOpacity, Text, View, StyleSheet, Platform, Pressable } from 'react-native'

// For Web, we use raw HTML tags to ensure CSS animations and gradients work perfectly.
// For mobile, we use react-native-svg.
let RNSvg = null;
if (Platform.OS !== 'web') {
  try {
    RNSvg = require('react-native-svg');
  } catch (e) { }
}

/**
 * PremiumButton component with fancy gradient and hover effects
 * Optimized to be safe and beautiful on both Web and Mobile.
 */
const PremiumButton = ({ onPress, style, textStyle, label = 'Nâng cấp VIP', disabled = false }) => {
  const isWeb = Platform.OS === 'web'
  const Svg = RNSvg?.Svg;
  const Path = RNSvg?.Path;
  const pathData = "m18 0 8 12 10-8-4 20H4L0 4l10 8 8-12z";

  if (isWeb) {
    return (
      <div style={{ display: 'contents' }}>
        <style dangerouslySetInnerHTML={{
          __html: `
          .uiverse-premium-button {
            width: fit-content;
            display: flex !important;
            padding: 10px 22px !important;
            cursor: pointer;
            gap: 10px;
            font-weight: 800;
            border-radius: 99px !important;
            background-color: #FF8F00 !important;
            background-image: linear-gradient(135deg, #FFB300 0%, #FF8F00 50%, #FF6F00 100%) !important;
            background-size: 200% !important;
            background-position: left center !important;
            color: #ffffff !important;
            border: none !important;
            box-shadow: 0 8px 15px rgba(255, 143, 0, 0.25) !important;
            transition: all .3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            align-items: center;
            justify-content: center;
            flex-direction: row !important;
            outline: none !important;
            font-family: 'Plus Jakarta Sans', Epilogue, sans-serif !important;
            font-size: 14px !important;
            line-height: 1 !important;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            text-decoration: none !important;
            -webkit-user-select: none;
            user-select: none;
            z-index: 10;
          }

          .uiverse-premium-button:hover {
            background-position: right center !important;
            transform: scale(1.04) translateY(-1px);
            box-shadow: 0 12px 20px rgba(255, 143, 0, 0.35) !important;
          }

          .uiverse-premium-button:active:not(.is-disabled) {
            transform: scale(0.98);
          }

          .uiverse-premium-button.is-disabled {
            cursor: default;
            opacity: 0.95;
          }

          .uiverse-premium-button svg {
            width: 20px;
            height: 20px;
            fill: #ffffff !important;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
            transition: all .3s ease;
          }

          .uiverse-premium-button:hover svg {
            transform: scale(1.1) rotate(5deg);
          }
        `}} />
        <button
          className={`uiverse-premium-button ${disabled ? 'is-disabled' : ''}`}
          onClick={disabled ? (e) => e.preventDefault() : onPress}
          style={style}
        >
          <svg viewBox="0 0 24 24">
             <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" />
          </svg>
          <span style={textStyle}>{label}</span>
        </button>
      </div>
    )
  }

  // Mobile version using React Native components
  return (
    <Pressable
      onPress={disabled ? null : onPress}
      style={({ pressed }) => [
        styles.mobileBtn,
        !disabled && pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
        style
      ]}
    >
      <View style={styles.container}>
        <Text style={[styles.text, textStyle]}>{label}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mobileBtn: {
    backgroundColor: '#FF8F00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF8F00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  text: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  mobileSvg: {
    marginRight: 4,
  },
  fallbackIcon: {
    width: 14,
    height: 14,
    backgroundColor: '#f09f33',
    borderRadius: 7,
    marginRight: 4,
  }
})

export default PremiumButton
