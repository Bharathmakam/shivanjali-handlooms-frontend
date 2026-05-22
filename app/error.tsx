'use client';

import Link from 'next/link';
import styles from './error.module.css';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Something Went Wrong</h1>
        <p>We apologize for the inconvenience. An error occurred while loading this page.</p>
        {process.env.NODE_ENV === 'development' && (
          <pre className={styles.errorDetails}>{error.message}</pre>
        )}
        <div className={styles.actions}>
          <button onClick={reset} className={styles.retryButton}>
            Try Again
          </button>
          <Link href="/" className={styles.homeButton}>
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
