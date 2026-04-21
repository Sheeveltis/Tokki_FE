import React from 'react';
import './buttonUI1.css';

const ButtonUI1 = ({ children, onClick }) => {
  return (
    <button className="learn-more" onClick={onClick}>
      <span className="circle" aria-hidden="true">
        <span className="icon arrow"></span>
      </span>
      <span className="button-text">{children || 'Learn More'}</span>
    </button>
  );
};


export default ButtonUI1;
