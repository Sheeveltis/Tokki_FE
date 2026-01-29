'use client'

import React, { useState, useEffect } from 'react'
import { Modal, Form, Card, Checkbox, Input } from 'antd'
import {
  FileOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  CheckOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'

/**
 * Modal chuyển trạng thái đề thi
 * @param {boolean} open - Hiển thị modal
 * @param {boolean} loading - Trạng thái loading
 * @param {Function} onCancel - Callback khi hủy
 * @param {Function} onSubmit - Callback khi submit ({ status, confirmed, deleteConfirm })
 * @param {number} currentStatus - Trạng thái hiện tại của đề thi
 */
export function ExamStatusChangeModal({ open, loading, onCancel, onSubmit, currentStatus }) {
  const [form] = Form.useForm()
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const confirmed = Form.useWatch('confirmed', form)
  const deleteConfirm = Form.useWatch('deleteConfirm', form)

  const statusOptions = [
    { value: 0, label: 'Nháp', icon: FileOutlined, color: '#6b7280', bgColor: '#f9fafb', borderColor: '#e5e7eb' },
    { value: 1, label: 'Xuất bản', icon: CheckCircleOutlined, color: '#10b981', bgColor: '#f0fdf4', borderColor: '#bbf7d0' },
    { value: 2, label: 'Xóa', icon: DeleteOutlined, color: '#ef4444', bgColor: '#fef2f2', borderColor: '#fecaca' },
  ]

  useEffect(() => {
    if (open) {
      setSelectedStatus(currentStatus)
      form.setFieldsValue({ status: currentStatus, confirmed: false, deleteConfirm: '' })
    } else {
      form.resetFields()
      setSelectedStatus(null)
    }
  }, [open, form, currentStatus])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      onSubmit?.(values)
    } catch {
      // Validation error
    }
  }

  const handleStatusClick = (status) => {
    setSelectedStatus(status)
    form.setFieldsValue({ status, deleteConfirm: '' })
  }

  return (
    <Modal
      title={<div style={{ fontSize: 20, fontWeight: 600, color: '#1f2937' }}>Chuyển trạng thái đề thi</div>}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Xác nhận chuyển trạng thái"
      cancelText="Hủy"
      confirmLoading={loading}
      okButtonProps={{
        type: 'primary',
        size: 'middle',
        style: {
          minWidth: 180,
          height: 40,
          borderRadius: 8,
          fontWeight: 500,
        },
        icon: <CheckOutlined />,
        disabled:
          selectedStatus === null ||
          selectedStatus === currentStatus ||
          !confirmed ||
          (selectedStatus === 2 && deleteConfirm?.toUpperCase() !== 'XÓA'),
      }}
      cancelButtonProps={{
        size: 'middle',
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
      width={700}
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          name="status"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          style={{ marginBottom: 0 }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {statusOptions.map((option) => {
              const Icon = option.icon
              const isSelected = selectedStatus === option.value
              const isCurrent = currentStatus === option.value

              return (
                <Card
                  key={option.value}
                  hoverable
                  onClick={() => handleStatusClick(option.value)}
                  style={{
                    cursor: 'pointer',
                    border: isSelected ? `2px solid ${option.color}` : `2px solid ${option.borderColor}`,
                    borderRadius: 12,
                    padding: '20px',
                    background: isSelected ? option.bgColor : '#ffffff',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? `0 4px 12px ${option.color}33` : '0 1px 3px rgba(0, 0, 0, 0.1)',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    position: 'relative',
                    opacity: isCurrent ? 0.7 : 1,
                  }}
                  bodyStyle={{ padding: 0 }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: isSelected ? option.color : '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Icon
                        style={{
                          fontSize: 24,
                          color: isSelected ? '#ffffff' : '#9ca3af',
                        }}
                      />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: isSelected ? option.color : '#6b7280',
                          marginBottom: 4,
                        }}
                      >
                        {option.label}
                      </div>
                      {isCurrent && (
                        <div
                          style={{
                            fontSize: 11,
                            color: '#9ca3af',
                            fontStyle: 'italic',
                          }}
                        >
                          (Hiện tại)
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: option.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CheckOutlined style={{ fontSize: 12, color: '#fff' }} />
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </Form.Item>

        {selectedStatus !== null && selectedStatus !== currentStatus && (
          <>
            {selectedStatus === 2 ? (
              <>
                <div
                  style={{
                    padding: '16px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 10,
                    marginTop: 16,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}
                >
                  <ExclamationCircleOutlined style={{ fontSize: 20, color: '#ef4444', marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#dc2626', marginBottom: 8 }}>
                      Cảnh báo: Hành động này không thể hoàn tác
                    </div>
                    <div style={{ fontSize: 14, color: '#991b1b', lineHeight: 1.6 }}>
                      Đề thi sẽ được chuyển từ{' '}
                      <strong>"{statusOptions.find((s) => s.value === currentStatus)?.label}"</strong> sang{' '}
                      <strong>"{statusOptions.find((s) => s.value === selectedStatus)?.label}"</strong>.
                    </div>
                  </div>
                </div>
                <Form.Item
                  name="deleteConfirm"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập "XÓA" để xác nhận',
                    },
                    {
                      validator: (_, value) => {
                        if (!value || value.toUpperCase() !== 'XÓA') {
                          return Promise.reject(new Error('Vui lòng nhập chính xác "XÓA" để xác nhận'))
                        }
                        return Promise.resolve()
                      },
                    },
                  ]}
                  style={{ marginTop: 16, marginBottom: 0 }}
                >
                  <Input
                    placeholder='Nhập "XÓA" để xác nhận'
                    style={{ height: 40 }}
                    onChange={(e) => {
                      form.setFieldsValue({ deleteConfirm: e.target.value })
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="confirmed"
                  valuePropName="checked"
                  rules={[
                    {
                      validator: (_, value) =>
                        value ? Promise.resolve() : Promise.reject(new Error('Vui lòng xác nhận để tiếp tục')),
                    },
                  ]}
                  style={{ marginTop: 16, marginBottom: 0 }}
                >
                  <Checkbox style={{ fontSize: 14, color: '#374151' }}>Tôi hiểu rõ hậu quả và muốn xóa đề thi này</Checkbox>
                </Form.Item>
              </>
            ) : (
              <>
                <div
                  style={{
                    padding: '16px',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: 10,
                    marginTop: 16,
                  }}
                >
                  <div style={{ fontSize: 14, color: '#1e40af', lineHeight: 1.6 }}>
                    Đề thi sẽ được chuyển từ{' '}
                    <strong>"{statusOptions.find((s) => s.value === currentStatus)?.label}"</strong> sang{' '}
                    <strong>"{statusOptions.find((s) => s.value === selectedStatus)?.label}"</strong>.
                  </div>
                </div>
                <Form.Item
                  name="confirmed"
                  valuePropName="checked"
                  rules={[
                    {
                      validator: (_, value) =>
                        value ? Promise.resolve() : Promise.reject(new Error('Vui lòng xác nhận để tiếp tục')),
                    },
                  ]}
                  style={{ marginTop: 16, marginBottom: 0 }}
                >
                  <Checkbox style={{ fontSize: 14, color: '#374151' }}>Tôi xác nhận muốn chuyển trạng thái đề thi này</Checkbox>
                </Form.Item>
              </>
            )}
          </>
        )}
      </Form>
    </Modal>
  )
}

export default ExamStatusChangeModal

