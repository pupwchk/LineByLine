import { useEffect, useRef, useCallback } from "react";
import type { Facility } from "@shared/schema";

interface WSMessage {
  type: "UPDATE";
  data: {
    facilities: Facility[];
    timestamp: string;
  };
}

export function useWebSocket(onUpdate: (data: WSMessage["data"]) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          if (message.type === "UPDATE") {
            onUpdate(message.data);
          }
        } catch (e) {
          console.error("Failed to parse WebSocket message", e);
        }
      };

      wsRef.current.onclose = () => {
        console.log("WebSocket disconnected, reconnecting...");
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error", error);
        wsRef.current?.close();
      };
    } catch (error) {
      console.error("Failed to connect WebSocket", error);
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    }
  }, [onUpdate]);

  useEffect(() => {
    connect();

    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return wsRef;
}
