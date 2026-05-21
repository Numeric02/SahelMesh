import { Message, MessagePriority } from './db';

export interface P2PMessage {
  type: 'MSG' | 'PEER_INFO' | 'SYNC_REQ' | 'SYNC_RES';
  payload: any;
  senderId: string;
}

export interface NetworkState {
  peerId: string | null;
  connected: boolean;
  activePeers: number;
  lastError: string | null;
  connectedPeerIds: string[];
}

export const PRIORITY_COLORS: Record<MessagePriority, string> = {
  normal: 'blue',
  urgent: 'amber',
  help: 'amber',
  medical: 'red',
  danger: 'red',
};

export const PRIORITY_LEVELS: MessagePriority[] = ['normal', 'urgent', 'help', 'medical', 'danger'];

export const DEFAULT_TTL = 5;