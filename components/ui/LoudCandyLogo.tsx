import React from 'react';
import { Sparkles } from 'lucide-react';

interface LoudCandyLogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const LoudCandyLogo: React.FC<LoudCandyLogoProps> = ({ size = 'medium', className = '' }) => {
  const scale = size === 'large' ? 1.5 : size === 'small' ? 0.7 : 1;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ transform: `scale(${scale})` }}
    >
      {/* Periwinkle sticker base */}
      <div className="absolute inset-0 bg-[#6C5CE7] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl -rotate-3"></div>

      {/* Foreground */}
      <div className="relative z-10 flex items-center justify-center gap-1 bg-[#F4F3EE] border-4 border-black rounded-xl px-6 py-3 rotate-2">
        <span className="font-serif italic font-black text-4xl tracking-tighter text-black transform -translate-y-1">
          Loud
        </span>

        <div className="relative">
          <span className="block font-sans font-black text-3xl uppercase text-white bg-black px-2 py-1 transform -rotate-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
            Candy
          </span>
          <Sparkles
            size={24}
            className="absolute -top-4 -right-4 text-black fill-[#FFEAA7]"
            strokeWidth={2.5}
          />
        </div>
      </div>
    </div>
  );
};

export default LoudCandyLogo;
