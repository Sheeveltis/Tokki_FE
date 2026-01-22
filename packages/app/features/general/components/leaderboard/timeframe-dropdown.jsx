'use client'

import React, { useState } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, Platform, Modal, Pressable } from 'react-native'

const TIME_FRAMES = [
  { label: 'Ngày', value: 0 },
  { label: 'Tháng', value: 1 },
  { label: 'Năm', value: 2 },
  { label: 'Tất cả', value: 3 },
]

/**
 * Dropdown component để chọn timeFrame
 * @param {Object} props
 * @param {number} props.selectedTimeFrame - TimeFrame đang được chọn (0-3)
 * @param {Function} props.onTimeFrameChange - Callback khi timeFrame thay đổi
 */
export function TimeFrameDropdown({
  selectedTimeFrame = 0,
  onTimeFrameChange,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })

  const selectedLabel = TIME_FRAMES.find(f => f.value === selectedTimeFrame)?.label || 'Ngày'
  const containerRef = React.useRef(null)

  const handleOpen = () => {
    if (containerRef.current && Platform.OS === 'web') {
      const element = containerRef.current
      const rect = element.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
    }
    setIsOpen(true)
  }

  const handleSelect = (value) => {
    onTimeFrameChange(value)
    setIsOpen(false)
  }

  return (
    <View style={styles.container} ref={containerRef}>
      <TouchableOpacity
        style={styles.selectButton}
        onPress={handleOpen}
        activeOpacity={0.7}
      >
        <Text style={styles.selectButtonText}>{selectedLabel}</Text>
        <Text style={styles.chevron}>{isOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setIsOpen(false)}
        >
          <View 
            style={[
              styles.dropdownWrapper,
              Platform.OS === 'web' && {
                top: dropdownPosition.top,
                left: dropdownPosition.left,
              },
            ]}
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={[
                styles.dropdown,
                Platform.OS === 'web' && { width: dropdownPosition.width },
              ]}
            >
              {TIME_FRAMES.map((frame) => {
                const isSelected = selectedTimeFrame === frame.value
                if (Platform.OS === 'web') {
                  // Use div for web to ensure click events work
                  const WebItem = 'div'
                  return (
                    <WebItem
                      key={frame.value}
                      style={{
                        padding: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
                        backgroundColor: isSelected ? '#FFD4A8' : '#FFC69A',
                        cursor: 'pointer',
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        handleSelect(frame.value)
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = '#FFD4A8'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = '#FFC69A'
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          isSelected && styles.dropdownItemTextSelected,
                        ]}
                      >
                        {frame.label}
                      </Text>
                    </WebItem>
                  )
                }
                return (
                  <TouchableOpacity
                    key={frame.value}
                    style={[
                      styles.dropdownItem,
                      isSelected && styles.dropdownItemSelected,
                    ]}
                    onPress={(e) => {
                      e?.stopPropagation?.()
                      handleSelect(frame.value)
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        isSelected && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {frame.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 12,
    minWidth: 150,
    maxWidth: 200,
    zIndex: 10000,
  },
  selectButton: {
    backgroundColor: '#FFC69A',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 0,
  },
  selectButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '600',
  },
  chevron: {
    color: '#000',
    fontSize: 12,
    marginLeft: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownWrapper: {
    ...(Platform.OS === 'web' ? {
      position: 'absolute',
    } : {
      position: 'absolute',
      top: 100,
      left: 20,
    }),
  },
  dropdown: {
    backgroundColor: '#FFC69A',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    minWidth: 150,
    maxWidth: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
  },
  dropdownItemSelected: {
    backgroundColor: '#FFD4A8',
  },
  dropdownItemText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '500',
  },
  dropdownItemTextSelected: {
    fontWeight: '700',
  },
})
