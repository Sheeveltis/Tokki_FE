import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

const DEFAULT_INFO = {
  lastName: 'Quý',
}

export function BasicInfo({ initialInfo = DEFAULT_INFO, onSubmit }) {
  const [lastName, setLastName] = useState(initialInfo.lastName)

  const handleSubmit = () => {
    if (onSubmit) onSubmit({ firstName: '', lastName })
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Thông tin cơ bản</Text>

      <View style={styles.singleField}>
        <TextInput
          value={lastName}
          onChangeText={setLastName}
          style={styles.input}
          placeholder="Tên"
          placeholderTextColor="#8F8F8F"
        />
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
    gap: 22,
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
    top: -2,
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


