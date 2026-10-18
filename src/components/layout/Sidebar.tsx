'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { logout } from '@/lib/api';
import { canWithUser, PERM } from '@/lib/auth';
import {
  Home,
  Users,
  GitBranch,
  UserPlus,
  ClipboardList,
  Plus,
  Clock,
  FileText,
  BookUser,
  MessageSquareReply,
  Menu,
  X,
  Sun,
  Moon,
  Shield,
  KeySquare,
  History,
  LogOut,
  UserCircle
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  permission?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'القائمة الرئيسية',
    items: [
      { href: '/', label: 'الرئيسية', icon: Home },
    ],
  },
  {
    title: 'إدارة الإثبات',
    items: [
      { href: '/persons', label: 'الأشخاص', icon: Users, permission: PERM.person.view },
      { href: '/persons/new', label: 'إضافة شخص', icon: UserPlus, permission: PERM.person.add },
      { href: '/tree', label: 'الشجرة', icon: GitBranch, permission: PERM.person.view },
    ],
  },
  {
    title: 'الطلبات',
    items: [
      { href: '/requests', label: 'قائمة الطلبات', icon: ClipboardList, permission: PERM.requser.view },
      { href: '/requests/new', label: 'إضافة طلب', icon: Plus, permission: PERM.requser.add },
      { href: '/requests/statuses', label: 'حالات الطلبات', icon: Clock, permission: PERM.status.view },
      { href: '/requests/forms', label: 'استمارات الطلبات', icon: FileText, permission: PERM.form.view },
    ],
  },
  {
    title: 'المعرّفين المناطق',
    items: [
      { href: '/references', label: 'قائمة المعرّفين', icon: BookUser, permission: PERM.reference.view },
      { href: '/references/new', label: 'إضافة معرّف', icon: UserPlus, permission: PERM.reference.add },
      { href: '/references/responses', label: 'الردود على الطلبات', icon: MessageSquareReply, permission: PERM.referenceRequser.view },
    ],
  },
  {
    title: 'الإدارة',
    items: [
      { href: '/users', label: 'المستخدمون', icon: Users, permission: PERM.user.view },
      { href: '/groups', label: 'المجموعات', icon: Shield, permission: PERM.group.view },
      { href: '/permissions', label: 'الصلاحيات', icon: KeySquare, permission: PERM.permission.view },
      { href: '/logs', label: 'سجل الحركة', icon: History, permission: PERM.logEntry.view },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar, theme, toggleTheme } = useAppStore();
  const isStaff = useAppStore((s) => s.isStaff);
  const permissions = useAppStore((s) => s.permissions);
  const username = useAppStore((s) => s.username);
  const clearAuth = useAppStore((s) => s.clearAuth);
  const addToast = useAppStore((s) => s.addToast);

  const visibleSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.permission || canWithUser(isStaff, permissions, item.permission)
      ),
    }))
    .filter((section) => section.items.length > 0);

  const handleLogout = async () => {
    await logout();
    clearAuth();
    addToast({ type: 'info', message: 'تم تسجيل الخروج بنجاح' });
    window.location.href = '/login';
  };

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={toggleSidebar}
        aria-label="toggle sidebar"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`sidebar ${!isSidebarOpen ? 'closed' : ''} ${isSidebarOpen ? 'open-mobile' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">نسب</div>
          <div>
            <div className="sidebar-title">شجرة الأنساب</div>
            <div className="sidebar-subtitle">نظام إدارة الشجرة النسبية</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {visibleSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <div className="nav-section-title">{section.title}</div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      if (window.innerWidth < 768) toggleSidebar();
                    }}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              <UserCircle size={22} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="sidebar-user-name">{username || 'مستخدم'}</div>
              <div className="sidebar-user-role">{isStaff ? 'مدير النظام' : 'مستخدم'}</div>
            </div>
          </div>

          <button
            className="nav-link"
            onClick={toggleTheme}
            style={{ justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              <span>{theme === 'dark' ? 'الوضع الداكن' : 'الوضع المضيء'}</span>
            </div>
          </button>

          <button
            className="nav-link"
            onClick={handleLogout}
            style={{ justifyContent: 'space-between', color: 'var(--red-400)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <LogOut size={18} />
              <span>تسجيل الخروج</span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
