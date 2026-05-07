import React, { useState } from 'react'
import { 
  Form, 
  Input, 
  InputNumber, 
  Card, 
  Space, 
  Divider, 
  Button, 
  Typography, 
  Row, 
  Col, 
  Tooltip, 
  Tabs,
  Modal
} from 'antd'
import { 
  PlusOutlined, 
  DeleteOutlined, 
  InfoCircleOutlined, 
  EyeOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  MessageOutlined,
  LayoutOutlined
} from '@ant-design/icons'

const { Text, Title, Paragraph } = Typography

export const AIWriting53PromptEditor = ({ form }) => {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewContent, setPreviewContent] = useState('')

  const handlePreview = () => {
    const values = form.getFieldsValue()
    
    const prompt = `Bạn là ${values.Persona || '[Persona]'}. 

TỔNG QUAN CÂU 53 (200-300 CHỮ):
${values.QuestionOverview || '[Tổng quan]'}

TIÊU CHÍ CHẤM ĐIỂM (TỔNG 30 ĐIỂM):

1. Hoàn thành nhiệm vụ (Task Completion) (${values.TaskCompletion?.MaxScore || 0}đ):
${values.TaskCompletion?.Description || '[Mô tả]'}

2. Bố cục & Tính liên kết (Organization) (${values.Organization?.MaxScore || 0}đ):
${values.Organization?.Description || '[Mô tả]'}

3. Sử dụng ngôn ngữ (Language Usage) (${values.LanguageUsage?.MaxScore || 0}đ):
${values.LanguageUsage?.Description || '[Mô tả]'}

QUY TẮC VĂN PHONG VĂN VIẾT:
${values.WritingStyleRules || '[Quy tắc văn phong]'}

QUY TẮC KHÔNG XUỐNG DÒNG (NO NEWLINE):
${values.NoNewlineRule || '[Quy tắc xuống dòng]'}

CẤU TRÚC TRIỂN KHAI (LAYOUT):
${values.LayoutStructure || '[Cấu trúc layout]'}

YÊU CẦU PHẢN HỒI (FEEDBACK):
${values.FeedbackRequirements || '[Yêu cầu feedback]'}

Nhiệm vụ: Đánh giá bài mô tả biểu đồ của học sinh. BẮT BUỘC cung cấp:
1. Score (theo từng tiêu chí)
2. Detailed Feedback (tiếng Việt)
3. Polished Version (không được có dấu xuống dòng \\n)

YÊU CẦU ĐẦU RA (JSON THUẦN TÚY):
{
    "TotalScore": <số>,
    "Criteria": {
        "TaskCompletion": { "Score": <số>, "MaxScore": ${values.TaskCompletion?.MaxScore || 0}, "Feedback": "..." },
        "Organization": { "Score": <số>, "MaxScore": ${values.Organization?.MaxScore || 0}, "Feedback": "..." },
        "LanguageUsage": { "Score": <số>, "MaxScore": ${values.LanguageUsage?.MaxScore || 0}, "Feedback": "..." }
    },
    "PolishedVersion": "...",
    "GeneralFeedback": "..."
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
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label={<Text strong>Vai trò (Persona)</Text>}
                name="Persona"
                rules={[{ required: true, message: 'Vai trò không được để trống' }]}
              >
                <Input.TextArea 
                  placeholder="Ví dụ: Bạn là giáo viên chấm thi TOPIK II Writing câu 53..." 
                  autoSize={{ minRows: 3, maxRows: 5 }} 
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={<Text strong>Tổng quan câu hỏi (Question Overview)</Text>}
                name="QuestionOverview"
                rules={[{ required: true, message: 'Tổng quan không được để trống' }]}
              >
                <Input.TextArea 
                  placeholder="Mô tả về yêu cầu mô tả biểu đồ, độ dài, văn phong..." 
                  autoSize={{ minRows: 4, maxRows: 8 }} 
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={<Text strong>Yêu cầu phản hồi (Feedback Requirements)</Text>}
                name="FeedbackRequirements"
                rules={[{ required: true, message: 'Yêu cầu feedback không được để trống' }]}
              >
                <Input.TextArea 
                  placeholder="Ví dụ: Feedback BẮT BUỘC viết bằng TIẾNG VIỆT, chia rõ 3 phần..." 
                  autoSize={{ minRows: 3, maxRows: 6 }} 
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: '2',
      label: <Space><CheckCircleOutlined /> Tiêu chí chấm điểm</Space>,
      children: (
        <div style={{ padding: '20px 0' }}>
          <Tabs
            tabPosition="left"
            items={[
              {
                key: 'task',
                label: 'Hoàn thành nhiệm vụ',
                children: (
                  <Card size="small" style={{ borderRadius: '8px' }}>
                    <Form.Item 
                      label="Điểm tối đa" 
                      name={['TaskCompletion', 'MaxScore']} 
                      rules={[
                        { required: true, message: 'Bắt buộc' },
                        { type: 'number', min: 0, message: 'Không được âm' }
                      ]}
                    >
                      <InputNumber min={0} max={30} style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item 
                      label="Mô tả tiêu chí" 
                      name={['TaskCompletion', 'Description']} 
                      rules={[{ required: true, message: 'Mô tả không được để trống' }]}
                    >
                      <Input.TextArea placeholder="Hướng dẫn chấm điểm hoàn thành nhiệm vụ..." autoSize={{ minRows: 8 }} style={{ borderRadius: '8px' }} />
                    </Form.Item>
                  </Card>
                )
              },
              {
                key: 'org',
                label: 'Bố cục & Liên kết',
                children: (
                  <Card size="small" style={{ borderRadius: '8px' }}>
                    <Form.Item 
                      label="Điểm tối đa" 
                      name={['Organization', 'MaxScore']} 
                      rules={[
                        { required: true, message: 'Bắt buộc' },
                        { type: 'number', min: 0, message: 'Không được âm' }
                      ]}
                    >
                      <InputNumber min={0} max={30} style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item 
                      label="Mô tả tiêu chí" 
                      name={['Organization', 'Description']} 
                      rules={[{ required: true, message: 'Mô tả không được để trống' }]}
                    >
                      <Input.TextArea placeholder="Hướng dẫn chấm điểm bố cục..." autoSize={{ minRows: 8 }} style={{ borderRadius: '8px' }} />
                    </Form.Item>
                  </Card>
                )
              },
              {
                key: 'lang',
                label: 'Sử dụng ngôn ngữ',
                children: (
                  <Card size="small" style={{ borderRadius: '8px' }}>
                    <Form.Item 
                      label="Điểm tối đa" 
                      name={['LanguageUsage', 'MaxScore']} 
                      rules={[
                        { required: true, message: 'Bắt buộc' },
                        { type: 'number', min: 0, message: 'Không được âm' }
                      ]}
                    >
                      <InputNumber min={0} max={30} style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item 
                      label="Mô tả tiêu chí" 
                      name={['LanguageUsage', 'Description']} 
                      rules={[{ required: true, message: 'Mô tả không được để trống' }]}
                    >
                      <Input.TextArea placeholder="Hướng dẫn chấm điểm ngôn ngữ..." autoSize={{ minRows: 8 }} style={{ borderRadius: '8px' }} />
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
      label: <Space><LayoutOutlined /> Quy tắc & Cấu trúc</Space>,
      children: (
        <div style={{ padding: '20px 0' }}>
          <Form.Item
            label={<Text strong>Quy tắc văn phong văn viết (Writing Style Rules)</Text>}
            name="WritingStyleRules"
            rules={[{ required: true, message: 'Quy tắc văn phong không được để trống' }]}
          >
            <Input.TextArea 
              placeholder="Quy định về đuôi câu văn viết (-다, -ㄴ/는다)..." 
              autoSize={{ minRows: 3, maxRows: 5 }} 
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            label={<Text strong>Quy tắc không xuống dòng (No Newline Rule)</Text>}
            name="NoNewlineRule"
            rules={[{ required: true, message: 'Quy tắc xuống dòng không được để trống' }]}
          >
            <Input.TextArea 
              placeholder="Quy định về việc không xuống dòng trong bài viết..." 
              autoSize={{ minRows: 3, maxRows: 5 }} 
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            label={<Text strong>Cấu trúc triển khai bài mẫu (Layout Structure)</Text>}
            name="LayoutStructure"
            rules={[{ required: true, message: 'Cấu trúc layout không được để trống' }]}
          >
            <Input.TextArea 
              placeholder="Gợi ý cấu trúc Mở - Thân - Kết cho từng phần..." 
              autoSize={{ minRows: 5, maxRows: 10 }} 
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>
        </div>
      )
    }
  ]

  return (
    <div style={{ padding: '0 4px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space direction="vertical" size={0}>
          <Paragraph type="secondary" style={{ margin: 0 }}>
            <InfoCircleOutlined /> Cấu hình Prompt TOPIK Writing Câu 53 (Biểu đồ).
          </Paragraph>
          <Form.Item dependencies={[['TaskCompletion', 'MaxScore'], ['Organization', 'MaxScore'], ['LanguageUsage', 'MaxScore']]} noStyle>
            {({ getFieldsValue }) => {
              const { TaskCompletion, Organization, LanguageUsage } = getFieldsValue(['TaskCompletion', 'Organization', 'LanguageUsage'])
              const total = (TaskCompletion?.MaxScore || 0) + (Organization?.MaxScore || 0) + (LanguageUsage?.MaxScore || 0)
              const isValid = total === 30
              return (
                <Text type={isValid ? 'success' : 'danger'} strong style={{ fontSize: '12px' }}>
                  Tổng điểm tối đa: {total}/30 {isValid ? '✓' : '(Nên bằng 30)'}
                </Text>
              )
            }}
          </Form.Item>
        </Space>
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
        title="Xem trước Prompt Writing 53"
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
