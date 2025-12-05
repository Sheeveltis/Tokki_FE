'use client'

import { ScrollView, Text, View } from 'react-native'
import { Card as CardType1 } from 'components/cardType1'
import { Card as CardType2 } from 'components/cardType2'
import { Card as CardType3 } from 'components/cardType3'
import { Card as CardType4 } from 'components/cardType4'
import { TextInput } from 'components/textInput'
import { Button } from 'components/button'
import { ButtonV2 } from 'components/buttonV2'
import CardType3Image from '../../../../packages/assets/Sticker4.png'
import CardType4Image from '../../../../packages/assets/Sticker3.png'
import { Navbar } from 'components/navbar'
import { Footer } from 'components/footer'

const demoCardsType1 = [
  {
    id: 'card-1',
    title: 'Gói học bổng',
    description: 'Khám phá các khóa học phù hợp chỉ trong vài phút.',
  },
  {
    id: 'card-2',
    title: 'Lộ trình tăng tốc',
    description: 'Nhận lộ trình cá nhân hóa giúp bạn cải thiện mỗi ngày.',
  },
  {
    id: 'card-3',
    title: 'Bài giảng nổi bật',
    description: 'Xem lại những bài giảng chất lượng do chuyên gia biên soạn.',
  },
]

const demoCardsType2 = [
  {
    id: 'horizontal-1',
    title: 'Thử thách mỗi ngày',
    description:
      'Hoàn thành 3 nhiệm vụ nhỏ để tích lũy điểm kinh nghiệm và phần thưởng.',
  },
  {
    id: 'card-2',
    title: 'Lớp học tương tác',
    description: 'Tham gia lớp trực tiếp, đặt câu hỏi và luyện tập với cố vấn.',
  },
  {
    id: 'card-3',
    title: 'Cộng đồng học tập',
    description: 'Trao đổi tài liệu và chia sẻ kinh nghiệm với người học khác.',
  },
]

const demoCardsType3 = [
  {
    id: 'card-1',
    title: 'Cẩm nang luyện thi',
    description:
      'Tổng hợp bí quyết, mẫu đề và checklist để bạn tự tin trước kỳ thi quan trọng.',
  },
]

const SECTION_GAP = 32
const BLOCK_GAP = 16
const PAGE_MAX_WIDTH = '100%';

const PageHeader = () => (
  <View style={{ alignItems: 'center', padding:0, margin:0 }}>
    <Text
      style={{
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        fontFamily: 'Lexend, sans-serif',
      }}
    >
      Bộ sưu tập component
    </Text>
    <Text
      style={{
        marginTop: 8,
        color: '#555',
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'Epilogue, sans-serif',
      }}
    >
      Xem nhanh các phần UI dùng chung để bạn dễ dàng tái sử dụng.
    </Text>
  </View>
)

const CardType1Header = () => (
  <View style={{ alignItems: 'center' }}>
    <Text
      style={{
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        fontFamily: 'Lexend, sans-serif',
      }}
    >
      Thẻ loại 1
    </Text>
    <Text
      style={{
        marginTop: 8,
        color: '#555',
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'Epilogue, sans-serif',
      }}
    >
      Khung ảnh vuông phía trên, nội dung mô tả bên dưới.
    </Text>
  </View>
)

const CardType1Section = () => (
  <View
    style={{
      width: '100%',
      alignSelf: 'center',
      alignItems: 'center',
    }}
  >
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 24,
      }}
    >
      {demoCardsType1.map((card) => (
        <CardType1
          key={card.id}
          title={card.title}
          description={card.description}
          imageSource={{
            uri: 'https://puolotrip.com/images/pro/package-media-han-quoc-cover-2202.jpg',
          }}
          style={{
            width: 250,
            height: 250,
          }}
        />
      ))}
    </View>
  </View>
)

const CardType2Header = () => (
  <View style={{ alignItems: 'center' }}>
    <Text
      style={{
        marginTop: SECTION_GAP * 2,
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        fontFamily: 'Lexend, sans-serif',
      }}
    >
      Thẻ loại 2
    </Text>
    <Text
      style={{
        marginTop: 8,
        color: '#555',
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'Epilogue, sans-serif',
      }}
    >
      Bố cục ngang, hình ảnh bên trái và mô tả bên phải.
    </Text>
  </View>
)

const CardType2Section = () => (
  <View
    style={{
      width: '100%',
      alignSelf: 'center',
      alignItems: 'center',
    }}
  >
    <View style={{ rowGap: BLOCK_GAP, alignItems: 'center', width: '100%' }}>
      {demoCardsType2.map((card) => (
        <CardType2
          key={card.id}
          title={card.title}
          description={card.description}
          imageSource={{
            uri: 'https://puolotrip.com/images/pro/package-media-han-quoc-cover-2202.jpg',
          }}
          style={{
            width: 500,
          }}
        />
      ))}
    </View>
  </View>
)

const TextInputHeader = () => (
  <View style={{ alignItems: 'center' }}>
    <Text
      style={{
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        fontFamily: 'Lexend, sans-serif',
      }}
    >
      Trường nhập liệu
    </Text>
    <Text
      style={{
        marginTop: 8,
        color: '#555',
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'Epilogue, sans-serif',
      }}
    >
      Ví dụ cách giới hạn ký tự và hiển thị bộ đếm khi nhập nội dung.
    </Text>
  </View>
)

const TextInputSection = () => (
  <View
    style={{
      width: '100%',
      maxWidth: 600,
      alignSelf: 'center',
      rowGap: 20,
    }}
  >
    <TextInput placeholder="Họ và tên" maxLength={50} showCharCount={false} />
    <TextInput placeholder="Email liên hệ" maxLength={100} showCharCount={false} />
    <TextInput
      placeholder="Nhập nội dung trao đổi"
      maxLength={500}
      multiline
      numberOfLines={4}
      showCharCount
    />
  </View>
)

const ButtonHeader = () => (
  <View style={{ alignItems: 'center' }}>
    <Text
      style={{
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        fontFamily: 'Lexend, sans-serif',
      }}
    >
      Nút cơ bản
    </Text>
    <Text
      style={{
        marginTop: 8,
        color: '#555',
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'Epilogue, sans-serif',
      }}
    >
      Một vài ví dụ nút với 5 sắc thái màu khác nhau.
    </Text>
  </View>
)

const ButtonSection = () => (
  <View
    style={{
      width: '100%',
      alignSelf: 'center',
      rowGap: 16,
      alignItems: 'center',
    }}
  >
    <Button title="Đăng ký" color="darkGreen" />
    <Button title="Đăng nhập" color="lightGreen" />
    <Button title="Tạo tài khoản" color="dustyRose" />
    <Button title="Nộp bài" color="lightPink" />
    <Button title="Học từ mới" color="mustard" />
  </View>
)

const ButtonV2Header = () => (
  <View style={{ alignItems: 'center' }}>
    <Text
      style={{
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        fontFamily: 'Lexend, sans-serif',
      }}
    >
      Nút nâng cao
    </Text>
    <Text
      style={{
        marginTop: 8,
        color: '#555',
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'Epilogue, sans-serif',
      }}
    >
      Bộ nút với 6 bảng màu khác nhau và tự động đổi màu chữ.
    </Text>
  </View>
)

const ButtonV2Section = () => (
  <View
    style={{
      width: '100%',
      alignSelf: 'center',
      rowGap: 16,
      alignItems: 'center',
    }}
  >
    <ButtonV2 title="Gửi yêu cầu" color="charcoal" />
    <ButtonV2 title="Đặt lịch tư vấn" color="sage" />
    <ButtonV2 title="Nhận tài liệu" color="mint" />
    <ButtonV2 title="Báo cáo lỗi" color="blush" />
    <ButtonV2 title="Kích hoạt ưu đãi" color="poppy" />
    <ButtonV2 title="Xem chi tiết" color="ivory" />
  </View>
)

const CardType3Header = () => (
  <View style={{ alignItems: 'center' }}>
    <Text
      style={{
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        fontFamily: 'Lexend, sans-serif',
      }}
    >
      Thẻ loại 3
    </Text>
    <Text
      style={{
        marginTop: 8,
        color: '#555',
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'Epilogue, sans-serif',
      }}
    >
      Bố cục ngang với nền vàng kem và ảnh minh hoạ bên trái.
    </Text>
  </View>
)

const CardType3Section = () => (
  <View
    style={{
      width: '100%',
      alignSelf: 'center',
      alignItems: 'center',
    }}
  >
    <View style={{ rowGap: BLOCK_GAP, alignItems: 'center', width: '100%' }}>
      {demoCardsType3.map((card) => (
        <CardType3
          key={card.id}
          title={card.title}
          description={card.description}
          imageSource={CardType3Image}
          style={{
            width: '100%',
            maxWidth: 600,
          }}
          textContainerStyle={undefined}
          imageContainerStyle={undefined}
          descriptionStyle={undefined}
          titleStyle={undefined}
        />
      ))}
    </View>
  </View>
)

const CardType4Header = () => (
  <View style={{ alignItems: 'center' }}>
    <Text
      style={{
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        fontFamily: 'Lexend, sans-serif',
      }}
    >
      Thẻ loại 4
    </Text>
    <Text
      style={{
        marginTop: 8,
        color: '#555',
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'Epilogue, sans-serif',
      }}
    >
      Thẻ gói miễn phí với nền pattern cà rốt và mascot thỏ dễ thương.
    </Text>
  </View>
)

const CardType4Section = () => (
  <View
    style={{
      width: '100%',
      alignSelf: 'center',
      alignItems: 'center',
    }}
  >
    <CardType4
      title="GÓI MIỄN PHÍ"
      subtitle="Bạn sẽ nhận được quyền lợi gì ?"
      benefits={[
        'Giải đề TOPIK tối đa 2 đề/ngày',
        'Chơi Minigame tối đa 5 lần/ngày',
        'Bị giới hạn số lần sử dụng AI trong một ngày',
        'Sử dụng được hệ thống Flashcard',
      ]}
      priceLabel="Miễn phí"
      imageSource={CardType4Image}
      style={{ marginTop: 16 }}
    />
  </View>
)

export default function ComponentsShowcasePage() {
  return (
    <View
      style={{
        flex: 1,
        paddingVertical: 32,
        paddingHorizontal: 24,
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: '100%',
          maxWidth: PAGE_MAX_WIDTH,
          rowGap: SECTION_GAP,
          alignSelf: 'center',
        }}
      >
        <CardType1Header />
        <CardType1Section />
        <CardType2Header />
        <CardType2Section />
        <CardType3Header />
        <CardType3Section />
        <CardType4Header />
        <CardType4Section />
        <TextInputHeader />
        <TextInputSection />
        <ButtonHeader />
        <ButtonSection />
        <ButtonV2Header />
        <ButtonV2Section />
        <Navbar />
        <Footer />
      </View>
    </View>
  )
}
