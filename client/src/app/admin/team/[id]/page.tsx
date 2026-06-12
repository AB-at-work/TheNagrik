'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CapyLoader } from '@/components/ui/CapyLoader';
import styles from './TeamEditor.module.css';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  imageUrl: string | null;
  linkedInUrl: string | null;
  twitterUrl: string | null;
  email: string | null;
  orderIndex: number;
  isActive: boolean;
}

export default function TeamEditorPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    imageUrl: '',
    linkedInUrl: '',
    twitterUrl: '',
    email: '',
    orderIndex: 0,
    isActive: true,
  });

  useEffect(() => {
    if (!isNew) {
      api.get<TeamMember>(`/team/admin/${params.id}`)
        .then((data) => {
          setFormData({
            name: data.name,
            role: data.role,
            bio: data.bio || '',
            imageUrl: data.imageUrl || '',
            linkedInUrl: data.linkedInUrl || '',
            twitterUrl: data.twitterUrl || '',
            email: data.email || '',
            orderIndex: data.orderIndex,
            isActive: data.isActive,
          });
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          alert('Failed to load team member');
          router.push('/admin/team');
        });
    }
  }, [isNew, params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = { 
        ...formData,
        orderIndex: parseInt(formData.orderIndex as any) || 0
      };

      if (isNew) {
        await api.post('/team/admin', payload, { auth: true });
      } else {
        await api.put(`/team/admin/${params.id}`, payload, { auth: true });
      }
      router.push('/admin/team');
    } catch (err: any) {
      alert(err.details?.[0]?.message || err.message || 'Error saving team member');
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
        <h1 className={styles.title}>{isNew ? 'Add Team Member' : 'Edit Team Member'}</h1>
        <Button variant="secondary" onClick={() => router.push('/admin/team')}>Back</Button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroupRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Name</label>
            <Input 
              required 
              value={formData.name} 
              onChange={(e) => handleChange('name', e.target.value)} 
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Role</label>
            <Input 
              required 
              value={formData.role} 
              onChange={(e) => handleChange('role', e.target.value)} 
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Bio</label>
          <textarea 
            className={styles.textarea}
            value={formData.bio} 
            onChange={(e) => handleChange('bio', e.target.value)} 
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Image URL</label>
          <Input 
            value={formData.imageUrl} 
            onChange={(e) => handleChange('imageUrl', e.target.value)} 
          />
        </div>

        <div className={styles.formGroupRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>LinkedIn URL</label>
            <Input 
              value={formData.linkedInUrl} 
              onChange={(e) => handleChange('linkedInUrl', e.target.value)} 
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Twitter URL</label>
            <Input 
              value={formData.twitterUrl} 
              onChange={(e) => handleChange('twitterUrl', e.target.value)} 
            />
          </div>
        </div>

        <div className={styles.formGroupRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email</label>
            <Input 
              type="email"
              value={formData.email} 
              onChange={(e) => handleChange('email', e.target.value)} 
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Order Index (Lower shows first)</label>
            <Input 
              type="number"
              value={formData.orderIndex} 
              onChange={(e) => handleChange('orderIndex', e.target.value)} 
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              checked={formData.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
            />
            Show on public website
          </label>
        </div>

        <div className={styles.actions}>
          <Button type="submit" isLoading={saving}>Save Team Member</Button>
        </div>
      </form>
    </div>
  );
}
