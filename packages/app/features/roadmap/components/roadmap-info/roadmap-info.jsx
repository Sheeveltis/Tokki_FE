import { useMemo, useState } from 'react'
import { Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native'
import { FormOutlined, SettingOutlined, RocketOutlined, QuestionCircleOutlined, InfoCircleOutlined, LeftOutlined, RightOutlined, LockOutlined } from '@ant-design/icons'
import { TOPIK_LEVELS, formatTime, getTotalTime } from '../../api/roadmap-info'
import { useTopikLevelConfigs } from '../../api/useTopikLevelConfigs'

export function RoadmapInfo({ onStart, initialLevel = 1, startButton }) {
  const { data: configs, loading } = useTopikLevelConfigs(1, 100)

  const LEVELS = useMemo(() => {
    if (!configs || configs.length === 0) {
      return TOPIK_LEVELS.map((l) => ({ value: l.level, label: l.label }))
    }
    return configs.map((item) => ({
      value: item.targetAimLevel,
      label: `TOPIK ${item.targetAimLevel}`,
      configKey: item.configKey,
    }))
  }, [configs])

  const [selectedLevel, setSelectedLevel] = useState(initialLevel)

  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isRequirementsModalOpen, setIsRequirementsModalOpen] = useState(false)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const [helpPage, setHelpPage] = useState(1)
  const [openListKey, setOpenListKey] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [tablePage, setTablePage] = useState(0)
  const pageSize = 6

  const requirements = useMemo(() => {
    if (!configs || configs.length === 0) return []
    return configs.map(item => ({
      value: item.targetAimLevel,
      displayName: `TOPIK ${item.examGroup === 1 ? 'I' : 'II'} - ${item.displayName}`,
      passScore: item.passScore,
      totalScore: item.totalScore
    }))
  }, [configs])

  const totalPages = Math.ceil(requirements.length / pageSize)

  const displayedRequirements = useMemo(() => {
    const pageItems = requirements.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
    // Nếu trang cuối không đủ 6, bù thêm placeholder để giữ bố cục 3x2
    const placeholders = []
    if (pageItems.length > 0 && pageItems.length < pageSize) {
      for (let i = 0; i < pageSize - pageItems.length; i++) {
        placeholders.push({ isPlaceholder: true, id: `placeholder-${i}` })
      }
    }
    return [...pageItems, ...placeholders]
  }, [requirements, currentPage, pageSize])

  const detailedData = useMemo(() => {
    if (!configs || configs.length === 0) return []
    return configs.map(item => ({
      level: item.displayName,
      target: `${item.passScore}/${item.totalScore}`,
      listening: `${item.targetListeningQuestions}/${item.listeningMaxQuestions} câu (${item.targetListeningScore}đ)`,
      reading: `${item.targetReadingQuestions}/${item.readingMaxQuestions} câu (${item.targetReadingScore}đ)`,
      writing: (item.writingMaxQuestions > 0 || item.targetWritingScore > 0) ? `${item.targetWritingScore}/100đ` : 'Không thi',
      strategy: item.strategy
    }))
  }, [configs])

  const totalTablePages = Math.ceil(detailedData.length / pageSize)
  const displayedTableData = useMemo(() => {
    return detailedData.slice(tablePage * pageSize, (tablePage + 1) * pageSize)
  }, [detailedData, tablePage, pageSize])

  const selectedLevelInfo = useMemo(
    () => TOPIK_LEVELS.find((level) => level.level === selectedLevel) || TOPIK_LEVELS[0],
    [selectedLevel],
  )

  const openSelectionModal = () => {
    setIsSelectionModalOpen(true)
  }

  const closeSelectionModal = () => {
    setIsSelectionModalOpen(false)
    setOpenListKey(null)
  }

  const toggleList = (key) => {
    setOpenListKey((current) => (current === key ? null : key))
  }

  const confirmSelection = () => {
    setIsSelectionModalOpen(false)
    setIsConfirmModalOpen(true)
  }

  const handleFinalStart = () => {
    if (onStart) {
      const selectedConfig = configs?.find((item) => item.targetAimLevel === selectedLevel)
      onStart(selectedLevel, selectedConfig?.configKey)
    }
    setIsConfirmModalOpen(false)
  }


  return (
    <View style={styles.container}>
      <View style={styles.introCard}>
        <View style={styles.badgeRow}>
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>LỘ TRÌNH CÁ NHÂN HÓA</Text>
          </View>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.introTitle}>Lộ trình luyện TOPIK cá nhân hóa</Text>
          <Pressable
            style={({ hovered }) => [
              styles.helpIconButton,
              hovered && styles.helpIconButtonHovered
            ]}
            onPress={() => setIsHelpModalOpen(true)}
          >
            <QuestionCircleOutlined style={{ color: '#999', fontSize: 20 }} />
          </Pressable>
        </View>
        <Text style={styles.introText}>
          Dựa vào trình độ đầu vào của bạn để sắp xếp nội dung tối ưu nhất, giúp bạn bám sát mục tiêu thi TOPIK mỗi ngày.
        </Text>

        <View style={styles.stepsCompactContainer}>
          <View style={styles.stepItemCompact}>
            <View style={styles.stepIconWrap}>
              <FormOutlined style={{ color: '#0066FF', fontSize: 16 }} />
            </View>
            <View style={styles.stepTextWrap}>
              <Text style={styles.stepTitleCompact}>Bước 1: Kiểm tra</Text>
              <Text style={styles.stepSubtext}>Đánh giá trình độ</Text>
            </View>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepItemCompact}>
            <View style={styles.stepIconWrap}>
              <SettingOutlined style={{ color: '#D48806', fontSize: 16 }} />
            </View>
            <View style={styles.stepTextWrap}>
              <Text style={styles.stepTitleCompact}>Bước 2: Thiết lập</Text>
              <Text style={styles.stepSubtext}>Tạo lộ trình riêng</Text>
            </View>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepItemCompact}>
            <View style={styles.stepIconWrap}>
              <RocketOutlined style={{ color: '#52C41A', fontSize: 16 }} />
            </View>
            <View style={styles.stepTextWrap}>
              <Text style={styles.stepTitleCompact}>Bước 3: Học tập</Text>
              <Text style={styles.stepSubtext}>Bắt đầu chinh phục</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.learningPlanCard}>
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>Yêu cầu điểm đạt theo trình độ</Text>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>CHỈ TIÊU TOPIK</Text>
          </View>
        </View>

        <View style={styles.dayGridContainer}>
          {totalPages > 1 && (
            <TouchableOpacity
              disabled={currentPage === 0}
              style={[
                styles.paginationButton,
                styles.leftButton,
                currentPage === 0 && styles.paginationButtonDisabled
              ]}
              onPress={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            >
              <LeftOutlined style={{ fontSize: 16, color: currentPage === 0 ? '#CCC' : '#0066FF' }} />
            </TouchableOpacity>
          )}

          <View style={styles.dayGrid}>
            {displayedRequirements.map((item, index) => {
              if (item.isPlaceholder) {
                return (
                  <View key={item.id} style={[styles.dayCell, styles.lockedCell]}>
                    <View style={styles.lockedIndicator}>
                      <LockOutlined style={{ fontSize: 14, color: '#BFBFBF' }} />
                      <Text style={styles.lockedLabel}>Sắp ra mắt</Text>
                    </View>
                    <View style={styles.scoreInfo}>
                      <Text style={styles.lockedValue}>-- / --</Text>
                      <Text style={styles.scoreLabel}>Chưa cập nhật</Text>
                    </View>
                  </View>
                )
              }

              return (
                <Pressable
                  key={item.value}
                  onPress={() => setSelectedLevel(item.value)}
                  style={({ pressed, hovered }) => [
                    styles.dayCell,
                    selectedLevel === item.value && styles.selectedRequirement,
                    pressed && styles.pressedRequirement,
                    hovered && styles.hoveredRequirement,
                  ]}
                >
                  <View style={[styles.dayIndicator, selectedLevel === item.value && styles.selectedIndicator]}>
                    <Text style={[styles.dayLabel, selectedLevel === item.value && styles.selectedLabelText]}>{item.displayName}</Text>
                  </View>
                  <View style={styles.scoreInfo}>
                    <Text style={styles.scoreProgressText}>{item.passScore} / {item.totalScore}</Text>
                    <Text style={styles.scoreLabel}>Điểm đạt</Text>
                  </View>
                </Pressable>
              )
            })}
          </View>

          {totalPages > 1 && (
            <TouchableOpacity
              disabled={currentPage === totalPages - 1}
              style={[
                styles.paginationButton,
                styles.rightButton,
                currentPage === totalPages - 1 && styles.paginationButtonDisabled
              ]}
              onPress={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            >
              <RightOutlined style={{ fontSize: 16, color: currentPage === totalPages - 1 ? '#CCC' : '#0066FF' }} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Pressable
        onPress={() => setIsRequirementsModalOpen(true)}
        style={({ pressed, hovered }) => [
          styles.viewDetailsButton,
          hovered && styles.viewDetailsButtonHovered,
          pressed && styles.viewDetailsButtonPressed
        ]}
      >
        <Text style={styles.viewDetailsText}>Xem chi tiết chuẩn đầu ra & chiến thuật</Text>
      </Pressable>



      <View style={styles.footerSection}>
        <Text style={styles.instruction}>Bắt đầu bài kiểm tra để kích hoạt lộ trình riêng cho bạn</Text>
        {startButton ? (
          startButton(openSelectionModal)
        ) : (
          <Pressable
            onPress={openSelectionModal}
            style={({ pressed, hovered }) => [
              styles.startButton,
              hovered && styles.startButtonHovered,
              pressed && styles.startButtonPressed
            ]}
          >
            <Text style={styles.startButtonText}>Bắt đầu ngay</Text>
          </Pressable>
        )}
      </View>

      <Modal visible={isSelectionModalOpen} transparent animationType="fade" onRequestClose={closeSelectionModal}>
        <Pressable style={styles.modalOverlay} onPress={closeSelectionModal}>
          <View style={styles.selectionModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.selectionTitle}>Cấu hình đầu vào</Text>
              <Text style={styles.modalSubtitle}>Chọn trình độ phù hợp để chúng tôi sắp xếp lộ trình</Text>
            </View>

            <View style={[styles.selectionSection, { zIndex: openListKey === 'level' ? 20 : 10 }]}>
              <Text style={styles.selectionLabel}>Bạn muốn thi lấy chứng chỉ nào?</Text>
              <Pressable
                style={({ hovered, pressed }) => [
                  styles.selectionTrigger,
                  hovered && styles.selectionTriggerHovered,
                  pressed && styles.selectionTriggerPressed
                ]}
                onPress={() => toggleList('level')}
              >
                <View>
                  <Text style={styles.selectionTriggerValue}>
                    {LEVELS.find((level) => level.value === selectedLevel)?.label}
                  </Text>
                </View>
                <Text style={styles.selectionTriggerArrow}>▼</Text>
              </Pressable>

              {openListKey === 'level' && (
                <View style={styles.inlineDropdown}>
                  {LEVELS.map((level) => (
                    <Pressable
                      key={level.value}
                      onPress={() => {
                        setSelectedLevel(level.value)
                        setOpenListKey(null)
                      }}
                      style={({ hovered, pressed }) => [
                        styles.dropdownItem,
                        hovered && styles.dropdownItemHover,
                        pressed && styles.dropdownItemPressed,
                        selectedLevel === level.value && styles.dropdownItemSelected,
                      ]}
                    >
                      <Text style={[styles.dropdownItemText, selectedLevel === level.value && styles.dropdownItemTextSelected]}>
                        {level.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>



            <View style={styles.modalActions}>
              <Pressable
                style={({ hovered, pressed }) => [
                  styles.cancelButton,
                  hovered && styles.cancelButtonHovered,
                  pressed && styles.cancelButtonPressed
                ]}
                onPress={closeSelectionModal}
              >
                <Text style={styles.cancelButtonText}>Để sau</Text>
              </Pressable>
              <Pressable
                style={({ hovered, pressed }) => [
                  styles.confirmButton,
                  hovered && styles.confirmButtonHovered,
                  pressed && styles.confirmButtonPressed
                ]}
                onPress={confirmSelection}
              >
                <Text style={styles.confirmButtonText}>Bắt đầu kiểm tra</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={isConfirmModalOpen} transparent animationType="fade" onRequestClose={() => setIsConfirmModalOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIsConfirmModalOpen(false)}>
          <View style={[styles.selectionModalContainer, { maxWidth: 440, padding: 28 }]}>
            <View style={[styles.modalHeader, { alignItems: 'center', gap: 16 }]}>
              <View style={[styles.confirmIconCircle, { backgroundColor: '#FFF9E6' }]}>
                <InfoCircleOutlined style={{ fontSize: 32, color: '#F1BE4B' }} />
              </View>
              <View style={{ alignItems: 'center', gap: 8 }}>
                <Text style={[styles.selectionTitle, { textAlign: 'center' }]}>Lưu ý trước khi bắt đầu</Text>
                <Text style={[styles.modalSubtitle, { textAlign: 'center', lineHeight: 22, color: '#444' }]}>
                  Bạn hãy đảm bảo làm bài kiểm tra nghiêm túc, cẩn thận. Thời gian làm bài tương đương với 1 bài thi TOPIK nên bạn hãy tránh để bị gián đoạn để cho ra kết quả tốt nhất nhé.
                </Text>
              </View>
            </View>

            <View style={[styles.modalHeader, { marginTop: 4, alignItems: 'center' }]}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#111', textAlign: 'center' }}>
                Chúc bạn làm bài thật tốt!
              </Text>
            </View>

            <View style={[styles.modalActions, { marginTop: 8 }]}>
              <Pressable
                style={({ hovered, pressed }) => [
                  styles.cancelButton,
                  hovered && styles.cancelButtonHovered,
                  pressed && styles.cancelButtonPressed
                ]}
                onPress={() => setIsConfirmModalOpen(false)}
              >
                <Text style={styles.cancelButtonText}>Quay lại</Text>
              </Pressable>
              <Pressable
                style={({ hovered, pressed }) => [
                  styles.confirmButton,
                  { backgroundColor: '#F1BE4B' },
                  hovered && { backgroundColor: '#E5B13A' },
                  pressed && { transform: [{ scale: 0.98 }] }
                ]}
                onPress={handleFinalStart}
              >
                <Text style={[styles.confirmButtonText, { color: '#1A1A1A' }]}>Tôi đã sẵn sàng</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={isHelpModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsHelpModalOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsHelpModalOpen(false)}
        >
          <View style={[styles.selectionModalContainer, { maxWidth: 500, padding: 24, gap: 20 }]}>
            <View style={[styles.modalHeader, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
              <View style={{ gap: 4 }}>
                <Text style={styles.selectionTitle}>
                  {helpPage === 1 ? 'Về Lộ trình cá nhân hóa' : 'Chi tiết các bước thực hiện'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {helpPage === 1 ? 'Tìm hiểu cách hệ thống giúp bạn học tập' : 'Quy trình từ lúc bắt đầu đến khi về đích'}
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  setIsHelpModalOpen(false)
                  setTimeout(() => setHelpPage(1), 300)
                }}
                style={({ hovered }) => [
                  styles.closeModalButton,
                  hovered && styles.closeModalButtonHovered
                ]}
              >
                {({ hovered }) => (
                  <Text style={[
                    styles.closeModalButtonText,
                    hovered && { color: '#FFFFFF' }
                  ]}>✕</Text>
                )}
              </Pressable>
            </View>

            <ScrollView bounces={false} style={{ maxHeight: 400 }}>
              {helpPage === 1 ? (
                <View style={styles.helpContent}>
                  <View style={styles.helpSection}>
                    <Text style={styles.helpSectionTitle}>Lộ trình này là gì?</Text>
                    <Text style={styles.helpSectionText}>
                      Đây là một hệ thống học tập thông minh, tự động phân tích điểm mạnh và điểm yếu để tạo ra một kế hoạch học tập riêng biệt cho từng ngày.
                    </Text>
                  </View>

                  <View style={styles.helpSection}>
                    <Text style={styles.helpSectionTitle}>Tại sao cần làm bài kiểm tra?</Text>
                    <Text style={styles.helpSectionText}>
                      Bài kiểm tra giúp xác định chính xác trình độ hiện tại của bạn. Từ đó, nội dung sẽ được sắp xếp phù hợp nhất với năng lực thực tế.
                    </Text>
                  </View>

                  <View style={styles.helpSection}>
                    <Text style={styles.helpSectionTitle}>Lợi ích mang lại</Text>
                    <View style={styles.benefitList}>
                      <Text style={styles.benefitItem}>• Tiết kiệm thời gian rà soát kiến thức cũ.</Text>
                      <Text style={styles.benefitItem}>• Tập trung vào các phần còn yếu để cải thiện điểm số.</Text>
                      <Text style={styles.benefitItem}>• Lộ trình rõ ràng, bám sát cấu trúc đề thi mới nhất.</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.helpContent}>
                  <View style={styles.helpSection}>
                    <Text style={styles.helpSectionTitle}>Bước 1: Đánh giá năng lực</Text>
                    <Text style={styles.helpSectionText}>
                      Bạn sẽ thực hiện một bài kiểm tra tổng hợp 3 kỹ năng (Nghe, Đọc, Viết) trong khoảng 15-20 phút. Đây là cơ sở để hệ thống hiểu rõ "vùng kiến thức" của bạn.
                    </Text>
                  </View>

                  <View style={styles.helpSection}>
                    <Text style={styles.helpSectionTitle}>Bước 2: Hệ thống thiết lập</Text>
                    <Text style={styles.helpSectionText}>
                      Dựa trên kết quả, thuật toán sẽ tự động lọc bỏ những phần bạn đã vững và tập trung vào những kỹ năng cần cải thiện để tối ưu hóa lộ trình học.
                    </Text>
                  </View>

                  <View style={styles.helpSection}>
                    <Text style={styles.helpSectionTitle}>Bước 3: Luyện tập hàng ngày</Text>
                    <Text style={styles.helpSectionText}>
                      Mỗi ngày bạn sẽ nhận được các nhiệm vụ cụ thể. Việc duy trì học tập đều đặn sẽ giúp bạn chinh phục chứng chỉ TOPIK trong thời gian ngắn nhất.
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
              {helpPage > 1 && (
                <Pressable
                  style={({ hovered, pressed }) => [
                    styles.modalCloseButton,
                    { flex: 1, backgroundColor: '#F5F5F5' },
                    pressed && { transform: [{ scale: 0.95 }] }
                  ]}
                  onPress={() => setHelpPage(prev => prev - 1)}
                >
                  <Text style={[styles.modalCloseButtonText, { color: '#666' }]}>Quay lại</Text>
                </Pressable>
              )}

              <Pressable
                style={({ hovered, pressed }) => [
                  styles.modalCloseButton,
                  { flex: 2 },
                  hovered && styles.modalCloseButtonHovered,
                  pressed && styles.modalCloseButtonPressed
                ]}
                onPress={() => {
                  if (helpPage === 1) {
                    setHelpPage(2)
                  } else {
                    setIsHelpModalOpen(false)
                    setTimeout(() => setHelpPage(1), 300)
                  }
                }}
              >
                <Text style={styles.modalCloseButtonText}>
                  {helpPage === 1 ? 'Tiếp theo' : 'Đã hiểu'}
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={isRequirementsModalOpen} transparent animationType="fade" onRequestClose={() => setIsRequirementsModalOpen(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsRequirementsModalOpen(false)}
        >
          <View style={[styles.selectionModalContainer, { maxWidth: 1100, padding: 24, minHeight: 450 }]}>
            <View style={[styles.modalHeader, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }]}>
              <View>
                <Text style={styles.selectionTitle}>Chuẩn đầu ra TOPIK</Text>
                <Text style={styles.modalSubtitle}>Chỉ tiêu điểm đạt và chiến thuật cho từng cấp độ</Text>
              </View>
              <Pressable
                onPress={() => setIsRequirementsModalOpen(false)}
                style={({ hovered, pressed }) => [
                  styles.closeModalButton,
                  hovered && styles.closeModalButtonHovered,
                  pressed && styles.closeModalButtonPressed
                ]}
              >
                {({ hovered }) => (
                  <Text style={[
                    styles.closeModalButtonText,
                    hovered && { color: '#FFFFFF' }
                  ]}>✕</Text>
                )}
              </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableScroll}>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.headerCell, { width: 80 }]}>Cấp độ</Text>
                  <Text style={[styles.headerCell, { width: 100 }]}>Mục tiêu</Text>
                  <Text style={[styles.headerCell, { width: 140 }]}>Nghe</Text>
                  <Text style={[styles.headerCell, { width: 140 }]}>Đọc</Text>
                  <Text style={[styles.headerCell, { width: 100 }]}>Viết</Text>
                  <Text style={[styles.headerCell, { flex: 1, minWidth: 400 }]}>Chiến thuật trọng tâm</Text>
                </View>
                {displayedTableData.map((row, index) => (
                  <View key={index} style={[styles.tableRow, index === displayedTableData.length - 1 && { borderBottomWidth: 0 }]}>
                    <Text style={[styles.cell, { width: 80, fontWeight: '700', color: '#1A1A1A' }]}>{row.level}</Text>
                    <Text style={[styles.cell, { width: 100, fontWeight: '600', color: '#0066FF' }]}>{row.target}</Text>
                    <Text style={[styles.cell, { width: 140 }]}>{row.listening}</Text>
                    <Text style={[styles.cell, { width: 140 }]}>{row.reading}</Text>
                    <Text style={[styles.cell, { width: 100 }]}>{row.writing}</Text>
                    <Text style={[styles.cell, { minWidth: 400, flex: 1, fontSize: 13, lineHeight: 18 }]}>{row.strategy}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>

            {totalTablePages > 1 && (
              <View style={styles.tablePagination}>
                <TouchableOpacity
                  disabled={tablePage === 0}
                  style={[styles.miniPaginationButton, tablePage === 0 && { opacity: 0.3 }]}
                  onPress={() => setTablePage(p => Math.max(0, p - 1))}
                >
                  <LeftOutlined style={{ fontSize: 14 }} />
                </TouchableOpacity>
                <Text style={styles.pageText}>Trang {tablePage + 1} / {totalTablePages}</Text>
                <TouchableOpacity
                  disabled={tablePage === totalTablePages - 1}
                  style={[styles.miniPaginationButton, tablePage === totalTablePages - 1 && { opacity: 0.3 }]}
                  onPress={() => setTablePage(p => Math.min(totalTablePages - 1, p + 1))}
                >
                  <RightOutlined style={{ fontSize: 14 }} />
                </TouchableOpacity>
              </View>
            )}

            <Pressable
              style={({ hovered, pressed }) => [
                styles.modalCloseButton,
                { marginTop: 20 },
                hovered && styles.modalCloseButtonHovered,
                pressed && styles.modalCloseButtonPressed
              ]}
              onPress={() => setIsRequirementsModalOpen(false)}
            >
              <Text style={styles.modalCloseButtonText}>Đóng</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  stepsCompactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    justifyContent: 'space-between',
    gap: 8,
  },
  stepItemCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  stepIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8F9FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTextWrap: {
    flex: 1,
    gap: 1,
  },
  stepTitleCompact: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  stepSubtext: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '500',
  },
  stepLine: {
    width: 16,
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  container: {
    backgroundColor: 'transparent',
    gap: 12,
    width: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  helpIconButton: {
    padding: 4,
    borderRadius: 8,
    transition: 'all 0.2s ease',
  },
  helpIconButtonHovered: {
    backgroundColor: '#F5F5F5',
  },
  helpContent: {
    gap: 16,
  },
  helpSection: {
    gap: 6,
  },
  helpSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  helpSectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    fontFamily: 'Epilogue, sans-serif',
  },
  benefitList: {
    gap: 6,
  },
  benefitItem: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 20,
  },
  introCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
    }),
  },
  badgeRow: {
    marginBottom: 0,
  },
  premiumBadge: {
    backgroundColor: '#FFF2CC',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#D48806',
    letterSpacing: 1,
    fontFamily: 'Epilogue, sans-serif',
  },
  introTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 34,
  },
  introText: {
    fontSize: 15,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 22,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  metaPill: {
    backgroundColor: '#FAFAFA',
    borderColor: '#EEEEEE',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    minWidth: 140,
  },
  metaPillLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontFamily: 'Epilogue, sans-serif',
  },
  metaPillValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  learningPlanCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F0F0F0',
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 16,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
    }),
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  planBadge: {
    backgroundColor: '#F0F7FF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0066FF',
    fontFamily: 'Epilogue, sans-serif',
  },
  dayGridContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    flex: 1,
    justifyContent: 'flex-start',
  },
  paginationButton: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }),
  },
  paginationButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#FAFAFA',
  },
  leftButton: {
    left: 0,
  },
  rightButton: {
    right: 0,
  },
  tablePagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  miniPaginationButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8F9FB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  pageText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  lockedCell: {
    backgroundColor: '#F9F9F9',
    borderColor: '#F0F0F0',
    opacity: 0.6,
  },
  lockedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F0F0',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  lockedLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#BFBFBF',
    fontFamily: 'Epilogue, sans-serif',
  },
  lockedValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#E0E0E0',
    fontFamily: 'Epilogue, sans-serif',
  },
  dayCell: {
    width: '31%',
    minWidth: 160,
    backgroundColor: '#FDFDFD',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F5F5F5',
    padding: 12,
    gap: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  selectedRequirement: {
    backgroundColor: '#FFF2CC',
    borderColor: '#FFC107',
  },
  hoveredRequirement: {
    backgroundColor: '#F7F7F7',
    borderColor: '#DDD',
  },
  pressedRequirement: {
    backgroundColor: '#EEEEEE',
    transform: [{ scale: 0.98 }],
  },
  viewDetailsButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0066FF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  viewDetailsButtonHovered: {
    backgroundColor: '#F0F7FF',
    borderColor: '#005CE6',
  },
  startButtonHovered: {
    backgroundColor: '#333333',
    ...(Platform.OS === 'web' && {
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 45px rgba(0,0,0,0.25)',
    }),
  },
  dayIndicator: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  selectedIndicator: {
    backgroundColor: '#FFEB3B',
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#888',
    fontFamily: 'Epilogue, sans-serif',
  },
  selectedLabelText: {
    color: '#7A4B0A',
  },
  scoreInfo: {
    gap: 2,
  },
  scoreProgressText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#AAA',
    textTransform: 'uppercase',
    fontFamily: 'Epilogue, sans-serif',
  },
  footerSection: {
    marginTop: 10,
    gap: 16,
    alignItems: 'center',
  },
  instruction: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
  },
  startButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    }),
  },
  startButtonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#333',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
  startButtonArrow: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(8px)',
      cursor: 'default',
    }),
  },
  selectionModalContainer: {
    width: '90%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 32,
    gap: 24,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 30px 60px rgba(0,0,0,0.2)',
      cursor: 'default',
    }),
  },
  modalHeader: {
    gap: 4,
  },
  confirmIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  selectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    fontFamily: 'Epilogue, sans-serif',
  },
  selectionSection: {
    gap: 12,
    zIndex: 10, // Higher zIndex for stacking
    position: 'relative', // Context for absolute dropdown
  },
  selectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Epilogue, sans-serif',
  },
  selectionTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FDFDFD',
    transition: 'all 0.2s ease',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  selectionTriggerHovered: {
    borderColor: '#CCC',
    backgroundColor: '#F8F8F8',
  },
  selectionTriggerPressed: {
    backgroundColor: '#F0F0F0',
    borderColor: '#BBB',
    transform: [{ scale: 0.99 }],
  },
  selectionTriggerValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  selectionTriggerArrow: {
    fontSize: 10,
    color: '#999',
  },
  inlineDropdown: {
    position: 'absolute',
    top: 76, // Adjust based on height of label + trigger
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    overflow: 'hidden',
    zIndex: 100,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    }),
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  cancelButtonHovered: {
    backgroundColor: '#EEEEEE',
  },
  cancelButtonPressed: {
    backgroundColor: '#DDDDDD',
    transform: [{ scale: 0.98 }],
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  confirmButton: {
    flex: 1.5,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  confirmButtonHovered: {
    backgroundColor: '#333333',
  },
  confirmButtonPressed: {
    backgroundColor: '#000000',
    transform: [{ scale: 0.98 }],
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#FAFAFA',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  dropdownItemSelected: {
    backgroundColor: '#FAF9F6',
  },
  dropdownItemHover: {
    backgroundColor: '#F8F8F8',
  },
  dropdownItemPressed: {
    backgroundColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#444',
    fontWeight: '500',
    fontFamily: 'Epilogue, sans-serif',
  },
  dropdownItemTextSelected: {
    fontWeight: '800',
    color: '#1A1A1A',
  },
  tableScroll: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
  },
  table: {
    minWidth: 1000,
    width: '100%',
    minHeight: 300,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FB',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 12,
  },
  headerCell: {
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '800',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Epilogue, sans-serif',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  cell: {
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    fontFamily: 'Epilogue, sans-serif',
  },
  closeModalButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  closeModalButtonHovered: {
    backgroundColor: '#FF4D4F',
    transform: [{ scale: 1.05 }],
  },
  closeModalButtonPressed: {
    backgroundColor: '#D9363E',
    transform: [{ scale: 0.95 }],
  },
  closeModalButtonText: {
    fontSize: 18,
    color: '#999',
    fontWeight: '600',
    fontFamily: 'Epilogue, sans-serif',
  },
  viewDetailsText: {
    color: '#0066FF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Epilogue, sans-serif',
  },
  modalCloseButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: '#F1BE4B',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 14px rgba(241, 190, 75, 0.4)',
      cursor: 'pointer',
    }),
  },
  modalCloseButtonHovered: {
    backgroundColor: '#E5B13A',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 6px 20px rgba(241, 190, 75, 0.5)',
      transform: 'translateY(-2px)',
    }),
  },
  modalCloseButtonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#D4A029',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
})

