import React, { useEffect, useRef, useState } from 'react'
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  Pressable,
  Animated,
} from 'react-native'

import BackgroundImageSource from '../../../../../../../assets/background4.png'
import { getMockSolitareLayout } from '../../../../api/solitare-play-api'
import { SolitarePlayCard } from './solitare-play-card'
import { SolitarePlayTopicCard } from './solitare-play-topic-card'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

/**
 * Body của game Solitaire
 * - Hàng trên: các ô topic (ban đầu trống)
 * - Hàng dưới: các cột card được random layout từ mock API
 *
 * Quy tắc (mock):
 * - Mỗi cột thuộc 1 topic (habit, family, ...).
 * - Card trên cùng của mỗi cột được lật mặt sau (hiện từ vựng) và có thể click.
 * - Khi click vào card mặt sau:
 *   + Tìm ô topic trống -> gán topicId cho ô đó và đặt card vào.
 *   + Hoặc nếu đã có ô mang topicId đó -> đặt card chồng lên ô đó.
 *   + Các topic slot khác không nhận card khác topic.
 */
export function SolitarePlayBody() {
  const [columns, setColumns] = useState([]) // [{ id, name, cards: [{id,text,topicId}] }]
  const [slots, setSlots] = useState([]) // [{ topicId: string|null, name?: string, cards: [] }]
  const [selectedCard, setSelectedCard] = useState(null) // { columnIndex, cardIndex, cardId }
  const [celebrateSlot, setCelebrateSlot] = useState(null)
  const [movingCard, setMovingCard] = useState(null) // { card, from, to, columnIndex, cardIndex, slotIndex, success }
  const movingPos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current
  const cardRefs = useRef({}) // cardId -> ref
  const slotRefs = useRef({}) // slotIndex -> ref

  const measureInWindow = (ref) =>
    new Promise((resolve) => {
      if (!ref?.measureInWindow) return resolve(null)
      ref.measureInWindow((x, y, width, height) => resolve({ x, y, width, height }))
    })

  useEffect(() => {
    const layout = getMockSolitareLayout(7)
    setColumns(layout)
    setSlots(layout.map(() => ({ topicId: null, name: null, cards: [] })))
  }, [])

  const handleCardPress = (columnIndex, cardIndex) => {
    const col = columns[columnIndex]
    if (!col) return

    const topIndex = col.cards.length - 1
    if (cardIndex !== topIndex) return // chỉ card trên cùng mới được chọn

    const card = col.cards[cardIndex]
    if (!card) return

    setSelectedCard((prev) => {
      if (prev && prev.columnIndex === columnIndex && prev.cardIndex === cardIndex) {
        return null
      }
      return { columnIndex, cardIndex, cardId: card.id }
    })
  }

  const handleSlotPress = async (slotIndex) => {
    if (!selectedCard) return

    const { columnIndex, cardIndex, cardId } = selectedCard
    const col = columns[columnIndex]
    if (!col) return

    const topIndex = col.cards.length - 1
    if (cardIndex !== topIndex) return

    const card = col.cards[cardIndex]
    if (!card) return

    const cardRef = cardRefs.current[cardId]
    const slotRef = slotRefs.current[slotIndex]

    const from = await measureInWindow(cardRef)
    const to = await measureInWindow(slotRef)
    if (!from || !to) return

    const slot = slots[slotIndex]
    const success = !slot.topicId || slot.topicId === card.topicId

    // Bắt đầu animation di chuyển card
    setMovingCard({
      card,
      columnIndex,
      cardIndex,
      slotIndex,
      success,
    })

    // Đặt vị trí xuất phát (outside of game board, absolute coords)
    movingPos.setValue({ x: from.x, y: from.y })

    Animated.spring(movingPos, {
      toValue: { x: to.x, y: to.y },
      useNativeDriver: true,
      stiffness: 900,
      damping: 55,
      mass: 1,
    }).start(() => {
      if (success) {
        // Cập nhật state sau khi animation thành công
        setSlots((prevSlots) => {
          const updatedSlots = prevSlots.map((s, idx) => {
            if (idx !== slotIndex) return s
            const topicId = s.topicId || card.topicId
            const name = s.name || card.text
            return {
              ...s,
              topicId,
              name,
              cards: [...s.cards, card],
            }
          })
          return updatedSlots
        })

        setColumns((prevCols) => {
          const newCols = prevCols.map((c, idx) => {
            if (idx !== columnIndex) return c
            return {
              ...c,
              cards: c.cards.filter((_, i) => i !== cardIndex),
            }
          })
          return newCols
        })

        setSelectedCard(null)
        setCelebrateSlot(slotIndex)
        setTimeout(() => setCelebrateSlot(null), 600)
        setMovingCard(null)
      } else {
        // Không hợp topic -> bay ngược về chỗ cũ
        Animated.spring(movingPos, {
          toValue: { x: from.x, y: from.y },
          useNativeDriver: true,
          stiffness: 900,
          damping: 65,
          mass: 1,
        }).start(() => {
          setMovingCard(null)
        })
      }
    })
  }

  return (
    <ImageBackground
      source={normalizeImageSource(BackgroundImageSource)}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.container}>
        {/* Hàng topic slots phía trên */}
        <View style={styles.topicRow}>
          {slots.map((slot, index) => (
            <View key={`slot-${index}`} style={styles.topicSlot}>
              <Pressable
                ref={(r) => {
                  if (r) slotRefs.current[index] = r
                }}
                onPress={() => handleSlotPress(index)}
              >
                <SolitarePlayTopicCard>
                  {slot.topicId && (
                    <Text style={styles.topicText}>{slot.name}</Text>
                  )}
                </SolitarePlayTopicCard>
              </Pressable>
              {celebrateSlot === index && (
                <View style={styles.celebrate}>
                  <Text style={styles.celebrateText}>✨</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Các cột card phía dưới */}
        <View style={styles.columnsRow}>
          {columns.map((column, colIndex) => (
            <View key={column.id} style={styles.column}>
              {column.cards.map((card, cardIndex) => {
                const isTop = cardIndex === column.cards.length - 1
                const isFront = !isTop
                const isSelected =
                  selectedCard &&
                  selectedCard.columnIndex === colIndex &&
                  selectedCard.cardIndex === cardIndex

                const isMoving =
                  movingCard && movingCard.card && movingCard.card.id === card.id
                if (isMoving) {
                  return null
                }

                return (
                  <View
                    key={card.id}
                    style={[
                      styles.cardWrapper,
                      cardIndex !== 0 && styles.cardStacked,
                    ]}
                    ref={(r) => {
                      if (r) cardRefs.current[card.id] = r
                    }}
                  >
                    <SolitarePlayCard
                      isFront={isFront}
                      text={card.text}
                      isSelected={!!isSelected}
                      onPress={isTop ? () => handleCardPress(colIndex, cardIndex) : undefined}
                    />
                  </View>
                )
              })}
            </View>
          ))}
        </View>
      </View>

      {movingCard && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.movingCard,
            { transform: [{ translateX: movingPos.x }, { translateY: movingPos.y }] },
          ]}
        >
          <SolitarePlayCard
            isFront={false}
            text={movingCard.card.text}
            isSelected={false}
          />
        </Animated.View>
      )}
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    
  },
  backgroundImage: {
    resizeMode: 'cover',
    borderRadius: 30,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  topicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  topicSlot: {
    flex: 1,
    alignItems: 'center',
  },
  topicText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1C1C',
  },
  columnsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flex: 1,
  },
  column: {
    flexGrow: 1,
    alignItems: 'center',
  },
  cardWrapper: {
    marginBottom: 4,
  },
  cardStacked: {
    marginTop: -145.2, 
  },
  celebrate: {
    position: 'absolute',
    top: -10,
    right: 10,
  },
  celebrateText: {
    fontSize: 20,
  },
  movingCard: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 20,
  },
})

export default SolitarePlayBody


