import React from 'react'
import { View, Text, StyleSheet, ImageBackground, Pressable, Platform } from 'react-native'
import MenuBackground from '../../../../../../../assets/menu2.png'

const IS_WEB = Platform.OS === 'web'

export function WordleMenuPopup({ onContinue, onQuit }) {
  return (
    <View style={styles.overlay}>
      <ImageBackground
        source={MenuBackground}
        style={IS_WEB ? styles.popupWeb : styles.popupMobile}
        imageStyle={IS_WEB ? styles.popupImageWeb : styles.popupImageMobile}
      >
        <View style={IS_WEB ? styles.buttonsContainerWeb : styles.buttonsContainerMobile}>
          <Pressable
            style={({ pressed }) => [
              IS_WEB ? styles.buttonWeb : styles.buttonMobile,
              pressed && styles.buttonPressed,
            ]}
            onPress={onContinue}
          >
            <Text style={IS_WEB ? styles.buttonTextWeb : styles.buttonTextMobile}>
              Tiếp tục
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              IS_WEB ? styles.buttonWeb : styles.buttonMobile,
              pressed && styles.buttonPressed,
            ]}
            onPress={onQuit}
          >
            <Text style={IS_WEB ? styles.buttonTextWeb : styles.buttonTextMobile}>
              Thoát
            </Text>
          </Pressable>
        </View>
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    paddingHorizontal: 16,
  },

  popupImageWeb: {
    resizeMode: 'contain',
  },

  popupImageMobile: {
    resizeMode: 'contain',
    transform: [{ translateX: -6 }, { translateY: 2 }],
  },

  popupWeb: {
    position: 'relative',
    width: '100%',
    maxWidth: 500,
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 40,
    paddingBottom: 60,
  },

  buttonsContainerWeb: {
    width: '70%',
    maxWidth: 300,
    gap: 20,
  },

  buttonWeb: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    backgroundColor: '#8B4513',
    borderWidth: 3,
    borderColor: '#654321',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },

  buttonTextWeb: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },

  popupMobile: {
    width: '100%',
    maxWidth: 340,
    height: 230,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 38,
    paddingBottom: 26,
  },

  buttonsContainerMobile: {
    width: '82%',
    justifyContent: 'center',
    gap: 14,
    marginTop: 8,
  },

  buttonMobile: {
    width: '100%',
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: '#9C4F14',
    borderWidth: 2,
    borderColor: '#6E3510',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },

  buttonTextMobile: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
})

export default WordleMenuPopup