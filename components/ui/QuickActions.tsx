import Link from 'next/link';
import styles from './QuickActions.module.css';

interface ActionItem {
  label: string;
  icon?: string;
  href: string;
}

interface QuickActionsProps {
  title?: string;
  actions: ActionItem[];
  className?: string;
}

export default function QuickActions({ title = 'Quick Actions', actions, className = '' }: QuickActionsProps) {
  return (
    <div className={`${styles.container} ${className}`}>
      {title && <h2 className={styles.title}>{title}</h2>}
      <div className={styles.grid}>
        {actions.map((action) => (
          <Link key={action.href} href={action.href} className={styles.action}>
            {action.icon && <span className={styles.icon}>{action.icon}</span>}
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
