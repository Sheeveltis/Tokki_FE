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
      <Text style={styles.title}>Thông tin cơ bản</Text>

      <View style={styles.rowFields}>
        <View style={styles.field}>
          <TextInput
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#8F8F8F"
          />
        </View>

        <View style={styles.field}>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#8F8F8F"
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View style={styles.rowFields}>
        <View style={styles.field}>
          <TextInput
            value={initialInfo.email || ''}
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
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#8F8F8F"
          />
        </View>
      </View>

      <Pressable onPress={handleSubmit} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
        <Text style={styles.buttonText}>Cập Nhật</Text>
      </Pressable>
    </View>
  )
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
  rowFields: {
    flexDirection: 'row',
    gap: 10,
  },
  field: {
    flex: 1,
  },
  singleField: {
    width: '100%',
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
  },
  button: {
    marginTop: 6,
    alignSelf: 'flex-start',
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

