'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import styles from './ImageUpload.module.css';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
}

export default function ImageUpload({ value = [], onChange, maxFiles = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    return token;
  };

  const uploadFile = async (file: File) => {
    const token = await getToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', '/products');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/imagekit/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Upload failed');
    }

    const result = await response.json();
    return result.url;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (value.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`);
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFile(files[i]);
        uploadedUrls.push(url);
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      onChange([...value, ...uploadedUrls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.container}>
      <div className={styles.previewGrid}>
        {value.map((url, index) => (
          <div key={index} className={styles.previewItem}>
            <Image src={url} alt={`Product image ${index + 1}`} className={styles.previewImage} fill sizes="80px" />
            <button
              type="button"
              className={styles.removeButton}
              onClick={() => removeImage(index)}
            >
              ×
            </button>
          </div>
        ))}

        {value.length < maxFiles && (
          <label className={styles.uploadButton}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
              className={styles.fileInput}
            />
            {uploading ? (
              <div className={styles.uploadingState}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span>Uploading...</span>
              </div>
            ) : (
              <div className={styles.uploadPlaceholder}>
                <span className={styles.plusIcon}>+</span>
                <span>Add Image</span>
              </div>
            )}
          </label>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
