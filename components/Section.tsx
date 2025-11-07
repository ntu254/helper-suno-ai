import React from 'react';

interface SectionProps {
  icon: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ icon, title, children, className = '', actions }) => {
  return (
    <div className={`bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-lg backdrop-blur-sm ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-fuchsia-400 flex items-center gap-3">
          <i className={`fa-solid ${icon}`}></i>
          <span>{title}</span>
        </h2>
        {actions && <div>{actions}</div>}
      </div>
      {children}
    </div>
  );
};
