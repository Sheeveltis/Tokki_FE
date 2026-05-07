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
  MessageOutlined
} from '@ant-design/icons'

const { Text, Title, Paragraph } = Typography

export const AIWriting51PromptEditor = ({ form }) => {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewContent, setPreviewContent] = useState('')

  const handlePreview = () => {
    const values = form.getFieldsValue()
    
    const prompt = `Bạn là ${values.Persona || '[Persona]'}. 

TỔNG QUAN CÂU 51:
${values.QuestionOverview || '[Tổng quan]'}

TIÊU CHÍ CHẤM ĐIỂM (TỐI ĐA 5 ĐIỂM CHO MỖI CHỖ TRỐNG):

1. Nội dung & Ngữ cảnh (${values.ContentContext?.MaxScore || 0}đ):
${values.ContentContext?.Description || '[Mô tả]'}

2. Từ vựng & Ngữ pháp (${values.VocabGrammar?.MaxScore || 0}đ):
${values.VocabGrammar?.Description || '[Mô tả]'}

3. Hình thức & Quy tắc (${values.FormRules?.MaxScore || 0}đ):
${values.FormRules?.Description || '[Mô tả]'}

QUY TẮC ĐUÔI CÂU TRANG TRỌNG:
${values.FormalEndingRules || '[Quy tắc đuôi câu]'}

QUY TẮC DẤU CÂU:
${values.PunctuationRules || '[Quy tắc dấu câu]'}

YÊU CẦU PHẢN HỒI (FEEDBACK):
${values.FeedbackRequirements || '[Yêu cầu feedback]'}

Nhiệm vụ của bạn là đánh giá đáp án của học sinh dựa trên đoạn văn và chỗ trống (㉠ và ㉡).

YÊU CẦU ĐẦU RA (JSON THUẦN TÚY):
{
    "Blank1": {
        "Score": <số>,
        "MaxScore": 5,
        "Criteria": {
            "ContentContext": { "Score": <số>, "Feedback": "..." },
            "VocabGrammar": { "Score": <số>, "Feedback": "..." },
            "FormRules": { "Score": <số>, "Feedback": "..." }
        },
        "TotalFeedback": "..."
    },
    "Blank2": { ... tương tự Blank1 ... }
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
                rules={[{ required: true, message: 'Vui lòng nhập vai trò của AI' }]}
              >
                <Input.TextArea 
                  placeholder="Ví dụ: Bạn là giáo viên chấm thi TOPIK II Writing câu 51..." 
                  autoSize={{ minRows: 2, maxRows: 4 }} 
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
                  placeholder="Mô tả về yêu cầu và cách tính điểm tổng quát của câu 51..." 
                  autoSize={{ minRows: 3, maxRows: 5 }} 
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
                  placeholder="Ví dụ: Feedback BẮT BUỘC viết bằng TIẾNG VIỆT, tối đa 4 câu ngắn gọn..." 
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
                key: 'content',
                label: 'Nội dung (Content)',
                children: (
                  <Card size="small" style={{ borderRadius: '8px' }}>
                    <Form.Item 
                      label="Điểm tối đa" 
                      name={['ContentContext', 'MaxScore']} 
                      rules={[
                        { required: true, message: 'Bắt buộc' },
                        { type: 'number', min: 0, message: 'Không được âm' }
                      ]}
                    >
                      <InputNumber min={0} max={5} style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item 
                      label="Mô tả tiêu chí" 
                      name={['ContentContext', 'Description']} 
                      rules={[{ required: true, message: 'Mô tả không được để trống' }]}
                    >
                      <Input.TextArea placeholder="Hướng dẫn chấm điểm nội dung..." autoSize={{ minRows: 6 }} style={{ borderRadius: '8px' }} />
                    </Form.Item>
                  </Card>
                )
              },
              {
                key: 'vocab',
                label: 'Từ vựng/Ngữ pháp',
                children: (
                  <Card size="small" style={{ borderRadius: '8px' }}>
                    <Form.Item 
                      label="Điểm tối đa" 
                      name={['VocabGrammar', 'MaxScore']} 
                      rules={[
                        { required: true, message: 'Bắt buộc' },
                        { type: 'number', min: 0, message: 'Không được âm' }
                      ]}
                    >
                      <InputNumber min={0} max={5} style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item 
                      label="Mô tả tiêu chí" 
                      name={['VocabGrammar', 'Description']} 
                      rules={[{ required: true, message: 'Mô tả không được để trống' }]}
                    >
                      <Input.TextArea placeholder="Hướng dẫn chấm điểm từ vựng/ngữ pháp..." autoSize={{ minRows: 6 }} style={{ borderRadius: '8px' }} />
                    </Form.Item>
                  </Card>
                )
              },
              {
                key: 'rules',
                label: 'Hình thức (Rules)',
                children: (
                  <Card size="small" style={{ borderRadius: '8px' }}>
                    <Form.Item 
                      label="Điểm tối đa" 
                      name={['FormRules', 'MaxScore']} 
                      rules={[
                        { required: true, message: 'Bắt buộc' },
                        { type: 'number', min: 0, message: 'Không được âm' }
                      ]}
                    >
                      <InputNumber min={0} max={5} style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item 
                      label="Mô tả tiêu chí" 
                      name={['FormRules', 'Description']} 
                      rules={[{ required: true, message: 'Mô tả không được để trống' }]}
                    >
                      <Input.TextArea placeholder="Hướng dẫn chấm điểm hình thức..." autoSize={{ minRows: 6 }} style={{ borderRadius: '8px' }} />
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
      label: <Space><ExclamationCircleOutlined /> Quy tắc bắt buộc</Space>,
      children: (
        <div style={{ padding: '20px 0' }}>
          <Form.Item
            label={<Text strong>Quy tắc đuôi câu trang trọng (Formal Ending Rules)</Text>}
            name="FormalEndingRules"
            rules={[{ required: true, message: 'Quy tắc đuôi câu không được để trống' }]}
          >
            <Input.TextArea 
              placeholder="Quy định về các đuôi câu được phép sử dụng..." 
              autoSize={{ minRows: 4, maxRows: 8 }} 
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            label={<Text strong>Quy tắc dấu câu (Punctuation Rules)</Text>}
            name="PunctuationRules"
            rules={[{ required: true, message: 'Quy tắc dấu câu không được để trống' }]}
          >
            <Input.TextArea 
              placeholder="Quy định về dấu câu ở cuối đáp án..." 
              autoSize={{ minRows: 3, maxRows: 5 }} 
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
            <InfoCircleOutlined /> Cấu hình Prompt TOPIK Writing Câu 51.
          </Paragraph>
          <Form.Item dependencies={[['ContentContext', 'MaxScore'], ['VocabGrammar', 'MaxScore'], ['FormRules', 'MaxScore']]} noStyle>
            {({ getFieldsValue }) => {
              const { ContentContext, VocabGrammar, FormRules } = getFieldsValue(['ContentContext', 'VocabGrammar', 'FormRules'])
              const total = (ContentContext?.MaxScore || 0) + (VocabGrammar?.MaxScore || 0) + (FormRules?.MaxScore || 0)
              const isValid = total === 5
              return (
                <Text type={isValid ? 'success' : 'danger'} strong style={{ fontSize: '12px' }}>
                  Tổng điểm tối đa mỗi ô: {total}/5 {isValid ? '✓' : '(Nên bằng 5)'}
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
        title="Xem trước Prompt Writing 51"
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
