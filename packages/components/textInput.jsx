import React, { useState } from 'react'
import { View, Text, TextInput as RNTextInput } from 'react-native'

/**
 * Flexible text input component with customizable max length
 *
 * @param {{
 *   placeholder?: string;
 *   maxLength?: number;
 *   value?: string;
 *   onChangeText?: (text: string) => void;
 *   multiline?: boolean;
 *   numberOfLines?: number;
 *   showCharCount?: boolean;
 *   style?: any;
 *   inputStyle?: any;
 *   label?: string;
 * }} props
 */
export const TextInput = ({
  placeholder = '',
  maxLength,
  value,
  onChangeText,
  multiline = false,
  numberOfLines = 1,
  showCharCount = false,
  style,
  inputStyle,
  label,
}) => {
  const [text, setText] = useState(value || '')

  const handleChangeText = (newText) => {
    // Enforce maxLength if provided
    if (maxLength && newText.length > maxLength) {
      return
    }
    const finalText = newText
    setText(finalText)
    if (onChangeText) {
      onChangeText(finalText)
    }
  }

  const remainingChars = maxLength ? maxLength - text.length : null

  return (
    <View style={[{ width: '100%' }, style]}>
      {label && (
        <Text
          style={{
            fontSize: 14,
            fontWeight: '500',
            marginBottom: 8,
            color: '#333',
            fontFamily: 'Epilogue, sans-serif',
          }}
        >
          {label}
        </Text>
      )}
      <View style={{ position: 'relative' }}>
        <RNTextInput
          placeholder={placeholder}
          value={value !== undefined ? value : text}
          onChangeText={handleChangeText}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={[
            {
              backgroundColor: '#F3F3F3',
              borderRadius: 0,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              fontFamily: 'Epilogue, sans-serif',
              color: '#333',
              minHeight: multiline ? numberOfLines * 24 : 48,
              textAlignVertical: multiline ? 'top' : 'center',
            },
            inputStyle,
          ]}
          placeholderTextColor="#999"
        />
        {showCharCount && maxLength && (
          <View
            style={{
              position: 'absolute',
              right: 12,
              bottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: remainingChars < 10 ? '#ff4444' : '#999',
                fontFamily: 'Epilogue, sans-serif',
              }}
            >
              {remainingChars}/{maxLength}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

