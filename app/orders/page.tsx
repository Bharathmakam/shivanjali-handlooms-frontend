'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUserOrders } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { Order } from '@/types';
import styles from './orders.module.css';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    async function loadOrders() {
      try {
        const data = await getUserOrders();
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [user, router]);

  if (loading) return <div className={styles.loading}>Loading your orders...</div>;

  return (
    <div className={styles.container}>
      <h1>My Order History</h1>
      {orders.length === 0 ? (
        <p className={styles.empty}>
          You haven&apos;t placed any orders yet.{' '}
          <Link href="/shop">Start shopping!</Link>
        </p>
      ) : (
        <div className={styles.orderList}>
          {orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div>
                  <p className={styles.label}>ORDER ID</p>
                  <p className={styles.value}>{order.id}</p>
                </div>
                <div>
                  <p className={styles.label}>DATE</p>
                  <p className={styles.value}>{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className={styles.label}>TOTAL</p>
                  <p className={styles.value}>₹{order.total.toLocaleString()}</p>
                </div>
                <div>
                  <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className={styles.orderBody}>
                <h3>Items</h3>
                <ul className={styles.itemList}>
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.name} {item.fallPico ? '(with Fall & Pico)' : ''} — ₹{item.price} × {item.quantity}
                    </li>
                  ))}
                </ul>
                <div className={styles.shippingInfo}>
                  <p><strong>Payment:</strong> {order.paymentMethod === 'RAZORPAY' ? 'Online' : 'Cash on Delivery'}</p>
                  <p><strong>Address:</strong> {order.shippingAddress.address}, {order.shippingAddress.pinCode}</p>
                </div>
                <Link href={`/orders/${order.id}`} className={styles.trackLink}>
                  Track Order →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
