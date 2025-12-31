import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native'

/**
 * DatePicker Component cho React Native
 * 
 * @param {{
 *   label?: string
 *   placeholder?: string
 *   value?: string - Format: YYYY-MM-DD
 *   onChange?: (date: string) => void
 *   style?: Object
 * }} props
 */
export function DatePicker({ label, placeholder, value, onChange, style }) {
  const [showModal, setShowModal] = useState(false)
  const [selectedYear, setSelectedYear] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)

  // Parse value nếu có
  React.useEffect(() => {
    if (value) {
      const [year, month, day] = value.split('-')
      setSelectedYear(year ? parseInt(year) : null)
      setSelectedMonth(month ? parseInt(month) : null)
      setSelectedDay(day ? parseInt(day) : null)
    }
  }, [value])

  // Tạo danh sách năm (từ 1950 đến năm hiện tại)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i)

  // Tạo danh sách tháng
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  // Tạo danh sách ngày dựa trên tháng và năm
  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate()
  }

  const days = selectedYear && selectedMonth
    ? Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => i + 1)
    : Array.from({ length: 31 }, (_, i) => i + 1)

  const handleConfirm = () => {
    if (selectedYear && selectedMonth && selectedDay) {
      const formattedDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
      onChange?.(formattedDate)
      setShowModal(false)
    }
  }

  const handleCancel = () => {
    setShowModal(false)
  }

  const displayValue = value || placeholder || 'Chọn ngày sinh'

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowModal(true)}
      >
        <Text style={[styles.inputText, !value && styles.placeholder]}>
          {displayValue}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={styles.modalButton}>Hủy</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Chọn ngày sinh</Text>
              <TouchableOpacity
                onPress={handleConfirm}
                disabled={!selectedYear || !selectedMonth || !selectedDay}
              >
                <Text
                  style={[
                    styles.modalButton,
                    (!selectedYear || !selectedMonth || !selectedDay) && styles.modalButtonDisabled,
                  ]}
                >
                  Xác nhận
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContainer}>
              {/* Năm */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Năm</Text>
                <ScrollView style={styles.pickerScrollView}>
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.pickerItem,
                        selectedYear === year && styles.pickerItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedYear(year)
                        // Reset ngày nếu tháng đã chọn
                        if (selectedMonth) {
                          const maxDay = getDaysInMonth(selectedMonth, year)
                          if (selectedDay > maxDay) {
                            setSelectedDay(null)
                          }
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedYear === year && styles.pickerItemTextSelected,
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Tháng */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Tháng</Text>
                <ScrollView style={styles.pickerScrollView}>
                  {months.map((month) => (
                    <TouchableOpacity
                      key={month}
                      style={[
                        styles.pickerItem,
                        selectedMonth === month && styles.pickerItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedMonth(month)
                        // Reset ngày nếu năm đã chọn
                        if (selectedYear) {
                          const maxDay = getDaysInMonth(month, selectedYear)
                          if (selectedDay > maxDay) {
                            setSelectedDay(null)
                          }
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedMonth === month && styles.pickerItemTextSelected,
                        ]}
                      >
                        {month}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Ngày */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Ngày</Text>
                <ScrollView style={styles.pickerScrollView}>
                  {days.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.pickerItem,
                        selectedDay === day && styles.pickerItemSelected,
                      ]}
                      onPress={() => setSelectedDay(day)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedDay === day && styles.pickerItemTextSelected,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
    fontFamily: 'Epilogue, sans-serif',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    minHeight: 48,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Epilogue, sans-serif',
  },
  placeholder: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 10,
    maxHeight: 220,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Lexend, sans-serif',
  },
  modalButton: {
    fontSize: 14,
    color: '#5E794C',
    fontWeight: '600',
    fontFamily: 'Epilogue, sans-serif',
  },
  modalButtonDisabled: {
    color: '#CCC',
  },
  pickerContainer: {
    flexDirection: 'row',
    paddingHorizontal: 6,
    paddingVertical: 10,
    height: 150,
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: 2,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
  },
  pickerScrollView: {
    flex: 1,
  },
  pickerItem: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    marginVertical: 1,
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: '#5E794C',
  },
  pickerItemText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Epilogue, sans-serif',
  },
  pickerItemTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
})

