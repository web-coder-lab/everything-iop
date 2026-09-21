// Real-time WebSocket / Socket.IO Client Manager
import { io, Socket } from 'socket.io-client';
import { WS_URL } from '../../config/constants';
import type { Message, Notification } from '../../types';

type EventHandler = (data: any) => void;

class SocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<EventHandler>> = new Map();
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;

  public connect(token?: string) {
    if (this.socket && this.socket.connected) return;

    try {
      this.socket = io(WS_URL, {
        auth: token ? { token } : {},
        withCredentials: true,
        transports: ['websocket', 'polling'],
        timeout: 8000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emitLocal('connection:status', { connected: true });
      });

      this.socket.on('disconnect', (reason) => {
        this.isConnected = false;
        this.emitLocal('connection:status', { connected: false, reason });
      });

      this.socket.on('connect_error', (error) => {
        this.isConnected = false;
        this.reconnectAttempts++;
        this.emitLocal('connection:status', { connected: false, error: error.message });
      });

      // Bind all server events
      const serverEvents = [
        'message:new',
        'message:updated',
        'message:deleted',
        'message:reaction',
        'message:read',
        'typing:start',
        'typing:stop',
        'presence:update',
        'notification:new',
        'community:announcement',
        'security:alert',
      ];

      serverEvents.forEach((ev) => {
        this.socket?.on(ev, (data) => {
          this.emitLocal(ev, data);
        });
      });
    } catch (err) {
      console.error('WebSocket connection could not be initialized:', err);
    }
  }

  public reconnect(token?: string) {
    this.disconnect();
    this.connect(token);
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  public on(event: string, handler: EventHandler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  public off(event: string, handler: EventHandler) {
    this.listeners.get(event)?.delete(handler);
  }

  public emitLocal(event: string, data: any) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((h) => {
        try {
          h(data);
        } catch (e) {
          console.error(`Error in event listener for ${event}:`, e);
        }
      });
    }
  }

  // Client to server events
  public joinConversation(conversationId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('conversation:join', { conversationId });
    }
  }

  public leaveConversation(conversationId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('conversation:leave', { conversationId });
    }
  }

  public sendTyping(conversationId: string, isTyping: boolean) {
    if (this.socket && this.isConnected) {
      this.socket.emit(isTyping ? 'message:typing:start' : 'message:typing:stop', { conversationId });
    }
  }

  public joinChannel(channelId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('channel:join', { channelId });
    }
  }

  public leaveChannel(channelId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('channel:leave', { channelId });
    }
  }

  public getStatus(): boolean {
    return this.isConnected;
  }
}

export const socketClient = new SocketClient();
