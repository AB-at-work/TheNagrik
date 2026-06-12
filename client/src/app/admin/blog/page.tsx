'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { CapyLoader } from '@/components/ui/CapyLoader';
import styles from './BlogAdmin.module.css';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: { name: string } | null;
  author: { name: string } | null;
  createdAt: string;
}

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await api.get<BlogPost[]>('/blog/admin/all');
      setPosts(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/blog/admin/${id}`);
      fetchPosts();
    } catch (err: any) {
      alert(err.message || 'Error deleting post');
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
        <h1 className={styles.title}>Blog Posts</h1>
        <Button onClick={() => router.push('/admin/blog/new')}>Write Post</Button>
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
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>{post.title}</td>
                  <td>{post.category?.name || 'Uncategorized'}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(post.status)}`}>
                      {post.status}
                    </span>
                  </td>
                  <td>{post.author?.name || 'Unknown'}</td>
                  <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actions}>
                      <Button variant="secondary" size="sm" onClick={() => router.push(`/admin/blog/${post.id}`)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(post.id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                    No blog posts found. Create one to get started.
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
