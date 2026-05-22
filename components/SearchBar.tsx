'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProducts } from '@/lib/api';
import type { Product } from '@/types';
import styles from './SearchBar.module.css';

const SearchBar = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const products = await getProducts();
        const filtered = products.filter(
          (p) =>
            p.name.toLowerCase().includes(value.toLowerCase()) ||
            p.description.toLowerCase().includes(value.toLowerCase()) ||
            p.category.toLowerCase().includes(value.toLowerCase())
        );
        setResults(filtered.slice(0, 6));
        setShowResults(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowResults(false);
    }
  };

  const handleSelect = (product: Product) => {
    router.push(`/product/${product.id}`);
    setShowResults(false);
    setQuery('');
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <form className={styles.searchForm} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search sarees..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchButton}>
          🔍
        </button>
      </form>

      {showResults && results.length > 0 && (
        <div className={styles.results}>
          {results.map((product) => (
            <button
              key={product.id}
              className={styles.resultItem}
              onClick={() => handleSelect(product)}
            >
              <span className={styles.resultName}>{product.name}</span>
              <span className={styles.resultPrice}>₹{product.price.toLocaleString()}</span>
            </button>
          ))}
          <button
            className={styles.viewAll}
            onClick={() => {
              router.push(`/search?q=${encodeURIComponent(query)}`);
              setShowResults(false);
            }}
          >
            View all results for &ldquo;{query}&rdquo;
          </button>
        </div>
      )}

      {showResults && query.length >= 2 && results.length === 0 && !loading && (
        <div className={styles.noResults}>No products found for &ldquo;{query}&rdquo;</div>
      )}

      {loading && <div className={styles.loading}>Searching...</div>}
    </div>
  );
};

export default SearchBar;
