import React, { useState, useEffect } from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native'
import { useRouter } from 'solito/navigation'
import { createPayment } from '../../payment-package/api/api'
import { getVipPackages } from '../api/api'
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
 * Choose Package Component
 * - Title "Chọn gói" with bigfoot icon
 * - Three pricing options horizontally
 * - Each option has duration, total price, price per month, and BUY button
 *
 * @param {{
 *   onSelectPackage?: (packageId: string) => void;
 *   style?: any;
 * }} props
 */
export const ChoosePackage = ({ onSelectPackage, style }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(null) // Track which package is loading
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
          // Map API data to component format
          const mappedPackages = response.data
            .filter(pkg => pkg.isActive) // Only show active packages
            .map(pkg => {
              // Calculate price per month
              const months = pkg.durationDays / 30
              const pricePerMonth = months > 0 ? Math.round(pkg.price / months) : pkg.price
              
              // Format duration text
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

              // Determine badge based on packageType
              let badge = null
              if (pkg.packageType === 'Ưu Đãi') {
                badge = { text: 'Ưu Đãi', color: '#FF6B9D' } // Pink
              } else if (pkg.packageType === 'Phổ biến') {
                badge = { text: 'Phổ biến', color: '#4ECDC4' } // Teal
              } else if (pkg.packageType === 'Tiết kiệm') {
                badge = { text: 'Tiết kiệm', color: '#87CEEB' } // Light blue
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

  const handleBuy = async (packageId, amount) => {
    if (onSelectPackage) {
      onSelectPackage(packageId, amount)
      return
    }

    try {
      setLoading(packageId)
      
      // Call createPayment API
      const response = await createPayment({
        amount: amount,
        description: 'Premium package purchase',
        userId: '1',
      })

      if (response.isSuccess && response.data?.paymentId) {
        // Navigate to payment detail page with paymentId
        router.push(`/payment-detail?paymentId=${response.data.paymentId}`)
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
      <View style={[styles.outerContainer, style, { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }]}>
        <ActivityIndicator size="large" color="#FF6B9D" />
        <Text style={[styles.title, { marginTop: 16, fontSize: 16 }]}>Đang tải danh sách gói...</Text>
      </View>
    )
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.outerContainer, style, { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }]}>
        <Text style={[styles.title, { color: '#d9534f', fontSize: 16 }]}>{error}</Text>
      </View>
    )
  }

  // Empty state
  if (packages.length === 0) {
    return (
      <View style={[styles.outerContainer, style, { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }]}>
        <Text style={[styles.title, { fontSize: 16 }]}>Không có gói nào khả dụng</Text>
      </View>
    )
  }

  return (
    <View style={[styles.outerContainer, style]}>
      {/* Transparent container */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {/* Title with icon */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Chọn gói</Text>
            <Image
              source={normalizeImageSource(BigFoot)}
              style={styles.icon}
            />
          </View>

          {/* Packages list - each package in a row with 5 columns */}
          <View style={styles.packagesContainer}>
            {packages.map((pkg) => (
              <View key={pkg.id} style={styles.packageRow}>
                {/* Column 1: Badge */}
                <View style={styles.column1}>
                  {pkg.badge ? (
                    <View style={[styles.badge, { backgroundColor: pkg.badge.color }]}>
                      <Text style={styles.badgeText}>{pkg.badge.text}</Text>
                    </View>
                  ) : (
                    <View style={styles.emptyBadge} />
                  )}
                </View>

                {/* Column 2: Package Name */}
                <View style={styles.column2}>
                  <Text style={styles.packageName}>{pkg.name}</Text>
                </View>

                {/* Column 3: Duration */}
                <View style={styles.column3}>
                  <Text style={styles.duration}>{pkg.duration}</Text>
                </View>

                {/* Column 4: Prices */}
                <View style={styles.column4}>
                  <Text style={styles.totalPrice}>{formatPrice(pkg.totalPrice)} VNĐ</Text>
                  {pkg.durationDays >= 30 && (
                    <Text style={styles.pricePerMonth}>
                      {formatPrice(pkg.pricePerMonth)} VNĐ/tháng
                    </Text>
                  )}
                </View>

                {/* Column 5: Buy Button */}
                <View style={styles.column5}>
                  <TouchableOpacity
                    style={styles.buyButton}
                    onPress={() => handleBuy(pkg.id, pkg.totalPrice)}
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
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 24,
  },
  container: {
    width: '100%',
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    gap: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#5E794C',
    fontFamily: 'Lexend, sans-serif',
  },
  icon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  packagesContainer: {
    flexDirection: 'column',
    gap: 20,
  },
  packageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginBottom: 4,
  },
  column1: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  column2: {
    flex: 1.5,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 4,
  },
  column3: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 15,
  },
  column4: {
    flex: 1.8,
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    paddingRight: 30,
  },
  column5: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  packageName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1C1C',
    fontFamily: 'Lexend, sans-serif',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 18,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: 0.5,
  },
  emptyBadge: {
    width: 80,
    height: 24,
  },
  duration: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A8F44',
    fontFamily: 'Lexend, sans-serif',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1C',
    fontFamily: 'Lexend, sans-serif',
    marginBottom: 2,
  },
  pricePerMonth: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '500',
  },
  buyButton: {
    backgroundColor: '#FF6B9D', // Bright pink/red matching premium style
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B9D',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    minWidth: 100,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
    fontFamily: 'Lexend, sans-serif',
    letterSpacing: 1,
  },
})

