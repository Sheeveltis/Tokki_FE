import React, { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  Image, 
  ActivityIndicator,
  Platform,
  Dimensions
} from 'react-native'
import { TrophyFilled, CloseOutlined } from '@ant-design/icons'
import { getMyTitles, updateCurrentTitle } from '../../../api/profile'
import { showAdminSuccess } from '../../../../../../components/HelperAdmin'

/**
 * UserTitlesModal: Modal hiển thị danh sách tất cả danh hiệu người dùng đã đạt được
 * @param {Object} props
 * @param {boolean} props.visible - Trạng thái hiển thị modal
 * @param {() => void} props.onClose - Callback khi đóng modal
 */
export const UserTitlesModal = ({ visible, onClose, onUserUpdate }) => {
  const [titles, setTitles] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    if (visible) {
      loadTitles(1)
    }
  }, [visible])

  const loadTitles = async (pageNumber) => {
    try {
      setLoading(true)
      const data = await getMyTitles(pageNumber, 100) // Lấy nhiều nhất có thể để xem cho sướng
      if (data && data.items) {
        setTitles(data.items)
        setHasNextPage(data.hasNextPage)
        setTotalCount(data.totalCount)
      }
    } catch (error) {
      console.error('Error loading titles:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa rõ'
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handleSelectTitle = async (titleId) => {
    try {
      setLoading(true)
      await updateCurrentTitle(titleId)
      showAdminSuccess('Đã đổi danh hiệu thành công!')
      onClose()
      if (onUserUpdate) onUserUpdate()
    } catch (error) {
      console.error('Error updating title:', error)
      alert(error.message || 'Không thể đổi danh hiệu')
    } finally {
      setLoading(false)
    }
  }

  const renderTitleItem = ({ item }) => (
    <View style={styles.titleCard}>
      <View style={[styles.iconWrapper, { backgroundColor: `${item.colorHex}20` || '#FDF2F2' }]}>
        {item.iconUrl ? (
          <Image source={{ uri: item.iconUrl }} style={styles.titleIcon} />
        ) : Platform.OS === 'web' ? (
          <TrophyFilled style={{ fontSize: 32, color: item.colorHex || '#F1BE4B' }} />
        ) : (
          <Text style={styles.emojiIcon}>🏆</Text>
        )}
      </View>
      <View style={styles.titleInfo}>
        <Text style={styles.titleName}>{item.name}</Text>
        <Text style={styles.titleDescription}>{item.description}</Text>
        <View style={styles.earnedAtContainer}>
          <Text style={styles.earnedAtLabel}>Đã đạt được vào: </Text>
          <Text style={styles.earnedAtDate}>{formatDate(item.earnedAt)}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.selectBtn} 
        onPress={() => handleSelectTitle(item.titleId)}
        disabled={loading}
      >
        <Text style={styles.selectBtnText}>Sử dụng</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Bộ sưu tập danh hiệu</Text>
              <Text style={styles.headerSubtitle}>Bạn đã đạt được {totalCount} danh hiệu</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              {Platform.OS === 'web' ? (
                <CloseOutlined style={{ fontSize: 16, color: '#666' }} />
              ) : (
                <Text style={styles.closeBtnText}>✕</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Content */}
          {loading && titles.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F1BE4B" />
              <Text style={styles.loadingText}>Đang tải danh hiệu...</Text>
            </View>
          ) : (
            <FlatList
              data={titles}
              renderItem={renderTitleItem}
              keyExtractor={(item) => item.titleId}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Bạn chưa đạt được danh hiệu nào. Hãy cố gắng học tập nhé!</Text>
                </View>
              }
            />
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.doneBtn}>
              <Text style={styles.doneBtnText}>Tuyệt vời!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: Platform.OS === 'web' ? 'blur(8px)' : 'none',
  },
  container: {
    backgroundColor: '#FFFFFF',
    width: '90%',
    maxWidth: 600,
    maxHeight: '85%',
    borderRadius: 32,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#20130A',
    fontFamily: 'Epilogue, sans-serif',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    color: '#666',
  },
  listContent: {
    padding: 24,
    gap: 16,
  },
  titleCard: {
    flexDirection: 'row',
    backgroundColor: '#FBFBFA',
    borderRadius: 20,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  iconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  titleIcon: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  emojiIcon: {
    fontSize: 32,
  },
  titleInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  titleName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#20130A',
    fontFamily: 'Epilogue, sans-serif',
  },
  titleDescription: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    fontFamily: 'Epilogue, sans-serif',
  },
  earnedAtContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  earnedAtLabel: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
  },
  earnedAtDate: {
    fontSize: 11,
    color: '#F1BE4B',
    fontWeight: '700',
    fontFamily: 'Epilogue, sans-serif',
  },
  loadingContainer: {
    padding: 100,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Epilogue, sans-serif',
  },
  footer: {
    padding: 24,
    paddingTop: 0,
  },
  doneBtn: {
    backgroundColor: '#F1BE4B',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(241, 190, 75, 0.3)',
      },
      default: {
        shadowColor: '#F1BE4B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Epilogue, sans-serif',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 22,
  },
  selectBtn: {
    backgroundColor: '#F1BE4B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'center',
  },
  selectBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Epilogue, sans-serif',
  },
})
