import React from 'react';
import { useNetwork } from '@/contexts/NetworkContext';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Clock, Share2, Shield, MessageSquare, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message } from '@/lib/db';
import { useTranslation } from 'react-i18next';

const MessageFeedPage: React.FC = () => {
  const { messages } = useNetwork();
  const { t } = useTranslation();

  return (
    <div className="p-6 space-y-6 max-w-lg mx-auto w-full">
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="space-y-1 mb-4"
      >
        <h2 className="text-4xl font-bold tracking-tighter gradient-text">{t('feed.title')}</h2>
        <p className="text-white/50 text-sm font-medium uppercase tracking-[0.2em]">
          {t('feed.subtitle')}
        </p>
      </motion.div>

      <AnimatePresence mode="popLayout">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center space-y-4"
          >
            <div className="w-20 h-20 rounded-[2rem] glass-morphism flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-white/20" />
            </div>
            <p className="text-sm font-bold tracking-widest text-white/30 uppercase">{t('feed.empty')}</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <MessageCard key={msg.id} message={msg} index={i} />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const statusMap: Record<string, string> = {
  pending: 'feed.pending',
  delivered: 'feed.delivered',
  relayed: 'feed.relayed',
  expired: 'feed.expired',
};

const MessageCard: React.FC<{ message: Message; index: number }> = ({ message, index }) => {
  const { state } = useNetwork();
  const { t } = useTranslation();
  const isEmergency = message.priority !== 'normal';
  const isOwn = message.senderId === state.peerId;
  const relayedCount = (message.relayedTo || []).length - 1;
  const statusKey = statusMap[message.status] || 'feed.pending';

  const statusColor =
    message.status === 'expired' ? 'text-red-400' :
    message.status === 'pending' ? 'text-amber-400' :
    'text-accent';

  return (
    <motion.div
      layout
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "glass-card rounded-[2rem] p-6 relative overflow-hidden group border-white/5",
        isEmergency ? "border-primary/20 bg-primary/5" : "hover:border-white/10"
      )}
    >
      {isEmergency && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-2xl -mr-12 -mt-12" />
      )}

      <div className="flex flex-col gap-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              "px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest shrink-0",
              isEmergency ? "bg-primary text-white neon-glow-blue" : "bg-white/10 text-white/60"
            )}>
              {t(`feed.${message.priority}`)}
            </div>
            <span className="text-[10px] font-mono text-white/30 tracking-widest truncate">
              {t('feed.sender')}://{message.senderId.slice(0, 8)}
            </span>
            {isOwn && (
              <span className="text-[9px] font-bold text-accent uppercase tracking-widest shrink-0">YOU</span>
            )}
          </div>
          <div className="text-[10px] font-bold text-white/30 flex items-center gap-1 uppercase tracking-tighter shrink-0">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(message.timestamp, { addSuffix: false })}
          </div>
        </div>

        <p className="text-base font-medium leading-relaxed text-white/90">
          {message.text}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-accent" />
              <span className="text-[10px] font-bold text-white/40 tracking-widest">{message.relayCount}X</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-bold text-white/40 tracking-widest">{t('feed.ttl')} {message.ttl}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {message.status === 'expired' ? (
                <WifiOff className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Wifi className="w-3.5 h-3.5 text-accent" />
              )}
              <span className="text-[10px] font-bold text-white/40 tracking-widest">{relayedCount > 0 ? `${relayedCount} ${t('feed.relays')}` : t('feed.relays')}</span>
            </div>
          </div>

          <div className={cn("flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest", statusColor)}>
            <span className={cn("w-1 h-1 rounded-full animate-pulse", message.status === 'expired' ? 'bg-red-400' : 'bg-accent')} />
            {t(statusKey)}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageFeedPage;
