import React from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'

const MOCK_TYPES = ['Lỗi giao diện', 'Không bấm được nút', 'Lỗi nội dung', 'Khác']

export const ErrorType = ({ type, isOpen, onToggle, onSelect, options = MOCK_TYPES }) => {
  return (
    <View style={{ position: 'relative', zIndex: 20 }}>
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.8}
        style={{
          backgroundColor: '#F3F3F3',
          borderRadius: 12,
          height: 56,
          paddingHorizontal: 16,
          borderWidth: 1,
          borderColor: '#E5E5E5',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: type ? '#2D2D2D' : '#9B9B9B',
            fontFamily: 'Epilogue, sans-serif',
          }}
        >
          {type || 'Loại'}
        </Text>
        <Text style={{ fontSize: 18, color: '#f7941d' }}>⌄</Text>
      </TouchableOpacity>

      {isOpen && (
        <View
          style={{
            position: 'absolute',
            top: 60,
            left: 0,
            right: 0,
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#E5E5E5',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 6,
            zIndex: 30,
            maxHeight: 180,
            overflow: 'hidden',
          }}
        >
          <ScrollView>
            {options.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => onSelect && onSelect(item)}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderBottomWidth: item === options[options.length - 1] ? 0 : 1,
                  borderBottomColor: '#EFEFEF',
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: '#2D2D2D',
                    fontFamily: 'Epilogue, sans-serif',
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

