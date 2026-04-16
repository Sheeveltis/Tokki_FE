import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable } from 'react-native';

const AlphabetCell = ({ item, onSelectLetter }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (item.isEmpty) {
    return <View style={[styles.cell, { borderRightWidth: 0, backgroundColor: 'transparent' }]} />;
  }

  return (
    <Pressable
      style={[
        styles.cell,
        isHovered && styles.cellHovered
      ]}
      onPress={() => onSelectLetter(item.idx)}
      {...Platform.select({
        web: {
          onHoverIn: () => setIsHovered(true),
          onHoverOut: () => setIsHovered(false),
          onMouseEnter: () => setIsHovered(true),
          onMouseLeave: () => setIsHovered(false),
        }
      })}
    >
      <Text style={[styles.koreanText, isHovered && styles.textHovered]}>{item.word}</Text>
      <Text style={[styles.romanText, isHovered && styles.textHovered]}>{item.pronunciation}</Text>
    </Pressable>
  );
};

export function AlphabetTable({ data, onSelectLetter }) {
  const padRow = (rowItems, totalCols = 11) => {
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

  const renderVerticalTitle = (title) => {
    return (
      <View style={styles.verticalTitleWrapper}>
        {title.split(' ').map((word, wordIdx) => (
          <View key={wordIdx} style={{ marginBottom: 8 }}>
            {word.split('').map((char, charIdx) => (
              <Text key={charIdx} style={styles.sectionTitleText}>{char}</Text>
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.scrollWrapper} contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        {/* NGUYÊN ÂM */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionTitleContainer}>
            {renderVerticalTitle('NGUYÊN ÂM')}
          </View>
          <View style={styles.table}>
            <View style={styles.row}>
              {vowelsRow1.map((item, i) => (
                <AlphabetCell key={item.word || item.fallbackKey || i} item={item} onSelectLetter={onSelectLetter} />
              ))}
            </View>
            <View style={styles.row}>
              {vowelsRow2.map((item, i) => (
                <AlphabetCell key={item.word || item.fallbackKey || i} item={item} onSelectLetter={onSelectLetter} />
              ))}
            </View>
          </View>
        </View>

        {/* PHỤ ÂM */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionTitleContainer}>
             {renderVerticalTitle('PHỤ ÂM')}
          </View>
          <View style={styles.table}>
            <View style={styles.row}>
              {consRow1.map((item, i) => (
                <AlphabetCell key={item.word || item.fallbackKey || i} item={item} onSelectLetter={onSelectLetter} />
              ))}
            </View>
            <View style={styles.row}>
              {consRow2.map((item, i) => (
                <AlphabetCell key={item.word || item.fallbackKey || i} item={item} onSelectLetter={onSelectLetter} />
              ))}
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
    marginTop: 10,
    marginBottom: 40,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    borderWidth: 2,
    borderColor: '#D32F2F',
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 1200,
    minWidth: 800,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  sectionRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#D32F2F',
  },
  sectionTitleContainer: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 2,
    borderRightColor: '#D32F2F',
    backgroundColor: '#fafafa',
  },
  verticalTitleWrapper: {
    alignItems: 'center',
  },
  sectionTitleText: {
    fontWeight: '900',
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  table: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
    width: '100%',
  },
  cell: {
    flex: 1,
    aspectRatio: 1.1, // controls height relative to fluid width
    borderRightWidth: 1,
    borderRightColor: '#efefef',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
    ...(Platform.OS === 'web' && { transition: 'background-color 0.2s ease' }),
  },
  cellHovered: {
    backgroundColor: '#FFF0F0', // light red tint overlay
    cursor: 'pointer',
  },
  koreanText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
  },
  romanText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  textHovered: {
    color: '#D32F2F',
  }
});
