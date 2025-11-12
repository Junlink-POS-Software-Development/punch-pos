"use client";
import React from "react";

// --- Reusable SVG Icons (Internal to this file) ---

const LoadingSpinner: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <svg
    className={`animate-spin ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    role="status"
    aria-live="polite"
    aria-label="Loading"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const ErrorExclamationIcon: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    role="img"
    aria-label="Error"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
    />
  </svg>
);

// --- Main Exported Component ---

interface StatusDisplayProps {
  type: "loading" | "processing" | "error";
  text: string;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ type, text }) => {
  let icon;
  let textColor = "text-gray-400"; // default
  const iconSize = "w-5 h-5"; // Standard size for the icons

  switch (type) {
    case "loading":
      icon = <LoadingSpinner className={`${iconSize} text-gray-400`} />;
      textColor = "text-gray-400";
      break;
    case "processing":
      icon = <LoadingSpinner className={`${iconSize} text-blue-400`} />;
      textColor = "text-blue-400";
      break;
    case "error":
      icon = <ErrorExclamationIcon className={`${iconSize} text-red-500`} />;
      textColor = "text-red-500";
      break;
  }

  return (
    <div
      className={`flex items-center justify-center gap-2 p-4 ${textColor}`}
      role="alert"
    >
      {icon}
      <p>{text}</p>
    </div>
  );
};
