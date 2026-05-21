import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MessageSquare, Send, QrCode, Activity, Share2, Languages } from 'lucide-react';
import { useNetwork } from '@/contexts/NetworkContext';
import { cn } from '@/lib/utils';
import { MeshBackground } from '../common/MeshBackground';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useNetwork();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const next = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(next);
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-background text-foreground touch-precision selection:bg-primary/30">
      <MeshBackground />
      
      {/* Top Bar */}
      <header className="h-20 flex items-center justify-between px-6 border-b border-white/5 bg-background/20 backdrop-blur-2xl sticky top-0 z-50">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-3 overflow-hidden"
        >
          <div className="relative">
            <Activity className="w-8 h-8 text-primary shrink-0 neon-glow-blue" />
            <motion.div 
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-primary/20"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-lg font-bold tracking-tighter font-heading leading-tight">SAHELMESH</h1>
            <span className="text-[10px] font-mono text-white/40 truncate tracking-widest uppercase">
              {state.peerId?.slice(0, 12) || 'INITIALIZING'}
            </span>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-morphism border-white/10 hover:border-primary/30 transition-colors active:scale-95"
            title={t('common.language')}
          >
            <Languages className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-tighter text-white/60">
              {i18n.language === 'fr' ? 'FR' : 'EN'}
            </span>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-morphism border-white/10">
            <div className={cn(
              "w-2 h-2 rounded-full shadow-[0_0_8px]",
              state.connected ? "bg-accent shadow-accent" : "bg-white/20"
            )} />
            <span className="text-[10px] font-bold uppercase tracking-tighter opacity-80">
              {state.activePeers} {t('app.activePeers')}
            </span>
          </div>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 z-10 relative pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md h-20 bg-card/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] flex items-center justify-around px-2 z-50 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
        <NavItem to="/" icon={<Home className="w-6 h-6" />} label={t('nav.home')} />
        <NavItem to="/network" icon={<Share2 className="w-6 h-6" />} label={t('nav.network')} />
        <NavItem to="/messages" icon={<MessageSquare className="w-6 h-6" />} label={t('nav.feed')} />
        <NavItem to="/send" icon={<Send className="w-6 h-6" />} label={t('nav.send')} />
        <NavItem to="/qr" icon={<QrCode className="w-6 h-6" />} label={t('nav.qr')} />
      </nav>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "relative flex flex-col items-center justify-center gap-1 w-14 h-14 transition-all duration-300",
        isActive ? "text-primary" : "text-white/40 hover:text-white/70"
      )}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div 
              layoutId="nav-active"
              className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          {icon}
          <span className="text-[9px] font-bold uppercase tracking-tighter">{label}</span>
        </>
      )}
    </NavLink>
  );
};
