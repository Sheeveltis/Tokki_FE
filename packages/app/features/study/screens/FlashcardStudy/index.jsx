'use client'

import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, Image } from 'react-native'
import { Navbar } from 'components/navbar'
import { NavigationPill } from 'components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import BookmarkIcon from '../../../../../assets/icon/icon-mainflow/bookmark.svg'
import StarIcon from '../../../../../assets/icon/icon-mainflow/star.svg'
import { FlashcardActionButton, FlashcardVocabularyList } from '../../components/flashcard'
import { FlipCard } from 'components/FlipCard'
import BunnyStudy from '../../../../../assets/bunny/14.png'
import BunnyTest from '../../../../../assets/bunny/15.png'
import { FLASHCARDS } from '../../mockData'
import { normalizeImageSource } from '../../api'
import { studyStyles } from '../../styles'

export function FlashcardStudyScreen({
    title = 'Flashcard',
    onBackPress,
    onLearnPress,
    onTestPress,
}) {
    const [index, setIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [favorites, setFavorites] = useState(new Set())

    const current = FLASHCARDS[index % FLASHCARDS.length]
    const isFavorite = favorites.has(index)

    const handleNext = () => {
        setIsFlipped(false)
        setIndex((prev) => (prev + 1) % FLASHCARDS.length)
    }

    const handlePrev = () => {
        setIsFlipped(false)
        setIndex((prev) => (prev - 1 + FLASHCARDS.length) % FLASHCARDS.length)
    }

    const handleSelectFlashcard = (newIndex) => {
        setIsFlipped(false)
        setIndex(newIndex)
    }

    const toggleFavorite = () => {
        setFavorites((prev) => {
            const next = new Set(prev)
            if (next.has(index)) {
                next.delete(index)
            } else {
                next.add(index)
            }
            return next
        })
    }

    return (
        <View style={styles.root}>
            <Navbar />

            <View style={styles.contentWrapper}>
                {/* Header with back and title */}
                <View style={styles.header}>
                    <NavigationPill
                        label="Trở lại"
                        to={undefined}
                        icon={ArrowIcon}
                        iconStyle={{ transform: [{ scaleX: -1 }] }}
                        onPress={onBackPress}
                        textStyle={{ fontWeight: '700' }}
                    />

                </View>
                <View>
                    <Text style={styles.title}>{title}</Text>
                </View>

                {/* Action buttons */}
                <View style={styles.actions}>
                    <FlashcardActionButton
                        icon={BunnyStudy}
                        title="Học"
                        onPress={onLearnPress}
                    />
                    <FlashcardActionButton
                        icon={BunnyTest}
                        title="Kiểm tra"
                        onPress={onTestPress}
                    />
                </View>

                {/* Flashcard */}
                <View style={styles.cardContainer}>
                    <FlipCard
                        word={current.word}
                        meaning={current.meaning}
                        width="100%"
                        height={500}
                        frontColor="#79964E"
                        backColor="#79964E"
                        borderWidth={12}
                        borderRadius={12}
                        flipOnHover={false}
                        isFlipped={isFlipped}
                        onFlip={(flipped) => setIsFlipped(flipped)}
                        starIcon={normalizeImageSource(StarIcon)}
                        isFavorite={isFavorite}
                        onToggleFavorite={toggleFavorite}
                    />
                </View>

                {/* Pagination */}
                <View style={styles.pagination}>
                    <Pressable style={styles.navBtn} onPress={handlePrev}>
                        <Image source={normalizeImageSource(ArrowIcon)} style={[styles.navIcon, { transform: [{ scaleX: -1 }] }]} resizeMode="contain" />
                    </Pressable>
                    <Text style={styles.pageText}>
                        {index + 1} / {FLASHCARDS.length}
                    </Text>
                    <Pressable style={styles.navBtn} onPress={handleNext}>
                        <Image source={normalizeImageSource(ArrowIcon)} style={styles.navIcon} resizeMode="contain" />
                    </Pressable>
                </View>

                {/* Vocabulary List */}
                <FlashcardVocabularyList
                    flashcards={FLASHCARDS}
                    currentIndex={index}
                    favorites={favorites}
                    onSelectFlashcard={handleSelectFlashcard}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#FFD7D0',
        alignItems: 'center',
        paddingVertical: 16,
    },
    contentWrapper: {
        width: '70%',
        maxWidth: 1200,
        gap: 20,
        alignItems: 'center',
        backgroundColor: '#F5F0DD',
        paddingVertical: 24,
        paddingHorizontal: 24,
        borderRadius: 16,
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    title: {
        ...studyStyles.pageTitle,
        flex: 1,
    },
    actions: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    cardContainer: {
        width: '100%',
        height: 524, // 500 + 12*2 (border)
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginTop: 8,
    },
    navBtn: {
        width: 44,
        height: 44,
        borderRadius: 16,
        backgroundColor: '#F1BE4B',
        alignItems: 'center',
        justifyContent: 'center',
    },
    navIcon: {
        width: 20,
        height: 20,
        tintColor: '#1F1F1F',
    },
    pageText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F1F1F',
    },
})

export default FlashcardStudyScreen

