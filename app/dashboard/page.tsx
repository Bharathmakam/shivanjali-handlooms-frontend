'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUserDashboardStats, getUserProfile, updateUserProfile } from '@/lib/api';
import type { Order } from '@/types';
import { StatCard, SectionHeader, EmptyState, QuickActions, ProfileCard, OrderCard, LoadingState } from '@/components/ui';
import styles from './dashboard.module.css';

type UserStats = Awaited<ReturnType<typeof getUserDashboardStats>>;

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getUserProfile>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    async function loadData() {
      try {
        const [statsData, profileData] = await Promise.all([
          getUserDashboardStats(),
          getUserProfile(),
        ]);
        setStats(statsData);
        setProfile(profileData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, router]);

  const handleProfileUpdate = async (data: { firstName: string; lastName: string; phone: string }) => {
    const updated = await updateUserProfile(data);
    setProfile(updated);
    localStorage.setItem('user', JSON.stringify({ ...user, ...updated }));
  };

  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Welcome, {profile?.firstName || user?.firstName || 'User'}</h1>
        <button className={styles.logoutBtn} onClick={() => { logout(); router.push('/'); }}>
          Logout
        </button>
      </div>

      <div className={styles.statsGrid}>
        <StatCard icon="📦" label="Total Orders" value={stats?.totalOrders || 0} />
        <StatCard icon="⏳" label="Pending" value={stats?.pendingOrders || 0} />
        <StatCard icon="✅" label="Delivered" value={stats?.completedOrders || 0} />
        <StatCard icon="💰" label="Total Spent" value={`₹${(stats?.totalSpent || 0).toLocaleString()}`} />
      </div>

      {profile && (
        <ProfileCard
          profile={profile}
          onUpdate={handleProfileUpdate}
          className={styles.profileSection}
        />
      )}

      <div className={styles.recentOrders}>
        <SectionHeader
          title="Recent Orders"
          actionLabel="View All →"
          actionHref="/orders"
        />

        {stats?.recentOrders?.length === 0 ? (
          <EmptyState
            icon="🛍️"
            title="No orders yet"
            description="Start shopping to see your orders here."
            actionLabel="Shop Now"
            actionHref="/shop"
          />
        ) : (
          <div className={styles.ordersList}>
            {stats?.recentOrders?.map((order: Order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      <QuickActions
        actions={[
          { label: 'Shop Now', icon: '🛍️', href: '/shop' },
          { label: 'My Orders', icon: '📋', href: '/orders' },
          { label: 'My Wishlist', icon: '♥', href: '/wishlist' },
        ]}
      />
    </div>
  );
}
