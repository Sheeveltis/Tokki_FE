import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { Platform, View, Text, StyleSheet, Pressable, TextInput, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { LoadingWithContainer } from '../../../../components/Loading'
import { getPronunciationRules } from '../api'
import { PronunciationRuleList } from '../components'
import { PronunciationLayout } from '../components/layout/PronunciationLayout'


export function PronunciationRulesScreen({ onBackPress, onRulePress }) {
  const navigation = Platform.OS !== 'web' ? useNavigation() : null
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPronunciationRules()
      setRules(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message || 'Không thể tải danh sách pronunciation rules')
      setRules([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRules()
  }, [fetchRules])

  const filteredRules = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()
    if (!keyword) return rules
    return rules.filter((rule) => {
      const title = String(rule?.title || '').toLowerCase()
      const description = String(rule?.description || '').toLowerCase()
      return title.includes(keyword) || description.includes(keyword)
    })
  }, [rules, searchTerm])

  const handleBack = () => {
    if (onBackPress) {
      onBackPress()
      return
    }
    if (navigation?.canGoBack?.()) navigation.goBack()
  }

  const handleRulePress = (rule) => {
    if (!rule?.id) return
    if (onRulePress) {
      onRulePress(rule)
      return
    }
    navigation?.navigate('pronunciation-examples', {
      ruleId: String(rule.id),
      ruleTitle: rule.title,
    })
  }

  return (
    <PronunciationLayout onBackPress={handleBack}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Pronunciation Rules</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <TextInput
            value={searchTerm}
            placeholder="Tìm kiếm quy tắc phát âm..."
            onChangeText={setSearchTerm}
            style={styles.searchInput}
            editable={!loading}
          />
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Tìm</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <LoadingWithContainer size={48} color="#F1BE4B" text="Đang tải quy tắc..." style={styles.centered} />
      )}

      {!loading && error && rules.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={fetchRules}>
            <Text style={styles.retryText}>Thử lại</Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && filteredRules.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Không tìm thấy quy tắc nào</Text>
        </View>
      ) : (
        !loading && !error && (
          <PronunciationRuleList rules={filteredRules} onSelectRule={handleRulePress} />
        )
      )}
    </PronunciationLayout>
  )
}

export default PronunciationRulesScreen

const styles = StyleSheet.create({
  titleContainer: { width: '100%', alignItems: 'center', marginTop: 12 },
  title: { fontSize: 36, fontWeight: '900', color: '#1F1F1F', fontFamily: 'Epilogue, sans-serif', textAlign: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '90%', maxWidth: 900, marginTop: 8, marginBottom: 16 },
  searchInputWrapper: { flex: 1 },
  searchInput: { width: '100%', height: 40, paddingHorizontal: 12, borderRadius: 100, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0' },
  searchButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F1BE4B' },
  searchButtonText: { fontSize: 14, fontWeight: '700', color: '#1F1F1F' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: 220 },
  errorText: { fontSize: 14, color: '#ff4d4f', marginBottom: 12, textAlign: 'center' },
  retryButton: { backgroundColor: '#F1BE4B', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  retryText: { fontSize: 14, fontWeight: '700', color: '#1F1F1F' },
  emptyText: { fontSize: 14, color: '#666' },
})