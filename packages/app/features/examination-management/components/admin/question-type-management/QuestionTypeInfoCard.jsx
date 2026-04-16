import { Card, Divider, Space, Typography, Descriptions, Tooltip } from 'antd'

const { Title, Text, Paragraph } = Typography

export function QuestionTypeInfoCard({ questionType }) {
  const skillEnumMap = {
    1: { label: 'Nghe' },
    2: { label: 'Đọc' },
    3: { label: 'Viết' },
  }

  const examTypeLabelMap = {
    1: 'TOPIK I',
    2: 'TOPIK II',
  }

  const difficultyLabelMap = {
    1: { label: 'Dễ', color: 'green' },
    2: { label: 'Trung bình', color: 'orange' },
    3: { label: 'Khó', color: 'red' },
    4: { label: 'Rất khó', color: 'volcano' },
  }

  const skillInfo = skillEnumMap[questionType?.skill] || { label: 'Không xác định' }
  const examType = questionType?.examType ? examTypeLabelMap[Number(questionType.examType)] : null
  const difficultyInfo = questionType?.difficulty
    ? difficultyLabelMap[Number(questionType.difficulty)]
    : null

  return (
    <Card style={{ marginBottom: 24, borderRadius: 8 }}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div>
          <Title level={3} style={{ marginBottom: 12, marginTop: 0 }}>
            {questionType?.name || 'Không có tên'}
          </Title>
          {questionType?.description && (
            <Paragraph
              style={{
                marginBottom: 0,
                color: '#666',
                fontSize: 15,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}
            >
              {questionType.description}
            </Paragraph>
          )}
        </div>

        <Divider style={{ margin: '16px 0' }} />

        <Descriptions
          column={2}
          bordered
          size="small"
          style={{
            width: '100%',
            tableLayout: 'fixed',
            wordBreak: 'break-word',
          }}
        >
          <Descriptions.Item label="Code">
            <Text style={{ fontSize: 14 }}>
              {questionType?.code || '-'}
            </Text>
          </Descriptions.Item>

          <Descriptions.Item label="Kỹ năng">
            <Text style={{ fontSize: 14 }}>
              {skillInfo.label}
            </Text>
          </Descriptions.Item>

          <Descriptions.Item label="TOPIK Level">
            {examType ? (
              <Text style={{ fontSize: 14 }}>
                {examType}
              </Text>
            ) : (
              <Text type="secondary" style={{ fontSize: 14 }}>
                -
              </Text>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Mức độ">
            {difficultyInfo ? (
              <Text style={{ fontSize: 14 }}>
                {difficultyInfo.label}
              </Text>
            ) : (
              <Text type="secondary" style={{ fontSize: 14 }}>
                -
              </Text>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Trạng thái" span={2}>
            <Space size="small" align="center">
              <Tooltip title={questionType?.isActive ? 'Hoạt động' : 'Không hoạt động'}>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    backgroundColor: questionType?.isActive ? '#52c41a' : '#8c8c8c',
                    boxShadow: '0 0 4px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                  }}
                />
              </Tooltip>
              {questionType?.isActive ? 'Hoạt động' : 'Không hoạt động'}
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Space>
    </Card>
  )
}

export default QuestionTypeInfoCard

