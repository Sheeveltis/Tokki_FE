import React from 'react'
import { TouchableOpacity, Text } from 'react-native'

export const ErrorBtn = ({ onPress, disabled = false }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: disabled ? '#CCCCCC' : '#941C28',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: 12,
        minWidth: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: disabled ? 0 : 0.2,
        shadowRadius: 5,
        elevation: disabled ? 0 : 4,
        opacity: disabled ? 0.6 : 1,
      }}
      activeOpacity={disabled ? 1 : 0.85}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: '800',
          color: '#FFFFFF',
          fontFamily: 'Epilogue, sans-serif',
        }}
      >
        {disabled ? 'Đang gửi...' : 'Gửi báo cáo'}
      </Text>
    </TouchableOpacity>
  )
}

