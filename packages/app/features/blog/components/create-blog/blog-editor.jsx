'use client'
import React, { useMemo, lazy, Suspense } from 'react'
import { Form } from 'antd'

// Lazy load ReactQuill wrapper để tránh lỗi findDOMNode
const ReactQuillWrapper = lazy(() => 
  import('./react-quill-wrapper').then(module => ({ default: module.ReactQuillWrapper }))
)

export function BlogEditor({ name, label, rules }) {
  // Cấu hình Toolbar gọn gàng ở đây
  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  }), [])

  return (
    <Form.Item name={name} label={label} rules={rules}>
      {/* ReactQuillWrapper nhận value/onChange tự động từ Form.Item */}
      <Suspense fallback={<div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #d9d9d9', borderRadius: 4 }}>Đang tải bộ soạn thảo...</div>}>
        <ReactQuillWrapper 
          theme="snow"
          modules={modules}
          style={{ height: 400, marginBottom: 50 }} 
          placeholder="Viết nội dung bài blog ở đây..."
        />
      </Suspense>
    </Form.Item>
  )
}