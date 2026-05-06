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
  BulbOutlined
} from '@ant-design/icons'

const { Text, Title, Paragraph } = Typography

export const AIWordlePromptEditor = ({ form }) => {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewContent, setPreviewContent] = useState('')

  const handlePreview = () => {
    const values = form.getFieldsValue()
    
    const examplesPart = values.Examples?.map(ex => 
      `- Từ khóa '${ex.Word || '...'}' (${ex.Definition || '...'}). Câu '${ex.Sentence || '...'}' -> Tổng: ${ex.ScoreRange || '...'} (${ex.Feedback || '...'})`
    ).join('\n') || '- (Chưa có ví dụ)'

    const prompt = `Bạn là ${values.Persona || '[Persona]'}. 
Nhiệm vụ: Chấm điểm câu đặt của sinh viên dựa trên từ khóa cho trước.

THÔNG TIN:
- Từ khóa mục tiêu: '{word}'
- Nghĩa chuẩn: {definition}
- Câu của sinh viên: '{sentence}'

QUY TẮC CHẤM ĐIỂM (TỔNG 100 ĐIỂM):

1. Meaning (${values.Meaning?.MaxScore || 0}đ): 
${values.Meaning?.Description || '[Mô tả]'}

2. Grammar & Complexity (${values.Grammar?.MaxScore || 0}đ): 
${values.Grammar?.Description || '[Mô tả]'}

3. Naturalness & Depth (${values.Naturalness?.MaxScore || 0}đ): 
${values.Naturalness?.Description || '[Mô tả]'}

VÍ DỤ THAM CHIẾU:
${examplesPart}

LƯU Ý: Nếu câu vi phạm tiêu chí độ dài hoặc ngữ pháp sơ cấp, tuyệt đối không cho tổng điểm quá ${values.MaxScoreForSimpleSentence || 0}.

YÊU CẦU ĐẦU RA (JSON THUẦN TÚY):
{
    "ContainsTargetWord": true/false,
    "TotalScore": <Tổng điểm thực tế>,
    "Meaning": { "Score": <số>, "MaxScore": ${values.Meaning?.MaxScore || 0}, "Feedback": "..." },
    ...
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
                tooltip="Phong cách AI sẽ trò chuyện với người dùng. Ví dụ: Giám khảo TOPIK khắt khe, Người bạn thân thiết..."
              >
                <Input.TextArea 
                  placeholder="Ví dụ: Một giám khảo chấm thi TOPIK nổi tiếng khắt khe và tỉ mỉ..." 
                  autoSize={{ minRows: 4, maxRows: 8 }} 
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={<Text strong>Giới hạn điểm câu đơn giản</Text>}
                name="MaxScoreForSimpleSentence"
                rules={[{ required: true, message: 'Nhập điểm' }]}
                tooltip="Điểm tối đa cho câu quá ngắn, quá đơn giản hoặc vi phạm cấu hình tối thiểu."
              >
                <InputNumber 
                  min={0} 
                  max={100} 
                  style={{ width: '100%', borderRadius: '8px' }} 
                  size="large"
                  placeholder="Ví dụ: 60"
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
                key: 'meaning',
                label: 'Ý nghĩa (Meaning)',
                children: (
                  <Card size="small" style={{ borderRadius: '8px' }}>
                    <Form.Item 
                      label="Điểm tối đa" 
                      name={['Meaning', 'MaxScore']} 
                      rules={[
                        { required: true, message: 'Bắt buộc' },
                        { type: 'number', min: 1, message: 'Phải > 0' },
                        ({ getFieldsValue }) => ({
                          validator() {
                            const { Meaning, Grammar, Naturalness } = getFieldsValue(['Meaning', 'Grammar', 'Naturalness'])
                            const total = (Meaning?.MaxScore || 0) + (Grammar?.MaxScore || 0) + (Naturalness?.MaxScore || 0)
                            if (total === 100) return Promise.resolve()
                            return Promise.reject(new Error('Tổng phải = 100'))
                          }
                        })
                      ]}
                      validateTrigger={['onChange', 'onBlur']}
                    >
                      <InputNumber min={1} max={100} style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item 
                      label="Mô tả tiêu chí" 
                      name={['Meaning', 'Description']} 
                      rules={[{ required: true }]}
                      tooltip="Hướng dẫn AI cách đánh giá phần này. Có thể ghi các mức điểm cụ thể."
                    >
                      <Input.TextArea placeholder="Nhập hướng dẫn chấm điểm..." autoSize={{ minRows: 10 }} style={{ borderRadius: '8px' }} />
                    </Form.Item>
                  </Card>
                )
              },
              {
                key: 'grammar',
                label: 'Ngữ pháp (Grammar)',
                children: (
                  <Card size="small" style={{ borderRadius: '8px' }}>
                    <Form.Item 
                      label="Điểm tối đa" 
                      name={['Grammar', 'MaxScore']} 
                      rules={[
                        { required: true, message: 'Bắt buộc' },
                        { type: 'number', min: 1, message: 'Phải > 0' },
                        ({ getFieldsValue }) => ({
                          validator() {
                            const { Meaning, Grammar, Naturalness } = getFieldsValue(['Meaning', 'Grammar', 'Naturalness'])
                            const total = (Meaning?.MaxScore || 0) + (Grammar?.MaxScore || 0) + (Naturalness?.MaxScore || 0)
                            if (total === 100) return Promise.resolve()
                            return Promise.reject(new Error('Tổng phải = 100'))
                          }
                        })
                      ]}
                      validateTrigger={['onChange', 'onBlur']}
                    >
                      <InputNumber min={1} max={100} style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item label="Mô tả tiêu chí" name={['Grammar', 'Description']} rules={[{ required: true }]}>
                      <Input.TextArea placeholder="Nhập hướng dẫn chấm điểm..." autoSize={{ minRows: 10 }} style={{ borderRadius: '8px' }} />
                    </Form.Item>
                  </Card>
                )
              },
              {
                key: 'naturalness',
                label: 'Độ tự nhiên (Naturalness)',
                children: (
                  <Card size="small" style={{ borderRadius: '8px' }}>
                    <Form.Item 
                      label="Điểm tối đa" 
                      name={['Naturalness', 'MaxScore']} 
                      rules={[
                        { required: true, message: 'Bắt buộc' },
                        { type: 'number', min: 1, message: 'Phải > 0' },
                        ({ getFieldsValue }) => ({
                          validator() {
                            const { Meaning, Grammar, Naturalness } = getFieldsValue(['Meaning', 'Grammar', 'Naturalness'])
                            const total = (Meaning?.MaxScore || 0) + (Grammar?.MaxScore || 0) + (Naturalness?.MaxScore || 0)
                            if (total === 100) return Promise.resolve()
                            return Promise.reject(new Error('Tổng phải = 100'))
                          }
                        })
                      ]}
                      validateTrigger={['onChange', 'onBlur']}
                    >
                      <InputNumber min={1} max={100} style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item label="Mô tả tiêu chí" name={['Naturalness', 'Description']} rules={[{ required: true }]}>
                      <Input.TextArea placeholder="Nhập hướng dẫn chấm điểm..." autoSize={{ minRows: 10 }} style={{ borderRadius: '8px' }} />
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
      label: <Space><BulbOutlined /> Ví dụ mẫu (Few-shot)</Space>,
      children: (
        <div style={{ padding: '20px 0' }}>
          <Form.List name="Examples">
            {(fields, { add, remove }) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 20 }}>
                {fields.map(({ key, name, ...restField }) => (
                  <Card 
                    key={key} 
                    size="small" 
                    title={<Text type="secondary">Ví dụ #{name + 1}</Text>}
                    extra={<Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />}
                    style={{ background: '#fcfcfc', border: '1px dashed #d9d9d9', borderRadius: '8px' }}
                  >
                    <Row gutter={12}>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'Word']}
                          label="Từ khóa"
                          rules={[{ required: true, message: 'Nhập từ' }]}
                        >
                          <Input placeholder="Ví dụ: 사과" />
                        </Form.Item>
                      </Col>
                      <Col span={16}>
                        <Form.Item
                          {...restField}
                          name={[name, 'Definition']}
                          label="Định nghĩa"
                          rules={[{ required: true, message: 'Nhập nghĩa' }]}
                        >
                          <Input placeholder="Ví dụ: Quả táo" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          {...restField}
                          name={[name, 'Sentence']}
                          label="Câu mẫu"
                          rules={[{ required: true, message: 'Nhập câu' }]}
                        >
                          <Input placeholder="Ví dụ: 저는 사과를 먹어요" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'ScoreRange']}
                          label="Khoảng điểm"
                          rules={[{ required: true, message: 'Nhập khoảng điểm' }]}
                        >
                          <Input placeholder="Ví dụ: 45-50đ" />
                        </Form.Item>
                      </Col>
                      <Col span={16}>
                        <Form.Item
                          {...restField}
                          name={[name, 'Feedback']}
                          label="Nhận xét"
                          rules={[{ required: true, message: 'Nhập phản hồi' }]}
                        >
                          <Input placeholder="Ví dụ: Câu quá đơn giản" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button 
                  type="dashed" 
                  onClick={() => add()} 
                  block 
                  icon={<PlusOutlined />}
                  style={{ height: 45, borderRadius: '8px' }}
                >
                  Thêm ví dụ mẫu mới
                </Button>
              </div>
            )}
          </Form.List>
        </div>
      )
    }
  ]

  return (
    <div style={{ padding: '0 4px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space direction="vertical" size={0}>
          <Paragraph type="secondary" style={{ margin: 0 }}>
            <InfoCircleOutlined /> Cấu hình Prompt chi tiết. Vui lòng kiểm tra kỹ trước khi lưu.
          </Paragraph>
          <Form.Item dependencies={[['Meaning', 'MaxScore'], ['Grammar', 'MaxScore'], ['Naturalness', 'MaxScore']]} noStyle>
            {({ getFieldsValue }) => {
              const { Meaning, Grammar, Naturalness } = getFieldsValue(['Meaning', 'Grammar', 'Naturalness'])
              const total = (Meaning?.MaxScore || 0) + (Grammar?.MaxScore || 0) + (Naturalness?.MaxScore || 0)
              const isValid = total === 100
              return (
                <Text type={isValid ? 'success' : 'danger'} strong style={{ fontSize: '12px' }}>
                  Tổng điểm tối đa hiện tại: {total}/100 {isValid ? '✓' : '(Phải bằng 100)'}
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
        title="Xem trước Prompt đầy đủ"
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
