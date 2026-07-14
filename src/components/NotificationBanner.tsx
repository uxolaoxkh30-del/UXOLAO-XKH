import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, ShieldAlert, CheckCircle, LogIn, LogOut, FileText, MapPin, X } from 'lucide-react';
import { SystemNotification } from '../types';

interface NotificationBannerProps {
  notifications: SystemNotification[];
  onDismiss: (id: string) => void;
}

// Dynamically synthesize a clean corporate notification sound using the Web Audio API
export const playNotificationSound = () => {
  if (sessionStorage.getItem('active_view') !== 'hr') {
    return; // Only play sound for HR
  }
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const audioCtx = new AudioContextClass();
    
    // Tone 1: high pleasant note
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    gain1.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start();
    osc1.stop(audioCtx.currentTime + 0.4);
    
    // Tone 2: slightly higher harmony tone shortly after
    setTimeout(() => {
      if (audioCtx.state === 'closed') return;
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, audioCtx.currentTime); // A5
      gain2.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start();
      osc2.stop(audioCtx.currentTime + 0.4);
    }, 120);

  } catch (e) {
    console.warn("Web Audio chime blocked or unsupported", e);
  }
};

// Trigger a real browser notification if permission is granted
export const triggerNativeNotification = (title: string, body: string) => {
  if (sessionStorage.getItem('active_view') !== 'hr') {
    return; // Only notify HR
  }
  if (!('Notification' in window)) return;
  
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%230d9488" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
};

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ notifications, onDismiss }) => {
  const activeView = sessionStorage.getItem('active_view');
  if (activeView !== 'hr') {
    return null; // Only show banner for HR
  }

  const activeNotifications = notifications.filter(n => !n.read).slice(-3); // Show max 3 recent unread

  useEffect(() => {
    if (activeNotifications.length > 0) {
      playNotificationSound();
    }
  }, [activeNotifications.length]);

  const getIcon = (type: SystemNotification['type']) => {
    switch (type) {
      case 'check_in':
        return <LogIn className="w-5 h-5 text-emerald-500" />;
      case 'check_out':
        return <LogOut className="w-5 h-5 text-amber-500" />;
      case 'leave_request':
        return <FileText className="w-5 h-5 text-purple-500" />;
      case 'trip_request':
        return <MapPin className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-teal-500" />;
    }
  };

  const getHeaderLabel = (type: SystemNotification['type']) => {
    switch (type) {
      case 'check_in':
        return 'ແຈ້ງເຕືອນ: ເຂົ້າວຽກ (Check In)';
      case 'check_out':
        return 'ແຈ້ງເຕືອນ: ອອກວຽກ (Check Out)';
      case 'leave_request':
        return 'ແຈ້ງເຕືອນ: ການລາພັກ';
      case 'trip_request':
        return 'ແຈ້ງເຕືອນ: ໄປວຽກນອກ';
      default:
        return 'ແຈ້ງເຕືອນລະບົບ';
    }
  };

  return (
    <div id="notification-container" className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0">
      <AnimatePresence>
        {activeNotifications.map((notif) => (
          <motion.div
            id={`notif-banner-${notif.id}`}
            key={notif.id}
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, x: 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border-l-4 border-teal-500 border border-slate-100 dark:border-slate-800 p-4 flex items-start gap-3 pointer-events-auto"
          >
            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl flex-shrink-0">
              {getIcon(notif.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">
                  {getHeaderLabel(notif.type)}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {notif.timestamp}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate font-sans">
                {notif.employeeName}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {notif.message}
              </p>
            </div>
            <button
              id={`close-notif-${notif.id}`}
              onClick={() => onDismiss(notif.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
