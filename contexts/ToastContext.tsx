import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'], duration = 5000) => {
    const id = crypto.randomUUID();
    const newToast: Toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const getToastStyles = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-neo-mint text-black border-2 border-black';
      case 'error':
        return 'bg-neo-coral text-white border-2 border-black';
      case 'warning':
        return 'bg-neo-lemon text-black border-2 border-black';
      case 'info':
        return 'bg-neo-periwinkle text-white border-2 border-black';
      default:
        return 'bg-white text-black border-2 border-black';
    }
  };

  return (
    <div
      className={`
        ${getToastStyles(toast.type)}
        px-4 py-3 rounded-lg shadow-neo-md
        flex items-center justify-between gap-4
        min-w-[300px] max-w-[400px]
        animate-in slide-in-from-right-full fade-in duration-300
        hover:scale-105 transition-transform
      `}
      role="alert"
      aria-live="polite"
    >
      <span className="font-bold text-sm flex-1">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-2 p-1 hover:bg-black/10 rounded transition-colors"
        aria-label="Dismiss notification"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};