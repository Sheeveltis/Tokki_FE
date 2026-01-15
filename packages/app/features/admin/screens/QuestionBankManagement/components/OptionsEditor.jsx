'use client'

import React from 'react'
import { Input, Button, Checkbox, Upload, message } from 'antd'
import { DeleteOutlined, PlusOutlined, InboxOutlined } from '@ant-design/icons'
import { createObjectUrl } from '../../CreateQuestion/components/upload-utils'
import { Typography } from 'antd';

const { Text } = Typography;
const { Dragger } = Upload

/**
 * Component chỉnh sửa đáp án (khi đang edit câu hỏi)
 */
export function OptionsEditor({ options, onAddOption, onRemoveOption, onOptionChange, onSelectCorrect }) {
  return (
    <div style={{ marginTop: 12 }}>
      <Text strong style={{ display: 'block', marginBottom: 8 }}>Đáp án:</Text>

      {options.map((opt, idx) => {
        const isCorrect = !!opt.isCorrect
        return (
          <div
            key={opt.__tempId}
            style={{
              display: 'grid',
              gridTemplateColumns: '44px 1fr 1fr 40px',
              gap: 8,
              alignItems: 'center',
              padding: 10,
              borderRadius: 8,
              border: `1px solid ${isCorrect ? '#52c41a' : '#d9d9d9'}`,
              backgroundColor: isCorrect ? '#f6ffed' : '#fff',
              marginBottom: 8,
            }}
          >
            <Checkbox
              checked={isCorrect}
              onChange={() => onSelectCorrect(opt.__tempId)}
              style={{ justifySelf: 'center' }}
            >
              {String(idx + 1)}
            </Checkbox>

            <Input
              value={opt.content}
              onChange={(e) => onOptionChange(opt.__tempId, 'content', e.target.value)}
              placeholder={`Nội dung đáp án ${idx + 1}`}
            />

            <div>
              <Dragger
                name="file"
                multiple={false}
                showUploadList={false}
                accept="image/*"
                beforeUpload={(file) => {
                  const isImage = file.type.startsWith('image/')
                  if (!isImage) {
                    message.error('Chỉ chấp nhận file hình ảnh!')
                    return Upload.LIST_IGNORE
                  }
                  onOptionChange(opt.__tempId, 'imageFile', file)
                  return false
                }}
                style={{ padding: '8px 0' }}
              >
                <p className="ant-upload-drag-icon" style={{ margin: 0 }}>
                  <InboxOutlined style={{ fontSize: 22 }} />
                </p>
                <p className="ant-upload-text" style={{ margin: 0, fontSize: 12 }}>
                  Tải ảnh (tùy chọn)
                </p>
                {opt.imageFile || opt.imageUrl ? (
                  <p style={{ marginTop: 6, marginBottom: 0, fontSize: 11, color: '#666' }}>
                    {opt.imageFile ? `File đã chọn: ${opt.imageFile.name}` : 'Đã chọn'}
                  </p>
                ) : null}
              </Dragger>
              {(opt.imageFile || opt.imageUrl) ? (
                <Button
                  type="link"
                  danger
                  onClick={() => {
                    onOptionChange(opt.__tempId, 'imageUrl', '')
                    onOptionChange(opt.__tempId, 'imageFile', null)
                  }}
                  style={{ paddingLeft: 0 }}
                >
                  Xóa ảnh
                </Button>
              ) : null}

              {(opt.imageFile || opt.imageUrl) ? (
                <div style={{ marginTop: 8 }}>
                  <img
                    src={opt.imageFile ? createObjectUrl(opt.imageFile) : opt.imageUrl}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: 140, borderRadius: 6, border: '1px solid #d9d9d9' }}
                  />
                </div>
              ) : null}
            </div>

            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onRemoveOption(opt.__tempId)}
              disabled={options.length <= 2}
            />
          </div>
        )
      })}

      <Button
        type="dashed"
        block
        icon={<PlusOutlined />}
        onClick={onAddOption}
        style={{ marginTop: 8 }}
      >
        Thêm đáp án
      </Button>
    </div>
  )
}

