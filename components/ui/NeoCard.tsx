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
  // Skip the default background if the caller already supplied one in
  // className. Tailwind utilities have equal specificity, so without this
  // the default bg-white wins over things like bg-neo-periwinkle in the
  // compiled CSS — making text-white invisible on a "white" card.
  const hasBg = /(?:^|\s)bg-/.test(className);
  const colorClass = hasBg ? '' : color;

  return (
    <div
      onClick={onClick}
      className={`
        ${colorClass}
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