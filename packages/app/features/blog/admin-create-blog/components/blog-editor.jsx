'use client'
import React, { useMemo, lazy, Suspense } from 'react'
import { Form } from 'antd'
import 'react-quill/dist/quill.snow.css'

// Lazy load ReactQuill (thay thế next/dynamic)
const ReactQuill = lazy(() => import('react-quill'))

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
      {/* ReactQuill nhận value/onChange tự động từ Form.Item */}
      <Suspense fallback={<p>Đang tải bộ soạn thảo...</p>}>
        <ReactQuill 
          theme="snow"
          modules={modules}
          style={{ height: 400, marginBottom: 50 }} 
          placeholder="Viết nội dung bài blog ở đây..."
        />
      </Suspense>
    </Form.Item>
  )
}