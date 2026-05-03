import React, { useState, useEffect } from 'react'
import { View, Text, Image, Pressable, StyleSheet, ActivityIndicator, Platform } from 'react-native'
import { useRouter } from 'solito/navigation'
import { CreditCardOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { getVipPackages, createVipPackagePayment } from '../../api/premium-package-api'
import { getCurrentUserId } from '../../../../provider/api/client'

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

const PackageItem = ({ pkg, isSelected, onSelect, loading }) => {
  const [isHovered, setIsHovered] = useState(false)
  const isSpecial = pkg.badge?.text === 'PHỔ BIẾN' || pkg.durationDays === 30

  return (
    <Pressable
      onPress={() => onSelect(pkg.id)}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={[
        styles.packageItem,
        isSelected && styles.selectedPackage,
        (isHovered && !isSelected) && { borderColor: '#FFBCC8' },
        isSelected && { transform: [{ scale: 1.02 }] }
      ]}
    >
      {/* Badge */}
      {pkg.badge && (
        <View style={[styles.badge, isSpecial && { backgroundColor: '#FF4D6D' }, !isSpecial && isSelected && { backgroundColor: '#FF4D6D' }]}>
          <Text style={styles.badgeText}>{pkg.badge.text}</Text>
        </View>
      )}

      {/* Icon */}
      <View style={[styles.packageIcon, isSelected && { backgroundColor: '#FF4D6D' }]}>
        {Platform.OS === 'web' ? (
          <CreditCardOutlined style={{ color: isSelected ? '#fff' : '#A0AEC0', fontSize: 20 }} />
        ) : (
          <Text style={{ color: isSelected ? '#fff' : '#A0AEC0', fontSize: 18 }}>💳</Text>
        )}
      </View>

      {/* Info */}
      <View style={styles.packageInfo}>
        <Text style={styles.packageName}>{pkg.name}</Text>
        <Text style={styles.packageDuration}>THỜI HẠN: {pkg.duration}</Text>
      </View>

      {/* Price */}
      <View style={styles.packagePrice}>
        <Text style={styles.totalPrice}>
          {new Intl.NumberFormat('vi-VN').format(pkg.totalPrice)} <Text style={styles.currency}>VNĐ</Text>
        </Text>
        <Text style={styles.pricePerMonth}>
          ~{new Intl.NumberFormat('vi-VN').format(pkg.pricePerDay)} VNĐ / ngày
        </Text>
      </View>

      {/* Buy Button */}
      <View style={[
        styles.buyButton,
        isSelected ? styles.specialBuyButton : { backgroundColor: '#E8EEF4' }
      ]}>
        <Text style={[
          styles.buyButtonText,
          isSelected ? { color: '#fff' } : { color: '#A0AEC0' }
        ]}>
          {loading === pkg.id ? <ActivityIndicator size="small" color="#fff" /> : (isSelected ? 'CHỌN' : 'MUA')}
        </Text>
      </View>
    </Pressable>
  )
}

export const ChoosePackage = () => {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(null)
  const [packages, setPackages] = useState([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await getVipPackages()
        if (response.isSuccess && response.data) {
          const activePackages = response.data.filter(pkg => pkg.isActive)

          // Find the base price (30 days) to calculate discounts
          const basePkg = activePackages.find(p => p.durationDays === 30)
          const basePricePerMonth = basePkg ? basePkg.price : null

          const mapped = activePackages.map(pkg => {
            const price = Number(pkg.price) || 0
            const durationDays = Number(pkg.durationDays) || 0

            const months = durationDays / 30
            const pricePerMonth = months > 0 ? Math.round(price / months) : price
            const pricePerDay = durationDays > 0 ? Math.round(price / durationDays) : price

            let badge = null
            if (durationDays === 30) {
              badge = { text: 'PHỔ BIẾN' }
            } else if (basePricePerMonth && months > 1) {
              // Calculate discount compared to base price
              const discount = Math.round((1 - (pricePerMonth / basePricePerMonth)) * 100)
              if (discount > 0) {
                badge = { text: `TIẾT KIỆM ${discount}%` }
              }
            }

            return {
              id: pkg.id,
              name: pkg.name,
              durationDays: durationDays,
              duration: durationDays >= 30 ? `${Math.floor(durationDays / 30)} Tháng` : `${durationDays} Ngày`,
              totalPrice: price,
              pricePerMonth: pricePerMonth,
              pricePerDay: pricePerDay,
              badge: badge,
            }
          })
          setPackages(mapped)
          if (mapped.length > 0) setSelectedId(mapped[0].id)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setFetching(false)
      }
    }
    fetchPackages()
  }, [])

  const handleContinue = async () => {
    if (!selectedId) return
    const pkg = packages.find(p => p.id === selectedId)

    try {
      setLoading(selectedId)
      const userId = getCurrentUserId()
      const response = await createVipPackagePayment(userId, selectedId)
      if (response.isSuccess && response.data?.paymentUrl) {
        router.push(`/payment-detail?paymentUrl=${encodeURIComponent(response.data.paymentUrl)}&paymentId=${response.data.paymentId || ''}`)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(null)
    }
  }

  if (fetching) return <ActivityIndicator size="large" color="#FFB703" />

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chọn gói đăng ký</Text>
        <View style={styles.securePayment}>
          {Platform.OS === 'web' ? (
            <SafetyCertificateOutlined style={{ color: '#00C48C', fontSize: 14, marginRight: 6 }} />
          ) : (
            <Text style={{ marginRight: 4 }}>🛡️</Text>
          )}
          <Text style={styles.secureText}>THANH TOÁN AN TOÀN</Text>
        </View>
      </View>

      <View style={styles.list}>
        {packages.map(pkg => (
          <PackageItem
            key={pkg.id}
            pkg={pkg}
            isSelected={selectedId === pkg.id}
            onSelect={setSelectedId}
            loading={loading}
          />
        ))}
      </View>

      <Pressable
        onPress={handleContinue}
        style={({ hovered }) => [
          styles.continueButton,
          hovered && { backgroundColor: '#FFCA3D' }
        ]}
      >
        <Text style={styles.continueText}>TIẾP TỤC THANH TOÁN  →</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 40,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Lexend, sans-serif',
  },
  securePayment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8EBF1',
  },
  secureText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A0AEC0',
    fontFamily: 'Lexend, sans-serif',
  },
  list: {
    gap: 16,
    marginBottom: 40,
  },
  packageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#F0F0F0',
    position: 'relative',
    transition: 'all 0.2s ease',
  },
  specialPackage: {
    borderColor: '#FF4D6D',
  },
  selectedPackage: {
    borderColor: '#FF4D6D',
    backgroundColor: '#FFF0F3',
  },
  badge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#A0AEC0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    fontFamily: 'Lexend, sans-serif',
  },
  packageIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8F9FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'Lexend, sans-serif',
    marginBottom: 2,
  },
  packageDuration: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A0AEC0',
    fontFamily: 'Lexend, sans-serif',
  },
  packagePrice: {
    alignItems: 'flex-end',
    marginRight: 20,
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Lexend, sans-serif',
  },
  currency: {
    fontSize: 12,
    color: '#A0AEC0',
  },
  pricePerMonth: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF4D6D',
    fontFamily: 'Lexend, sans-serif',
  },
  buyButton: {
    width: 80,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialBuyButton: {
    backgroundColor: '#FF4D6D',
    shadowColor: '#FF4D6D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buyButtonText: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: 'Lexend, sans-serif',
  },
  continueButton: {
    height: 70,
    backgroundColor: '#FFB703',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFB703',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  continueText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#7B4D00',
    fontFamily: 'Lexend, sans-serif',
    letterSpacing: 1,
  },
})
