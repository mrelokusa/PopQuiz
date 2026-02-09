import React from 'react';
import { LucideIcon } from 'lucide-react';

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon';
  icon?: LucideIcon;
  label?: string;
  colorClass?: string;
}

const NeoButton: React.FC<NeoButtonProps> = ({ 
  variant = 'primary', 
  icon: Icon, 
  label, 
  colorClass = 'bg-white', 
  className = '',
  children,
  ...props 
}) => {
  
  if (variant === 'icon') {
    return (
      <button 
        className={`
          p-2 rounded-lg border-2 border-black ${colorClass}
          hover:bg-slate-50 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none 
          transition-all shadow-neo-sm active:translate-x-[2px] active:translate-y-[2px]
          ${className}
        `}
        {...props}
      >
        {Icon && <Icon className="w-5 h-5 text-black" />}
        {children}
      </button>
    );
  }

  return (
    <button 
      className={`
        relative group font-bold uppercase tracking-tight text-sm
        ${className}
      `}
      {...props}
    >
      <div className="absolute inset-0 bg-black rounded-xl translate-x-1 translate-y-1 group-active:translate-x-0 group-active:translate-y-0 transition-transform"></div>
      <div className={`
        relative ${colorClass} border-2 border-black rounded-xl px-6 py-3 
        flex items-center justify-center gap-2 
        group-hover:-translate-y-0.5 group-hover:-translate-x-0.5 
        group-active:translate-x-1 group-active:translate-y-1 
        transition-all
      `}>
        {label}
        {children}
        {/* Added text-black to ensure icon is visible against the white background, even if parent has text-white */}
        {Icon && <Icon className="w-5 h-5 border-2 border-black rounded-full bg-white text-black p-0.5" />}
      </div>
    </button>
  );
};

export default NeoButton;