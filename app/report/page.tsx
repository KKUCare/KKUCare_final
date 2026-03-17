// app/report/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './report.module.css';

const CATEGORIES = [
  { value: 'ทั่วไป',             icon: '🔧' },
  { value: 'ไฟฟ้า/แสงสว่าง',    icon: '💡' },
  { value: 'ประปา',              icon: '🚿' },
  { value: 'ไอที/เครือข่าย',     icon: '📡' },
  { value: 'ความสะอาด/ขยะ',     icon: '🧹' },
];

const TIPS = [
  {
    num: '1', icon: '📍',
    title: 'ระบุสถานที่ให้ชัดเจน',
    desc:  'ระบุตึก ชั้น และบริเวณให้แม่นยำ ช่วยให้เจ้าหน้าที่เข้าถึงพื้นที่ได้ทันที',
  },
  {
    num: '2', icon: '📸',
    title: 'แนบภาพถ่ายประกอบ',
    desc:  'ภาพช่วยให้ทีมงานเข้าใจความรุนแรงและเตรียมอุปกรณ์ได้ถูกต้อง',
  },
  {
    num: '3', icon: '🔔',
    title: 'ติดตามสถานะแบบเรียลไทม์',
    desc:  'หลังส่งแล้ว ติดตามความคืบหน้าได้ที่หน้า "ติดตามสถานะ" ทันที',
  },
];

export default function ReportPage() {
  const router = useRouter();
  const [loading,       setLoading]       = useState(false);
  const [submitError,   setSubmitError]   = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview,  setImagePreview]  = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '', category: 'ทั่วไป', location: '', description: '',
  });

  useEffect(() => {
    const handleResize = () => {
      document.body.style.overflow = window.innerWidth > 860 ? 'hidden' : 'auto';
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = 'auto';
    };
  }, []);

  const set = (key: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setFormData(f => ({ ...f, [key]: e.target.value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => { setSelectedImage(null); setImagePreview(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError('');
    try {
      const data = new FormData();
      data.append('title',       formData.title);
      data.append('category',    formData.category);
      data.append('location',    formData.location);
      data.append('description', formData.description);
      if (selectedImage) data.append('image', selectedImage);

      const res = await fetch('/api/issues', { method: 'POST', body: data });
      if (res.ok) {
        router.push('/status');
      } else {
        const err = await res.json();
        setSubmitError(err.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      }
    } catch {
      setSubmitError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>

      {/* ── TOPBAR ──────────────────────────────────────────── */}
      <nav className={styles.topbar}>
        <div className={styles.navContainer}>

          <Link href="/" className={styles.brand}>
            <div className={styles.brandMark}>K</div>
            <span className={styles.brandText}>KKU<span>Care</span></span>
          </Link>

          <div className={styles.navMenu}>
            <Link href="/"       className={styles.navLink}>หน้าหลัก</Link>
            <Link href="/report" className={`${styles.navLink} ${styles.navLinkActive}`}>แจ้งปัญหา</Link>
            <Link href="/status" className={styles.navLink}>ติดตามสถานะ</Link>
          </div>

          <div className={styles.navActions}>
            <Link href="/" className={styles.btnNavGhost}>← กลับหน้าหลัก</Link>
          </div>

        </div>
      </nav>

      {/* ── SPLIT BODY ──────────────────────────────────────── */}
      <div className={styles.body}>

        {/* LEFT — info panel */}
        <aside className={styles.leftPanel}>
          <div className={styles.blob1} aria-hidden="true" />
          <div className={styles.blob2} aria-hidden="true" />
          <div className={styles.dots}  aria-hidden="true" />

          <div className={styles.leftInner}>

            <div className={styles.leftTop}>
              <p className={styles.leftEyebrow}>Report an Issue</p>
              <h1 className={styles.leftTitle}>
                แจ้งปัญหา<br />
                <span className={styles.leftTitleAccent}>ภายใน มข.</span>
              </h1>
              <p className={styles.leftDesc}>
                กรอกข้อมูลให้ครบถ้วน เพื่อให้เจ้าหน้าที่ดำเนินการแก้ไขได้รวดเร็วและตรงจุด
              </p>
            </div>

            <div className={styles.tipList}>
              {TIPS.map(t => (
                <div key={t.num} className={styles.tipItem}>
                  <div className={styles.tipBullet}>
                    <span className={styles.tipBulletIcon}>{t.icon}</span>
                    <span className={styles.tipBulletNum}>{t.num}</span>
                  </div>
                  <div className={styles.tipBody}>
                    <div className={styles.tipTitle}>{t.title}</div>
                    <div className={styles.tipDesc}>{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.leftFooter}>
              <div className={styles.liveChip}>
                <span className={styles.liveDot} />
                เจ้าหน้าที่ออนไลน์อยู่
              </div>
              <span className={styles.leftFooterNote}>ตอบสนองภายใน 48 ชม.</span>
            </div>

          </div>
        </aside>

        {/* RIGHT — form */}
        <section className={styles.rightPanel}>
          <div className={styles.formWrap}>

            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>ฟอร์มแจ้งปัญหา</h2>
              <p className={styles.formSub}><span className={styles.req}>*</span> จำเป็นต้องกรอก</p>
            </div>

            {submitError && (
              <div className={styles.errorBox} role="alert">
                <span>⚠</span> {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>

              {/* Title */}
              <div className={styles.fg}>
                <label className={styles.fl}>หัวข้อปัญหา <span className={styles.req}>*</span></label>
                <input
                  type="text" className={styles.fi}
                  placeholder="เช่น แอร์ไม่เย็น, หลอดไฟขาด, ก๊อกน้ำรั่ว"
                  required value={formData.title} onChange={set('title')}
                />
              </div>

              {/* Category + Location */}
              <div className={styles.frow}>
                <div className={styles.fg}>
                  <label className={styles.fl}>หมวดหมู่</label>
                  <div className={styles.selWrap}>
                    <select className={styles.fi} value={formData.category} onChange={set('category')}>
                      {CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.icon} {c.value}</option>
                      ))}
                    </select>
                    <span className={styles.selArrow} aria-hidden="true">▾</span>
                  </div>
                </div>
                <div className={styles.fg}>
                  <label className={styles.fl}>สถานที่เกิดเหตุ <span className={styles.req}>*</span></label>
                  <input
                    type="text" className={styles.fi}
                    placeholder="ตึก / ชั้น / บริเวณ"
                    required value={formData.location} onChange={set('location')}
                  />
                </div>
              </div>

              {/* Description + Image */}
              <div className={styles.frow}>
                <div className={styles.fg}>
                  <label className={styles.fl}>รายละเอียด<span className={styles.opt}> (ไม่บังคับ)</span></label>
                  <textarea
                    rows={3} className={`${styles.fi} ${styles.ta}`}
                    placeholder="อธิบายเพิ่มเติม..."
                    value={formData.description} onChange={set('description')}
                  />
                </div>
                <div className={styles.fg}>
                  <label className={styles.fl}>ภาพถ่าย<span className={styles.opt}> (แนะนำ)</span></label>
                  {!imagePreview ? (
                    <label className={styles.uploadZone}>
                      <span className={styles.uploadIcon}>📸</span>
                      <span className={styles.uploadCta}>คลิกหรือลากมาวาง</span>
                      <span className={styles.uploadHint}>JPG · PNG · WEBP · ≤ 5 MB</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className={styles.hiddenFile} />
                    </label>
                  ) : (
                    <div className={styles.preview}>
                      <img src={imagePreview} alt="preview" className={styles.previewImg} />
                      <div className={styles.previewGrad} aria-hidden="true" />
                      <span className={styles.previewLabel}>ภาพที่เลือก</span>
                      <button type="button" className={styles.previewRemove} onClick={handleRemoveImage} aria-label="ลบรูป">
                        <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
                          <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className={styles.ffoot}>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? <><span className={styles.spinner} /> กำลังส่ง...</> : 'ยืนยันการแจ้งปัญหา →'}
                </button>
              </div>

            </form>
          </div>
        </section>

      </div>
    </div>
  );
}