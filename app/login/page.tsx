// app/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr;
          font-family: 'IBM Plex Sans Thai', sans-serif;
          background: #f5f2ee;
        }

        @media (min-width: 960px) {
          .login-page { grid-template-columns: 1fr 480px; }
        }

        /* ---- LEFT PANEL ---- */
        .left-panel {
          display: none;
          position: relative;
          background: #1a0a00;
          overflow: hidden;
        }

        @media (min-width: 960px) {
          .left-panel { display: flex; flex-direction: column; justify-content: space-between; padding: 56px 64px; }
        }

        .left-bg-img {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(160deg, rgba(163,38,56,0.55) 0%, rgba(26,10,0,0.85) 60%),
            url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=900&q=80') center/cover no-repeat;
          z-index: 0;
        }

        .left-content { position: relative; z-index: 1; }

        .kku-logo {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .kku-badge {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: 1.5px solid rgba(232,119,34,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          color: #e87722;
          font-weight: 700;
          background: rgba(232,119,34,0.08);
          flex-shrink: 0;
          letter-spacing: -1px;
        }

        .kku-label {
          font-size: 12px;
          font-weight: 400;
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          line-height: 1.4;
        }

        .kku-label strong {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
          letter-spacing: 0.02em;
          text-transform: none;
        }

        .left-quote-block { position: relative; z-index: 1; }

        .deco-line {
          width: 48px;
          height: 2px;
          background: linear-gradient(90deg, #A32638, #e87722);
          border-radius: 2px;
          margin-bottom: 22px;
        }

        .left-quote {
          font-family: 'Playfair Display', serif;
          font-size: clamp(24px, 2.6vw, 36px);
          font-style: italic;
          font-weight: 400;
          color: rgba(255,255,255,0.88);
          line-height: 1.55;
          margin-bottom: 22px;
        }

        .left-quote em {
          font-style: normal;
          color: #e87722;
        }

        .left-quote-sub {
          font-size: 11px;
          color: rgba(255,255,255,0.28);
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        /* ---- RIGHT PANEL ---- */
        .right-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 32px;
          background: #f5f2ee;
          position: relative;
        }

        .back-link {
          position: absolute;
          top: 28px;
          left: 28px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #8a7f76;
          text-decoration: none;
          transition: color 0.2s;
        }

        .back-link:hover { color: #1a0a00; }

        .back-arrow {
          width: 30px; height: 30px;
          border-radius: 50%;
          background: #ede8e2;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: background 0.2s;
        }

        .back-link:hover .back-arrow { background: #ddd5cc; }

        /* Form card */
        .form-card {
          width: 100%;
          max-width: 360px;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1);
        }

        .form-card.visible { opacity: 1; transform: translateY(0); }

        .form-header { margin-bottom: 36px; }

        .form-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #A32638;
          margin-bottom: 10px;
        }

        .form-title {
          font-family: 'Playfair Display', serif;
          font-size: 30px;
          font-weight: 700;
          color: #1a0a00;
          line-height: 1.2;
          margin-bottom: 10px;
          letter-spacing: -0.4px;
        }

        .form-subtitle {
          font-size: 14px;
          color: #8a7f76;
          font-weight: 300;
          line-height: 1.65;
        }

        /* Error */
        .error-msg {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #fff0f1;
          border: 1px solid rgba(163,38,56,0.18);
          border-left: 3px solid #A32638;
          padding: 12px 16px;
          border-radius: 10px;
          margin-bottom: 24px;
          font-size: 13.5px;
          color: #A32638;
          line-height: 1.5;
        }

        /* Input groups */
        .input-group { margin-bottom: 18px; }

        .input-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #5a5048;
          margin-bottom: 8px;
        }

        .input-field {
          width: 100%;
          padding: 13px 16px;
          font-size: 14.5px;
          font-family: 'IBM Plex Sans Thai', sans-serif;
          font-weight: 400;
          color: #1a0a00;
          background: #fff;
          border: 1.5px solid #ddd5cc;
          border-radius: 12px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .input-field::placeholder { color: #c0b4aa; font-weight: 300; }

        .input-field:focus {
          border-color: #A32638;
          box-shadow: 0 0 0 4px rgba(163,38,56,0.09);
        }

        /* Submit button */
        .submit-btn {
          width: 100%;
          padding: 14px;
          margin-top: 8px;
          background: #A32638;
          color: #fff;
          font-family: 'IBM Plex Sans Thai', sans-serif;
          font-size: 15px;
          font-weight: 600;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          letter-spacing: 0.02em;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(163,38,56,0.3);
          position: relative;
          overflow: hidden;
        }

        .submit-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          pointer-events: none;
        }

        .submit-btn:hover:not(:disabled) {
          background: #8e1e2d;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(163,38,56,0.38);
        }

        .submit-btn:active:not(:disabled) { transform: translateY(0); }

        .submit-btn:disabled {
          background: #c9bfb8;
          box-shadow: none;
          cursor: not-allowed;
        }

        .spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 26px 0;
          color: #bdb0a6;
          font-size: 11.5px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 500;
        }

        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e3dcd6;
        }

        /* Register button */
        .register-btn {
          width: 100%;
          padding: 13px;
          background: transparent;
          color: #3d2e27;
          font-family: 'IBM Plex Sans Thai', sans-serif;
          font-size: 14.5px;
          font-weight: 500;
          border: 1.5px solid #ddd5cc;
          border-radius: 12px;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s, color 0.2s;
        }

        .register-btn:hover {
          border-color: #A32638;
          background: rgba(163,38,56,0.04);
          color: #A32638;
        }

        .form-footer {
          margin-top: 28px;
          text-align: center;
          font-size: 11.5px;
          color: #bdb0a6;
          line-height: 1.7;
        }

        .form-footer a {
          color: #8a7f76;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .form-footer a:hover { color: #A32638; }
      `}</style>

      <div className="login-page">

        {/* LEFT */}
        <div className="left-panel">
          <div className="left-bg-img" />
          <div className="left-content">
            <div className="kku-logo">
              <div className="kku-badge">KK</div>
              <div className="kku-label">
                <strong>ระบบจัดการข้อมูล</strong>
                Khon Kaen University
              </div>
            </div>
          </div>
          <div className="left-quote-block">
            <div className="deco-line" />
            <p className="left-quote">
              "ปัญญา เป็นแสงสว่าง<br />
              ในโลก<em>แห่งความมืด</em>"
            </p>
            <p className="left-quote-sub">มหาวิทยาลัยขอนแก่น · ก่อตั้ง ๒๕๐๗</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="right-panel">

          <Link href="/" className="back-link">
            <span className="back-arrow">←</span>
            กลับหน้าหลัก
          </Link>

          <div className={`form-card ${mounted ? 'visible' : ''}`}>

            <div className="form-header">
              <p className="form-eyebrow">KKU Portal</p>
              <h1 className="form-title">ยินดีต้อนรับกลับ</h1>
              <p className="form-subtitle">
                เข้าสู่ระบบด้วยอีเมลมหาวิทยาลัยของคุณ<br />
                เพื่อจัดการข้อมูลและติดตามสถานะ
              </p>
            </div>

            {error && (
              <div className="error-msg">
                <span style={{ fontSize: '15px', flexShrink: 0, marginTop: '1px' }}>⚠</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <label htmlFor="email" className="input-label">อีเมลมหาวิทยาลัย</label>
                <input
                  id="email"
                  type="email"
                  className="input-field"
                  placeholder="name.s@kkumail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="input-group">
                <label htmlFor="password" className="input-label">รหัสผ่าน</label>
                <input
                  id="password"
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner" />
                    กำลังตรวจสอบข้อมูล...
                  </>
                ) : (
                  'เข้าสู่ระบบ'
                )}
              </button>
            </form>

            <div className="divider">หรือ</div>

            <Link href="/register" style={{ textDecoration: 'none' }}>
              <button type="button" className="register-btn">
                สร้างบัญชีใหม่
              </button>
            </Link>

            <p className="form-footer">
              มีปัญหาการเข้าสู่ระบบ?{' '}
              <a href="mailto:support@kku.ac.th">ติดต่อฝ่ายสนับสนุน</a>
            </p>

          </div>
        </div>

      </div>
    </>
  );
}