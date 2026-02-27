// app/report/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './report.module.css';

export default function ReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State สำหรับข้อมูล Text
  const [formData, setFormData] = useState({
    title: '',
    category: 'ทั่วไป',
    location: '',
    description: ''
  });

  // State สำหรับไฟล์รูปภาพ
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // ฟังก์ชันจัดการเมื่อเลือกรูป
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // ลบรูปภาพที่เลือกไว้
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('location', formData.location);
      data.append('description', formData.description);
      
      if (selectedImage) {
        data.append('image', selectedImage);
      }

      const res = await fetch('/api/issues', {
        method: 'POST',
        body: data,
      });

      if (res.ok) {
        alert('ส่งรายงานปัญหาเรียบร้อยแล้ว!');
        router.push('/status'); // ส่งเสร็จแล้วเด้งไปหน้าเช็คสถานะ
      } else {
        const errorData = await res.json();
        alert(`เกิดข้อผิดพลาด: ${errorData.error}`);
      }
    } catch (error) {
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.appContainer}>
      
      <nav className={styles.topbar}>
        <Link href="/" className={styles.brand}>
          KKU Care
        </Link>
        <div className={styles.navMenu}>
          <Link href="/report" className={`${styles.navItem} ${styles.active}`}>
            <span>📢</span> แจ้งปัญหา
          </Link>
          <Link href="/status" className={styles.navItem}>
            <span>📋</span> ติดตามสถานะ
          </Link>
          <Link href="/" className={styles.navItem} style={{marginLeft: '8px', borderLeft: '1px solid #e2e8f0', paddingLeft: '20px', borderRadius: 0}}>
            กลับหน้าหลัก
          </Link>
        </div>
      </nav>

      <div className={styles.content}>
        <div className={styles.formCard}>
          
          <div className={styles.formHeader}>
            <h1>แจ้งปัญหา / แจ้งซ่อม</h1>
            <p>กรุณากรอกข้อมูลให้ครบถ้วน เพื่อความรวดเร็วในการดำเนินการ</p>
          </div>

          <form onSubmit={handleSubmit}>
            
            <div className={styles.formGroup}>
              <label>หัวข้อปัญหา <span className={styles.required}>*</span></label>
              <input 
                type="text" 
                placeholder="เช่น แอร์ไม่เย็น, หลอดไฟทางเดินขาด, ก๊อกน้ำรั่ว"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className={styles.formGroup}>
              <label>หมวดหมู่ที่เกี่ยวข้อง <span className={styles.required}>*</span></label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="ทั่วไป">ทั่วไป</option>
                <option value="ไฟฟ้า/แสงสว่าง">ไฟฟ้า/แสงสว่าง</option>
                <option value="ประปา">ประปา</option>
                <option value="ไอที/เครือข่าย">ไอที/เครือข่าย</option>
                <option value="ความปลอดภัย">ความปลอดภัย/จราจร</option>
                <option value="ความสะอาด">ความสะอาด/ขยะ</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>สถานที่เกิดเหตุ <span className={styles.required}>*</span></label>
              <input 
                type="text" 
                placeholder="ระบุตึก ชั้น หรือ บริเวณที่พบปัญหาให้ชัดเจนที่สุด"
                required
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>

            <div className={styles.formGroup}>
              <label>รายละเอียดเพิ่มเติม</label>
              <textarea 
                rows={4}
                placeholder="อธิบายลักษณะปัญหาเพิ่มเติมเพื่อให้เจ้าหน้าที่เตรียมอุปกรณ์ได้ถูกต้อง..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>

            {/* ส่วนอัปโหลดรูปภาพที่ปรับปรุงใหม่ */}
            <div className={styles.formGroup}>
              <label>ภาพถ่ายประกอบ <span style={{color:'#94a3b8', fontSize:'0.85rem', fontWeight:'normal'}}>(แนะนำ)</span></label>
              
              {!imagePreview ? (
                <div className={styles.uploadZone}>
                  <div className={styles.uploadIcon}>📸</div>
                  <div className={styles.uploadText}>คลิกเพื่อเลือกรูปภาพ หรือลากรูปมาวาง</div>
                  <div className={styles.uploadSubText}>รองรับไฟล์ JPG, PNG, WEBP (สูงสุด 5MB)</div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className={styles.hiddenInput}
                  />
                </div>
              ) : (
                <div className={styles.previewContainer}>
                  <img src={imagePreview} alt="Preview" className={styles.previewImage} />
                  <button type="button" onClick={handleRemoveImage} className={styles.removeImageBtn} title="ลบรูปภาพ">
                    ✖
                  </button>
                </div>
              )}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? '⏳ กำลังส่งข้อมูล...' : '🚀 ยืนยันการแจ้งปัญหา'}
            </button>
            
          </form>
        </div>
      </div>
    </div>
  );
}