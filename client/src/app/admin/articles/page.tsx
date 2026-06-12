'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { CapyLoader } from '@/components/ui/CapyLoader';
import styles from './Articles.module.css';

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: { name: string } | null;
  author: { name: string } | null;
  createdAt: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const data = await api.get<Article[]>('/articles');
      setArticles(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await api.delete(`/articles/${id}`, { auth: true });
      fetchArticles();
    } catch (err: any) {
      alert(err.message || 'Error deleting article');
    }
  };

  const getStatusClass = (status: string) => {
    if (status === 'published') return styles.statusPublished;
    if (status === 'archived') return styles.statusArchived;
    return styles.statusDraft;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Articles</h1>
        <Button onClick={() => router.push('/admin/articles/new')}>Write Article</Button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <CapyLoader />
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Author</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id}>
                  <td>{article.title}</td>
                  <td>{article.category?.name || 'Uncategorized'}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(article.status)}`}>
                      {article.status}
                    </span>
                  </td>
                  <td>{article.author?.name || 'Unknown'}</td>
                  <td>{new Date(article.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actions}>
                      <Button variant="secondary" size="sm" onClick={() => router.push(`/admin/articles/${article.id}`)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(article.id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {articles.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                    No articles found. Create one to get started.
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
