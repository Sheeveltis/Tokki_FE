import React from 'react'
import { Platform, useWindowDimensions } from 'react-native'
import { processBlogContent } from '../../utils/html-processor'

let RenderHtml
if (Platform.OS !== 'web') {
  RenderHtml = require('react-native-render-html').default
}

export function HtmlViewer({ html }) {
  const { width } = useWindowDimensions()

  const contentWidth = width > 768 ? width * 0.6 : width - 32

  // Xử lý HTML để thống nhất image size
  const processedHtml = processBlogContent(html)

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
        dangerouslySetInnerHTML={{ 
          __html: `
            <style>
              .article__body img,
              img {
                max-width: 100% !important;
                max-height: 500px !important;
                width: auto !important;
                height: auto !important;
                object-fit: contain !important;
                border-radius: 8px !important;
                margin: 16px auto !important;
                display: block !important;
              }
              .article__body p {
                margin-bottom: 16px;
                line-height: 1.6;
              }
              .article__body strong {
                font-weight: 600;
              }
            </style>
            ${processedHtml}
          `
        }} 
      />
    )
  }

  if (RenderHtml) {
    return (
      <RenderHtml
        contentWidth={contentWidth}
        source={{ html: processedHtml }}
        tagsStyles={tagsStyles}
      />
    )
  }

  return null
}

const tagsStyles = {
  p: { fontSize: 16, lineHeight: 24, marginBottom: 16, color: '#333' },
  h1: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  h2: { fontSize: 22, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#0000ff' },
  h3: { fontSize: 18, fontWeight: 'bold', color: '#0000ff', marginTop: 10 },
  img: { 
    maxWidth: '100%', 
    maxHeight: 500, 
    width: 'auto',
    height: 'auto',
    marginTop: 16, 
    marginBottom: 16,
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: 8,
    alignSelf: 'center',
  },
  ul: { marginBottom: 10 },
  li: { fontSize: 16, marginBottom: 5 }
}