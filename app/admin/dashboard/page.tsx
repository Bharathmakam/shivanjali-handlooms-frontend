'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAdminDashboardStats } from '@/lib/api';
import type { Order } from '@/types';
import { StatCard, SectionHeader, EmptyState, QuickActions, DataTable, StatusBadge, LoadingState } from '@/components/ui';
import type { Column } from '@/components/ui/DataTable';
import styles from './dashboard.module.css';

type AdminStats = Awaited<ReturnType<typeof getAdminDashboardStats>>;
type TopProduct = AdminStats['topProducts'][number];

function RevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;
    const padding = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 800;
    const height = 300;
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    const maxRevenue = Math.max(...data.map((d) => d.revenue), 0);
    const minRevenue = Math.min(...data.map((d) => d.revenue), 0);
    const revenueRange = maxRevenue - minRevenue || 1;

    const points = data.map((d, i) => ({
      x: padding.left + (data.length > 1 ? (i / (data.length - 1)) * innerWidth : innerWidth / 2),
      y: padding.top + innerHeight - ((d.revenue - minRevenue) / revenueRange) * innerHeight,
      ...d,
    }));

    const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

    const yTicks = 5;
    const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => {
      const val = minRevenue + (revenueRange / yTicks) * i;
      return Math.round(val);
    });

    return { points, polylinePoints, yTickValues, padding, width, height, innerWidth, innerHeight, minRevenue, revenueRange };
  }, [data]);

  if (!chartData) return null;

  const { points, polylinePoints, yTickValues, padding, width, height, innerHeight, minRevenue, revenueRange } = chartData;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={styles.chartSvg}>
      {/* Grid lines */}
      {yTickValues.map((val, i) => {
        const y = padding.top + innerHeight - ((val - minRevenue) / revenueRange) * innerHeight;
        return (
          <g key={`grid-${i}`}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              className={styles.chartGridLine}
            />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" className={styles.chartAxisLabel}>
              ₹{val.toLocaleString()}
            </text>
          </g>
        );
      })}

      {/* X-axis labels */}
      {points.map((p, i) => (
        <text key={`x-${i}`} x={p.x} y={height - 8} textAnchor="middle" className={styles.chartAxisLabel}>
          {new Date(p.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
        </text>
      ))}

      {/* Line */}
      <polyline points={polylinePoints} className={styles.chartLine} />

      {/* Dots */}
      {points.map((p, i) => (
        <circle key={`dot-${i}`} cx={p.x} cy={p.y} r={4} className={styles.chartDot} />
      ))}

      {/* Value labels on dots */}
      {points.map((p, i) => (
        <text key={`val-${i}`} x={p.x} y={p.y - 10} textAnchor="middle" className={styles.chartTooltip}>
          ₹{p.revenue.toLocaleString()}
        </text>
      ))}
    </svg>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getAdminDashboardStats();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  const orderColumns: Column<Order>[] = [
    { key: 'orderId', header: 'Order ID', render: (o) => <span className={styles.orderId}>{o.id?.slice(0, 8)}...</span> },
    { key: 'customerName', header: 'Customer', render: (o) => o.customerName || o.email || 'N/A' },
    { key: 'total', header: 'Total', render: (o) => `₹${o.total?.toLocaleString()}` },
    { key: 'paymentMethod', header: 'Payment' },
    { key: 'status', header: 'Status', render: (o) => <StatusBadge status={o.status?.toLowerCase()} /> },
    { key: 'createdAt', header: 'Date', render: (o) => new Date(o.createdAt).toLocaleDateString() },
  ];

  const productColumns: Column<TopProduct>[] = [
    { key: 'name', header: 'Product' },
    { key: 'count', header: 'Units Sold' },
    { key: 'revenue', header: 'Revenue', render: (p) => `₹${p.revenue.toLocaleString()}` },
  ];

  return (
    <div className={styles.container}>
      <h1>Admin Dashboard</h1>

      <div className={styles.statsGrid}>
        <StatCard icon="📦" label="Total Orders" value={stats?.totalOrders || 0} />
        <StatCard icon="🛍️" label="Products" value={stats?.totalProducts || 0} />
        <StatCard icon="👥" label="Customers" value={stats?.totalCustomers || 0} />
        <StatCard icon="💰" label="Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} />
      </div>

      <div className={styles.statsGrid}>
        <StatCard icon="⏳" label="Pending" value={stats?.pendingOrders || 0} />
        <StatCard icon="✅" label="Confirmed" value={stats?.confirmedOrders || 0} />
        <StatCard icon="🚚" label="Shipped" value={stats?.shippedOrders || 0} />
        <StatCard icon="📬" label="Delivered" value={stats?.deliveredOrders || 0} />
      </div>

      {(stats?.revenueChartData?.length ?? 0) > 0 && (
        <div className={styles.chartSection}>
          <SectionHeader title="Revenue Trend" />
          <div className={styles.chartWrapper}>
            <RevenueChart data={stats!.revenueChartData} />
          </div>
        </div>
      )}

      {(stats?.topProducts?.length ?? 0) > 0 && (
        <div className={styles.topProducts}>
          <SectionHeader title="Top Products" />
          <DataTable columns={productColumns} data={stats!.topProducts} />
        </div>
      )}

      <div className={styles.recentOrders}>
        <SectionHeader
          title="Recent Orders"
          actionLabel="View All →"
          actionHref="/admin/orders"
        />

        {stats?.recentOrders?.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No orders yet"
            description="Orders will appear here once customers start purchasing."
          />
        ) : (
          <DataTable columns={orderColumns} data={stats?.recentOrders || []} />
        )}
      </div>

      <QuickActions
        actions={[
          { label: '+ Add Product', icon: '', href: '/admin/products' },
          { label: 'Manage Orders', icon: '', href: '/admin/orders' },
          { label: 'View Store', icon: '', href: '/shop' },
        ]}
      />
    </div>
  );
}