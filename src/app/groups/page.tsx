'use client';

import { useEffect, useMemo, useState } from 'react';
import { Group, Permission } from '@/types';
import { getAllAdminGroups, getAllPermissions, deleteAdminGroup } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import GroupForm from '@/components/forms/GroupForm';
import Modal from '@/components/ui/Modal';
import {
  Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Shield, KeySquare
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

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const { refreshKey, addToast } = useAppStore();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [groupsRes, permissionsRes] = await Promise.all([
        getAllAdminGroups(),
        getAllPermissions(),
      ]);
      if (groupsRes.success && groupsRes.data) setGroups(groupsRes.data);
      if (permissionsRes.success && permissionsRes.data) setPermissions(permissionsRes.data);
      setIsLoading(false);
    };
    fetchData();
  }, [refreshKey]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(g => g.name.toLowerCase().includes(q));
  }, [groups, query]);

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageNumbers = getVisiblePageNumbers(safePage, totalPages);
  const pagedGroups = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleDelete = async (group: Group) => {
    const confirmed = window.confirm(`هل تريد حذف المجموعة "${group.name}"؟`);
    if (!confirmed) return;
    const res = await deleteAdminGroup(group.id);
    if (res.success) {
      addToast({ type: 'success', message: 'تم حذف المجموعة بنجاح' });
      setGroups(prev => prev.filter(g => g.id !== group.id));
    } else {
      addToast({ type: 'error', message: res.error || 'حدث خطأ أثناء الحذف' });
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">المجموعات</h1>
          <div className="page-subtitle">تجميع الصلاحيات في مجموعات تُمنح للمستخدمين</div>
        </div>
        <div className="page-header-right">
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
            <Plus size={16} />
            إضافة مجموعة
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
              placeholder="ابحث باسم المجموعة..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>المجموعة</th>
                <th>الصلاحيات</th>
                <th>معاينة الصلاحيات</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div className="loading-spinner" />
                  </td>
                </tr>
              ) : pagedGroups.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    لا توجد مجموعات مطابقة للبحث
                  </td>
                </tr>
              ) : (
                pagedGroups.map((group) => (
                  <tr key={group.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32, height: 32, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(59,130,246,0.12)',
                            color: 'var(--blue-400)'
                          }}
                        >
                          <Shield size={16} />
                        </div>
                        <span style={{ fontWeight: 500 }}>{group.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge blue">
                        <KeySquare size={12} />
                        {group.permissions.length} صلاحية
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 380 }}>
                        {group.permissions.length === 0 ? (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>-</span>
                        ) : (
                          group.permissions.slice(0, 4).map(pid => {
                            const perm = permissions.find(p => p.id === pid);
                            return <span key={pid} className="badge muted">{perm ? perm.codename : `#${pid}`}</span>;
                          })
                        )}
                        {group.permissions.length > 4 && (
                          <span className="badge muted">+{group.permissions.length - 4}</span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          className="btn btn-ghost btn-icon"
                          title="تعديل"
                          onClick={() => { setEditing(group); setShowModal(true); }}
                        >
                          <Pencil size={16} style={{ color: 'var(--blue-400)' }} />
                        </button>
                        <button className="btn btn-ghost btn-icon" title="حذف" onClick={() => handleDelete(group)}>
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
            عرض {pagedGroups.length} من أصل {totalCount} نتيجة
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
        title={editing ? 'تعديل المجموعة' : 'إضافة مجموعة جديدة'}
        icon={<Shield size={16} style={{ color: 'var(--gold-400)', marginLeft: 8 }} />}
        size="lg"
      >
        <GroupForm
          key={editing ? editing.id : 'new'}
          existing={editing}
          permissions={permissions}
          onSuccess={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}