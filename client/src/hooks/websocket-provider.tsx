import { ReactNode, createContext, useContext, useEffect } from 'react';
import { useWebSocket } from './use-websocket';
import { useToast } from './use-toast';

// Create WebSocket context
type WebSocketContextType = ReturnType<typeof useWebSocket>;
const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const websocket = useWebSocket();
  const { toast } = useToast();
  
  // Connect to WebSocket when component mounts
  useEffect(() => {
    const cleanup = websocket.connect({
      onOpen: () => {
        console.log('WebSocket connected');
      },
      onClose: () => {
        console.log('WebSocket disconnected');
      },
      onError: () => {
        console.error('WebSocket error occurred');
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to real-time updates. Some features may be limited.',
          variant: 'destructive'
        });
      }
    });
    
    return cleanup;
  }, [websocket, toast]);
  
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