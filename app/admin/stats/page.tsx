// app/admin/stats/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './stats.module.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AdminStatsPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.status === 403) {
          alert('สำหรับ Admin เท่านั้น');
          router.push('/');
          return;
        }
        if (res.ok) {
          const json = await res.json();
          setData(json.stats);
          setOverview(json.overview);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);


  // --- ข้อมูลสำหรับ Bar Chart ---
  const barChartData = {
    labels: data.map(d => d.category),
    datasets: [
      {
        label: 'รอดำเนินการ',
        data: data.map(d => d.pending),
        backgroundColor: '#f59e0b',
        borderRadius: 4,
      },
      {
        label: 'กำลังแก้ไข',
        data: data.map(d => d.inProgress),
        backgroundColor: '#3b82f6',
        borderRadius: 4,
      },
      {
        label: 'เสร็จสิ้น',
        data: data.map(d => d.resolved),
        backgroundColor: '#10b981',
        borderRadius: 4,
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { usePointStyle: true, boxWidth: 8 } },
      title: { display: false }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#f1f5f9' }, beginAtZero: true }
    }
  };

  // --- ข้อมูลสำหรับ Doughnut Chart ---
  let pieDataRaw = { pending: 0, inProgress: 0, resolved: 0 };
  
  if (selectedCategory === 'All') {
    pieDataRaw = {
      pending: overview.totalPending || 0,
      inProgress: overview.totalInProgress || 0,
      resolved: overview.totalResolved || 0
    };
  } else {
    const catData = data.find(d => d.category === selectedCategory);
    if (catData) {
      pieDataRaw = {
        pending: catData.pending,
        inProgress: catData.inProgress,
        resolved: catData.resolved
      };
    }
  }

  const doughnutChartData = {
    labels: ['รอดำเนินการ', 'กำลังแก้ไข', 'เสร็จสิ้น'],
    datasets: [
      {
        data: [pieDataRaw.pending, pieDataRaw.inProgress, pieDataRaw.resolved],
        backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%', 
    plugins: {
      legend: { position: 'bottom' as const, labels: { usePointStyle: true, padding: 20 } }
    }
  };

  return (
    <div className={styles.dashboard}>
      
      {/* Top Navigation Bar แทน Sidebar เดิม */}
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

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        
        <div className={styles.header}>
          <h1>ภาพรวมระบบรายงานปัญหา</h1>
          <p>ข้อมูลสถิติการแจ้งซ่อมและสถานะการดำเนินงานทั้งหมด</p>
        </div>

        {/* 4 Cards (Overview) */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>
              <div className={styles.statIcon} style={{ background: '#f8fafc', color: '#64748b'}}>📝</div>
              งานทั้งหมด
            </div>
            <div className={styles.statValue}>{overview.totalIssues || 0}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>
              <div className={styles.statIcon} style={{ background: '#fef3c7', color: '#d97706'}}>⏳</div>
              รอดำเนินการ
            </div>
            <div className={styles.statValue}>{overview.totalPending || 0}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>
              <div className={styles.statIcon} style={{ background: '#dbeafe', color: '#2563eb'}}>🔧</div>
              กำลังแก้ไข
            </div>
            <div className={styles.statValue}>{overview.totalInProgress || 0}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>
              <div className={styles.statIcon} style={{ background: '#d1fae5', color: '#059669'}}>✅</div>
              เสร็จสิ้น
            </div>
            <div className={styles.statValue}>{overview.totalResolved || 0}</div>
          </div>
        </div>

        {/* Charts Container */}
        <div className={styles.chartsGrid}>
          
          {/* Bar Chart */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h2 className={styles.chartTitle}>สถิติแยกตามหมวดหมู่</h2>
            </div>
            <div style={{ height: '300px' }}>
              <Bar options={barOptions} data={barChartData} />
            </div>
          </div>

          {/* Doughnut Chart (Filterable) */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h2 className={styles.chartTitle}>สัดส่วนสถานะงาน</h2>
              <select 
                className={styles.selectInput}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">รวมทุกแผนก</option>
                {data.map(d => (
                  <option key={d.category} value={d.category}>{d.category}</option>
                ))}
              </select>
            </div>
            
            <div style={{ height: '280px', display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <Doughnut options={doughnutOptions} data={doughnutChartData} />
              
              {/* Text in the middle of Doughnut */}
              <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>รวมทั้งหมด</span><br/>
                <strong style={{ fontSize: '1.5rem', color: '#1e293b' }}>
                  {pieDataRaw.pending + pieDataRaw.inProgress + pieDataRaw.resolved}
                </strong>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}