import styles from './StatusBadge.module.css';

type StatusType = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'active' | 'inactive';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: '#f59e0b' },
  confirmed: { label: 'Confirmed', color: '#3b82f6' },
  processing: { label: 'Processing', color: '#8b5cf6' },
  shipped: { label: 'Shipped', color: '#06b6d4' },
  delivered: { label: 'Delivered', color: '#10b981' },
  cancelled: { label: 'Cancelled', color: '#ef4444' },
  returned: { label: 'Returned', color: '#6b7280' },
  active: { label: 'Active', color: '#10b981' },
  inactive: { label: 'Inactive', color: '#9ca3af' },
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusMap[status.toLowerCase()] || { label: status, color: '#6b7280' };

  return (
    <span
      className={`${styles.badge} ${className}`}
      style={{ backgroundColor: config.color + '20', color: config.color }}
    >
      {config.label}
    </span>
  );
}
