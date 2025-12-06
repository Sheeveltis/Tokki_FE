'use client'

import React from 'react'
import { View, Text } from 'react-native'
import { Navbar } from 'components/navbar'
import { Footer } from 'components/footer'

export default function TestPage() {
  console.log('TestPage rendered')
  
  return (
    <View style={{ flex: 1, width: '100%', backgroundColor: '#f0f0f0' }}>
      <Text style={{ padding: 20, backgroundColor: 'yellow' }}>
        TEST: Nếu bạn thấy text này, page đang render
      </Text>
      
      <Text style={{ padding: 20, backgroundColor: 'lightblue' }}>
        Navbar bên dưới:
      </Text>
      <Navbar />
      
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
          Nội dung chính
        </Text>
      </View>
      
      <Text style={{ padding: 20, backgroundColor: 'lightgreen' }}>
        Footer bên dưới:
      </Text>
      <Footer style={{}} />
    </View>
  )
}

