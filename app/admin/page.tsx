// app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './admin.module.css';

// ── Constants ─────────────────────────────────────────────────
const ROLE_CATEGORY_MAP: Record<string, string> = {
  staff_general:     'ทั่วไป',
  staff_electricity: 'ไฟฟ้า/แสงสว่าง',
  staff_water:       'ประปา',
  staff_it:          'ไอที/เครือข่าย',
  staff_security:    'ความปลอดภัย',
  staff_cleaning:    'ความสะอาด',
};

const CATEGORY_EMOJI: Record<string, string> = {
  'ทั่วไป':          '🔧',
  'ไฟฟ้า/แสงสว่าง': '💡',
  'ประปา':           '🚿',
  'ไอที/เครือข่าย':  '📡',
  'ความปลอดภัย':    '🚧',
  'ความสะอาด':      '🧹',
};

const CATEGORIES = ['ทั่วไป', 'ไฟฟ้า/แสงสว่าง', 'ประปา', 'ไอที/เครือข่าย', 'ความสะอาด'];

const STATUS_CONFIG = {
  pending:     { text: 'รอรับเรื่อง',    badgeCls: styles.badge_pending,     dotCls: styles.dot_pending,     bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  in_progress: { text: 'กำลังดำเนินการ', badgeCls: styles.badge_in_progress, dotCls: styles.dot_in_progress, bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  resolved:    { text: 'เสร็จสิ้น',      badgeCls: styles.badge_resolved,    dotCls: styles.dot_resolved,    bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  rejected:    { text: 'ยกเลิก',          badgeCls: styles.badge_rejected,    dotCls: styles.dot_rejected,    bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
} as const;

// ── Component ─────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [issues,   setIssues]   = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [userRole, setUserRole] = useState('');

  const [searchTerm,      setSearchTerm]      = useState('');
  const [filterStatus,    setFilterStatus]    = useState('All');
  const [filterCategory,  setFilterCategory]  = useState('All');

  const [drawerIssue,  setDrawerIssue]  = useState<any | null>(null);
  const [isEditMode,   setIsEditMode]   = useState(false);
  const [editForm,     setEditForm]     = useState({ title: '', location: '', description: '', category: '', status: '' });
  const [savingStatus, setSavingStatus] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────
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

  // ── Drawer ─────────────────────────────────────────────────
  const openDrawer = (issue: any) => {
    setDrawerIssue(issue);
    setIsEditMode(false);
    setEditForm({
      title:       issue.title,
      location:    issue.location,
      description: issue.description || '',
      category:    issue.category,
      status:      issue.status,
    });
  };

  const closeDrawer = () => { setDrawerIssue(null); setIsEditMode(false); };

  // ── Quick status ───────────────────────────────────────────
  const handleQuickStatus = async (newStatus: string) => {
    if (!drawerIssue || newStatus === drawerIssue.status) return;
    setSavingStatus(newStatus);
    try {
      const res = await fetch(`/api/issues/${drawerIssue.ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editForm, status: newStatus }),
      });
      if (res.ok) {
        const updated = { ...drawerIssue, status: newStatus };
        setDrawerIssue(updated);
        setEditForm(f => ({ ...f, status: newStatus }));
        setIssues(prev => prev.map(i => i.ticketId === drawerIssue.ticketId ? updated : i));
      }
    } finally {
      setSavingStatus(null);
    }
  };

  // ── Full edit save ─────────────────────────────────────────
  const handleUpdate = async () => {
    if (!drawerIssue) return;
    try {
      const res = await fetch(`/api/issues/${drawerIssue.ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updated = { ...drawerIssue, ...editForm };
        setDrawerIssue(updated);
        setIssues(prev => prev.map(i => i.ticketId === drawerIssue.ticketId ? updated : i));
        setIsEditMode(false);
      } else {
        alert('แก้ไขไม่สำเร็จ');
      }
    } catch { alert('เกิดข้อผิดพลาด'); }
  };

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async (ticketId: string) => {
    if (!confirm('ลบใบงานนี้ถาวร ใช่หรือไม่?')) return;
    try {
      const res = await fetch(`/api/issues/${ticketId}`, { method: 'DELETE' });
      if (res.ok) {
        setIssues(prev => prev.filter(i => i.ticketId !== ticketId));
        closeDrawer();
      }
    } catch { alert('เกิดข้อผิดพลาด'); }
  };

  // ── Helpers ────────────────────────────────────────────────
  const canEdit = (issue: any) =>
    userRole === 'admin' || ROLE_CATEGORY_MAP[userRole] === issue?.category;

  const getStatusCfg = (s: string) =>
    STATUS_CONFIG[s as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;

  const filteredIssues = issues.filter(issue => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      (issue.ticketId       || '').toLowerCase().includes(q) ||
      (issue.title          || '').toLowerCase().includes(q) ||
      (issue.location       || '').toLowerCase().includes(q) ||
      (issue.reporter?.name || '').toLowerCase().includes(q);
    const matchStatus   = filterStatus   === 'All' || issue.status   === filterStatus;
    const matchCategory = filterCategory === 'All' || issue.category === filterCategory;
    const matchRole     = userRole === 'admin' || ROLE_CATEGORY_MAP[userRole] === issue.category;
    return matchSearch && matchStatus && matchCategory && matchRole;
  });

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className={styles.appContainer}>

      {/* ── TOPBAR — unified pattern ────────────────────────── */}
      <nav className={styles.topbar}>
        <div className={styles.navContainer}>

          {/* Brand */}
          <Link href="/" className={styles.brand}>
            <div className={styles.brandMark}>K</div>
            <span className={styles.brandText}>KKU<span>Care</span></span>
          </Link>

          {/* Nav links — centered */}
          <div className={styles.navMenu}>
            <Link href="/admin"       className={`${styles.navLink} ${styles.navLinkActive}`}>จัดการปัญหา</Link>
            <Link href="/admin/stats" className={styles.navLink}>สถิติภาพรวม</Link>
          </div>

          {/* Right — ปุ่มกลับหน้าหลักอันเดียว */}
          <div className={styles.navActions}>
            <Link href="/" className={styles.btnNavGhost}>← กลับหน้าหลัก</Link>
          </div>

        </div>
      </nav>

      {/* ── MAIN ─────────────────────────────────────────────── */}
      <div className={styles.content}>

        {/* Header */}
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.pageEyebrow}>Admin Panel</p>
            <h1 className={styles.pageTitle}>จัดการคำร้องแจ้งปัญหา</h1>
            <p className={styles.pageSubtitle}>ตรวจสอบและอัปเดตสถานะงานที่ได้รับแจ้ง</p>
          </div>
          <div className={styles.resultCount}>
            พบ <span className={styles.resultCountNum}>{filteredIssues.length}</span> รายการ
          </div>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="ค้นหา Ticket, หัวข้อ, สถานที่ หรือชื่อผู้แจ้ง..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select className={styles.filterSelect} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">สถานะทั้งหมด</option>
            <option value="pending">รอรับเรื่อง</option>
            <option value="in_progress">กำลังดำเนินการ</option>
            <option value="resolved">เสร็จสิ้น</option>
            <option value="rejected">ยกเลิก</option>
          </select>
          <select className={styles.filterSelect} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="All">ทุกหมวดหมู่</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* List */}
        <div className={styles.listContainer}>
          <div className={styles.listHeader}>
            <div>Ticket ID</div>
            <div>รายละเอียด</div>
            <div className={styles.hideMobile}>หมวดหมู่</div>
            <div>สถานะ</div>
            <div style={{ textAlign: 'right' }}>วันที่</div>
          </div>

          {loading ? (
            <div className={styles.loadingDots}><span /><span /><span /></div>
          ) : filteredIssues.length === 0 ? (
            <div className={styles.stateRow}>
              <span className={styles.stateIcon}>🔍</span>
              <p className={styles.stateText}>ไม่พบรายการที่ตรงกับเงื่อนไข</p>
            </div>
          ) : filteredIssues.map(issue => {
            const sc = getStatusCfg(issue.status);
            return (
              <div key={issue.ticketId} className={styles.listItem} onClick={() => openDrawer(issue)}>
                <div className={styles.ticketId}>#{issue.ticketId}</div>
                <div style={{ paddingRight: 16, overflow: 'hidden' }}>
                  <div className={styles.itemTitle}>{issue.title}</div>
                  <div className={styles.itemMeta}>
                    📍 {issue.location}{issue.reporter?.name && ` · ${issue.reporter.name}`}
                  </div>
                </div>
                <div className={styles.hideMobile}>
                  <span className={styles.catBadge}>
                    {CATEGORY_EMOJI[issue.category] ?? '📌'} {issue.category}
                  </span>
                </div>
                <div>
                  <span className={`${styles.statusBadge} ${sc.badgeCls}`}>
                    <span className={`${styles.dot} ${sc.dotCls}`} />
                    {sc.text}
                  </span>
                </div>
                <div className={styles.itemDate}>
                  {new Date(issue.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ── DRAWER ───────────────────────────────────────────── */}
      {drawerIssue && (
        <div className={styles.drawerOverlay} onClick={closeDrawer}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className={styles.drawerHeader}>
              <div>
                <p className={styles.drawerEyebrow}>#{drawerIssue.ticketId}</p>
                <h2 className={styles.drawerTitle}>
                  {isEditMode ? 'แก้ไขข้อมูล' : 'รายละเอียดใบงาน'}
                </h2>
              </div>
              <button className={styles.drawerCloseBtn} onClick={closeDrawer} aria-label="ปิด">
                <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className={styles.drawerBody}>
              {!isEditMode ? (
                <>
                  {/* Quick status */}
                  {canEdit(drawerIssue) && (
                    <div className={styles.detailGroup}>
                      <span className={styles.detailLabel}>เปลี่ยนสถานะ</span>
                      <div className={styles.statusQuickRow}>
                        {(Object.entries(STATUS_CONFIG) as [string, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([key, cfg]) => (
                          <button
                            key={key}
                            className={styles.statusQuickBtn}
                            onClick={() => handleQuickStatus(key)}
                            disabled={savingStatus !== null}
                            style={{
                              background:  drawerIssue.status === key ? cfg.bg    : 'white',
                              color:       drawerIssue.status === key ? cfg.color : '#8a7f76',
                              borderColor: drawerIssue.status === key ? cfg.border : '#e8e0d8',
                              fontWeight:  drawerIssue.status === key ? 700 : 500,
                              opacity:     savingStatus && savingStatus !== key ? 0.4 : 1,
                            }}
                          >
                            {savingStatus === key ? '...' : cfg.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.drawerDivider} />

                  <div className={styles.detailGroup}>
                    <span className={styles.detailLabel}>หัวข้อปัญหา</span>
                    <div className={styles.detailValue} style={{ fontWeight: 600 }}>{drawerIssue.title}</div>
                  </div>

                  <div className={styles.detailGroup}>
                    <span className={styles.detailLabel}>สถานที่ & หมวดหมู่</span>
                    <div className={styles.detailValue}>
                      📍 {drawerIssue.location}<br />
                      {CATEGORY_EMOJI[drawerIssue.category] ?? '📌'} {drawerIssue.category}
                    </div>
                  </div>

                  {drawerIssue.description && (
                    <div className={styles.detailGroup}>
                      <span className={styles.detailLabel}>รายละเอียด</span>
                      <div className={styles.detailValue} style={{ whiteSpace: 'pre-wrap' }}>
                        {drawerIssue.description}
                      </div>
                    </div>
                  )}

                  <div className={styles.detailGroup}>
                    <span className={styles.detailLabel}>ผู้แจ้งเรื่อง</span>
                    <div className={styles.detailValue}>
                      {drawerIssue.reporter?.name}
                      {drawerIssue.reporter?.email && (
                        <span className={styles.reporterEmail}>{drawerIssue.reporter.email}</span>
                      )}
                    </div>
                  </div>

                  {drawerIssue.image && (
                    <div className={styles.detailGroup}>
                      <span className={styles.detailLabel}>ภาพถ่ายแนบ</span>
                      <img src={drawerIssue.image} alt="Issue" className={styles.drawerImage} />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className={styles.detailGroup}>
                    <label className={styles.detailLabel}>สถานะการดำเนินการ</label>
                    <select className={styles.inputField} value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                      {(Object.entries(STATUS_CONFIG) as [string, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([key, cfg]) => (
                        <option key={key} value={key}>{cfg.text}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.detailGroup}>
                    <label className={styles.detailLabel}>หัวข้อปัญหา</label>
                    <input type="text" className={styles.inputField} value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                  </div>
                  <div className={styles.detailGroup}>
                    <label className={styles.detailLabel}>หมวดหมู่</label>
                    <select className={styles.inputField} value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className={styles.detailGroup}>
                    <label className={styles.detailLabel}>สถานที่</label>
                    <input type="text" className={styles.inputField} value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} />
                  </div>
                  <div className={styles.detailGroup}>
                    <label className={styles.detailLabel}>รายละเอียด</label>
                    <textarea rows={4} className={styles.inputField} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className={styles.drawerFooter}>
              {isEditMode ? (
                <>
                  <button onClick={() => setIsEditMode(false)} className={styles.btnOutline}>ยกเลิก</button>
                  <button onClick={handleUpdate} className={styles.btnPrimary}>บันทึกข้อมูล</button>
                </>
              ) : (
                <>
                  {userRole === 'admin' && (
                    <button onClick={() => handleDelete(drawerIssue.ticketId)} className={styles.btnDanger}>
                      ลบใบงาน
                    </button>
                  )}
                  {canEdit(drawerIssue) && (
                    <button onClick={() => setIsEditMode(true)} className={styles.btnOutline} style={{ marginLeft: 'auto' }}>
                      แก้ไขข้อมูล
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