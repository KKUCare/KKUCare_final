// app/status/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import styles from './status.module.css';

/* ── Types ─────────────────────────────────────────────────── */
type StatusKey = 'pending' | 'in_progress' | 'resolved' | 'rejected';

interface Issue {
  ticketId:    string;
  title:       string;
  location:    string;
  description?: string;
  category:    string;
  status:      StatusKey;
  image?:      string;
  createdAt:   string;
}

/* ── Constants ──────────────────────────────────────────────── */
const STATUS_CONFIG: Record<StatusKey, { text: string; color: string }> = {
  pending:     { text: 'รอรับเรื่อง',     color: 'amber' },
  in_progress: { text: 'กำลังดำเนินการ', color: 'blue'  },
  resolved:    { text: 'เสร็จสิ้น',       color: 'green' },
  rejected:    { text: 'ยกเลิก',          color: 'red'   },
};

const CATEGORIES = [
  'ทั่วไป', 'ไฟฟ้า/แสงสว่าง', 'ประปา',
  'ไอที/เครือข่าย', 'ความปลอดภัย/จราจร', 'ความสะอาด/ขยะ',
];

const FILTER_TABS: { key: StatusKey | 'all'; label: string }[] = [
  { key: 'all',         label: 'ทั้งหมด'        },
  { key: 'pending',     label: 'รอรับเรื่อง'    },
  { key: 'in_progress', label: 'กำลังดำเนินการ' },
  { key: 'resolved',    label: 'เสร็จสิ้น'      },
  { key: 'rejected',    label: 'ยกเลิก'         },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

/* ── Page ───────────────────────────────────────────────────── */
export default function StatusPage() {
  const [issues,       setIssues]       = useState<Issue[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [activeFilter, setActiveFilter] = useState<StatusKey | 'all'>('all');
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [editForm,     setEditForm]     = useState({ title: '', location: '', description: '', category: '' });
  const [deleteId,     setDeleteId]     = useState<string | null>(null);
  const [actionError,  setActionError]  = useState('');
  const [saving,       setSaving]       = useState(false);

  /* fetch */
  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/issues');
      if (res.ok) {
        const data = await res.json();
        setIssues(data.issues ?? []);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  /* derived */
  const counts = issues.reduce<Record<string, number>>(
    (acc, i) => { acc[i.status] = (acc[i.status] ?? 0) + 1; return acc; }, {}
  );
  const filtered = activeFilter === 'all'
    ? issues
    : issues.filter(i => i.status === activeFilter);

  /* delete */
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/issues/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setIssues(prev => prev.filter(i => i.ticketId !== deleteId));
        setDeleteId(null);
      } else {
        setActionError('ลบไม่สำเร็จ กรุณาลองใหม่');
      }
    } catch {
      setActionError('เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ');
    }
  };

  /* edit */
  const openEdit = (issue: Issue) => {
    setEditingIssue(issue);
    setActionError('');
    setEditForm({
      title:       issue.title,
      location:    issue.location,
      description: issue.description ?? '',
      category:    issue.category,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIssue) return;
    setSaving(true);
    setActionError('');
    try {
      const res = await fetch(`/api/issues/${editingIssue.ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditingIssue(null);
        fetchIssues();
      } else {
        setActionError('อัปเดตไม่สำเร็จ กรุณาลองใหม่');
      }
    } catch {
      setActionError('เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => { setEditingIssue(null); setDeleteId(null); setActionError(''); };

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className={styles.page}>

      {/* ── TOPBAR — same pattern as homepage & report ──────── */}
      <nav className={styles.topbar}>
        <div className={styles.navContainer}>

          {/* Brand */}
          <Link href="/" className={styles.brand}>
            <div className={styles.brandMark}>K</div>
            <span className={styles.brandText}>
              KKU<span>Care</span>
            </span>
          </Link>

          {/* Nav links — centered */}
          <div className={styles.navMenu}>
            <Link href="/"       className={styles.navLink}>หน้าหลัก</Link>
            <Link href="/report" className={styles.navLink}>แจ้งปัญหา</Link>
            <Link href="/status" className={`${styles.navLink} ${styles.navLinkActive}`}>ติดตามสถานะ</Link>
          </div>

          {/* Right actions */}
          <div className={styles.navActions}>
            <Link href="/" className={styles.btnNavGhost}>
              ← กลับหน้าหลัก
            </Link>
          </div>

        </div>
      </nav>

      {/* ── MAIN ─────────────────────────────────────────────── */}
      <main className={styles.main}>
        <div className={styles.container}>

          {/* Page header */}
          <header className={styles.pageHeader}>
            <div>
              <p className={styles.pageEyebrow}>My Reports</p>
              <h1 className={styles.pageTitle}>รายการแจ้งปัญหาของฉัน</h1>
              <p className={styles.pageSubtitle}>
                ติดตามความคืบหน้าและจัดการข้อมูลการแจ้งซ่อมของคุณ
              </p>
            </div>

            {/* Summary chips */}
            {!loading && issues.length > 0 && (
              <div className={styles.summaryChips}>
                <div className={styles.chip}>
                  <span className={styles.chipNum}>{issues.length}</span>
                  <span className={styles.chipLabel}>ทั้งหมด</span>
                </div>
                {(Object.keys(STATUS_CONFIG) as StatusKey[]).map(k =>
                  counts[k] ? (
                    <div key={k} className={`${styles.chip} ${styles[`chip_${STATUS_CONFIG[k].color}`]}`}>
                      <span className={styles.chipNum}>{counts[k]}</span>
                      <span className={styles.chipLabel}>{STATUS_CONFIG[k].text}</span>
                    </div>
                  ) : null
                )}
              </div>
            )}
          </header>

          {/* ── LOADING ──────────────────────────────────────── */}
          {loading ? (
            <div className={styles.loadingRow}>
              <span className={styles.spinner} />
              <span className={styles.loadingText}>กำลังโหลดรายการ...</span>
            </div>

          /* ── EMPTY ───────────────────────────────────────── */
          ) : issues.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📋</div>
              <h2 className={styles.emptyTitle}>ยังไม่มีรายการแจ้งปัญหา</h2>
              <p className={styles.emptyDesc}>
                เมื่อคุณแจ้งปัญหาแล้ว รายการทั้งหมดจะแสดงที่นี่<br />
                พร้อมสถานะการดำเนินการแบบเรียลไทม์
              </p>
              <Link href="/report" className={styles.btnEmptyCta}>
                สร้างรายการแรกของคุณ →
              </Link>
            </div>

          /* ── LIST ────────────────────────────────────────── */
          ) : (
            <>
              {/* Filter tabs */}
              <div className={styles.filterBar} role="tablist" aria-label="กรองตามสถานะ">
                {FILTER_TABS.map(tab => (
                  <button
                    key={tab.key}
                    role="tab"
                    aria-selected={activeFilter === tab.key}
                    className={`${styles.filterTab} ${activeFilter === tab.key ? styles.filterTabActive : ''}`}
                    onClick={() => setActiveFilter(tab.key)}
                  >
                    {tab.label}
                    {tab.key === 'all' ? (
                      <span className={styles.filterCount}>{issues.length}</span>
                    ) : counts[tab.key] ? (
                      <span className={styles.filterCount}>{counts[tab.key]}</span>
                    ) : null}
                  </button>
                ))}
              </div>

              {/* No results for filter */}
              {filtered.length === 0 ? (
                <p className={styles.noFilterResult}>ไม่มีรายการในสถานะนี้</p>
              ) : (
                <div className={styles.cardList}>
                  {filtered.map((issue, idx) => {
                    const sc      = STATUS_CONFIG[issue.status] ?? STATUS_CONFIG.pending;
                    const canEdit = issue.status === 'pending';
                    return (
                      <article
                        key={issue.ticketId}
                        className={styles.card}
                        data-status={issue.status}
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        {/* Status accent bar */}
                        <div className={`${styles.cardAccent} ${styles[`accent_${sc.color}`]}`} aria-hidden="true" />

                        <div className={styles.cardMain}>

                          {/* Left: info */}
                          <div className={styles.cardInfo}>
                            <div className={styles.cardTopRow}>
                              <span className={styles.ticketId}>#{issue.ticketId}</span>
                              <span className={`${styles.statusBadge} ${styles[`badge_${sc.color}`]}`}>
                                <span className={styles.badgeDot} />
                                {sc.text}
                              </span>
                            </div>

                            <h2 className={styles.cardTitle}>{issue.title}</h2>

                            <div className={styles.cardMeta}>
                              <span className={styles.metaItem}>
                                <svg className={styles.metaSvg} viewBox="0 0 16 16" fill="none">
                                  <path d="M8 1.5A4.5 4.5 0 0 1 12.5 6c0 3-4.5 8.5-4.5 8.5S3.5 9 3.5 6A4.5 4.5 0 0 1 8 1.5z" stroke="currentColor" strokeWidth="1.4"/>
                                  <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
                                </svg>
                                {issue.location}
                              </span>
                              <span className={styles.metaItem}>
                                <svg className={styles.metaSvg} viewBox="0 0 16 16" fill="none">
                                  <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                                  <path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                                </svg>
                                {issue.category}
                              </span>
                              <span className={styles.metaItem}>
                                <svg className={styles.metaSvg} viewBox="0 0 16 16" fill="none">
                                  <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                                  <path d="M5 1v4M11 1v4M2 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                                </svg>
                                {formatDate(issue.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* Right: image + actions */}
                          <div className={styles.cardSide}>
                            {issue.image && (
                              <img
                                src={issue.image}
                                alt="ภาพประกอบ"
                                className={styles.cardThumb}
                              />
                            )}
                            {canEdit && (
                              <div className={styles.cardActions}>
                                <button
                                  className={styles.btnEdit}
                                  onClick={() => openEdit(issue)}
                                  aria-label="แก้ไขรายการ"
                                >
                                  แก้ไข
                                </button>
                                <button
                                  className={styles.btnDelete}
                                  onClick={() => setDeleteId(issue.ticketId)}
                                  aria-label="ลบรายการ"
                                >
                                  ลบ
                                </button>
                              </div>
                            )}
                          </div>

                        </div>

                        {/* Inline delete confirm */}
                        {deleteId === issue.ticketId && (
                          <div className={styles.inlineConfirm}>
                            <span className={styles.inlineConfirmText}>
                              ยืนยันลบรายการนี้? ไม่สามารถกู้คืนได้
                            </span>
                            <div className={styles.inlineConfirmActions}>
                              <button className={styles.btnConfirmCancel} onClick={() => setDeleteId(null)}>
                                ยกเลิก
                              </button>
                              <button className={styles.btnConfirmDelete} onClick={confirmDelete}>
                                ยืนยันลบ
                              </button>
                            </div>
                          </div>
                        )}

                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}

        </div>
      </main>

      {/* ── EDIT MODAL ───────────────────────────────────────── */}
      {editingIssue && (
        <div
          className={styles.overlay}
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label="แก้ไขรายการ"
        >
          <div className={styles.modal} onClick={e => e.stopPropagation()}>

            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalEyebrow}>Ticket #{editingIssue.ticketId}</p>
                <h2 className={styles.modalTitle}>แก้ไขข้อมูลรายการ</h2>
              </div>
              <button className={styles.modalClose} onClick={closeModal} aria-label="ปิด">
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className={styles.modalBody}>

                {actionError && (
                  <div className={styles.modalError} role="alert">
                    <span>⚠</span> {actionError}
                  </div>
                )}

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>หัวข้อปัญหา</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={editForm.title}
                      onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                      required
                      placeholder="ระบุหัวข้อปัญหา"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>หมวดหมู่</label>
                    {/* ── DROPDOWN ── */}
                    <div className={styles.selWrap}>
                      <select
                        className={styles.input}
                        value={editForm.category}
                        onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <span className={styles.selArrow} aria-hidden="true">▾</span>
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>สถานที่เกิดเหตุ</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={editForm.location}
                    onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                    required
                    placeholder="ระบุสถานที่"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>รายละเอียดเพิ่มเติม</label>
                  <textarea
                    className={`${styles.input} ${styles.textarea}`}
                    value={editForm.description}
                    onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                    rows={3}
                    placeholder="อธิบายปัญหาเพิ่มเติม (ถ้ามี)"
                  />
                </div>

              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnCancel} onClick={closeModal}>
                  ยกเลิก
                </button>
                <button type="submit" className={styles.btnSave} disabled={saving}>
                  {saving
                    ? <><span className={styles.spinnerSm} /> กำลังบันทึก...</>
                    : 'บันทึกการแก้ไข'
                  }
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}