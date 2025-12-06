'use client'
import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Form } from 'antd'
import 'react-quill/dist/quill.snow.css'

// Dynamic import để tắt SSR
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <p>Đang tải bộ soạn thảo...</p>
})

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
      <ReactQuill 
        theme="snow"
        modules={modules}
        style={{ height: 400, marginBottom: 50 }} 
        placeholder="Viết nội dung bài blog ở đây..."
      />
    </Form.Item>
  )
}