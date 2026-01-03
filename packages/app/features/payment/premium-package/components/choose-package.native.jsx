import React, { useState, useEffect } from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Platform } from 'react-native'
import { useRouter } from 'solito/navigation'
// Import useNavigation cho native
let useNavigation = null
if (Platform.OS !== 'web') {
  try {
    const navigationModule = require('@react-navigation/native')
    useNavigation = navigationModule.useNavigation
  } catch (e) {
    // @react-navigation/native không có sẵn trên web
  }
}
import { getVipPackages, createVipPackagePayment } from '../api/api'
import { getCurrentUserId } from '../../../../provider/api/client'
import BigFoot from '../../../../../assets/bigfoot.png'

/**
 * Normalize image source so it works with:
 * - require('...png') / numeric ids
 * - { uri: '...' }
 * - Next/webpack static imports: { src: '...' }
 */
const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) {
    return { uri: src.src }
  }
  if (typeof src === 'string') {
    return { uri: src }
  }
  return src
}

/**
 * Choose Package Component (Native/Mobile)
 * - Optimized layout for mobile screens
 * - Vertical stack layout to prevent column overlap
 * - Title "GIÁ GÓI PREMIUM" at the top
 * - Each package in a card with vertical layout
 */
export const ChoosePackage = ({ onSelectPackage, style }) => {
  const router = useRouter()
  const navigation = useNavigation ? useNavigation() : null
  const [loading, setLoading] = useState(null)
  const [packages, setPackages] = useState([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState(null)

  // Fetch VIP packages from API
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setFetching(true)
        setError(null)
        const response = await getVipPackages()
        
        if (response.isSuccess && response.data) {
          const mappedPackages = response.data
            .filter(pkg => pkg.isActive)
            .map(pkg => {
              const months = pkg.durationDays / 30
              const pricePerMonth = months > 0 ? Math.round(pkg.price / months) : pkg.price
              
              let durationText = ''
              if (pkg.durationDays >= 365) {
                const years = Math.floor(pkg.durationDays / 365)
                durationText = years === 1 ? '1 năm' : `${years} năm`
              } else if (pkg.durationDays >= 30) {
                const months = Math.floor(pkg.durationDays / 30)
                durationText = months === 1 ? '1 tháng' : `${months} tháng`
              } else {
                durationText = `${pkg.durationDays} ngày`
              }

              let badge = null
              if (pkg.packageType === 'Ưu Đãi') {
                badge = { text: 'Ưu Đãi', color: '#FF6B9D' }
              } else if (pkg.packageType === 'Phổ biến') {
                badge = { text: 'Phổ biến', color: '#4ECDC4' }
              } else if (pkg.packageType === 'Tiết kiệm') {
                badge = { text: 'Tiết kiệm', color: '#87CEEB' }
              }

              return {
                id: pkg.id,
                name: pkg.name,
                duration: durationText,
                durationDays: pkg.durationDays,
                totalPrice: pkg.price,
                pricePerMonth: pricePerMonth,
                badge: badge,
                description: pkg.description,
              }
            })
          
          setPackages(mappedPackages)
        } else {
          setError('Không thể tải danh sách gói')
        }
      } catch (err) {
        console.error('[ChoosePackage] Error fetching packages:', err)
        setError('Đã xảy ra lỗi khi tải danh sách gói')
      } finally {
        setFetching(false)
      }
    }

    fetchPackages()
  }, [])

  // Format price with thousand separators
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  const handleBuy = async (packageId) => {
    if (onSelectPackage) {
      onSelectPackage(packageId)
      return
    }

    try {
      setLoading(packageId)
      const userId = getCurrentUserId()
      if (!userId) {
        console.error('User ID not found')
        return
      }

      const response = await createVipPackagePayment(userId, packageId)

      if (response.isSuccess && response.data?.paymentUrl) {
        // Navigate to payment detail page
        if (Platform.OS === 'web') {
          router.push(`/payment-detail?paymentUrl=${encodeURIComponent(response.data.paymentUrl)}&paymentId=${response.data.paymentId || ''}`)
        } else {
          // Trên native, dùng React Navigation
          if (navigation) {
            navigation.navigate('payment-detail', {
              paymentUrl: response.data.paymentUrl,
              paymentId: response.data.paymentId || '',
            })
          }
        }
      } else {
        console.error('Failed to create payment:', response)
      }
    } catch (error) {
      console.error('Error creating payment:', error)
    } finally {
      setLoading(null)
    }
  }

  // Loading state
  if (fetching) {
    return (
      <View style={[styles.container, style, { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }]}>
        <ActivityIndicator size="large" color="#FF6B9D" />
        <Text style={[styles.title, { marginTop: 16, fontSize: 16 }]}>Đang tải danh sách gói...</Text>
      </View>
    )
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, style, { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }]}>
        <Text style={[styles.title, { color: '#d9534f', fontSize: 16 }]}>{error}</Text>
      </View>
    )
  }

  // Empty state
  if (packages.length === 0) {
    return (
      <View style={[styles.container, style, { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }]}>
        <Text style={[styles.title, { fontSize: 16 }]}>Không có gói nào khả dụng</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, style]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>GIÁ GÓI PREMIUM</Text>
        </View>

        {/* Packages list - vertical layout for mobile */}
        <View style={styles.packagesContainer}>
          {packages.map((pkg) => (
            <View key={pkg.id} style={styles.packageCard}>
              {/* Top row: Badge and Duration */}
              <View style={styles.topRow}>
                <View style={styles.badgeContainer}>
                  {pkg.badge ? (
                    <View style={[styles.badge, { backgroundColor: pkg.badge.color }]}>
                      <Text style={styles.badgeText}>{pkg.badge.text}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.duration}>{pkg.duration}</Text>
              </View>

              {/* Middle row: Package Name */}
              <View style={styles.nameRow}>
                <Text style={styles.packageName}>{pkg.name}</Text>
              </View>

              {/* Bottom row: Price and Buy Button */}
              <View style={styles.bottomRow}>
                <View style={styles.priceContainer}>
                  <Text style={styles.totalPrice}>{formatPrice(pkg.totalPrice)} VNĐ</Text>
                  {pkg.durationDays >= 30 && (
                    <Text style={styles.pricePerMonth}>
                      {formatPrice(pkg.pricePerMonth)} VNĐ/tháng
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.buyButton}
                  onPress={() => handleBuy(pkg.id)}
                  disabled={loading === pkg.id}
                >
                  {loading === pkg.id ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buyButtonText}>MUA</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#DC143C',
    fontFamily: 'Lexend, sans-serif',
    textAlign: 'center',
  },
  packagesContainer: {
    gap: 16,
  },
  packageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeContainer: {
    flex: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Epilogue, sans-serif',
  },
  duration: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A8F44',
    fontFamily: 'Lexend, sans-serif',
  },
  nameRow: {
    marginBottom: 16,
  },
  packageName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1C',
    fontFamily: 'Lexend, sans-serif',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1C',
    fontFamily: 'Lexend, sans-serif',
    marginBottom: 4,
  },
  pricePerMonth: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '500',
  },
  buyButton: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B9D',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    minWidth: 80,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    fontFamily: 'Lexend, sans-serif',
    letterSpacing: 0.5,
  },
})

