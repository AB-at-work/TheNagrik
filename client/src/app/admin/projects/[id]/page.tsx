'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { CapyLoader } from '@/components/ui/CapyLoader';
import styles from './ProjectEditor.module.css';

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  featuredImageUrl: string | null;
  status: string;
  ctaText: string | null;
  ctaUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

export default function ProjectEditorPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    featuredImageUrl: '',
    status: 'draft',
    ctaText: '',
    ctaUrl: '',
    startDate: '',
    endDate: '',
    metaTitle: '',
    metaDescription: '',
  });

  useEffect(() => {
    if (!isNew) {
      api.get<Project>(`/projects/admin/${params.id}`)
        .then((data) => {
          setFormData({
            title: data.title,
            slug: data.slug,
            description: data.description || '',
            shortDescription: data.shortDescription || '',
            featuredImageUrl: data.featuredImageUrl || '',
            status: data.status,
            ctaText: data.ctaText || '',
            ctaUrl: data.ctaUrl || '',
            startDate: data.startDate || '',
            endDate: data.endDate || '',
            metaTitle: data.metaTitle || '',
            metaDescription: data.metaDescription || '',
          });
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          alert('Failed to load project');
          router.push('/admin/projects');
        });
    }
  }, [isNew, params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      // clean dates if empty string
      const payload = { ...formData };
      if (!payload.startDate) payload.startDate = null as any;
      if (!payload.endDate) payload.endDate = null as any;

      if (isNew) {
        await api.post('/projects/admin', payload, { auth: true });
      } else {
        await api.put(`/projects/admin/${params.id}`, payload, { auth: true });
      }
      router.push('/admin/projects');
    } catch (err: any) {
      alert(err.details?.[0]?.message || err.message || 'Error saving project');
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
        <h1 className={styles.title}>{isNew ? 'Create Project' : 'Edit Project'}</h1>
        <Button variant="secondary" onClick={() => router.push('/admin/projects')}>Back</Button>
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
            <label className={styles.formLabel}>Short Description</label>
            <textarea 
              className={styles.textarea}
              value={formData.shortDescription} 
              onChange={(e) => handleChange('shortDescription', e.target.value)} 
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Description (Full)</label>
            <RichTextEditor 
              value={formData.description} 
              onChange={(val) => handleChange('description', val)} 
            />
          </div>

          <div className={styles.formGroupRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>CTA Text</label>
              <Input 
                value={formData.ctaText} 
                onChange={(e) => handleChange('ctaText', e.target.value)} 
                placeholder="e.g. Visit Website"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>CTA URL</label>
              <Input 
                value={formData.ctaUrl} 
                onChange={(e) => handleChange('ctaUrl', e.target.value)} 
                placeholder="https://..."
              />
            </div>
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
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
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
            <label className={styles.formLabel}>Date</label>
            <Input 
              type="date"
              value={formData.startDate} 
              onChange={(e) => handleChange('startDate', e.target.value)} 
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
            <Button type="submit" isLoading={saving}>Save Project</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
