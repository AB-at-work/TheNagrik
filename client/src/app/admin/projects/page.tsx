'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { CapyLoader } from '@/components/ui/CapyLoader';
import styles from './ProjectsAdmin.module.css';

interface Project {
  id: string;
  title: string;
  slug: string;
  status: string;
  startDate: string | null;
}

export default function ProjectsAdminPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await api.get<Project[]>('/projects/admin/all');
      setProjects(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/admin/${id}`);
      fetchProjects();
    } catch (err: any) {
      alert(err.message || 'Error deleting project');
    }
  };

  const getStatusClass = (status: string) => {
    if (status === 'active') return styles.statusActive;
    if (status === 'completed') return styles.statusCompleted;
    if (status === 'upcoming') return styles.statusUpcoming;
    return styles.statusDraft;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Projects</h1>
        <Button onClick={() => router.push('/admin/projects/new')}>Create Project</Button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <CapyLoader />
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td>{project.title}</td>
                  <td>{project.slug}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                  <td>{project.startDate ? new Date(project.startDate).toLocaleDateString() : '—'}</td>
                  <td>
                    <div className={styles.actions}>
                      <Button variant="secondary" size="sm" onClick={() => router.push(`/admin/projects/${project.id}`)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(project.id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                    No projects found. Create one to get started.
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
