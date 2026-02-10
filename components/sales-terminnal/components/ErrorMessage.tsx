// components/sales-terminnal/components/ErrorMessage.tsx
"use client";

import { useEffect } from "react";

type ErrorMessageProps = {
  message: string | null;
  onClose: () => void;
};

export const ErrorMessage = ({ message, onClose }: ErrorMessageProps) => {
  useEffect(() => {
    if (message) {
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="top-4 left-1/2 z-60 fixed -translate-x-1/2 animate-slide-down">
      <div className="flex items-center gap-3 shadow-lg bg-destructive px-6 py-4 rounded-lg max-w-md">
        {/* Error Icon */}
        <div className="shrink-0">
          <svg
            className="w-6 h-6 text-destructive-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <div className="flex-1">
          <p className="font-medium text-destructive-foreground text-sm leading-tight">
            {message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:bg-black/20 p-1 rounded transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-5 h-5 text-destructive-foreground/80"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ErrorMessage;
