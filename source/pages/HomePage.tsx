import React, { useState } from 'react';
import { useNetwork } from '@/contexts/NetworkContext';
import { Radio, Users, Globe, Zap, Cpu, Copy, Check, Link, Unlink, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const HomePage: React.FC = () => {
  const { state, connectToPeer, disconnectFromPeer } = useNetwork();
  const { t } = useTranslation();
  const [remotePeerId, setRemotePeerId] = useState('');
  const [copied, setCopied] = useState(false);

  const handleConnect = () => {
    if (!remotePeerId.trim()) return;
    const ok = connectToPeer(remotePeerId.trim());
    if (ok) {
      toast.success(`${t('home.connectBtn')} ${remotePeerId.slice(0, 12)}...`);
      setRemotePeerId('');
    } else {
      toast.error('Connection failed or already connected');
    }
  };

  const handleCopy = () => {
    if (!state.peerId) return;
    navigator.clipboard.writeText(state.peerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-8 max-w-lg mx-auto w-full">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="space-y-2 mt-4"
      >
        <h2 className="text-4xl font-bold tracking-tighter gradient-text">{t('home.title')}</h2>
        <p className="text-white/50 text-sm font-medium uppercase tracking-[0.2em]">
          {t('home.subtitle')}
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <StatusCard
          icon={<Cpu className="w-5 h-5" />}
          title={t('app.peerId')}
          value={state.peerId?.slice(0, 10) || '...'}
          delay={0.1}
          mono
        />
        <StatusCard
          icon={<Globe className="w-5 h-5" />}
          title={t('app.status')}
          value={state.connected ? t('app.connected') : t('app.searching')}
          status={state.connected ? 'active' : 'searching'}
          delay={0.2}
        />
        <StatusCard
          icon={<Users className="w-5 h-5" />}
          title={t('app.peers')}
          value={state.activePeers.toString()}
          delay={0.3}
        />
        <StatusCard
          icon={<Zap className="w-5 h-5" />}
          title={t('app.latency')}
          value="< 50MS"
          delay={0.4}
        />
      </div>

      {/* Your Peer ID */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="glass-card p-5 rounded-[2rem] space-y-3"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{t('home.yourId')}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? t('home.copied') : t('home.copyId')}
          </button>
        </div>
        <p className="font-mono text-xs text-white/70 break-all">{state.peerId || '...'}</p>
        <p className="text-[10px] text-white/30">{t('home.shareId')}</p>
      </motion.div>

      {/* Connect to Peer */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="glass-card p-5 rounded-[2rem] space-y-4"
      >
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
          <Link className="w-4 h-4" />
          {t('home.connectToPeer')}
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={remotePeerId}
            onChange={(e) => setRemotePeerId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
            placeholder={t('home.peerIdPlaceholder')}
            className="flex-1 h-12 px-5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button
            onClick={handleConnect}
            disabled={!remotePeerId.trim()}
            className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {t('home.connectBtn')}
          </button>
        </div>
      </motion.div>

      {/* Connected Peers List */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="glass-card p-5 rounded-[2rem] space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
            <Share2 className="w-4 h-4" />
            {t('home.connectedPeers')}
          </div>
          <span className="text-[10px] font-bold text-primary">{state.activePeers}</span>
        </div>
        <div className="space-y-2">
          <AnimatePresence>
            {state.connectedPeerIds.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-white/30 text-center py-4"
              >
                {t('home.noPeers')}
              </motion.p>
            ) : (
              state.connectedPeerIds.map((peerId) => (
                <motion.div
                  key={peerId}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -10, opacity: 0 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px] shadow-accent shrink-0" />
                    <span className="font-mono text-xs text-white/70 truncate">{peerId}</span>
                  </div>
                  <button
                    onClick={() => disconnectFromPeer(peerId)}
                    className="shrink-0 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/30 hover:text-red-400 transition-colors"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    {t('home.disconnect')}
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.65 }}
        className="glass-card p-6 rounded-[2.5rem] relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />

        <div className="relative z-10 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center neon-glow-blue">
            <Radio className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold font-heading">{t('home.cardTitle')}</h3>
            <p className="text-sm text-white/50 leading-relaxed">
              {t('home.cardText')}
            </p>
          </div>
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/70">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              {t('home.meshActive')}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface StatusCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  mono?: boolean;
  status?: 'active' | 'searching' | 'none';
  delay: number;
}

const StatusCard: React.FC<StatusCardProps> = ({ icon, title, value, mono, status, delay }) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay }}
      className="glass-card p-5 rounded-3xl flex flex-col justify-between h-32 border-white/5 hover:border-white/20 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">
          {title}
        </div>
        <div className="text-white/40">{icon}</div>
      </div>
      <div className={cn(
        "text-lg font-bold truncate tracking-tight",
        mono && "font-mono text-xs",
        status === 'active' && "text-accent",
        status === 'searching' && "text-primary animate-pulse"
      )}>
        {value}
      </div>
    </motion.div>
  );
};

export default HomePage;