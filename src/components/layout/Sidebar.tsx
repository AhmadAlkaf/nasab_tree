'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import {
  Home,
  Users,
  GitBranch,
  UserPlus,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'الرئيسية', icon: Home },
  { href: '/persons', label: 'الأشخاص', icon: Users },
  { href: '/tree', label: 'الشجرة', icon: GitBranch },
  { href: '/persons/new', label: 'إضافة شخص', icon: UserPlus },
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
          <div className="nav-section-title">القائمة الرئيسية</div>
          {navItems.map((item) => {
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
