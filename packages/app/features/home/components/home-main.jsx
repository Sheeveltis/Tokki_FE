import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { getHomeData } from '../api'

/**
 * HomeMain: Component chứa logic và giao diện chính của trang Home
 * 
 * Nguyên tắc: 
 * - Xử lý hiển thị giao diện chi tiết
 * - Quản lý state cục bộ (loading, error, data)
 * - Gọi các hàm xử lý dữ liệu từ api/index.js
 * 
 * @param {{
 *   onItemClick?: (item: any) => void
 * }} props
 */
export function HomeMain({ onItemClick }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await getHomeData()
        setData(result)
      } catch (err) {
        console.error(err)
        setError(err.message || 'Không thể tải dữ liệu trang chủ.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#5E794C" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Lỗi: {error}</Text>
      </View>
    )
  }

  if (!data) {
    return null
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{data.title || 'Trang Chủ'}</Text>
      <Text style={styles.subtitle}>{data.subtitle || 'Chào mừng bạn đến với Tokki'}</Text>

      {/* Nội dung chính - có thể mở rộng thêm */}
      {data.content && (
        <View style={styles.content}>
          <Text style={styles.contentText}>{data.content}</Text>
        </View>
      )}

      {/* Danh sách items nếu có */}
      {data.items && data.items.length > 0 && (
        <View style={styles.itemsContainer}>
          {data.items.map((item, index) => (
            <View key={index} style={styles.item}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              {item.description && (
                <Text style={styles.itemDescription}>{item.description}</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Lexend, sans-serif',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 16,
  },
  content: {
    marginTop: 16,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    fontFamily: 'Epilogue, sans-serif',
  },
  itemsContainer: {
    marginTop: 24,
    gap: 16,
  },
  item: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    gap: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Lexend, sans-serif',
    color: '#000',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  errorText: {
    color: '#E53935',
    fontSize: 16,
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
})

