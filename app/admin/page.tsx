'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminLoginSchema } from '@/lib/validations';
import { adminLogin } from '@/lib/api';
import type { z } from 'zod';
import styles from './admin-login.module.css';

type AdminLoginForm = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  // Set admin cookie via effect to satisfy react-hooks/immutability
  useEffect(() => {
    if (!loginSuccess) return;
    document.cookie = 'admin_token=1; path=/admin; max-age=86400; SameSite=Strict';
    router.push('/admin/dashboard');
  }, [loginSuccess, router]);

  const onSubmit = async (data: AdminLoginForm) => {
    setLoading(true);
    setError('');

    try {
      const response = await adminLogin(data);
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('adminAuthenticated', 'true');
      setLoginSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1>Admin Panel</h1>
        <p>Shivanjali Handlooms</p>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.inputGroup}>
            <label>Email</label>
            <input type="email" {...register('identifier')} placeholder="admin@shivanjali.com" />
            {errors.identifier && <p className={styles.fieldError}>{errors.identifier.message}</p>}
          </div>
          <div className={styles.inputGroup}>
            <label>Password</label>
            <input type="password" {...register('password')} placeholder="••••••••" />
            {errors.password && <p className={styles.fieldError}>{errors.password.message}</p>}
          </div>
          <button type="submit" className={styles.loginButton} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className={styles.note}>Create admin user via: POST /auth/register with role: ADMIN</p>
      </div>
    </div>
  );
}