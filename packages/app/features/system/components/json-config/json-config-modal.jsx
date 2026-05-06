import React, { useEffect, useState } from 'react'
import { Modal, Form, Button, Typography, Space, Alert, Badge } from 'antd'
import { SaveOutlined, CodeOutlined, SettingOutlined } from '@ant-design/icons'
import { AIWordlePromptEditor } from './editors/ai-wordle-prompt-editor'
import { AIPronunciationPromptEditor } from './editors/ai-pronunciation-prompt-editor'
import { GenericJsonEditor } from './editors/generic-json-editor'

const { Text } = Typography

const EDITOR_REGISTRY = {
  'AI_WORDLE_PROMPT': {
    title: 'Cấu hình AI Prompt (Wordle)',
    component: AIWordlePromptEditor,
    isStructured: true
  },
  'AI_PRONUNCIATION_PROMPT': {
    title: 'Cấu hình AI Prompt (Phát âm)',
    component: AIPronunciationPromptEditor,
    isStructured: true
  }
}

const JsonConfigModal = ({ 
  open, 
  onCancel, 
  onFinish, 
  saving, 
  config 
}) => {
  const [form] = Form.useForm()
  const [error, setError] = useState(null)
  const [expertMode, setExpertMode] = useState(false)
  
  const editorConfig = config ? (EDITOR_REGISTRY[config.key] || {
    title: 'Chỉnh sửa Cấu hình JSON',
    component: GenericJsonEditor,
    isStructured: false
  }) : null

  useEffect(() => {
    if (open && config) {
      setError(null)
      setExpertMode(false) // Reset về chế độ thường khi mở
      try {
        const parsed = JSON.parse(config.value || '{}')
        // Load data vào form cho cả 2 chế độ để chuyển đổi mượt mà
        form.setFieldsValue({
          ...parsed,
          jsonValue: JSON.stringify(parsed, null, 2)
        })
      } catch (e) {
        console.error('Failed to parse JSON config', e)
        setError('Dữ liệu hiện tại không phải là JSON hợp lệ. Tự động chuyển sang Chế độ chuyên gia.')
        setExpertMode(true)
        form.setFieldsValue({ jsonValue: config.value })
      }
    } else {
      form.resetFields()
    }
  }, [open, config, form])

  const handleFinish = (values) => {
    let finalValue
    if (editorConfig?.isStructured && !expertMode) {
      const original = JSON.parse(config.value || '{}')
      const { jsonValue, ...structuredValues } = values
      // Thực hiện merge để tránh mất các field không có trong form
      finalValue = JSON.stringify({ ...original, ...structuredValues })
    } else {
      finalValue = values.jsonValue
    }
    
    onFinish({
      ...config,
      value: finalValue
    })
  }

  const EditorComponent = (!expertMode && editorConfig?.isStructured) ? editorConfig.component : GenericJsonEditor

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ 
            width: 44, 
            height: 44, 
            borderRadius: '12px', 
            background: '#f9f0ff', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            marginRight: 16,
            boxShadow: '0 2px 8px rgba(114, 46, 209, 0.15)'
          }}>
            <CodeOutlined style={{ color: '#722ed1', fontSize: 22 }} />
          </div>
          <div>
            <Text strong style={{ fontSize: 18 }}>{editorConfig?.title}</Text>
            <div style={{ fontSize: 13, color: '#8c8c8c', marginTop: 2 }}>
              Khóa: <Badge status="processing" text={config?.key} />
            </div>
          </div>
        </div>
      }
      open={open}
      onCancel={() => !saving && onCancel()}
      width={editorConfig?.isStructured ? 850 : 650}
      centered
      destroyOnClose
      styles={{ 
        body: { 
          height: 'calc(100vh - 300px)', 
          maxHeight: '650px',
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingRight: '12px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#d9d9d9 transparent'
        } 
      }}
      className="json-config-modal"
      footer={[
        <Button 
          key="expert" 
          onClick={() => setExpertMode(!expertMode)} 
          danger={expertMode}
          icon={<SettingOutlined />}
          style={{ float: 'left' }}
        >
          {expertMode ? 'Chế độ thường' : 'Chế độ chuyên gia'}
        </Button>,
        <Button key="cancel" onClick={onCancel} disabled={saving}>
          Hủy bỏ
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={() => form.submit()}
          style={{ background: '#722ed1', borderColor: '#722ed1' }}
        >
          Lưu cấu hình JSON
        </Button>
      ]}
    >
      <div style={{ marginTop: 20 }}>
        {error && <Alert message={error} type="warning" showIcon style={{ marginBottom: 16 }} />}
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          requiredMark={false}
        >
          <EditorComponent form={form} />
        </Form>
      </div>
    </Modal>
  )
}

export default JsonConfigModal
