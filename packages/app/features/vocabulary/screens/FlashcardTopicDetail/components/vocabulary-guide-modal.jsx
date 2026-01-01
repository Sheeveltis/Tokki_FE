'use client'

import React, { useState, useMemo } from 'react'
import { Modal, Table, Collapse, Typography, Tag, Space, Divider, Button } from 'antd'
import { InfoCircleOutlined, FileExcelOutlined, PlusCircleOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons'

const { Panel } = Collapse
const { Text, Title } = Typography

export function VocabularyGuideModal({ open, onCancel }) {
  const [activeKey, setActiveKey] = useState(['search'])

  // Bảng hướng dẫn format Excel - memoize để tránh re-render
  const excelFormatColumns = useMemo(
    () => [
      {
        title: 'Cột',
        dataIndex: 'column',
        key: 'column',
        width: 150,
        render: (text) => <Text strong>{text}</Text>,
      },
      {
        title: 'Mô tả',
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: 'Bắt buộc',
        dataIndex: 'required',
        key: 'required',
        width: 100,
        align: 'center',
        render: (required) =>
          required ? <Text strong style={{ color: '#ff4d4f' }}>Bắt buộc</Text> : <Text>Tùy chọn</Text>,
      },
      {
        title: 'Ví dụ',
        dataIndex: 'example',
        key: 'example',
        width: 200,
      },
    ],
    []
  )

  const excelFormatData = useMemo(
    () => [
      {
        key: '1',
        column: 'Text',
        description: 'Từ vựng tiếng Hàn',
        required: true,
        example: '사계절',
      },
      {
        key: '2',
        column: 'Pronunciation',
        description: 'Phiên âm (cách đọc)',
        required: false,
        example: 'Sa-gye-jeol',
      },
      {
        key: '3',
        column: 'ImgURL',
        description: 'URL ảnh minh họa (có thể để trống)',
        required: false,
        example: '(Không có ảnh)',
      },
      {
        key: '4',
        column: 'Definition',
        description: 'Định nghĩa/Nghĩa tiếng Việt',
        required: true,
        example: 'Bốn mùa',
      },
    ],
    []
  )

  // Bảng hướng dẫn các bước - memoize
  const stepsColumns = useMemo(
    () => [
      {
        title: 'Bước',
        dataIndex: 'step',
        key: 'step',
        width: 80,
        align: 'center',
        render: (step) => <Tag color="blue">{step}</Tag>,
      },
      {
        title: 'Hướng dẫn',
        dataIndex: 'instruction',
        key: 'instruction',
      },
    ],
    []
  )

  const excelStepsData = useMemo(
    () => [
      {
        key: '1',
        step: '1',
        instruction: 'Chuẩn bị file Excel (.xlsx hoặc .xls) với các cột theo format bên trên',
      },
      {
        key: '2',
        step: '2',
        instruction: 'Điền thông tin từ vựng vào các cột tương ứng (cột Text và Definition là bắt buộc)',
      },
      {
        key: '3',
        step: '3',
        instruction: 'Bấm nút "Import Excel" và chọn file Excel đã chuẩn bị',
      },
      {
        key: '4',
        step: '4',
        instruction: 'Hệ thống sẽ tự động import và thêm các từ vựng vào chủ đề. Kiểm tra kết quả import.',
      },
    ],
    []
  )

  const searchStepsData = useMemo(
    () => [
      {
        key: '1',
        step: '1',
        instruction: 'Click vào ô "Tìm và chọn từ vựng để thêm" ở phần quản lý từ vựng',
      },
      {
        key: '2',
        step: '2',
        instruction: 'Hệ thống sẽ tự động hiển thị 10 từ vựng đầu tiên khi bạn click vào ô tìm kiếm',
      },
      {
        key: '3',
        step: '3',
        instruction: 'Gõ từ khóa (từ vựng tiếng Hàn, phiên âm hoặc định nghĩa) để tìm kiếm từ vựng có sẵn trong hệ thống',
      },
      {
        key: '4',
        step: '4',
        instruction: 'Chọn một hoặc nhiều từ vựng từ danh sách kết quả tìm kiếm',
      },
      {
        key: '5',
        step: '5',
        instruction: 'Bấm nút "Thêm vào chủ đề" để thêm các từ vựng đã chọn vào chủ đề hiện tại',
      },
    ],
    []
  )

  const quickAddStepsData = useMemo(
    () => [
      {
        key: '1',
        step: '1',
        instruction: 'Bấm nút "Tạo từ vựng nhanh" ở phần quản lý từ vựng',
      },
      {
        key: '2',
        step: '2',
        instruction: 'Điền thông tin từ vựng trong form:',
      },
      {
        key: '3',
        step: '3',
        instruction: (
          <div style={{ paddingLeft: 20 }}>
            <Text>
              - <Text strong>Từ:</Text> Nhập từ vựng tiếng Hàn (bắt buộc)
            </Text>
            <br />
            <Text>
              - <Text strong>Phiên âm:</Text> Nhập cách đọc (tùy chọn)
            </Text>
            <br />
            <Text>
              - <Text strong>Định nghĩa:</Text> Nhập nghĩa tiếng Việt (bắt buộc)
            </Text>
            <br />
            <Text>
              - <Text strong>Câu ví dụ:</Text> Nhập câu ví dụ, có thể kèm bản dịch trong ngoặc (tùy chọn)
            </Text>
            <br />
            <Text>
              - <Text strong>Ảnh minh họa:</Text> Upload ảnh minh họa (tùy chọn, tối đa 5MB)
            </Text>
          </div>
        ),
      },
      {
        key: '4',
        step: '4',
        instruction: 'Bấm "Tạo và thêm vào chủ đề" để hoàn tất. Từ vựng sẽ tự động được thêm vào chủ đề hiện tại.',
      },
    ],
    []
  )

  return (
    <Modal
      title={
        <Space>
          <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 20 }} />
          <Text strong style={{ fontSize: 18 }}>Hướng dẫn thêm từ vựng</Text>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="close" type="primary" onClick={onCancel}>
          Đã hiểu
        </Button>,
      ]}
      width={900}
      destroyOnClose={false}
      maskClosable={true}
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto', padding: '8px 0' }}>
        <Collapse activeKey={activeKey} onChange={setActiveKey} ghost>
          <Panel
            header={
              <Space>
                <SearchOutlined style={{ color: '#1890ff', fontSize: 16 }} />
                <Text strong>Tìm kiếm và thêm từ vựng</Text>
              </Space>
            }
            key="search"
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Title level={5}>Các bước thực hiện:</Title>
                <Table
                  columns={stepsColumns}
                  dataSource={searchStepsData}
                  pagination={false}
                  size="small"
                  bordered
                  style={{ marginTop: 12 }}
                />
              </div>
              <div style={{ marginTop: 16, padding: 12, background: '#fffbe6', borderRadius: 4 }}>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <Text strong>Lưu ý:</Text> Tính năng này cho phép bạn tìm kiếm và thêm các từ vựng đã có sẵn trong hệ thống vào chủ đề. 
                  Bạn có thể tìm kiếm theo từ vựng tiếng Hàn, phiên âm hoặc định nghĩa. Hệ thống sẽ tự động load 10 từ vựng đầu tiên khi bạn click vào ô tìm kiếm. 
                  Bạn có thể chọn nhiều từ vựng cùng lúc để thêm vào chủ đề.
                </Text>
              </div>
            </Space>
          </Panel>

          <Panel
            header={
              <Space>
                <FileExcelOutlined style={{ color: '#217346', fontSize: 16 }} />
                <Text strong>Import từ vựng bằng Excel</Text>
              </Space>
            }
            key="excel"
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Title level={5}>Format Excel yêu cầu:</Title>
                <Table
                  columns={excelFormatColumns}
                  dataSource={excelFormatData}
                  pagination={false}
                  size="small"
                  bordered
                  style={{ marginTop: 12 }}
                />
              </div>
              <Divider />
              <div>
                <Title level={5}>Các bước thực hiện:</Title>
                <Table
                  columns={stepsColumns}
                  dataSource={excelStepsData}
                  pagination={false}
                  size="small"
                  bordered
                  style={{ marginTop: 12 }}
                />
              </div>
              <div style={{ marginTop: 16, padding: 12, background: '#fffbe6', borderRadius: 4 }}>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <Text strong>Lưu ý:</Text> File Excel phải có định dạng .xlsx hoặc .xls. Hàng đầu tiên phải là tiêu đề
                  cột với đúng tên: <Text strong>Text</Text>, <Text strong>Pronunciation</Text>, <Text strong>ImgURL</Text>, <Text strong>Definition</Text>. 
                  Cột <Text strong>Text</Text> và <Text strong>Definition</Text> là bắt buộc. Cột <Text strong>ImgURL</Text> có thể để trống hoặc nhập URL ảnh. 
                  Các từ vựng trùng lặp sẽ được bỏ qua. Sau khi import, hệ thống sẽ hiển thị danh sách từ vựng
                  thành công và thất bại.
                </Text>
              </div>
            </Space>
          </Panel>

          <Panel
            header={
              <Space>
                <PlusCircleOutlined style={{ color: '#F1BE4B', fontSize: 16 }} />
                <Text strong>Tạo từ vựng nhanh</Text>
              </Space>
            }
            key="quick-add"
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Title level={5}>Các bước thực hiện:</Title>
                <Table
                  columns={stepsColumns}
                  dataSource={quickAddStepsData}
                  pagination={false}
                  size="small"
                  bordered
                  style={{ marginTop: 12 }}
                />
              </div>
              <div style={{ marginTop: 16, padding: 12, background: '#fffbe6', borderRadius: 4 }}>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <Text strong>Lưu ý:</Text> Tính năng này phù hợp để thêm từng từ vựng một cách nhanh chóng. Nếu cần
                  thêm nhiều từ vựng cùng lúc, nên sử dụng tính năng Import Excel.
                </Text>
              </div>
            </Space>
          </Panel>
        </Collapse>
      </div>
    </Modal>
  )
}

// Component nút "?" để mở modal
export function VocabularyGuideButton({ onOpen }) {
  return (
    <Button
      type="text"
      icon={<QuestionCircleOutlined style={{ fontSize: 18, color: '#1890ff' }} />}
      onClick={onOpen}
      title="Hướng dẫn thêm từ vựng"
      style={{
        padding: '4px 8px',
        height: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  )
}

export default VocabularyGuideModal

