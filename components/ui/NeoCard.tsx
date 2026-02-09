import React from 'react';

interface NeoCardProps {
  children: React.ReactNode;
  className?: string;
  noShadow?: boolean;
  color?: string;
  onClick?: () => void;
}

const NeoCard: React.FC<NeoCardProps> = ({ 
  children, 
  className = "", 
  noShadow = false, 
  color = "bg-white",
  onClick 
}) => {
  return (
    <div 
      onClick={onClick}
      className={`
        ${color} 
        border-2 border-black 
        rounded-xl 
        ${noShadow ? '' : 'shadow-neo-md'} 
        ${className}
        ${onClick ? 'cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all' : ''}
      `}
    >
      {children}
    </div>
  );
};

export default NeoCard;