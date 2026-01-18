'use client'
import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'

/**
 * ReactQuillWrapper: Wrapper component để tương thích với Ant Design Form và tránh lỗi findDOMNode
 * Sử dụng forwardRef và useRef để tránh findDOMNode
 */
export const ReactQuillWrapper = forwardRef((props, ref) => {
  const quillRef = useRef(null)
  const wrapperRef = useRef(null)

  // Expose methods cho Form.Item
  useImperativeHandle(ref, () => ({
    getValue: () => {
      return quillRef.current?.value || ''
    },
    setValue: (value) => {
      if (quillRef.current) {
        quillRef.current.value = value || ''
      }
    },
    focus: () => {
      if (quillRef.current) {
        const editor = quillRef.current.getEditor()
        editor.focus()
      }
    },
    blur: () => {
      if (quillRef.current) {
        const editor = quillRef.current.getEditor()
        editor.blur()
      }
    },
  }))

  // Handle value changes
  const handleChange = (value) => {
    if (props.onChange) {
      props.onChange(value)
    }
  }

  // Sync value prop với editor
  useEffect(() => {
    if (quillRef.current && props.value !== undefined) {
      const editor = quillRef.current.getEditor()
      const currentContent = editor.root.innerHTML
      if (currentContent !== props.value) {
        editor.clipboard.dangerouslyPasteHTML(props.value || '')
      }
    }
  }, [props.value])

  return (
    <div ref={wrapperRef} style={props.style}>
      <ReactQuill
        ref={quillRef}
        theme={props.theme || 'snow'}
        modules={props.modules}
        value={props.value || ''}
        onChange={handleChange}
        placeholder={props.placeholder}
        style={{ height: props.style?.height || 400 }}
      />
    </div>
  )
})

ReactQuillWrapper.displayName = 'ReactQuillWrapper'
