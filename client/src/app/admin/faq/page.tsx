'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { CapyLoader } from '@/components/ui/CapyLoader';
import styles from './FaqAdmin.module.css';

interface Faq {
  id: string;
  question: string;
  category: string;
  isActive: boolean;
  orderIndex: number;
}

export default function FaqAdminPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const data = await api.get<Faq[]>('/faq/admin/all');
      setFaqs(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await api.delete(`/faq/admin/${id}`);
      fetchFaqs();
    } catch (err: any) {
      alert(err.message || 'Error deleting FAQ');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Frequently Asked Questions</h1>
        <Button onClick={() => router.push('/admin/faq/new')}>Add FAQ</Button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <CapyLoader />
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Category</th>
                <th>Question</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((faq) => (
                <tr key={faq.id}>
                  <td>{faq.orderIndex}</td>
                  <td>{faq.category || 'General'}</td>
                  <td>{faq.question}</td>
                  <td>
                    <span className={faq.isActive ? styles.activeStatus : styles.inactiveStatus}>
                      {faq.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Button variant="secondary" size="sm" onClick={() => router.push(`/admin/faq/${faq.id}`)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(faq.id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {faqs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                    No FAQs found. Create one to get started.
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
