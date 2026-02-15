import React from 'react'
import { View, TextInput, StyleSheet, Platform } from 'react-native'

export function WordleInputBar({ value, onChange, onSubmit, disabled, maxLength = 5 }) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        placeholder="Nhập từ của bạn..."
        placeholderTextColor="#999"
        maxLength={maxLength}
        autoFocus
        editable={!disabled}
        returnKeyType="done"
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#d3d6da',
    textAlign: 'center',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
})



