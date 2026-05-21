import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { NetworkState } from '../lib/types';
import { p2pService } from '../services/p2pService';
import { Message, db } from '../lib/db';

interface NetworkContextType {
  state: NetworkState;
  messages: Message[];
  sendMessage: (text: string, priority: Message['priority'], ttl: number) => Promise<void>;
  connectToPeer: (peerId: string) => boolean;
  disconnectFromPeer: (peerId: string) => void;
  importMessage: (msg: Message) => Promise<void>;
  refreshMessages: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<NetworkState>(p2pService.getState());

  // Requête en direct : se met à jour automatiquement à chaque ajout/modif/suppression
  const messages = useLiveQuery(
    () => db.messages.orderBy('timestamp').reverse().toArray(),
    [] // pas de dépendances, car la requête s'exécute en continu
  ) ?? [];

  useEffect(() => {
    p2pService.init();

    const unsubState = p2pService.onStateChange(setState);

    // Pas besoin de loadMessages manuel, useLiveQuery le fait pour nous
    // Mais on s'assure que le p2pService déclenche un rafraîchissement des requêtes en direct
    // Dexie observe automatiquement les changements, donc pas d'action supplémentaire.

    return () => {
      unsubState();
    };
  }, []);

  const sendMessage = async (text: string, priority: Message['priority'], ttl: number) => {
    if (!state.peerId) return;

    const msg: Message = {
      id: crypto.randomUUID(),
      text,
      senderId: state.peerId,
      timestamp: Date.now(),
      ttl,
      priority,
      status: 'pending',
      relayCount: 0,
      hops: [state.peerId],
      relayedTo: [state.peerId],
    };

    await db.messages.add(msg);
    // Pas besoin de setMessages, useLiveQuery le fera
    p2pService.broadcast(msg);
  };

  const connectToPeer = (peerId: string): boolean => {
    return p2pService.connectToPeer(peerId);
  };

  const disconnectFromPeer = (peerId: string) => {
    p2pService.disconnectFromPeer(peerId);
  };

  const importMessage = async (msg: Message) => {
    const existing = await db.messages.get(msg.id);
    if (existing) return;

    const localPeerId = state.peerId || '';

    if (msg.ttl > 0) {
      msg.ttl -= 1;
      msg.relayCount += 1;
      msg.hops = [...(msg.hops || []), localPeerId];
      msg.relayedTo = [...(msg.relayedTo || []), localPeerId];
      msg.status = 'relayed';
    } else {
      msg.status = 'expired';
    }

    await db.messages.add(msg);
    // useLiveQuery se mettra à jour

    if (msg.status !== 'expired' && msg.ttl > 0) {
      p2pService.broadcast(msg);
    }
  };

  const refreshMessages = async () => {
    // Déclencher une relecture manuelle (utile pour déboguer)
    // useLiveQuery se met à jour automatiquement, mais on peut forcer un rechargement
    await db.messages.toArray(); // simple accès pour réveiller
  };

  return (
    <NetworkContext.Provider value={{
      state, messages, sendMessage, connectToPeer, disconnectFromPeer, importMessage, refreshMessages
    }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) throw new Error('useNetwork must be used within NetworkProvider');
  return context;
};