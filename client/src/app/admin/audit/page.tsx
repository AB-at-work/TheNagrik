'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import { useState } from 'react';
import type { PaginatedResponse } from '@thenagrik/shared';
import styles from './Audit.module.css';

// Temporary inline types
type AuditLogDTO = {
  id: string;
  action: 'create' | 'update' | 'delete';
  entityType: string;
  entityId: string | null;
  entityTitle: string | null;
  changes: any | null;
  userId: string | null;
  userEmail: string;
  createdAt: string;
};

export default function AdminAuditPage() {
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');

  const { data, isLoading } = useSWR<PaginatedResponse<AuditLogDTO>>(
    () => {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (entityType) params.append('entityType', entityType);
      if (action) params.append('action', action);
      return `/api/v1/audit?${params.toString()}`;
    },
    (url: string) => api.get<PaginatedResponse<AuditLogDTO>>(url)
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Audit Logs</h1>
        
        <div className={styles.filters}>
          <select 
            className={styles.select}
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(1); }}
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>
          
          <select 
            className={styles.select}
            value={entityType}
            onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
          >
            <option value="">All Entities</option>
            <option value="article">Article</option>
            <option value="setting">Setting</option>
            <option value="user">User</option>
            <option value="media">Media</option>
          </select>
        </div>
      </div>

      <div className={styles.card}>
        {isLoading ? (
          <div className={styles.message}>Loading logs...</div>
        ) : !data || data.data.length === 0 ? (
          <div className={styles.message}>No audit logs found.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  <th className={styles.th}>Timestamp</th>
                  <th className={styles.th}>User</th>
                  <th className={styles.th}>Action</th>
                  <th className={styles.th}>Entity</th>
                  <th className={styles.th}>Details</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((log) => (
                  <tr key={log.id} className={styles.tr}>
                    <td className={`${styles.td} ${styles.timestamp}`}>
                      {formatDate(log.createdAt)}
                    </td>
                    <td className={styles.td}>
                      <div className={styles.userEmail}>{log.userEmail}</div>
                      {log.userId && <div className={styles.userId}>{log.userId}</div>}
                    </td>
                    <td className={styles.td}>
                      <span className={`${styles.badge} ${
                        log.action === 'create' ? styles.badgeCreate :
                        log.action === 'update' ? styles.badgeUpdate :
                        styles.badgeDelete
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.entityType}>{log.entityType}</div>
                      {log.entityTitle && <div className={styles.entityTitle}>{log.entityTitle}</div>}
                    </td>
                    <td className={`${styles.td} ${styles.changes}`} title={log.changes ? JSON.stringify(log.changes) : ''}>
                      {log.changes ? JSON.stringify(log.changes) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data && data.meta.last_page > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={styles.prevNextBtn}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {page} of {data.meta.last_page}
          </span>
          <button
            onClick={() => setPage(p => Math.min(data.meta.last_page, p + 1))}
            disabled={page === data.meta.last_page}
            className={styles.prevNextBtn}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
