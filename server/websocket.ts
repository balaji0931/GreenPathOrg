import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { log } from './vite';

interface WebSocketMessage {
  type: string;
  data: any;
}

// Store active connections
const connections: Set<WebSocket> = new Set();

// Setup the WebSocket server
export function setupWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ 
    server: server, 
    path: '/ws-api' 
  });
  
  log('WebSocket server initialized on path: /ws-api', 'websocket');
  
  wss.on('connection', (ws: WebSocket) => {
    connections.add(ws);
    log('Client connected to WebSocket', 'websocket');
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      data: { message: 'Connected to GreenPath WebSocket server' }
    }));
    
    // Handle incoming messages
    ws.on('message', (message: string) => {
      try {
        const parsedMessage = JSON.parse(message.toString()) as WebSocketMessage;
        log(`Received message of type: ${parsedMessage.type}`, 'websocket');
        
        // Handle different message types
        handleMessage(ws, parsedMessage);
        
      } catch (error) {
        log(`Error parsing WebSocket message: ${error}`, 'websocket');
        ws.send(JSON.stringify({
          type: 'error',
          data: { message: 'Invalid message format' }
        }));
      }
    });
    
    // Handle disconnections
    ws.on('close', () => {
      connections.delete(ws);
      log('Client disconnected from WebSocket', 'websocket');
    });
    
    // Handle errors
    ws.on('error', (error) => {
      log(`WebSocket error: ${error}`, 'websocket');
      connections.delete(ws);
    });
  });
  
  return wss;
}

// Broadcast message to all clients
export function broadcastMessage(type: string, data: any) {
  const message = JSON.stringify({ type, data });
  
  connections.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
  
  log(`Broadcasted message of type: ${type} to ${connections.size} clients`, 'websocket');
}

// Send message to specific client
function sendToClient(client: WebSocket, type: string, data: any) {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({ type, data }));
  }
}

// Handle different message types
function handleMessage(client: WebSocket, message: WebSocketMessage) {
  const { type, data } = message;
  
  switch (type) {
    case 'ping':
      sendToClient(client, 'pong', { timestamp: new Date().toISOString() });
      break;
      
    case 'subscribe':
      // Handle subscription to specific topics/events
      if (data && data.topic) {
        log(`Client subscribed to topic: ${data.topic}`, 'websocket');
        // Here we would store the subscription information
        sendToClient(client, 'subscribed', { topic: data.topic });
      }
      break;
      
    case 'request_update':
      // Client requests the latest data for a specific resource
      if (data && data.resource) {
        log(`Client requested update for: ${data.resource}`, 'websocket');
        // The server would fetch the latest data and send it back
        sendToClient(client, 'resource_update', { 
          resource: data.resource,
          message: `Update request for ${data.resource} received`
        });
      }
      break;
      
    case 'join_event_room':
      // Client wants to join a specific event's virtual room
      if (data && data.eventId) {
        log(`Client joined event room: ${data.eventId}`, 'websocket');
        sendToClient(client, 'joined_event_room', { 
          eventId: data.eventId,
          message: `Joined event room ${data.eventId}`
        });
      }
      break;
      
    case 'user_activity':
      // Track user activity for points/badges
      if (data && data.userId && data.activity) {
        log(`User activity recorded: ${data.activity} by ${data.userId}`, 'websocket');
        sendToClient(client, 'activity_recorded', { 
          success: true,
          message: `Activity '${data.activity}' recorded`
        });
      }
      break;
      
    default:
      log(`Unhandled message type: ${type}`, 'websocket');
      break;
  }
}