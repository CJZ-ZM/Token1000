'use client';

import { useEffect, useState } from 'react';
import { StatusBadge } from './StatusBadge';

export function ProviderStatus({ providerId }: { providerId: string }) {
  const [status, setStatus] = useState<'online' | 'offline' | 'unknown'>('unknown');

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        const found = data.results?.find((r: { key: string }) => r.key === providerId);
        if (found) {
          setStatus(found.status);
        }
      })
      .catch(() => setStatus('unknown'));
  }, [providerId]);

  return <StatusBadge status={status} />;
}
