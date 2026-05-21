import Dexie, { Table } from 'dexie';

export type MessagePriority = 'normal' | 'urgent' | 'help' | 'medical' | 'danger';

export const PRIORITY_WEIGHT: Record<MessagePriority, number> = {
  danger: 5,
  medical: 4,
  help: 3,
  urgent: 2,
  normal: 1,
};

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: number;
  ttl: number;
  priority: MessagePriority;
  status: 'pending' | 'delivered' | 'relayed' | 'expired';
  relayCount: number;
  hops: string[];
  relayedTo: string[];
}

export interface PeerInfo {
  id: string;
  lastSeen: number;
  status: 'online' | 'offline';
}

export class SahelMeshDatabase extends Dexie {
  messages!: Table<Message>;
  peers!: Table<PeerInfo>;

  constructor() {
    super('SahelMeshDB');
    this.version(1).stores({
      messages: 'id, timestamp, priority, status',
      peers: 'id, lastSeen, status'
    });
  }
}

export const db = new SahelMeshDatabase();