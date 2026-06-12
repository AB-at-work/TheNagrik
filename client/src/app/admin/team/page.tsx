'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { CapyLoader } from '@/components/ui/CapyLoader';
import styles from './TeamAdmin.module.css';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
  orderIndex: number;
}

export default function TeamAdminPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await api.get<TeamMember[]>('/team/admin/all');
      setMembers(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    try {
      await api.delete(`/team/admin/${id}`);
      fetchMembers();
    } catch (err: any) {
      alert(err.message || 'Error deleting member');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Team Members</h1>
        <Button onClick={() => router.push('/admin/team/new')}>Add Member</Button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <CapyLoader />
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>{member.orderIndex}</td>
                  <td>{member.name}</td>
                  <td>{member.role}</td>
                  <td>
                    <span className={member.isActive ? styles.activeStatus : styles.inactiveStatus}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Button variant="secondary" size="sm" onClick={() => router.push(`/admin/team/${member.id}`)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(member.id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                    No team members found. Create one to get started.
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
