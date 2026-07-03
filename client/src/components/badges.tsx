import { formatLabel } from '@/lib/format';
import type { Priority, ProjectStatus, RequestStatus } from '@/types/domain';

export function StatusBadge({
  value,
}: {
  value: RequestStatus | ProjectStatus;
}) {
  return (
    <span className={`badge status-${value.toLowerCase()}`}>
      {formatLabel(value)}
    </span>
  );
}

export function PriorityBadge({ value }: { value: Priority }) {
  return <span className={`badge priority-${value.toLowerCase()}`}>{formatLabel(value)}</span>;
}
