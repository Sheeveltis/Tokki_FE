import React, { useMemo } from 'react';
import { Typography, Progress, Button, Tooltip } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export const QuestionNavigator = ({
  templateParts,
  currentSkill,
  pendingCount,
  isLockedExam,
  isSaving,
  getQuestionStatus,
  onQuestionClick,
  onSaveAll
}) => {
  const isPendingWarning = pendingCount > 0;

  const filteredParts = useMemo(() => {
    if (!currentSkill || currentSkill === 'all') return templateParts || [];
    return templateParts?.filter(p => {
      const skill = (p.skill || '').toLowerCase();
      if (currentSkill === 'Listening') return skill.includes('listen');
      if (currentSkill === 'Reading') return skill.includes('read');
      if (currentSkill === 'Writing') return skill.includes('writ');
      return true;
    }) || [];
  }, [templateParts, currentSkill]);

  return (
    <div style={{
      background: '#fff',
      borderRadius: 8,
      padding: 24,
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      border: '1px solid #f0f0f0',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ padding: '0 0 16px', borderBottom: '1px solid #f0f0f0', marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>
          Bảng danh sách câu hỏi:
        </Title>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        paddingRight: 8,
        scrollbarWidth: 'thin',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {filteredParts?.map((part, pIdx) => {
            const hasQuestions = part.questions && part.questions.length > 0;
            if (!hasQuestions) return null;

            return (
              <div key={part.templatePartId || pIdx}>
                <Text style={{
                  display: 'block',
                  marginBottom: 12,
                  fontWeight: 500,
                  color: '#262626'
                }}>
                  {part.templatePartsTitle}
                  <span style={{ color: '#8c8c8c', marginLeft: 8 }}>
                    (Phần {pIdx + 1})
                  </span>
                </Text>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  // gap: 8
                }}>
                  {part.questions.map((q, qIndex) => {
                    const status = getQuestionStatus(part.templatePartId, qIndex);

                    let bgColor = '#fff';
                    let borderColor = '#d9d9d9';
                    let color = '#595959';
                    let hoverColor = '#1890ff';

                    if (status === 'warning') {
                      bgColor = '#fffbe6';
                      borderColor = '#faad14';
                      color = '#faad14';
                    } else if (status === 'success') {
                      bgColor = '#f6ffed';
                      borderColor = '#52c41a';
                      color = '#52c41a';
                    }

                    return (
                      <div
                        key={qIndex}
                        onClick={() => onQuestionClick(part.templatePartId, qIndex)}
                        style={{
                          width: '70%',
                          aspectRatio: '1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 6,
                          border: `1px solid ${borderColor}`,
                          backgroundColor: bgColor,
                          color: color,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          if (status === 'default') {
                            e.currentTarget.style.borderColor = hoverColor;
                            e.currentTarget.style.color = hoverColor;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (status === 'default') {
                            e.currentTarget.style.borderColor = borderColor;
                            e.currentTarget.style.color = color;
                          }
                        }}
                      >
                        {q.questionNo || (qIndex + 1)}
                        {status === 'warning' && (
                          <div style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#faad14' }} />
                        )}
                        {status === 'success' && (
                          <div style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#52c41a' }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* <div style={{
        marginTop: 16,
        paddingTop: 16,
        borderTop: '1px solid #f0f0f0',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
        {isPendingWarning && (
          <Tooltip title="Tiến độ chỉnh sửa" placement="left">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', backgroundColor: '#fffbe6', borderRadius: 8 }}>
              <Progress
                type="circle"
                percent={100}
                width={24}
                strokeColor="#faad14"
                format={() => <span style={{ color: '#faad14', fontSize: 10 }}>{pendingCount}</span>}
              />
              <Text style={{ fontSize: 13, color: '#d48806' }}>Có {pendingCount} thay đổi chưa lưu</Text>
            </div>
          </Tooltip>
        )}

        <Button
          type={isPendingWarning ? "primary" : "default"}
          block
          loading={isSaving}
          disabled={(!isPendingWarning || isLockedExam) && !isSaving}
          onClick={onSaveAll}
          icon={isPendingWarning ? <ExclamationCircleOutlined /> : <CheckCircleOutlined />}
        >
          {isPendingWarning ? "Lưu tất cả thay đổi" : "Không có thay đổi"}
        </Button>
      </div> */}
    </div>
  );
};

export default QuestionNavigator;
