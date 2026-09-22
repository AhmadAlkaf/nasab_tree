'use client';

import { useEffect, useMemo, useState } from 'react';
import { Permission } from '@/types';
import { getAllPermissions, deletePermission } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import PermissionForm from '@/components/forms/PermissionForm';
import Modal from '@/components/ui/Modal';
import {
  Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, KeySquare, Fingerprint
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

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Permission | null>(null);
  const { refreshKey, addToast } = useAppStore();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const res = await getAllPermissions();
      if (res.success && res.data) setPermissions(res.data);
      setIsLoading(false);
    };
    fetchData();
  }, [refreshKey]);

  const contentTypes = useMemo(
    () => Array.from(new Set(permissions.map(p => p.content_type))).sort((a, b) => a - b),
    [permissions]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return permissions;
    return permissions.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.codename.toLowerCase().includes(q) ||
      String(p.content_type).includes(q)
    );
  }, [permissions, query]);

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageNumbers = getVisiblePageNumbers(safePage, totalPages);
  const pagedPermissions = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleDelete = async (permission: Permission) => {
    const confirmed = window.confirm(
      `هل تريد حذف الصلاحية "${permission.name}"؟\nقد تُستثنى من المجموعات المرتبطة بها.`
    );
    if (!confirmed) return;
    const res = await deletePermission(permission.id);
    if (res.success) {
      addToast({ type: 'success', message: 'تم حذف الصلاحية بنجاح' });
      setPermissions(prev => prev.filter(p => p.id !== permission.id));
    } else {
      addToast({ type: 'error', message: res.error || 'حدث خطأ أثناء الحذف' });
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">الصلاحيات</h1>
          <div className="page-subtitle">صلاحيات النموذج على مستوى النظام ({permissions.length})</div>
        </div>
        <div className="page-header-right">
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
            <Plus size={16} />
            إضافة صلاحية
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
              placeholder="ابحث بالاسم أو الرمز أو نوع المحتوى..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>الصلاحية</th>
                <th>الرمز (codename)</th>
                <th>نوع المحتوى</th>
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
              ) : pagedPermissions.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    لا توجد صلاحيات مطابقة للبحث
                  </td>
                </tr>
              ) : (
                pagedPermissions.map((permission) => (
                  <tr key={permission.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32, height: 32, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(236,72,153,0.12)',
                            color: 'var(--pink-400)'
                          }}
                        >
                          <KeySquare size={16} />
                        </div>
                        <span style={{ fontWeight: 500 }}>{permission.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge muted">
                        <Fingerprint size={12} />
                        {permission.codename}
                      </span>
                    </td>
                    <td>
                      <span className="badge blue">نوع المحتوى #{permission.content_type}</span>
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          className="btn btn-ghost btn-icon"
                          title="تعديل"
                          onClick={() => { setEditing(permission); setShowModal(true); }}
                        >
                          <Pencil size={16} style={{ color: 'var(--blue-400)' }} />
                        </button>
                        <button className="btn btn-ghost btn-icon" title="حذف" onClick={() => handleDelete(permission)}>
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
            عرض {pagedPermissions.length} من أصل {totalCount} نتيجة
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
        title={editing ? 'تعديل الصلاحية' : 'إضافة صلاحية جديدة'}
        icon={<KeySquare size={16} style={{ color: 'var(--gold-400)', marginLeft: 8 }} />}
      >
        <PermissionForm
          key={editing ? editing.id : 'new'}
          existing={editing}
          contentTypes={contentTypes.length > 0 ? contentTypes : [1]}
          onSuccess={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}