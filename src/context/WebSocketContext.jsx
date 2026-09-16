import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  setGroupMembers,
  updateRemoteCursor,
  removeRemoteCursor,
  updateSeatSelection,
  triggerCheckout,
} from '../redux/slices/groupSessionSlice';

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentGroupId, setCurrentGroupId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [assignedColor, setAssignedColor] = useState('#f43f5e');
  const broadcastChannelRef = useRef(null);

  // Initialize BroadcastChannel fallback for multi-tab testing without separate WS server
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('Ciniverse_group_sync');
      broadcastChannelRef.current = bc;

      bc.onmessage = (event) => {
        const { type, payload, senderId } = event.data || {};
        if (senderId === socketRef.current?.clientId) return; // ignore own
        handleIncomingMessage({ type, payload });
      };

      return () => {
        bc.close();
      };
    }
  }, []);

  const handleIncomingMessage = useCallback((data) => {
    const { type, payload } = data;
    switch (type) {
      case 'ROOM_JOINED':
        if (payload.assignedColor) setAssignedColor(payload.assignedColor);
        if (payload.members) dispatch(setGroupMembers(payload.members));
        break;

      case 'MEMBER_JOINED':
      case 'MEMBER_LEFT':
      case 'MEMBER_READY_BROADCAST':
        if (payload.members) dispatch(setGroupMembers(payload.members));
        break;

      case 'SEAT_HOVER_BROADCAST':
        dispatch(updateRemoteCursor(payload));
        break;

      case 'SEAT_SELECT_BROADCAST':
        dispatch(updateSeatSelection(payload));
        break;

      case 'NAVIGATE_TO_CHECKOUT':
        dispatch(triggerCheckout());
        break;

      default:
        break;
    }
  }, [dispatch]);

  const connectWebSocket = useCallback((groupId, user) => {
    const defaultHost = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
    const defaultWsUrl = typeof window !== 'undefined' && window.location.protocol === 'https:'
      ? `wss://${defaultHost}:8081`
      : `ws://${defaultHost}:8081`;
    const wsUrl = import.meta.env.VITE_WS_URL || defaultWsUrl;
    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;
      ws.clientId = `client_${Math.random().toString(36).substring(2, 8)}`;

      ws.onopen = () => {
        setIsConnected(true);
        console.log('[Ciniverse WS Client] Connected to WebSocket server');
        ws.send(JSON.stringify({
          type: 'JOIN_ROOM',
          payload: { groupId, user }
        }));
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          handleIncomingMessage(parsed);
        } catch (e) {
          console.error('[Ciniverse WS Client] Parse error:', e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('[Ciniverse WS Client] Connection closed, using peer broadcast fallback');
      };

      ws.onerror = (err) => {
        console.warn('[Ciniverse WS Client] Notice: WebSocket server not reachable. Peer broadcast fallback active.');
        setIsConnected(false);
      };
    } catch (e) {
      console.warn('[Ciniverse WS Client] WebSocket initialization error:', e.message);
      setIsConnected(false);
    }
  }, [handleIncomingMessage]);

  const joinGroup = useCallback((groupId, user) => {
    setCurrentGroupId(groupId);
    setCurrentUser(user);
    connectWebSocket(groupId, user);

    // Also broadcast on BroadcastChannel for multi-tab testing
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'MEMBER_JOINED',
        payload: {
          user,
          members: [user]
        },
        senderId: socketRef.current?.clientId
      });
    }
  }, [connectWebSocket]);

  const leaveGroup = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }
    setCurrentGroupId(null);
    setCurrentUser(null);
    setIsConnected(false);
  }, []);

  const sendSeatHover = useCallback((seatId, x, y) => {
    const payload = { groupId: currentGroupId, seatId, x, y, user: currentUser };
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'SEAT_HOVER', payload }));
    } else if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'SEAT_HOVER_BROADCAST',
        payload: { ...payload, clientId: socketRef.current?.clientId || 'peer' },
        senderId: socketRef.current?.clientId
      });
    }
  }, [currentGroupId, currentUser]);

  const sendSeatSelect = useCallback((seatId, action) => {
    const payload = { groupId: currentGroupId, seatId, action, user: currentUser };
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'SEAT_SELECT', payload }));
    } else if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'SEAT_SELECT_BROADCAST',
        payload: { ...payload, clientId: socketRef.current?.clientId || 'peer' },
        senderId: socketRef.current?.clientId
      });
      // Also update locally in fallback mode
      dispatch(updateSeatSelection({ ...payload, clientId: 'local' }));
    }
  }, [currentGroupId, currentUser, dispatch]);

  const toggleReady = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'MEMBER_READY_TOGGLE',
        payload: { groupId: currentGroupId, uid: currentUser?.uid }
      }));
    }
  }, [currentGroupId, currentUser]);

  const proceedCheckout = useCallback((checkoutData) => {
    const payload = { groupId: currentGroupId, ...checkoutData };
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'PROCEED_CHECKOUT', payload }));
    } else if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'NAVIGATE_TO_CHECKOUT',
        payload,
        senderId: socketRef.current?.clientId
      });
      dispatch(triggerCheckout());
    }
  }, [currentGroupId, dispatch]);

  const value = {
    isConnected,
    currentGroupId,
    assignedColor,
    joinGroup,
    leaveGroup,
    sendSeatHover,
    sendSeatSelect,
    toggleReady,
    proceedCheckout,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};
