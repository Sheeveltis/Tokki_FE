'use client'

import React from 'react'
import { Input, Button, Checkbox, Upload, message, Tag, Space, Image, Tooltip, Typography } from 'antd'
import { DeleteOutlined, PlusOutlined, InboxOutlined, CheckCircleFilled, CameraOutlined } from '@ant-design/icons'
import { createObjectUrl } from '../../../api/upload-utils'

const { Text } = Typography;

/**
 * Component chỉnh sửa đáp án (khi đang edit câu hỏi)
 */

export function OptionsEditor({ options, onAddOption, onRemoveOption, onOptionChange, onSelectCorrect }) {
  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text strong style={{ fontSize: 14, color: '#262626' }}>Danh sách đáp án lựa chọn</Text>
        <Tag color="processing" bordered={false}>Tổng số: {options.length} lựa chọn</Tag>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map((opt, idx) => {
          const isCorrect = !!opt.isCorrect
          return (
            <div
              key={opt.__tempId}
              style={{
                display: 'grid',
                gridTemplateColumns: '50px 1fr 180px 44px',
                gap: 12,
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: 12,
                border: isCorrect ? '2px solid #52c41a' : '1px solid #f0f0f0',
                backgroundColor: isCorrect ? '#f6ffed' : '#ffffff',
                transition: 'all 0.3s ease',
                boxShadow: isCorrect ? '0 4px 12px rgba(82, 196, 26, 0.08)' : 'none'
              }}
            >
              <Tooltip title={isCorrect ? "Đây là đáp án đúng" : "Đánh dấu là đáp án đúng"}>
                <div 
                  onClick={() => onSelectCorrect(opt.__tempId)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backgroundColor: isCorrect ? '#52c41a' : '#fafafa',
                    color: isCorrect ? '#fff' : '#d9d9d9',
                    border: isCorrect ? 'none' : '2px dashed #d9d9d9',
                    fontSize: 16,
                    fontWeight: 700,
                    transition: 'all 0.2s'
                  }}
                >
                  {isCorrect ? <CheckCircleFilled /> : String.fromCharCode(65 + idx)}
                </div>
              </Tooltip>

              <Input
                value={opt.content}
                variant="borderless"
                onChange={(e) => onOptionChange(opt.__tempId, 'content', e.target.value)}
                placeholder={`Nhập nội dung lựa chọn ${String.fromCharCode(65 + idx)}...`}
                style={{ 
                  fontSize: 14, 
                  fontWeight: isCorrect ? 600 : 400,
                  backgroundColor: isCorrect ? 'transparent' : '#fafafa',
                  borderRadius: 8,
                  padding: '8px 12px'
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Upload
                  name="file"
                  multiple={false}
                  showUploadList={false}
                  accept="image/*"
                  beforeUpload={(file) => {
                    if (!file.type.startsWith('image/')) {
                      message.error('Phải là tệp hình ảnh!')
                      return Upload.LIST_IGNORE
                    }
                    onOptionChange(opt.__tempId, 'imageFile', file)
                    return false
                  }}
                >
                  <Button 
                    size="small" 
                    icon={<CameraOutlined />} 
                    style={{ borderRadius: 6, fontSize: 12 }}
                  >
                    {opt.imageFile || opt.imageUrl ? 'Đổi ảnh' : 'Thêm ảnh'}
                  </Button>
                </Upload>

                {(opt.imageFile || opt.imageUrl) && (
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Image
                      src={opt.imageFile ? createObjectUrl(opt.imageFile) : opt.imageUrl}
                      width={32}
                      height={32}
                      style={{ borderRadius: 4, objectFit: 'cover', border: '1px solid #d9d9d9' }}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined style={{ fontSize: 10 }} />}
                      size="small"
                      onClick={() => {
                        onOptionChange(opt.__tempId, 'imageUrl', '')
                        onOptionChange(opt.__tempId, 'imageFile', null)
                      }}
                      style={{ 
                        position: 'absolute', 
                        top: -8, 
                        right: -8, 
                        width: 16, 
                        height: 16, 
                        padding: 0,
                        backgroundColor: '#fff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        borderRadius: '50%'
                      }}
                    />
                  </div>
                )}
              </div>

              <Button
                type="text"
                danger
                shape="circle"
                icon={<DeleteOutlined />}
                onClick={() => onRemoveOption(opt.__tempId)}
                disabled={options.length <= 2}
                style={{ marginLeft: 'auto' }}
              />
            </div>
          )
        })}

        <Button
          type="dashed"
          block
          icon={<PlusOutlined />}
          onClick={onAddOption}
          style={{ 
            marginTop: 4, 
            height: 40, 
            borderRadius: 10, 
            fontSize: 14, 
            fontWeight: 500,
            borderWidth: 2
          }}
        >
          Thêm lựa chọn mới (A, B, C, ...)
        </Button>
      </div>
    </div>
  )
}

