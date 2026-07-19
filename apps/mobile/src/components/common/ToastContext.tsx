import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastType } from './Toast';

export interface ToastOptions {
  title: string;
  message?: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextData {
  show: (options: ToastOptions) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  hide: () => void;
}

const ToastContext = createContext<ToastContextData | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toastData, setToastData] = useState<(ToastOptions & { id: number }) | null>(null);

  const hide = useCallback(() => {
    setToastData(null);
  }, []);

  const show = useCallback(({ title, message, type = 'info', duration = 3200 }: ToastOptions) => {
    setToastData({
      id: Date.now(),
      title,
      message,
      type,
      duration,
    });
  }, []);

  const success = useCallback((title: string, message?: string) => {
    show({ title, message, type: 'success' });
  }, [show]);

  const error = useCallback((title: string, message?: string) => {
    show({ title, message, type: 'error' });
  }, [show]);

  const info = useCallback((title: string, message?: string) => {
    show({ title, message, type: 'info' });
  }, [show]);

  const warning = useCallback((title: string, message?: string) => {
    show({ title, message, type: 'warning' });
  }, [show]);

  return (
    <ToastContext.Provider value={{ show, success, error, info, warning, hide }}>
      {children}
      {toastData && (
        <Toast
          key={toastData.id}
          title={toastData.title}
          message={toastData.message}
          type={toastData.type}
          duration={toastData.duration}
          onDismiss={hide}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextData {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
