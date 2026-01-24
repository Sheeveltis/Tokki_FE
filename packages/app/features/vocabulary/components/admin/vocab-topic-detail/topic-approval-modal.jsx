'use client'

import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, Space, Card } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, CheckOutlined } from '@ant-design/icons'

const { TextArea } = Input

/**
 * Modal phê duyệt chủ đề flashcard
 * @param {boolean} open - Hiển thị modal
 * @param {boolean} loading - Trạng thái loading
 * @param {Function} onCancel - Callback khi hủy
 * @param {Function} onSubmit - Callback khi submit (approve/reject)
 * @param {string} initialApprovalType - Loại phê duyệt ban đầu ('approve' hoặc 'reject')
 */
export function TopicApprovalModal({ open, loading, onCancel, onSubmit, initialApprovalType = 'approve' }) {
  const [form] = Form.useForm()
  const [approvalType, setApprovalType] = useState(initialApprovalType)

  useEffect(() => {
    if (open) {
      const type = initialApprovalType || 'approve'
      form.setFieldsValue({
        approvalType: type,
        rejectionReason: '',
      })
      setApprovalType(type)
    } else {
      form.resetFields()
      setApprovalType('approve')
    }
  }, [open, form, initialApprovalType])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      onSubmit?.(values)
    } catch (err) {
      // Validation error
    }
  }

  const handleApprovalTypeChange = (e) => {
    const newType = e.target.value
    setApprovalType(newType)
    form.setFieldsValue({ approvalType: newType })
    
    if (newType === 'approve') {
      form.setFieldsValue({ rejectionReason: '' })
    }
  }

  const isApprove = approvalType === 'approve'
  const isReject = approvalType === 'reject'

  return (
    <Modal
      title={
        <div style={{ fontSize: 20, fontWeight: 600, color: '#1f2937' }}>
          Phê duyệt chủ đề flashcard
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={isApprove ? 'Xác nhận phê duyệt' : 'Xác nhận từ chối'}
      cancelText="Hủy"
      confirmLoading={loading}
      okButtonProps={{
        danger: isReject,
        type: isApprove ? 'primary' : 'default',
        size: 'large',
        style: {
          minWidth: 140,
          height: 40,
          borderRadius: 8,
          fontWeight: 500,
        },
        icon: isApprove ? <CheckOutlined /> : <CloseCircleOutlined />,
      }}
      cancelButtonProps={{
        size: 'large',
        style: {
          minWidth: 100,
          height: 40,
          borderRadius: 8,
        },
      }}
      destroyOnClose
      centered
      styles={{
        header: { 
          padding: '24px 24px 20px',
          borderBottom: 'none',
        },
        body: { 
          padding: '0 24px 24px',
        },
        footer: {
          padding: '20px 24px',
          borderTop: '1px solid #f0f0f0',
        },
      }}
      width={580}
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          name="approvalType"
          rules={[{ required: true, message: 'Vui lòng chọn quyết định phê duyệt' }]}
          style={{ marginBottom: 20 }}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            <Card
              hoverable
              onClick={() => {
                setApprovalType('approve')
                form.setFieldsValue({ approvalType: 'approve', rejectionReason: '' })
              }}
              style={{
                flex: 1,
                cursor: 'pointer',
                border: isApprove ? '2px solid #10b981' : '2px solid #e5e7eb',
                borderRadius: 12,
                padding: '20px',
                background: isApprove ? '#f0fdf4' : '#ffffff',
                transition: 'all 0.2s ease',
                boxShadow: isApprove ? '0 4px 12px rgba(16, 185, 129, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                transform: isApprove ? 'scale(1.02)' : 'scale(1)',
                position: 'relative',
              }}
              bodyStyle={{ padding: 0 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: isApprove ? '#10b981' : '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <CheckCircleOutlined 
                    style={{ 
                      fontSize: 24, 
                      color: isApprove ? '#ffffff' : '#9ca3af',
                    }} 
                  />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: 16, 
                    fontWeight: 600, 
                    color: isApprove ? '#059669' : '#6b7280',
                    marginBottom: 4,
                  }}>
                    Đồng ý phê duyệt
                  </div>
                  <div style={{ 
                    fontSize: 13, 
                    color: isApprove ? '#047857' : '#9ca3af',
                  }}>
                    Chủ đề sẽ được kích hoạt
                  </div>
                </div>
                {isApprove && (
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <CheckOutlined style={{ fontSize: 12, color: '#fff' }} />
                  </div>
                )}
              </div>
            </Card>

            <Card
              hoverable
              onClick={() => {
                setApprovalType('reject')
                form.setFieldsValue({ approvalType: 'reject' })
              }}
              style={{
                flex: 1,
                cursor: 'pointer',
                border: isReject ? '2px solid #ef4444' : '2px solid #e5e7eb',
                borderRadius: 12,
                padding: '20px',
                background: isReject ? '#fef2f2' : '#ffffff',
                transition: 'all 0.2s ease',
                boxShadow: isReject ? '0 4px 12px rgba(239, 68, 68, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                transform: isReject ? 'scale(1.02)' : 'scale(1)',
                position: 'relative',
              }}
              bodyStyle={{ padding: 0 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: isReject ? '#ef4444' : '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <CloseCircleOutlined 
                    style={{ 
                      fontSize: 24, 
                      color: isReject ? '#ffffff' : '#9ca3af',
                    }} 
                  />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: 16, 
                    fontWeight: 600, 
                    color: isReject ? '#dc2626' : '#6b7280',
                    marginBottom: 4,
                  }}>
                    Từ chối phê duyệt
                  </div>
                  <div style={{ 
                    fontSize: 13, 
                    color: isReject ? '#b91c1c' : '#9ca3af',
                  }}>
                    Chủ đề sẽ không được kích hoạt
                  </div>
                </div>
                {isReject && (
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <CheckOutlined style={{ fontSize: 12, color: '#fff' }} />
                  </div>
                )}
              </div>
            </Card>
          </div>
        </Form.Item>

        {isApprove && (
          <div 
            style={{ 
              padding: '16px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 10,
              marginTop: 8,
            }}
          >
            <Space>
              <CheckCircleOutlined style={{ fontSize: 18, color: '#10b981' }} />
              <span style={{ fontSize: 14, color: '#047857', lineHeight: 1.6 }}>
                Chủ đề sẽ được chuyển sang trạng thái <strong>"Hoạt động"</strong> sau khi bạn xác nhận phê duyệt.
              </span>
            </Space>
          </div>
        )}

        {isReject && (
          <Form.Item
            label={
              <span style={{ fontSize: 15, fontWeight: 500, color: '#374151' }}>
                Lý do từ chối phê duyệt
              </span>
            }
            name="rejectionReason"
            rules={[
              { required: true, message: 'Vui lòng nhập lý do từ chối phê duyệt' },
              { min: 10, message: 'Lý do phải có ít nhất 10 ký tự' },
            ]}
            style={{ marginBottom: 0, marginTop: 8 }}
          >
            <TextArea
              rows={4}
              placeholder="Vui lòng nhập lý do chi tiết để người tạo chủ đề có thể cải thiện..."
              style={{ 
                fontSize: 14,
                borderRadius: 8,
                border: '1px solid #d1d5db',
              }}
              showCount
              maxLength={500}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  )
}

export default TopicApprovalModal

