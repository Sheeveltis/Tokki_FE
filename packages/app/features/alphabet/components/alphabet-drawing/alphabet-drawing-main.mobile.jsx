import React, { useRef, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { ReactSketchCanvas } from 'react-sketch-canvas'

/**
 * AlphabetDrawingMain (Mobile): Nội dung chính trang tập vẽ chữ cái Hàn Quốc trên mobile
 * Giữ đơn giản hơn web, tập trung khung vẽ + chữ mẫu.
 */
export function AlphabetDrawingMain({ onBackPress }) {
  const canvasRef = useRef(null)
  const [strokeColor, setStrokeColor] = useState('#000000')

  const handleClear = () => {
    canvasRef.current?.clearCanvas()
  }

  const handleUndo = () => {
    canvasRef.current?.undo()
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <Text style={styles.backText}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Tập vẽ chữ cái</Text>
      </View>

      {/* Chữ mẫu */}
      <View style={styles.sampleBox}>
        <Text style={styles.sampleLabel}>Chữ cần vẽ</Text>
        <Text style={styles.sampleChar}>가</Text>
        <Text style={styles.samplePronunciation}>[ga]</Text>
      </View>

      {/* Canvas */}
      <View style={styles.canvasWrapper}>
        <View style={styles.canvasBox}>
          <ReactSketchCanvas
            ref={canvasRef}
            style={styles.canvas}
            strokeWidth={6}
            strokeColor={strokeColor}
            canvasColor="#FFFFFF"
            withTimestamp={false}
          />
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionButton, styles.clearButton]} onPress={handleClear}>
            <Text style={styles.actionText}>Xoá</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleUndo}>
            <Text style={styles.actionText}>Hoàn tác</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.colorPickerRow}>
          {['#000000', '#FF4B4B', '#3B82F6', '#22C55E'].map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorDot,
                { backgroundColor: color },
                strokeColor === color && styles.colorDotActive,
              ]}
              onPress={() => setStrokeColor(color)}
            />
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1BE4B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  sampleBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F1BE4B',
  },
  sampleLabel: {
    fontSize: 12,
    color: '#555555',
    marginBottom: 4,
  },
  sampleChar: {
    fontSize: 56,
    fontWeight: '800',
    color: '#000000',
  },
  samplePronunciation: {
    marginTop: 2,
    fontSize: 14,
    color: '#333333',
  },
  canvasWrapper: {
    width: '100%',
    gap: 8,
  },
  canvasBox: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#D4D4D8',
  },
  canvas: {
    flex: 1,
  },
  actionsRow: {
    marginTop: 8,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F1BE4B',
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#FF9F9F',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  colorPickerRow: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  colorDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotActive: {
    borderColor: '#1F2937',
  },
})





