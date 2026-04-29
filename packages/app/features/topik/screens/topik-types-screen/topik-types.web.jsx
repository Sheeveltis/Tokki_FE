import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Pressable, ScrollView, Platform, ActivityIndicator } from 'react-native'
import { apiClient } from '../../../../provider/api/client'
import { ENDPOINTS } from '../../../../provider/api/endpoints'
import { useRouter } from 'solito/navigation'
import { NavigationPill } from '../../../../../components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { AudioOutlined, ReadOutlined, FormOutlined, PlayCircleOutlined } from '@ant-design/icons'

const EXAM_TYPES = [
  { id: 1, label: 'TOPIK I' },
  { id: 2, label: 'TOPIK II' }
]

const SKILLS = [
  { id: 1, label: 'Nghe', icon: AudioOutlined },
  { id: 2, label: 'Đọc', icon: ReadOutlined },
  { id: 3, label: 'Viết', icon: FormOutlined }
]

export function TopikTypesWeb({ level, onBackPress }) {
  const router = useRouter()

  // Dựa vào level để default Exam Type (level 1-2 là TOPIK I, 3-6 là TOPIK II)
  const initialExamType = (level && level <= 2) ? 1 : 2

  const [examType, setExamType] = useState(initialExamType)
  const [skill, setSkill] = useState(1) // Default to Nghe
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  // TOPIK I chỉ có Nghe (1) & Đọc (2). TOPIK II có thêm Viết (3).
  const availableSkills = examType === 1
    ? SKILLS.filter(s => s.id !== 3)
    : SKILLS

  // Reset skill nếu đang ở "Viết" mà chuyển sang TOPIK I
  useEffect(() => {
    if (examType === 1 && skill === 3) {
      setSkill(1)
    }
  }, [examType, skill])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await apiClient.get(ENDPOINTS.QUESTION_TYPE.USER_GET_ALL, {
        params: {
          skill,
          examType,
          pageNumber: 1,
          pageSize: 100
        }
      })

      let items = []
      if (res.data?.data) {
        if (Array.isArray(res.data.data)) {
          items = res.data.data
        } else if (res.data.data.items && Array.isArray(res.data.data.items)) {
          items = res.data.data.items
        }
      } else if (res.data && Array.isArray(res.data)) {
        items = res.data
      } else if (res.data?.items && Array.isArray(res.data.items)) {
        items = res.data.items
      }
      setData(items)
    } catch (error) {
      console.error('Failed to fetch question types:', error)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [examType, skill])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleTypePress = (typeId) => {
    if (!typeId) {
      console.warn('Cannot practice: typeId is undefined')
      return
    }
    router.push(`/roadmap/practice-test/${typeId}?mode=virtual&quantity=5`)
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.fixedHeader}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <NavigationPill
                  label="Quay lại"
                  icon={ArrowIcon}
                  iconStyle={{ transform: [{ scaleX: -1 }] }}
                  onPress={onBackPress}
                  textStyle={{ fontWeight: '700' }}
                />
              </View>
              <View style={styles.headerCenter}>
                <Text style={styles.title}>Học TOPIK theo dạng</Text>
              </View>
              <View style={styles.headerRight} />
            </View>
            <View style={styles.subtitleSection}>
              <Text style={styles.subtitle}>Luyện tập chuyên sâu từng dạng câu hỏi trong đề thi TOPIK</Text>
            </View>
          </View>

          <View style={styles.tabsWrapper}>
            <View style={styles.tabsContainer}>
              <View style={styles.examTabs}>
                {EXAM_TYPES.map(type => (
                  <Pressable 
                    key={type.id}
                    style={({ hovered }) => [
                      styles.examTab, 
                      examType === type.id && styles.examTabActive,
                      hovered && ! (examType === type.id) && styles.examTabHover
                    ]}
                    onPress={() => setExamType(type.id)}
                  >
                    <Text style={[styles.examTabText, examType === type.id && styles.examTabTextActive]}>
                      {type.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.divider} />

              <View style={styles.skillTabs}>
                {availableSkills.map(s => {
                  const Icon = s.icon
                  const isActive = skill === s.id
                  return (
                    <Pressable 
                      key={s.id}
                      style={({ hovered }) => [
                        styles.skillTab, 
                        isActive && styles.skillTabActive,
                        hovered && !isActive && styles.skillTabHover
                      ]}
                      onPress={() => setSkill(s.id)}
                    >
                      <Icon style={{ color: isActive ? '#FFFFFF' : '#64748B', fontSize: 18 }} />
                      <Text style={[styles.skillTabText, isActive && styles.skillTabTextActive]}>
                        {s.label}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.scrollContainer}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.centerBox}>
                <ActivityIndicator size="large" color="#F1BE4B" />
              </View>
            ) : data.length === 0 ? (
              <View style={styles.centerBox}>
                <Text style={styles.emptyTitle}>Chưa có bài học nào</Text>
                <Text style={styles.emptySubtitle}>Các bài học cho dạng này đang được cập nhật thêm.</Text>
              </View>
            ) : (
              <View style={styles.grid}>
                {data.map((item, index) => {
                  const itemId = item.id || item.questionTypeId
                  const currentSkillLabel = SKILLS.find(s => s.id === skill)?.label?.toUpperCase() || ''
                  
                  return (
                    <Pressable
                      key={itemId || index}
                      style={({ hovered, pressed }) => [
                        styles.card,
                        hovered && styles.cardHover,
                        pressed && styles.cardPressed
                      ]}
                      onPress={() => handleTypePress(itemId)}
                    >
                      <View style={styles.cardLeft}>
                        <View style={styles.cardNumberBox}>
                          <Text style={styles.cardNumber}>{index + 1}</Text>
                        </View>
                        <View style={styles.cardContent}>
                          <View style={styles.cardTagRow}>
                            <Text style={styles.skillTag}>{currentSkillLabel}</Text>
                            <View style={styles.tagDot} />
                            <View style={styles.categoryBadge}>
                              <Text style={styles.categoryBadgeText}>
                                {skill === 1 ? 'Nghe hiểu' : skill === 2 ? 'Đọc hiểu' : 'Viết luận'}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                          {item.description ? (
                            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                          ) : null}
                        </View>
                      </View>
                      
                      <View style={styles.cardRight}>
                        <Pressable 
                          style={({ hovered }) => [
                            styles.cardActionBtn,
                            hovered && styles.cardActionBtnHover
                          ]}
                          onPress={(e) => {
                            e.stopPropagation() // Ngăn sự kiện nổi lên thẻ card
                            handleTypePress(itemId)
                          }}
                        >
                          <Text style={styles.cardActionText}>Học ngay</Text>
                          <PlayCircleOutlined style={{ color: '#1A1A1A', fontSize: 16 }} />
                        </Pressable>
                      </View>
                    </Pressable>
                  )
                })}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center', // Center vertically to show gaps
    paddingVertical: 40,
    height: '100vh',
    overflow: 'hidden',
  },
  contentWrapper: {
    width: '70%',
    maxWidth: 1280,
    height: 'calc(100vh - 100px)', // Giảm chiều cao để thấy bo góc dưới
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 40px rgba(0,0,0,0.02)',
    }),
  },
  fixedHeader: {
    paddingTop: 32,
    paddingHorizontal: 40,
    paddingBottom: 4,
    gap: 20,
  },
  header: {
    width: '100%',
    gap: 12,
  },
  headerTop: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
  },
  subtitleSection: {
    alignItems: 'center',
    marginTop: -4,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#0F172A',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: 'Epilogue, sans-serif',
    maxWidth: 600,
    lineHeight: 22,
    textAlign: 'center',
  },
  tabsWrapper: {
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 6,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  examTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    padding: 4,
    borderRadius: 18,
    gap: 4,
  },
  examTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    ...(Platform.OS === 'web' && { cursor: 'pointer', transition: 'all 0.2s ease' })
  },
  examTabActive: {
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    }),
  },
  examTabHover: {
    backgroundColor: '#FFFFFF80',
  },
  examTabText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94A3B8',
    fontFamily: 'Epilogue, sans-serif',
  },
  examTabTextActive: {
    color: '#5851DB',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  skillTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  skillTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...(Platform.OS === 'web' && { cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' })
  },
  skillTabActive: {
    backgroundColor: '#5851DB',
    borderColor: '#5851DB',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 20px rgba(88, 81, 219, 0.25)',
    }),
  },
  skillTabHover: {
    borderColor: '#5851DB80',
    backgroundColor: '#F8FAFC',
    transform: [{ translateY: -1 }],
  },
  skillTabText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#64748B',
    fontFamily: 'Epilogue, sans-serif',
  },
  skillTabTextActive: {
    color: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
    minHeight: 0,
  },
  scroll: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 40,
    paddingBottom: 60, // Tăng padding bottom để cuộn thoải mái hơn
  },
  grid: {
    flexDirection: 'column',
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    }),
  },
  cardHover: {
    borderColor: '#F1BE4B50',
    ...(Platform.OS === 'web' && {
      transform: 'translateY(-4px)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
    })
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 24,
  },
  cardNumberBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Epilogue, sans-serif',
  },
  cardDesc: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 20,
  },
  cardRight: {
    marginLeft: 24,
  },
  cardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 18,
    paddingRight: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F1BE4B',
    gap: 8,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 10px rgba(241, 190, 75, 0.2)',
      transition: 'all 0.2s ease',
    }),
  },
  cardActionBtnHover: {
    backgroundColor: '#EAB308', // Darker yellow on hover
    transform: [{ scale: 1.05 }],
  },
  cardActionText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  cardTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  skillTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  tagDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  categoryBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5851DB',
  },
  centerBox: {
    flex: 1,
    paddingVertical: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Epilogue, sans-serif',
  },
  emptySubtitle: {
    fontSize: 17,
    color: '#64748B',
    fontFamily: 'Epilogue, sans-serif',
  }
})
