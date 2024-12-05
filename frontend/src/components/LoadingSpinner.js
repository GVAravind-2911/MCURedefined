'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const LoadingSpinner = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only import ldrs in browser
    if (typeof window !== 'undefined') {
      import('ldrs/trefoil');
    }

    // Handle route change start
    const handleStart = () => setLoading(true);
    // Handle route change complete
    const handleComplete = () => setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  if (!loading) return null;

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
          background: rgba(0, 0, 0, 0.9);
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