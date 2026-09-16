import { WebSocketServer, WebSocket } from 'ws';

const PORT = process.env.PORT || 8081;
const wss = new WebSocketServer({ port: PORT });

// Active rooms: Map<groupId, Map<clientId, { ws, user }>>
const rooms = new Map();

// Random color generator for client cursors if not provided
const CURSOR_COLORS = [
  '#f43f5e', '#06b6d4', '#8b5cf6', '#10b981', 
  '#f59e0b', '#ec4899', '#3b82f6', '#14b8a6'
];

function getRandomColor() {
  return CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
}

console.log(`[FilmZone WS] Starting WebSocket Server on port ${PORT}...`);

wss.on('connection', (ws, req) => {
  const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  let currentGroupId = null;
  let currentUser = null;

  console.log(`[FilmZone WS] Client connected: ${clientId}`);

  ws.on('message', (messageRaw) => {
    try {
      const data = JSON.parse(messageRaw.toString());
      const { type, payload } = data;

      switch (type) {
        case 'JOIN_ROOM': {
          const { groupId, user } = payload;
          currentGroupId = groupId;
          currentUser = {
            uid: user?.uid || clientId,
            displayName: user?.displayName || 'Anonymous Cinephile',
            photoURL: user?.photoURL || null,
            color: user?.color || getRandomColor(),
            clientId,
            isReady: false
          };

          if (!rooms.has(groupId)) {
            rooms.set(groupId, new Map());
          }

          const room = rooms.get(groupId);
          room.set(clientId, { ws, user: currentUser });

          console.log(`[FilmZone WS] ${currentUser.displayName} (${clientId}) joined group ${groupId}. Total: ${room.size}`);

          // Send confirmation to joining client
          ws.send(JSON.stringify({
            type: 'ROOM_JOINED',
            payload: {
              groupId,
              clientId,
              assignedColor: currentUser.color,
              members: Array.from(room.values()).map(m => m.user)
            }
          }));

          // Broadcast to everyone else in the room
          broadcastToRoom(groupId, {
            type: 'MEMBER_JOINED',
            payload: {
              user: currentUser,
              members: Array.from(room.values()).map(m => m.user)
            }
          }, clientId);
          break;
        }

        case 'SEAT_HOVER': {
          if (!currentGroupId) return;
          broadcastToRoom(currentGroupId, {
            type: 'SEAT_HOVER_BROADCAST',
            payload: {
              ...payload,
              clientId,
              user: currentUser
            }
          }, clientId);
          break;
        }

        case 'SEAT_SELECT': {
          if (!currentGroupId) return;
          broadcastToRoom(currentGroupId, {
            type: 'SEAT_SELECT_BROADCAST',
            payload: {
              ...payload,
              clientId,
              user: currentUser
            }
          });
          break;
        }

        case 'MEMBER_READY_TOGGLE': {
          if (!currentGroupId || !currentUser) return;
          currentUser.isReady = !currentUser.isReady;
          const room = rooms.get(currentGroupId);
          if (room) {
            broadcastToRoom(currentGroupId, {
              type: 'MEMBER_READY_BROADCAST',
              payload: {
                uid: currentUser.uid,
                isReady: currentUser.isReady,
                members: Array.from(room.values()).map(m => m.user)
              }
            });
          }
          break;
        }

        case 'PROCEED_CHECKOUT': {
          if (!currentGroupId) return;
          console.log(`[FilmZone WS] Group ${currentGroupId} leader triggered checkout!`);
          broadcastToRoom(currentGroupId, {
            type: 'NAVIGATE_TO_CHECKOUT',
            payload: {
              groupId: currentGroupId,
              triggeredBy: currentUser?.displayName || 'Group Leader',
              ...payload
            }
          });
          break;
        }

        case 'PING': {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
          break;
        }

        default:
          console.warn(`[FilmZone WS] Unknown message type: ${type}`);
      }
    } catch (err) {
      console.error('[FilmZone WS] Error processing message:', err.message);
    }
  });

  ws.on('close', () => {
    console.log(`[FilmZone WS] Client disconnected: ${clientId}`);
    if (currentGroupId && rooms.has(currentGroupId)) {
      const room = rooms.get(currentGroupId);
      room.delete(clientId);

      if (room.size === 0) {
        rooms.delete(currentGroupId);
        console.log(`[FilmZone WS] Room ${currentGroupId} emptied and closed`);
      } else {
        broadcastToRoom(currentGroupId, {
          type: 'MEMBER_LEFT',
          payload: {
            clientId,
            uid: currentUser?.uid,
            members: Array.from(room.values()).map(m => m.user)
          }
        });
      }
    }
  });

  ws.on('error', (err) => {
    console.error(`[FilmZone WS] Socket error (${clientId}):`, err.message);
  });
});

function broadcastToRoom(groupId, messageObj, excludeClientId = null) {
  const room = rooms.get(groupId);
  if (!room) return;

  const serialized = JSON.stringify(messageObj);
  for (const [id, member] of room.entries()) {
    if (excludeClientId && id === excludeClientId) continue;
    if (member.ws.readyState === WebSocket.OPEN) {
      member.ws.send(serialized);
    }
  }
}

console.log(`[FilmZone WS] WebSocket ready on ws://localhost:${PORT}`);
