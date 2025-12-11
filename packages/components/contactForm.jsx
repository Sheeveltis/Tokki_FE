import React, { useState } from 'react'
import { View, Text } from 'react-native'
import { TextInput } from './textInput'
import { RedBtn } from './redbtn'

export const ContactForm = ({ onSubmit }) => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit({ fullName, email, content })
    }
  }

  return (
    <View
      style={{
        gap: 10,
        width: '100%',
      }}
    >
      {/* Họ và Tên Input */}
      <TextInput
        placeholder="Nhập Họ và Tên"
        value={fullName}
        onChangeText={setFullName}
        inputStyle={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      />

      {/* Email Input */}
      <TextInput
        placeholder="Nhập Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        inputStyle={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      />

      {/* Nội dung Input (Multiline) */}
      <TextInput
        placeholder="Nhập nội dung của bạn"
        value={content}
        onChangeText={setContent}
        multiline={true}
        numberOfLines={11}
        inputStyle={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      />

      {/* Xác nhận Button */}
      <View style={{ alignItems: 'center', marginTop: 8, top: 12 }}>
        <RedBtn onPress={handleSubmit}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: '#FFFFFF',
              fontFamily: 'Epilogue, sans-serif',
            }}
          >
            Xác nhận
          </Text>
        </RedBtn>
      </View>
    </View>
  )
}

