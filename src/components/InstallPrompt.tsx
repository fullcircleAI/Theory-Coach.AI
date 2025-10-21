import React, { useState, useEffect } from 'react';
import './InstallPrompt.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Check if user dismissed before
    const dismissed = localStorage.getItem('installPromptDismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return; // Don't show again for 7 days
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 5 seconds
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('installPromptDismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="install-prompt-overlay" onClick={handleDismiss}>
      <div className="install-prompt" onClick={(e) => e.stopPropagation()}>
        <button className="install-close" onClick={handleDismiss}>×</button>
        
        <div className="install-mascot">
          <img src="/images/mascot.png" alt="Theory Coach AI Mascot" className="mascot-image" />
        </div>
        
        <h3 className="install-title">Install Theory Coach AI</h3>
        <p className="install-description">
          Master driving theory in 24 hours with our AI-powered coaching system
        </p>
        
        <div className="install-features">
          <div className="install-feature">
            <div className="feature-icon">⚡</div>
            <span>Fast & Offline</span>
          </div>
          <div className="install-feature">
            <div className="feature-icon">📱</div>
            <span>Home Screen Access</span>
          </div>
          <div className="install-feature">
            <div className="feature-icon">🎯</div>
            <span>Native App Feel</span>
          </div>
        </div>
        
        <div className="install-actions">
          <button className="install-btn primary" onClick={handleInstall}>
            Install Now
          </button>
          <button className="install-btn secondary" onClick={handleDismiss}>
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

