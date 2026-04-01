import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

const DEFAULT_INFO = {
  username: 'Quý',
  email: 'example@gmail.com',
  phone: '',
  dateOfBirth: '',
}

export function BasicInfo({ initialInfo = DEFAULT_INFO, onSubmit }) {
  const [username, setUsername] = useState(initialInfo.username || '')
  const [phone, setPhone] = useState(initialInfo.phone || '')
  const [dateOfBirth, setDateOfBirth] = useState(initialInfo.dateOfBirth || '')

  useEffect(() => {
    setUsername(initialInfo.username || '')
    setPhone(initialInfo.phone || '')
    setDateOfBirth(initialInfo.dateOfBirth || '')
  }, [initialInfo])

  const handleSubmit = () => {
    if (onSubmit) onSubmit({ username, phone, dateOfBirth })
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Thông tin cá nhân</Text>

      <View style={styles.rowFields}>
        <View style={styles.field}>
          <Text style={styles.label}>Họ và tên</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            placeholder="Nhập họ và tên"
            placeholderTextColor="#A0A0A0"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            placeholder="Nhập số điện thoại"
            placeholderTextColor="#A0A0A0"
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View style={styles.rowFields}>
        <View style={styles.field}>
          <Text style={styles.label}>Email (Cố định)</Text>
          <TextInput
            value={initialInfo.email || ''}
            style={[styles.input, styles.inputDisabled]}
            placeholder="Email"
            placeholderTextColor="#A0A0A0"
            keyboardType="email-address"
            editable={false}
            selectTextOnFocus={false}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Ngày sinh</Text>
          <TextInput
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#A0A0A0"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable 
          onPress={handleSubmit} 
          style={({ pressed, hovered }) => [
            styles.button, 
            pressed && styles.buttonPressed,
            hovered && styles.buttonHovered
          ]}
        >
          <Text style={styles.buttonText}>Cập nhật thông tin</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    gap: 20,
    height: '100%',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#20130A',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 4,
  },
  rowFields: {
    flexDirection: 'row',
    gap: 20,
  },
  field: {
    flex: 1,
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#20130A',
    fontFamily: 'Epilogue, sans-serif',
  },
  inputDisabled: {
    backgroundColor: '#F5F5F5',
    color: '#999',
    borderColor: '#E8E8E8',
  },
  footer: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  button: {
    backgroundColor: '#F1BE4B',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#F1BE4B',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  buttonHovered: {
    backgroundColor: '#E5AF30',
    transform: [{ translateY: -1 }],
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
})

