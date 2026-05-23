'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import styles from './cart.module.css';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, shippingCost, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <h2>Your Cart is Empty</h2>
        <p>Looks like you have not added any items to your cart yet.</p>
        <Link href="/shop" className={styles.shopButton}>Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className={styles.cartContainer}>
      <h1>Shopping Cart ({items.length} item{items.length !== 1 ? 's' : ''})</h1>

      <div className={styles.cartContent}>
        <div className={styles.cartItems}>
          {items.map((item) => (
            <div key={item.id} className={styles.cartItem}>
              <div className={styles.itemImage}>
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="150px"
                    className={styles.image}
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>{item.name}</div>
                )}
              </div>

              <div className={styles.itemDetails}>
                <h3>{item.name}</h3>
                <p className={styles.itemPrice}>₹{item.price.toLocaleString()}</p>

                <div className={styles.itemActions}>
                  <div className={styles.quantityControl}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.itemTotal}>
                <p className={styles.totalPrice}>
                  ₹{(item.price * item.quantity).toLocaleString()}
                </p>
                <button
                  className={styles.removeButton}
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <button className={styles.clearCart} onClick={clearCart}>
            Clear Cart
          </button>
        </div>

        <div className={styles.orderSummary}>
          <h2>Order Summary</h2>
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Shipping</span>
            <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span>
          </div>
          {shippingCost > 0 && (
            <p className={styles.freeShippingNote}>Free shipping on orders above ₹5,000</p>
          )}
          <hr />
          <div className={styles.summaryRow}>
            <span className={styles.totalLabel}>Total</span>
            <span className={styles.totalValue}>₹{total.toLocaleString()}</span>
          </div>
          <Link href="/checkout" className={styles.checkoutButton}>
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}