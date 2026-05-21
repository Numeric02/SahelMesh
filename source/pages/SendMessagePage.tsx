import React, { useState } from 'react';
import { useNetwork } from '@/contexts/NetworkContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessagePriority, db } from '@/lib/db';
import { useNavigate } from 'react-router-dom';
import { Send, AlertCircle, Sparkles, QrCode, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';

const SendMessagePage: React.FC = () => {
  const { sendMessage, state } = useNetwork();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<MessagePriority>('normal');
  const [ttl, setTtl] = useState('5');
  const [isSending, setIsSending] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrMsg, setQrMsg] = useState<Record<string, unknown> | null>(null);

  const handleSend = async () => {
    if (!text.trim() || !state.peerId) return;

    setIsSending(true);
    try {
      console.log('Sending message from page:', text, priority, ttl);
      await sendMessage(text, priority, parseInt(ttl));
      setText('');
      navigate('/messages');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateQR = async () => {
    if (!text.trim() || !state.peerId) return;

    const msg = {
      id: crypto.randomUUID(),
      text,
      senderId: state.peerId,
      timestamp: Date.now(),
      ttl: parseInt(ttl),
      priority,
      status: 'pending' as const,
      relayCount: 0,
      hops: [state.peerId],
      relayedTo: [state.peerId],
    };

    await db.messages.add(msg);
    setQrMsg(msg);
    setShowQR(true);
  };

  const closeQR = () => {
    setShowQR(false);
    setQrMsg(null);
  };

  const hasPeers = state.activePeers > 0;

  return (
    <div className="p-6 space-y-8 max-w-lg mx-auto w-full">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="space-y-1 mt-4"
      >
        <h2 className="text-4xl font-bold tracking-tighter gradient-text">{t('send.title')}</h2>
        <p className="text-white/50 text-sm font-medium uppercase tracking-[0.2em]">
          {t('send.subtitle')}
        </p>
      </motion.div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 px-1">{t('send.transmissionData')}</Label>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-[2rem] opacity-20 blur group-focus-within:opacity-40 transition-opacity" />
            <Textarea
              id="message"
              placeholder={t('send.placeholder')}
              className="relative min-h-[180px] bg-card/80 backdrop-blur-md border-white/5 focus:border-white/10 rounded-[2rem] resize-none p-6 text-base font-medium placeholder:text-white/20"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 px-1">{t('send.priority')}</Label>
            <Select value={priority} onValueChange={(val) => setPriority(val as MessagePriority)}>
              <SelectTrigger className="glass-card rounded-2xl h-14 border-white/5 hover:border-white/10 transition-colors">
                <SelectValue placeholder={t('send.selectPriority')} />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/10 rounded-2xl">
                <SelectItem value="normal">{t('feed.normal')}</SelectItem>
                <SelectItem value="urgent">{t('feed.urgent')}</SelectItem>
                <SelectItem value="help">{t('feed.help')}</SelectItem>
                <SelectItem value="medical">{t('feed.medical')}</SelectItem>
                <SelectItem value="danger">{t('feed.danger')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 px-1">{t('send.ttl')}</Label>
            <Select value={ttl} onValueChange={setTtl}>
              <SelectTrigger className="glass-card rounded-2xl h-14 border-white/5 hover:border-white/10 transition-colors">
                <SelectValue placeholder={t('send.selectTTL')} />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/10 rounded-2xl">
                <SelectItem value="1">{t('send.hop1')}</SelectItem>
                <SelectItem value="3">{t('send.hop3')}</SelectItem>
                <SelectItem value="5">{t('send.hop5')}</SelectItem>
                <SelectItem value="10">{t('send.hop10')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {!hasPeers && (
          <div className="flex items-start gap-3 p-5 rounded-2xl glass-morphism border border-red-500/20 text-red-400/80">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs font-medium leading-relaxed">{t('send.offlineWarning')}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleSend}
            disabled={!text.trim() || isSending}
            className="relative flex-1 h-16 rounded-[2rem] text-lg font-bold bg-primary hover:bg-primary/90 transition-all active:scale-[0.98] group overflow-hidden neon-glow-blue"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            {isSending ? (
              <span className="flex items-center gap-2 animate-pulse">
                <Sparkles className="w-5 h-5" />
                {t('send.sending')}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                {t('send.sendBtn')}
              </span>
            )}
          </Button>

          <Button
            onClick={handleGenerateQR}
            disabled={!text.trim()}
            variant="outline"
            className="h-16 px-6 rounded-[2rem] text-sm font-bold border-white/10 hover:bg-white/5 hover:border-accent/50 transition-all active:scale-[0.98]"
          >
            <span className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              {t('send.generateQR')}
            </span>
          </Button>
        </div>
      </div>

      {/* QR Fallback Modal */}
      <AnimatePresence>
        {showQR && qrMsg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
            onClick={closeQR}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-[3rem] overflow-hidden flex flex-col items-center p-8 max-w-sm w-full relative"
            >
              <button
                onClick={closeQR}
                className="absolute top-6 right-6 w-10 h-10 rounded-full glass-morphism flex items-center justify-center text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2 text-center mb-6">
                <h3 className="text-xl font-bold font-heading">{t('send.qrFallbackTitle')}</h3>
                <p className="text-sm text-white/50">{t('send.qrFallbackDesc')}</p>
              </div>

              <div className="relative group p-6 bg-white rounded-[2rem] mb-6 neon-glow-blue">
                <QRCodeSVG
                  value={JSON.stringify(qrMsg)}
                  size={220}
                  level="M"
                  includeMargin={false}
                />
              </div>

              <div className="text-center space-y-3 w-full px-4">
                <p className="text-base font-bold text-white/90 leading-tight line-clamp-2">{qrMsg.text as string}</p>
                <div className="flex items-center justify-center gap-6">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">{t('feed.ttl')}</span>
                    <span className="text-sm font-bold text-primary">{qrMsg.ttl as number}</span>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">{t('send.priority')}</span>
                    <span className="text-sm font-bold text-accent">{t(`feed.${qrMsg.priority as string}`)}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={closeQR}
                className="mt-6 w-full h-14 rounded-2xl font-bold bg-white/5 border border-white/10 hover:bg-white/10"
              >
                {t('send.closeQR')}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SendMessagePage;