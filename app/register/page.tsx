// app/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './register.module.css';

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
        router.push('/login');
      } else {
        setError(data.error || 'เกิดข้อผิดพลาดในการลงทะเบียน');
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

      {/* การ์ด Register */}
      <div className={styles.authCard}>
        
        <div className={styles.brand}>
          <h1>สร้างบัญชีใหม่</h1>
          <p>เข้าร่วมกับเราเพื่อรายงานและติดตามปัญหา</p>
        </div>

        {error && (
          <div className={styles.errorBox}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleRegister} className={styles.form}>
          
          {/* ชื่อ - นามสกุล (จัดเรียงแบบ Grid) */}
          <div className={styles.nameGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="firstName">ชื่อจริง</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="สมหมาย"
                className={styles.inputField}
                required
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="lastName">นามสกุล</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="ใจดี"
                className={styles.inputField}
                required
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">อีเมลมหาวิทยาลัย</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="name.s@kkumail.com"
              className={styles.inputField}
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">รหัสผ่าน</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="กำหนดรหัสผ่าน 8 ตัวขึ้นไป"
              className={styles.inputField}
              required
              minLength={8}
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="ใส่รหัสผ่านอีกครั้ง"
              className={styles.inputField}
              required
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className={styles.primaryBtn} disabled={loading}>
            {loading ? 'กำลังบันทึกข้อมูล...' : 'ลงทะเบียน'}
          </button>

        </form>

        <div className={styles.footerText}>
          มีบัญชีอยู่แล้ว? 
          <Link href="/login" className={styles.footerLink}>
            เข้าสู่ระบบที่นี่
          </Link>
        </div>

      </div>
    </div>
  );
}