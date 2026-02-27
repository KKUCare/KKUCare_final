// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './auth.module.css'; 

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/'); 
      } else {
        setError(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      
      {/* ปุ่มกลับหน้าหลัก */}
      <Link href="/" className={styles.backBtn}>
        <span>←</span> กลับหน้าหลัก
      </Link>

      {/* การ์ด Login */}
      <div className={styles.authCard}>
        
        <div className={styles.brand}>
          <div className={styles.brandIcon}>✨</div>
          <h1>ยินดีต้อนรับกลับมา</h1>
          <p>เข้าสู่ระบบเพื่อจัดการข้อมูลและติดตามสถานะ</p>
        </div>

        {error && (
          <div className={styles.errorBox}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span> {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className={styles.form}>
          
          <div className={styles.inputGroup}>
            <label htmlFor="email">อีเมลมหาวิทยาลัย</label>
            <input 
              id="email"
              type="email" 
              className={styles.inputField}
              placeholder="name.s@kkumail.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">รหัสผ่าน</label>
            <input 
              id="password"
              type="password" 
              className={styles.inputField}
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className={styles.primaryBtn}
            disabled={loading}
          >
            {loading ? 'กำลังตรวจสอบข้อมูล...' : 'เข้าสู่ระบบ'}
          </button>

        </form>

        <div className={styles.divider}>หรือผู้ใช้งานใหม่</div>

        <Link href="/register" style={{ textDecoration: 'none' }}>
          <button type="button" className={styles.secondaryBtn}>
            สร้างบัญชีใหม่
          </button>
        </Link>

      </div>
    </div>
  );
}