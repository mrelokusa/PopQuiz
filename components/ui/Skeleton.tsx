import React from 'react';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', children }) => {
  return (
    <div 
      className={`bg-gray-200 border-2 border-black animate-pulse ${className}`}
      role="presentation"
      aria-hidden="true"
    >
      {children}
    </div>
  );
};

export const QuizCardSkeleton: React.FC = () => {
  return (
    <Skeleton className="h-48 rounded-lg">
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex justify-between items-center pt-4">
          <div className="flex -space-x-2">
            <Skeleton className="w-8 h-8 rounded-full border-2 border-black bg-white" />
            <Skeleton className="w-8 h-8 rounded-full border-2 border-black bg-white" />
            <Skeleton className="w-8 h-8 rounded-full border-2 border-black bg-white" />
          </div>
          <Skeleton className="w-10 h-10 rounded-full bg-white" />
        </div>
      </div>
    </Skeleton>
  );
};

export const TextSkeleton: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className = '' 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
};

export const ButtonSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <Skeleton className={`h-12 w-32 rounded-lg ${className}`} />
  );
};

export default Skeleton;