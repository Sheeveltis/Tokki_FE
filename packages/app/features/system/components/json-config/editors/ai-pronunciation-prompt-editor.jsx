import React, { useState } from 'react'
import { 
  Form, 
  Input, 
  Card, 
  Space, 
  Typography, 
  Row, 
  Col, 
  Tooltip, 
  Button, 
  Modal,
  Alert,
  Tabs
} from 'antd'
import { 
  InfoCircleOutlined, 
  EyeOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  MessageOutlined,
  WarningOutlined,
  ToolOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'

const { Text, Title, Paragraph } = Typography

export const AIPronunciationPromptEditor = ({ form }) => {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewContent, setPreviewContent] = useState('')

  const handlePreview = () => {
    const values = form.getFieldsValue()
    
    const prompt = `Bạn là ${values.Persona || '[Persona]'}. Hãy phân tích dữ liệu phát âm:
- Câu mẫu: '{targetText}'
- Quy tắc trọng tâm: {ruleContext}
- Dữ liệu từ Azure:
[Dữ liệu phát âm chi tiết...]

Nhiệm vụ:
1. ĐÁNH GIÁ ĐỘ TÍN NHIỆM: ${values.ReliabilityCheck || '[Luật tin cậy]'}
2. ${values.GeneralFeedbackRules || '[Luật nhận xét chung]'}
3. ${values.RepairGuideRules || '[Hướng dẫn sửa lỗi]'}
4. ${values.PenaltyRules?.replace('{ruleContext}', '{ruleContext}') || '[Quy tắc phạt]'}

YÊU CẦU ĐẦU RA (JSON THUẦN TÚY):
{
    "penalty": <số điểm trừ>,
    "generalFeedback": "<nhận xét tổng thể>",
    "wordFeedbacks": [
        { "word": "<từ bị lỗi>", "repairGuide": "<cách sửa khẩu hình>" }
    ]
}`
    
    setPreviewContent(prompt)
    setPreviewOpen(true)
  }

  const items = [
    {
      key: '1',
      label: <Space><SettingOutlined /> Cấu hình chung</Space>,
      children: (
        <div style={{ padding: '20px 0' }}>
          <Form.Item
            label={<Text strong>Vai trò (Persona)</Text>}
            name="Persona"
            rules={[{ required: true, message: 'Vui lòng nhập vai trò' }]}
            tooltip="Phong cách AI sẽ trò chuyện. Ví dụ: Chuyên gia ngôn ngữ Hàn Quốc..."
          >
            <Input.TextArea 
              placeholder="Ví dụ: Chuyên gia ngôn ngữ Hàn Quốc tích hợp trong hệ thống Tokki..." 
              autoSize={{ minRows: 6, maxRows: 12 }}
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>
        </div>
      )
    },
    {
      key: '2',
      label: <Space><ThunderboltOutlined /> Quy tắc logic</Space>,
      children: (
        <div style={{ padding: '20px 0' }}>
          <Tabs
            tabPosition="left"
            items={[
              {
                key: 'reliability',
                label: 'Luật tin cậy',
                children: (
                  <Card size="small" title="Reliability Check" style={{ borderRadius: '8px' }}>
                    <Form.Item
                      name="ReliabilityCheck"
                      rules={[{ required: true, message: 'Bắt buộc' }]}
                      noStyle
                    >
                      <Input.TextArea 
                        placeholder="Quy tắc để AI quyết định dữ liệu có tin cậy không..." 
                        autoSize={{ minRows: 12 }}
                        style={{ borderRadius: '8px', border: 'none' }}
                      />
                    </Form.Item>
                  </Card>
                )
              },
              {
                key: 'general',
                label: 'Nhận xét chung',
                children: (
                  <Card size="small" title="General Feedback Rules" style={{ borderRadius: '8px' }}>
                    <Form.Item
                      name="GeneralFeedbackRules"
                      rules={[{ required: true, message: 'Bắt buộc' }]}
                      noStyle
                    >
                      <Input.TextArea 
                        placeholder="Quy tắc đưa ra nhận xét tổng thể..." 
                        autoSize={{ minRows: 12 }}
                        style={{ borderRadius: '8px', border: 'none' }}
                      />
                    </Form.Item>
                  </Card>
                )
              }
            ]}
          />
        </div>
      )
    },
    {
      key: '3',
      label: <Space><ToolOutlined /> Hướng dẫn & Phạt</Space>,
      children: (
        <div style={{ padding: '20px 0' }}>
          <Tabs
            tabPosition="left"
            items={[
              {
                key: 'repair',
                label: 'Sửa lỗi',
                children: (
                  <Card size="small" title="Repair Guide Rules" style={{ borderRadius: '8px' }}>
                    <Form.Item
                      name="RepairGuideRules"
                      rules={[{ required: true, message: 'Bắt buộc' }]}
                      noStyle
                    >
                      <Input.TextArea 
                        placeholder="Cách AI gợi ý sửa lỗi phát âm cho từng từ..." 
                        autoSize={{ minRows: 12 }}
                        style={{ borderRadius: '8px', border: 'none' }}
                      />
                    </Form.Item>
                  </Card>
                )
              },
              {
                key: 'penalty',
                label: 'Quy tắc phạt',
                children: (
                  <Card size="small" title="Penalty Rules" style={{ borderRadius: '8px' }}>
                    <Form.Item
                      name="PenaltyRules"
                      rules={[
                        { required: true, message: 'Bắt buộc' },
                        {
                          validator: (_, value) => {
                            if (value && !value.includes('{ruleContext}')) {
                              return Promise.reject(new Error('Thiếu biến {ruleContext}'))
                            }
                            return Promise.resolve()
                          }
                        }
                      ]}
                      noStyle
                    >
                      <Input.TextArea 
                        placeholder="Quy tắc trừ điểm nếu vi phạm {ruleContext}..." 
                        autoSize={{ minRows: 12 }}
                        style={{ borderRadius: '8px', border: 'none' }}
                      />
                    </Form.Item>
                  </Card>
                )
              }
            ]}
          />
        </div>
      )
    }
  ]

  return (
    <div style={{ padding: '0 4px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Paragraph type="secondary" style={{ margin: 0 }}>
          <InfoCircleOutlined /> Cấu hình Prompt Phát âm. Sử dụng biến <Text code>{'{ruleContext}'}</Text> cho quy tắc phạt.
        </Paragraph>
        <Button 
          icon={<EyeOutlined />} 
          onClick={handlePreview}
          type="primary"
          ghost
        >
          Xem trước Prompt
        </Button>
      </div>

      <Tabs 
        defaultActiveKey="1" 
        items={items} 
      />

      <Modal
        title="Xem trước Prompt Phát âm"
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        width={750}
        footer={[
          <Button key="close" type="primary" onClick={() => setPreviewOpen(false)}>Đóng</Button>
        ]}
      >
        <div style={{ 
          background: '#1e1e1e', 
          color: '#d4d4d4', 
          padding: '20px', 
          borderRadius: '8px', 
          maxHeight: '500px', 
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          fontSize: '13px',
          lineHeight: '1.6'
        }}>
          {previewContent}
        </div>
      </Modal>
    </div>
  )
}
