import { Platform } from 'react-native'

/**
 * Cấu hình API Domain
 * - Web: sử dụng localhost
 * - Mobile Emulator: sử dụng 10.0.2.2 (IP đặc biệt của Android Emulator để truy cập localhost của máy host)
 * - Mobile Device thật: sử dụng IP của máy chủ backend (cần thay đổi theo IP thực tế của máy bạn)
 *
 * Lưu ý:
 * - Android Emulator: dùng 10.0.2.2 để truy cập localhost của máy host
 * - Device thật: dùng IP thật của máy (ví dụ: 116.106.201.3 hoặc 192.168.x.x)
 * - Để lấy IP của máy: Windows (ipconfig) hoặc Mac/Linux (ifconfig)
 */
const WEB_DOMAIN = 'http://localhost:5031'
// Cho Android Emulator: dùng 10.0.2.2 để truy cập localhost của máy host
// Cho Device thật: thay bằng IP thật của máy (ví dụ: http://116.106.201.3:5031)
const MOBILE_DOMAIN = 'http://10.0.2.2:5031' // IP đặc biệt cho Android Emulator

const PREFIX = '/api'

// Tự động chọn domain dựa trên platform
const DOMAIN = Platform.OS === 'web' ? WEB_DOMAIN : MOBILE_DOMAIN

export const API_BASE_URL = `${DOMAIN}${PREFIX}`

export const ENDPOINTS = {
    BLOG: {
      GET_ALL: '/Blog',              
      GET_BY_ID: (id) => `/Blog/${id}`,
      CREATE: '/Blog',                // POST: Tạo mới
      UPDATE: (id) => `/Blog/${id}`,    
      DELETE: (id) => `/Blog/admin/delete/${id}`,     
      ADMIN_LIST: '/Blog', // same endpoint, nhưng dùng kèm query pageNumber/pageSize
      STAFF_SUBMIT_FOR_APPROVAL: (blogId) => `/Blog/staff/submit-for-approval/${blogId}`,
      MODERATOR_APPROVE: (blogId) => `/Blog/moderator/approve/${blogId}`,
      MODERATOR_REJECT:  '/Blog/moderator/reject',
      INCREASE_VIEW_COUNT: (blogId) => `/Blog/increase-view/${blogId}`,
    },
    QUESTION_TYPE: {
      GET_ALL: '/QuestionType',
      GET_BY_ID: (id) => `/QuestionType/${id}`,
      CREATE: '/QuestionType',
      UPDATE: (id) => `/QuestionType/${id}`,
      DELETE: (id) => `/QuestionType/${id}`,
    },
  
    QUESTION: {
      GET_ALL: '/Question',
      GET_BY_ID: (id) => `/Question/${id}`,
    },
    QUESTION_BANK: {
      GET_ALL: '/QuestionBanks',
      GET_BY_ID: (id) => `/QuestionBanks/${id}`,
      GET_BY_QUESTION_TYPE: (questionTypeId) => `/QuestionBanks/question-type/${questionTypeId}`,
      CREATE: '/QuestionBanks',
      UPDATE: '/QuestionBanks/update',
      DELETE: (id) => `/QuestionBanks/${id}`,
      ACTIVATE: '/QuestionBanks/admin/activate',
      SUBMIT_TO_APPROVAL: '/QuestionBanks/submit-to-approval',
      APPROVE: '/QuestionBanks/approve',
      REJECT: '/QuestionBanks/reject',
    },
    QUESTION_BANK_OPTION: {
      CREATE: (questionBankId) => `/QuestionBanks/${questionBankId}/options`,
      UPDATE: (questionBankId, optionId) => `/QuestionBanks/${questionBankId}/options/${optionId}`,
      DELETE: (questionBankId, optionId) => `/QuestionBanks/${questionBankId}/options/${optionId}`,
    },
    PASSAGE: {
      GET_ALL: '/Passages',
      GET_BY_ID: (id) => `/Passages/${id}`,
      CREATE: '/Passages',
      UPDATE: '/Passages/update',
      DELETE: (id) => `/Passages/${id}`,
    },
    STATISTIC_BLOG: {
      DASHBOARD: '/StatisticBlog/dashboard',
      TOP_BLOGS: (count = 5) => `/StatisticBlog/top-blogs?count=${count}`,
      TOP_AUTHORS: (count = 5) => `/StatisticBlog/top-authors?count=${count}`,
    },
    CATEGORY: {
      GET_ALL: '/Category',
    },
    PAYMENT: {
      CREATE: '/Payment',
      GET_QR_BY_ID: (id) => `/Payment/${id}/qr`,
      GET_BY_ID: (id) => `/Payment/${id}`,
      HISTORY_TOKEN_USER: '/Payment/history-token-user', // GET: Lấy lịch sử thanh toán của user hiện tại
    },
    VIP_PACKAGE: {
      GET_ALL: '/VipPackage',
    },
    ACCOUNT: {
      LOGIN: '/Account/login',
      GOOGLE_LOGIN: '/Account/google-login',
      REGISTER: '/Account/register',
      FORGOT_PASSWORD_RESET: '/Account/forgot-password/reset',
      PROFILE: '/Account/profile',
      ME: '/Account/me',
      LEVEL: '/Account/me/level',
      GET_ALL: '/Account/get-all',
      DETAIL: (id) => `/Account/detail/${id}`,
      CREATE_ACCOUNT: '/Account/create-account',
      UPDATE_USER: '/Account/update-user',
      DELETE: (id) => `/Account/${id}`,
    },
    OTP: {
      SEND_EMAIL_VERIFICATION: '/Otp/send-otp-for-email-verification',
      VERIFY_LOGIN_OTP: '/Otp/verify-login-otp',
      SEND_FORGOT_PASSWORD: '/Otp/forgot-password/send-otp',
      VERIFY_FORGOT_PASSWORD: '/Otp/forgot-password/verify',
    },
    COMMENT: {
      CREATE: '/Comment',
      GET_BY_BLOG: (blogId) => `/Comment/blog/${blogId}`,
    },
    LIVE_CHAT: {
      GET_MY_ROOMS: '/Chat/my-rooms',
      REQUEST_SUPPORT: '/Chat/support/request',
      GET_PENDING_SUPPORT: '/Chat/support/pending',
      JOIN_SUPPORT: (roomId) => `/Chat/support/${roomId}/join`,
      GET_HISTORY: (roomId) => `/Chat/${roomId}/history`,
    },
    TOPIC: {
      CREATE: '/Topics',
      ADMIN_GET_ALL: '/Topics/admin/get-all',
      USER_GET_ALL: '/Topics/user/get-all',
      GET_BY_ID: (id) => `/Topics/${id}`,
      DELETE: (id) => `/Topics/${id}`,
      ADD_VOCABULARIES: '/Topics/vocabularies',
      ADMIN_REMOVE_VOCABULARIES: '/Topics/admin/vocabularies',
      PUBLISH: (topicId) => `/Topics/${topicId}/publish`,
      UPDATE: '/Topics/update',
      STAFF_SUBMIT_FOR_APPROVAL: (topicId) => `/Topics/staff/submit-for-approval/${topicId}`,
      MODERATOR_APPROVE: (topicId) => `/Topics/moderator/approve-topic/${topicId}`,
      MODERATOR_REJECT: (topicId) => `/Topics/moderator/reject-topic/${topicId}`,
      USER_STUDY: '/Topics/user/study', // GET: Lấy danh sách từ vựng để học (query: topicId, count)
    },
    VOCABULARY: {
      ADMIN_GET_ALL: '/Vocabulary/admin/get-all',
      ADMIN_CREATE: '/Vocabulary/admin/create-a-vocabulary',
      ADD_VOCABULARY_LIST: '/Vocabulary/bulk',
      FLASH_CARD_TOPIC: '/Vocabulary/flash-card',
      GET_BY_ID: (id) => `/Vocabulary/${id}`,
      USER_GET_DETAIL: (id) => `/Vocabulary/user/get-detail/${id}`,
      UPDATE: (id) => `/Vocabulary/${id}`,
      DELETE: (id) => `/Vocabulary/${id}`,
      ADD_EXAMPLES: '/vocabulary-examples/admin/add',
      UPDATE_EXAMPLE: (exampleId) => `/vocabulary-examples/admin/${exampleId}`,
      DELETE_EXAMPLE: (exampleId) => `/vocabulary-examples/admin/${exampleId}`,
      USER_GET_EXAMPLES: (vocabId) => `/vocabulary-examples/user/${vocabId}`,
    },
    MINIGAME: {
      MATCHING_CARDS: '/minigame/matching-cards',
      SOLITAIRE: '/minigame/solitaire',
      WORDLE: '/minigame/wordle',
      WORDLE_SUBMIT_SENTENCE: '/minigame/wordle/submit-sentence',
      WORDLE_RESULT: (dailyWordleId) => `/minigame/wordle/result/${dailyWordleId}`,
      WORDLE_PUBLISH_SENTENCE: '/minigame/wordle/publish-sentence',
      WORDLE_TOP_SENTENCES: (dailyWordleId) => `/minigame/wordle/${dailyWordleId}/top-sentences`,
    },
    GAMES: {
      USER_GET_ALL: '/Games/user/get-all', // GET: Lấy danh sách games cho user (query: pageNumber, pageSize)
      HAS_PLAYED_LEVEL: '/Games/user/has-played-level', // GET: Check xem user đã chơi level này chưa (query: gameId, topicId, gameDifficulty)
      SAVE_RESULT: '/Games/user/save-result', // POST: Lưu điểm game mới
      UPDATE_RESULT: '/Games/user/result', // PUT: Cập nhật điểm game đã có
      GET_ALL_USER_RESULTS: '/Games/user/get-all-user-results', // GET: Lấy bảng xếp hạng user results (query: gameId, topicId, gameDifficulty, pageNumber, pageSize)
    },
    REPORT: {
      CREATE: '/Report',
    },
    STATISTICS: {
      OVERVIEW: '/Statistics/overview', // GET: Thống kê tổng quan doanh thu
      TRANSACTIONS: '/Statistics/transactions', // GET: Lịch sử giao dịch (query: search, status, fromDate, toDate, page, pageSize)
      PACKAGES: '/Statistics/packages', // GET: Doanh thu theo gói thành viên
      CHART: (year) => `/Statistics/chart?year=${year}`, // GET: Biểu đồ doanh thu theo tháng (query: year)
    },
    FAVORITES: {
      GET_ALL: '/Favorites/favorites',   // GET: Lấy danh sách từ vựng yêu thích (có pagination và search)
      ADD: '/Favorites',      // POST: Thêm vào danh sách yêu thích
      REMOVE: '/Favorites',    // DELETE: Xóa khỏi danh sách yêu thích
    },
    SPACED_REPETITION: {
      SUBMIT: '/SpacedRepetition/submit',  // POST: Submit kết quả học tập (body: { vocabularyId, isCorrect } hoặc { vocabularyId, quality })
      GET_LEARNED: '/SpacedRepetition/vocab-for-review',  // GET: Lấy danh sách từ vựng đã học (query: limit)
      COMPLETE_TOPIC: '/SpacedRepetition/complete-topic', // POST: Hoàn thành tiến độ học topic
    },
    GAMIFICATION: {
      HEARTBEAT: '/Gamification/heartbeat',  // POST: Heartbeat để track thời gian học tập
      PROGRESS: (userId) => `/Gamification/progress/${userId}`,  // GET: Lấy thông tin progress (level, XP, streak, title)
    },
    TITLE: {
      GET_ALL: '/Title',  // GET: Lấy danh sách danh hiệu
      GET_BY_ID: (id) => `/Title/${id}`,  // GET: Lấy thông tin title theo ID
      CREATE: '/Title',  // POST: Tạo mới danh hiệu
      UPDATE: (id) => `/Title/${id}`,  // PUT: Cập nhật danh hiệu
      DELETE: (id) => `/Title/${id}`,  // DELETE: Xóa danh hiệu
    },
    LEADERBOARD: {
      GET_ALL: '/Leaderboard',  // GET: Lấy danh sách leaderboard (query: timeFrame, top)
    },
    CLOUDINARY: {
      UPLOAD_VOCABULARY_IMAGE: '/Cloudinary/image/vocabulary',  // POST: Upload ảnh từ vựng lên Cloudinary
      UPLOAD_TOPIC_IMAGE: '/Cloudinary/image/topic',  // POST: Upload ảnh chủ đề lên Cloudinary
      UPLOAD_AVATAR: '/Cloudinary/image/avatar',  // POST: Upload avatar lên Cloudinary
      UPLOAD_TEMPLATE_PART_IMAGE: '/Cloudinary/image/template-part',  // POST: Upload ảnh template part lên Cloudinary
      UPLOAD_VOCABULARY_IMAGE: '/cloudinary/vocabulary-image',  // POST: Upload ảnh từ vựng lên Cloudinary
      UPLOAD_TOPIC_IMAGE: '/cloudinary/topic-image',  // POST: Upload ảnh chủ đề lên Cloudinary
      UPLOAD_AVATAR: '/cloudinary/avatar',  // POST: Upload avatar lên Cloudinary

      // Question/Option media
      UPLOAD_QUESTION_IMAGE: '/Cloudinary/image/question',
      UPLOAD_OPTION_IMAGE: '/Cloudinary/image/option',
      UPLOAD_QUESTION_AUDIO: '/Cloudinary/audio/question',
      UPLOAD_OPTION_AUDIO: '/Cloudinary/audio/option',
      UPLOAD_PASSAGE_IMAGE: '/Cloudinary/image/passage',
      UPLOAD_PASSAGE_AUDIO: '/Cloudinary/audio/passage',
      UPLOAD_BLOG_IMAGE: '/Cloudinary/image/blog',  // POST: Upload ảnh blog lên Cloudinary
      UPLOAD_TITLE_IMAGE: '/Cloudinary/image/title',  // POST: Upload ảnh title lên Cloudinary
    },
    EXCEL: {
      ADD_VOCAB_TO_TOPIC: (topicId) => `/Excel/import/vocab?topicId=${topicId}`,  // POST: Import từ vựng từ Excel vào chủ đề
      EXPORT_BY_TOPIC: (topicId) => `/Excel/export/topic/${topicId}`,  // GET: Export từ vựng của chủ đề ra Excel
      IMPORT_QUESTIONS: '/Excel/import/questions', // POST: Import câu hỏi từ Excel theo QuestionTypeId
    },
    EMAIL: {
      CAMPAIGNS_CREATE: '/email-campaigns',           // POST: Tạo chiến dịch email thủ công
      CAMPAIGNS_LIST: '/email-campaigns',             // GET: Lấy lịch sử chiến dịch email (query: PageNumber, PageSize, Status, TargetGroup, ScheduledFrom, ScheduledTo, CreatedFrom, CreatedTo)
      TEMPLATE_CREATE: '/EmailTemplate',              // POST: Tạo email template tự động
      TEMPLATE_LIST: '/EmailTemplate',                // GET: Lấy danh sách email template (query: PageNumber, PageSize, Status, Type, TargetGroup, Value, SearchName, SearchSubject)
    },
    EXAM_TEMPLATES: {
      ADMIN_LIST: '/ExamTemplates/admin',              // GET: Lấy danh sách exam templates cho admin (query: PageNumber, PageSize, SearchTerm, Status, Type)
      GET_BY_ID: (id) => `/ExamTemplates/${id}`,      // GET: Lấy chi tiết exam template
      CREATE: '/ExamTemplates',                        // POST: Tạo exam template mới
      UPDATE: (id) => `/ExamTemplates/${id}`,          // PUT: Cập nhật exam template
      DELETE: (id) => `/ExamTemplates/${id}`,         // DELETE: Xóa exam template
      UPDATE_STATUS: (id) => `/ExamTemplates/${id}/status`, // PATCH: Cập nhật trạng thái exam template
      APPROVE: (id) => `/ExamTemplates/${id}/approve`, // POST: Phê duyệt mẫu đề
      SUBMIT: (id) => `/ExamTemplates/${id}/submit`,   // POST: Trình mẫu đề để phê duyệt
      REJECT: (id) => `/ExamTemplates/${id}/reject`,   // POST: Từ chối mẫu đề
      TEMPLATE_PARTS: '/ExamTemplates/TemplateParts',  // POST: Thêm/cập nhật template parts
      UPDATE_TEMPLATE_PART: (templatePartId) => `/ExamTemplates/TemplateParts/${templatePartId}`,  // PUT: Cập nhật một template part (templatePartId trong URL)
      DUPLICATE: (id) => `/ExamTemplates/${id}/duplicate`,  // POST: Sao chép exam template
    },
    EXAMS: {
      ADMIN_LIST: '/Exams/admin',              // GET: Lấy danh sách exams cho admin (query: PageNumber, PageSize, Status, Type)
      ADMIN_DETAIL: '/Exams/admin/detail',     // GET: Lấy chi tiết exam cho admin (query: examId)
      GET_BY_ID: (id) => `/Exams/${id}`,      // GET: Lấy chi tiết exam
      CREATE: '/Exams',                        // POST: Tạo exam mới
      UPDATE: (id) => `/Exams/${id}`,          // PUT: Cập nhật exam
      UPDATE_STATUS: (id) => `/Exams/${id}/status`, // PUT: Cập nhật trạng thái exam
      DELETE: (id) => `/Exams/${id}`,         // DELETE: Xóa exam
      GET_QUESTIONS_BY_PART: '/Exams/get-questions-by-part', // GET: Lấy danh sách câu hỏi theo templatePartId
      UPDATE_EXAM_QUESTION: '/Exams/update-exam-question', // PUT: Cập nhật 1 câu hỏi trong đề (body: { examId, questionBankId, questionNo })
      REGENERATE_PART: '/Exams/regenerate-part', // POST: Random/regenerate lại bộ câu hỏi của một phần (body: { examId, templatePartId })
    },
    USER_EXAM: {
      TAKE_EXAM: (examId, isShuffle = true) =>
        `/UserExam/user/take-exam?examId=${encodeURIComponent(examId)}&isShuffle=${isShuffle}`,
      SYNC_PROGRESS: '/UserExam/sync-progress',
      SYNC_MCQ: '/UserExam/sync/mcq',
      SYNC_WRITING: '/UserExam/sync/writing',
      SUBMIT: '/UserExam/user/submit',
      DETAIL_IN_PROGRESS: (userExamId) =>
        `/UserExam/user/detail/in-progress?UserExamId=${encodeURIComponent(userExamId)}`,
      RESULT: (userExamId) => `/UserExam/${encodeURIComponent(userExamId)}/result`,
      IS_GRADED: (userExamId) => `/UserExam/${encodeURIComponent(userExamId)}/is-graded`,
      HISTORY: '/UserExam/user/history',
    },
  }
