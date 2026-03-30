import React, { useMemo } from 'react';
import { Space, Segmented, Button, Typography, Empty, Tooltip, Badge, Row, Col, Card, Image } from 'antd';
import {
  CustomerServiceOutlined,
  ReadOutlined,
  EditOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { QuestionCard } from './question-card.jsx';

const { Title, Text, Paragraph } = Typography;

export const ExamContentTab = ({
  templateParts,
  isLockedExam,
  highlightedQuestions,
  pendingUpdates,
  savingUpdateKey,
  previousQuestionsMap,
  regeneratingPartId,
  currentSkill,
  setCurrentSkill,
  onEditQuestion,
  onUndoQuestion,
  onViewOldQuestion,
  onSaveQuestion,
  onRegeneratePart
}) => {

  // Filter and group by passage
  const filteredParts = useMemo(() => {
    return templateParts?.filter(p => {
      const skill = (p.skill || '').toLowerCase();
      if (currentSkill === 'Listening') return skill.includes('listen');
      if (currentSkill === 'Reading') return skill.includes('read');
      if (currentSkill === 'Writing') return skill.includes('writ');
      return true;
    }) || [];
  }, [templateParts, currentSkill]);

  const groupQuestionsByPassage = (part) => {
    const groups = [];
    let currentGroup = null;

    part.questions?.forEach((q, idx) => {
      const passageKey = q.passageContent || q.passageImageUrl || q.passageAudioUrl;
      if (passageKey) {
        if (!currentGroup || currentGroup.key !== passageKey) {
          currentGroup = {
            key: passageKey,
            passage: {
              content: q.passageContent,
              imageUrl: q.passageImageUrl,
              audioUrl: q.passageAudioUrl,
              mediaType: q.passageMediaType
            },
            questions: []
          };
          groups.push(currentGroup);
        }
        currentGroup.questions.push({ ...q, qIndex: idx, templatePartId: part.templatePartId });
      } else {
        currentGroup = null;
        groups.push({
          key: `single-${idx}`,
          passage: null,
          questions: [{ ...q, qIndex: idx, templatePartId: part.templatePartId }]
        });
      }
    });
    return groups;
  };

  return (
    <div style={{ padding: 24, margin: '0 auto', minHeight: 600 }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <Segmented
          value={currentSkill}
          onChange={setCurrentSkill}
          style={{ padding: 4, borderRadius: 8 }}
          options={[
            { label: <Space style={{ padding: '4px 16px' }}><CustomerServiceOutlined />Nghe</Space>, value: 'Listening' },
            { label: <Space style={{ padding: '4px 16px' }}><EditOutlined />Viết</Space>, value: 'Writing' },
            { label: <Space style={{ padding: '4px 16px' }}><ReadOutlined />Đọc</Space>, value: 'Reading' },
          ]}
        />
      </div>

      {filteredParts.length > 0 ? (
        filteredParts.map((part, pIdx) => {
          const passageGroups = groupQuestionsByPassage(part);
          const accentColor = pIdx % 3 === 0 ? '#1890ff' : pIdx % 3 === 1 ? '#52c41a' : '#722ed1';

          return (
            <div
              key={part.templatePartId || pIdx}
              style={{
                marginBottom: 24,
                backgroundColor: '#ffffff',
                border: '1px solid #f0f0f0',
                borderRadius: 8,
                overflow: 'hidden',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
              }}
              className="part-container"
            >
              <div
                style={{
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                  padding: '16px 24px',
                  borderBottom: '1px solid #f0f0f0',
                  backgroundColor: '#fafafa'
                }}
              >
                <div style={{ flex: 1, paddingRight: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Text strong style={{ color: accentColor }}>Phần {pIdx + 1}</Text>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      • {part.questions?.length || 0} câu hỏi
                    </Text>
                  </div>
                  <Title level={5} style={{ margin: 0, color: '#262626', lineHeight: 1.5, fontWeight: 600 }}>
                    {part.templatePartsTitle}
                  </Title>
                </div>

                <Tooltip title="Tải lại toàn bộ nội dung của phần này">
                  <Button
                    icon={<ReloadOutlined spin={regeneratingPartId === part.templatePartId} />}
                    disabled={isLockedExam || regeneratingPartId}
                    onClick={() => onRegeneratePart(part.templatePartId)}
                  >
                    Tạo lại phần thi
                  </Button>
                </Tooltip>
              </div>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 32 }}>
                {passageGroups.map((group, gIdx) => (
                  <div key={group.key} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {group.passage && (
                      <Card
                        bordered={false}
                        style={{
                          backgroundColor: '#fafafa', border: '1px solid #f0f0f0',
                          borderRadius: 8, overflow: 'hidden'
                        }}
                        bodyStyle={{ padding: 0 }}
                      >
                        <Row gutter={0}>
                          {group.passage.imageUrl && (
                            <Col span={24} lg={10}>
                              <div style={{ height: '100%', minHeight: 300, backgroundColor: '#fff', borderRight: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                                <Image src={group.passage.imageUrl} alt="Passage" style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain' }} />
                              </div>
                            </Col>
                          )}
                          <Col span={24} lg={group.passage.imageUrl ? 14 : 24}>
                            <div style={{ padding: 24 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <div style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: '#e6f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1890ff' }}>
                                  <FileTextOutlined />
                                </div>
                                <Text type="secondary">Nội dung đoạn văn / Dữ liệu dùng chung</Text>
                              </div>
                              {group.passage.audioUrl && (
                                <div style={{ marginBottom: 16, backgroundColor: '#fff', padding: 16, borderRadius: 8, border: '1px dashed #d9d9d9', display: 'flex', alignItems: 'center', gap: 16 }}>
                                  <audio controls style={{ height: 40, width: '100%', outline: 'none' }}>
                                    <source src={group.passage.audioUrl} type="audio/mpeg" />
                                  </audio>
                                </div>
                              )}
                              {group.passage.content && (
                                <div style={{ fontSize: 16, lineHeight: 1.6, color: '#262626', whiteSpace: 'pre-wrap', backgroundColor: '#fff', padding: 16, borderRadius: 8, border: '1px solid #f0f0f0' }}>
                                  {group.passage.content}
                                </div>
                              )}
                            </div>
                          </Col>
                        </Row>
                      </Card>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {group.questions.map((q) => {
                        const qKey = `${q.templatePartId}:${q.qIndex}`;
                        return (
                          <QuestionCard
                            key={qKey}
                            question={q}
                            isHighlighted={highlightedQuestions.includes(qKey)}
                            isPending={!!pendingUpdates[qKey]}
                            isSaving={savingUpdateKey === qKey}
                            isLockedExam={isLockedExam}
                            hasOldQuestion={!!previousQuestionsMap[qKey]}
                            onEdit={() => onEditQuestion(q.templatePartId, q.qIndex)}
                            onUndo={() => onUndoQuestion(q.templatePartId, q.qIndex)}
                            onViewOld={() => onViewOldQuestion(q.templatePartId, q.qIndex)}
                            onSave={() => onSaveQuestion(q.templatePartId, q.qIndex)}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Không có dữ liệu cho phần thi này</Text>
                <Button type="link" onClick={() => setCurrentSkill('Listening')}>Chuyển qua phần thi khác</Button>
              </div>
            }
          />
        </div>
      )}
    </div>
  );
};

export default ExamContentTab;
