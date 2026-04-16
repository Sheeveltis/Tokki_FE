import React from 'react'
import { Platform } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { usePronunciationRules } from '../hooks/usePronunciationRules'
import { PronunciationLayout } from '../components/layout/PronunciationLayout'
import { PronunciationRulesMain as WebMain } from '../components/PronunciationRulesMain.web'
import { PronunciationRulesMain as MobileMain } from '../components/PronunciationRulesMain.mobile'

/**
 * PronunciationRulesScreen: Trang danh sách quy tắc phát âm
 * Điều phối giữa web và mobile layout/main
 */
export function PronunciationRulesScreen({ onBackPress, onRulePress }) {
  const navigation = Platform.OS !== 'web' ? useNavigation() : null

  const {
    rules,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filteredRules,
    fetchRules,
  } = usePronunciationRules()

  const Main = Platform.OS === 'web' ? WebMain : MobileMain

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
      ruleDescription: rule.description,
      ruleContent: rule.content,
    })
  }

  return (
    <PronunciationLayout onBackPress={handleBack} title="Hướng dẫn phát âm">
      <Main
        rules={rules}
        loading={loading}
        error={error}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filteredRules={filteredRules}
        onRulePress={handleRulePress}
        onRetry={fetchRules}
      />
    </PronunciationLayout>
  )
}

export default PronunciationRulesScreen
