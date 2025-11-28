import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { HtmlViewer } from './html-viewer' 

export function BlogMainContent({ data }) {
  return (
    <View>
      <View style={styles.badge}><Text style={styles.badgeText}>{data.category}</Text></View>
      <Text style={styles.title}>{data.title}</Text>
      <View style={styles.meta}>
        <Text>📅 {data.date} • 👁️ {data.views}</Text>
      </View>

      <Image 
        source={{ uri: data.thumbnail }} 
        style={styles.image} 
        resizeMode="cover"
      />

      <HtmlViewer html={data.content} />
      
    </View>
  )
}

const styles = StyleSheet.create({
  badge: { backgroundColor: 'blue', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginBottom: 10 },
  badgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 10, lineHeight: 34 },
  meta: { marginBottom: 15, opacity: 0.6 },
  image: { width: '100%', height: 250, borderRadius: 10, marginBottom: 20 },
})