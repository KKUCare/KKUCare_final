// app/admin/stats/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './stats.module.css';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const CATEGORY_ICONS: Record<string, string> = {
  'ทั่วไป':             '🔧',
  'ไฟฟ้า/แสงสว่าง':    '💡',
  'ประปา':              '🚿',
  'ไอที/เครือข่าย':     '📡',
  'ความสะอาด/ขยะ':     '🧹',
};

const STATUS_COLORS = {
  pending:    { hex: '#f59e0b', label: 'รอดำเนินการ' },
  inProgress: { hex: '#3b82f6', label: 'กำลังแก้ไข'  },
  resolved:   { hex: '#10b981', label: 'เสร็จสิ้น'   },
};

export default function AdminStatsPage() {
  const router = useRouter();
  const [data,             setData]             = useState<any[]>([]);
  const [overview,         setOverview]         = useState<any>({});
  const [loading,          setLoading]          = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visibleBars,      setVisibleBars]      = useState<Record<string, boolean>>({
    pending: true, inProgress: true, resolved: true,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.status === 403) { router.push('/'); return; }
        if (res.ok) {
          const json = await res.json();
          setData(json.stats);
          setOverview(json.overview);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [router]);

  const pieRaw = useMemo(() => {
    if (selectedCategory === 'All') return {
      pending:    overview.totalPending    || 0,
      inProgress: overview.totalInProgress || 0,
      resolved:   overview.totalResolved   || 0,
    };
    const cat = data.find(d => d.category === selectedCategory);
    return cat
      ? { pending: cat.pending, inProgress: cat.inProgress, resolved: cat.resolved }
      : { pending: 0, inProgress: 0, resolved: 0 };
  }, [selectedCategory, data, overview]);

  const pieTotal = pieRaw.pending + pieRaw.inProgress + pieRaw.resolved;

  const barDatasets = useMemo(() => ([
    { key: 'pending',    label: 'รอดำเนินการ', color: '#f59e0b', field: 'pending'    },
    { key: 'inProgress', label: 'กำลังแก้ไข',  color: '#3b82f6', field: 'inProgress' },
    { key: 'resolved',   label: 'เสร็จสิ้น',   color: '#10b981', field: 'resolved'   },
  ])
    .filter(d => visibleBars[d.key])
    .map(d => ({
      label: d.label,
      data: data.map((row: any) => row[d.field]),
      backgroundColor: d.color,
      borderRadius: 4,
      borderSkipped: false,
      maxBarThickness: 24,
    })), [data, visibleBars]);

  const toggleBar = (key: string) =>
    setVisibleBars(prev => ({ ...prev, [key]: !prev[key] }));

  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1c1410',
        titleColor: 'rgba(255,255,255,0.55)',
        bodyColor: 'white',
        padding: 10, cornerRadius: 8,
        titleFont: { size: 11 },
        bodyFont: { size: 13, weight: 'bold' as const },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#8a7f76', font: { size: 11 } },
      },
      y: {
        grid: { color: '#f0ece8' },
        border: { display: false },
        ticks: { color: '#8a7f76', font: { size: 10 }, precision: 0 },
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false,
    cutout: '80%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1c1410',
        titleColor: 'rgba(255,255,255,0.55)',
        bodyColor: 'white',
        padding: 10, cornerRadius: 8,
      },
    },
  };

  const doughnutData = {
    labels: ['รอดำเนินการ', 'กำลังแก้ไข', 'เสร็จสิ้น'],
    datasets: [{
      data: [pieRaw.pending, pieRaw.inProgress, pieRaw.resolved],
      backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'],
      borderWidth: 0, hoverOffset: 4,
    }],
  };

  if (loading) return (
    <div className={styles.dashboard}>
      <div className={styles.loadingWrap}>
        <div className={styles.loadingDots}><span /><span /><span /></div>
        <p className={styles.loadingText}>กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  );

  return (
    <div className={styles.dashboard}>

      {/* ── TOPBAR — unified pattern ──────────────────────────── */}
      <nav className={styles.topbar}>
        <div className={styles.navContainer}>

          <Link href="/" className={styles.brand}>
            <div className={styles.brandMark}>K</div>
            <span className={styles.brandText}>KKU<span>Care</span></span>
          </Link>

          <div className={styles.navMenu}>
            <Link href="/admin"       className={styles.navLink}>จัดการปัญหา</Link>
            <Link href="/admin/stats" className={`${styles.navLink} ${styles.navLinkActive}`}>สถิติภาพรวม</Link>
          </div>

          <div className={styles.navActions}>
            <Link href="/" className={styles.btnNavGhost}>← กลับหน้าหลัก</Link>
          </div>

        </div>
      </nav>

      {/* ── MAIN ─────────────────────────────────────────────── */}
      <main className={styles.mainContent}>

        {/* Page header */}
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.pageEyebrow}>Admin Dashboard</p>
            <h1 className={styles.pageTitle}>ภาพรวมระบบรายงานปัญหา</h1>
            <p className={styles.pageSubtitle}>สถิติการแจ้งซ่อมและสถานะการดำเนินงานทั้งหมด</p>
          </div>
          <div className={styles.lastUpdated}>
            <span className={styles.lastUpdatedDot} />
            อัปเดตล่าสุดเมื่อกี้นี้
          </div>
        </div>

        {/* ── STAT CARDS ─────────────────────────────────────── */}
        <div className={styles.statsGrid}>
          {[
            { mod: styles.statCardTotal,    iconMod: styles.iconTotal,    valueMod: styles.valueTotal,    icon: '📝', label: 'งานทั้งหมด',   value: overview.totalIssues    || 0, trend: null },
            { mod: styles.statCardPending,  iconMod: styles.iconPending,  valueMod: styles.valuePending,  icon: '⏳', label: 'รอดำเนินการ', value: overview.totalPending   || 0, trend: null },
            { mod: styles.statCardProgress, iconMod: styles.iconProgress, valueMod: styles.valueProgress, icon: '🔧', label: 'กำลังแก้ไข',  value: overview.totalInProgress|| 0, trend: null },
            {
              mod: styles.statCardDone, iconMod: styles.iconDone, valueMod: styles.valueDone,
              icon: '✅', label: 'เสร็จสิ้น', value: overview.totalResolved || 0,
              trend: overview.totalIssues
                ? `${Math.round((overview.totalResolved / overview.totalIssues) * 100)}% ของทั้งหมด`
                : null,
            },
          ].map((s, i) => (
            <div key={i} className={`${styles.statCard} ${s.mod}`}>
              <div className={styles.statTop}>
                <span className={styles.statLabel}>{s.label}</span>
                <div className={`${styles.statIconWrap} ${s.iconMod}`}>{s.icon}</div>
              </div>
              <div className={styles.statBottom}>
                <div className={`${styles.statValue} ${s.valueMod}`}>{s.value.toLocaleString()}</div>
                {s.trend && <div className={styles.statTrend}>{s.trend}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* ── CHARTS ROW ─────────────────────────────────────── */}
        <div className={styles.chartsGrid}>

          {/* Bar Chart */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <div>
                <p className={styles.chartEyebrow}>By Category</p>
                <h2 className={styles.chartTitle}>สถิติแยกตามหมวดหมู่</h2>
              </div>
              <div className={styles.pillRow}>
                {Object.entries(STATUS_COLORS).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => toggleBar(key)}
                    className={`${styles.pill} ${visibleBars[key] ? styles.pillActive : ''}`}
                    style={visibleBars[key] ? { background: cfg.hex, borderColor: cfg.hex } : {}}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.barChartWrap}>
              <Bar options={barOptions} data={{ labels: data.map(d => d.category), datasets: barDatasets }} />
            </div>
          </div>

          {/* Doughnut Chart */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <div>
                <p className={styles.chartEyebrow}>Status Ratio</p>
                <h2 className={styles.chartTitle}>สัดส่วนสถานะงาน</h2>
              </div>
              <select
                className={styles.selectInput}
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
              >
                <option value="All">ทุกหมวดหมู่</option>
                {data.map(d => (
                  <option key={d.category} value={d.category}>{d.category}</option>
                ))}
              </select>
            </div>

            <div className={styles.doughnutWrap}>
              <Doughnut options={doughnutOptions} data={doughnutData} style={{ maxHeight: 180 }} />
              <div className={styles.doughnutCenter}>
                <span className={styles.doughnutCenterLabel}>รวม</span>
                <span className={styles.doughnutCenterValue}>{pieTotal}</span>
              </div>
            </div>

            <div className={styles.statusLegend}>
              {[
                { key: 'pending',    count: pieRaw.pending,    color: '#f59e0b', label: 'รอดำเนินการ' },
                { key: 'inProgress', count: pieRaw.inProgress, color: '#3b82f6', label: 'กำลังแก้ไข'  },
                { key: 'resolved',   count: pieRaw.resolved,   color: '#10b981', label: 'เสร็จสิ้น'   },
              ].map(s => (
                <div key={s.key} className={styles.legendRow}>
                  <div className={styles.legendLeft}>
                    <span className={styles.legendDot} style={{ background: s.color }} />
                    {s.label}
                  </div>
                  <div className={styles.legendBar}>
                    <div
                      className={styles.legendBarFill}
                      style={{
                        width: pieTotal ? `${(s.count / pieTotal) * 100}%` : '0%',
                        background: s.color,
                      }}
                    />
                  </div>
                  <span className={styles.legendCount}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── CATEGORY TABLE ─────────────────────────────────── */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>ตารางรายละเอียดตามหมวดหมู่</h2>
            <p className={styles.tableSub}>แสดงจำนวนงานแยกตามสถานะในแต่ละหมวดหมู่</p>
          </div>

          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th>หมวดหมู่</th>
                <th>รอดำเนินการ</th>
                <th>กำลังแก้ไข</th>
                <th>เสร็จสิ้น</th>
                <th>รวม</th>
                <th>% สำเร็จ</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {data.map(row => {
                const total = row.pending + row.inProgress + row.resolved;
                const pct   = total ? Math.round((row.resolved / total) * 100) : 0;
                return (
                  <tr key={row.category}>
                    <td>
                      <div className={styles.catName}>
                        <span className={styles.catEmoji}>{CATEGORY_ICONS[row.category] ?? '📌'}</span>
                        {row.category}
                      </div>
                    </td>
                    <td className={styles.tdPending}>{row.pending}</td>
                    <td className={styles.tdProgress}>{row.inProgress}</td>
                    <td className={styles.tdDone}>{row.resolved}</td>
                    <td className={styles.tdTotal}>{total}</td>
                    <td>
                      <div className={styles.tdBar}>
                        <div className={styles.miniBar}>
                          <div className={styles.miniBarFill} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={styles.pctLabel}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}