import React from 'react'
import { View, Text, StyleSheet, ImageBackground, Pressable, Platform } from 'react-native'
import MenuBackground from '../../../../../../../assets/menu2.png'

export function WordleMenuPopup({ onContinue, onQuit }) {
  return (
    <View style={styles.overlay}>
      <ImageBackground
        source={MenuBackground}
        style={styles.popup}
        imageStyle={styles.popupImage}
      >
        <View style={styles.buttonsContainer}>
          <Pressable
            style={styles.button}
            onPress={onContinue}
          >
            <Text style={styles.buttonText}>Tiếp tục</Text>
          </Pressable>
          <Pressable
            style={styles.button}
            onPress={onQuit}
          >
            <Text style={styles.buttonText}>Thoát</Text>
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
  },
  popup: {
    position: 'relative',
    width: '100%',
    maxWidth: 500,
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 40,
    paddingBottom: 60,
  },
  popupImage: {
    resizeMode: 'contain',
  },
  buttonsContainer: {
    width: '70%',
    maxWidth: 300,
    gap: 20,
  },
  button: {
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
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    ...(Platform.OS === 'web' && { fontFamily: 'Epilogue, sans-serif' }),
  },
})

