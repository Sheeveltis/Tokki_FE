import React from 'react'
import { Typography } from 'antd'

const { Text } = Typography

const ConfigTypeItem = ({ type, isActive }) => {
  return (
    <div style={{ 
      padding: '12px 16px', 
      display: 'flex', 
      alignItems: 'center', 
      width: '240px',
      borderRadius: '8px',
      transition: 'all 0.3s'
    }}>
      <span style={{ 
        fontSize: '20px', 
        marginRight: '16px', 
        color: isActive ? type.color : '#bfbfbf',
        background: isActive ? `${type.color}15` : 'transparent',
        width: '36px',
        height: '36px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '8px'
      }}>
        {type.icon}
      </span>
      <Text strong={isActive} style={{ color: isActive ? '#1a1a1a' : '#8c8c8c' }}>
        {type.label}
      </Text>
    </div>
  )
}

export default ConfigTypeItem
