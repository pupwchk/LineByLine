import type { Server } from "node:http";
import { insertOrderSchema, insertWaitingSchema } from "@shared/schema";
import type { Express } from "express";
import { WebSocket, WebSocketServer } from "ws";
import { storage } from "./storage";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
	const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

	const clients = new Set<WebSocket>();

	wss.on("connection", (ws) => {
		clients.add(ws);

		ws.on("close", () => {
			clients.delete(ws);
		});

		ws.on("error", () => {
			clients.delete(ws);
		});
	});

	const broadcastUpdate = async () => {
		const facilities = await storage.getFacilities();
		const message = JSON.stringify({
			type: "UPDATE",
			data: { facilities, timestamp: new Date().toISOString() },
		});

		clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(message);
			}
		});
	};

	setInterval(broadcastUpdate, 30000);

	app.get("/api/facilities", async (_req, res) => {
		try {
			const facilities = await storage.getFacilities();
			res.json({
				facilities,
				lastUpdate: new Date().toISOString(),
			});
		} catch (_error) {
			res.status(500).json({ error: "Failed to fetch facilities" });
		}
	});

	app.get("/api/facilities/:id", async (req, res) => {
		try {
			const facility = await storage.getFacility(req.params.id);
			if (!facility) {
				return res.status(404).json({ error: "Facility not found" });
			}
			res.json(facility);
		} catch (_error) {
			res.status(500).json({ error: "Failed to fetch facility" });
		}
	});

	app.get("/api/waiting", async (req, res) => {
		try {
			const sessionId = req.sessionID || "guest";
			const waiting = await storage.getActiveWaiting(sessionId);
			res.json({ waiting });
		} catch (_error) {
			res.status(500).json({ error: "Failed to fetch waiting status" });
		}
	});

	app.post("/api/waiting", async (req, res) => {
		try {
			const sessionId = req.sessionID || "guest";

			const existingWaiting = await storage.getActiveWaiting(sessionId);
			if (existingWaiting) {
				return res.status(400).json({ error: "Already have an active waiting" });
			}

			const result = insertWaitingSchema.safeParse(req.body);
			if (!result.success) {
				return res
					.status(400)
					.json({ error: "Invalid request data", details: result.error.issues });
			}

			const facility = await storage.getFacility(result.data.facilityId);
			if (!facility) {
				return res.status(404).json({ error: "Facility not found" });
			}

			const corner = facility.corners.find((c) => c.id === result.data.cornerId);
			if (!corner) {
				return res.status(404).json({ error: "Corner not found" });
			}

			if (corner.congestion >= 5) {
				return res.status(400).json({ error: "This corner is currently full" });
			}

			const waiting = await storage.createWaiting(sessionId, result.data, corner);
			res.status(201).json({ waiting });
		} catch (_error) {
			res.status(500).json({ error: "Failed to create waiting" });
		}
	});

	app.delete("/api/waiting", async (req, res) => {
		try {
			const sessionId = req.sessionID || "guest";
			const success = await storage.cancelWaiting(sessionId);
			if (!success) {
				return res.status(404).json({ error: "No active waiting found" });
			}
			res.json({ success: true });
		} catch (_error) {
			res.status(500).json({ error: "Failed to cancel waiting" });
		}
	});

	app.get("/api/history", async (req, res) => {
		try {
			const sessionId = req.sessionID || "guest";
			const history = await storage.getWaitingHistory(sessionId);
			res.json({ history });
		} catch (_error) {
			res.status(500).json({ error: "Failed to fetch history" });
		}
	});

	// Order API routes
	app.post("/api/orders", async (req, res) => {
		try {
			const sessionId = req.sessionID || "guest";

			const result = insertOrderSchema.safeParse(req.body);
			if (!result.success) {
				return res
					.status(400)
					.json({ error: "Invalid request data", details: result.error.issues });
			}

			const order = await storage.createOrder(sessionId, result.data);
			res.status(201).json({ success: true, order });
		} catch (_error) {
			res.status(500).json({ error: "Failed to create order" });
		}
	});

	app.get("/api/orders", async (req, res) => {
		try {
			const sessionId = req.sessionID || "guest";
			const orders = await storage.getOrders(sessionId);
			res.json({ orders });
		} catch (_error) {
			res.status(500).json({ error: "Failed to fetch orders" });
		}
	});

	app.get("/api/orders/:orderId", async (req, res) => {
		try {
			const order = await storage.getOrder(req.params.orderId);
			if (!order) {
				return res.status(404).json({ error: "Order not found" });
			}
			res.json({ order });
		} catch (_error) {
			res.status(500).json({ error: "Failed to fetch order" });
		}
	});

	app.post("/api/orders/:orderId/activate-qr", async (req, res) => {
		try {
			const { userLocation } = req.body;

			if (
				!userLocation ||
				typeof userLocation.lat !== "number" ||
				typeof userLocation.lng !== "number"
			) {
				return res.status(400).json({ success: false, message: "위치 정보가 필요합니다" });
			}

			const result = await storage.activateQR(req.params.orderId, userLocation);

			if (!result.success) {
				return res.json(result);
			}

			res.json(result);
		} catch (_error) {
			res.status(500).json({ success: false, message: "서버 오류가 발생했습니다" });
		}
	});

	app.post("/api/orders/:orderId/cancel", async (req, res) => {
		try {
			const success = await storage.cancelOrder(req.params.orderId);
			if (!success) {
				return res.status(400).json({ success: false, message: "주문을 취소할 수 없습니다" });
			}
			res.json({ success: true, message: "주문이 취소되었습니다" });
		} catch (_error) {
			res.status(500).json({ success: false, message: "서버 오류가 발생했습니다" });
		}
	});

	app.post("/api/orders/:orderId/complete", async (req, res) => {
		try {
			const success = await storage.completeOrder(req.params.orderId);
			if (!success) {
				return res.status(400).json({ success: false, message: "주문을 완료할 수 없습니다" });
			}
			res.json({ success: true, message: "주문이 완료되었습니다" });
		} catch (_error) {
			res.status(500).json({ success: false, message: "서버 오류가 발생했습니다" });
		}
	});

	return httpServer;
}
