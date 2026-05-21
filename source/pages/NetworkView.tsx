import React, { useMemo } from 'react';
import { useNetwork } from '@/contexts/NetworkContext';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Wifi, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NetworkView: React.FC = () => {
  const { state, messages } = useNetwork();
  const { t } = useTranslation();

  const peerNodes = useMemo(() => {
    const nodes: Array<{ id: string; label: string; x: number; y: number; type: 'self' | 'peer' | 'search' }> = [];
    nodes.push({ id: 'self', label: t('network.you'), x: 50, y: 50, type: 'self' });

    const peerIds = state.connectedPeerIds;
    for (let i = 0; i < peerIds.length; i++) {
      const angle = (i / Math.max(peerIds.length, 1)) * Math.PI * 2;
      nodes.push({
        id: peerIds[i],
        label: peerIds[i].slice(0, 8),
        x: 50 + Math.cos(angle) * 35,
        y: 50 + Math.sin(angle) * 35,
        type: 'peer'
      });
    }

    if (peerIds.length === 0) {
      nodes.push({ id: 'relay-1', label: t('network.searching'), x: 20, y: 30, type: 'search' });
      nodes.push({ id: 'relay-2', label: t('network.searching'), x: 80, y: 70, type: 'search' });
    }

    return nodes;
  }, [state.connectedPeerIds, t]);

  return (
    <div className="p-4 flex-1 flex flex-col max-w-lg mx-auto w-full">
      <div className="space-y-1 mb-8">
        <h2 className="text-3xl font-bold tracking-tight gradient-text">{t('network.title')}</h2>
        <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase opacity-70">
          {t('network.subtitle')}
        </p>
      </div>

      <div className="flex-1 relative bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden glass-morphism min-h-[400px]">
        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {peerNodes.filter(n => n.type === 'peer').map((node, i) => (
            <motion.line
              key={`line-${i}`}
              x1="50%"
              y1="50%"
              x2={`${node.x}%`}
              y2={`${node.y}%`}
              stroke="hsl(var(--accent))"
              strokeWidth="1"
              strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          ))}
        </svg>

        {/* Nodes */}
        {peerNodes.map((node) => (
          <motion.div
            key={node.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <div className={`relative w-12 h-12 rounded-full flex items-center justify-center ${
              node.type === 'self' ? 'bg-primary neon-glow-blue' :
              node.type === 'peer' ? 'bg-accent neon-glow-cyan' : 'bg-muted/30 border border-white/10'
            }`}>
              {node.type === 'self' ? <Zap className="w-6 h-6 text-white" /> :
               node.type === 'peer' ? <Wifi className="w-5 h-5 text-accent-foreground" /> :
               <div className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />}

              {(node.type === 'self' || node.type === 'peer') && (
                <motion.div
                  className={`absolute inset-0 rounded-full border-2 ${node.type === 'self' ? 'border-primary' : 'border-accent'}`}
                  animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />
              )}
            </div>
            <span className="text-[10px] font-bold tracking-tighter text-white/60 whitespace-nowrap bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
              {node.label}
            </span>
          </motion.div>
        ))}

        {/* Message Propagation Visualization */}
        <AnimatePresence>
          {messages.slice(0, 1).map((msg) => (
            <motion.div
              key={`prop-${msg.id}`}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 4], opacity: [0.8, 0] }}
              transition={{ duration: 2, repeat: 3 }}
            >
              <div className="w-32 h-32 rounded-full border-2 border-accent/30 bg-accent/5 blur-sm" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="glass-card p-4 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Share2 className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{t('network.relayPoints')}</span>
          </div>
          <p className="text-2xl font-bold font-heading">{state.activePeers}</p>
        </div>
        <div className="glass-card p-4 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-accent">
            <Zap className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{t('network.meshHealth')}</span>
          </div>
          <p className="text-2xl font-bold font-heading">{state.connected ? t('app.connected') : t('app.searching')}</p>
        </div>
      </div>

      {/* Connected peer list */}
      {state.connectedPeerIds.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-4 glass-card p-4 rounded-2xl space-y-3"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{t('home.connectedPeers')}</span>
          <div className="flex flex-wrap gap-2">
            {state.connectedPeerIds.map((peerId) => (
              <span key={peerId} className="px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-mono text-accent font-bold">
                {peerId.slice(0, 12)}...
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default NetworkView;