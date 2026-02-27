// app/status/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './status.module.css';

export default function StatusPage() {
  const [myIssues, setMyIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State สำหรับ Modal แก้ไข
  const [editingIssue, setEditingIssue] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ title: '', location: '', description: '', category: '' });

  // ฟังก์ชันโหลดข้อมูล
  const fetchMyIssues = async () => {
    try {
      const res = await fetch('/api/issues'); 
      if (res.ok) {
        const data = await res.json();
        setMyIssues(data.issues || []);
      }
    } catch (error) {
      console.error('Error fetching issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyIssues(); }, []);

  // --- ฟังก์ชันลบ (Delete) ---
  const handleDelete = async (ticketId: string) => {
    if (!confirm('ยืนยันที่จะลบรายการนี้? (ไม่สามารถกู้คืนได้)')) return;

    try {
      const res = await fetch(`/api/issues/${ticketId}`, { method: 'DELETE' });
      if (res.ok) {
        alert('ลบรายการสำเร็จ');
        setMyIssues(prev => prev.filter(issue => issue.ticketId !== ticketId));
      } else {
        alert('เกิดข้อผิดพลาดในการลบ');
      }
    } catch (error) {
      alert('เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ');
    }
  };

  // --- ฟังก์ชันแก้ไข (Update) ---
  const handleEditClick = (issue: any) => {
    setEditingIssue(issue);
    setEditForm({
      title: issue.title,
      location: issue.location,
      description: issue.description || '',
      category: issue.category
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/issues/${editingIssue.ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        alert('อัปเดตข้อมูลสำเร็จ');
        setEditingIssue(null);
        fetchMyIssues();
      } else {
        alert('เกิดข้อผิดพลาดในการอัปเดต');
      }
    } catch (error) {
      alert('เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ');
    }
  };

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'pending': return { text: 'รอรับเรื่อง', className: styles.status_pending };
      case 'in_progress': return { text: 'กำลังดำเนินการ', className: styles.status_in_progress };
      case 'resolved': return { text: 'เสร็จสิ้น', className: styles.status_resolved };
      case 'rejected': return { text: 'ยกเลิก', className: styles.status_rejected };
      default: return { text: status, className: styles.status_pending };
    }
  };

  return (
    <div className={styles.appContainer}>
      
      {/* --- Top Navigation Bar --- */}
      <nav className={styles.topbar}>
        <Link href="/" className={styles.brand}>
          KKU Care
        </Link>
        <div className={styles.navMenu}>
          <Link href="/report" className={styles.navItem}>
            <span>📢</span> แจ้งปัญหา
          </Link>
          <Link href="/status" className={`${styles.navItem} ${styles.active}`}>
            <span>📋</span> ติดตามสถานะ
          </Link>
          <Link href="/" className={styles.navItem} style={{marginLeft: '8px', borderLeft: '1px solid #e2e8f0', paddingLeft: '20px', borderRadius: 0}}>
            กลับหน้าหลัก
          </Link>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <div className={styles.content}>
        <div className={styles.pageHeader}>
          <h1>รายการแจ้งปัญหาของฉัน</h1>
          <p>ติดตามความคืบหน้าและจัดการข้อมูลการแจ้งซ่อมของคุณ</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>⏳ กำลังโหลดข้อมูล...</div>
        ) : myIssues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#64748b' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📝</div>
            คุณยังไม่มีรายการแจ้งปัญหาในระบบ<br/>
            <Link href="/report" style={{ color: '#A32638', textDecoration: 'none', fontWeight: 600, display: 'inline-block', marginTop: '12px' }}>คลิกที่นี่เพื่อแจ้งปัญหาแรกของคุณ</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {myIssues.map((issue) => {
              const status = getStatusDisplay(issue.status);
              return (
                <div key={issue.ticketId} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div>
                      <div className={styles.ticketId}>#{issue.ticketId}</div>
                      <div className={styles.cardTitle}>{issue.title}</div>
                    </div>
                    <div className={`${styles.statusBadge} ${status.className}`}>
                      <span className={styles.dot}></span> {status.text}
                    </div>
                  </div>

                  <div className={styles.cardMeta}>
                    <span>📍 {issue.location}</span>
                    <span>📂 {issue.category}</span>
                    <span>📅 {new Date(issue.createdAt).toLocaleDateString('th-TH', { day:'2-digit', month:'short', year:'numeric' })}</span>
                  </div>

                  {/* แสดงรูปภาพถ้ามี */}
                  {issue.image && (
                    <div style={{ marginBottom: '16px' }}>
                      <img src={issue.image} alt="Issue" style={{ width: '100%', maxWidth: '200px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    </div>
                  )}

                  <div className={styles.cardFooter}>
                    {/* อนุญาตให้แก้ไข/ลบ เฉพาะรายการที่ยังรอรับเรื่องอยู่ */}
                    {issue.status === 'pending' ? (
                      <>
                        <button onClick={() => handleDelete(issue.ticketId)} className={styles.btnDanger}>
                          🗑️ ยกเลิก / ลบ
                        </button>
                        <button onClick={() => handleEditClick(issue)} className={styles.btnAction}>
                          ✏️ แก้ไขข้อมูล
                        </button>
                      </>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>* ไม่สามารถแก้ไขได้เนื่องจากรับเรื่องแล้ว</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* --- Edit Modal --- */}
      {editingIssue && (
        <div className={styles.modalOverlay} onClick={() => setEditingIssue(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2>✏️ แก้ไขข้อมูล (Ticket #{editingIssue.ticketId})</h2>
            <form onSubmit={handleUpdate}>
              
              <div className={styles.formGroup}>
                <label>หัวข้อปัญหา</label>
                <input 
                  type="text" 
                  className={styles.inputField}
                  value={editForm.title} 
                  onChange={e => setEditForm({...editForm, title: e.target.value})} 
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>หมวดหมู่</label>
                <select 
                  className={styles.inputField}
                  value={editForm.category} 
                  onChange={e => setEditForm({...editForm, category: e.target.value})}
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
                <label>สถานที่เกิดเหตุ</label>
                <input 
                  type="text" 
                  className={styles.inputField}
                  value={editForm.location} 
                  onChange={e => setEditForm({...editForm, location: e.target.value})}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>รายละเอียดเพิ่มเติม</label>
                <textarea 
                  className={styles.inputField}
                  value={editForm.description} 
                  onChange={e => setEditForm({...editForm, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setEditingIssue(null)} className={styles.btnAction}>
                  ยกเลิก
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  บันทึกการแก้ไข
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}