import React from 'react';
import { ButtonProps } from '../types';

export const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'default', 
  className = '', 
  cols = 1 
}) => {
  const baseStyles = "relative overflow-hidden rounded-2xl text-xl font-medium transition-all duration-200 active:scale-95 flex items-center justify-center select-none shadow-sm backdrop-blur-sm";
  
  let variantStyles = "";
  
  switch (variant) {
    case 'operator':
      variantStyles = "bg-orange-500 text-white hover:bg-orange-400 active:bg-orange-600 shadow-orange-500/20";
      break;
    case 'action':
      variantStyles = "bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-800 border border-gray-600/50";
      break;
    case 'scientific':
      variantStyles = "bg-gray-800 text-cyan-200 text-lg hover:bg-gray-700 active:bg-gray-900 border border-gray-700/50 font-mono";
      break;
    case 'ai':
      variantStyles = "bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:from-indigo-400 hover:to-purple-500 shadow-indigo-500/30 border border-indigo-400/30";
      break;
    default: // default number keys
      variantStyles = "bg-gray-800/80 text-gray-100 hover:bg-gray-700/80 active:bg-gray-800 border border-gray-700/30";
      break;
  }

  const colSpanClass = cols > 1 ? `col-span-${cols}` : '';

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles} ${colSpanClass} ${className} h-16 md:h-20`}
      style={{ gridColumn: cols > 1 ? `span ${cols} / span ${cols}` : undefined }}
    >
      {label}
    </button>
  );
};
