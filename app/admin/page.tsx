// app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './admin.module.css';

export default function AdminDashboard() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');
  const router = useRouter();

  // State สำหรับ กรองข้อมูล
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // State สำหรับ Drawer (Slide-over)
  const [drawerIssue, setDrawerIssue] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', location: '', description: '', category: '', status: '' });

  const fetchAllIssues = async () => {
    try {
      const authRes = await fetch('/api/auth/me');
      if (authRes.ok) {
        const authData = await authRes.json();
        setUserRole(authData.user?.role || '');
      }

      const res = await fetch('/api/issues?mode=admin');
      if (res.ok) {
        const data = await res.json();
        setIssues(data.issues);
      } else {
        router.push('/login');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllIssues(); }, []);

  // เปิด Drawer
  const openDrawer = (issue: any) => {
    setDrawerIssue(issue);
    setIsEditMode(false);
    setEditForm({
      title: issue.title,
      location: issue.location,
      description: issue.description,
      category: issue.category,
      status: issue.status
    });
  };

  const closeDrawer = () => {
    setDrawerIssue(null);
    setIsEditMode(false);
  };

  const handleUpdate = async () => {
    if (!drawerIssue) return;
    try {
      const res = await fetch(`/api/issues/${drawerIssue.ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        fetchAllIssues();
        setIsEditMode(false);
        setDrawerIssue({ ...drawerIssue, ...editForm });
      } else {
        alert('แก้ไขไม่สำเร็จ');
      }
    } catch (error) { alert('Error updating'); }
  };

  const handleDelete = async (ticketId: string) => {
    if (!confirm('⚠️ ลบใบงานนี้ถาวร ใช่หรือไม่?')) return;
    try {
      const res = await fetch(`/api/issues/${ticketId}`, { method: 'DELETE' });
      if (res.ok) {
        setIssues(prev => prev.filter(item => item.ticketId !== ticketId));
        closeDrawer();
      }
    } catch (error) { alert('Error deleting'); }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      issue.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (issue.reporter?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || issue.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || issue.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusText = (status: string) => {
    switch(status) {
      case 'pending': return 'รอรับเรื่อง';
      case 'in_progress': return 'กำลังดำเนินการ';
      case 'resolved': return 'เสร็จสิ้น';
      case 'rejected': return 'ยกเลิก';
      default: return status;
    }
  };

  return (
    <div className={styles.appContainer}>
      
      {/* --- Top Navigation Bar --- */}
      <nav className={styles.topbar}>
        <div className={styles.brand}>
          KKU Care
        </div>
        <div className={styles.navMenu}>
          <Link href="/admin" className={`${styles.navItem} ${styles.active}`}>
            <span className={styles.navIcon}>📋</span> จัดการปัญหา
          </Link>
          <Link href="/admin/stats" className={styles.navItem}>
            <span className={styles.navIcon}>📈</span> สถิติภาพรวม
          </Link>
          <Link href="/" className={styles.navItem} style={{marginLeft: '16px', borderLeft: '1px solid #e2e8f0', paddingLeft: '24px', borderRadius: 0}}>
            กลับหน้าหลัก
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className={styles.content}>
        
        <div className={styles.pageHeader}>
          <h1>ระบบจัดการคำร้อง (Admin)</h1>
          <p>ตรวจสอบ อัปเดตสถานะ และจัดการปัญหาที่ได้รับแจ้งจากผู้ใช้งาน</p>
        </div>

        {/* Toolbar (Search & Filter) */}
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <span>🔍</span>
            <input 
              type="text" 
              placeholder="ค้นหา Ticket ID, หัวข้อ หรือชื่อผู้แจ้ง..." 
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select className={styles.filterSelect} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">สถานะทั้งหมด</option>
            <option value="pending">รอรับเรื่อง</option>
            <option value="in_progress">กำลังดำเนินการ</option>
            <option value="resolved">เสร็จสิ้น</option>
            <option value="rejected">ยกเลิก</option>
          </select>

          <select className={styles.filterSelect} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="All">ทุกหมวดหมู่</option>
            <option value="ทั่วไป">ทั่วไป</option>
            <option value="ไฟฟ้า/แสงสว่าง">ไฟฟ้า/แสงสว่าง</option>
            <option value="ประปา">ประปา</option>
            <option value="ไอที/เครือข่าย">ไอที/เครือข่าย</option>
            <option value="ความปลอดภัย">ความปลอดภัย</option>
            <option value="ความสะอาด">ความสะอาด</option>
          </select>
          
          <span style={{fontSize:'0.85rem', color:'#64748b', marginLeft:'auto', fontWeight: 500}}>
            พบข้อมูล {filteredIssues.length} รายการ
          </span>
        </div>

        {/* The List */}
        <div className={styles.listContainer}>
          <div className={styles.listHeader}>
            <div>Ticket ID</div>
            <div>รายละเอียดปัญหา</div>
            <div className={styles.hideMobile}>หมวดหมู่</div>
            <div>สถานะ</div>
            <div style={{textAlign:'right'}}>วันที่แจ้ง</div>
          </div>

          {filteredIssues.length === 0 ? (
            <div style={{padding:'60px', textAlign:'center', color:'#94a3b8'}}>ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา</div>
          ) : (
            filteredIssues.map((issue) => (
              <div key={issue.ticketId} className={styles.listItem} onClick={() => openDrawer(issue)}>
                <div className={styles.ticketId}>#{issue.ticketId}</div>
                <div style={{paddingRight: '20px'}}>
                  <div className={styles.itemTitle}>{issue.title}</div>
                  <div className={styles.itemDesc}>{issue.location} • แจ้งโดย {issue.reporter?.name}</div>
                </div>
                <div className={styles.hideMobile} style={{fontSize:'0.9rem', color:'#475569'}}>{issue.category}</div>
                <div>
                  <div className={styles.statusBadge}>
                    <span className={`${styles.dot} ${styles['dot_' + issue.status]}`}></span>
                    {getStatusText(issue.status)}
                  </div>
                </div>
                <div style={{textAlign:'right', fontSize:'0.85rem', color:'#64748b'}}>
                  {new Date(issue.createdAt).toLocaleDateString('th-TH', { day:'2-digit', month:'short' })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- Slide Over Drawer (View / Edit) --- */}
      {drawerIssue && (
        <div className={styles.drawerOverlay} onClick={closeDrawer}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            
            <div className={styles.drawerHeader}>
              <h2>{isEditMode ? 'แก้ไขข้อมูลปัญหา' : 'รายละเอียดใบงาน'}</h2>
              <button onClick={closeDrawer} style={{background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer', color:'#64748b'}}>✖</button>
            </div>

            <div className={styles.drawerBody}>
              {/* สลับระหว่างโหมดดู และ โหมดแก้ไข */}
              {!isEditMode ? (
                <>
                  <div className={styles.detailGroup}>
                    <span className={styles.detailLabel}>Ticket ID</span>
                    <span className={styles.ticketId} style={{fontSize:'1.1rem', color:'#0f172a'}}>#{drawerIssue.ticketId}</span>
                  </div>
                  <div className={styles.detailGroup}>
                    <span className={styles.detailLabel}>ผู้แจ้งเรื่อง</span>
                    <div className={styles.detailValue}>{drawerIssue.reporter?.name} <span style={{color:'#64748b', fontSize:'0.85rem'}}>({drawerIssue.reporter?.email})</span></div>
                  </div>
                  <div className={styles.detailGroup}>
                    <span className={styles.detailLabel}>สถานะปัจจุบัน</span>
                    <div className={styles.statusBadge} style={{width:'fit-content', background:'transparent', padding:0, fontSize:'1rem'}}>
                      <span className={`${styles.dot} ${styles['dot_' + drawerIssue.status]}`}></span>
                      {getStatusText(drawerIssue.status)}
                    </div>
                  </div>
                  <div className={styles.detailGroup}>
                    <span className={styles.detailLabel}>หัวข้อปัญหา</span>
                    <div className={styles.detailValue} style={{fontWeight: 600}}>{drawerIssue.title}</div>
                  </div>
                  <div className={styles.detailGroup}>
                    <span className={styles.detailLabel}>รายละเอียดเพิ่มเติม</span>
                    <div className={styles.detailValue} style={{whiteSpace:'pre-wrap'}}>{drawerIssue.description || '-'}</div>
                  </div>
                  <div className={styles.detailGroup}>
                    <span className={styles.detailLabel}>สถานที่ & หมวดหมู่</span>
                    <div className={styles.detailValue}>📍 {drawerIssue.location} <br/><br/> 📂 {drawerIssue.category}</div>
                  </div>
                  {drawerIssue.image && (
                    <div className={styles.detailGroup}>
                      <span className={styles.detailLabel}>ภาพถ่ายแนบ</span>
                      <img src={drawerIssue.image} alt="Issue" style={{width:'100%', borderRadius:'12px', border:'1px solid #e2e8f0'}} />
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* ฟอร์มแก้ไขข้อมูล */}
                  <div className={styles.detailGroup}>
                    <label className={styles.detailLabel}>สถานะการดำเนินการ</label>
                    <select className={styles.inputField} value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                      <option value="pending">รอรับเรื่อง</option>
                      <option value="in_progress">กำลังดำเนินการ</option>
                      <option value="resolved">เสร็จสิ้น</option>
                      <option value="rejected">ยกเลิก</option>
                    </select>
                  </div>
                  <div className={styles.detailGroup}>
                    <label className={styles.detailLabel}>หัวข้อปัญหา</label>
                    <input type="text" className={styles.inputField} value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                  </div>
                  <div className={styles.detailGroup}>
                    <label className={styles.detailLabel}>หมวดหมู่</label>
                    <select className={styles.inputField} value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                      <option value="ทั่วไป">ทั่วไป</option>
                      <option value="ไฟฟ้า/แสงสว่าง">ไฟฟ้า/แสงสว่าง</option>
                      <option value="ประปา">ประปา</option>
                      <option value="ไอที/เครือข่าย">ไอที/เครือข่าย</option>
                      <option value="ความปลอดภัย">ความปลอดภัย</option>
                      <option value="ความสะอาด">ความสะอาด</option>
                    </select>
                  </div>
                  <div className={styles.detailGroup}>
                    <label className={styles.detailLabel}>สถานที่</label>
                    <input type="text" className={styles.inputField} value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} />
                  </div>
                  <div className={styles.detailGroup}>
                    <label className={styles.detailLabel}>รายละเอียด</label>
                    <textarea rows={4} className={styles.inputField} value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                  </div>
                </>
              )}
            </div>

            <div className={styles.drawerFooter}>
              {isEditMode ? (
                <>
                  <button onClick={() => setIsEditMode(false)} className={styles.btnOutline}>ยกเลิก</button>
                  <button onClick={handleUpdate} className={styles.btnPrimary}>บันทึกข้อมูล</button>
                </>
              ) : (
                <>
                  {userRole === 'admin' && (
                    <button onClick={() => handleDelete(drawerIssue.ticketId)} className={styles.btnOutline} style={{color:'#EF4444', borderColor:'#FECACA', marginRight:'auto'}}>
                      ลบข้อมูล
                    </button>
                  )}
                  {userRole === 'admin' && (
                    <button onClick={() => setIsEditMode(true)} className={styles.btnPrimary}>
                      แก้ไขสถานะ
                    </button>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}