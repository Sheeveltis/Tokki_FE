import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { NavigationPill } from '../../../../../components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { Navbar } from '../../../../../components/navbar'

export function RoadmapTipsLayout({ tipId }) {
  const router = useRouter()

  return (
    <View style={styles.wrapper}>
      <Navbar />
      <View style={styles.contentWrapper}>
        <View style={styles.backButtonContainer}>
          <NavigationPill
            label="Quay lại"
            to={undefined}
            onPress={() => router.back()}
            icon={ArrowIcon}
            textStyle={{ fontWeight: '700' }}
            iconStyle={{ transform: [{ scaleX: -1 }] }}
          />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.kicker}>Blog Hướng Dẫn</Text>
            <Text style={styles.title}>Cách học theo Lộ trình TOPIK hiệu quả nhất</Text>
            <Text style={styles.subtitle}>
              Một vài tips nhỏ để bạn tận dụng tối đa phần Nghe / Đọc / Viết trong lộ trình, giống như đang đọc blog chia sẻ kinh nghiệm.
            </Text>
          </View>

          <View style={styles.article}>
            <Text style={styles.sectionTag}>Nghe hiểu</Text>
            <Text style={styles.sectionTitle}>1. Nghe 2 lần trước khi nhìn đáp án</Text>
            <Text style={styles.paragraph}>
              Lần đầu, hãy chỉ tập trung nghe toàn bộ đoạn hội thoại để nắm bối cảnh chung (ai, ở đâu, đang nói về điều gì).
              Lần thứ hai, bạn mới bắt đầu để ý từ khóa, con số, thời gian, địa điểm... Những thông tin này thường quyết định đáp án đúng.
            </Text>
            <Text style={styles.paragraph}>
              Đừng pause quá nhiều ở lần nghe đầu, hãy để não quen với nhịp và âm điệu tiếng Hàn tự nhiên. Sau đó bạn có thể tua lại từng câu
              ở phần luyện tập để phân tích kỹ hơn.
            </Text>

            <Text style={styles.sectionTitle}>2. Ghi lại cụm từ chứ không chỉ từng từ</Text>
            <Text style={styles.paragraph}>
              Khi nghe, hãy thử note lại cụm từ hoàn chỉnh (ví dụ: &quot;학교에 가요&quot;, &quot;친구를 만나요&quot;) thay vì chỉ từng từ rời rạc.
              Điều này giúp bạn quen với cấu trúc câu thường gặp trong đề TOPIK và ghi nhớ nhanh hơn.
            </Text>

            <Text style={styles.sectionTag}>Đọc hiểu</Text>
            <Text style={styles.sectionTitle}>3. Đọc câu hỏi trước, đoạn văn sau</Text>
            <Text style={styles.paragraph}>
              Trước khi đọc đoạn văn, hãy xem nhanh câu hỏi và 4 đáp án. Bạn sẽ biết mình cần tìm loại thông tin nào (thời gian, lý do, hành động...),
              từ đó đọc đoạn văn có mục tiêu hơn và tiết kiệm thời gian.
            </Text>

            <Text style={styles.sectionTitle}>4. Tô đậm từ khóa trong đoạn văn</Text>
            <Text style={styles.paragraph}>
              Với mỗi câu hỏi, hãy gạch chân hoặc highlight các từ khóa trùng hoặc gần nghĩa với câu hỏi. Đây thường là khu vực chứa đáp án.
              Nếu luyện trên máy, bạn có thể đọc to thành tiếng hoặc đánh dấu bằng chuột để mắt không bị trôi dòng.
            </Text>

            <Text style={styles.sectionTag}>Viết</Text>
            <Text style={styles.sectionTitle}>5. Chuẩn bị sẵn &quot;template&quot; cho câu viết</Text>
            <Text style={styles.paragraph}>
              Ở level thấp, bạn không cần viết câu quá phức tạp. Hãy chuẩn bị một vài mẫu câu cố định (giới thiệu bản thân, sở thích, lịch trình hằng ngày...)
              rồi thay đổi từ vựng bên trong. Khi gặp đề tương tự, bạn chỉ cần lắp lại cấu trúc đã quen thuộc.
            </Text>

            <Text style={styles.sectionTitle}>6. Ưu tiên câu đúng ngữ pháp trước, hay sau</Text>
            <Text style={styles.paragraph}>
              TOPIK ưu tiên độ chính xác hơn là sự bay bổng. Một câu đơn giản nhưng đúng ngữ pháp và rõ ý luôn tốt hơn một câu dài nhưng sai cấu trúc.
              Khi luyện viết, hãy dành vài phút cuối để rà lại đuôi câu, biến âm và trợ từ (을/를, 이/가, 은/는...).
            </Text>

            <View style={styles.noteBox}>
              <Text style={styles.noteTitle}>Gợi ý sử dụng trong lộ trình</Text>
              <Text style={styles.paragraph}>
                - Trước khi làm bài trong ngày, hãy đọc nhanh phần tips tương ứng với kỹ năng (Nghe / Đọc / Viết).
              </Text>
              <Text style={styles.paragraph}>
                - Sau khi làm xong, quay lại xem bạn đã áp dụng được bao nhiêu tips ở trên và ghi chú thêm kinh nghiệm riêng của mình.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minHeight: '100%',
    backgroundColor: '#FFD7D0',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 24,
  },
  contentWrapper: {
    width: '70%',
    maxWidth: '100%',
    minHeight: '90vh',
    backgroundColor: '#FDF7EC',
    borderRadius: 16,
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 40,
  },
  scrollContent: {
    gap: 24,
    paddingBottom: 16,
  },
  backButtonContainer: {
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  header: {
    gap: 8,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C28A04',
    textTransform: 'uppercase',
    fontFamily: 'Epilogue, sans-serif',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  subtitle: {
    fontSize: 15,
    color: '#4A4A4A',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 22,
  },
  article: {
    backgroundColor: '#FFFDF8',
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 28,
    gap: 18,
  },
  sectionTag: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C28A04',
    textTransform: 'uppercase',
    marginTop: 8,
    fontFamily: 'Epilogue, sans-serif',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  paragraph: {
    fontSize: 15,
    color: '#3C3C3C',
    lineHeight: 24,
    fontFamily: 'Epilogue, sans-serif',
  },
  noteBox: {
    marginTop: 8,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FFF2D1',
    gap: 4,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
})

