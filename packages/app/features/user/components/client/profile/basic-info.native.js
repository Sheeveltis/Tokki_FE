import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'

export function BasicInfo({ initialInfo, onEditPress }) {
  const info = initialInfo || {}

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Thông tin cá nhân</Text>
        <TouchableOpacity 
          style={styles.editBtn} 
          onPress={onEditPress}
          activeOpacity={0.7}
        >
          <Text style={styles.editIcon}>✏️</Text>
          <Text style={styles.editBtnText}>Sửa</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <View style={styles.iconCircle}>
            <Text style={styles.emoji}>👤</Text>
          </View>
          <View style={styles.infoTextGroup}>
            <Text style={styles.infoLabel}>Họ và tên</Text>
            <Text style={styles.infoValue}>{info.username || 'Chưa cập nhật'}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <View style={styles.iconCircle}>
            <Text style={styles.emoji}>📞</Text>
          </View>
          <View style={styles.infoTextGroup}>
            <Text style={styles.infoLabel}>Số điện thoại</Text>
            <Text style={styles.infoValue}>{info.phoneNumber || 'Chưa cập nhật'}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <View style={styles.iconCircle}>
            <Text style={styles.emoji}>✉️</Text>
          </View>
          <View style={styles.infoTextGroup}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{info.email || 'Chưa cập nhật'}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <View style={styles.iconCircle}>
            <Text style={styles.emoji}>🎂</Text>
          </View>
          <View style={styles.infoTextGroup}>
            <Text style={styles.infoLabel}>Ngày sinh</Text>
            <Text style={styles.infoValue}>{info.dateOfBirth || 'Chưa cập nhật'}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#20130A',
    fontFamily: 'Epilogue, sans-serif',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF9F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(241, 190, 75, 0.3)',
  },
  editIcon: {
    fontSize: 14,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F1BE4B',
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 18,
  },
  infoTextGroup: {
    gap: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 15,
    color: '#20130A',
    fontWeight: '700',
  },
})
