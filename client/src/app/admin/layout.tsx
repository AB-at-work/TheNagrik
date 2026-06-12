'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Menu, X, Inbox } from 'lucide-react';
import { clsx } from '@/lib/utils';
import styles from './AdminLayout.module.css';

import { CapyLoader } from '@/components/ui/CapyLoader';

const ADMIN_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/content', label: 'Content', icon: FileText },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    // If not loading and no user, redirect to login unless already on login page
    if (!isLoading && !user && !pathname?.includes('/admin/login')) {
      router.push('/admin/login');
    }
  }, [user, isLoading, pathname, router]);

  // Close sidebar on route change on mobile
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Prevent flashing admin layout while checking auth
  if (isLoading) {
    return <CapyLoader fullScreen />;
  }

  // If unauthenticated and on login page, just render children
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className={styles.layout}>
      {/* Mobile Header */}
      <header className={styles.mobileHeader}>
        <Link href="/admin" className={styles.logo}>
          The Nagrik Admin
        </Link>
        <button
          className={styles.mobileToggle}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle Sidebar"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={clsx(styles.sidebar, isSidebarOpen && styles.sidebarOpen)}>
        <div className={styles.sidebarHeader}>
          <Link href="/admin" className={styles.logoDesktop}>
            The Nagrik Admin
          </Link>
        </div>

        <nav className={styles.nav}>
          {ADMIN_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = link.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(styles.navLink, isActive && styles.activeNavLink)}
              >
                <Icon size={20} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user.name}</div>
            <div className={styles.userRole}>{user.role.replace('_', ' ')}</div>
          </div>
          <button className={styles.logoutButton} onClick={logout}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.contentContainer}>
          {children}
        </div>
      </main>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className={styles.overlay} 
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
