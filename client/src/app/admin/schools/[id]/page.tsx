'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { CapyLoader } from '@/components/ui/CapyLoader';
import styles from './SchoolEditor.module.css';

interface SchoolSession {
  id: string;
  title: string;
  slug: string;
  schoolName: string;
  city: string | null;
  state: string | null;
  sessionDate: string;
  studentCount: number | null;
  description: string | null;
  status?: string;
  photos?: { id: string; imageUrl: string }[];
}

export default function SchoolEditorPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    schoolName: '',
    city: '',
    state: '',
    status: 'draft',
    sessionDate: '',
    studentCount: 0,
    description: '',
    photoGalleryUrls: '', 
  });

  useEffect(() => {
    if (!isNew) {
      api.get<SchoolSession>(`/schools/admin/${params.id}`)
        .then((data) => {
          setFormData({
            title: data.title,
            slug: data.slug,
            schoolName: data.schoolName,
            city: data.city || '',
            state: data.state || '',
            status: data.status || 'draft',
            sessionDate: data.sessionDate ? data.sessionDate.substring(0, 10) : '',
            studentCount: data.studentCount || 0,
            description: data.description || '',
            photoGalleryUrls: data.photos ? data.photos.map((p) => p.imageUrl).join(', ') : '',
          });
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          alert('Failed to load session');
          router.push('/admin/schools');
        });
    }
  }, [isNew, params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = { 
        title: formData.title,
        slug: formData.slug,
        schoolName: formData.schoolName,
        city: formData.city,
        state: formData.state,
        status: formData.status,
        sessionDate: formData.sessionDate || null as any,
        studentCount: formData.studentCount ? parseInt(formData.studentCount as any) : null,
        description: formData.description,
        photoGalleryUrls: formData.photoGalleryUrls.split(',').map(s => s.trim()).filter(Boolean)
      };

      if (isNew) {
        await api.post('/schools/admin', payload, { auth: true });
      } else {
        await api.put(`/schools/admin/${params.id}`, payload, { auth: true });
      }
      router.push('/admin/schools');
    } catch (err: any) {
      alert(err.details?.[0]?.message || err.message || 'Error saving session');
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
        <h1 className={styles.title}>{isNew ? 'Log Session' : 'Edit Session'}</h1>
        <Button variant="secondary" onClick={() => router.push('/admin/schools')}>Back</Button>
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
            <label className={styles.formLabel}>School Name</label>
            <Input 
              required
              value={formData.schoolName} 
              onChange={(e) => handleChange('schoolName', e.target.value)} 
            />
          </div>

          <div className={styles.formGroupRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>City</label>
              <Input 
                value={formData.city} 
                onChange={(e) => handleChange('city', e.target.value)} 
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>State</label>
              <Input 
                value={formData.state} 
                onChange={(e) => handleChange('state', e.target.value)} 
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Description</label>
            <textarea 
              className={styles.textarea}
              style={{ minHeight: '150px' }}
              value={formData.description} 
              onChange={(e) => handleChange('description', e.target.value)} 
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Photo Gallery</label>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
              Upload images to the school session gallery.
            </p>
            <ImageUploader 
              value="" 
              onChange={(url) => {
                if (url) {
                  const current = formData.photoGalleryUrls ? formData.photoGalleryUrls.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
                  handleChange('photoGalleryUrls', [...current, url].join(', '));
                }
              }} 
            />
            {formData.photoGalleryUrls && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                {formData.photoGalleryUrls.split(',').map(s => s.trim()).filter(Boolean).map((url, i) => (
                  <div key={i} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                    <img src={url} alt={`Gallery ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => {
                        const current = formData.photoGalleryUrls.split(',').map((s: string) => s.trim()).filter(Boolean);
                        current.splice(i, 1);
                        handleChange('photoGalleryUrls', current.join(', '));
                      }}
                      style={{
                        position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px'
                      }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.sideColumn}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Status</label>
            <select 
              className={styles.input}
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
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

          <div className={styles.formGroupRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Session Date</label>
              <Input 
                type="date"
                required
                value={formData.sessionDate} 
                onChange={(e) => handleChange('sessionDate', e.target.value)} 
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Students Reached</label>
              <Input 
                type="number"
                value={formData.studentCount} 
                onChange={(e) => handleChange('studentCount', e.target.value)} 
              />
            </div>
          </div>

          <div className={styles.actions}>
            <Button type="submit" isLoading={saving}>Save Session</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
