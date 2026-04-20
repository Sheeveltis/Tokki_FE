import React from 'react';
import './buttonUI2.css';

const ButtonUI2 = ({ children, onClick, style }) => {
  return (
    <div className="item button-parrot" style={{ '--bg-color': '#2c3e50', ...style }}>
      <button onClick={onClick}>
        {children || 'Click Me!'}
        <div className="parrot"></div>
        <div className="parrot"></div>
        <div className="parrot"></div>
        <div className="parrot"></div>
        <div className="parrot"></div>
        <div className="parrot"></div>
      </button>
    </div>
  );
};

export default ButtonUI2;