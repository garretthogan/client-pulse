'use client';

import { useEffect, useState } from 'react';
import { ErrorState, LoadingState } from '@/components/page-state';
import { api } from '@/lib/api';
import type { DashboardSummary } from '@/types/domain';

const summaryItems: Array<{
  key: keyof DashboardSummary;
  label: string;
}> = [
  { key: 'totalRequests', label: 'Total requests' },
  { key: 'newRequests', label: 'New requests' },
  { key: 'inProgressRequests', label: 'In progress requests' },
  { key: 'blockedRequests', label: 'Blocked requests' },
  { key: 'doneRequests', label: 'Done requests' },
  {
    key: 'highOrUrgentPriorityRequests',
    label: 'High/Urgent priority',
  },
];

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    api
      .getSummary()
      .then((data) => {
        if (!ignore) {
          setSummary(data);
        }
      })
      .catch((caught: unknown) => {
        if (!ignore) {
          setError(caught instanceof Error ? caught.message : 'Unable to load');
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-kicker">
            Request health across active client projects.
          </p>
        </div>
      </div>

      {error ? <ErrorState message={error} /> : null}
      {!summary && !error ? <LoadingState label="Loading dashboard" /> : null}

      {summary ? (
        <div className="grid summary-grid">
          {summaryItems.map((item) => (
            <article className="card" key={item.key}>
              <div className="muted">{item.label}</div>
              <div className="summary-value">{summary[item.key]}</div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
