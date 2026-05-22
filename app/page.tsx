'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getProducts, subscribeNewsletter } from '@/lib/api';
import type { Product } from '@/types';
import styles from './page.module.css';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState('');

  useEffect(() => {
    getProducts().then((data) => setFeaturedProducts(data.slice(0, 4)));
  }, []);

  const handleNewsletter = async () => {
    if (!newsletterEmail) return;
    try {
      const res = await subscribeNewsletter(newsletterEmail);
      setNewsletterMsg(res.message);
      setNewsletterEmail('');
    } catch (err) {
      setNewsletterMsg(err instanceof Error ? err.message : 'Failed to subscribe');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>ESTABLISHED 1994</span>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroLine}>The Art of</span>
            <span className={styles.heroLineAccent}>Authentic Weaves</span>
          </h1>
          <p className={styles.heroDescription}>
            Discover handcrafted sarees woven with centuries of tradition, 
            each thread telling a story of Indian heritage.
          </p>
          <div className={styles.heroActions}>
            <Link href="/shop" className={styles.heroCta}>
              <span>Explore Collection</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link href="/about" className={styles.heroSecondary}>
              Our Story
            </Link>
          </div>
        </div>
        <div className={styles.heroScroll}>
          <span>Scroll to discover</span>
          <div className={styles.scrollLine}></div>
        </div>
      </header>

      <section className={styles.marquee}>
        <div className={styles.marqueeContent}>
          <span>Handloom Certified</span>
          <span className={styles.marqueeDot}>✦</span>
          <span>Artisan Made</span>
          <span className={styles.marqueeDot}>✦</span>
          <span>Pure Silk & Cotton</span>
          <span className={styles.marqueeDot}>✦</span>
          <span>Free Shipping Over ₹5000</span>
          <span className={styles.marqueeDot}>✦</span>
          <span>Handloom Certified</span>
          <span className={styles.marqueeDot}>✦</span>
          <span>Artisan Made</span>
          <span className={styles.marqueeDot}>✦</span>
          <span>Pure Silk & Cotton</span>
          <span className={styles.marqueeDot}>✦</span>
          <span>Free Shipping Over ₹5000</span>
          <span className={styles.marqueeDot}>✦</span>
        </div>
      </section>

      <section className={styles.categories}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Curated Collections</span>
          <h2 className={styles.sectionTitle}>Explore by Category</h2>
        </div>
        <div className={styles.categoryGrid}>
          <Link href="/shop" className={styles.categoryCard}>
            <div className={styles.categoryImage}>
              <div className={styles.categoryImageInner} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80')" }}></div>
            </div>
            <div className={styles.categoryOverlay}>
              <h3>Silk Sarees</h3>
              <p>Kanjeevaram, Banarasi & More</p>
              <span className={styles.categoryLink}>Shop Now →</span>
            </div>
          </Link>
          <Link href="/shop" className={styles.categoryCard}>
            <div className={styles.categoryImage}>
              <div className={styles.categoryImageInner} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80')" }}></div>
            </div>
            <div className={styles.categoryOverlay}>
              <h3>Cotton Sarees</h3>
              <p>Mangalagiri, Pochampally & More</p>
              <span className={styles.categoryLink}>Shop Now →</span>
            </div>
          </Link>
          <Link href="/shop" className={styles.categoryCard}>
            <div className={styles.categoryImage}>
              <div className={styles.categoryImageInner} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1595777457583-95e059d586b8?auto=format&fit=crop&w=800&q=80')" }}></div>
            </div>
            <div className={styles.categoryOverlay}>
              <h3>Fancy Sarees</h3>
              <p>Party & Occasion Wear</p>
              <span className={styles.categoryLink}>Shop Now →</span>
            </div>
          </Link>
        </div>
      </section>

      <section className={styles.story}>
        <div className={styles.storyContent}>
          <div className={styles.storyText}>
            <span className={styles.sectionLabel}>Our Heritage</span>
            <h2>Crafted with <br/>Heritage & Soul</h2>
            <p>
              Every Shivanjali saree is a masterpiece, handwoven by master artisans 
              in the heart of Telangana. We preserve the legacy of Gadwal and 
              Pochampally Ikat, ensuring that every thread tells a story of 
              tradition, precision, and soul.
            </p>
            <div className={styles.storyStats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>30+</span>
                <span className={styles.statLabel}>Years of Legacy</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>500+</span>
                <span className={styles.statLabel}>Artisan Partners</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>10K+</span>
                <span className={styles.statLabel}>Happy Customers</span>
              </div>
            </div>
            <Link href="/about" className={styles.storyLink}>
              <span>Discover Our Story</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
          <div className={styles.storyImage}>
            <div className={styles.storyImageInner} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80')" }}></div>
            <div className={styles.storyImageAccent}></div>
          </div>
        </div>
      </section>

      <section className={styles.featured}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Handpicked for You</span>
          <h2 className={styles.sectionTitle}>Featured Masterpieces</h2>
        </div>
        <div className={styles.productGrid}>
          {featuredProducts.map((product, index) => (
            <div key={product.id} className={styles.productWrapper} style={{ animationDelay: `${index * 0.1}s` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        <div className={styles.featuredCta}>
          <Link href="/shop" className={styles.viewAll}>
            <span>View All Products</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </section>

      <section className={styles.trust}>
        <div className={styles.trustGrid}>
          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>🎨</div>
            <h3>Authentic Handloom</h3>
            <p>Every piece is certified genuine handloom, directly from master weavers.</p>
          </div>
          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>🚚</div>
            <h3>Free Shipping</h3>
            <p>Complimentary shipping on all orders above ₹5,000 across India.</p>
          </div>
          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>💎</div>
            <h3>Premium Quality</h3>
            <p>Rigorous quality checks ensure only the finest reaches you.</p>
          </div>
          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>🔄</div>
            <h3>Easy Returns</h3>
            <p>Hassle-free 7-day return policy for your peace of mind.</p>
          </div>
        </div>
      </section>

      <section className={styles.newsletter}>
        <div className={styles.newsletterBg}></div>
        <div className={styles.newsletterContent}>
          <span className={styles.sectionLabel}>Stay Connected</span>
          <h2>Join the Heritage</h2>
          <p>Sign up for exclusive previews, artisan stories, and early access to new collections.</p>
          <div className={styles.subscribeBox}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNewsletter()}
            />
            <button onClick={handleNewsletter}>Subscribe</button>
          </div>
          {newsletterMsg && <p className={styles.newsletterMsg}>{newsletterMsg}</p>}
        </div>
      </section>
    </div>
  );
}
