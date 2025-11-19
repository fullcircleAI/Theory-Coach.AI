import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './Navigation.css';

// SVG Icons
const DashboardIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#007AFF' : '#8E8E93'} strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const PracticeIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#007AFF' : '#8E8E93'} strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="15" x2="15" y2="15" />
    <line x1="9" y1="12" x2="15" y2="12" />
  </svg>
);

const MockExamIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#007AFF' : '#8E8E93'} strokeWidth="2">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const SettingsIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#007AFF' : '#8E8E93'} strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6m6-12h-6m-6 0H1m11 6h6m-6 0H1" />
  </svg>
);

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t_nested } = useLanguage();

  // Navigation items - exact paths matching App.tsx routes
  const navItems = [
    {
      id: 'dashboard',
      label: t_nested('navigation.dashboard'),
      icon: DashboardIcon,
      path: '/',
    },
    {
      id: 'practice',
      label: t_nested('navigation.practice'),
      icon: PracticeIcon,
      path: '/tests',
    },
    {
      id: 'mock-exam',
      label: t_nested('navigation.mockExam'),
      icon: MockExamIcon,
      path: '/mock-exam',
    },
    {
      id: 'settings',
      label: t_nested('navigation.settings'),
      icon: SettingsIcon,
      path: '/settings',
    }
  ];

  // Handle navigation - simple and direct
  const handleClick = (path: string) => {
    navigate(path);
  };

  // Check if path is active
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Sidebar - Labels visible on web */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-list">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar-nav-btn ${active ? 'active' : ''}`}
                onClick={() => handleClick(item.path)}
                title={item.label}
                aria-label={item.label}
              >
                <IconComponent active={active} />
                <span className="sidebar-nav-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Footer - Icons only on mobile */}
      <div className="footer-nav">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              type="button"
              className={`footer-nav-btn ${active ? 'active' : ''}`}
              onClick={() => handleClick(item.path)}
              title={item.label}
              aria-label={item.label}
            >
              <IconComponent active={active} />
            </button>
          );
        })}
      </div>
    </>
  );
};


