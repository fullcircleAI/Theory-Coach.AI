import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './FooterNav.css';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
}

export const FooterNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t_nested } = useLanguage();

  const navItems: NavItem[] = [
    {
      id: 'new-dashboard',
      label: t_nested('navigation.dashboard') || 'Dashboard',
      path: '/new-dashboard',
      icon: '📊',
    },
    {
      id: 'practice',
      label: t_nested('navigation.practice') || 'Practice',
      path: '/tests',
      icon: '📚',
    },
    {
      id: 'mock-exam',
      label: t_nested('navigation.mockExam') || 'Mock Exam',
      path: '/mock-exam',
      icon: '📝',
    },
    {
      id: 'settings',
      label: t_nested('navigation.settings') || 'Settings',
      path: '/settings',
      icon: '⚙️',
    }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleClick = (path: string) => {
    console.log('Footer navigation clicked:', path);
    try {
      navigate(path);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <div className="footer-nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`footer-nav-btn ${isActive(item.path) ? 'active' : ''}`}
          onClick={() => handleClick(item.path)}
          onTouchStart={() => handleClick(item.path)}
          aria-label={item.label}
          style={{ 
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
        >
          <span className="footer-nav-icon">{item.icon}</span>
        </button>
      ))}
    </div>
  );
};


