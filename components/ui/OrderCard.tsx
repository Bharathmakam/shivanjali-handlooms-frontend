import Link from 'next/link';
import StatusBadge from './StatusBadge';
import styles from './OrderCard.module.css';

interface OrderCardProps {
  order: {
    id: string;
    customerName?: string;
    email?: string;
    total: number;
    status: string;
    paymentMethod?: string;
    createdAt: string;
    items?: any[];
  };
  showTrackLink?: boolean;
  className?: string;
}

export default function OrderCard({ order, showTrackLink = true, className = '' }: OrderCardProps) {
  return (
    <div className={`${styles.card} ${className}`}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.orderId}>#{order.id.slice(0, 8)}</span>
          <span className={styles.date}>
            {new Date(order.createdAt).toLocaleDateString()}
          </span>
        </div>
        <StatusBadge status={order.status.toLowerCase()} />
      </div>

      <div className={styles.body}>
        {order.customerName && (
          <p><span className={styles.label}>Customer:</span> {order.customerName}</p>
        )}
        {order.paymentMethod && (
          <p><span className={styles.label}>Payment:</span> {order.paymentMethod === 'RAZORPAY' ? 'Online' : 'COD'}</p>
        )}
        {order.items && (
          <p><span className={styles.label}>Items:</span> {order.items.length}</p>
        )}
        <p><span className={styles.label}>Total:</span> ₹{order.total.toLocaleString()}</p>
      </div>

      {showTrackLink && (
        <Link href={`/orders/${order.id}`} className={styles.trackLink}>
          Track Order →
        </Link>
      )}
    </div>
  );
}
