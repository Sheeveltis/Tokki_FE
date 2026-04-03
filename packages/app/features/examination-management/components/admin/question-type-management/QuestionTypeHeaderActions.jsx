'use client'

import { useRef, useState } from 'react'
import { Space, Modal, Button, message } from 'antd'
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, PlusOutlined, FileExcelOutlined } from '@ant-design/icons'

import { importQuestionsExcel } from '../../../api/question-bank-management.js'

export function QuestionTypeHeaderActions({
  questionTypeId,
  onBack,
  onEdit,
  onDelete,
  deleting,
  onAddQuestion,
  onImported,
  hideMainButtons = false,
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
      message.error('Vui lòng chọn file Excel (.xlsx hoặc .xls)')
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
          message.error(msg || 'Import thất bại: 0 câu hỏi thành công')
        } else {
          message.success(msg || 'Import câu hỏi từ Excel thành công')
        }

        if (onImported) onImported()
      } else {
        message.error(response?.message || 'Import câu hỏi thất bại')
      }
    } catch (error) {
      message.error(error.message || 'Có lỗi xảy ra khi import Excel')
    } finally {
      setImportingExcel(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <Space align="center" style={{ justifyContent: 'flex-end' }}>
      {!hideMainButtons && (
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={onBack} 
          style={{ minWidth: 100, borderRadius: 20, height: 40, fontWeight: 600 }}
        >
          Quay lại
        </Button>
      )}

      <Space>
        <input
          type="file"
          ref={fileInputRef}
          accept=".xlsx, .xls"
          style={{ display: 'none' }}
          onChange={handleExcelFileSelect}
        />
        <Button
          icon={<FileExcelOutlined />}
          onClick={() => fileInputRef.current?.click()}
          loading={importingExcel}
          disabled={importingExcel}
          style={{ borderRadius: 20, height: 40, fontWeight: 600 }}
        >
          {importingExcel ? 'Đang import...' : 'Import Excel'}
        </Button>

        {!hideMainButtons && (
          <>
            <Button  
              icon={<EditOutlined />} 
              onClick={onEdit}
              style={{ borderRadius: 20, height: 40, fontWeight: 600 }}
            >
              Sửa bộ câu hỏi
            </Button>

            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              loading={deleting}
              disabled={deleting}
              style={{ borderRadius: 20, height: 40, fontWeight: 600 }}
            >
              {deleting ? 'Đang xóa...' : 'Xóa bộ câu hỏi'}
            </Button>
          </>
        )}

        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={onAddQuestion}
          style={{ borderRadius: 20, height: 40, fontWeight: 600 }}
        >
          Thêm câu hỏi
        </Button>
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

