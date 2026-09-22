'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminUser, LogEntry } from '@/types';
import { getAllLogEntries, getAllAdminUsers, deleteLogEntry, LogActionLabels } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import LogEntryForm from '@/components/forms/LogEntryForm';
import Modal from '@/components/ui/Modal';
import {
  Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight,
  History, User, Clock, Box
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

const actionBadgeClass: Record<number, string> = {
  1: 'emerald',
  2: 'blue',
  3: 'red',
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<LogEntry | null>(null);
  const { refreshKey, addToast } = useAppStore();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [logsRes, usersRes] = await Promise.all([
        getAllLogEntries(),
        getAllAdminUsers(),
      ]);
      if (logsRes.success && logsRes.data) setLogs(logsRes.data);
      if (usersRes.success && usersRes.data) setUsers(usersRes.data);
      setIsLoading(false);
    };
    fetchData();
  }, [refreshKey]);

  const contentTypes = useMemo(
    () => Array.from(new Set(logs.map(l => l.content_type))).sort((a, b) => a - b),
    [logs]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter(l =>
      l.object_repr.toLowerCase().includes(q) ||
      l.object_id.toLowerCase().includes(q) ||
      l.change_message.toLowerCase().includes(q) ||
      (l.username || '').toLowerCase().includes(q) ||
      LogActionLabels[l.action_flag].includes(q)
    );
  }, [logs, query]);

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageNumbers = getVisiblePageNumbers(safePage, totalPages);
  const pagedLogs = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleDelete = async (log: LogEntry) => {
    const confirmed = window.confirm(`هل تريد حذف هذا السجل (${log.object_repr})؟`);
    if (!confirmed) return;
    const res = await deleteLogEntry(log.id);
    if (res.success) {
      addToast({ type: 'success', message: 'تم حذف السجل بنجاح' });
      setLogs(prev => prev.filter(l => l.id !== log.id));
    } else {
      addToast({ type: 'error', message: res.error || 'حدث خطأ أثناء الحذف' });
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">سجل الحركة</h1>
          <div className="page-subtitle">سجل عمليات الإضافة والتعديل والحذف في النظام ({logs.length} سجل)</div>
        </div>
        <div className="page-header-right">
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
            <Plus size={16} />
            إضافة سجل
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
              placeholder="ابحث في السجلات..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>الوقت</th>
                <th>المستخدم</th>
                <th>الإجراء</th>
                <th>الكائن</th>
                <th>نوع المحتوى</th>
                <th>تفاصيل التغيير</th>
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
              ) : pagedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    لا توجد سجلات مطابقة للبحث
                  </td>
                </tr>
              ) : (
                pagedLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <Clock size={12} />
                        {new Date(log.action_time).toLocaleString('ar-EG', { hour12: true })}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                        <User size={13} style={{ color: 'var(--emerald-400)' }} />
                        {log.username || `#${log.user_id}`}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${actionBadgeClass[log.action_flag] || 'muted'}`}>
                        <History size={12} />
                        {LogActionLabels[log.action_flag]}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{log.object_repr}</td>
                    <td>
                      <span className="badge blue">
                        <Box size={12} />
                        #{log.content_type}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 300 }}>
                      {log.change_message || '-'}
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          className="btn btn-ghost btn-icon"
                          title="تعديل"
                          onClick={() => { setEditing(log); setShowModal(true); }}
                        >
                          <Pencil size={16} style={{ color: 'var(--blue-400)' }} />
                        </button>
                        <button className="btn btn-ghost btn-icon" title="حذف" onClick={() => handleDelete(log)}>
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
            عرض {pagedLogs.length} من أصل {totalCount} نتيجة
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
        title={editing ? 'تعديل السجل' : 'إضافة سجل جديد'}
        icon={<History size={16} style={{ color: 'var(--gold-400)', marginLeft: 8 }} />}
      >
        <LogEntryForm
          key={editing ? editing.id : 'new'}
          existing={editing}
          users={users}
          contentTypes={contentTypes.length > 0 ? contentTypes : [1]}
          onSuccess={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}