"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./admin-layout.module.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginRoute = pathname === "/admin";
  const [authenticated, setAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Read from localStorage AFTER mounting to avoid hydration mismatch
  useEffect(() => {
    const isAdminAuth = localStorage.getItem("adminAuthenticated") === "true";
    setAuthenticated(isAdminAuth);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoginRoute && !authenticated) {
      router.push("/admin");
    }
  }, [mounted, authenticated, isLoginRoute, router]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "admin_token=; path=/admin; max-age=0";
    setAuthenticated(false);
    router.push("/admin");
  };

  if (isLoginRoute) {
    return <>{children}</>;
  }

  // Don't render admin layout until we know auth state (prevents hydration mismatch + flash)
  if (!mounted) {
    return null;
  }

  if (!authenticated) {
    return null;
  }

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/admin/products", label: "Products", icon: "🛍️" },
    { href: "/admin/orders", label: "Orders", icon: "📦" },
  ];

  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Shivanjali</h2>
          <span>Admin Panel</span>
        </div>
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.navItemActive : ""}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <Link href="/" className={styles.viewSite}>
            View Site →
          </Link>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}