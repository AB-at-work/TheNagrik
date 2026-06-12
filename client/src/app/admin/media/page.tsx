'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import { useState, useRef } from 'react';
import type { PaginatedResponse } from '@thenagrik/shared';
import Image from 'next/image';
import styles from './Media.module.css';

type MediaDTO = {
  id: string;
  url: string;
  storageKey: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  createdAt: string;
};

export default function AdminMediaPage() {
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, mutate } = useSWR<PaginatedResponse<MediaDTO>>(
    `/api/v1/media?page=${page}&limit=12`,
    (url: string) => api.get<PaginatedResponse<MediaDTO>>(url)
  );

  const deleteMedia = async (id: string) => {
    try {
      await api.delete(`/api/v1/media/${id}`);
      await mutate();
    } catch (e) {
      console.error(e);
      alert('Failed to delete media');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      await api.post('/v1/media', null, { formData, auth: true });

      await mutate();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard!');
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Media Library</h1>
        
        <div>
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload}
            accept="image/jpeg, image/png, image/webp, image/gif, application/pdf"
          />
          <button 
            className={styles.uploadBtn}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
        </div>
      ) : !data || data.data.length === 0 ? (
        <div className={styles.emptyState}>
          <svg xmlns="http://www.w3.org/2000/svg" className={styles.emptyIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className={styles.emptyTitle}>No media files</h3>
          <p className={styles.emptyDesc}>Upload images to use in your articles and pages.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {data.data.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                {item.mimeType.startsWith('image/') ? (
                  <Image 
                    src={item.url} 
                    alt={item.altText || item.filename} 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  <div className={styles.filePlaceholder}>
                    {item.mimeType.split('/')[1] || 'FILE'}
                  </div>
                )}
                
                <div className={styles.overlay}>
                  <button 
                    onClick={() => copyToClipboard(item.url)}
                    className={styles.actionBtn}
                    title="Copy URL"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this file?')) {
                        deleteMedia(item.id);
                      }
                    }}
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className={styles.infoBody}>
                <h4 className={styles.filename} title={item.filename}>
                  {item.filename}
                </h4>
                <div className={styles.metaRow}>
                  <span>{formatBytes(item.fileSize)}</span>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {data && data.meta.last_page > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={styles.prevNextBtn}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {page} of {data.meta.last_page}
          </span>
          <button
            onClick={() => setPage(p => Math.min(data.meta.last_page, p + 1))}
            disabled={page === data.meta.last_page}
            className={styles.prevNextBtn}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
