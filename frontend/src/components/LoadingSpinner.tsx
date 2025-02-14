'use client';

import type React from 'react';
import { trefoil } from 'ldrs';


trefoil.register();

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-overlay">
      <l-trefoil
        size="40"
        stroke="4"
        stroke-length="0.15"
        bg-opacity="0.1"
        speed="1.4"
        color="white"
      />
      <style jsx>{`
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 1.0);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;