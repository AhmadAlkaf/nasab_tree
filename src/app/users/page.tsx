'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminUser, Group } from '@/types';
import { getAllAdminUsers, getAllAdminGroups, deleteAdminUser } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import UserForm from '@/components/forms/UserForm';
import Modal from '@/components/ui/Modal';
import {
  Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight,
  Users, ShieldCheck, BadgeCheck, UserCheck
} from 'lucide-react';

function getVisiblePageNumbers(currentPage: number, totalPages: number): Array<number | null> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  const orderedPages = Array.from(pages)
    .filter(p => p > 0 && p <= totalPages)
    .sort((a, b) => a - b);
  const visiblePages: Array<number | null> = [];
  orderedPages.forEach((p, i) => {
    if (i > 0 && p - orderedPages[i - 1] > 1) visiblePages.push(null);
    visiblePages.push(p);
  });
  return visiblePages;
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const { refreshKey, addToast } = useAppStore();

  const groupMap = useMemo(() => new Map(groups.map(g => [g.id, g.name])), [groups]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [usersRes, groupsRes] = await Promise.all([
        getAllAdminUsers(),
        getAllAdminGroups(),
      ]);
      if (usersRes.success && usersRes.data) setUsers(usersRes.data);
      if (groupsRes.success && groupsRes.data) setGroups(groupsRes.data);
      setIsLoading(false);
    };
    fetchData();
  }, [refreshKey]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u =>
      u.username.toLowerCase().includes(q) ||
      u.first_name.toLowerCase().includes(q) ||
      u.last_name.toLowerCase().includes(q) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }, [users, query]);

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageNumbers = getVisiblePageNumbers(safePage, totalPages);
  const pagedUsers = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleDelete = async (user: AdminUser) => {
    const confirmed = window.confirm(`هل تريد حذف المستخدم "${user.username}"؟`);
    if (!confirmed) return;
    const res = await deleteAdminUser(user.id);
    if (res.success) {
      addToast({ type: 'success', message: 'تم حذف المستخدم بنجاح' });
      setUsers(prev => prev.filter(u => u.id !== user.id));
    } else {
      addToast({ type: 'error', message: res.error || 'حدث خطأ أثناء الحذف' });
    }
  };

  const openCreate = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (user: AdminUser) => {
    setEditing(user);
    setShowModal(true);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">المستخدمون</h1>
          <div className="page-subtitle">إدارة حسابات مستخدمي النظام</div>
        </div>
        <div className="page-header-right">
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} />
            إضافة مستخدم
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-wrapper" style={{ width: '100%', maxWidth: 400 }}>
            <Search className="search-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="ابحث باسم المستخدم أو البريد..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>المستخدم</th>
                <th>الاسم الكامل</th>
                <th>البريد الإلكتروني</th>
                <th>المجموعات</th>
                <th>الحالة</th>
                <th>آخر دخول</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div className="loading-spinner" />
                  </td>
                </tr>
              ) : pagedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    لا يوجد مستخدمون مطابقون للبحث
                  </td>
                </tr>
              ) : (
                pagedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32, height: 32, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(212,168,83,0.12)',
                            color: 'var(--gold-400)'
                          }}
                        >
                          <Users size={16} />
                        </div>
                        <span style={{ fontWeight: 500 }}>{user.username}</span>
                      </div>
                    </td>
                    <td>{user.first_name || user.last_name ? `${user.first_name} ${user.last_name}`.trim() : '-'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{user.email || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {user.groups.length === 0 ? (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>-</span>
                        ) : (
                          user.groups.map(gid => (
                            <span key={gid} className="badge muted">{groupMap.get(gid) || `#${gid}`}</span>
                          ))
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        <span className={`badge ${user.is_active ? 'emerald' : 'red'}`}>
                          {user.is_active ? 'فعال' : 'معطل'}
                        </span>
                        {user.is_staff && (
                          <span className="badge blue"><ShieldCheck size={12} /> طاقم</span>
                        )}
                        {user.is_superuser && (
                          <span className="badge gold"><BadgeCheck size={12} /> فائق</span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {user.last_login
                        ? new Date(user.last_login).toLocaleString('ar-EG')
                        : <span className="badge muted"><UserCheck size={12} /> لم يسجل الدخول</span>}
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button className="btn btn-ghost btn-icon" title="تعديل" onClick={() => openEdit(user)}>
                          <Pencil size={16} style={{ color: 'var(--blue-400)' }} />
                        </button>
                        <button className="btn btn-ghost btn-icon" title="حذف" onClick={() => handleDelete(user)}>
                          <Trash2 size={16} style={{ color: 'var(--red-400)' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span className="pagination-summary">
            عرض {pagedUsers.length} من أصل {totalCount} نتيجة
          </span>
          <div className="pagination-controls">
            <button className="btn btn-secondary btn-sm" disabled={safePage === 1 || isLoading} onClick={() => setPage(safePage - 1)}>
              <ChevronRight size={16} /> السابقة
            </button>
            {pageNumbers.map((pageNumber, index) => (
              pageNumber === null ? (
                <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
              ) : (
                <button
                  key={pageNumber}
                  className={`btn btn-sm ${pageNumber === safePage ? 'btn-primary' : 'btn-secondary'}`}
                  disabled={isLoading}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              )
            ))}
            <button className="btn btn-secondary btn-sm" disabled={safePage >= totalPages || isLoading} onClick={() => setPage(safePage + 1)}>
              التالية <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
        icon={<Users size={16} style={{ color: 'var(--gold-400)', marginLeft: 8 }} />}
      >
        <UserForm
          key={editing ? editing.id : 'new'}
          existing={editing}
          groups={groups}
          onSuccess={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}