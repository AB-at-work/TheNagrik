'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { CapyLoader } from '@/components/ui/CapyLoader';
import styles from './FaqEditor.module.css';

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  orderIndex: number;
  isActive: boolean;
}

export default function FaqEditorPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    orderIndex: 0,
    isActive: true,
  });

  useEffect(() => {
    if (!isNew) {
      api.get<Faq>(`/faq/admin/${params.id}`)
        .then((data) => {
          setFormData({
            question: data.question,
            answer: data.answer,
            category: data.category || 'General',
            orderIndex: data.orderIndex,
            isActive: data.isActive,
          });
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          alert('Failed to load FAQ');
          router.push('/admin/faq');
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
        await api.post('/faq/admin', payload, { auth: true });
      } else {
        await api.put(`/faq/admin/${params.id}`, payload, { auth: true });
      }
      router.push('/admin/faq');
    } catch (err: any) {
      alert(err.details?.[0]?.message || err.message || 'Error saving FAQ');
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
        <h1 className={styles.title}>{isNew ? 'Add FAQ' : 'Edit FAQ'}</h1>
        <Button variant="secondary" onClick={() => router.push('/admin/faq')}>Back</Button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Question</label>
          <Input 
            required 
            value={formData.question} 
            onChange={(e) => handleChange('question', e.target.value)} 
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Answer</label>
          <RichTextEditor 
            value={formData.answer} 
            onChange={(val) => handleChange('answer', val)} 
          />
        </div>

        <div className={styles.formGroupRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Category</label>
            <Input 
              value={formData.category} 
              onChange={(e) => handleChange('category', e.target.value)} 
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
          <Button type="submit" isLoading={saving}>Save FAQ</Button>
        </div>
      </form>
    </div>
  );
}
