import React from 'react'
import { TouchableOpacity, Text } from 'react-native'

export const ErrorBtn = ({ onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#941C28',
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
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
      }}
      activeOpacity={0.85}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: '800',
          color: '#FFFFFF',
          fontFamily: 'Epilogue, sans-serif',
        }}
      >
        Gửi báo cáo
      </Text>
    </TouchableOpacity>
  )
}

