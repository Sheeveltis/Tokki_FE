import React from 'react'
import { View, TextInput, StyleSheet, Platform, Pressable, Text } from 'react-native'

export function WordleInputBar({ value, onChange, onSubmit, disabled, maxLength = 100 }) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        placeholder="Nhập câu văn của bạn..."
        placeholderTextColor="#999"
        maxLength={maxLength}
        autoFocus
        editable={!disabled}
        returnKeyType="done"
        autoCapitalize="none"
        autoCorrect={false}
        multiline={true}
        textAlignVertical="top"
        scrollEnabled={true}
      />
      <View style={styles.charCountContainer}>
        <Text style={[
          styles.charCount,
          value.length >= maxLength && styles.charCountMax
        ]}>
          {value.length}/{maxLength}
        </Text>
      </View>
      <Pressable
        style={[styles.submitButton, disabled && styles.submitButtonDisabled]}
        onPress={onSubmit}
        disabled={disabled || !value.trim()}
      >
        <Text style={styles.submitButtonText}>Gửi</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 10,
    marginVertical: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  input: {
    flex: 1,
    minHeight: 56,
    maxHeight: 150,
    backgroundColor: '#FFF9E3', // Soft cream
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 18,
    borderWidth: 3,
    borderColor: '#8D6E63', // Wooden frame
    color: '#4E342E',
    textAlign: 'left',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        overflowY: 'auto',
        resize: 'none',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  submitButton: {
    backgroundColor: '#4CAF50', // Friendly green
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 4px 0 #2E7D32, 0 4px 8px rgba(0,0,0,0.2)',
      },
    }),
  },
  submitButtonDisabled: {
    backgroundColor: '#CFD8DC',
    opacity: 0.6,
    ...Platform.select({
      web: {
        cursor: 'not-allowed',
        boxShadow: 'none',
        transform: [{ translateY: 2 }],
      },
    }),
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    ...Platform.select({
      web: {
        textShadow: '1px 1px 1px rgba(0,0,0,0.2)',
      },
      default: {
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
      },
    }),
  },
  charCountContainer: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    backgroundColor: '#8D6E63',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    zIndex: 1,
  },
  charCount: {
    fontSize: 12,
    color: '#FFF9E3',
    fontWeight: '700',
  },
  charCountMax: {
    color: '#FFCCBC',
  },
})



