import Link from 'next/link';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon = '📭',
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.icon}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {actionLabel && (
        actionHref ? (
          <Link href={actionHref} className={styles.action}>
            {actionLabel}
          </Link>
        ) : (
          <button className={styles.action} onClick={onAction}>
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}
