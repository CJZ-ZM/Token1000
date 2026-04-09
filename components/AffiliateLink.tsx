'use client';

import { useState } from 'react';

interface AffiliateLinkProps {
  providerId: string;
  providerName: string;
  targetUrl: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'button' | 'link';
}

export default function AffiliateLink({
  providerId,
  providerName,
  targetUrl,
  children,
  className = '',
  variant = 'link',
}: AffiliateLinkProps) {
  const [tracking, setTracking] = useState(false);

  const handleClick = async () => {
    if (tracking) return;
    setTracking(true);

    try {
      // Record the click asynchronously (don't block navigation)
      fetch('/api/affiliate/click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId,
          targetUrl,
        }),
      }).catch(() => {
        // Silently fail - don't block user navigation
      });
    } finally {
      // Small delay then allow tracking again
      setTimeout(() => setTracking(false), 1000);
    }
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        disabled={tracking}
        className={className}
        title={`通过 Token1000 链接访问 ${providerName}（支持我们继续运营）`}
      >
        {children}
        {tracking && <span className="ml-1 text-xs opacity-50">...</span>}
      </button>
    );
  }

  return (
    <a
      href={targetUrl}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={className}
      title={`通过 Token1000 链接访问 ${providerName}（支持我们继续运营）`}
    >
      {children}
      {tracking && <span className="ml-1 text-xs opacity-50">...</span>}
    </a>
  );
}
