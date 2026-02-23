import React from 'react'
import { View, TextInput, StyleSheet, Platform, Pressable, Text } from 'react-native'

export function WordleInputBar({ value, onChange, onSubmit, disabled, maxLength = 150 }) {
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
    paddingHorizontal: 20,
    marginVertical: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 50,
    maxHeight: 150,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#d3d6da',
    textAlign: 'left',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        overflowY: 'auto',
        resize: 'none',
      },
    }),
  },
  submitButton: {
    backgroundColor: '#6aaa64',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  submitButtonDisabled: {
    backgroundColor: '#d3d6da',
    opacity: 0.6,
    ...Platform.select({
      web: {
        cursor: 'not-allowed',
      },
    }),
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})



