'use client'

import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { FlashcardTopicCard } from '../../components/flashcard'
import { NavigationPill } from 'components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { Navbar } from 'components/navbar'
import { FLASHCARD_TOPICS } from '../../mockData'
import { studyStyles } from '../../styles'

export function FlashcardListScreen({ onTopicPress, onBackPress, title = 'Flashcard' }) {
  return (
    <View style={styles.root}>
      <Navbar />

      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <View style={styles.backBtn}>
            <NavigationPill
              label="Quay lại"
              to={undefined}
              icon={ArrowIcon}
              iconStyle={{ transform: [{ scaleX: -1 }] }}
              onPress={onBackPress}
              textStyle={{ fontWeight: '700' }}
            />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>

        <View style={styles.listContainer}>
          {FLASHCARD_TOPICS.map((topic) => (
            <FlashcardTopicCard
              key={topic.id}
              icon={topic.icon}
              title={topic.title}
              subtitle={topic.subtitle}
              highlight={topic.highlight}
              muted={topic.muted}
              badgeText="펀"
              onPress={() => onTopicPress?.(topic.id)}
            />
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFD7D0',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 24,
  },
  contentWrapper: {
    width: '70%',
    maxWidth: 1200,
    alignItems: 'center',
    backgroundColor: '#F5F0DD',
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 16,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    alignSelf: 'flex-start',
  },
  title: {
    ...studyStyles.pageTitle,
  },
  listContainer: {
    width: '90%',
    maxWidth: 1200,
    gap: 16,
  },
})

export default FlashcardListScreen

