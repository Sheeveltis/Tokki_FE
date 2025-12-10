import React from 'react'
import { TouchableOpacity, View } from 'react-native'

export const RedBtn = ({ onPress, children, style, textStyle, ...props }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        {
          backgroundColor: '#941C28',
          borderRadius: 100,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 14,
          paddingHorizontal: 32,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.2,
          shadowRadius: 5,
          elevation: 4,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </TouchableOpacity>
  )
}

