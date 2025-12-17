'use client'

import React, { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { Card as CardType1 } from 'components/cardType1'
import { Card as CardType2 } from 'components/cardType2'
import { Card as CardType3 } from 'components/cardType3'
import { Card as CardType4 } from 'app/features/payment/payment-package/components/package-free'
import { Card as CardType5 } from 'app/features/payment/payment-package/components/package-premium'
import { TextInput } from 'components/textInput'
import { Button } from 'components/button'
import { ButtonV2 } from 'components/buttonV2'
import { LoginRequest } from 'components/loginRequest'
import { NotiContinueLesson } from 'components/notiContinueLesson'
import { Report } from 'components/report'
import CardType3Image from '../../../../packages/assets/bunny/3.png'
import CardType4Image from '../../../../packages/assets/bunny/3.png'
import { Navbar } from 'components/navbar'
import { Footer } from 'components/footer'
import { UserDashboard } from 'app/features/user/profile/components/user-dashboard'
import { UserAvatarCard } from 'app/features/user/profile/components/user-avt'
import { BasicInfo } from 'app/features/user/profile/components/basic-info'
import { SecurityInfo } from 'app/features/user/profile/components/security-info'
import { UserInformation } from 'app/features/user/profile/components/user-information'
import {
  showAdminNotification,
  showAdminError,
  showAdminSuccess,
} from 'components/HelperAdmin'
import { Loading, LoadingWithContainer } from 'components/Loading'
import { FlipCard } from 'components/FlipCard'
import { RoadmapTestQuestion } from 'app/features/roadmap/roadmap-test/components/roadmap-test-question'
import { RoadmapTestDashboard } from 'app/features/roadmap/roadmap-test/components/roadmap-test-dashboard'
import { MatchingCardBanner } from 'app/features/minigame/matching-card/matching-card-play/components/matching-card-banner'
import colors from '../../../../packages/app/color.js'

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

const UserDashboardSection = () => (
  <View
    style={{
      width: '100%',
      alignItems: 'center',
    }}
  >
    <UserDashboard />
  </View>
)

const UserAvatarSection = () => (
  <View
    style={{
      width: '100%',
      alignItems: 'center',
    }}
  >
    <UserAvatarCard />
  </View>
)

const BasicInfoSection = () => (
  <View
    style={{
      width: '100%',
      alignItems: 'center',
    }}
  >
    <View
      style={{
        width: '100%',
        maxWidth: 560,
      }}
    >
      <BasicInfo />
    </View>
  </View>
)

const SecurityInfoSection = () => (
  <View
    style={{
      width: '100%',
      alignItems: 'center',
    }}
  >
    <View
      style={{
        width: '100%',
        maxWidth: 760,
      }}
    >
      <SecurityInfo />
    </View>
  </View>
)

const UserInformationSection = () => (
  <View
    style={{
      width: '100%',
      alignItems: 'center',
    }}
  >
    <View
      style={{
        width: '100%',
        maxWidth: 1024,
      }}
    >
      <UserInformation />
    </View>
  </View>
)

const LoginRequestSection = () => (
  <View
    style={{
      width: '100%',
      alignItems: 'center',
    }}
  >
    <View
      style={{
        maxWidth: 720,
        width: '100%',
        alignItems: 'center',
      }}
    >
      <LoginRequest />
    </View>
  </View>
)

const NotiContinueLessonSection = () => (
  <View
    style={{
      width: '100%',
      alignItems: 'center',
    }}
  >
    <View
      style={{
        maxWidth: 720,
        width: '100%',
        alignItems: 'center',
      }}
    >
      <NotiContinueLesson />
    </View>
  </View>
)

const ReportSection = () => (
  <View
    style={{
      width: '100%',
      alignItems: 'center',
    }}
  >
    <View
      style={{
        maxWidth: 720,
        width: '100%',
        alignItems: 'center',
      }}
    >
      <Report />
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

const HelperAdminHeader = () => (
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
      HelperAdmin - Thông báo Admin & Staff
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
      Component xử lý hiển thị thông báo lỗi và thành công từ API response.
    </Text>
  </View>
)

const HelperAdminSection = () => {
  // Demo response lỗi 404
  const handleError404 = () => {
    const errorResponse = {
      isSuccess: false,
      data: null,
      errors: [
        {
          code: 'Blog.NotFound',
          description: 'Bài viết không tìm thấy.',
        },
      ],
      message: 'Bài viết không tồn tại hoặc đã bị xóa.',
      statusCode: 404,
    }
    showAdminNotification(errorResponse)
  }

  // Demo response lỗi 400
  const handleError400 = () => {
    const errorResponse = {
      isSuccess: false,
      data: null,
      errors: [
        {
          code: 'Validation.Error',
          description: 'Dữ liệu không hợp lệ.',
        },
        {
          code: 'Field.Required',
          description: 'Trường bắt buộc còn thiếu.',
        },
      ],
      message: 'Yêu cầu không hợp lệ.',
      statusCode: 400,
    }
    showAdminNotification(errorResponse)
  }

  // Demo response lỗi 500
  const handleError500 = () => {
    const errorResponse = {
      isSuccess: false,
      data: null,
      errors: [],
      message: 'Lỗi máy chủ nội bộ.',
      statusCode: 500,
    }
    showAdminNotification(errorResponse)
  }

  // Demo response thành công
  const handleSuccess = () => {
    const successResponse = {
      isSuccess: true,
      data: { id: 1, name: 'Test' },
      errors: null,
      message: 'Thao tác thành công!',
      statusCode: 200,
    }
    showAdminNotification(successResponse)
  }

  // Demo helper function showAdminError
  const handleDirectError = () => {
    showAdminError('Đã xảy ra lỗi không xác định', 500)
  }

  // Demo helper function showAdminSuccess
  const handleDirectSuccess = () => {
    showAdminSuccess('Dữ liệu đã được lưu thành công!')
  }

  return (
    <View
      style={{
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
        rowGap: 16,
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: '600',
          marginBottom: 8,
          fontFamily: 'Epilogue, sans-serif',
          color: '#333',
        }}
      >
        Test với API Response:
      </Text>
      <View
        style={{
          width: '100%',
          rowGap: 12,
          alignItems: 'center',
        }}
      >
        <Button
          title="Lỗi 404 - Không tìm thấy"
          color="dustyRose"
          onPress={handleError404}
        />
        <Button
          title="Lỗi 400 - Dữ liệu không hợp lệ"
          color="dustyRose"
          onPress={handleError400}
        />
        <Button
          title="Lỗi 500 - Lỗi máy chủ"
          color="dustyRose"
          onPress={handleError500}
        />
        <Button
          title="Thành công - 200"
          color="lightGreen"
          onPress={handleSuccess}
        />
      </View>
      <Text
        style={{
          fontSize: 18,
          fontWeight: '600',
          marginTop: 24,
          marginBottom: 8,
          fontFamily: 'Epilogue, sans-serif',
          color: '#333',
        }}
      >
        Test với Helper Functions:
      </Text>
      <View
        style={{
          width: '100%',
          rowGap: 12,
          alignItems: 'center',
        }}
      >
        <Button
          title="showAdminError()"
          color="dustyRose"
          onPress={handleDirectError}
        />
        <Button
          title="showAdminSuccess()"
          color="lightGreen"
          onPress={handleDirectSuccess}
        />
      </View>
    </View>
  )
}

const LoadingHeader = () => (
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
      Loading Component
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
      Component hiển thị loading với animation từ Uiverse.io
    </Text>
  </View>
)

const LoadingSection = () => {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 600,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        alignItems: 'center',
        padding: '20px',
      }}
    >

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            fontFamily: 'Epilogue, sans-serif',
            color: '#333',
          }}
        >
        </Text>
        <LoadingWithContainer
          size={48}
          text="Đang tải dữ liệu..."
          style={{ padding: '40px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}
        />
      </div>
    </div>
  )
}

const FlipCardHeader = () => (
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
      FlipCard - Flashcard Component
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
      Component flashcard với animation flip 3D khi hover hoặc click
    </Text>
  </View>
)

const FlipCardSection = () => {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 800,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            fontFamily: 'Epilogue, sans-serif',
            color: '#333',
          }}
        >
          FlipCard lớn với hình ảnh:
        </Text>
        <FlipCard
          word="한국어"
          meaning="Tiếng Hàn Quốc"
          image="https://puolotrip.com/images/pro/package-media-han-quoc-cover-2202.jpg"
          width={700}
          height={400}
          frontColor={colors.Mustard}
          backColor={colors.primaryLight}
          borderWidth={15}
          borderRadius={20}
        />
      </div>
    </div>
  )
}

const RoadmapTestQuestionHeader = () => (
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
      Roadmap Test Question
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
      Component câu hỏi test với audio player hoặc text question
    </Text>
  </View>
)

const RoadmapTestQuestionSection = () => {
  const [selectedAnswer1, setSelectedAnswer1] = useState(null)
  const [selectedAnswer2, setSelectedAnswer2] = useState(null)

  return (
    <View
      style={{
        width: '100%',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: '100%',
          maxWidth: 800,
          gap: 24,
        }}
      >
        {/* Audio Question Example */}
        <RoadmapTestQuestion
          questionNumber={1}
          type="audio"
          options={['매일 일해요.', '매일 일해요.', '매일 일해요.', '매일 일해요.']}
          selectedAnswer={selectedAnswer1}
          onAnswerSelect={setSelectedAnswer1}
        />

        {/* Text Question Example */}
        <RoadmapTestQuestion
          questionNumber={2}
          type="text"
          questionText="Chọn câu trả lời đúng cho câu hỏi này?"
          options={['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D']}
          selectedAnswer={selectedAnswer2}
          onAnswerSelect={setSelectedAnswer2}
        />
      </View>
    </View>
  )
}

const RoadmapTestDashboardHeader = () => (
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
      Roadmap Test Dashboard
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
      Dashboard hiển thị grid câu hỏi với phân trang (10 câu/trang)
    </Text>
  </View>
)

const RoadmapTestDashboardSection = () => {
  const [answers, setAnswers] = useState({})

  const handleAnswerSelect = (questionNum, answerIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionNum]: answerIndex,
    }))
  }

  const handleSubmit = () => {
    console.log('Submitted answers:', answers)
    alert('Đã nộp bài!')
  }

  return (
    <View
      style={{
        width: '100%',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: '100%',
          maxWidth: 800,
        }}
      >
        <RoadmapTestDashboard
          totalQuestions={15}
          timeRemaining="08 : 00"
          answers={answers}
          onAnswerSelect={handleAnswerSelect}
          onSubmit={handleSubmit}
        />
      </View>
    </View>
  )
}

const MinigameCardHeader = () => (
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
      Minigame - Lật thẻ bài từ vựng
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
      Thẻ minigame với bunny, nền cà rốt và hiệu ứng vui nhộn.
    </Text>
  </View>
)

const MinigameCardSection = () => (
  <View
    style={{
      width: '100%',
      alignItems: 'center',
    }}
  >
    <MatchingCardBanner />
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
        <UserInformationSection />
        <UserDashboardSection />
        <UserAvatarSection />
        <BasicInfoSection />
        <SecurityInfoSection />
        <LoginRequestSection />
        <NotiContinueLessonSection />
        <ReportSection />
        <CardType4Header />
        <CardType4Section />
        <CardType5 />
        <TextInputHeader />
        <TextInputSection />
        <ButtonHeader />
        <ButtonSection />
        <ButtonV2Header />
        <ButtonV2Section />
        <HelperAdminHeader />
        <HelperAdminSection />
        <LoadingHeader />
        <LoadingSection />
        <FlipCardHeader />
        <FlipCardSection />
        <RoadmapTestQuestionHeader />
        <RoadmapTestQuestionSection />
        <RoadmapTestDashboardHeader />
        <RoadmapTestDashboardSection />
        <MinigameCardHeader />
        <MinigameCardSection />
        <Navbar />
        <Footer />
      </View>
    </View>
  )
}
