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
const PremiumButton = ({ onPress, style, textStyle, label = 'Nâng cấp VIP' }) => {
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
            padding: 10px 20px !important;
            cursor: pointer;
            gap: 10px;
            font-weight: bold;
            border-radius: 30px !important;
            text-shadow: 2px 2px 3px rgba(136, 0, 136, 0.5) !important;
            background-color: #880088 !important;
            background-image: linear-gradient(15deg, #880088 0%, #aa2068 12.5%, #cc3f47 25%, #de6f3d 37.5%, #f09f33 50%, #de6f3d 62.5%, #cc3f47 75%, #aa2068 87.5%, #880088 100%) !important;
            background-size: 300% !important;
            background-repeat: no-repeat !important;
            background-position: left center !important;
            color: #ffffff !important;
            border: none !important;
            box-shadow: 0 10px 20px -10px rgba(136, 0, 136, 0.5) !important;
            transition: all .3s ease !important;
            align-items: center;
            justify-content: center;
            flex-direction: row !important;
            outline: none !important;
            font-family: Epilogue, sans-serif !important;
            font-size: 14px !important;
            line-height: 1 !important;
            text-decoration: none !important;
            -webkit-user-select: none;
            user-select: none;
          }

          .uiverse-premium-button:hover {
            background-size: 320% !important;
            background-position: right center !important;
            transform: scale(1.05) translateY(-1px);
            box-shadow: 0 15px 25px -10px rgba(136, 0, 136, 0.6) !important;
          }

          .uiverse-premium-button:active {
            transform: scale(0.98);
          }

          .uiverse-premium-button svg {
            width: 22px;
            height: 16px;
            fill: #f09f33 !important;
            transition: all .3s ease;
          }

          .uiverse-premium-button:hover svg {
            fill: #ffffff !important;
            filter: drop-shadow(0 0 5px rgba(255,255,255,0.5));
            transform: scale(1.1);
          }
        `}} />
        <button
          className="uiverse-premium-button"
          onClick={onPress}
          style={style}
        >
          <svg viewBox="0 0 36 24">
            <path d={pathData} />
          </svg>
          <span style={textStyle}>{label}</span>
        </button>
      </div>
    )
  }

  // Mobile version using React Native components
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.mobileBtn,
        pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
        style
      ]}
    >
      <View style={styles.container}>
        {Svg && Path ? (
          <Svg width={22} height={16} viewBox="0 0 36 24" style={styles.mobileSvg}>
            <Path d={pathData} fill="#f09f33" />
          </Svg>
        ) : (
          <View style={styles.fallbackIcon} />
        )}
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
    backgroundColor: '#880088',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#880088',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    boxShadow: '0 4px 6px rgba(136, 0, 136, 0.3)',
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
