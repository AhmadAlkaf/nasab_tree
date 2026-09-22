'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';
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
  History
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
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
      { href: '/persons', label: 'الأشخاص', icon: Users },
      { href: '/persons/new', label: 'إضافة شخص', icon: UserPlus },
      { href: '/tree', label: 'الشجرة', icon: GitBranch },
    ],
  },
  {
    title: 'الطلبات',
    items: [
      { href: '/requests', label: 'قائمة الطلبات', icon: ClipboardList },
      { href: '/requests/new', label: 'إضافة طلب', icon: Plus },
      { href: '/requests/statuses', label: 'حالات الطلبات', icon: Clock },
      { href: '/requests/forms', label: 'استمارات الطلبات', icon: FileText },
    ],
  },
  {
    title: 'المعرّفين المناطق',
    items: [
      { href: '/references', label: 'قائمة المعرّفين', icon: BookUser },
      { href: '/references/new', label: 'إضافة معرّف', icon: UserPlus },
      { href: '/references/responses', label: 'الردود على الطلبات', icon: MessageSquareReply },
    ],
  },
  {
    title: 'الإدارة',
    items: [
      { href: '/users', label: 'المستخدمون', icon: Users },
      { href: '/groups', label: 'المجموعات', icon: Shield },
      { href: '/permissions', label: 'الصلاحيات', icon: KeySquare },
      { href: '/logs', label: 'سجل الحركة', icon: History },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar, theme, toggleTheme } = useAppStore();

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
          {navSections.map((section, sectionIndex) => (
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
        </div>
      </aside>
    </>
  );
}
