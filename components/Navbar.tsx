'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isLight = pathname !== '/' && (pathname === '/shop' || pathname === '/login' || pathname === '/register' || pathname === '/checkout' || pathname?.startsWith('/cart') || pathname?.startsWith('/product') || pathname?.startsWith('/order') || pathname?.startsWith('/search') || pathname?.startsWith('/admin'));

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [searchOpen]);

  return (
    <>
      <nav className={`${styles.nav} ${isLight ? styles.light : styles.dark} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.navInner}>
          <div className={styles.navLeft}>
            <button
              className={styles.hamburger}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className={mobileMenuOpen ? styles.hamburgerOpen : ''}></span>
              <span className={mobileMenuOpen ? styles.hamburgerOpen : ''}></span>
              <span className={mobileMenuOpen ? styles.hamburgerOpen : ''}></span>
            </button>

            <ul className={`${styles.navLinks} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
              <li><Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link></li>
              <li><Link href="/shop" onClick={() => setMobileMenuOpen(false)}>Shop</Link></li>
              <li><Link href="/about" onClick={() => setMobileMenuOpen(false)}>Our Story</Link></li>
              <li><Link href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link></li>
            </ul>
          </div>

          <div className={styles.navCenter}>
            <Link href="/" className={styles.logo}>
              <span className={styles.logoText}>Shivanjali</span>
              <span className={styles.logoAccent}>Handlooms</span>
            </Link>
          </div>

          <div className={styles.navRight}>
            <button className={styles.searchBtn} onClick={() => setSearchOpen(true)} aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>

            <Link href="/wishlist" className={styles.iconBtn}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {wishlistItems.length > 0 && <span className={styles.iconCount}>{wishlistItems.length}</span>}
            </Link>

            <Link href="/cart" className={styles.iconBtn}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {itemCount > 0 && <span className={styles.iconCount}>{itemCount}</span>}
            </Link>

            {user ? (
              <Link href="/dashboard" className={styles.userBtn}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </Link>
            ) : (
              <Link href="/login" className={styles.loginBtn}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {searchOpen && (
        <div className={styles.searchOverlay} onClick={() => setSearchOpen(false)}>
          <div className={styles.searchModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.searchClose} onClick={() => setSearchOpen(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div className={styles.searchContent}>
              <h2>Search Collection</h2>
              <SearchInput onClose={() => setSearchOpen(false)} />
              <div className={styles.searchSuggestions}>
                <span>Popular:</span>
                <Link href="/search?q=Silk" onClick={() => setSearchOpen(false)}>Silk Sarees</Link>
                <Link href="/search?q=Cotton" onClick={() => setSearchOpen(false)}>Cotton</Link>
                <Link href="/search?q=Banarasi" onClick={() => setSearchOpen(false)}>Banarasi</Link>
                <Link href="/search?q=Ikat" onClick={() => setSearchOpen(false)}>Pochampally Ikat</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

import type { Product } from '@/types';

const SearchInput = ({ onClose }: { onClose: () => void }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (query.length < 2) {
      // Clearing results for short queries is handled inline, not via setState in effect
      return;
    }

    searchTimerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { getProducts } = await import('@/lib/api');
        const products = await getProducts();
        const filtered = products.filter(
          (p: Product) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
        );
        setResults(filtered.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
      onClose();
    }
  };

  return (
    <div className={styles.searchInputWrapper}>
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Search sarees, fabrics, colors..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.searchField}
          autoFocus
        />
      </form>

      {loading && <div className={styles.searchLoading}>Searching...</div>}

      {results.length > 0 && (
        <div className={styles.searchResults}>
          {results.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className={styles.searchResult}
              onClick={onClose}
            >
              <div className={styles.resultInfo}>
                <span className={styles.resultName}>{product.name}</span>
                <span className={styles.resultCategory}>{product.category}</span>
              </div>
              <span className={styles.resultPrice}>₹{product.price?.toLocaleString()}</span>
            </Link>
          ))}
          <Link href={`/search?q=${encodeURIComponent(query)}`} className={styles.viewAllResults} onClick={onClose}>
            View all results for &ldquo;{query}&rdquo; →
          </Link>
        </div>
      )}

      {query.length >= 2 && !loading && results.length === 0 && (
        <div className={styles.noResults}>
          <p>No products found for &ldquo;{query}&rdquo;</p>
        </div>
      )}
    </div>
  );
};

export default Navbar;
