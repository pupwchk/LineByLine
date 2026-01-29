import type { Facility } from "@shared/schema";
import { useCallback, useEffect, useRef } from "react";

interface WSMessage {
	type: "UPDATE";
	data: {
		facilities: Facility[];
		timestamp: string;
	};
}

function isVercelEnvironment(): boolean {
	const hostname = window.location.hostname;
	return hostname.includes("vercel.app") || hostname.includes("vercel.sh");
}

export function useWebSocket(onUpdate: (data: WSMessage["data"]) => void) {
	const wsRef = useRef<WebSocket | null>(null);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
	const reconnectAttemptsRef = useRef(0);
	const maxReconnectAttempts = 3;

	const connect = useCallback(() => {
		if (isVercelEnvironment()) {
			return;
		}

		if (wsRef.current?.readyState === WebSocket.OPEN) return;

		if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
			console.log("WebSocket: max reconnect attempts reached, using polling mode");
			return;
		}

		const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
		const wsUrl = `${protocol}//${window.location.host}/ws`;

		try {
			wsRef.current = new WebSocket(wsUrl);

			wsRef.current.onopen = () => {
				console.log("WebSocket connected");
				reconnectAttemptsRef.current = 0;
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
				reconnectAttemptsRef.current++;
				if (reconnectAttemptsRef.current < maxReconnectAttempts) {
					console.log("WebSocket disconnected, reconnecting...");
					reconnectTimeoutRef.current = setTimeout(connect, 5000);
				}
			};

			wsRef.current.onerror = () => {
				wsRef.current?.close();
			};
		} catch (_error) {
			reconnectAttemptsRef.current++;
			if (reconnectAttemptsRef.current < maxReconnectAttempts) {
				reconnectTimeoutRef.current = setTimeout(connect, 5000);
			}
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
