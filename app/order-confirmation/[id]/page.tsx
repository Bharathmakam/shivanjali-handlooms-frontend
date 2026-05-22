'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOrderById } from '@/lib/api';
import type { Order } from '@/types';
import styles from './confirmation.module.css';

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      if (!params?.id) return;
      try {
        const data = await getOrderById(params.id as string);
        setOrder(data);
      } catch (err) {
        console.error(err);
        router.push('/');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [params?.id, router]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.error}>
        <h2>Order Not Found</h2>
        <Link href="/" className={styles.homeLink}>Go Home</Link>
      </div>
    );
  }

  const statusSteps = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className={styles.container}>
      <div className={styles.successHeader}>
        <div className={styles.checkmark}>✓</div>
        <h1>Order Confirmed!</h1>
        <p>Thank you for your purchase. Your order has been placed successfully.</p>
        <p className={styles.orderId}>Order ID: {order.id}</p>
      </div>

      <div className={styles.orderContent}>
        <div className={styles.statusTracker}>
          <h2>Order Status</h2>
          <div className={styles.steps}>
            {statusSteps.map((step, index) => (
              <div
                key={step}
                className={`${styles.step} ${index <= currentStepIndex ? styles.stepActive : ''}`}
              >
                <div className={styles.stepCircle}>
                  {index < currentStepIndex ? '✓' : index + 1}
                </div>
                <span className={styles.stepLabel}>{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.orderDetails}>
          <div className={styles.section}>
            <h2>Items</h2>
            {order.items.map((item) => (
              <div key={item.id || item.productId} className={styles.item}>
                <span>{item.name} {item.fallPico ? '+ Fall/Pico' : ''} × {item.quantity}</span>
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
            <h2>Payment</h2>
            <p>Method: {order.paymentMethod === 'RAZORPAY' ? 'Online Payment' : 'Cash on Delivery'}</p>
            {order.razorpayPaymentId && <p>Payment ID: {order.razorpayPaymentId}</p>}
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

        <div className={styles.actions}>
          <Link href="/orders" className={styles.trackButton}>
            View All Orders
          </Link>
          <Link href="/shop" className={styles.shopButton}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
