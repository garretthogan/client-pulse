'use client';

import { ErrorState } from '@/components/page-state';

export default function Error({ error }: { error: Error }) {
  return <ErrorState message={error.message} />;
}
