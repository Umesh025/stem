// src/hooks/useWebSocket.ts
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
      reconnectAttemptRef.current = false; // Reset reconnect attempt flag
      wsRef.current?.send('@'); // Send "@:" upon successful connection
      // Confirm receipt with "#"
      messageHandlersRef.current.forEach(handler => handler({ data: '#' } as MessageEvent));
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
      setStatus('disconnected');
      
      // Attempt to reconnect once if this wasn't already a reconnection attempt
      if (!reconnectAttemptRef.current) {
        console.log('Attempting to reconnect...');
        reconnectAttemptRef.current = true;
        setTimeout(connectWebSocket, 2000); // Wait 2 seconds before reconnecting
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setStatus('disconnected');
    };

    ws.onmessage = (event) => {
      messageHandlersRef.current.forEach(handler => handler(event));
      wsRef.current?.send('*'); // Send "*" to the WebSocket upon receiving a message
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