'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { CapyLoader } from '@/components/ui/CapyLoader';
import styles from './BlogEditor.module.css';

interface Category {
  id: string;
  name: string;
}

interface BlogPost {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  featuredImageUrl: string | null;
  status: string;
  metaTitle: string | null;
  metaDescription: string | null;
}

export default function BlogEditorPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    slug: '',
    excerpt: '',
    body: '',
    featuredImageUrl: '',
    status: 'draft',
    metaTitle: '',
    metaDescription: '',
  });

  useEffect(() => {
    // Load categories (blog can share same categories, or separate, currently shared in schema)
    api.get<Category[]>('/categories').then(setCategories).catch(console.error);

    if (!isNew) {
      api.get<BlogPost>(`/blog/admin/${params.id}`)
        .then((data) => {
          setFormData({
            categoryId: data.categoryId || '',
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt || '',
            body: data.body,
            featuredImageUrl: data.featuredImageUrl || '',
            status: data.status,
            metaTitle: data.metaTitle || '',
            metaDescription: data.metaDescription || '',
          });
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          alert('Failed to load blog post');
          router.push('/admin/blog');
        });
    }
  }, [isNew, params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryId) {
      alert('Please select a category');
      return;
    }

    try {
      setSaving(true);
      if (isNew) {
        await api.post('/blog/admin', formData, { auth: true });
      } else {
        await api.put(`/blog/admin/${params.id}`, formData, { auth: true });
      }
      router.push('/admin/blog');
    } catch (err: any) {
      alert(err.details?.[0]?.message || err.message || 'Error saving blog post');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <CapyLoader />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{isNew ? 'Write Blog Post' : 'Edit Blog Post'}</h1>
        <Button variant="secondary" onClick={() => router.push('/admin/blog')}>Back</Button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.mainColumn}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Title</label>
            <Input 
              required 
              value={formData.title} 
              onChange={(e) => {
                const title = e.target.value;
                setFormData(prev => ({
                  ...prev, 
                  title,
                  slug: isNew ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : prev.slug
                }));
              }} 
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Body</label>
            <RichTextEditor 
              value={formData.body} 
              onChange={(val) => handleChange('body', val)} 
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Excerpt</label>
            <textarea 
              className={styles.textarea}
              value={formData.excerpt} 
              onChange={(e) => handleChange('excerpt', e.target.value)} 
            />
          </div>
        </div>

        <div className={styles.sideColumn}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Status</label>
            <select 
              className={styles.select}
              value={formData.status} 
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Category</label>
            <select 
              required
              className={styles.select}
              value={formData.categoryId} 
              onChange={(e) => handleChange('categoryId', e.target.value)}
            >
              <option value="" disabled>Select a category...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Slug</label>
            <Input 
              required 
              value={formData.slug} 
              onChange={(e) => handleChange('slug', e.target.value)} 
            />
          </div>

          <div className={styles.formGroup}>
            <ImageUploader 
              label="Featured Image"
              value={formData.featuredImageUrl} 
              onChange={(url) => handleChange('featuredImageUrl', url)} 
            />
          </div>

          <hr style={{ width: '100%', borderColor: 'var(--color-border)', margin: '1rem 0' }} />
          <p style={{ fontWeight: 600, margin: 0, fontSize: '0.875rem' }}>SEO Settings</p>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Meta Title</label>
            <Input 
              value={formData.metaTitle} 
              onChange={(e) => handleChange('metaTitle', e.target.value)} 
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Meta Description</label>
            <textarea 
              className={styles.textarea}
              value={formData.metaDescription} 
              onChange={(e) => handleChange('metaDescription', e.target.value)} 
            />
          </div>

          <div className={styles.actions}>
            <Button type="submit" isLoading={saving}>Save Blog Post</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
