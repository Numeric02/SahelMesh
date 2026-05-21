import Peer, { DataConnection } from 'peerjs';
import { db, Message, PRIORITY_WEIGHT } from '../lib/db';
import { P2PMessage, NetworkState } from '../lib/types';

class P2PService {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private onStateChangeCallbacks: ((state: NetworkState) => void)[] = [];
  private onMessageCallbacks: ((msg: Message) => void)[] = [];

  private state: NetworkState = {
    peerId: null,
    connected: false,
    activePeers: 0,
    lastError: null,
    connectedPeerIds: [],
  };

  init() {
    if (this.peer) return;
    this.createPeer();
  }

  private createPeer(attemptId?: string) {
    const peerId = attemptId || `sahelmesh-${crypto.randomUUID().slice(0, 8)}`;
    this.peer = new Peer(peerId);
    this.setupPeerEvents();
  }

  private setupPeerEvents() {
    if (!this.peer) return;

    this.peer.on('open', (id) => {
      this.updateState({ peerId: id, connected: true, lastError: null });
      console.log('Peer JS open - ID:', id);
    });

    this.peer.on('connection', (conn) => {
      console.log('Incoming connection from', conn.peer);
      this.handleConnection(conn);
    });

    this.peer.on('error', (err) => {
      console.error('Peer error:', err);
      if (err.message && err.message.includes('is taken')) {
        console.warn('ID taken, retrying...');
        const oldPeer = this.peer;
        this.peer = null;
        if (oldPeer) oldPeer.destroy();
        this.createPeer();
      } else {
        this.updateState({ lastError: err.message, connected: false });
      }
    });

    this.peer.on('disconnected', () => {
      this.updateState({ connected: false });
      this.peer?.reconnect();
    });

    this.peer.on('close', () => {
      this.updateState({ connected: false });
    });
  }

  private handleConnection(conn: DataConnection) {
    conn.on('open', () => {
      console.log('Connection open with', conn.peer);
      this.connections.set(conn.peer, conn);
      this.updateConnectedPeers();
      this.relayUnsentMessages(conn);
      this.syncWithPeer(conn);
    });

    conn.on('data', (data: unknown) => {
      console.log('Data received from', conn.peer, data);
      try {
        const p2pMsg = data as P2PMessage;
        this.processIncomingData(p2pMsg, conn);
      } catch (err) {
        console.error('Failed to process incoming data:', err);
      }
    });

    conn.on('close', () => {
      console.log('Connection closed with', conn.peer);
      this.connections.delete(conn.peer);
      this.updateConnectedPeers();
    });

    conn.on('error', (err) => {
      console.error('Connection error with', conn.peer, err);
      this.connections.delete(conn.peer);
      this.updateConnectedPeers();
    });
  }

  private updateConnectedPeers() {
    const ids = Array.from(this.connections.keys());
    this.updateState({
      activePeers: this.connections.size,
      connectedPeerIds: ids,
    });
  }

  private async processIncomingData(p2pMsg: P2PMessage, conn: DataConnection) {
    if (!p2pMsg.type || !p2pMsg.senderId) return;

    switch (p2pMsg.type) {
      case 'MSG': {
        const msg = p2pMsg.payload as Message;
        if (msg && msg.id && msg.text) {
          console.log('Processing MSG', msg);
          await this.handleIncomingMessage(msg, conn.peer);
        }
        break;
      }
      case 'SYNC_REQ': {
        console.log('Sync request from', conn.peer);
        await this.handleSyncRequest(conn);
        break;
      }
      case 'SYNC_RES': {
        const messages = p2pMsg.payload as Message[];
        if (Array.isArray(messages)) {
          console.log(`Sync response: ${messages.length} messages`);
          for (const m of messages) {
            if (m && m.id && m.text) {
              await this.handleIncomingMessage(m, conn.peer);
            }
          }
        }
        break;
      }
    }
  }

  private async handleIncomingMessage(msg: Message, fromPeerId: string) {
    const existing = await db.messages.get(msg.id);
    if (existing) {
      const mergedRelayed = new Set([...(existing.relayedTo || []), ...(msg.relayedTo || []), fromPeerId]);
      await db.messages.update(msg.id, { relayedTo: Array.from(mergedRelayed) });
      return;
    }

    const localPeerId = this.state.peerId || '';

    msg.ttl -= 1;
    msg.relayCount += 1;
    msg.hops = [...(msg.hops || []), localPeerId];
    msg.relayedTo = [...(msg.relayedTo || []), fromPeerId, localPeerId];

    if (msg.ttl <= 0) {
      msg.status = 'expired';
    } else {
      msg.status = 'relayed';
    }

    await db.messages.add(msg);
    console.log('Message stored locally', msg.id);
    this.onMessageCallbacks.forEach(cb => cb(msg));

    if (msg.ttl > 0) {
      this.broadcast(msg);
    }
  }

  private async relayUnsentMessages(conn: DataConnection) {
    const allMessages = await db.messages.toArray();
    const peerId = conn.peer;

    const unsent = allMessages.filter(
      (m) => m.ttl > 0 && !(m.relayedTo || []).includes(peerId)
    );

    unsent.sort((a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]);

    for (const msg of unsent) {
      const p2pMsg: P2PMessage = {
        type: 'MSG',
        payload: msg,
        senderId: this.state.peerId || '',
      };
      conn.send(p2pMsg);
      console.log('Relayed unsent message', msg.id, 'to', peerId);

      const updatedRelayed = [...(msg.relayedTo || []), peerId];
      await db.messages.update(msg.id, { relayedTo: updatedRelayed });
    }
  }

  private async handleSyncRequest(conn: DataConnection) {
    const messages = await db.messages.toArray();
    const p2pMsg: P2PMessage = {
      type: 'SYNC_RES',
      payload: messages,
      senderId: this.state.peerId || '',
    };
    conn.send(p2pMsg);
    console.log('Sent sync response to', conn.peer);
  }

  private syncWithPeer(conn: DataConnection) {
    const p2pMsg: P2PMessage = {
      type: 'SYNC_REQ',
      payload: null,
      senderId: this.state.peerId || '',
    };
    conn.send(p2pMsg);
    console.log('Sent sync request to', conn.peer);
  }

  connectToPeer(remotePeerId: string): boolean {
    if (!this.peer) return false;
    if (this.connections.has(remotePeerId)) return false;
    if (remotePeerId === this.state.peerId) return false;

    try {
      const conn = this.peer.connect(remotePeerId, { reliable: true });
      this.handleConnection(conn);
      console.log('Connecting to', remotePeerId);
      return true;
    } catch (err) {
      console.error('Failed to connect to peer:', err);
      return false;
    }
  }

  disconnectFromPeer(peerId: string) {
    const conn = this.connections.get(peerId);
    if (conn) {
      conn.close();
      this.connections.delete(peerId);
      this.updateConnectedPeers();
    }
  }

  broadcast(msg: Message) {
    if (!this.state.peerId) return;
    if (msg.ttl <= 0) return;

    const p2pMsg: P2PMessage = {
      type: 'MSG',
      payload: msg,
      senderId: this.state.peerId,
    };

    console.log(`Broadcasting message ${msg.id} to ${this.connections.size} peers`);
    this.connections.forEach((conn, peerId) => {
      if (
        msg.senderId !== peerId &&
        !(msg.relayedTo || []).includes(peerId) &&
        !msg.hops.includes(peerId)
      ) {
        conn.send(p2pMsg);
        console.log(`Sent to ${peerId}`);
        msg.relayedTo = [...(msg.relayedTo || []), peerId];
      }
    });

    db.messages.update(msg.id, { relayedTo: msg.relayedTo });
  }

  private updateState(partial: Partial<NetworkState>) {
    this.state = { ...this.state, ...partial };
    this.onStateChangeCallbacks.forEach(cb => cb(this.state));
  }

  onStateChange(cb: (state: NetworkState) => void) {
    this.onStateChangeCallbacks.push(cb);
    cb(this.state);
    return () => {
      this.onStateChangeCallbacks = this.onStateChangeCallbacks.filter(c => c !== cb);
    };
  }

  onMessage(cb: (msg: Message) => void) {
    this.onMessageCallbacks.push(cb);
    return () => {
      this.onMessageCallbacks = this.onMessageCallbacks.filter(c => c !== cb);
    };
  }

  getState() { return this.state; }
  getConnections() { return Array.from(this.connections.keys()); }
}

export const p2pService = new P2PService();