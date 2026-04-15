import React from 'react';
import { Card, Space, Tag, Avatar, Row, Col, Typography, Button, Tooltip, Image } from 'antd';
import { 
  CheckCircleOutlined, 
  EditOutlined, 
  UndoOutlined, 
  EyeOutlined, 
  SaveOutlined 
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;

export const QuestionCard = ({ 
  question, 
  isHighlighted, 
  isPending, 
  isLockedExam, 
  isSaving,
  hasOldQuestion,
  onEdit, 
  onUndo, 
  onViewOld, 
  onSave 
}) => {
  return (
    <Card 
      id={`q-${question.templatePartId}-${question.qIndex}`}
      size="small" 
      styles={{ body: { padding: 24 } }}
      style={{
        marginBottom: 16,
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: isPending ? '#faad14' : isHighlighted ? '#52c41a' : '#f0f0f0',
        backgroundColor: isPending ? '#fffbe6' : isHighlighted ? '#f6ffed' : '#ffffff',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <Space orientation="vertical" size={12}>
          <Space>
            <Avatar 
              size="small" 
              style={{
                backgroundColor: isPending ? '#faad14' : isHighlighted ? '#52c41a' : '#1890ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
              }}
            >
              {question.questionNo}
            </Avatar>
            <Tag color={isPending ? "warning" : isHighlighted ? "success" : "blue"} variant="filled" style={{ margin: 0 }}>
              CÂU HỎI {question.questionNo}
            </Tag>
          </Space>
          {isPending && <Tag color="warning" style={{ borderColor: '#ffe58f', backgroundColor: '#fffbe6', margin: 0 }}>Có thay đổi chưa lưu</Tag>}
        </Space>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {question.mediaUrl && (
            <div style={{ marginRight: 16 }}>
              {question.mediaType === 'Image' ? (
                <Image src={question.mediaUrl} alt="Question" height={64} style={{ borderRadius: 4, border: '1px solid #f0f0f0', objectFit: 'contain', maxWidth: 150 }} />
              ) : (
                <audio controls style={{ height: 36, maxWidth: 220 }}>
                  <source src={question.mediaUrl} type="audio/mpeg" />
                </audio>
              )}
            </div>
          )}
          
          <Space>
            <Tooltip title="Chỉnh sửa câu hỏi">
              <Button 
                size="middle"
                icon={<EditOutlined />} 
                onClick={onEdit}
                disabled={isLockedExam}
              />
            </Tooltip>
            <Tooltip title="Xem chi tiết gốc">
              <Button 
                size="middle"
                icon={<EyeOutlined />} 
                onClick={onViewOld}
              />
            </Tooltip>
            {hasOldQuestion && (
              <Tooltip title="Hoàn tác">
                <Button 
                  size="middle"
                  icon={<UndoOutlined />} 
                  onClick={onUndo}
                  disabled={isLockedExam}
                  style={{ color: '#faad14', borderColor: '#faad14' }}
                />
              </Tooltip>
            )}
            {isPending && (
              <Tooltip title="Lưu ngay">
                <Button 
                  size="middle"
                  type="primary"
                  icon={<SaveOutlined />} 
                  loading={isSaving}
                  onClick={onSave}
                />
              </Tooltip>
            )}
          </Space>
        </div>
      </div>

      {(question.content || question.explanation) && (
        <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {question.content && (
            <div style={{ backgroundColor: '#fafafa', padding: 16, borderRadius: 8, border: '1px dashed #f0f0f0', fontStyle: 'italic' }}>
               <Text style={{ fontSize: 16, color: '#434343', lineHeight: 1.6, display: 'block' }}>{question.content}</Text>
            </div>
          )}

          {question.explanation && (
            <div style={{ backgroundColor: '#fffbe6', padding: 16, border: '1px solid #ffe58f', borderRadius: 8 }}>
              <div 
                style={{ color: '#262626', lineHeight: 1.6, fontSize: 16 }}
                dangerouslySetInnerHTML={{ __html: question.explanation }} 
              />
            </div>
          )}
        </div>
      )}

      <Row gutter={[16, 16]}>
        {question.options?.map((opt, i) => (
          <Col xs={24} md={12} key={i}>
            <div style={{
              padding: 16,
              borderRadius: 8,
              border: `1px solid ${opt.isCorrect ? '#b7eb8f' : '#f0f0f0'}`,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              backgroundColor: opt.isCorrect ? '#f6ffed' : '#ffffff',
              color: opt.isCorrect ? '#389e0d' : '#262626',
              fontWeight: opt.isCorrect ? 'bold' : 'normal'
            }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 13,
                backgroundColor: opt.isCorrect ? '#52c41a' : '#f5f5f5',
                color: opt.isCorrect ? '#ffffff' : '#595959',
                border: opt.isCorrect ? 'none' : '1px solid #d9d9d9'
              }}>
                {opt.isCorrect ? <CheckCircleOutlined /> : (i + 1)}
              </div>
              <span style={{ fontSize: 15, flex: 1, color: opt.isCorrect ? '#141414' : '#595959' }}>
                {opt.content}
              </span>
              {opt.imageUrl && (
                <div style={{ marginLeft: 'auto', display: 'flex' }}>
                  <Image src={opt.imageUrl} alt="Option" height={48} style={{ borderRadius: 4, border: '1px solid #f0f0f0', objectFit: 'contain' }} />
                </div>
              )}
            </div>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default QuestionCard;
