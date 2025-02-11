import { useState, useEffect, useRef, useCallback } from 'react';
import { WSStatus } from '../types';
import { GAME_CONSTANTS } from '../utils/constants';

export const useWebSocket = () => {
  const [status, setStatus] = useState<WSStatus>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const messageHandlersRef = useRef<((event: MessageEvent) => void)[]>([]);
  const reconnectAttemptRef = useRef(false);

  const addMessageHandler = useCallback((handler: (event: MessageEvent) => void) => {
    messageHandlersRef.current.push(handler);
  }, []);

  const removeMessageHandler = useCallback((handler: (event: MessageEvent) => void) => {
    messageHandlersRef.current = messageHandlersRef.current.filter(h => h !== handler);
  }, []);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    console.log('Establishing new WebSocket connection');
    setStatus('connecting');
    
    const ws = new WebSocket(GAME_CONSTANTS.WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setStatus('connected');
      reconnectAttemptRef.current = false;
      wsRef.current?.send('CONNECT_REQUEST'); // Send initial connection request
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
      setStatus('disconnected');
      
      if (!reconnectAttemptRef.current) {
        console.log('Attempting to reconnect...');
        reconnectAttemptRef.current = true;
        setTimeout(connectWebSocket, 2000);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setStatus('disconnected');
    };

    ws.onmessage = (event) => {
      const message = event.data;
      console.log('Message from ESP32:', message);
      messageHandlersRef.current.forEach(handler => handler(event));
      if (message === '#') {
        console.log('Connection acknowledged, sending *');
        wsRef.current?.send('*'); // Trigger input scene
      } else if (message.startsWith('KEY_PRESSED: ')) {
        
      }
    };
  }, []);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connectWebSocket]);

  return {
    status,
    addMessageHandler,
    removeMessageHandler
  };
};