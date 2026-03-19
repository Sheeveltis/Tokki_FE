'use client'

import { useRef, useState } from 'react'
import { Space, Modal, Button } from 'antd'
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, PlusOutlined, FileExcelOutlined } from '@ant-design/icons'

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
      <Button icon={<ArrowLeftOutlined />} onClick={onBack} style={{ minWidth: 100 }}>
        Quay lại
      </Button>

      <Space>
        <input
          type="file"
          ref={fileInputRef}
          accept=".xlsx, .xls"
          style={{ display: 'none' }}
          onChange={handleExcelFileSelect}
        />
        <Button
          type="primary"
          icon={<FileExcelOutlined />}
          onClick={() => fileInputRef.current?.click()}
          loading={importingExcel}
          disabled={importingExcel}
        >
          {importingExcel ? 'Đang import...' : 'Import Excel'}
        </Button>

        <Button type="primary" icon={<EditOutlined />} onClick={onEdit}>
          Sửa bộ câu hỏi
        </Button>

        <Button
          danger
          type="primary"
          icon={<DeleteOutlined />}
          onClick={handleDelete}
          loading={deleting}
          disabled={deleting}
        >
          {deleting ? 'Đang xóa...' : 'Xóa bộ câu hỏi'}
        </Button>

        <Button type="primary" icon={<PlusOutlined />} onClick={onAddQuestion}>
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

