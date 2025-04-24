"use client";

import type React from "react";
import "@/styles/error.css";

interface ErrorMessageProps {
  title?: string;
  reasons?: string[];
  onReload?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = "Connection Error",
  reasons = [
    "Temporary network disruption",
    "Server maintenance",
    "Connection timeout"
  ],
  onReload = () => window.location.reload()
}) => {
  return (
    <div className="error-container">
      <div className="error-card">
        <h2 className="error-title">{title}</h2>
        
        <div className="error-divider">
          <div className="divider-line"/>
        </div>
        
        <div className="error-details">
          <ul className="error-reasons">
            {reasons.map((reason, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <li key={index} className="reason-item">{reason}</li>
            ))}
          </ul>
        </div>
        
        <button className="reload-button" onClick={onReload} type="button">
          <span className="button-text">Try Again</span>
          <span className="button-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
              <title>Reload</title>
              <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A6.002 6.002 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
};

export default ErrorMessage;