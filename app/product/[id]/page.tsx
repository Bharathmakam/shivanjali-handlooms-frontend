'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWishlist } from '@/context/WishlistContext';
import Image from 'next/image';
import Link from 'next/link';
import { getProductById } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types';
import styles from './product.module.css';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const { addItem: addWishlistItem, removeItem: removeWishlistItem, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!params?.id) return;
      setLoading(true);
      try {
        const data = await getProductById(params.id as string);
        setProduct(data);
      } catch (err) {
        console.error(err);
        router.push('/shop');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [params?.id, router]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonImage}></div>
          <div className={styles.skeletonText}>
            <div className={styles.skeletonLine}></div>
            <div className={styles.skeletonLine}></div>
            <div className={styles.skeletonLineShort}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.notFound}>
        <h2>Product Not Found</h2>
        <Link href="/shop" className={styles.backLink}>Back to Shop</Link>
      </div>
    );
  }

  const totalPrice = product.price * quantity;

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className={styles.productContainer}>
      <nav className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/shop">Shop</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <div className={styles.productContent}>
        <div className={styles.imageGallery}>
          <div className={styles.mainImage}>
            {product.images?.[selectedImage] ? (
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={styles.image}
                priority
              />
            ) : (
              <div className={styles.imagePlaceholder}>{product.name}</div>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className={styles.thumbnails}>
              {product.images.map((img, index) => (
                <button
                  key={index}
                  className={`${styles.thumbnail} ${selectedImage === index ? styles.thumbnailActive : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <Image
                    src={img}
                    alt={`${product.name} - Image ${index + 1}`}
                    fill
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.productInfo}>
          <h1>{product.name}</h1>
          <p className={styles.price}>₹{product.price.toLocaleString()}</p>

          <div className={styles.description}>
            <p>{product.description}</p>
          </div>

          {product.category && (
            <div className={styles.badge}>{product.category}</div>
          )}

          <div className={styles.details}>
            {product.fabric && (
              <p><strong>Fabric:</strong> {product.fabric}</p>
            )}
            {product.weaveType && (
              <p><strong>Weave:</strong> {product.weaveType}</p>
            )}
            {product.color && (
              <p><strong>Color:</strong> {product.color}</p>
            )}
            {product.occasion && (
              <p><strong>Occasion:</strong> {product.occasion}</p>
            )}
            {product.length && (
              <p><strong>Length:</strong> {product.length}</p>
            )}
            {product.weight && (
              <p><strong>Weight:</strong> {product.weight}</p>
            )}
            {product.blouseIncluded && (
              <p><strong>Blouse:</strong> Included</p>
            )}
          </div>

          <div className={styles.quantitySelector}>
            <label>Quantity:</label>
            <div className={styles.quantityControl}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                disabled={product.stockQuantity ? quantity >= product.stockQuantity : false}
              >
                +
              </button>
            </div>
          </div>

          <button
            className={styles.addToCartButton}
            onClick={handleAddToCart}
            disabled={added || !product.inStock}
          >
            {added ? 'Added to Cart!' : !product.inStock ? 'Out of Stock' : 'Add to Cart'}
          </button>

          <button
            className={styles.wishlistButton}
            onClick={() => {
              if (isInWishlist(product.id)) {
                removeWishlistItem(product.id);
              } else {
                addWishlistItem(product);
              }
            }}
          >
            {isInWishlist(product.id) ? '♥ In Wishlist' : '♡ Add to Wishlist'}
          </button>

          <p className={styles.totalPrice}>
            Total: ₹{totalPrice.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}