'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchProducts, type PaginatedProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import styles from './search.module.css';

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [result, setResult] = useState<PaginatedProducts | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when query changes using a key-based approach instead of effect
  const [lastQuery, setLastQuery] = useState(query);
  if (query !== lastQuery) {
    setLastQuery(query);
    setCurrentPage(1);
  }

  useEffect(() => {
    async function fetchResults() {
      if (!query) {
        setResult(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await searchProducts({
          search: query,
          page: currentPage,
          limit: 12,
        });
        setResult(data);
      } catch (err) {
        console.error(err);
        setResult(null);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [query, currentPage]);

  const products = result?.data || [];
  const totalPages = result?.totalPages || 1;
  const total = result?.total || 0;

  return (
    <>
      <h1>Search Results for &quot;{query}&quot;</h1>
      <p className={styles.resultCount}>
        {loading ? 'Searching...' : `${total} product${total !== 1 ? 's' : ''} found`}
      </p>

      {loading ? (
        <div className={styles.loading}>Loading results...</div>
      ) : products.length === 0 ? (
        <div className={styles.empty}>
          <p>No products match your search. Try different keywords.</p>
          <button onClick={() => router.push('/shop')} className={styles.shopButton}>
            Browse All Products
          </button>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageButton}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              <span className={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className={styles.pageButton}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <div className={styles.container}>
      <Suspense fallback={<div className={styles.loading}>Loading search...</div>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}