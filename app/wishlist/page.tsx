'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import styles from './wishlist.module.css';

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem } = useCart();

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <h2>Your Wishlist is Empty</h2>
        <p>Save items you love to your wishlist.</p>
        <Link href="/shop" className={styles.shopButton}>Explore Collection</Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>My Wishlist ({items.length})</h1>
        <button onClick={clearWishlist} className={styles.clearButton}>Clear All</button>
      </div>

      <div className={styles.grid}>
        {items.map((item) => (
          <div key={item.productId} className={styles.card}>
            <button
              className={styles.removeButton}
              onClick={() => removeItem(item.productId)}
            >
              ×
            </button>
            <Link href={`/product/${item.productId}`} className={styles.imageLink}>
              <div className={styles.imageContainer}>
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={styles.image}
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>{item.name}</div>
                )}
              </div>
            </Link>
            <div className={styles.info}>
              <h3>{item.name}</h3>
              <p className={styles.price}>₹{item.price.toLocaleString()}</p>
              <button
                className={styles.addToCart}
                onClick={() => {
                  addItem({
                    id: item.productId,
                    name: item.name,
                    price: item.price,
                    images: [item.image],
                    category: '',
                    isHandloom: true,
                    inStock: true,
                    description: '',
                  });
                  removeItem(item.productId);
                }}
              >
                Move to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
