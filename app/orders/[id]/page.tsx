'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOrderById, cancelOrder } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { Order } from '@/types';
import styles from './tracking.module.css';

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleCancelOrder = async () => {
    setShowCancelConfirm(false);
    if (!order) return;
    setCancelling(true);
    setCancelMessage(null);
    try {
      const updated = await cancelOrder(order.id);
      setOrder(updated);
      setCancelMessage({ type: 'success', text: 'Order cancelled successfully.' });
    } catch (err: unknown) {
      setCancelMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to cancel order.' });
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    async function loadOrder() {
      if (!params?.id) return;
      try {
        const data = await getOrderById(params.id as string);
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [params?.id, user, router]);

  if (loading) {
    return <div className={styles.loading}>Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className={styles.notFound}>
        <h2>Order Not Found</h2>
        <Link href="/orders" className={styles.backLink}>Back to Orders</Link>
      </div>
    );
  }

  const statusSteps = [
    { key: 'PENDING', label: 'Order Placed' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb}>
        <Link href="/orders">My Orders</Link>
        <span>/</span>
        <span>Order {order.id.slice(0, 8)}...</span>
      </nav>

      <h1>Order Tracking</h1>

      <div className={styles.statusTracker}>
        <div className={styles.steps}>
          {statusSteps.map((step, index) => (
            <div
              key={step.key}
              className={`${styles.step} ${index <= currentStepIndex ? styles.stepActive : ''}`}
            >
              <div className={styles.stepCircle}>
                {index < currentStepIndex ? '✓' : index + 1}
              </div>
              <span className={styles.stepLabel}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.orderDetails}>
        <div className={styles.section}>
          <h2>Order Information</h2>
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Status:</strong> <span className={`${styles.badge} ${styles[order.status.toLowerCase()]}`}>{order.status}</span></p>
          <p><strong>Payment:</strong> {order.paymentMethod === 'RAZORPAY' ? 'Online (Razorpay)' : 'Cash on Delivery'}</p>
          {order.razorpayPaymentId && <p><strong>Payment ID:</strong> {order.razorpayPaymentId}</p>}
        </div>

        <div className={styles.section}>
          <h2>Items</h2>
          {order.items.map((item, idx) => (
            <div key={idx} className={styles.item}>
              <span>{item.name} {item.fallPico ? '+ Fall & Pico' : ''}</span>
              <span>₹{((item.price + item.fallPicoPrice) * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className={styles.section}>
          <h2>Shipping Address</h2>
          <p>{order.shippingAddress.name}</p>
          <p>{order.shippingAddress.address}</p>
          <p>{order.shippingAddress.pinCode}</p>
          <p>Phone: {order.shippingAddress.phone}</p>
        </div>

        <div className={styles.section}>
          <h2>Order Total</h2>
          <div className={styles.totals}>
            <p>Subtotal: <span>₹{order.subtotal.toLocaleString()}</span></p>
            <p>GST: <span>₹{order.gst.toLocaleString()}</span></p>
            <hr />
            <p className={styles.grandTotal}>Total: <span>₹{order.total.toLocaleString()}</span></p>
          </div>
        </div>
      </div>

      {cancelMessage && (
        <div style={{
          textAlign: 'center',
          padding: '1rem',
          margin: '1rem 0',
          borderRadius: '0.5rem',
          background: cancelMessage.type === 'success' ? '#ecfdf5' : '#fef2f2',
          color: cancelMessage.type === 'success' ? '#065f46' : '#991b1b',
          border: `1px solid ${cancelMessage.type === 'success' ? '#6ee7b7' : '#fca5a5'}`,
          fontSize: '0.9rem',
        }}>
          {cancelMessage.text}
        </div>
      )}

      {showCancelConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{ fontFamily: 'var(--font-playfair), serif', color: '#2d1b0e', margin: '0 0 1rem' }}>Cancel Order?</h3>
            <p style={{ color: '#6b5b4f', margin: '0 0 1.5rem', fontSize: '0.9rem' }}>
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => setShowCancelConfirm(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #1a1a1a',
                  background: 'transparent',
                  color: '#1a1a1a',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  background: '#ef4444',
                  color: '#ffffff',
                  cursor: cancelling ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  opacity: cancelling ? 0.6 : 1,
                }}
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.actions}>
        {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
          <button
            onClick={() => setShowCancelConfirm(true)}
            disabled={cancelling}
            className={styles.cancelButton}
          >
            Cancel Order
          </button>
        )}
        <Link href="/orders" className={styles.backButton}>
          ← Back to Orders
        </Link>
        <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className={styles.supportButton}>
          Contact Support
        </a>
      </div>
    </div>
  );
}
