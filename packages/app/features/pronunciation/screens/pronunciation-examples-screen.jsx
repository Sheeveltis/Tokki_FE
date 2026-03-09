import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Platform, View, Text, StyleSheet, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useRoute } from '@react-navigation/native'
import { LoadingWithContainer } from '../../../../components/Loading'
import { getPronunciationExamplesByRuleId } from '../api'
import { PronunciationExampleList } from '../components'
import { PronunciationLayout } from '../components/layout/pronunciation-layout'

export function PronunciationExamplesScreen({ ruleId: ruleIdProp, ruleTitle: ruleTitleProp, onBackPress, onExamplePress }) {
  const navigation = Platform.OS !== 'web' ? useNavigation() : null
  const route = Platform.OS !== 'web' ? useRoute() : null
  const ruleId = ruleIdProp || route?.params?.ruleId
  const ruleTitle = ruleTitleProp || route?.params?.ruleTitle || 'Pronunciation Rule'

  const [examples, setExamples] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const canLoad = useMemo(() => Boolean(ruleId), [ruleId])

  const fetchExamples = useCallback(async () => {
    if (!canLoad) {
      setExamples([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const data = await getPronunciationExamplesByRuleId(ruleId)
      setExamples(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message || 'Không thể tải danh sách examples')
      setExamples([])
    } finally {
      setLoading(false)
    }
  }, [canLoad, ruleId])

  useEffect(() => {
    fetchExamples()
  }, [fetchExamples])

  const handleBack = () => {
    if (onBackPress) {
      onBackPress()
      return
    }
    if (navigation?.canGoBack?.()) navigation.goBack()
  }

  const handleExamplePress = (example) => {
    if (!example?.id) return
    if (onExamplePress) {
      onExamplePress(example)
      return
    }
    navigation?.navigate('pronunciation-example-detail', {
      exampleId: String(example.id),
      ruleId: String(ruleId),
      ruleTitle,
    })
  }

  return (
    <PronunciationLayout onBackPress={handleBack}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{ruleTitle}</Text>
      </View>

      {loading && (
        <LoadingWithContainer size={48} color="#F1BE4B" text="Đang tải danh sách examples..." style={styles.centered} />
      )}

      {!loading && error && examples.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={fetchExamples}>
            <Text style={styles.retryText}>Thử lại</Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && examples.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Chưa có example cho rule này</Text>
        </View>
      ) : (
        !loading && !error && (
          <PronunciationExampleList examples={examples} onSelectExample={handleExamplePress} />
        )
      )}
    </PronunciationLayout>
  )
}

export default PronunciationExamplesScreen

const styles = StyleSheet.create({
  titleContainer: { width: '100%', alignItems: 'center', marginTop: 12, marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '700', color: '#1F1F1F', fontFamily: 'Epilogue, sans-serif', textAlign: 'center' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: 220 },
  errorText: { fontSize: 14, color: '#ff4d4f', marginBottom: 12, textAlign: 'center' },
  retryButton: { backgroundColor: '#F1BE4B', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  retryText: { fontSize: 14, fontWeight: '700', color: '#1F1F1F' },
  emptyText: { fontSize: 14, color: '#666' },
})