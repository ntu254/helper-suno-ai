import React from 'react';

interface IconButtonProps {
  icon: string;
  text: string;
  onClick: () => void;
  className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({ icon, text, onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-purple-600 transition-colors duration-200 ${className}`}
    >
      <i className={`fa-solid ${icon}`}></i>
      <span>{text}</span>
    </button>
  );
};