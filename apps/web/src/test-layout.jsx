// File test để kiểm tra layout nào đang được load
import React from 'react'
import { Platform, View, Text, StyleSheet } from 'react-native'
import { AuthLayout as AuthLayoutWeb } from '@tokki/app/features/authentication/components/auth-layout.web'
import { AuthLayout as AuthLayoutNative } from '@tokki/app/features/authentication/components/auth-layout.native'
import { AuthLayout } from '@tokki/app/features/authentication/components/auth-layout'

export function TestLayout() {
  const platform = Platform.OS
  const webLayoutName = AuthLayoutWeb?.name || 'Unknown'
  const nativeLayoutName = AuthLayoutNative?.name || 'Unknown'
  const actualLayoutName = AuthLayout?.name || 'Unknown'

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Layout Debug Info</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.label}>Platform.OS:</Text>
        <Text style={styles.value}>{platform}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Web Layout Name:</Text>
        <Text style={styles.value}>{webLayoutName}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Native Layout Name:</Text>
        <Text style={styles.value}>{nativeLayoutName}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Actual Layout (from index):</Text>
        <Text style={styles.value}>{actualLayoutName}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Layouts are same?</Text>
        <Text style={styles.value}>
          {AuthLayout === AuthLayoutWeb ? '✅ Using WEB' : AuthLayout === AuthLayoutNative ? '❌ Using NATIVE' : '❓ Unknown'}
        </Text>
      </View>

      <View style={styles.testBox}>
        <Text style={styles.testTitle}>Test Render:</Text>
        <AuthLayout
          hero={<View style={styles.testHero}><Text>HERO (should be left side on web)</Text></View>}
          panel={<View style={styles.testPanel}><Text>PANEL (should be right side on web)</Text></View>}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  infoBox: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'monospace',
  },
  testBox: {
    marginTop: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  testTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#007AFF',
  },
  testHero: {
    backgroundColor: '#FFE5E5',
    padding: 20,
    borderRadius: 8,
  },
  testPanel: {
    backgroundColor: '#E5F3FF',
    padding: 20,
    borderRadius: 8,
  },
})

