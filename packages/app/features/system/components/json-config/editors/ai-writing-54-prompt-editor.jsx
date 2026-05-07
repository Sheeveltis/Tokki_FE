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
  LayoutOutlined,
  BookOutlined,
  WarningOutlined
} from '@ant-design/icons'

const { Text, Title, Paragraph } = Typography

export const AIWriting54PromptEditor = ({ form }) => {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewContent, setPreviewContent] = useState('')

  const handlePreview = () => {
    const values = form.getFieldsValue()
    
    const prompt = `Bạn là ${values.Persona || '[Persona]'}. 

TỔNG QUAN CÂU 54 (600-700 CHỮ):
${values.QuestionOverview || '[Tổng quan]'}

HƯỚNG DẪN CHẤM TỪNG BƯỚC:
${values.StepByStepGuide || '[Hướng dẫn]'}

PHÂN LOẠI DẠNG ĐỀ:
${values.QuestionTypes || '[Phân loại]'}

TIÊU CHÍ CHẤM ĐIỂM (TỔNG 50 ĐIỂM):

1. Nội dung & Hoàn thành nhiệm vụ (${values.ContentCompletion?.MaxScore || 0}đ):
${values.ContentCompletion?.Description || '[Mô tả]'}

2. Bố cục & Tính liên kết (${values.Organization?.MaxScore || 0}đ):
${values.Organization?.Description || '[Mô tả]'}

3. Sử dụng ngôn ngữ (${values.LanguageUsage?.MaxScore || 0}đ):
${values.LanguageUsage?.Description || '[Mô tả]'}

QUY TẮC TRỪ ĐIỂM ĐỘ DÀI:
${values.LengthPenaltyRules || '[Quy tắc độ dài]'}

QUY TẮC VĂN PHONG VĂN VIẾT:
${values.WritingStyleRules || '[Quy tắc văn phong]'}

CẤU TRÚC TRIỂN KHAI (LAYOUT):
${values.LayoutStructure || '[Cấu trúc layout]'}

CÁC LỖI THƯỜNG GẶP:
${values.CommonErrors || '[Các lỗi thường gặp]'}

YÊU CẦU PHẢN HỒI (FEEDBACK):
${values.FeedbackRequirements || '[Yêu cầu feedback]'}

Nhiệm vụ: Đánh giá bài luận của học sinh. BẮT BUỘC cung cấp:
1. Score (theo từng tiêu chí)
2. Detailed Feedback (tiếng Việt, xưng "bạn")
3. Suggestions & Polished Version

YÊU CẦU ĐẦU RA (JSON THUẦN TÚY):
{
    "TotalScore": <số>,
    "Criteria": {
        "ContentCompletion": { "Score": <số>, "MaxScore": ${values.ContentCompletion?.MaxScore || 0}, "Feedback": "..." },
        "Organization": { "Score": <số>, "MaxScore": ${values.Organization?.MaxScore || 0}, "Feedback": "..." },
        "LanguageUsage": { "Score": <số>, "MaxScore": ${values.LanguageUsage?.MaxScore || 0}, "Feedback": "..." }
    },
    "LengthPenalty": <số điểm trừ>,
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
                  placeholder="Ví dụ: Bạn là giáo viên chấm thi TOPIK II Writing câu 54..." 
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
                  placeholder="Mô tả về bài luận, độ dài, văn phong, tổng điểm..." 
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
                  placeholder="Ví dụ: Feedback TIẾNG VIỆT, xưng 'bạn'. Gồm: Nhận diện đề, Đánh giá từng task..." 
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
      label: <Space><CheckCircleOutlined /> Tiêu chí & Điểm số</Space>,
      children: (
        <div style={{ padding: '20px 0' }}>
          <Tabs
            tabPosition="left"
            items={[
              {
                key: 'content',
                label: 'Nội dung & Nhiệm vụ',
                children: (
                  <Card size="small" style={{ borderRadius: '8px' }}>
                    <Form.Item 
                      label="Điểm tối đa" 
                      name={['ContentCompletion', 'MaxScore']} 
                      rules={[
                        { required: true, message: 'Bắt buộc' },
                        { type: 'number', min: 0, message: 'Không được âm' }
                      ]}
                    >
                      <InputNumber min={0} max={50} style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item 
                      label="Mô tả tiêu chí" 
                      name={['ContentCompletion', 'Description']} 
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
                      <InputNumber min={0} max={50} style={{ width: 120 }} />
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
                      <InputNumber min={0} max={50} style={{ width: 120 }} />
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
              },
              {
                key: 'length',
                label: 'Quy tắc độ dài',
                children: (
                  <Card size="small" style={{ borderRadius: '8px' }}>
                    <Form.Item 
                      label="Quy tắc trừ điểm độ dài" 
                      name="LengthPenaltyRules" 
                      rules={[{ required: true, message: 'Quy tắc độ dài không được để trống' }]}
                    >
                      <Input.TextArea placeholder="Ví dụ: 600-700 ký tự: 0đ. 550-599: trừ 3-5đ..." autoSize={{ minRows: 10 }} style={{ borderRadius: '8px' }} />
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
      label: <Space><BookOutlined /> Hướng dẫn & Quy tắc</Space>,
      children: (
        <div style={{ padding: '20px 0' }}>
          <Form.Item
            label={<Text strong>Hướng dẫn chấm từng bước (Step-by-Step Guide)</Text>}
            name="StepByStepGuide"
            rules={[{ required: true, message: 'Hướng dẫn chấm không được để trống' }]}
          >
            <Input.TextArea 
              placeholder="Quy trình AI cần thực hiện trước khi chấm..." 
              autoSize={{ minRows: 4, maxRows: 8 }} 
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            label={<Text strong>Phân loại dạng đề (Question Types)</Text>}
            name="QuestionTypes"
            rules={[{ required: true, message: 'Phân loại dạng đề không được để trống' }]}
          >
            <Input.TextArea 
              placeholder="Ví dụ: [A] Problem-Solving, [B] Argumentative..." 
              autoSize={{ minRows: 3, maxRows: 6 }} 
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            label={<Text strong>Quy tắc văn phong văn viết (Writing Style Rules)</Text>}
            name="WritingStyleRules"
            rules={[{ required: true, message: 'Quy tắc văn phong không được để trống' }]}
          >
            <Input.TextArea 
              placeholder="Quy định về đuôi câu văn viết, các từ nối học thuật..." 
              autoSize={{ minRows: 3, maxRows: 5 }} 
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            label={<Text strong>Cấu trúc triển khai (Layout Structure)</Text>}
            name="LayoutStructure"
            rules={[{ required: true, message: 'Cấu trúc layout không được để trống' }]}
          >
            <Input.TextArea 
              placeholder="Gợi ý Mở - Thân - Kết cho bài luận..." 
              autoSize={{ minRows: 4, maxRows: 8 }} 
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            label={<Text strong>Các lỗi thường gặp (Common Errors)</Text>}
            name="CommonErrors"
            rules={[{ required: true, message: 'Các lỗi thường gặp không được để trống' }]}
          >
            <Input.TextArea 
              placeholder="Liệt kê các lỗi phổ biến học sinh hay mắc phải..." 
              autoSize={{ minRows: 3, maxRows: 6 }} 
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
            <InfoCircleOutlined /> Cấu hình Prompt TOPIK Writing Câu 54 (Bài luận).
          </Paragraph>
          <Form.Item dependencies={[['ContentCompletion', 'MaxScore'], ['Organization', 'MaxScore'], ['LanguageUsage', 'MaxScore']]} noStyle>
            {({ getFieldsValue }) => {
              const { ContentCompletion, Organization, LanguageUsage } = getFieldsValue(['ContentCompletion', 'Organization', 'LanguageUsage'])
              const total = (ContentCompletion?.MaxScore || 0) + (Organization?.MaxScore || 0) + (LanguageUsage?.MaxScore || 0)
              const isValid = total === 50
              return (
                <Text type={isValid ? 'success' : 'danger'} strong style={{ fontSize: '12px' }}>
                  Tổng điểm tối đa: {total}/50 {isValid ? '✓' : '(Nên bằng 50)'}
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
        title="Xem trước Prompt Writing 54"
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
