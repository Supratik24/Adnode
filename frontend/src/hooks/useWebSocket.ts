'use client';

import { useEffect, useRef, useState } from 'react';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws';

export function useWebSocket(markets?: string[]) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const marketsRef = useRef<string[]>(markets || []);
  const reconnectAttemptsRef = useRef(0);
  const isMountedRef = useRef(true);

  // Update markets ref when it changes (without reconnecting)
  useEffect(() => {
    if (markets) {
      marketsRef.current = markets;
      // If connected, update subscription without reconnecting
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify({
            type: 'subscribe',
            markets: markets
          }));
        } catch (error) {
          console.error('Error updating subscription:', error);
        }
      }
    }
  }, [markets]);

  useEffect(() => {
    isMountedRef.current = true;
    let reconnectDelay = 1000; // Start with 1 second

    const connect = () => {
      // Don't create new connection if one already exists and is open/connecting
      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.CONNECTING || 
            wsRef.current.readyState === WebSocket.OPEN) {
          return;
        }
        // Clean up old connection
        wsRef.current.close();
        wsRef.current = null;
      }

      // Clear any pending reconnection
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      try {
        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          if (!isMountedRef.current) {
            ws.close();
            return;
          }
          console.log('WebSocket connected');
          setIsConnected(true);
          reconnectAttemptsRef.current = 0;
          reconnectDelay = 1000; // Reset delay on successful connection
          
          // Subscribe to markets if provided
          if (marketsRef.current.length > 0) {
            try {
              ws.send(JSON.stringify({
                type: 'subscribe',
                markets: marketsRef.current
              }));
            } catch (error) {
              console.error('Error subscribing to markets:', error);
            }
          }
        };

        ws.onmessage = (event) => {
          if (!isMountedRef.current) return;
          try {
            const data = JSON.parse(event.data);
            setLastMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onclose = (event) => {
          if (!isMountedRef.current) return;
          
          console.log('WebSocket disconnected', event.code);
          setIsConnected(false);
          
          // Only reconnect if it wasn't a clean close and component is still mounted
          if (isMountedRef.current && event.code !== 1000) {
            reconnectAttemptsRef.current++;
            // Exponential backoff with max delay of 10 seconds
            reconnectDelay = Math.min(reconnectDelay * 1.5, 10000);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              if (isMountedRef.current) {
                console.log(`Attempting to reconnect WebSocket (attempt ${reconnectAttemptsRef.current})...`);
                connect();
              }
            }, reconnectDelay);
          }
        };

        wsRef.current = ws;
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        setIsConnected(false);
        
        // Retry connection after delay
        if (isMountedRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              connect();
            }
          }, reconnectDelay);
        }
      }
    };

    // Initial connection
    connect();

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
        wsRef.current = null;
      }
    };
  }, []); // Empty deps - only connect once on mount

  return { isConnected, lastMessage };
}
