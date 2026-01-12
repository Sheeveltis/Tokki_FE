'use client'

import React, { useState, useEffect } from 'react'
import { Modal, Form, Radio, Input, message } from 'antd'

const { TextArea } = Input

/**
 * Modal phê duyệt chủ đề flashcard
 * @param {boolean} open - Hiển thị modal
 * @param {boolean} loading - Trạng thái loading
 * @param {Function} onCancel - Callback khi hủy
 * @param {Function} onSubmit - Callback khi submit (approve/reject)
 */
export function TopicApprovalModal({ open, loading, onCancel, onSubmit }) {
  const [form] = Form.useForm()
  const [approvalType, setApprovalType] = useState('approve') // 'approve' hoặc 'reject'

  // Reset form khi modal mở/đóng
  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        approvalType: 'approve',
        rejectionReason: '',
      })
      setApprovalType('approve')
    } else {
      form.resetFields()
      setApprovalType('approve')
    }
  }, [open, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      onSubmit?.(values)
    } catch (err) {
      // Validation error - không làm gì, form sẽ hiển thị lỗi
    }
  }

  const handleApprovalTypeChange = (e) => {
    const newType = e.target.value
    setApprovalType(newType)
    
    // Nếu chuyển sang approve, clear rejection reason
    if (newType === 'approve') {
      form.setFieldsValue({ rejectionReason: '' })
    }
  }

  return (
    <Modal
      title="Phê duyệt chủ đề flashcard"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={approvalType === 'approve' ? 'Đồng ý phê duyệt' : 'Từ chối phê duyệt'}
      cancelText="Hủy"
      confirmLoading={loading}
      okButtonProps={{
        danger: approvalType === 'reject',
        type: approvalType === 'approve' ? 'primary' : 'default',
      }}
      destroyOnClose
      centered
      styles={{
        header: { fontSize: 18 },
        body: { fontSize: 16 },
      }}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Quyết định phê duyệt"
          name="approvalType"
          rules={[{ required: true, message: 'Vui lòng chọn quyết định phê duyệt' }]}
        >
          <Radio.Group onChange={handleApprovalTypeChange}>
            <Radio value="approve" style={{ fontSize: 16 }}>
              Đồng ý phê duyệt
            </Radio>
            <Radio value="reject" style={{ fontSize: 16 }}>
              Không đồng ý phê duyệt
            </Radio>
          </Radio.Group>
        </Form.Item>

        {approvalType === 'reject' && (
          <Form.Item
            label="Lý do không đồng ý phê duyệt"
            name="rejectionReason"
            rules={[
              { required: true, message: 'Vui lòng nhập lý do không đồng ý phê duyệt' },
              { min: 10, message: 'Lý do phải có ít nhất 10 ký tự' },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập lý do không đồng ý phê duyệt chủ đề này..."
              style={{ fontSize: 16 }}
              showCount
              maxLength={500}
            />
          </Form.Item>
        )}

        {approvalType === 'approve' && (
          <div style={{ padding: '12px 16px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
            <span style={{ fontSize: 14, color: '#52c41a' }}>
              Chủ đề sẽ được chuyển sang trạng thái "Hoạt động" sau khi bạn đồng ý phê duyệt.
            </span>
          </div>
        )}
      </Form>
    </Modal>
  )
}

export default TopicApprovalModal

