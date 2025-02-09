// import { useState, useEffect, useRef } from 'react';
// import { WSStatus } from '../types';
// import { GAME_CONSTANTS } from '../utils/constants';

// export const useWebSocket = (onMessage: (event: MessageEvent) => void) => {
//   const [status, setStatus] = useState<WSStatus>('disconnected');
//   const wsRef = useRef<WebSocket | null>(null);

//   useEffect(() => {
//     const connectWebSocket = () => {
//       if (wsRef.current?.readyState === WebSocket.OPEN) return;

//       const ws = new WebSocket(GAME_CONSTANTS.WS_URL);
//       wsRef.current = ws;

//       ws.onopen = () => setStatus('connected');
//       ws.onclose = () => setStatus('disconnected');
//       ws.onerror = () => setStatus('disconnected');
//       ws.onmessage = onMessage;
//     };

//     connectWebSocket();

//     return () => {
//       wsRef.current?.close();
//     };
//   }, [onMessage]);

//   return { status };
// };
// // src/hooks/useWebSocket.ts
// import { useState, useEffect, useRef, useCallback } from 'react';
// import { WSStatus } from '../types';
// import { GAME_CONSTANTS } from '../utils/constants';

// export const useWebSocket = () => {
//   const [status, setStatus] = useState<WSStatus>('disconnected');
//   const wsRef = useRef<WebSocket | null>(null);
//   const messageHandlersRef = useRef<((event: MessageEvent) => void)[]>([]);

//   const addMessageHandler = useCallback((handler: (event: MessageEvent) => void) => {
//     messageHandlersRef.current.push(handler);
//   }, []);

//   const removeMessageHandler = useCallback((handler: (event: MessageEvent) => void) => {
//     messageHandlersRef.current = messageHandlersRef.current.filter(h => h !== handler);
//   }, []);

//   useEffect(() => {
//     const handleMessage = (event: MessageEvent) => {
//       messageHandlersRef.current.forEach(handler => handler(event));
//     };

//     const connectWebSocket = () => {
//       if (wsRef.current?.readyState === WebSocket.OPEN) {
//         console.log('WebSocket already connected');
//         return;
//       }

//       console.log('Establishing new WebSocket connection');
//       const ws = new WebSocket(GAME_CONSTANTS.WS_URL);
//       wsRef.current = ws;

//       ws.onopen = () => {
//         console.log('WebSocket Connected');
//         setStatus('connected');
//       };

//       ws.onclose = () => {
//         console.log('WebSocket Disconnected');
//         setStatus('disconnected');
//       };

//       ws.onerror = (error) => {
//         console.error('WebSocket Error:', error);
//         setStatus('disconnected');
//       };

//       ws.onmessage = handleMessage;
//     };

//     connectWebSocket();

//     return () => {
//       if (wsRef.current) {
//         wsRef.current.close();
//         wsRef.current = null;
//       }
//     };
//   }, []); // Empty dependency array ensures single connection

//   return {
//     status,
//     addMessageHandler,
//     removeMessageHandler
//   };
// };

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