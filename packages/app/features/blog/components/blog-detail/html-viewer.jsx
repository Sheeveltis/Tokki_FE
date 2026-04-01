import React, { useMemo, useState, useCallback } from 'react'
import { Platform, useWindowDimensions, View, Text } from 'react-native'

let WebView = null
if (Platform.OS !== 'web') {
  try {
    WebView = require('react-native-webview').WebView
    console.log('[HtmlViewer] WebView module loaded')
  } catch (error) {
    console.error('[HtmlViewer] react-native-webview is not installed or not linked:', error)
    WebView = null
  }
}

export function HtmlViewer({ html }) {
  const { width } = useWindowDimensions()
  const [webViewHeight, setWebViewHeight] = useState(200)

  const safeHtml = useMemo(() => {
    if (typeof html !== 'string') return '<p></p>'

    const trimmed = html.trim()
    if (!trimmed) return '<p></p>'

    return trimmed
      .replace(/<o:p>\s*<\/o:p>/gi, '')
      .replace(/<figure[^>]*>/gi, '<div>')
      .replace(/<\/figure>/gi, '</div>')
      .replace(/<figcaption[^>]*>.*?<\/figcaption>/gis, '')
  }, [html])

  const plainText = useMemo(() => {
    if (typeof html !== 'string') return ''
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }, [html])

  const handleMessage = useCallback((event) => {
    console.log('[HtmlViewer] onMessage:', event?.nativeEvent?.data)

    const nextHeight = Number(event?.nativeEvent?.data)
    if (!Number.isFinite(nextHeight) || nextHeight <= 0) return

    setWebViewHeight((prev) => {
      if (Math.abs(prev - nextHeight) < 2) return prev
      return nextHeight
    })
  }, [])

  if (Platform.OS === 'web') {
    return (
      <div
        style={{
          fontSize: '16px',
          lineHeight: '1.6',
          color: '#333',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          maxWidth: '100%',
          overflow: 'hidden',
        }}
        dangerouslySetInnerHTML={{
          __html: `
            <style>
              img {
                max-width: 100% !important;
                height: auto !important;
                border-radius: 8px !important;
                margin: 16px auto !important;
                display: block !important;
              }
              p {
                margin-bottom: 16px;
                line-height: 1.6;
              }
              a {
                color: #cd2122;
                text-decoration: none;
              }
            </style>
            ${safeHtml}
          `,
        }}
      />
    )
  }

  console.log('[HtmlViewer] native render start')
  console.log('[HtmlViewer] html length:', typeof html === 'string' ? html.length : 'not-string')
  console.log('[HtmlViewer] safeHtml length:', safeHtml.length)
  console.log('[HtmlViewer] WebView available:', !!WebView)

  if (!WebView) {
    return (
      <View style={{ paddingVertical: 8 }}>
        <Text style={{ color: 'red', marginBottom: 8 }}>
          WebView unavailable - showing plain text fallback
        </Text>
        <Text style={{ fontSize: 16, lineHeight: 24, color: '#333' }}>
          {plainText}
        </Text>
      </View>
    )
  }

  const htmlDocument = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <style>
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            overflow: hidden;
          }

          body {
            font-size: 16px;
            line-height: 1.6;
            color: #333333;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            word-break: break-word;
            overflow-wrap: break-word;
          }

          * {
            box-sizing: border-box;
          }

          img {
            max-width: 100% !important;
            height: auto !important;
            border-radius: 8px !important;
            margin: 16px auto !important;
            display: block !important;
          }

          p {
            margin: 0 0 16px 0;
          }

          a {
            color: #cd2122;
            text-decoration: none;
          }

          ul, ol {
            padding-left: 20px;
            margin: 0 0 16px 0;
          }

          h1, h2, h3 {
            color: #1a1a1a;
            margin-top: 0;
          }
        </style>
      </head>
      <body>
        <div id="content">
          ${safeHtml}
        </div>

        <script>
          (function () {
            function sendHeight() {
              var body = document.body;
              var html = document.documentElement;
              var content = document.getElementById('content');

              if (!body || !html || !content || !window.ReactNativeWebView) return;

              var height = Math.max(
                body.scrollHeight,
                body.offsetHeight,
                html.clientHeight,
                html.scrollHeight,
                html.offsetHeight,
                content.scrollHeight,
                content.offsetHeight
              );

              window.ReactNativeWebView.postMessage(String(height));
            }

            window.addEventListener('load', function () {
              sendHeight();
              setTimeout(sendHeight, 100);
              setTimeout(sendHeight, 300);
              setTimeout(sendHeight, 800);
            });

            window.addEventListener('resize', sendHeight);

            var images = document.images || [];
            for (var i = 0; i < images.length; i++) {
              if (!images[i].complete) {
                images[i].addEventListener('load', sendHeight);
                images[i].addEventListener('error', sendHeight);
              }
            }

            setTimeout(sendHeight, 50);
          })();
        </script>
      </body>
    </html>
  `

  return (
    <View
      style={{
        width: '100%',
        minHeight: webViewHeight,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
      }}
    >
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlDocument }}
        onMessage={handleMessage}
        onLoadStart={() => console.log('[HtmlViewer] onLoadStart')}
        onLoad={() => console.log('[HtmlViewer] onLoad')}
        onLoadEnd={() => console.log('[HtmlViewer] onLoadEnd')}
        onError={(syntheticEvent) => {
          console.error('[HtmlViewer] onError:', syntheticEvent?.nativeEvent)
        }}
        onHttpError={(syntheticEvent) => {
          console.error('[HtmlViewer] onHttpError:', syntheticEvent?.nativeEvent)
        }}
        startInLoadingState
        scrollEnabled={false}
        nestedScrollEnabled={false}
        showsVerticalScrollIndicator={false}
        javaScriptEnabled
        domStorageEnabled
        automaticallyAdjustContentInsets={false}
        style={{
          width: width - 32,
          height: webViewHeight,
          backgroundColor: '#fff',
        }}
      />
    </View>
  )
}