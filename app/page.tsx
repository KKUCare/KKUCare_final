// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const res = await fetch('/api/auth/me'); 
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setIsLoggedIn(true);
            setUserName(data.user.name || 'ผู้ใช้งาน');
            setUserRole(data.user.role);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user session');
      }
    };
    checkUserSession();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsLoggedIn(false);
      setUserName('');
      setUserRole(null);
      router.refresh(); 
      window.location.reload(); 
    } catch (error) {
      console.error('Logout failed');
    }
  };

  const isStaffOrAdmin = userRole === 'admin' || userRole?.startsWith('staff_');

  return (
    <div className="min-h-screen flex flex-col">
      
      {/* --- Topbar (ดีไซน์เดียวกับหน้าแอดมิน) --- */}
      <nav className="topbar">
        <div className="nav-container">
          
          <Link href="/" className="brand">
            KKU Care
          </Link>

          {/* เมนูนำทางตรงกลาง */}
          <div className="nav-menu">
            <Link href="/" className="nav-link active">
              <span>🏠</span> หน้าหลัก
            </Link>
            <Link href="/status" className="nav-link">
              <span>📋</span> ติดตามสถานะ
            </Link>
            {isStaffOrAdmin && (
              <Link href="/admin" className="nav-link" style={{color: '#A32638', fontWeight: 600}}>
                <span>⚙️</span> ระบบจัดการ
              </Link>
            )}
          </div>
          
          {/* ส่วนจัดการผู้ใช้งาน */}
          <div className="nav-actions">
            {isLoggedIn ? (
              <>
                <span className="user-greeting hide-on-mobile">
                  {userName}
                </span>
                <button onClick={handleLogout} className="btn-text" style={{color: '#ef4444'}}>
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <>
                <button onClick={() => router.push('/login')} className="btn-text">
                  เข้าสู่ระบบ
                </button>
                <button onClick={() => router.push('/register')} className="btn-pill">
                  สมัครสมาชิก
                </button>
              </>
            )}
          </div>

        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="flex-grow">
        
        {/* Hero Section */}
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-content">
              <h1 className="hero-title">
                รายงานและติดตามปัญหา<br />
                <span className="highlight">ภายในมหาวิทยาลัยขอนแก่น</span>
              </h1>
              <p className="hero-subtitle">
                พบเห็นปัญหา สาธารณูปโภคชำรุด หรือความไม่ปลอดภัย แจ้งเรื่องได้ทันทีผ่านแพลตฟอร์มของเรา พร้อมติดตามความคืบหน้าแบบเรียลไทม์
              </p>

              <div className="hero-actions">
                <Link href={isLoggedIn ? "/report" : "/login"} className="btn-primary">
                  📢 สร้างรายการแจ้งปัญหา
                </Link>
              </div>
            </div>

            <div className="hero-illustration">
              <div className="floating-badge">✨ พร้อมให้บริการ 24 ชม.</div>
              <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🏫</div>
              <h3 style={{ margin: 0, color: '#0F172A', fontSize: '1.2rem' }}>Smart Campus</h3>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>Khon Kaen University</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section-features">
          <div className="container">
            <h2 className="section-title">ขั้นตอนการใช้งานง่ายๆ</h2>
            <div className="features-grid">
              
              <div className="feature-card">
                <div className="feature-icon">📸</div>
                <h3>1. ถ่ายภาพและระบุจุด</h3>
                <p>ถ่ายรูปปัญหาที่พบ พร้อมระบุสถานที่ให้ชัดเจนเพื่อให้เจ้าหน้าที่เข้าถึงพื้นที่ได้อย่างแม่นยำ</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>2. รับเรื่องและดำเนินการ</h3>
                <p>ระบบจะส่งข้อมูลแจ้งเตือนไปยังเจ้าหน้าที่ที่รับผิดชอบโดยตรง เพื่อลงพื้นที่เริ่มแก้ไขปัญหา</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">✅</div>
                <h3>3. แจ้งผลการแก้ไข</h3>
                <p>เมื่อดำเนินการเสร็จสิ้น คุณจะได้รับการแจ้งเตือนสถานะผ่านระบบ พร้อมภาพยืนยันหลังการแก้ไข</p>
              </div>

            </div>
          </div>
        </section>
        
      </main>

      {/* --- Footer --- */}
      <footer className="site-footer">
        <div className="container">
          <p className="footer-brand">KHON KAEN UNIVERSITY</p>
          <p className="footer-copy">
            © {new Date().getFullYear()} KKU Care — แพลตฟอร์มรายงานปัญหาอัจฉริยะสำหรับนักศึกษาและบุคลากร
          </p>
        </div>
      </footer>

    </div>
  );
}