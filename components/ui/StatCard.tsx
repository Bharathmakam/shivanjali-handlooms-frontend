import styles from './StatCard.module.css';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: { value: number; positive: boolean };
  className?: string;
}

export default function StatCard({ icon, label, value, trend, className = '' }: StatCardProps) {
  return (
    <div className={`${styles.card} ${className}`}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.info}>
        <span className={styles.value}>{value}</span>
        <span className={styles.label}>{label}</span>
        {trend && (
          <span className={`${styles.trend} ${trend.positive ? styles.positive : styles.negative}`}>
            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  );
}
