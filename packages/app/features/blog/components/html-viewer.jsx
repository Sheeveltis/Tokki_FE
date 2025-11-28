import React from 'react'
import { Platform, useWindowDimensions } from 'react-native'

let RenderHtml
if (Platform.OS !== 'web') {
  RenderHtml = require('react-native-render-html').default
}

export function HtmlViewer({ html }) {
  const { width } = useWindowDimensions()

  const contentWidth = width > 768 ? width * 0.6 : width - 32

  if (Platform.OS === 'web') {
    return (
      <div 
        style={{ 
          fontSize: '16px', 
          lineHeight: '1.6', 
          color: '#333',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          maxWidth: '100%',
          overflow: 'hidden'
        }}
        dangerouslySetInnerHTML={{ __html: html }} 
      />
    )
  }

  if (RenderHtml) {
    return (
      <RenderHtml
        contentWidth={contentWidth}
        source={{ html: html }}
        tagsStyles={tagsStyles}
      />
    )
  }

  return null
}

const tagsStyles = {
  p: { fontSize: 16, lineHeight: 24, marginBottom: 10, color: '#333' },
  h1: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  h2: { fontSize: 22, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#0000ff' },
  h3: { fontSize: 18, fontWeight: 'bold', color: '#0000ff', marginTop: 10 },
  img: { marginTop: 10, marginBottom: 10, borderRadius: 8 },
  ul: { marginBottom: 10 },
  li: { fontSize: 16, marginBottom: 5 }
}