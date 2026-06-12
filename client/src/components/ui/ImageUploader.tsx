'use client';

import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { api } from '@/lib/api';
import styles from './ImageUploader.module.css';

interface ImageUploaderProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

export function ImageUploader({ label, value, onChange, className }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleUpload(file);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setError(null);
      setIsUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      
      const data = await api.post<any>('/media', undefined, { 
        formData, 
        auth: true 
      });

      if (data.url) {
        onChange(data.url);
      } else {
        throw new Error('No URL returned from server');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'An error occurred during upload');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {label && <label className={styles.label}>{label}</label>}
      
      {!value ? (
        <div 
          className={`${styles.dropzone} ${isDragging ? styles.active : ''} ${error ? styles.error : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className={styles.input} 
            accept="image/jpeg, image/png, image/webp, image/gif"
          />
          <UploadCloud className={styles.uploadIcon} />
          {isUploading ? (
            <span className={styles.loadingText}>Uploading...</span>
          ) : (
            <span className={styles.text}>Click or drag and drop an image here</span>
          )}
        </div>
      ) : (
        <div className={styles.previewContainer}>
          <img src={value} alt="Uploaded preview" className={styles.preview} />
          <button type="button" onClick={handleRemove} className={styles.removeButton} aria-label="Remove image">
            <X size={16} />
          </button>
        </div>
      )}
      
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
