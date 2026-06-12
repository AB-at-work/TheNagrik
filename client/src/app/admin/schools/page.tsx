'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { CapyLoader } from '@/components/ui/CapyLoader';
import styles from './SchoolsAdmin.module.css';

interface SchoolSession {
  id: string;
  title: string;
  slug: string;
  schoolName: string;
  status: string;
  sessionDate: string;
}

export default function SchoolsAdminPage() {
  const [sessions, setSessions] = useState<SchoolSession[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await api.get<SchoolSession[]>('/schools/admin/all');
      setSessions(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    try {
      await api.delete(`/schools/admin/${id}`);
      fetchSessions();
    } catch (err: any) {
      alert(err.message || 'Error deleting session');
    }
  };

  const getStatusClass = (status: string) => {
    if (status === 'published') return styles.statusPublished;
    return styles.statusDraft;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>School Outreach Sessions</h1>
        <Button onClick={() => router.push('/admin/schools/new')}>Log Session</Button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <CapyLoader />
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>School</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td>{session.title}</td>
                  <td>{session.schoolName}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(session.status)}`}>
                      {session.status}
                    </span>
                  </td>
                  <td>{session.sessionDate ? new Date(session.sessionDate).toLocaleDateString() : '—'}</td>
                  <td>
                    <div className={styles.actions}>
                      <Button variant="secondary" size="sm" onClick={() => router.push(`/admin/schools/${session.id}`)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(session.id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                    No sessions found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
