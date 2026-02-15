'use client'

import React, { useRef, useState } from 'react'
import { Space, Modal } from 'antd'
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, PlusOutlined, FileExcelOutlined } from '@ant-design/icons'
import { ButtonV2 } from '../../../../../../components/buttonV2.jsx'

import { importQuestionsExcel } from '../../../api/question-bank-management.js'
import { showAdminSuccess, showAdminError } from '../../../../../../components/HelperAdmin.jsx'

export function QuestionTypeHeaderActions({
  questionTypeId,
  onBack,
  onEdit,
  onDelete,
  deleting,
  onAddQuestion,
  onImported,
}) {
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
  const [importingExcel, setImportingExcel] = useState(false)
  const fileInputRef = useRef(null)

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

  const handleExcelFileSelect = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Kiểm tra định dạng file
    const validExtensions = ['.xlsx', '.xls']
    const fileName = file.name.toLowerCase()
    const isValidExtension = validExtensions.some((ext) => fileName.endsWith(ext))

    if (!isValidExtension) {
      showAdminError('Vui lòng chọn file Excel (.xlsx hoặc .xls)')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    try {
      setImportingExcel(true)
      const response = await importQuestionsExcel(questionTypeId, file)
      
      if (response?.isSuccess) {
        const msg = String(response?.message || '')
        const hasZeroSuccess = /Thành công:\s*0\b/i.test(msg) || /Thanh cong:\s*0\b/i.test(msg)

        if (hasZeroSuccess) {
          showAdminError(msg || 'Import thất bại: 0 câu hỏi thành công')
        } else {
          showAdminSuccess(msg || 'Import câu hỏi từ Excel thành công')
        }

        if (onImported) onImported()
      } else {
        showAdminError(response?.message || 'Import câu hỏi thất bại')
      }
    } catch (error) {
      showAdminError(error.message || 'Có lỗi xảy ra khi import Excel')
    } finally {
      setImportingExcel(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
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
        <input
          type="file"
          ref={fileInputRef}
          accept=".xlsx, .xls"
          style={{ display: 'none' }}
          onChange={handleExcelFileSelect}
        />
        <ButtonV2
          title={importingExcel ? 'Đang import...' : 'Import Excel'}
          color="#217346"
          onPress={() => fileInputRef.current?.click()}
          icon={<FileExcelOutlined />}
          style={{ minWidth: 150, paddingVertical: 10 }}
          textStyle={{ fontSize: 14 }}
          disabled={importingExcel}
        />

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

