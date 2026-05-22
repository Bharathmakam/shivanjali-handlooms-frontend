import Link from 'next/link';
import styles from './SectionHeader.module.css';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export default function SectionHeader({ title, actionLabel, actionHref, onAction, className = '' }: SectionHeaderProps) {
  return (
    <div className={`${styles.header} ${className}`}>
      <h2 className={styles.title}>{title}</h2>
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
