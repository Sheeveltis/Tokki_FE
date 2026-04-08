'use client'

import React, { useMemo, lazy, Suspense } from 'react'
import { Form, Skeleton } from 'antd'

// Lazy load ReactQuill wrapper to avoid findDOMNode errors on SSR
const ReactQuillWrapper = lazy(() => 
  import('./react-quill-wrapper').then(module => ({ default: module.ReactQuillWrapper }))
)

/**
 * QuillField: A custom field that correctly receives value/onChange from Form.Item 
 * even when wrapped in Suspense/Divs.
 */
const QuillField = React.forwardRef(({ value, onChange, placeholder, modules, formats, ...rest }, ref) => {
  return (
    <Suspense fallback={
      <div style={{ height: 650, border: '1px solid #d9d9d9', borderRadius: 8, padding: 24, background: '#fafafa' }}>
         <Skeleton active paragraph={{ rows: 12 }} />
      </div>
    }>
      <div className="modern-quill-editor" style={{ 
        borderRadius: 12, 
        overflow: 'hidden', 
        border: '1px solid #d9d9d9',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        backgroundColor: '#fff',
        height: 650,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <ReactQuillWrapper 
          ref={ref}
          theme="snow"
          modules={modules}
          formats={formats}
          value={value}
          onChange={onChange}
          style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: 0
          }}
          placeholder={placeholder || "Viết nội dung bài blog chi tiết ở đây..."}
          {...rest}
        />
      </div>
    </Suspense>
  )
})

QuillField.displayName = 'QuillField'

export function BlogEditor({ name, label, rules }) {
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        ['blockquote', 'code-block'],
        [{ align: [] }],
        ['link', 'image', 'video'],
        ['clean'],
      ],
    },
    clipboard: {
      matchVisual: false,
    },
  }), [])

  const formats = useMemo(() => [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
    'list', 'bullet', 'indent', 'script',
    'link', 'image', 'video', 'color', 'background', 'align'
  ], [])

  return (
    <>
      <Form.Item 
        name={name} 
        label={label} 
        rules={rules}
        style={{ marginBottom: 40 }}
      >
        <QuillField 
          modules={modules} 
          formats={formats} 
          placeholder="Viết bài blog chi tiết ở đây..."
        />
      </Form.Item>

      <style dangerouslySetInnerHTML={{ __html: `
        .modern-quill-editor .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid #d9d9d9;
          background-color: #fafafa !important;
          padding: 12px 16px;
          flex-shrink: 0;
        }
        .modern-quill-editor .ql-container.ql-snow {
          border: none !important;
          flex: 1;
          overflow-y: auto;
          font-size: 16px;
          display: flex;
          flex-direction: column;
        }
        .modern-quill-editor .ql-editor {
          flex: 1;
          padding: 32px 40px;
          line-height: 1.8;
          color: #262626;
          font-family: -apple-system, system-ui, sans-serif;
          min-height: 100%;
        }
        .modern-quill-editor .ql-editor.ql-blank::before {
          font-style: normal;
          color: #bfbfbf;
          left: 40px;
          top: 32px;
        }
        .modern-quill-editor .ql-editor h1 { font-size: 2.25em; margin-bottom: 0.8em; font-weight: 700; }
        .modern-quill-editor .ql-editor h2 { font-size: 1.75em; margin-bottom: 0.8em; font-weight: 600; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; }
        .modern-quill-editor .ql-editor p { margin-bottom: 1.4em; }
        
        .modern-quill-editor .ql-editor img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 32px auto;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          transition: transform 0.3s ease;
        }
        .modern-quill-editor .ql-editor img:hover {
          transform: scale(1.01);
        }
        
        .modern-quill-editor .ql-snow .ql-picker.ql-size .ql-picker-label::before,
        .modern-quill-editor .ql-snow .ql-picker.ql-size .ql-picker-item::before {
          content: 'Font size';
        }
        .modern-quill-editor .ql-snow .ql-picker.ql-header .ql-picker-label::before,
        .modern-quill-editor .ql-snow .ql-picker.ql-header .ql-picker-item::before {
          content: 'Heading';
        }
      `}} />
    </>
  )
}

export default BlogEditor