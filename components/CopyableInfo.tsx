import React, { useState } from 'react';

interface CopyableInfoProps {
  label: string;
  value: string;
}

export const CopyableInfo: React.FC<CopyableInfoProps> = ({ label, value }) => {
  const [tooltipText, setTooltipText] = useState('Sao chép');

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setTooltipText('Đã sao chép!');
      setTimeout(() => {
        setTooltipText('Sao chép');
      }, 2000);
    }).catch(err => {
      console.error('Lỗi sao chép: ', err);
      setTooltipText('Lỗi!');
       setTimeout(() => {
        setTooltipText('Sao chép');
      }, 2000);
    });
  };

  return (
    <div className="text-center mt-2">
      <div 
        className="group relative inline-flex items-center gap-2 cursor-pointer bg-slate-700/50 px-3 py-1 rounded-full"
        onClick={handleCopy}
        onMouseLeave={() => setTooltipText('Sao chép')}
      >
        <span className="text-sm font-semibold text-slate-300">{label}:</span>
        <span className="text-sm font-mono text-fuchsia-300">{value}</span>
        <i className="fa-solid fa-copy text-slate-400"></i>
        <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {tooltipText}
        </div>
      </div>
    </div>
  );
};
