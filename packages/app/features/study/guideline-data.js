import Bunny14 from 'assets/bunny/14.png' // Assuming the user meant png, but wait, the project uses .png
import Bunny1 from 'assets/bunny/1.png'
import Bunny2 from 'assets/bunny/2.png'
import Bunny3 from 'assets/bunny/3.png'
import Bunny9 from 'assets/bunny/9.png'

/**
 * Flashcard Study Guideline
 * Cung cấp thông tin các bước học Flashcard
 */
export const FLASHCARD_GUIDELINE = [
  {
    id: 1,
    title: 'Bắt đầu bài học',
    description: 'Nhấn vào nút "BẮT ĐẦU" màu vàng để mở bài học flashcard của bạn.',
    image: "https://res.cloudinary.com/dxfii0v3c/image/upload/v1777434889/tokki/image/blog/yuika07lipbuc7igathg.png", // Bạn có thể thay bằng link ảnh: 'https://link-anh.com/image.png'
  },
  {
    id: 2,
    title: 'Làm quen từ mới',
    description: 'Hệ thống hiển thị từ vựng tiếng Hàn kèm phiên âm. Sau đó, hình ảnh và nghĩa tiếng Việt sẽ xuất hiện để bạn ghi nhớ.',
    image: "https://res.cloudinary.com/dxfii0v3c/image/upload/v1777435053/tokki/image/blog/s3ihb2ss0zglfzy5pb66.png",
  },
  {
    id: 3,
    title: 'Kiểm tra Nghe & Viết',
    description: 'Nhấn biểu tượng loa để nghe, sau đó gõ lại từ bạn nghe được vào ô trống và nhấn "Kiểm tra".',
    image: "https://res.cloudinary.com/dxfii0v3c/image/upload/v1777435118/tokki/image/blog/wwdb2mggfuvsrfqobnr7.png",
  },
  {
    id: 4,
    title: 'Xác nhận kết quả',
    description: 'Đúng sẽ hiện viền xanh "Bạn làm tốt lắm!". Sai sẽ hiện viền đỏ kèm đáp án đúng để bạn đối chiếu.',
    image: "https://res.cloudinary.com/dxfii0v3c/image/upload/v1777435135/tokki/image/blog/btngjkyi0houaposjzd9.png",
  },
  {
    id: 5,
    title: 'Hoàn thành mục tiêu',
    description: 'Lặp lại quy trình trên cho đến khi hoàn thành đủ 5 từ trong một lượt học để thăng hạng nhé!',
    image: Bunny1,
  },
]

/**
 * Welcome / Onboarding Guideline
 * Dành cho người mới bắt đầu sử dụng app
 */
export const WELCOME_GUIDELINE = [
  {
    id: 1,
    title: 'Chào mừng bạn đến với Tokki!',
    description: 'Ứng dụng học tiếng Hàn thông minh giúp bạn chinh phục ngôn ngữ một cách dễ dàng và thú vị.',
    image: Bunny9,
  },
  {
    id: 2,
    title: 'Lộ trình cá nhân hóa',
    description: 'Dựa trên trình độ của bạn, Tokki sẽ xây dựng một lộ trình học tập tối ưu nhất.',
    image: Bunny14,
  },
  {
    id: 3,
    title: 'Học mọi lúc mọi nơi',
    description: 'Dữ liệu được đồng bộ liên tục, giúp bạn có thể học trên cả điện thoại và máy tính.',
    image: Bunny1,
  },
]

/**
 * Learned Vocabulary List Guideline
 * Hướng dẫn về hệ thống ôn tập lặp lại ngắt quãng (SRS)
 */
export const LEARNED_VOCAB_GUIDELINE = [
  {
    id: 1,
    title: 'Hệ thống 5 cấp độ ghi nhớ',
    description: 'Mỗi từ vựng sẽ có 5 cấp độ. Dựa trên kết quả đúng/sai, hệ thống tự động tăng/giảm cấp độ để tối ưu hóa chu kỳ ôn tập của bạn.',
    image: "https://res.cloudinary.com/dxfii0v3c/image/upload/v1777436305/tokki/image/blog/c7pwzgx2x5ehrmttjwka.png",
  },
  {
    id: 2,
    title: 'Quy trình ôn tập hàng ngày',
    description: 'Hoàn thành mục tiêu (ví dụ: 20/45 từ) mỗi ngày. Bạn sẽ được kiểm tra qua hình thức Viết (Việt-Hàn) và Nghe-Gõ lại.',
    image: "https://res.cloudinary.com/dxfii0v3c/image/upload/v1777436329/tokki/image/blog/ixlxiwsplxwxbrgbgmtv.png",
  },
  {
    id: 3,
    title: 'Lợi ích của Space Repetition',
    description: 'Giúp ghi nhớ dài hạn bằng cách nhắc lại đúng thời điểm, tiết kiệm thời gian và cá nhân hóa lộ trình học của riêng bạn.',
    image: "https://res.cloudinary.com/dxfii0v3c/image/upload/v1777436354/tokki/image/blog/ugsocdh7ql7r3aofaz1z.png",
  },
]

export default {
  flashcard: FLASHCARD_GUIDELINE,
  welcome: WELCOME_GUIDELINE,
  learnedVocab: LEARNED_VOCAB_GUIDELINE,
}
