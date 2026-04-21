import React from 'react';
import { View, Text, StyleSheet, Platform, ScrollView } from 'react-native';

/**
 * AlphabetGuideInfo: Hiển thị hướng dẫn cấu trúc âm tiết Hàn Quốc
 * Dựa trên thiết kế premium cung cấp bởi người dùng.
 */
export function AlphabetGuideInfo() {
  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header section inspired by the HTML design */}
      <View style={styles.headerBox}>
        <Text style={styles.mainTitle}>Cấu Trúc Âm Tiết Tiếng Hàn</Text>
        <Text style={styles.subTitle}>Khám phá nguyên tắc hình thành khối chữ Hangeul</Text>
      </View>

      {/* 1. Nguyên tắc Hình Khối */}
      <View style={styles.section}>
        <View style={styles.headingRow}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>⊞</Text>
          </View>
          <Text style={styles.sectionHeading}>Nguyên tắc Hình Khối</Text>
        </View>
        <Text style={styles.paragraph}>
          Khác với tiếng Việt viết các chữ cái nối tiếp nhau trên một hàng ngang, tiếng Hàn sắp xếp các chữ cái vào trong một <Text style={styles.boldText}>khối vuông</Text> để tạo thành một âm tiết. Mỗi khối vuông này luôn bắt đầu bằng một phụ âm và theo sau là một nguyên âm.
        </Text>
      </View>

      {/* 2. Ví dụ Phân Tích (Premium visual representation) */}
      <View style={styles.exampleCard}>
        <Text style={styles.exampleTitle}>Ví dụ Phân Tích: <Text style={styles.accentKorean}>한 (Han)</Text></Text>

        <View style={styles.exampleLayout}>
          <View style={styles.syllableVisual}>
            <View style={styles.syllableBlock}>
              <View style={styles.blockGridRow}>
                <View style={[styles.partUnit, styles.consonantBox]}>
                  <Text style={styles.charRed}>ㅎ</Text>
                </View>
                <View style={[styles.partUnit, styles.vowelBox]}>
                  <Text style={styles.charGold}>ㅏ</Text>
                </View>
              </View>
              <View style={[styles.partUnit, styles.patchimBox]}>
                <Text style={styles.charGreen}>ㄴ</Text>
              </View>
            </View>
            <Text style={styles.caption}>Cấu trúc: Phụ âm + Nguyên âm + Patchim</Text>
          </View>

          <View style={styles.explanationList}>
            <DetailRow
              num="1"
              title="Phụ âm đầu (Choseong)"
              desc="Bắt đầu âm tiết. VD trong hình: ㅎ (h)"
              color="#D32F2F"
            />
            <DetailRow
              num="2"
              title="Nguyên âm (Jungseong)"
              desc="Âm chính ở giữa. VD trong hình: ㅏ (a)"
              color="#EAB308"
            />
            <DetailRow
              num="3"
              title="Phụ âm cuối (Patchim)"
              desc="Kết thúc âm tiết. VD trong hình: ㄴ (n)"
              color="#22C55E"
            />
          </View>
        </View>
      </View>

      {/* 3. Tóm tắt các thành phần */}
      <View style={styles.gridContainer}>
        <InfoBox
          title="Nguyên âm"
          color="#EAB308"
          items={[
            "Dạng đứng (ㅏ, ㅓ, ㅣ): Nằm bên phải phụ âm.",
            "Dạng nằm (ㅗ, ㅜ, ㅡ): Nằm bên dưới phụ âm."
          ]}
        />
        <InfoBox
          title="Phụ âm"
          color="#D32F2F"
          items={[
            "Gồm 19 chữ cái (14 cơ bản, 5 đôi).",
            "Luôn đứng vị trí đầu tiên của âm tiết.",
            "Âm câm ㅇ đứng trước nguyên âm."
          ]}
        />
        <InfoBox
          title="Patchim"
          color="#22C55E"
          items={[
            "Đứng ở vị trí cuối cùng âm tiết.",
            "Gồm patchim đơn và patchim kép.",
            "Có 7 cách phát âm cơ bản."
          ]}
        />
      </View>

      {/* 4. Quy tắc ghép từ */}
      <View style={styles.rulesSummary}>
        <Text style={styles.ruleLabel}>TÓM TẮT QUY TẮC GHÉP TỪ:</Text>
        <View style={styles.rulesList}>
          <RuleItem text="Viết từ trái sang phải" />
          <RuleItem text="Viết từ trên xuống dưới" />
          <RuleItem text="Luôn bắt đầu bằng Phụ âm" />
          <RuleItem text="Patchim luôn ở tầng dưới cùng" />
        </View>
      </View>
    </ScrollView>
  );
}

/**
 * DetailRow: Một dòng giải thích chi tiết với số thứ tự
 */
const DetailRow = ({ num, title, desc, color }) => (
  <View style={styles.detailRow}>
    <View style={[styles.numBadge, { backgroundColor: color }]}>
      <Text style={styles.numText}>{num}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.detailTitle}>{title}</Text>
      <Text style={styles.detailDesc}>{desc}</Text>
    </View>
  </View>
)

/**
 * InfoBox: Hộp thông tin khối
 */
const InfoBox = ({ title, color, items }) => (
  <View style={styles.infoBox}>
    <Text style={[styles.boxTitle, { color }]}>{title}</Text>
    {items.map((it, i) => (
      <View key={i} style={styles.listItemRow}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.boxItem}>{it}</Text>
      </View>
    ))}
  </View>
)

/**
 * RuleItem: Một mục tóm tắt quy tắc
 */
const RuleItem = ({ text }) => (
  <View style={styles.ruleItem}>
    <Text style={styles.checkIcon}>✓</Text>
    <Text style={styles.ruleText}>{text}</Text>
  </View>
)

const styles = StyleSheet.create({
  scrollContainer: {
    width: '100%',
  },
  container: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: '#fff',
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  headerBox: {
    backgroundColor: '#D32F2F',
    padding: 32,
    borderRadius: 24,
    marginBottom: 32,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 30px rgba(211, 47, 47, 0.15)',
    }),
  },
  mainTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: Platform.OS === 'web' ? 'Epilogue, sans-serif' : undefined,
  },
  subTitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 12,
    marginRight: 16,
  },
  iconEmoji: {
    fontSize: 24,
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  sectionHeading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: Platform.OS === 'web' ? 'Epilogue, sans-serif' : undefined,
  },
  paragraph: {
    fontSize: 16,
    color: '#4A4A4A',
    lineHeight: 26,
  },
  boldText: {
    fontWeight: '800',
    color: '#1A1A1A',
  },
  exampleCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 24,
    padding: 32,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
    }),
  },
  exampleTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
    color: '#333',
  },
  accentKorean: {
    color: '#D32F2F',
    fontSize: 32,
    fontWeight: '900',
  },
  exampleLayout: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: 40,
  },
  syllableVisual: {
    alignItems: 'center',
  },
  syllableBlock: {
    width: 210,
    height: 210,
    borderWidth: 5,
    borderColor: '#262626',
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 16,
    gap: 6,
  },
  blockGridRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  partUnit: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 2.5,
    borderStyle: 'dashed',
  },
  consonantBox: { backgroundColor: '#FFF0F0', borderColor: '#D32F2F' },
  vowelBox: { backgroundColor: '#FFFEF0', borderColor: '#EAB308' },
  patchimBox: { backgroundColor: '#F0FFF4', borderColor: '#22C55E' },
  charRed: { fontSize: 48, fontWeight: '900', color: '#D32F2F' },
  charGold: { fontSize: 48, fontWeight: '900', color: '#EAB308' },
  charGreen: { fontSize: 48, fontWeight: '900', color: '#22C55E' },
  explanationList: {
    gap: 24,
    flex: 1,
    maxWidth: 400,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  numBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  numText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  detailTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
  detailDesc: { fontSize: 14, color: '#666', fontStyle: 'italic' },
  gridContainer: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 20,
    marginBottom: 40,
  },
  infoBox: {
    flex: 1,
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EDEDED',
    ...(Platform.OS === 'web' && { transition: 'transform 0.2s ease' }),
  },
  boxTitle: { fontSize: 19, fontWeight: '800', marginBottom: 16 },
  listItemRow: { flexDirection: 'row', marginBottom: 10 },
  bullet: { color: '#999', marginRight: 10, fontSize: 18, lineHeight: 22 },
  boxItem: { fontSize: 15, color: '#555', flex: 1, lineHeight: 22 },
  rulesSummary: {
    backgroundColor: '#F0F7FF',
    borderRadius: 24,
    padding: 32,
    borderLeftWidth: 6,
    borderLeftColor: '#3B82F6',
  },
  ruleLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#2563EB',
    marginBottom: 20,
    letterSpacing: 1.5,
  },
  rulesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: Platform.OS === 'web' ? '45%' : '100%',
    gap: 12,
  },
  checkIcon: { color: '#3B82F6', fontWeight: '900', fontSize: 18 },
  ruleText: { fontSize: 15, color: '#1E40AF', fontWeight: '600' },
  caption: {
    marginTop: 16,
    fontSize: 13,
    color: '#999',
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
});

