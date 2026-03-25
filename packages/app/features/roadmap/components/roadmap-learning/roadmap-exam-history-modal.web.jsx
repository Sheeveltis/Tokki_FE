import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text, Modal, Pressable, ScrollView, ActivityIndicator, Platform } from 'react-native'
import { useRouter } from 'solito/navigation'
import { getExamHistory } from '../../api/roadmap-test'

export function RoadmapExamHistoryModal({ visible, onClose }) {
  const router = useRouter()
  const [historyData, setHistoryData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  const fetchHistory = async (pageNumber) => {
    setIsLoading(true)
    try {
      const response = await getExamHistory(pageNumber, pageSize)
      if (response?.isSuccess && response?.data) {
        setHistoryData(response.data)
      }
    } catch (error) {
      console.error('Error fetching exam history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (visible) {
      fetchHistory(currentPage)
    }
  }, [visible, currentPage])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (historyData?.totalPages || 1)) {
      setCurrentPage(newPage)
    }
  }

  const handleViewResult = (userExamId) => {
    router.push(`/roadmap/test/result?userExamId=${encodeURIComponent(userExamId)}`)
    onClose()
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  const formatTimeRemaining = (seconds) => {
    if (!seconds || seconds === 0) return 'Đã hoàn thành'
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${String(secs).padStart(2, '0')}`
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'Completed':
        return 'Đã hoàn thành'
      case 'InProgress':
        return 'Đang làm'
      default:
        return status
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#4CAF50'
      case 'InProgress':
        return '#FF9800'
      default:
        return '#757575'
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Lịch sử làm bài</Text>
            <Pressable onPress={onClose} style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}>
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B6B" />
              <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
          ) : historyData?.items?.length > 0 ? (
            <>
              <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
                {historyData.items.map((item) => (
                  <Pressable
                    key={item.userExamId}
                    style={({ pressed }) => [
                      styles.historyItem,
                      pressed && styles.historyItemPressed,
                    ]}
                    onPress={() => handleViewResult(item.userExamId)}
                  >
                    <View style={styles.historyItemHeader}>
                      <Text style={styles.examTitle}>{item.examTitle || 'N/A'}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(item.status) },
                        ]}
                      >
                        <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                      </View>
                    </View>
                    <View style={styles.historyItemDetails}>
                      <Text style={styles.detailText}>
                        Lần làm cuối: {formatDate(item.lastAttempt)}
                      </Text>
                      {item.status === 'InProgress' && item.timeRemaining > 0 && (
                        <Text style={styles.detailText}>
                          Thời gian còn lại: {formatTimeRemaining(item.timeRemaining)}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                ))}
              </ScrollView>

              {/* Pagination */}
              {historyData.totalPages > 1 && (
                <View style={styles.pagination}>
                  <Pressable
                    onPress={() => handlePageChange(currentPage - 1)}
                    disabled={!historyData.hasPreviousPage || isLoading}
                    style={({ pressed }) => [
                      styles.paginationButton,
                      (!historyData.hasPreviousPage || isLoading) && styles.paginationButtonDisabled,
                      pressed && styles.paginationButtonPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.paginationButtonText,
                        (!historyData.hasPreviousPage || isLoading) && styles.paginationButtonTextDisabled,
                      ]}
                    >
                      Trước
                    </Text>
                  </Pressable>

                  <View style={styles.paginationInfo}>
                    <Text style={styles.paginationText}>
                      Trang {currentPage} / {historyData.totalPages}
                    </Text>
                    <Text style={styles.paginationText}>
                      ({historyData.totalCount} bài thi)
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => handlePageChange(currentPage + 1)}
                    disabled={!historyData.hasNextPage || isLoading}
                    style={({ pressed }) => [
                      styles.paginationButton,
                      (!historyData.hasNextPage || isLoading) && styles.paginationButtonDisabled,
                      pressed && styles.paginationButtonPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.paginationButtonText,
                        (!historyData.hasNextPage || isLoading) && styles.paginationButtonTextDisabled,
                      ]}
                    >
                      Sau
                    </Text>
                  </Pressable>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Chưa có lịch sử làm bài</Text>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    maxWidth: 800,
    maxHeight: '80%',
    backgroundColor: '#FDF7EC',
    borderRadius: 16,
    padding: 24,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonPressed: {
    backgroundColor: '#FF5252',
    transform: [{ scale: 0.95 }],
  },
  closeButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
    fontFamily: 'Epilogue, sans-serif',
  },
  historyList: {
    flex: 1,
    maxHeight: 400,
    marginBottom: 16,
  },
  historyItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    }),
  },
  historyItemPressed: {
    backgroundColor: '#F5F5F5',
    transform: [{ scale: 0.98 }],
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  examTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
  historyItemDetails: {
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#757575',
    fontFamily: 'Epilogue, sans-serif',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  paginationButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FF6B6B',
    minWidth: 80,
    alignItems: 'center',
  },
  paginationButtonPressed: {
    backgroundColor: '#FF5252',
    transform: [{ scale: 0.95 }],
  },
  paginationButtonDisabled: {
    backgroundColor: '#E0E0E0',
    opacity: 0.5,
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
  paginationButtonTextDisabled: {
    color: '#9E9E9E',
  },
  paginationInfo: {
    alignItems: 'center',
    gap: 4,
  },
  paginationText: {
    fontSize: 14,
    color: '#757575',
    fontFamily: 'Epilogue, sans-serif',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
    fontFamily: 'Epilogue, sans-serif',
  },
})
