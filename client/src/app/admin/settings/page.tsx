'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import { useState } from 'react';
import styles from './Settings.module.css';

import { CapyLoader } from '@/components/ui/CapyLoader';
import { useAuth } from '@/lib/auth-context';

type SettingDTO = {
  id: string;
  key: string;
  value: string;
  group: string;
  type: 'string' | 'boolean' | 'number' | 'json';
  label: string | null;
  description: string | null;
  updatedAt: string;
};

export default function AdminSettingsPage() {
  const { logout } = useAuth();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      }, { auth: true });

      setPasswordSuccess('Password changed successfully! Signing you out...');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Auto-logout after 2 seconds
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setPasswordError(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const { data: settings, isLoading, mutate } = useSWR<SettingDTO[]>(
    '/api/v1/settings/admin',
    (url: string) => api.get<SettingDTO[]>(url)
  );

  const handleSave = async (key: string) => {
    setIsUpdating(true);
    try {
      await api.put(`/api/v1/settings/admin/${key}`, { value: editValue });
      await mutate();
      setEditingKey(null);
    } catch (e) {
      console.error(e);
      alert('Failed to update setting');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEdit = (setting: SettingDTO) => {
    setEditingKey(setting.key);
    setEditValue(setting.value);
  };

  if (isLoading) return <CapyLoader />;

  // Group settings by group, excluding Twitter, default OG Image, and Contact Phone settings
  const keysToExclude = ['social.twitter', 'seo.default_og_image', 'contact.phone'];
  const groupedSettings = settings
    ?.filter((setting) => !keysToExclude.includes(setting.key))
    ?.reduce((acc, setting) => {
      if (!acc[setting.group]) acc[setting.group] = [];
      acc[setting.group]!.push(setting);
      return acc;
    }, {} as Record<string, SettingDTO[]>) || {};

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>System Settings</h1>
      </div>

      <div className={styles.settingsGrid}>
        {Object.entries(groupedSettings).map(([group, groupSettings]) => (
          <div key={group} className={styles.groupSection}>
            <h2 className={styles.groupTitle}>
              {group.replace('_', ' ')}
            </h2>
            <div className={styles.card}>
              {groupSettings.map((setting) => (
                <div key={setting.id} className={styles.row}>
                  <div className={styles.rowLayout}>
                    <div className={styles.infoCol}>
                      <h3 className={styles.label}>{setting.label || setting.key}</h3>
                      <p className={styles.keyBadge}>
                        {setting.key}
                      </p>
                      {setting.description && <p className={styles.description}>{setting.description}</p>}
                    </div>
                    
                    <div className={styles.controlCol}>
                      {editingKey === setting.key ? (
                        <div className={styles.editorWrapper}>
                          {setting.type === 'boolean' ? (
                            <select 
                              className={styles.select}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                            >
                              <option value="true">True</option>
                              <option value="false">False</option>
                            </select>
                          ) : (
                            <input 
                              type="text" 
                              className={styles.input} 
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                            />
                          )}
                          <button 
                            className={styles.saveButton}
                            onClick={() => handleSave(setting.key)}
                            disabled={isUpdating}
                          >
                            Save
                          </button>
                          <button 
                            className={styles.cancelButton}
                            onClick={() => setEditingKey(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className={styles.editorWrapper}>
                          <div className={styles.valueDisplay}>
                            {setting.value}
                          </div>
                          <button 
                            className={styles.editButton}
                            onClick={() => handleEdit(setting)}
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Security settings */}
      <div className={styles.groupSection} style={{ marginTop: '3rem' }}>
        <h2 className={styles.groupTitle}>Security</h2>
        <div className={styles.card} style={{ padding: 'var(--spacing-xl)' }}>
          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', maxWidth: '500px' }}>
            <h3 className={styles.label}>Change Password</h3>
            <p className={styles.description} style={{ marginBottom: 'var(--spacing-sm)' }}>
              Change the password for the super admin account. You will be signed out after a successful update.
            </p>
            
            <div className={styles.formGroup} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-foreground)', marginBottom: '4px' }}>Current Password</label>
              <input 
                type="password" 
                className={styles.input} 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-foreground)', marginBottom: '4px' }}>New Password</label>
              <input 
                type="password" 
                className={styles.input} 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)', marginTop: '4px' }}>
                Must be at least 8 characters, with 1 uppercase letter, 1 number, and 1 special character.
              </p>
            </div>

            <div className={styles.formGroup} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-foreground)', marginBottom: '4px' }}>Confirm New Password</label>
              <input 
                type="password" 
                className={styles.input} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {passwordError && (
              <p style={{ fontSize: '0.875rem', color: 'var(--color-error)', fontWeight: 600, margin: '8px 0 0 0' }}>
                {passwordError}
              </p>
            )}

            {passwordSuccess && (
              <p style={{ fontSize: '0.875rem', color: 'var(--color-success)', fontWeight: 600, margin: '8px 0 0 0' }}>
                {passwordSuccess}
              </p>
            )}

            <div style={{ marginTop: 'var(--spacing-sm)' }}>
              <button 
                type="submit" 
                className={styles.saveButton}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
