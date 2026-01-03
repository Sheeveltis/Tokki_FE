# Hướng dẫn tạo trang thêm mẫu đề mới

## Tổng quan

Trang này cho phép admin tạo mẫu đề thi mới với các phần (parts) động. Mỗi mẫu đề có thể chứa nhiều phần, mỗi phần có các thông tin về kỹ năng, số câu hỏi, điểm số, và loại câu hỏi.

## Cấu trúc Database

### Bảng `ExamTemplates`
- `ExamTemplateId` (INT, Primary Key)
- `Name` (NVARCHAR(255), NOT NULL)
- `Description` (NVARCHAR(MAX), NULL)
- `CreatedAt`, `UpdatedAt` (DATETIME2)
- `IsActive` (BIT)

### Bảng `TemplateParts`
- `TemplatePartId` (INT, Primary Key)
- `ExamTemplateId` (INT, Foreign Key → ExamTemplates)
- `Skill` (NVARCHAR(50), NOT NULL) - Reading | Listening | Writing
- `QuestionFrom` (INT, NOT NULL) - Từ câu ..
- `QuestionTo` (INT, NOT NULL) - Đến câu ..
- `PartTitle` (NVARCHAR(500), NOT NULL) - Giải thích dạng câu bằng tiếng việt
- `Instruction` (NVARCHAR(MAX), NOT NULL) - Câu hỏi bằng tiếng Hàn
- `Mark` (DECIMAL(5,2), NOT NULL) - Số điểm của mỗi câu trong phần này
- `ExampleUrl` (NVARCHAR(500), NULL) - URL câu ví dụ (cho phép null)
- `QuestionTypeId` (INT, NOT NULL, Foreign Key → QuestionTypes) - Để hiển thị ngân hàng câu hỏi
- `CreatedAt`, `UpdatedAt` (DATETIME2)

### Bảng `QuestionTypes`
- `QuestionTypeId` (INT, Primary Key)
- `Code` (NVARCHAR(50), NOT NULL) - Mã Dạng
- `Name` (NVARCHAR(255), NOT NULL)
- `Description` (NVARCHAR(MAX), NULL) - Tương tự như instruction nhưng sẽ chi tiết hơn
- `Skill` (NVARCHAR(50), NOT NULL) - kĩ năng
- `DifficultyLevel` (NVARCHAR(50), NULL) - easy | medium | hard
- `IsActive` (BIT)
- `CreatedAt`, `UpdatedAt` (DATETIME2)

## API Endpoints cần tạo

### 1. GET /api/admin/question-types
Lấy danh sách QuestionTypes để hiển thị trong dropdown.

**Response:**
```json
[
  {
    "QuestionTypeId": 1,
    "Code": "MCQ",
    "Name": "Multiple Choice",
    "Description": "Câu hỏi trắc nghiệm",
    "Skill": "Reading",
    "DifficultyLevel": "medium",
    "IsActive": true
  }
]
```

### 2. POST /api/admin/exam-templates
Tạo mẫu đề mới.

**Request Body:**
```json
{
  "name": "TOPIK I - Mẫu đề 1",
  "description": "Mẫu đề thi TOPIK I",
  "parts": [
    {
      "Skill": "Reading",
      "QuestionFrom": 1,
      "QuestionTo": 10,
      "PartTitle": "Đọc hiểu đoạn văn ngắn",
      "Instruction": "다음을 읽고 맞는 답을 고르세요",
      "Mark": 1.0,
      "ExampleUrl": null,
      "QuestionTypeId": 1
    }
  ]
}
```

**Response:**
```json
{
  "ExamTemplateId": 1,
  "name": "TOPIK I - Mẫu đề 1",
  "description": "Mẫu đề thi TOPIK I",
  "parts": [...]
}
```

### 3. GET /api/admin/question-bank?questionTypeId={id}&skill={skill}
Lấy danh sách câu hỏi từ ngân hàng đề theo QuestionTypeId và Skill (cho nút "Chọn câu hỏi từ ngân hàng đề").

## Các bước tích hợp API

1. **Thêm API functions vào `packages/app/features/admin/api/index.js`:**
   ```javascript
   export async function fetchQuestionTypes() {
     // Call API GET /api/admin/question-types
   }
   
   export async function createExamTemplate(payload) {
     // Call API POST /api/admin/exam-templates
   }
   ```

2. **Thêm query hooks vào `packages/app/features/admin/api/useAdminQueries.js`:**
   ```javascript
   export const useQuestionTypesQuery = (initialData = null) =>
     useQuery({
       queryKey: ['admin', 'question-types'],
       queryFn: fetchQuestionTypes,
       initialData: initialData || undefined,
       enabled: !initialData,
       ...commonOptions,
     })
   ```

3. **Cập nhật `CreateExamTemplateForm.jsx`:**
   - Uncomment các dòng import API
   - Thay `mockQuestionTypes` bằng `useQuestionTypesQuery()`
   - Thay mock API call bằng `createExamTemplate(payload)`

4. **Tạo modal/drawer để chọn câu hỏi từ ngân hàng đề:**
   - Khi click nút "Chọn câu hỏi từ ngân hàng đề"
   - Hiển thị danh sách câu hỏi theo QuestionTypeId và Skill
   - Cho phép chọn nhiều câu hỏi
   - Lưu danh sách câu hỏi đã chọn vào form

## Validation Rules

- **Tên mẫu đề**: Bắt buộc
- **Kỹ năng**: Bắt buộc, chỉ chọn Reading | Listening | Writing
- **Từ câu / Đến câu**: Bắt buộc, phải là số nguyên > 0, QuestionTo >= QuestionFrom
- **Tiêu đề phần**: Bắt buộc
- **Hướng dẫn**: Bắt buộc
- **Số điểm**: Bắt buộc, phải > 0
- **URL ví dụ**: Tùy chọn, phải là URL hợp lệ nếu có
- **Loại câu hỏi**: Bắt buộc, phải chọn sau khi chọn Skill

## Lưu ý

- Form hỗ trợ thêm/xóa parts động
- QuestionTypeId dropdown sẽ tự động filter theo Skill đã chọn
- Nút "Chọn câu hỏi từ ngân hàng đề" chỉ hiển thị sau khi chọn QuestionTypeId
- Cần validate QuestionFrom <= QuestionTo và không overlap giữa các parts

