// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './globals.module.css';

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName]     = useState('');
  const [userRole, setUserRole]     = useState<string | null>(null);
  const [scrolled, setScrolled]     = useState(false);

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
      } catch { /* silent */ }
    };
    checkUserSession();

    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsLoggedIn(false);
      setUserName('');
      setUserRole(null);
      window.location.reload();
    } catch { /* silent */ }
  };

  const isStaffOrAdmin = userRole === 'admin' || userRole?.startsWith('staff_');
  const reportHref     = isLoggedIn ? '/report' : '/login';

  return (
    <div className={styles.page}>

      {/* ── TOPBAR ─────────────────────────────────────────── */}
      <nav className={`${styles.topbar} ${scrolled ? styles.topbarScrolled : ''}`}>
        <div className={styles.navContainer}>

          <Link href="/" className={styles.brand}>
            <div className={styles.brandMark}>K</div>
            <span className={styles.brandText}>
              KKU<span>Care</span>
            </span>
          </Link>

          <div className={styles.navMenu}>
            <Link href="/"       className={`${styles.navLink} ${styles.navLinkActive}`}>หน้าหลัก</Link>
            <Link href="/report" className={styles.navLink}>แจ้งปัญหา</Link>
            <Link href="/status" className={styles.navLink}>ติดตามสถานะ</Link>
            {isStaffOrAdmin && (
              <Link href="/admin" className={`${styles.navLink} ${styles.navLinkAdmin}`}>
                ระบบจัดการ
              </Link>
            )}
          </div>

          <div className={styles.navActions}>
            {isLoggedIn ? (
              <>
                <span className={`${styles.userChip} ${styles.hideOnMobile}`}>
                  <span className={styles.userChipDot} />
                  {userName}
                </span>
                <button onClick={handleLogout} className={styles.btnNavGhost}>
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <>
                <button onClick={() => router.push('/login')}    className={styles.btnNavGhost}>
                  เข้าสู่ระบบ
                </button>
                <button onClick={() => router.push('/register')} className={styles.btnNavPrimary}>
                  สมัครสมาชิก
                </button>
              </>
            )}
          </div>

        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true">
          <div className={styles.heroBgGlow1} />
          <div className={styles.heroBgGlow2} />
          <div className={styles.heroDots} />
        </div>

        <div className={styles.heroInner}>

          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            พร้อมรับเรื่องตลอด 24 ชั่วโมง
          </div>

          <h1 className={styles.heroTitle}>
            แจ้งปัญหา<br />
            <span className={styles.heroTitleAccent}>ภายในมหาวิทยาลัย</span><br />
            ได้ทุกที่ทุกเวลา
          </h1>

          <p className={styles.heroSubtitle}>
            พบเห็นสาธารณูปโภคชำรุด ความไม่ปลอดภัย หรือปัญหาในพื้นที่ มข.
            แจ้งเรื่องผ่านแพลตฟอร์มของเรา แล้วติดตามความคืบหน้าแบบเรียลไทม์
          </p>

          <div className={styles.heroActions}>
            <Link href={reportHref} className={styles.btnPrimary}>
              สร้างรายการแจ้งปัญหา →
            </Link>
            <Link href="/status" className={styles.btnGhost}>
              ดูสถานะการแก้ไข
            </Link>
          </div>

          {/* Stats */}
          <div className={styles.heroStats}>
            {[
              { num: '1,240+', label: 'เรื่องที่แก้ไขแล้ว' },
              { num: '98%',    label: 'อัตราความพึงพอใจ'  },
              { num: '< 48h', label: 'เฉลี่ยเวลาแก้ไข'   },
            ].map((s) => (
              <div key={s.label} className={styles.statItem}>
                <div className={styles.statNum}>{s.num}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section className={styles.sectionHow}>
        <div className={styles.sectionHowBg} aria-hidden="true" />
        <div className={styles.sectionInner}>
          <p className={styles.sectionLabel}>วิธีการใช้งาน</p>
          <h2 className={styles.sectionTitle}>ง่ายแค่ 3 ขั้นตอน</h2>

          <div className={styles.stepsGrid}>
            {[
              {
                emoji: '📸', num: '1',
                title: 'ถ่ายภาพและระบุจุด',
                desc:  'ถ่ายรูปปัญหาที่พบ พร้อมระบุสถานที่ให้ชัดเจน เพื่อให้เจ้าหน้าที่เข้าถึงพื้นที่ได้อย่างแม่นยำ',
              },
              {
                emoji: '⚡', num: '2',
                title: 'รับเรื่องและดำเนินการ',
                desc:  'ระบบส่งข้อมูลแจ้งเตือนไปยังเจ้าหน้าที่ที่รับผิดชอบโดยตรง เพื่อลงพื้นที่แก้ไขปัญหาทันที',
              },
              {
                emoji: '✅', num: '3',
                title: 'แจ้งผลการแก้ไข',
                desc:  'เมื่อดำเนินการเสร็จ คุณจะได้รับแจ้งเตือนสถานะผ่านระบบ พร้อมภาพยืนยันหลังการแก้ไข',
              },
            ].map((s) => (
              <div key={s.num} className={styles.stepCard}>
                <div className={styles.stepNum}>
                  {s.emoji}
                  <span className={styles.stepNumLabel}>{s.num}</span>
                </div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ───────────────────────────────────────── */}
      <section className={styles.ctaBand}>
        <div className={styles.ctaBandBg} aria-hidden="true" />
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>
            พร้อมแล้ว?<br />
            มาช่วยกัน<em>พัฒนา มข.</em>
          </h2>
          <p className={styles.ctaSub}>
            ทุกรายงานของคุณมีความหมาย — ร่วมสร้างสภาพแวดล้อมที่ดีขึ้น
            สำหรับนักศึกษาและบุคลากรทุกคน
          </p>
          <Link href={reportHref} className={styles.btnCtaPrimary}>
            เริ่มแจ้งปัญหาเลย →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <p className={styles.footerBrand}>KHON KAEN UNIVERSITY</p>
        <p className={styles.footerCopy}>
          © {new Date().getFullYear()} KKU Care — แพลตฟอร์มรายงานปัญหาอัจฉริยะ
          สำหรับนักศึกษาและบุคลากร
        </p>
      </footer>

    </div>
  );
}