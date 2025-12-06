
import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { BlogSidebar } from './blog-sidebar'

export function BlogLayout({ children, relatedPosts }) {
  return (
    <ScrollView style={styles.container}>
      
      <View style={styles.wrapper}>
        
        <View style={styles.content}>
           {children}
        </View>

        <View style={styles.divider} />

        <View style={styles.sidebar}>
           <BlogSidebar relatedPosts={relatedPosts} />
        </View>

      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  wrapper: { padding: 16 },
  content: { marginBottom: 30 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  sidebar: { paddingBottom: 50 } 
})