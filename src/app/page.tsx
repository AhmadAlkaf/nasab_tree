'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getStats, getRequsersPage, getAllFormRequsersPage } from '@/lib/api';
import {
  Users, UserPlus, GitBranch, Search, Book, Heart,
  ClipboardList, Plus, ChevronLeft, User, Calendar, MapPin, FileText
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useCan, PERM } from '@/lib/auth';
import { Requser, TypeRequsetLabels } from '@/types';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPersons: 0,
    totalMales: 0,
    totalFemales: 0,
    totalWives: 0,
    totalSources: 0,
    generations: 0,
    totalMothers: 0,
  });
  const [recentRequests, setRecentRequests] = useState<Requser[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [countRequestType, setCountRequestType] = useState(0);
  const [countDescendingType, setCountDescendingType] = useState(0);
  const [countForms, setCountForms] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { refreshKey } = useAppStore();
  const router = useRouter();
  const can = useCan();

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      const [statsRes, requestsRes, requestTypeRes, descendingRes, formsRes] = await Promise.all([
        getStats(),
        getRequsersPage(1, 5, {}),
        getRequsersPage(1, 1, { type_requser: '1' }),
        getRequsersPage(1, 1, { type_requser: '2' }),
        getAllFormRequsersPage(1, 1, {}),
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }

      if (requestsRes.success && requestsRes.data) {
        setRecentRequests(requestsRes.data.results);
        setTotalRequests(requestsRes.data.count);
      }

      if (requestTypeRes.success && requestTypeRes.data) {
        setCountRequestType(requestTypeRes.data.count);
      }

      if (descendingRes.success && descendingRes.data) {
        setCountDescendingType(descendingRes.data.count);
      }

      if (formsRes.success && formsRes.data) {
        setCountForms(formsRes.data.count);
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
          <div className="page-subtitle">نظرة عامة على بيانات شجرة الأنساب والطلبات</div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-overlay">
          <div className="loading-spinner lg" />
          <span>جاري تحميل الإحصائيات...</span>
        </div>
      ) : (
        <>
          {/* إحصائيات الشجرة */}
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
            إحصائيات الشجرة
          </h2>
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
              <div className="stat-icon emerald"><Heart size={22} /></div>
              <div className="stat-value">{stats.totalMothers ?? 0}</div>
              <div className="stat-label">عدد الأمهات</div>
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

          {/* إحصائيات الطلبات */}
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, marginTop: 32, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
            إحصائيات الطلبات
          </h2>
          <div className="stat-grid">
            <div className="stat-card blue">
              <div className="stat-icon blue"><ClipboardList size={22} /></div>
              <div className="stat-value">{totalRequests}</div>
              <div className="stat-label">إجمالي الطلبات</div>
            </div>

            <div className="stat-card gold">
              <div className="stat-icon gold"><ClipboardList size={22} /></div>
              <div className="stat-value">{countRequestType}</div>
              <div className="stat-label">&quot;طلبات&quot; نوع طلب</div>
            </div>

            <div className="stat-card pink">
              <div className="stat-icon pink"><ClipboardList size={22} /></div>
              <div className="stat-value">{countDescendingType}</div>
              <div className="stat-label">&quot;نزول&quot; نوع الطلبات</div>
            </div>

            <div className="stat-card emerald">
              <div className="stat-icon emerald"><FileText size={22} /></div>
              <div className="stat-value">{countForms}</div>
              <div className="stat-label">الاستمارات (الأشخاص بالطلبات)</div>
            </div>
          </div>

          {/* آخر الطلبات */}
          {recentRequests.length > 0 && (
            <>
              <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, marginTop: 32, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
                آخر الطلبات
              </h2>
              <div className="card">
                <div className="card-body" style={{ padding: 0 }}>
                  {recentRequests.map((req) => (
                    <div
                      key={req.id}
                      className="list-item"
                      onClick={() => router.push(`/requests/${req.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="list-item-avatar" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--blue-400)' }}>
                        <User size={16} />
                      </div>
                      <div className="list-item-content">
                        <div className="list-item-title">{req.full_name}</div>
                        <div className="list-item-subtitle" style={{ display: 'flex', gap: 12, marginTop: 2 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={12} />
                            {req.name_place || req.home}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={12} />
                            {new Date(req.created_at).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                      </div>
                      <span className="badge blue">
                        {TypeRequsetLabels[req.type_requser]}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="card-footer" style={{ justifyContent: 'center' }}>
                  <Link href="/requests" className="btn btn-ghost btn-sm">
                    عرض جميع الطلبات
                    <ChevronLeft size={16} />
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* إجراءات سريعة */}
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, marginTop: 32, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
            إجراءات سريعة
          </h2>
          <div className="quick-actions">
            {can(PERM.requser.add) && (
              <Link href="/requests/new" className="quick-action">
                <div className="quick-action-icon" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--blue-400)' }}>
                  <Plus size={20} />
                </div>
                <div>
                  <div className="quick-action-title">إضافة طلب جديد</div>
                  <div className="quick-action-desc">تسجيل طلب تسجيل نسب جديد</div>
                </div>
              </Link>
            )}

            {can(PERM.person.add) && (
              <Link href="/persons/new" className="quick-action">
                <div className="quick-action-icon" style={{ background: 'rgba(212,168,83,0.1)', color: 'var(--gold-400)' }}>
                  <UserPlus size={20} />
                </div>
                <div>
                  <div className="quick-action-title">إضافة شخص جديد</div>
                  <div className="quick-action-desc">تسجيل فرد جديد في الشجرة</div>
                </div>
              </Link>
            )}

            {can(PERM.person.view) && (
              <Link href="/tree" className="quick-action">
                <div className="quick-action-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--emerald-400)' }}>
                  <GitBranch size={20} />
                </div>
                <div>
                  <div className="quick-action-title">شجرة العائلة</div>
                  <div className="quick-action-desc">استعرض العلاقات الهرمية للعائلة</div>
                </div>
              </Link>
            )}

            {can(PERM.person.view) && (
              <Link href="/persons" className="quick-action">
                <div className="quick-action-icon" style={{ background: 'rgba(236,72,153,0.1)', color: 'var(--pink-400)' }}>
                  <Search size={20} />
                </div>
                <div>
                  <div className="quick-action-title">إدارة الإثبات</div>
                  <div className="quick-action-desc">بحث وإثبات النسب</div>
                </div>
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
