import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

export function AlphabetGuideInfo() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>HƯỚNG DẪN KHẨU HÌNH VÀ TÍNH CHẤT ÂM</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Hệ thống Nguyên âm (Vowels)</Text>
        <Text style={styles.text}>Nguyên âm trong tiếng Hàn mang tính chất "tĩnh" và định hình âm thanh chính.</Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>• <Text style={styles.bold}>Nhóm nguyên âm đơn:</Text> Chia theo hướng của nét gạch.</Text>
          <Text style={styles.subItem}>  - Hướng ra ngoài/lên trên: Mang sắc thái tươi sáng (ㅏ - a, ㅗ - ô).</Text>
          <Text style={styles.subItem}>  - Hướng vào trong/xuống dưới: Mang sắc thái trầm tối (ㅓ - o, ㅜ - u).</Text>
          <Text style={styles.listItem}>• <Text style={styles.bold}>Nguyên âm phái sinh</Text> (Thêm nét gạch): Chỉ cần thêm âm "y" vào trước âm gốc.</Text>
          <Text style={styles.subItem}>  - ㅏ (a) → ㅑ (ya), ㅓ (o) → ㅕ (yo)</Text>
          <Text style={styles.subItem}>  - ㅗ (ô) → ㅛ (yô), ㅜ (u) → ㅠ (yu)</Text>
          <Text style={styles.listItem}>• <Text style={styles.bold}>Nguyên âm ghép:</Text> Kết hợp mặt chữ của 2 nguyên âm đơn. Khi đọc, miệng chuyển động từ âm thứ nhất sang âm thứ hai thật nhanh (VD: o + a = oa).</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Hệ thống Phụ âm (Consonants)</Text>
        <Text style={styles.text}>Phần quan trọng nhất quyết định độ "tự nhiên" khi nói. Chia làm 3 cường độ:</Text>
        
        <Text style={styles.subHeading}>a. Phụ âm thường (Lỏng)</Text>
        <Text style={styles.text}>Các âm: <Text style={styles.bold}>ㄱ, ㄴ, ㄷ, ㄹ, ㅁ, ㅂ, ㅅ, ㅇ, ㅈ.</Text></Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>• <Text style={styles.bold}>Đặc điểm:</Text> Phát âm nhẹ nhàng, không gồng cơ cổ, không đẩy hơi mạnh.</Text>
          <Text style={styles.listItem}>• <Text style={styles.bold}>Lưu ý:</Text> Chữ <Text style={styles.bold}>ㅇ</Text> khi đứng đầu (không ghép) là âm câm, chỉ đóng vai trò "giữ chỗ".</Text>
        </View>

        <Text style={styles.subHeading}>b. Phụ âm bật hơi (Mạnh)</Text>
        <Text style={styles.text}>Các âm: <Text style={styles.bold}>ㅋ, ㅌ, ㅍ, ㅊ.</Text></Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>• <Text style={styles.bold}>Đặc điểm:</Text> Phiên bản "nâng cấp" của phụ âm thường với luồng hơi mạnh từ phổi đẩy ra.</Text>
          <Text style={styles.listItem}>• <Text style={styles.bold}>Cách kiểm tra:</Text> Đặt một tờ giấy trước miệng, khi phát âm tờ giấy phải rung mạnh hoặc bay đi.</Text>
          <Text style={styles.subItem}>  - ㄱ (k) → ㅋ (kh), ㄷ (t) → ㅌ (th), ㅂ (p) → ㅍ (ph)</Text>
        </View>

        <Text style={styles.subHeading}>c. Phụ âm căng (Gồng)</Text>
        <Text style={styles.text}>Các âm đôi: <Text style={styles.bold}>ㄲ, ㄸ, ㅃ, ㅆ, ㅉ.</Text></Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>• <Text style={styles.bold}>Đặc điểm:</Text> Nén hơi lại ở cổ họng rồi bật ra dứt khoát. Cảm giác cơ cổ hơi gồng lên một chút (không đẩy luồng hơi mạnh).</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Quy tắc viết từng nét (Stroke Order)</Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>• <Text style={styles.bold}>Luôn luôn:</Text> Trái trước - Phải sau.</Text>
          <Text style={styles.listItem}>• <Text style={styles.bold}>Luôn luôn:</Text> Trên trước - Dưới sau.</Text>
          <Text style={styles.listItem}>• <Text style={styles.bold}>Ví dụ chữ ㄹ:</Text> Không vẽ ngoằn ngoèo mà chia làm 3 lần nhấc bút (nét ngang/dọc, nét ngang, nét dọc/ngang).</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    marginTop: 20,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#D32F2F',
    marginBottom: 24,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
    paddingBottom: 8,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 6,
  },
  text: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
    marginBottom: 8,
  },
  list: {
    paddingLeft: 8,
    gap: 4,
  },
  listItem: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
  },
  subItem: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
    marginLeft: 16,
  },
  bold: {
    fontWeight: '700',
    color: '#1A1A1A',
  }
});
