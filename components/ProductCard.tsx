'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import type { Product } from '@/types';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
}

const FALL_PICO_PRICE = 450;

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlist();
  const [fallPico, setFallPico] = useState(false);
  const [added, setAdded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const totalPrice = fallPico ? product.price + FALL_PICO_PRICE : product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1, fallPico);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeWishlist(product.id);
    } else {
      addWishlist(product);
    }
  };

  return (
    <Link href={`/product/${product.id}`} className={styles.card}>
      <div className={styles.imageContainer}>
        {!imgLoaded && <div className={styles.skeleton}></div>}
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`${styles.image} ${imgLoaded ? styles.imageLoaded : ''}`}
            onLoad={() => setImgLoaded(true)}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
        
        <div className={styles.cardOverlay}>
          <button className={styles.quickView} onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `/product/${product.id}`; }}>
            Quick View
          </button>
        </div>

        <button className={styles.wishlistBtn} onClick={handleWishlist}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isInWishlist(product.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        {product.isHandloom && (
          <span className={styles.badge}>Handloom</span>
        )}
      </div>

      <div className={styles.info}>
        <span className={styles.category}>{product.category}</span>
        <h3>{product.name}</h3>
        <div className={styles.priceRow}>
          <p className={styles.price}>₹{totalPrice.toLocaleString()}</p>
          {fallPico && <span className={styles.fallPicoNote}>+ Fall & Pico</span>}
        </div>

        <div className={styles.services}>
          <label className={styles.fallPicoLabel}>
            <input
              type="checkbox"
              checked={fallPico}
              onChange={(e) => setFallPico(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
            />
            <span>Fall & Pico (+₹{FALL_PICO_PRICE})</span>
          </label>
        </div>

        {fallPico && (
          <p className={styles.disclaimer}>* Non-returnable with this service</p>
        )}

        <button
          className={`${styles.addToCart} ${added ? styles.added : ''}`}
          onClick={handleAddToCart}
        >
          {added ? (
            <span className={styles.addedText}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Added to Cart
            </span>
          ) : (
            <span className={styles.cartText}>
              Add to Cart
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </span>
          )}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
