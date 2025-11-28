const MOCK_DB = {
  // Slug khớp với URL bạn muốn test
  'bat-mi-5-dieu-cam-ky-o-han-quoc': {
    id: '2808',
    slug: 'bat-mi-5-dieu-cam-ky-o-han-quoc',
    title: "Bật mí 5 điều cấm kỵ ở Hàn Quốc mà bạn nên biết!",
    // HTML NỘI DUNG GỐC CỦA BẠN (Đã cắt bớt phần header lặp lại để gọn)
    content: `
      <p>Hàn Quốc nổi tiếng với nền văn hóa độc đáo và nhiều quy tắc ứng xử nghiêm ngặt. Nếu bạn đang tìm hiểu văn hóa hoặc chuẩn bị đến đất nước này, việc nắm rõ những điều cấm kỵ sẽ giúp bạn tránh sai lầm khi giao tiếp, thể hiện sự tôn trọng và hòa nhập tốt hơn. Tại Hàn Quốc, phép lịch sự và truyền thống được coi trọng trong mọi khía cạnh của cuộc sống, từ cách chào hỏi, ăn uống đến hành vi nơi công cộng. Vì vậy, để tránh những tình huống khó xử, bạn nên tìm hiểu kỹ các quy tắc ứng xử phổ biến.</p>
      
      <h2><span style="color: #0000ff;"><strong>1. Không Cắm Đũa Vào Bát Cơm – Điều Cấm Kỵ Ở Hàn Quốc Khi Ăn Uống</strong></span></h2>
      <h3><span style="color: #0000ff;"><strong>1.1. Ý nghĩa của hành động cắm đũa vào bát cơm</strong></span></h3>
      <p>Một trong những điều cấm kỵ ở Hàn Quốc liên quan đến bữa ăn chính là việc cắm đũa thẳng đứng vào bát cơm. Việc cắm đũa thẳng đứng vào bát cơm không đơn thuần là hành động thiếu lịch sự, mà còn là điều cấm kỵ mang tính tâm linh sâu sắc.</p>
      <p>Hình ảnh này gợi nhớ trực tiếp đến nghi lễ "Jesa" - nghi thức cúng tế người đã khuất trong văn hóa Hàn Quốc, khi người ta đặt bát cơm với đôi đũa cắm thẳng đứng trước bàn thờ tổ tiên. Hành động này vô tình biến bữa ăn vui vẻ thành không gian tang lễ, được xem là điềm gở và mang lại vận rủi.</p>
      <img src="https://www.vjdanang.com/Resources/Blogs/Thumbnails/16/199/bat-mi-5-dieu-cam-ky-o-han-quoc-ma-ban-nen-biet-199.jpg" width="100%" />
      
      <h3><span style="color: #0000ff;"><strong>1.2. Cách ăn uống đúng mực</strong></span></h3>
      <p>Ngoài việc tránh cắm đũa, bạn cũng nên chú ý đến thứ tự dùng đồ ăn. Trong xã hội Hàn Quốc có tính thứ bậc cao, người trẻ tuổi hoặc cấp dưới phải chờ người lớn tuổi hoặc cấp trên bắt đầu ăn trước.</p>
      
      <h2><span style="color: #0000ff;"><strong>2. Không Viết Tên Ai Đó Bằng Mực Đỏ – Điều Kiêng Kỵ Trong Văn Hóa Hàn Quốc</strong></span></h2>
      <h3><span style="color: #0000ff;"><strong>2.1. Mực Đỏ - Biểu Tượng Của Cái Chết</strong></span></h3>
      <p>Trong lịch sử Hàn Quốc, mực đỏ có mối liên hệ trực tiếp với cái chết. Khi một người qua đời, tên của họ sẽ được gạch bằng mực đỏ trong sổ gia phả hoặc khắc bằng màu đỏ trên bia mộ. Đây là cách đánh dấu rằng linh hồn người đó đã rời khỏi thế giới này. Vì vậy, viết tên ai đó bằng mực đỏ tương đương với việc "xóa sổ" họ khỏi thế giới người sống - một điềm gở cực kỳ nghiêm trọng.</p>
      <img src="https://www.vjdanang.com/Resources/Blogs/Thumbnails/16/200/bat-mi-5-dieu-cam-ky-o-han-quoc-ma-ban-nen-biet-200.jpg" width="100%" />

      <h2><span style="color: #0000ff;"><strong>3. Không Rót Rượu Cho Bản Thân – Quy Tắc Uống Rượu Cần Biết</strong></span></h2>
      <p>Trong các buổi tiệc hoặc gặp gỡ, việc rót rượu cho bản thân là một hành động không phù hợp. Thay vào đó, bạn nên rót rượu cho người khác và đợi họ rót lại cho mình.</p>
      <img src="https://www.vjdanang.com/Resources/Blogs/Thumbnails/16/201/bat-mi-5-dieu-cam-ky-o-han-quoc-ma-ban-nen-biet-201.jpg" width="100%" />

      <h2><span style="color: #0000ff;"><strong>4. Không Dùng Một Tay Khi Đưa Đồ</strong></span></h2>
      <p>Trong văn hóa Hàn Quốc, việc đưa hoặc nhận đồ vật bằng một tay được coi là thiếu tôn trọng, đặc biệt khi tương tác với người lớn tuổi hoặc cấp trên.</p>
      <img src="https://www.vjdanang.com/Resources/Blogs/Thumbnails/16/202/bat-mi-5-dieu-cam-ky-o-han-quoc-ma-ban-nen-biet-202.jpg" width="100%" />

      <h2><span style="color: #0000ff;"><strong>5. Không Nhìn Chằm Chằm Vào Người Khác</strong></span></h2>
      <p>Nhìn chằm chằm vào người khác là một trong những điều cấm kỵ ở Hàn Quốc dễ gây khó chịu hoặc hiểu nhầm.</p>
      <img src="https://www.vjdanang.com/Resources/Blogs/Thumbnails/16/203/bat-mi-5-dieu-cam-ky-o-han-quoc-ma-ban-nen-biet-203.jpg" width="100%" />
      
      <p><strong>VJ ĐÀ NẴNG hy vọng qua bài viết này sẽ giúp các bạn có thêm một số thông tin bổ ích!</strong></p>
    `,
    author: "VJ ĐÀ NẴNG",
    date: "10/05/2025",
    views: "4.8k",
    comments: 16,
    category: "Thư Viện Hàn Quốc",
    thumbnail: "http://www.vjdanang.com/Resources/Blogs/Thumbnails/16/1032/bat-mi-5-dieu-cam-ky-o-han-quoc-ma-ban-nen-biet-1032.jpg",
    
    // Bài viết liên quan (Lấy từ HTML bạn gửi)
    relatedPosts: [
       { 
         id: '27', 
         slug: 'nguyen-am-va-phu-am-trong-tieng-han',
         title: "Nguyên Âm và Phụ Âm Trong Tiếng Hàn: Nền Tảng Vững Chắc Cho Người Học Mới",
         image: "http://www.vjdanang.com/Resources/Blogs/Thumbnails/27/1152/nguyen-am-va-phu-am-trong-tieng-han-nen-tang-vung-chac-cho-nguoi-hoc-moi-1152.jpg",
         date: "17/05/2025"
       },
       { 
         id: '24', 
         slug: 'quy-trinh-lam-ho-so-du-hoc-han-quoc',
         title: "5 Quy trình làm hồ sơ du học Hàn Quốc: Hướng dẫn chi tiết và hiệu quả nhất!",
         image: "http://www.vjdanang.com/Resources/Blogs/Thumbnails/24/401/5-quy-trinh-lam-ho-so-du-hoc-han-quoc-huong-dan-chi-tiet-va-hieu-qua-nhat-401.jpg",
         date: "17/05/2025"
       },
       { 
         id: '21', 
         slug: 'nhung-truong-dai-hoc-o-seoul-co-hoc-phi-re',
         title: "TOP Những trường đại học ở seoul có học phí rẻ",
         image: "http://www.vjdanang.com/Resources/Blogs/Thumbnails/21/315/top-nhung-truong-dai-hoc-o-seoul-co-hoc-phi-re-lua-chon-tiet-kiem-so-1-khi-du-hoc-han-quoc-315.jpg",
         date: "17/05/2025"
       }
    ]
  }
}

export const getBlogDetail = async (slug) => {
  return new Promise((resolve, reject) => {
    // console.log(`[API] Đang tìm slug: ${slug}`)
    setTimeout(() => {
      const data = MOCK_DB[slug]
      if (data) resolve(data)
      else reject(new Error("Không tìm thấy bài viết"))
    }, 500)
  })
}