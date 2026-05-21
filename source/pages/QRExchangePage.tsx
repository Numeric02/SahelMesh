import React, { useRef, useState } from 'react';
import { useNetwork } from '@/contexts/NetworkContext';
import { QRCodeSVG } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, Scan, ShieldAlert, ChevronRight, X } from 'lucide-react';
import { Message } from '@/lib/db';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

const QRExchangePage: React.FC = () => {
  const { messages, importMessage } = useNetwork();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('generate');
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const selectedMessage = messages.find(m => m.id === selectedMsgId);

  const startScan = async () => {
    setIsScanning(true);
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;
    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          try {
            const msg = JSON.parse(decodedText) as Message;
            if (msg.id && msg.text) {
              await importMessage(msg);
              toast.success(t('qr.importSuccess'), {
                className: "glass-card border-accent/20 text-accent font-bold",
              });
              await html5QrCode.stop();
              scannerRef.current = null;
              setIsScanning(false);
              setActiveTab('generate');
            }
          } catch (e) {
            console.error("Invalid QR data", e);
            toast.error(t('qr.importError'));
          }
        },
        undefined
      );
    } catch (err) {
      console.error(err);
      scannerRef.current = null;
      setIsScanning(false);
      toast.error(t('qr.cameraError'));
    }
  };

  const stopScan = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current = null;
      }
    } catch (e) {
      // Scanner may already be stopped
    }
    setIsScanning(false);
  };

  return (
    <div className="p-6 space-y-8 max-w-lg mx-auto w-full">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="space-y-1 mt-4"
      >
        <h2 className="text-4xl font-bold tracking-tighter gradient-text">{t('qr.title')}</h2>
        <p className="text-white/50 text-sm font-medium uppercase tracking-[0.2em]">
          {t('qr.subtitle')}
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 glass-morphism h-14 p-1.5 rounded-2xl mb-8">
          <TabsTrigger value="generate" className="rounded-xl font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
            {t('qr.emit')}
          </TabsTrigger>
          <TabsTrigger value="scan" className="rounded-xl font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-accent data-[state=active]:text-accent-foreground transition-all">
            {t('qr.absorb')}
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="generate" key="gen" className="space-y-6 mt-0">
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 glass-card rounded-[2.5rem] border-dashed"
              >
                <QrCode className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{t('qr.emptyDb')}</p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {!selectedMsgId ? (
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-2">{t('qr.selectPacket')}</p>
                    {messages.slice(0, 5).map((m, i) => (
                      <motion.button
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        key={m.id}
                        onClick={() => setSelectedMsgId(m.id)}
                        className="w-full text-left p-5 rounded-[2rem] glass-card hover:bg-white/5 transition-all flex items-center justify-between group"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-primary">{t(`feed.${m.priority}`)}</span>
                            <span className="text-[9px] font-mono text-white/20">#{m.id.slice(0, 6)}</span>
                          </div>
                          <p className="text-sm truncate font-medium text-white/80">{m.text}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card rounded-[3rem] overflow-hidden flex flex-col items-center p-8 relative"
                  >
                    <button 
                      onClick={() => setSelectedMsgId(null)}
                      className="absolute top-6 right-6 w-10 h-10 rounded-full glass-morphism flex items-center justify-center text-white/40 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="relative group p-6 bg-white rounded-[2rem] mb-8 mt-4 neon-glow-blue">
                      <QRCodeSVG 
                        value={JSON.stringify(selectedMessage)} 
                        size={200}
                        level="M"
                        includeMargin={false}
                      />
                    </div>
                    
                    <div className="text-center space-y-4 w-full px-4">
                      <p className="text-base font-bold text-white/90 leading-tight line-clamp-2">{selectedMessage?.text}</p>
                      <div className="flex items-center justify-center gap-6">
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">{t('feed.ttl')}</span>
                          <span className="text-sm font-bold text-primary">{selectedMessage?.ttl}</span>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">{t('send.priority')}</span>
                          <span className="text-sm font-bold text-accent">{t(`feed.${selectedMessage?.priority}`)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="scan" key="scan" className="space-y-6 mt-0">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-card rounded-[3rem] overflow-hidden aspect-square relative flex items-center justify-center border-white/10"
            >
              <div id="reader" className="w-full h-full object-cover"></div>
              
              <AnimatePresence>
                {!isScanning && (
                  <motion.div 
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md p-10 text-center space-y-6"
                  >
                    <div className="relative">
                      <Scan className="w-16 h-16 text-accent neon-glow-cyan" />
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[-10px] border border-accent/20 border-dashed rounded-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-bold font-heading tracking-tight">{t('qr.opticalAbsorption')}</h4>
                      <p className="text-sm text-white/50 leading-relaxed px-4">{t('qr.scanDesc')}</p>
                    </div>
                    <Button onClick={startScan} className="bg-accent text-accent-foreground font-bold h-16 px-12 rounded-2xl shadow-lg neon-glow-cyan active:scale-95 transition-all">
                      {t('qr.initScan')}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none border-2 border-accent/50 m-12 rounded-2xl">
                  <motion.div 
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-0.5 bg-accent neon-glow-cyan shadow-[0_0_20px_hsl(var(--accent))]"
                  />
                </div>
              )}
              
              {isScanning && (
                <Button 
                  onClick={stopScan} 
                  variant="destructive" 
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 font-bold px-8 h-12 rounded-xl bg-red-500/20 text-red-500 border border-red-500/20 backdrop-blur-md hover:bg-red-500 hover:text-white transition-all"
                >
                  {t('qr.abortSession')}
                </Button>
              )}
            </motion.div>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="p-6 glass-card rounded-[2rem] space-y-4 border-white/5"
            >
              <div className="flex items-center gap-3 text-accent">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('qr.protocolTitle')}</h4>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                {t('qr.protocolDesc')}
              </p>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
};

export default QRExchangePage;
