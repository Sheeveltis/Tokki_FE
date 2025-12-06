import React, { useState, useEffect } from 'react'
import { BlogListLayout } from './components/blog-list-layout'

// Dữ liệu giả lập (Sau này sẽ lấy từ API)
const MOCK_DATA = [
  {
    "id": "E2AfNbgZWH",
    "title": "10 quy tắc 'bất di bất dịch' trên bàn ăn của người Hàn Quốc",
    "slug": "10-quy-tac-bat-di-bat-dich",
    "thumbnailUrl": "https://duhochanquoc.com/uploads/news/quytactrenbanancuanguoihanquocvanhungdieucanbiet1.jpg",
    "shortDescription": "Khi đi ăn với người Hàn Quốc, bạn cần nắm rõ những quy tắc trên bàn ăn để thể hiện sự tôn trọng và hiểu biết về văn hóa của họ. Những quy tắc này không chỉ là phép lịch sự mà còn là cách để bạn hòa nhập tốt hơn.",
    "viewCount": 120,
    "createdAt": "2025-11-27T14:59:05.0737898+00:00",
    "categoryName": "Văn hóa & Đời sống",
    "categoryId": "x2bgHp432Q",
    "tags": ["Văn hóa Hàn Quốc", "Quy tắc bàn ăn", "Kỹ năng sống"]
  },
  {
    "id": "abc12345",
    "title": "Luyện thi TOPIK II: Bí kíp đạt điểm cao",
    "slug": "luyen-thi-topik-ii",
    "thumbnailUrl": "https://via.placeholder.com/300",
    "shortDescription": "Chia sẻ kinh nghiệm ôn thi TOPIK II từ những người đã đạt điểm cao. Những bí quyết về cách học từ vựng, ngữ pháp và kỹ năng làm bài thi hiệu quả.",
    "viewCount": 500,
    "createdAt": "2025-11-28T10:00:00+00:00",
    "categoryName": "Luyện thi TOPIK",
    "categoryId": "cat_topik",
    "tags": ["Ngữ pháp sơ cấp", "Kỹ năng sống"]
  },
  {
    "id": "blog3",
    "title": "Học tiếng Hàn qua phim: Top 10 bộ phim hay nhất",
    "slug": "hoc-tieng-han-qua-phim",
    "thumbnailUrl": "https://via.placeholder.com/300",
    "shortDescription": "Khám phá cách học tiếng Hàn hiệu quả thông qua việc xem phim. Danh sách 10 bộ phim Hàn Quốc hay nhất giúp bạn cải thiện kỹ năng nghe và từ vựng.",
    "viewCount": 350,
    "createdAt": "2025-11-25T08:00:00+00:00",
    "categoryName": "Học tiếng Hàn",
    "categoryId": "cat_learning",
    "tags": ["Phim Hàn Quốc", "Học tiếng Hàn"]
  },
  {
    "id": "blog4",
    "title": "Du lịch Seoul: Hướng dẫn chi tiết cho người mới",
    "slug": "du-lich-seoul",
    "thumbnailUrl": "https://via.placeholder.com/300",
    "shortDescription": "Hướng dẫn đầy đủ về du lịch Seoul từ A-Z. Những địa điểm không thể bỏ qua, cách di chuyển, ăn uống và những mẹo tiết kiệm chi phí.",
    "viewCount": 280,
    "createdAt": "2025-11-24T15:30:00+00:00",
    "categoryName": "Du lịch",
    "categoryId": "cat_travel",
    "tags": ["Seoul", "Du lịch Hàn Quốc"]
  },
  {
    "id": "blog5",
    "title": "K-pop và văn hóa đại chúng Hàn Quốc",
    "slug": "kpop-van-hoa-dai-chung",
    "thumbnailUrl": "https://via.placeholder.com/300",
    "shortDescription": "Tìm hiểu về sự ảnh hưởng của K-pop đến văn hóa đại chúng Hàn Quốc và thế giới. Những xu hướng mới nhất và cách K-pop thay đổi nhận thức về Hàn Quốc.",
    "viewCount": 450,
    "createdAt": "2025-11-23T12:00:00+00:00",
    "categoryName": "Văn hóa & Đời sống",
    "categoryId": "x2bgHp432Q",
    "tags": ["K-pop", "Văn hóa Hàn Quốc"]
  }
]

export function BlogListScreen() {
  const [blogs, setBlogs] = useState([])

  useEffect(() => {
    // Giả lập fetch data từ API
    // Sau này sẽ thay bằng API call thật
    setBlogs(MOCK_DATA)
  }, [])

  return <BlogListLayout blogs={blogs} />
}