import React, { useState } from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'solito/navigation'
import { createPayment } from '../../payment-package/api/api'
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
  
  const packages = [
    {
      id: '1-month',
      duration: '1 tháng',
      totalPrice: '10.000',
      pricePerMonth: '50.000',
      badge: null,
    },
    {
      id: '3-month',
      duration: '3 tháng',
      totalPrice: '125.000',
      pricePerMonth: '45.000',
      badge: { text: 'Phổ biến', color: '#4ECDC4' }, // Teal color
    },
    {
      id: '6-month',
      duration: '6 tháng',
      totalPrice: '210.000',
      pricePerMonth: '35.000',
      badge: { text: 'Tiết kiệm', color: '#87CEEB' }, // Light blue
    },
  ]

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
        description: 'test',
        userId: '1',
      })

      if (response.isSuccess && response.data?.paymentId) {
        // Navigate to payment detail page with paymentId
        router.push(`/payment/detail?paymentId=${response.data.paymentId}`)
      } else {
        console.error('Failed to create payment:', response)
      }
    } catch (error) {
      console.error('Error creating payment:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <View style={[styles.outerContainer, style]}>
      {/* Transparent container */}
      <View style={styles.container}>
        {/* Title with icon */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Chọn gói</Text>
          <Image
            source={normalizeImageSource(BigFoot)}
            style={styles.icon}
          />
        </View>

        {/* Packages list - each package in a row with 4 columns */}
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

              {/* Column 2: Duration */}
              <View style={styles.column2}>
                <Text style={styles.duration}>{pkg.duration}</Text>
              </View>

              {/* Column 3: Prices */}
              <View style={styles.column3}>
                <Text style={styles.totalPrice}>{pkg.totalPrice} VNĐ</Text>
                <Text style={styles.pricePerMonth}>
                  {pkg.pricePerMonth}VNĐ/tháng
                </Text>
              </View>

              {/* Column 4: Buy Button */}
              <View style={styles.column4}>
                <TouchableOpacity
                  style={styles.buyButton}
                  onPress={() => handleBuy(pkg.id, parseInt(pkg.totalPrice.replace(/\./g, '')))}
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
    </View>
  )
}

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
  },
  container: {
    width: '100%',
    backgroundColor: 'transparent',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#5E794C', // Green color
    fontFamily: 'Lexend, sans-serif',
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  packagesContainer: {
    flexDirection: 'column',
    gap: 16,
  },
  packageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  column1: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  column2: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  column3: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  column4: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Epilogue, sans-serif',
  },
  emptyBadge: {
    width: 80,
    height: 24,
  },
  duration: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    fontFamily: 'Lexend, sans-serif',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    fontFamily: 'Lexend, sans-serif',
    marginBottom: 4,
  },
  pricePerMonth: {
    fontSize: 14,
    color: '#222',
    fontFamily: 'Epilogue, sans-serif',
  },
  buyButton: {
    backgroundColor: '#FF6B9D', // Bright pink/red
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontFamily: 'Lexend, sans-serif',
  },
})

