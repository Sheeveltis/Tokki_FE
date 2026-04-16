import { EditOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons'
import { Pressable, StyleSheet, Text, View, Platform, TouchableOpacity } from 'react-native'

export function BasicInfo({ initialInfo, onEditPress }) {
  const info = initialInfo || {}

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Thông tin cá nhân</Text>
        <TouchableOpacity 
          style={styles.editBtn} 
          onPress={onEditPress}
          activeOpacity={0.7}
        >
          <EditOutlined style={{ fontSize: 18, color: '#F1BE4B' }} />
          <Text style={styles.editBtnText}>Chỉnh sửa</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <View style={styles.iconCircle}>
            <UserOutlined style={{ fontSize: 16, color: '#F1BE4B' }} />
          </View>
          <View style={styles.infoTextGroup}>
            <Text style={styles.infoLabel}>Họ và tên</Text>
            <Text style={styles.infoValue}>{info.username || 'Chưa cập nhật'}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <View style={styles.iconCircle}>
            <PhoneOutlined style={{ fontSize: 16, color: '#F1BE4B' }} />
          </View>
          <View style={styles.infoTextGroup}>
            <Text style={styles.infoLabel}>Số điện thoại</Text>
            <Text style={styles.infoValue}>{info.phone || 'Chưa cập nhật'}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <View style={styles.iconCircle}>
            <MailOutlined style={{ fontSize: 16, color: '#F1BE4B' }} />
          </View>
          <View style={styles.infoTextGroup}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{info.email || 'Chưa cập nhật'}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <View style={styles.iconCircle}>
            <CalendarOutlined style={{ fontSize: 16, color: '#F1BE4B' }} />
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    height: '100%',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    gap: 6,
    backgroundColor: '#FFF9F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(241, 190, 75, 0.3)',
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F1BE4B',
    fontFamily: 'Epilogue, sans-serif',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    width: '45%',
    minWidth: 200,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF9F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextGroup: {
    gap: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    fontFamily: 'Epilogue, sans-serif',
  },
  infoValue: {
    fontSize: 15,
    color: '#20130A',
    fontWeight: '700',
    fontFamily: 'Epilogue, sans-serif',
  },
})

