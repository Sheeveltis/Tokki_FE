import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { getHomeData } from '../../api/homepage-logic'
import { Loading } from '../../../../../components/Loading.jsx'
import { colors } from '../../../../color.js'
import BigFootImage from '../../../../../assets/bigfoot.png'
import SmallFootImage from '../../../../../assets/smallfoot.png'

/**
 * Normalize image source so it works with:
 * - require('...png') / numeric ids
 * - { uri: '...' }
 * - Next/webpack static imports: { src: '...' }
 */
const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

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

  // Render content dựa trên state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading
          size={48}
          color="#5E794C"
          shadowColor="#5E794C50"
          text="Đang tải dữ liệu..."
          style={styles.loading}
        />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
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

      {/* Marketing Content Section */}
      {data.marketingContent && (
        <View style={styles.marketingSection}>
          {/* Background Images */}
          <Image source={normalizeImageSource(BigFootImage)} style={styles.bigFootBackground} resizeMode="contain" />
          <Image source={normalizeImageSource(SmallFootImage)} style={styles.smallFootBackground1} resizeMode="contain" />          
          {/* Content Layer */}
          <View style={styles.marketingContentLayer}>
            <Text style={styles.marketingHeadline}>{data.marketingContent.headline}</Text>
            <Text style={styles.marketingIntro}>{data.marketingContent.intro}</Text>
            <Text style={styles.marketingTimeCommitment}>{data.marketingContent.timeCommitment}</Text>
            {data.marketingContent.benefits && data.marketingContent.benefits.length > 0 && (
              <View style={styles.benefitsList}>
                {data.marketingContent.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitRow}>
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            )}
            <Text style={styles.marketingClosing}>{data.marketingContent.closing}</Text>
          </View>
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
  loadingContainer: {
    flex: 1,
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
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
  // Marketing Section
  marketingSection: {
    marginTop: 32,
    padding: 24,
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFE066',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 400,
  },
  // Background Images
  bigFootBackground: {
    position: 'absolute',
    top: -30,
    right: 670,
    width: 150,
    height: 150,
    opacity: 0.5,
    zIndex: 0,
    tintColor: colors.LightGreen,
  },
  smallFootBackground1: {
    position: 'absolute',
    bottom: 70,
    left: 670,
    width: 150,
    height: 150,
    opacity: 0.4,
    zIndex: 0,
  },
  // Content Layer
  marketingContentLayer: {
    position: 'relative',
    zIndex: 1,
    gap: 16,
  },
  marketingHeadline: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Lexend, sans-serif',
    color: colors.Mustard,
    textAlign: 'center',
    marginBottom: 8,
  },
  marketingIntro: {
    fontSize: 17,
    lineHeight: 26,
    color: colors.neutralDark,
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  marketingTimeCommitment: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Epilogue, sans-serif',
    color: colors.DarkPink,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  benefitsList: {
    marginTop: 12,
    marginBottom: 12,
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  benefitText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: colors.neutralDark,
    fontFamily: 'Epilogue, sans-serif',
  },
  marketingClosing: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 26,
    color: colors.DarkPink,
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
})




