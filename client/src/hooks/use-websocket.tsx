import { useState, useEffect, useRef, useCallback } from 'react';

type WebSocketStatus = 'connecting' | 'open' | 'closed' | 'error';
type MessageHandler = (data: any) => void;

interface UseWebSocketOptions {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  reconnectAttempts?: number;
}

export function useWebSocket() {
  const [status, setStatus] = useState<WebSocketStatus>('closed');
  const [lastMessage, setLastMessage] = useState<any>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const messageHandlersRef = useRef<Map<string, MessageHandler[]>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  
  const connect = useCallback((options: UseWebSocketOptions = {}) => {
    const {
      onOpen,
      onClose,
      onError,
      reconnectInterval = 3000,
      reconnectAttempts = 5
    } = options;
    
    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use the current hostname to handle both development and production environments
    const wsUrl = `${protocol}//${window.location.host}/ws-api`;
    console.log('Connecting to WebSocket at:', wsUrl);
    
    // Clean up any existing connection
    if (socketRef.current) {
      socketRef.current.close();
    }
    
    // Clear any pending reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    try {
      setStatus('connecting');
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      socket.onopen = () => {
        setStatus('open');
        reconnectAttemptsRef.current = 0;
        if (onOpen) onOpen();
      };
      
      socket.onclose = () => {
        setStatus('closed');
        if (onClose) onClose();
        
        // Attempt to reconnect
        if (reconnectAttemptsRef.current < reconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect(options);
          }, reconnectInterval);
        }
      };
      
      socket.onerror = (error) => {
        setStatus('error');
        if (onError) onError(error);
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          
          // If this message has a type, trigger any registered handlers
          if (data.type && messageHandlersRef.current.has(data.type)) {
            const handlers = messageHandlersRef.current.get(data.type);
            handlers?.forEach(handler => handler(data));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    } catch (error) {
      setStatus('error');
      console.error('WebSocket connection error:', error);
      if (onError) onError(error as Event);
    }
    
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, []);
  
  // Send a message through the WebSocket
  const sendMessage = useCallback((type: string, data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, data }));
      return true;
    }
    return false;
  }, []);
  
  // Register a handler for a specific message type
  const addMessageHandler = useCallback((type: string, handler: MessageHandler) => {
    if (!messageHandlersRef.current.has(type)) {
      messageHandlersRef.current.set(type, []);
    }
    
    messageHandlersRef.current.get(type)?.push(handler);
    
    // Return a function to remove this handler
    return () => {
      const handlers = messageHandlersRef.current.get(type);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index !== -1) {
          handlers.splice(index, 1);
        }
        
        if (handlers.length === 0) {
          messageHandlersRef.current.delete(type);
        }
      }
    };
  }, []);
  
  // Clean up WebSocket on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);
  
  return {
    connect,
    sendMessage,
    addMessageHandler,
    status,
    lastMessage,
    isConnected: status === 'open'
  };
}