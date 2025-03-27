import { ReactNode, createContext, useContext, useEffect, useState, useRef } from 'react';
import { useWebSocket } from './use-websocket';
import { useToast } from './use-toast';

// Create WebSocket context
type WebSocketContextType = ReturnType<typeof useWebSocket>;
const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const websocket = useWebSocket();
  const { toast } = useToast();
  const [connectionAttempted, setConnectionAttempted] = useState(false);
  const toastShownRef = useRef(false);
  
  // Connect to WebSocket when component mounts - with error handling
  useEffect(() => {
    // Only attempt to connect once
    if (connectionAttempted) return;
    
    setConnectionAttempted(true);
    
    const cleanup = websocket.connect({
      onOpen: () => {
        console.log('WebSocket connected');
        // Reset toast shown flag on successful connection
        toastShownRef.current = false;
      },
      onClose: () => {
        console.log('WebSocket disconnected');
      },
      onError: () => {
        console.error('WebSocket error occurred');
        
        // Only show toast once
        if (!toastShownRef.current) {
          toastShownRef.current = true;
          toast({
            title: 'Connection Notice',
            description: 'Real-time updates are disabled. App will still function normally.',
            variant: 'default'
          });
        }
      },
      // Disable auto-reconnect to prevent infinite errors
      reconnectAttempts: 0
    });
    
    return cleanup;
  }, [websocket, toast, connectionAttempted]);
  
  return (
    <WebSocketContext.Provider value={websocket}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Hook to use WebSocket context
export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}