import React from 'react'
import { TextInput } from 'react-native'

export const ContentError = ({ value, onChangeText }) => {
  return (
    <TextInput
      multiline
      value={value}
      onChangeText={onChangeText}
      placeholder="Chi tiết nội dung lỗi"
      placeholderTextColor="#9B9B9B"
      style={{
        backgroundColor: '#F3F3F3',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 16,
        minHeight: 140,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        fontFamily: 'Epilogue, sans-serif',
        fontSize: 14,
        color: '#2D2D2D',
      }}
    />
  )
}


