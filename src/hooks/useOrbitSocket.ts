/**
 * Orbit WebSocket Hook
 *
 * Manages WebSocket connections to Orbit for real-time credential exchange events.
 * Used by Test Issuer, Test Verifier, and other apps that need real-time updates.
 *
 * Features:
 * - Automatic socket session registration on mount
 * - WebSocket connection management with reconnection
 * - Event handling for credential exchange events
 * - Cleanup on unmount
 */

import { useEffect, useState, useRef, useCallback } from 'react';

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:5174';

/**
 * Credential exchange event types from Orbit
 */
export type OrbitEventType =
  | 'offer_accepted'
  | 'credential_issued'
  | 'proof_received'
  | 'proof_verified'
  | 'connection_established'
  | 'error'
  | 'done';

/**
 * Event data structure (varies by event type)
 */
export interface OrbitEventData {
  offerId?: string;
  connectionId?: string;
  credentialId?: string;
  proofId?: string;
  status?: string;
  error?: string;
  [key: string]: unknown;
}

/**
 * Options for the useOrbitSocket hook
 */
interface UseOrbitSocketOptions {
  /** App identifier for logging */
  appName: string;
  /** Callback for all events */
  onEvent?: (event: OrbitEventType, data: OrbitEventData) => void;
  /** Whether to enable the socket connection */
  enabled?: boolean;
  /** Auto-reconnect on disconnect */
  autoReconnect?: boolean;
  /** Reconnect delay in ms */
  reconnectDelay?: number;
}

/**
 * Socket connection state
 */
interface SocketState {
  /** Whether the WebSocket is connected */
  connected: boolean;
  /** Session ID from Orbit */
  sessionId: string | null;
  /** WebSocket URL */
  websocketUrl: string | null;
  /** Error message if registration/connection failed */
  error: string | null;
  /** Whether registration is in progress */
  isRegistering: boolean;
}

/**
 * Hook for managing Orbit WebSocket connections
 *
 * @example
 * ```tsx
 * const { connected, sessionId, error } = useOrbitSocket({
 *   appName: 'testIssuer',
 *   onEvent: (event, data) => {
 *     if (event === 'offer_accepted') {
 *       console.log('Offer accepted:', data.offerId);
 *     }
 *   },
 * });
 * ```
 */
export function useOrbitSocket({
  appName,
  onEvent,
  enabled = true,
  autoReconnect = true,
  reconnectDelay = 3000,
}: UseOrbitSocketOptions) {
  const [state, setState] = useState<SocketState>({
    connected: false,
    sessionId: null,
    websocketUrl: null,
    error: null,
    isRegistering: false,
  });

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  /**
   * Register a socket session with the server
   */
  const registerSession = useCallback(async (): Promise<{
    socketSessionId: string;
    websocketUrl: string;
  } | null> => {
    try {
      setState((s) => ({ ...s, isRegistering: true, error: null }));

      const response = await fetch(`${API_BASE}/api/socket/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ appName }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Registration failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.socketSessionId || !data.websocketUrl) {
        throw new Error('Invalid response from socket registration');
      }

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Socket registration failed';
      if (mountedRef.current) {
        setState((s) => ({ ...s, error: message, isRegistering: false }));
      }
      return null;
    }
  }, [appName]);

  /**
   * Connect to the WebSocket
   */
  const connect = useCallback(
    (websocketUrl: string, sessionId: string) => {
      // Close existing connection if any
      if (socketRef.current) {
        socketRef.current.close();
      }

      try {
        // Append session ID as query param if not already in URL
        const url = new URL(websocketUrl);
        if (!url.searchParams.has('sessionId')) {
          url.searchParams.set('sessionId', sessionId);
        }

        const socket = new WebSocket(url.toString());

        socket.onopen = () => {
          console.log(`[${appName}] WebSocket connected`);
          if (mountedRef.current) {
            setState((s) => ({
              ...s,
              connected: true,
              sessionId,
              websocketUrl,
              isRegistering: false,
              error: null,
            }));
          }
        };

        socket.onclose = (event) => {
          console.log(`[${appName}] WebSocket closed:`, event.code, event.reason);
          if (mountedRef.current) {
            setState((s) => ({ ...s, connected: false }));

            // Auto-reconnect if enabled and not a clean close
            if (autoReconnect && event.code !== 1000) {
              reconnectTimeoutRef.current = setTimeout(() => {
                if (mountedRef.current && enabled) {
                  console.log(`[${appName}] Attempting reconnect...`);
                  initSocket();
                }
              }, reconnectDelay);
            }
          }
        };

        socket.onerror = (error) => {
          console.error(`[${appName}] WebSocket error:`, error);
          if (mountedRef.current) {
            setState((s) => ({ ...s, error: 'WebSocket connection error' }));
          }
        };

        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            const eventType = message.type || message.event;
            const eventData = message.data || message.payload || message;

            console.log(`[${appName}] Received event:`, eventType, eventData);

            if (onEventRef.current && eventType) {
              onEventRef.current(eventType as OrbitEventType, eventData);
            }
          } catch (parseError) {
            console.error(`[${appName}] Failed to parse WebSocket message:`, parseError);
          }
        };

        socketRef.current = socket;
      } catch (error) {
        console.error(`[${appName}] Failed to create WebSocket:`, error);
        if (mountedRef.current) {
          setState((s) => ({
            ...s,
            error: 'Failed to create WebSocket connection',
            isRegistering: false,
          }));
        }
      }
    },
    [appName, autoReconnect, reconnectDelay, enabled]
  );

  /**
   * Initialize socket (register + connect)
   */
  const initSocket = useCallback(async () => {
    const registration = await registerSession();
    if (registration && mountedRef.current) {
      connect(registration.websocketUrl, registration.socketSessionId);
    }
  }, [registerSession, connect]);

  /**
   * Disconnect and cleanup
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.close(1000, 'Client disconnect');
      socketRef.current = null;
    }

    setState({
      connected: false,
      sessionId: null,
      websocketUrl: null,
      error: null,
      isRegistering: false,
    });
  }, []);

  // Initialize on mount if enabled
  useEffect(() => {
    mountedRef.current = true;

    if (enabled) {
      initSocket();
    }

    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [enabled, initSocket, disconnect]);

  return {
    ...state,
    /** Manually reconnect */
    reconnect: initSocket,
    /** Manually disconnect */
    disconnect,
    /** Send a message through the WebSocket */
    send: useCallback((data: unknown) => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(data));
      } else {
        console.warn(`[${appName}] Cannot send - WebSocket not connected`);
      }
    }, [appName]),
  };
}
