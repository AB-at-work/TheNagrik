'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import Link from 'next/link';
import styles from './Dashboard.module.css';

import { CapyLoader } from '@/components/ui/CapyLoader';

type DashboardMetrics = {
  totalArticles: number;
  totalBlogPosts: number;
  totalProjects: number;
  totalSchoolSessions: number;
  status: {
    database: 'online' | 'offline';
    storage: 'online' | 'offline' | 'unconfigured';
    search: 'updated' | 'pending';
  };
};

export default function AdminDashboardPage() {
  const { data: metrics, error, isLoading } = useSWR<DashboardMetrics>(
    '/api/v1/dashboard/metrics',
    (url: string) => api.get<DashboardMetrics>(url),
    {
      shouldRetryOnError: false,
      revalidateOnFocus: true
    }
  );

  // Determine status indicators dynamically
  const isDbOnline = !error && metrics;
  
  const dbStatus = isLoading 
    ? 'checking' 
    : isDbOnline 
      ? 'online' 
      : 'offline';

  const storageStatus = isLoading 
    ? 'checking' 
    : error 
      ? 'offline' 
      : metrics?.status?.storage || 'unconfigured';

  const searchStatus = isLoading 
    ? 'checking' 
    : error 
      ? 'offline' 
      : 'updated';

  if (isLoading) {
    return <CapyLoader />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Overview of your platform's content and activity.</p>
      </div>

      <div className={styles.metricsGrid}>
        {/* Metric Card - Learn Articles */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <h3 className={styles.metricLabel}>Learn Articles</h3>
            <span className={styles.metricIcon}>A</span>
          </div>
          <div className={styles.metricValue}>
            {isLoading ? '...' : metrics?.totalArticles ?? 0}
          </div>
          <Link href="/admin/articles" className={styles.metricLink}>
            Manage Articles &rarr;
          </Link>
        </div>

        {/* Metric Card - Blog Posts */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <h3 className={styles.metricLabel}>Blog Posts</h3>
            <span className={styles.metricIcon}>B</span>
          </div>
          <div className={styles.metricValue}>
            {isLoading ? '...' : metrics?.totalBlogPosts ?? 0}
          </div>
          <Link href="/admin/blog" className={styles.metricLink}>
            Manage Blog &rarr;
          </Link>
        </div>

        {/* Metric Card - Projects */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <h3 className={styles.metricLabel}>Projects</h3>
            <span className={styles.metricIcon}>P</span>
          </div>
          <div className={styles.metricValue}>
            {isLoading ? '...' : metrics?.totalProjects ?? 0}
          </div>
          <Link href="/admin/projects" className={styles.metricLink}>
            Manage Projects &rarr;
          </Link>
        </div>

        {/* Metric Card - School Sessions */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <h3 className={styles.metricLabel}>School Sessions</h3>
            <span className={styles.metricIcon}>🎓</span>
          </div>
          <div className={styles.metricValue}>
            {isLoading ? '...' : metrics?.totalSchoolSessions ?? 0}
          </div>
          <Link href="/admin/schools" className={styles.metricLink}>
            Manage Sessions &rarr;
          </Link>
        </div>
      </div>

      <div className={styles.detailsGrid}>
        <div className={styles.actionsCard}>
          <h2 className={styles.actionsTitle}>Quick Actions</h2>
          <div className={styles.actionsButtonGrid}>
            <Link href="/admin/blog/new" className={styles.actionButton}>New Blog Post</Link>
            <Link href="/admin/schools/new" className={styles.actionButton}>Log School Session</Link>
            <Link href="/admin/audit" className={styles.actionButton}>View Audit Logs</Link>
          </div>
        </div>

        <div className={styles.statusCard}>
          <h2 className={styles.statusTitle}>System Status</h2>
          <ul className={styles.statusList}>
            <li className={styles.statusItem}>
              <span className={styles.statusLabel}>Database Connection</span>
              <span className={`${styles.statusBadge} ${styles[dbStatus]}`}>
                <span className={styles.statusIndicator}></span> 
                {dbStatus === 'checking' ? 'Checking...' : dbStatus === 'online' ? 'Online' : 'Offline'}
              </span>
            </li>
            <li className={styles.statusItem}>
              <span className={styles.statusLabel}>Media Storage</span>
              <span className={`${styles.statusBadge} ${styles[storageStatus]}`}>
                <span className={styles.statusIndicator}></span> 
                {storageStatus === 'checking' ? 'Checking...' : storageStatus === 'online' ? 'Online' : storageStatus === 'unconfigured' ? 'Unconfigured' : 'Offline'}
              </span>
            </li>
            <li className={styles.statusItem}>
              <span className={styles.statusLabel}>Search Index</span>
              <span className={`${styles.statusBadge} ${styles[searchStatus]}`}>
                <span className={styles.statusIndicator}></span> 
                {searchStatus === 'checking' ? 'Checking...' : searchStatus === 'updated' ? 'Updated' : 'Offline'}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
