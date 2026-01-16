import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Platform, TouchableOpacity, Text } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { UserProfileMenu } from '../../components/mobile/menu-mobile/user-profile-menu.native'
import { UserInformation } from '../../components/client/profile/user-information'
import { PaymentHistoryContent } from '../../components/client/payment-history/payment-history-content'
import { getPaymentHistory } from '../../api/get-payment-history'
import { NavbarMobile } from '../../../../../components/navbar-mobile'

/**
 * Menu Mobile Screen (Native)
 * - Main screen for user profile menu
 * - Shows different content based on selected tab
 */
export function MenuMobileScreen() {
  const navigation = useNavigation()
  const [activeTab, setActiveTab] = useState('menu') // 'menu', 'profile', 'history'
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handlePersonalInfo = () => {
    setActiveTab('profile')
  }

  const handleSecurity = () => {
    setActiveTab('profile')
  }

  const handlePaymentHistory = async () => {
    setActiveTab('history')
    try {
      setLoading(true)
      setError(null)
      const data = await getPaymentHistory()
      setPayments(data || [])
    } catch (err) {
      console.error('[MenuMobileScreen] Error fetching payment history:', err)
      setError(err.message || 'Không thể tải lịch sử thanh toán')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
      } else {
        await AsyncStorage.removeItem('token')
        await AsyncStorage.removeItem('userId')
      }
      navigation.navigate('login')
    } catch (error) {
      console.error('[MenuMobileScreen] Error during logout:', error)
      navigation.navigate('login')
    }
  }

  const handleBack = () => {
    if (activeTab === 'profile' || activeTab === 'history') {
      setActiveTab('menu')
    } else {
      navigation.goBack()
    }
  }

  return (
    <View style={styles.container}>
      {/* Back button for profile and history tabs */}
      {(activeTab === 'profile' || activeTab === 'history') && (
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Quay lại</Text>
        </TouchableOpacity>
      )}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'menu' && (
          <UserProfileMenu
            onPersonalInfo={handlePersonalInfo}
            onSecurity={handleSecurity}
            onPaymentHistory={handlePaymentHistory}
            onLogout={handleLogout}
          />
        )}

        {activeTab === 'profile' && (
          <View style={styles.contentContainer}>
            <UserInformation />
          </View>
        )}

        {activeTab === 'history' && (
          <View style={styles.contentContainer}>
            <PaymentHistoryContent payments={payments} loading={loading} error={error} />
          </View>
        )}
      </ScrollView>

      {/* NavbarMobile */}
      {Platform.OS !== 'web' && <NavbarMobile />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0DD',
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Padding for navbar
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  backButton: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#DC143C',
    fontWeight: '600',
    fontFamily: 'Epilogue, sans-serif',
  },
})

