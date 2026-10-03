import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
  }

  connect(onConnect) {
    if (this.client && this.connected) {
      if (onConnect) onConnect();
      return;
    }

    const socket = new SockJS('http://localhost:8080/ws-collaboration');
    this.client = new Client({
      webSocketFactory: () => socket,
      debug: function (str) {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      console.log('Connected: ' + frame);
      this.connected = true;
      if (onConnect) onConnect();
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client !== null) {
      this.client.deactivate();
      this.connected = false;
      this.subscriptions.clear();
      console.log('Disconnected');
    }
  }

  subscribeToCode(roomId, callback) {
    if (!this.connected) return null;
    
    // Unsubscribe if already subscribed to this room's code
    if (this.subscriptions.has(`code_${roomId}`)) {
      this.subscriptions.get(`code_${roomId}`).unsubscribe();
    }

    const subscription = this.client.subscribe(`/topic/collab/${roomId}/code`, (message) => {
      callback(JSON.parse(message.body));
    });
    
    this.subscriptions.set(`code_${roomId}`, subscription);
    return subscription;
  }

  subscribeToChat(roomId, callback) {
    if (!this.connected) return null;
    
    if (this.subscriptions.has(`chat_${roomId}`)) {
      this.subscriptions.get(`chat_${roomId}`).unsubscribe();
    }

    const subscription = this.client.subscribe(`/topic/collab/${roomId}/chat`, (message) => {
      callback(JSON.parse(message.body));
    });
    
    this.subscriptions.set(`chat_${roomId}`, subscription);
    return subscription;
  }

  sendCodeUpdate(roomId, content, language, senderId) {
    if (this.client && this.connected) {
      this.client.publish({
        destination: `/app/collab/${roomId}/code`,
        body: JSON.stringify({ roomId, content, language, senderId }),
      });
    }
  }

  sendChatMessage(roomId, senderName, content) {
    if (this.client && this.connected) {
      this.client.publish({
        destination: `/app/collab/${roomId}/chat`,
        body: JSON.stringify({ roomId, senderName, content }),
      });
    }
  }
}

export const webSocketService = new WebSocketService();
