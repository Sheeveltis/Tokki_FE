import React from 'react';
import './buttonUI.css';

const ButtonUI = ({ children, onClick, type = 'C', disabled = false, style }) => {
  return (
    <div className="button-container" style={{ ...style, opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <button className={`button type--${type}`} onClick={onClick} disabled={disabled}>
        <div className="button__line"></div>
        <div className="button__line"></div>
        <span className="button__text">{children}</span>
        <div className="button__drow1"></div>
        <div className="button__drow2"></div>
      </button>
    </div>
  );
};

export default ButtonUI;