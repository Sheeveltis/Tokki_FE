import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

const DEFAULT_SECURITY = {
  email: 'quyppse183188@gmail.com',
  password: '**********',
  phone: '0368182797',
}

export function SecurityInfo({ initialData = DEFAULT_SECURITY, onUpdate, onChangePassword }) {
  const [email, setEmail] = useState(initialData.email)
  const [password, setPassword] = useState(initialData.password)
  const [phone, setPhone] = useState(initialData.phone)

  const handleUpdate = () => {
    if (onUpdate) onUpdate({ phone })
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Bảo mật</Text>

      <View style={styles.row}>
        <View style={styles.field}>
          <TextInput
            value={email}
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#8F8F8F"
            keyboardType="email-address"
            editable={false}
            selectTextOnFocus={false}
          />
        </View>
        <View style={styles.field}>
          <TextInput
            value={password}
            style={styles.input}
            placeholder="Mật khẩu"
            placeholderTextColor="#8F8F8F"
            secureTextEntry
            editable={false}
            selectTextOnFocus={false}
          />
        </View>
        <View style={styles.field}>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            placeholder="Số điện thoại"
            placeholderTextColor="#8F8F8F"
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={handleUpdate} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
          <Text style={styles.buttonText}>Cập Nhật</Text>
        </Pressable>
        <Pressable
          onPress={onChangePassword}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>Đổi mật khẩu</Text>
        </Pressable>
      </View>
    </View>
  )
}

const inputShadow = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E3DC',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  field: {
    flex: 1,
  },
  input: {
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    ...inputShadow,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  button: {
    backgroundColor: '#FFDCAA',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
})

