"use client";

import { useState, useEffect } from "react";
import { getAllOrders, updateOrderStatus } from "@/lib/api";
import type { Order } from "@/types";
import styles from "./orders.module.css";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await getAllOrders();
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    void loadOrders();
  }, []);

  const updateOrderStatusApi = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status: newStatus as Order["status"] }
            : order,
        ),
      );
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = !filterStatus || order.status === filterStatus;
    const matchesEmail =
      !searchEmail ||
      order.email?.toLowerCase().includes(searchEmail.toLowerCase());
    return matchesStatus && matchesEmail;
  });

  if (loading) {
    return <div className={styles.loading}>Loading orders...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Orders ({orders.length})</h1>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search by email..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          className={styles.searchInput}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <p className={styles.empty}>No orders found.</p>
      ) : (
        <div className={styles.ordersList}>
          {filteredOrders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div>
                  <span className={styles.orderId}>
                    #{order.id.slice(0, 8)}
                  </span>
                  <span className={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span
                  className={`${styles.badge} ${styles[order.status?.toLowerCase()]}`}
                >
                  {order.status}
                </span>
              </div>

              <div className={styles.orderBody}>
                <div className={styles.orderInfo}>
                  <p>
                    <strong>Customer:</strong>{" "}
                    {order.customerName || order.email || "N/A"}
                  </p>
                  <p>
                    <strong>Payment:</strong>{" "}
                    {order.paymentMethod === "RAZORPAY" ? "Online" : "COD"}
                  </p>
                  <p>
                    <strong>Items:</strong> {order.items?.length || 0}
                  </p>
                  <p>
                    <strong>Total:</strong> ₹
                    {order.total?.toLocaleString() || "0"}
                  </p>
                </div>

                <div className={styles.orderActions}>
                  <label>Update Status:</label>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateOrderStatusApi(order.id, e.target.value)
                    }
                    disabled={updatingId === order.id}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.orderItems}>
                {order.items?.map((item, idx) => (
                  <span key={idx} className={styles.itemTag}>
                    {item.name} × {item.quantity || 1}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
