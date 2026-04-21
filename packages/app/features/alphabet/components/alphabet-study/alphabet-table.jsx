import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable } from 'react-native';

const AlphabetCell = ({ item, onSelectLetter, themeColor }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (item.isEmpty) {
    return <View style={[styles.cell, { borderRightWidth: 0, backgroundColor: 'transparent' }]} />;
  }

  return (
    <Pressable
      style={[
        styles.cell,
        isHovered && { backgroundColor: themeColor + '10' }
      ]}
      onPress={() => onSelectLetter(item.idx)}
      {...Platform.select({
        web: {
          onHoverIn: () => setIsHovered(true),
          onHoverOut: () => setIsHovered(false),
          onMouseEnter: () => setIsHovered(true),
          onMouseLeave: () => setIsHovered(false),
          cursor: 'pointer',
        }
      })}
    >
      <Text style={[styles.koreanText, isHovered && { color: themeColor }]}>{item.word}</Text>
      <Text style={[styles.romanText, isHovered && { color: themeColor }]}>{item.pronunciation}</Text>
    </Pressable>
  );
};

export function AlphabetTable({ data, onSelectLetter }) {
  const padRow = (rowItems, totalCols = 13) => {
    const padded = [...rowItems];
    let keyIdx = 0;
    while (padded.length < totalCols) {
      padded.push({ isEmpty: true, fallbackKey: `empty-${keyIdx++}` });
    }
    return padded;
  };

  const vowelsRow1 = padRow(data.filter(d => d.type === 'vowel' && d.row === 1).map((d) => ({...d, idx: data.indexOf(d)})));
  const vowelsRow2 = padRow(data.filter(d => d.type === 'vowel' && d.row === 2).map((d) => ({...d, idx: data.indexOf(d)})));
  const consRow1 = padRow(data.filter(d => d.type === 'consonant' && d.row === 1).map((d) => ({...d, idx: data.indexOf(d)})));
  const consRow2 = padRow(data.filter(d => d.type === 'consonant' && d.row === 2).map((d) => ({...d, idx: data.indexOf(d)})));

  const renderTitle = (title, color) => {
    return (
      <View style={styles.titleContainer}>
        <Text style={[styles.sideHeaderText, { color }]}>{title}</Text>
      </View>
    );
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.scrollWrapper} contentContainerStyle={styles.scrollContent}>
      <View style={styles.mainContainer}>
        {/* VOWELS SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>BẢNG NGUYÊN ÂM (VOWELS)</Text>
          <View style={[styles.tableBlock, styles.vowelsTableBorder]}>
            <View style={[styles.sideHeader, styles.vowelsSideBg]}>
              {renderTitle('NGUYÊN ÂM', '#D32F2F')}
            </View>
            <View style={styles.tableGrid}>
              <View style={styles.row}>
                {vowelsRow1.map((item, i) => (
                  <AlphabetCell key={item.word || item.fallbackKey || i} item={item} onSelectLetter={onSelectLetter} themeColor="#D32F2F" />
                ))}
              </View>
              <View style={[styles.row, { borderBottomWidth: 0 }]}>
                {vowelsRow2.map((item, i) => (
                  <AlphabetCell key={item.word || item.fallbackKey || i} item={item} onSelectLetter={onSelectLetter} themeColor="#D32F2F" />
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* CONSONANTS SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>BẢNG PHỤ ÂM (CONSONANTS)</Text>
          <View style={[styles.tableBlock, styles.consTableBorder]}>
            <View style={[styles.sideHeader, styles.consSideBg]}>
              {renderTitle('PHỤ ÂM', '#1976D2')}
            </View>
            <View style={styles.tableGrid}>
              <View style={styles.row}>
                {consRow1.map((item, i) => (
                  <AlphabetCell key={item.word || item.fallbackKey || i} item={item} onSelectLetter={onSelectLetter} themeColor="#1976D2" />
                ))}
              </View>
              <View style={[styles.row, { borderBottomWidth: 0 }]}>
                {consRow2.map((item, i) => (
                  <AlphabetCell key={item.word || item.fallbackKey || i} item={item} onSelectLetter={onSelectLetter} themeColor="#1976D2" />
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollWrapper: {
    width: '100%',
    marginTop: 20,
    marginBottom: 40,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  mainContainer: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 10,
  },
  sectionContainer: {
    marginBottom: 40,
    width: '100%',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tableBlock: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  vowelsTableBorder: {
    borderColor: '#FEE2E2',
  },
  consTableBorder: {
    borderColor: '#E0F2FE',
  },
  sideHeader: {
    width: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
  },
  vowelsSideBg: {
    backgroundColor: '#FFF5F5',
  },
  consSideBg: {
    backgroundColor: '#F0F9FF',
  },
  titleContainer: {
    width: 200, // Fixed width for rotation reference
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-90deg' }],
  },
  sideHeaderText: {
    fontWeight: '800',
    fontSize: 14,
    textAlign: 'center',
    width: 200,
    letterSpacing: 1,
  },
  tableGrid: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    width: '100%',
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
    ...(Platform.OS === 'web' && { transition: 'all 0.2s ease-in-out' }),
  },
  koreanText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: Platform.OS === 'web' ? 'Pretendard, system-ui, -apple-system, sans-serif' : undefined,
  },
  romanText: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '400',
  },
});
