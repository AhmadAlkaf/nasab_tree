'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStats } from '@/lib/api';
import { Users, UserPlus, GitBranch, Search, Book, Heart } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPersons: 0,
    totalMales: 0,
    totalFemales: 0,
    totalWives: 0,
    totalSources: 0,
    generations: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { refreshKey } = useAppStore();

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      const res = await getStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
      setIsLoading(false);
    };
    fetchStats();
  }, [refreshKey]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">لوحة المعلومات</h1>
          <div className="page-subtitle">نظرة عامة على بيانات الشجرة النسبية</div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-overlay">
          <div className="loading-spinner lg" />
          <span>جاري تحميل الإحصائيات...</span>
        </div>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card gold">
              <div className="stat-icon gold"><Users size={22} /></div>
              <div className="stat-value">{stats.totalPersons}</div>
              <div className="stat-label">إجمالي الأشخاص</div>
            </div>
            
            <div className="stat-card blue">
              <div className="stat-icon blue"><Users size={22} /></div>
              <div className="stat-value">{stats.totalMales}</div>
              <div className="stat-label">الذكور</div>
            </div>
            
            <div className="stat-card pink">
              <div className="stat-icon pink"><Users size={22} /></div>
              <div className="stat-value">{stats.totalFemales}</div>
              <div className="stat-label">الإناث</div>
            </div>
            
            <div className="stat-card emerald">
              <div className="stat-icon emerald"><GitBranch size={22} /></div>
              <div className="stat-value">{stats.generations}</div>
              <div className="stat-label">الأجيال (الطبقات)</div>
            </div>
            
            <div className="stat-card amber">
              <div className="stat-icon amber"><Heart size={22} /></div>
              <div className="stat-value">{stats.totalWives}</div>
              <div className="stat-label">الزوجات المسجلات</div>
            </div>
            
            <div className="stat-card red">
              <div className="stat-icon red"><Book size={22} /></div>
              <div className="stat-value">{stats.totalSources}</div>
              <div className="stat-label">المصادر والوثائق</div>
            </div>
          </div>

          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
            إجراءات سريعة
          </h2>
          <div className="quick-actions">
            <Link href="/persons/new" className="quick-action">
              <div className="quick-action-icon" style={{ background: 'rgba(212,168,83,0.1)', color: 'var(--gold-400)' }}>
                <UserPlus size={20} />
              </div>
              <div>
                <div className="quick-action-title">إضافة شخص جديد</div>
                <div className="quick-action-desc">تسجيل فرد جديد في الشجرة</div>
              </div>
            </Link>
            
            <Link href="/tree" className="quick-action">
              <div className="quick-action-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--emerald-400)' }}>
                <GitBranch size={20} />
              </div>
              <div>
                <div className="quick-action-title">عرض الشجرة الكاملة</div>
                <div className="quick-action-desc">تصفح العلاقات الهرمية بصرياً</div>
              </div>
            </Link>
            
            <Link href="/persons" className="quick-action">
              <div className="quick-action-icon" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--blue-400)' }}>
                <Search size={20} />
              </div>
              <div>
                <div className="quick-action-title">البحث في السجل</div>
                <div className="quick-action-desc">استعراض وتعديل بيانات الأفراد</div>
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
