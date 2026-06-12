'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { CapyLoader } from '@/components/ui/CapyLoader';
import styles from './Categories.module.css';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    sortOrder: 0,
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await api.get<Category[]>('/categories');
      setCategories(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingId(category.id);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        sortOrder: category.sortOrder,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        sortOrder: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, formData, { auth: true });
      } else {
        await api.post('/categories', formData, { auth: true });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.details?.[0]?.message || err.message || 'Error saving category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`, { auth: true });
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Error deleting category');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Categories</h1>
        <Button onClick={() => handleOpenModal()}>Add Category</Button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <CapyLoader />
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.name}</td>
                  <td>{cat.slug}</td>
                  <td>{cat.sortOrder}</td>
                  <td>
                    <div className={styles.actions}>
                      <Button variant="secondary" size="sm" onClick={() => handleOpenModal(cat)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(cat.id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                    No categories found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Name</label>
            <Input 
              required 
              value={formData.name} 
              onChange={(e) => {
                const name = e.target.value;
                setFormData(prev => ({
                  ...prev, 
                  name,
                  slug: !editingId ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : prev.slug
                }));
              }} 
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Slug</label>
            <Input 
              required 
              value={formData.slug} 
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))} 
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Description</label>
            <Input 
              value={formData.description} 
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} 
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Sort Order</label>
            <Input 
              type="number" 
              value={formData.sortOrder} 
              onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))} 
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
