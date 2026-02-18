import React from 'react'
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native'

export function WordleKeyboard({ keys, keyStatuses, onPress }) {
  const allKeys = [...keys, 'Xóa', 'Gửi']

  return (
    <View style={styles.keyboard}>
      <View style={styles.row}>
        {allKeys.map((key) => {
          const status = keyStatuses[key]
          let keyStyle = styles.key
          let textStyle = styles.keyText

          if (key === 'Gửi') {
            keyStyle = [styles.key, styles.submitKey]
          } else if (key === 'Xóa') {
            keyStyle = [styles.key, styles.deleteKey]
          }

          if (status === 'correct') {
            keyStyle = [...(Array.isArray(keyStyle) ? keyStyle : [keyStyle]), styles.correct]
            textStyle = [styles.keyText, styles.whiteText]
          } else if (status === 'present') {
            keyStyle = [...(Array.isArray(keyStyle) ? keyStyle : [keyStyle]), styles.present]
            textStyle = [styles.keyText, styles.whiteText]
          } else if (status === 'absent') {
            keyStyle = [...(Array.isArray(keyStyle) ? keyStyle : [keyStyle]), styles.absent]
            textStyle = [styles.keyText, styles.whiteText]
          }

          return (
            <Pressable
              key={key}
              style={keyStyle}
              onPress={() => onPress(key)}
            >
              <Text style={textStyle}>{key}</Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  keyboard: {
    padding: 10,
    width: '100%',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  key: {
    minWidth: 45,
    height: 55,
    backgroundColor: '#d3d6da',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  submitKey: {
    minWidth: 65,
    backgroundColor: '#6aaa64',
  },
  deleteKey: {
    minWidth: 65,
    backgroundColor: '#787c7e',
  },
  correct: {
    backgroundColor: '#6aaa64',
  },
  present: {
    backgroundColor: '#c9b458',
  },
  absent: {
    backgroundColor: '#787c7e',
  },
  keyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1b',
  },
  whiteText: {
    color: '#fff',
  },
})

