'use client'

import React, { useState } from 'react'
import { Space, Modal } from 'antd'
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { ButtonV2 } from '../../../../../../components/buttonV2.jsx'

export function QuestionTypeHeaderActions({
  onBack,
  onEdit,
  onDelete,
  deleting,
  onAddQuestion,
}) {
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)

  const handleDelete = () => {
    setIsDeleteModalVisible(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await onDelete()
      setIsDeleteModalVisible(false)
    } catch (error) {
      // Error is handled in parent component
    }
  }

  return (
    <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
      <ButtonV2
        title="Quay lại"
        color="charcoal"
        onPress={onBack}
        icon={<ArrowLeftOutlined />}
        style={{ minWidth: 100, paddingVertical: 10 }}
        textStyle={{ fontSize: 14 }}
      />

      <Space>
        <ButtonV2
          title="Sửa bộ câu hỏi"
          color="charcoal"
          onPress={onEdit}
          icon={<EditOutlined />}
          style={{ minWidth: 150, paddingVertical: 10 }}
          textStyle={{ fontSize: 14 }}
        />

        <ButtonV2
          title={deleting ? 'Đang xóa...' : 'Xóa bộ câu hỏi'}
          color="#ff4d4f"
          onPress={handleDelete}
          icon={<DeleteOutlined />}
          style={{ minWidth: 150, paddingVertical: 10 }}
          textStyle={{ fontSize: 14 }}
          disabled={deleting}
        />

        <ButtonV2
          title="Thêm câu hỏi"
          color="#F1BE4B"
          onPress={onAddQuestion}
          icon={<PlusOutlined />}
          style={{ minWidth: 120, paddingVertical: 10 }}
          textStyle={{ fontSize: 14 }}
        />
      </Space>

      <Modal
        title="Xác nhận xóa"
        open={isDeleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={deleting}
        okButtonProps={{
          danger: true,
          loading: deleting,
        }}
      >
        <p>Bạn có chắc chắn muốn xóa loại câu hỏi này? Tất cả câu hỏi thuộc loại này cũng sẽ bị xóa.</p>
        <p>Hành động này không thể hoàn tác.</p>
      </Modal>
    </Space>
  )
}

export default QuestionTypeHeaderActions

