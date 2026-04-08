'use client'

import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'

/**
 * ReactQuillWrapper: Optimized wrapper for Ant Design Form
 */
export const ReactQuillWrapper = forwardRef((props, ref) => {
  const quillRef = useRef(null)

  // Ant Design expects focus/blur methods to be exposed
  useImperativeHandle(ref, () => ({
    focus: () => {
      quillRef.current?.getEditor().focus()
    },
    blur: () => {
      quillRef.current?.getEditor().blur()
    },
    getEditor: () => quillRef.current?.getEditor()
  }))

  const handleChange = (content, delta, source, editor) => {
    if (props.onChange) {
      // Get the raw text to check if it's truly empty
      const text = editor.getText();
      // Quill adds a \n by default. If it's just \n or truly empty, and no media, it's blank.
      const isBlank = (text === '\n' || text === '') && !content.includes('<img') && !content.includes('<video');
      const value = isBlank ? '' : content;
      
      // Avoid circular updates if unnecessary, but ensure the first change is reported
      if (value !== props.value) {
        props.onChange(value);
      }
    }
  }

  const handleBlur = (previousSelection, source, editor) => {
    if (props.onBlur) {
      props.onBlur()
    }
  }

  return (
    <div style={props.style}>
      <ReactQuill
        ref={quillRef}
        {...props}
        value={props.value || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          flex: 1, 
          height: '100%', 
          border: 'none' 
        }}
      />
    </div>
  )
})

ReactQuillWrapper.displayName = 'ReactQuillWrapper'
