import React from 'react';
import logoImg from '../assets/cboi_logo.png';

const CboiLogo = ({ className = "" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img src={logoImg} alt="Central Bank of India" className="h-full w-auto object-contain" />
    </div>
  );
};

export default CboiLogo;
