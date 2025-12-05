import React from 'react'
import { View, Text } from 'react-native'

// Placeholder layout for native; extend as needed for mobile.
export function AdminLayoutNative({ children }) {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
        Admin Panel (Mobile)
      </Text>
      {children}
    </View>
  )
}

export default AdminLayoutNative

