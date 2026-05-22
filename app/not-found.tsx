import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.errorCode}>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
        <div className={styles.actions}>
          <Link href="/" className={styles.homeButton}>
            Go Home
          </Link>
          <Link href="/shop" className={styles.shopButton}>
            Browse Collection
          </Link>
        </div>
      </div>
    </div>
  );
}
