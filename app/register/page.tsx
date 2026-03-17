// app/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './register.module.css';

function getStrength(pw: string): number {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) || /[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

export default function RegisterPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const strength      = getStrength(formData.password);
  const passwordLong  = formData.password.length >= 8;
  const hasConfirm    = formData.confirmPassword.length > 0;
  const passwordMatch = hasConfirm && formData.password === formData.confirmPassword;
  const passwordMismt = hasConfirm && formData.password !== formData.confirmPassword;
  const strengthColor = ['#e8e0d8', '#ef4444', '#f59e0b', '#10b981'][strength];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!passwordLong) { setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'); return; }
    if (passwordMismt) { setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push('/login?registered=1');
      } else {
        setError(data.error || 'เกิดข้อผิดพลาดในการลงทะเบียน');
      }
    } catch {
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.rp}>

      {/* ── LEFT PANEL ── */}
      <div className={styles.lp}>
        <div className={styles.lpBg} />
        <div className={styles.lpNoise} />
        <div className={styles.lpGrid} />

        {/* Brand */}
        <div className={styles.lpTop}>
          <div className={styles.brand}>
            <div className={styles.brandMark}>KK</div>
            <div className={styles.brandText}>
              <div className={styles.brandName}>KKU Portal</div>
              <div className={styles.brandSub}>Khon Kaen University</div>
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className={styles.lpMid}>
          <div className={styles.lpEyebrow}>
            <div className={styles.lpEyebrowDot} />
            ระบบใหม่ ปีการศึกษา 2568
          </div>
          <h2 className={styles.lpTitle}>
            แจ้งปัญหา.<br />
            ติดตามสถานะ.<br />
            <span className={styles.lpTitleAccent}>แก้ไขได้เร็วขึ้น</span>
          </h2>
          <p className={styles.lpDesc}>
            ระบบกลางสำหรับนิสิตและบุคลากร มข. ในการรายงานและติดตาม
            การแก้ไขปัญหาภายในมหาวิทยาลัยแบบ real-time
          </p>
          <div className={styles.pills}>
            <span className={styles.pill}>
              <span className={styles.pillIcon}>⚡</span>แจ้งปัญหาได้ทันที
            </span>
            <span className={styles.pill}>
              <span className={styles.pillIcon}>🔔</span>รับการแจ้งเตือน
            </span>
            <span className={styles.pill}>
              <span className={styles.pillIcon}>📊</span>ดูสถิติการแก้ไข
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.lpBot}>
          <div className={styles.lpStats}>
            <div>
              <div className={styles.statNum}>4.2<span>K</span></div>
              <div className={styles.statLabel}>ผู้ใช้งาน</div>
            </div>
            <div>
              <div className={styles.statNum}>98<span>%</span></div>
              <div className={styles.statLabel}>แก้ไขสำเร็จ</div>
            </div>
            <div>
              <div className={styles.statNum}>2.4<span>h</span></div>
              <div className={styles.statLabel}>เวลาเฉลี่ย</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className={styles.rpRight}>

        <Link href="/" className={styles.backBtn}>
          ← กลับหน้าหลัก
        </Link>

        <div className={`${styles.fc} ${mounted ? styles.fcVisible : ''}`}>

          {/* Header */}
          <div className={styles.fcHeader}>
            <p className={styles.fcEyebrow}>KKU Portal · สมัครสมาชิก</p>
            <h1 className={styles.fcTitle}>สร้างบัญชีใหม่</h1>
            <p className={styles.fcSub}>กรอกข้อมูลเพื่อเริ่มใช้ระบบของมหาวิทยาลัยขอนแก่น</p>
          </div>

          {/* Error */}
          {error && (
            <div className={styles.errBox}>
              <span style={{ fontSize: '14px', flexShrink: 0 }}>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form className={styles.form} onSubmit={handleRegister} noValidate>

            {/* Name row */}
            <div className={styles.nameRow}>
              <div className={styles.ig}>
                <label htmlFor="firstName" className={styles.lbl}>ชื่อจริง</label>
                <input
                  id="firstName" name="firstName" type="text"
                  className={styles.ifield} placeholder="สมหมาย"
                  required autoComplete="given-name"
                  value={formData.firstName} onChange={handleChange}
                />
              </div>
              <div className={styles.ig}>
                <label htmlFor="lastName" className={styles.lbl}>นามสกุล</label>
                <input
                  id="lastName" name="lastName" type="text"
                  className={styles.ifield} placeholder="ใจดี"
                  required autoComplete="family-name"
                  value={formData.lastName} onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div className={styles.ig}>
              <label htmlFor="email" className={styles.lbl}>อีเมลมหาวิทยาลัย</label>
              <input
                id="email" name="email" type="email"
                className={styles.ifield} placeholder="name.s@kkumail.com"
                required autoComplete="email"
                value={formData.email} onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div className={styles.ig}>
              <label htmlFor="password" className={styles.lbl}>รหัสผ่าน</label>
              <input
                id="password" name="password" type="password"
                className={styles.ifield} placeholder="อย่างน้อย 8 ตัวอักษร"
                required minLength={8} autoComplete="new-password"
                value={formData.password} onChange={handleChange}
              />
              {formData.password.length > 0 && (
                <>
                  <div className={styles.strBar}>
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={styles.strSeg}
                        style={{ background: i <= strength ? strengthColor : '#e8e0d8' }}
                      />
                    ))}
                  </div>
                  {!passwordLong && (
                    <span className={styles.fbHint}>
                      ต้องการอีก {8 - formData.password.length} ตัวอักษร
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Confirm password */}
            <div className={styles.ig}>
              <label htmlFor="confirmPassword" className={styles.lbl}>ยืนยันรหัสผ่าน</label>
              <input
                id="confirmPassword" name="confirmPassword" type="password"
                className={styles.ifield} placeholder="ใส่รหัสผ่านอีกครั้ง"
                required autoComplete="new-password"
                value={formData.confirmPassword} onChange={handleChange}
              />
              {passwordMatch && <span className={styles.fbOk}>✓ รหัสผ่านตรงกัน</span>}
              {passwordMismt && <span className={styles.fbErr}>✕ รหัสผ่านไม่ตรงกัน</span>}
            </div>

            <div className={styles.divider} />

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading
                ? <><span className={styles.spinner} /> กำลังบันทึกข้อมูล...</>
                : 'สร้างบัญชี →'
              }
            </button>

          </form>

          {/* OR divider */}
          <div className={styles.secDivider}>หรือ</div>

          {/* Login link */}
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <button type="button" className={styles.outlineBtn}>เข้าสู่ระบบ</button>
          </Link>

          {/* Footer */}
          <p className={styles.fcFooter}>
            มีปัญหาการลงทะเบียน?
            <a href="mailto:support@kku.ac.th">ติดต่อฝ่ายสนับสนุน</a>
          </p>

        </div>
      </div>

    </div>
  );
}