"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ToastType = "default" | "success" | "error" | "warning" | "destructive";

interface Toast {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = {
      id,
      duration: 5000,
      ...toast
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter(toast => toast.id !== id));
  };

  // Auto-remove toasts after duration
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    toasts.forEach(toast => {
      if (toast.duration && toast.duration > 0) {
        const timer = setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [toasts]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && toasts.length > 0) {
        // Remove the most recent toast
        const lastToast = toasts[toasts.length - 1];
        removeToast(lastToast.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toasts, removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] flex flex-col items-center gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <div key={toast.id}>
              <ToastItem toast={toast} removeToast={removeToast} />
              {toast.type === 'destructive' && toast.cancel && (
                <div
                  className="fixed inset-0 z-[999] bg-transparent"
                  onClick={() => {
                    toast.cancel?.onClick?.();
                    removeToast(toast.id);
                  }}
                />
              )}
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, removeToast }: { toast: Toast; removeToast: (id: string) => void }) => {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;

    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [isHovered, toast.duration, toast.id, removeToast]);

  const handleCancel = () => {
    toast.cancel?.onClick?.();
    removeToast(toast.id);
  };

  const handleAction = () => {
    toast.action?.onClick?.();
    removeToast(toast.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="pointer-events-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-sm w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900">{toast.title}</h3>
              {toast.description && (
                <p className="mt-1 text-sm text-gray-500">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {(toast.action || toast.cancel) && (
            <div className="mt-4 flex justify-end space-x-3">
              {toast.cancel && (
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  {toast.cancel.label}
                </button>
              )}
              {toast.action && (
                <button
                  onClick={handleAction}
                  className={`px-3 py-1.5 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    toast.type === 'destructive'
                      ? 'bg-red-600 border border-transparent hover:bg-red-700 focus:ring-red-500'
                      : 'bg-green-600 border border-transparent hover:bg-green-700 focus:ring-green-500'
                  }`}
                >
                  {toast.action.label}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};