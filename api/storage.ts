export interface Corner {
  id: string;
  name: string;
  type: string;
  menu?: string;
  price?: number;
  congestion: number;
  waitTime: number;
  currentQueue: number;
  available?: number;
  capacity?: number;
  operatingHours?: string;
}

export interface Facility {
  id: string;
  name: string;
  type: "CAFETERIA" | "LIBRARY" | "GYM" | "CONVENIENCE";
  location: {
    lat: number;
    lng: number;
    radius: number;
    address: string;
    building: string;
  };
  capacity: number;
  avgServiceTime: number;
  avgCongestion: number;
  corners: Corner[];
}

export interface Waiting {
  id: string;
  facilityId: string;
  facilityName: string;
  cornerId: string;
  cornerName: string;
  cornerType: string;
  menu?: string;
  waitingNumber: number;
  status: "WAITING" | "CALLED" | "COMPLETED" | "CANCELLED";
  registeredAt: string;
  estimatedTime: number;
  waitingAhead: number;
  currentCalling: number;
}

export interface InsertWaiting {
  facilityId: string;
  facilityName: string;
  cornerId: string;
  cornerName: string;
  cornerType: string;
  menu?: string;
}

export interface HistoryItem {
  id: string;
  facility: string;
  date: string;
  status: "COMPLETED" | "CANCELLED";
  statusText: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderId: string;
  orderNumber: number;
  facilityId: string;
  facilityName: string;
  facilityLocation: {
    lat: number;
    lng: number;
  };
  cornerId: string;
  cornerType: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  status: "PENDING" | "PAID" | "QR_ACTIVE" | "QR_EXPIRED" | "COMPLETED" | "CANCELLED";
  qrCode: string | null;
  qrActivatedAt: string | null;
  qrExpiresAt: string | null;
  pickupType: string;
  pickupTime: string;
  createdAt: string;
  paidAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
}

export interface InsertOrder {
  facilityId: string;
  facilityName: string;
  facilityLocation: {
    lat: number;
    lng: number;
  };
  cornerId: string;
  cornerType: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  pickupType: string;
  pickupTime: string;
}

const mockFacilities: Facility[] = [
  {
    id: "hanyang_plaza",
    name: "학생복지관 (한양플라자)",
    type: "CAFETERIA",
    location: {
      lat: 37.5575,
      lng: 127.0469,
      radius: 50,
      address: "한양대학교 학생복지관(한양플라자) 3층",
      building: "105",
    },
    capacity: 300,
    avgServiceTime: 3,
    avgCongestion: 3,
    corners: [
      {
        id: "hp_korean",
        name: "한식코너",
        type: "한식",
        menu: "된장찌개 + 제육볶음",
        price: 5500,
        congestion: 4,
        waitTime: 12,
        currentQueue: 8,
      },
      {
        id: "hp_western",
        name: "양식코너",
        type: "양식",
        menu: "치킨커틀렛 + 샐러드",
        price: 6000,
        congestion: 2,
        waitTime: 5,
        currentQueue: 3,
      },
      {
        id: "hp_noodle",
        name: "면류코너",
        type: "면류",
        menu: "짜장면",
        price: 4500,
        congestion: 3,
        waitTime: 8,
        currentQueue: 5,
      },
    ],
  },
  {
    id: "dormitory_cafeteria",
    name: "기숙사 식당",
    type: "CAFETERIA",
    location: {
      lat: 37.558,
      lng: 127.045,
      radius: 50,
      address: "한양대학교 기숙사 1층",
      building: "기숙사",
    },
    capacity: 200,
    avgServiceTime: 4,
    avgCongestion: 2,
    corners: [
      {
        id: "dorm_a",
        name: "A코너",
        type: "일반식",
        menu: "김치볶음밥 + 계란후라이",
        price: 4500,
        congestion: 2,
        waitTime: 6,
        currentQueue: 4,
      },
      {
        id: "dorm_b",
        name: "B코너",
        type: "특식",
        menu: "돈까스 정식",
        price: 5500,
        congestion: 3,
        waitTime: 10,
        currentQueue: 7,
      },
    ],
  },
  {
    id: "central_library",
    name: "중앙도서관",
    type: "LIBRARY",
    location: {
      lat: 37.5565,
      lng: 127.0475,
      radius: 100,
      address: "한양대학교 중앙도서관",
      building: "도서관",
    },
    capacity: 500,
    avgServiceTime: 0,
    avgCongestion: 4,
    corners: [
      {
        id: "lib_1f",
        name: "1층 열람실",
        type: "열람실",
        congestion: 4,
        waitTime: 0,
        currentQueue: 0,
        available: 20,
        capacity: 120,
      },
      {
        id: "lib_2f",
        name: "2층 자유석",
        type: "자유석",
        congestion: 5,
        waitTime: 0,
        currentQueue: 0,
        available: 5,
        capacity: 150,
      },
      {
        id: "lib_3f",
        name: "3층 노트북실",
        type: "노트북실",
        congestion: 3,
        waitTime: 0,
        currentQueue: 0,
        available: 35,
        capacity: 80,
      },
    ],
  },
  {
    id: "fitness_center",
    name: "체육관 헬스장",
    type: "GYM",
    location: {
      lat: 37.557,
      lng: 127.0455,
      radius: 50,
      address: "한양대학교 체육관 지하 1층",
      building: "체육관",
    },
    capacity: 80,
    avgServiceTime: 0,
    avgCongestion: 3,
    corners: [
      {
        id: "gym_main",
        name: "메인 헬스장",
        type: "헬스",
        congestion: 3,
        waitTime: 0,
        currentQueue: 0,
        available: 25,
        capacity: 60,
        operatingHours: "06:00-22:00",
      },
    ],
  },
];

let waitingCounter = 100;
let orderCounter = 1000;

const waitings = new Map<string, Waiting>();
const history = new Map<string, HistoryItem[]>();
const orders = new Map<string, Order[]>();
const allOrders = new Map<string, Order>();
let facilities = JSON.parse(JSON.stringify(mockFacilities)) as Facility[];

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const storage = {
  getFacilities(): Facility[] {
    return facilities;
  },

  getFacility(id: string): Facility | undefined {
    return facilities.find((f) => f.id === id);
  },

  getActiveWaiting(sessionId: string): Waiting | null {
    return waitings.get(sessionId) || null;
  },

  createWaiting(sessionId: string, data: InsertWaiting, corner: Corner): Waiting {
    waitingCounter++;
    const waiting: Waiting = {
      id: generateUUID(),
      facilityId: data.facilityId,
      facilityName: data.facilityName,
      cornerId: data.cornerId,
      cornerName: data.cornerName,
      cornerType: data.cornerType,
      menu: data.menu,
      waitingNumber: waitingCounter,
      status: "WAITING",
      registeredAt: new Date().toISOString(),
      estimatedTime: corner.waitTime,
      waitingAhead: corner.currentQueue,
      currentCalling: waitingCounter - corner.currentQueue - 1,
    };

    waitings.set(sessionId, waiting);
    return waiting;
  },

  cancelWaiting(sessionId: string): boolean {
    const waiting = waitings.get(sessionId);
    if (!waiting) return false;

    const historyItem: HistoryItem = {
      id: generateUUID(),
      facility: `${waiting.facilityName} ${waiting.cornerType}코너`,
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
      status: "CANCELLED",
      statusText: "취소됨",
    };

    const existingHistory = history.get(sessionId) || [];
    history.set(sessionId, [historyItem, ...existingHistory].slice(0, 10));
    waitings.delete(sessionId);
    return true;
  },

  getWaitingHistory(sessionId: string): HistoryItem[] {
    return history.get(sessionId) || [];
  },

  createOrder(sessionId: string, data: InsertOrder): Order {
    orderCounter++;
    const now = new Date();
    const orderId = `ORD_${now.toISOString().slice(0, 10).replace(/-/g, "")}_${String(orderCounter).padStart(6, "0")}`;
    
    const order: Order = {
      id: generateUUID(),
      orderId,
      orderNumber: orderCounter,
      facilityId: data.facilityId,
      facilityName: data.facilityName,
      facilityLocation: data.facilityLocation,
      cornerId: data.cornerId,
      cornerType: data.cornerType,
      items: data.items,
      totalAmount: data.totalAmount,
      paymentMethod: data.paymentMethod,
      status: "PAID",
      qrCode: null,
      qrActivatedAt: null,
      qrExpiresAt: null,
      pickupType: data.pickupType,
      pickupTime: data.pickupTime,
      createdAt: now.toISOString(),
      paidAt: now.toISOString(),
      completedAt: null,
      cancelledAt: null,
    };

    const existingOrders = orders.get(sessionId) || [];
    orders.set(sessionId, [order, ...existingOrders]);
    allOrders.set(order.orderId, order);
    
    return order;
  },

  getOrders(sessionId: string): Order[] {
    const userOrders = orders.get(sessionId) || [];
    return userOrders.map(order => {
      const latestOrder = allOrders.get(order.orderId);
      return latestOrder || order;
    });
  },

  getOrder(orderId: string): Order | undefined {
    return allOrders.get(orderId);
  },

  activateQR(orderId: string, userLocation: { lat: number; lng: number }): { success: boolean; order?: Order; message?: string; distance?: number } {
    const order = allOrders.get(orderId);
    if (!order) {
      return { success: false, message: "주문을 찾을 수 없습니다" };
    }

    if (order.status === "COMPLETED") {
      return { success: false, message: "이미 사용된 주문입니다" };
    }

    if (order.status === "CANCELLED") {
      return { success: false, message: "취소된 주문입니다" };
    }

    if (order.status !== "PAID" && order.status !== "QR_EXPIRED") {
      return { success: false, message: "활성화할 수 없는 상태입니다" };
    }

    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      order.facilityLocation.lat,
      order.facilityLocation.lng
    );

    if (distance > 50) {
      return { 
        success: false, 
        message: `식당에서 ${Math.round(distance)}m 떨어져 있습니다. 50m 이내로 이동해주세요.`,
        distance: Math.round(distance)
      };
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 3 * 60 * 1000);
    
    const qrPayload = {
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      facilityId: order.facilityId,
      activatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    
    const qrCode = Buffer.from(JSON.stringify(qrPayload)).toString("base64");

    const updatedOrder: Order = {
      ...order,
      status: "QR_ACTIVE",
      qrCode,
      qrActivatedAt: now.toISOString(),
      qrExpiresAt: expiresAt.toISOString(),
    };

    allOrders.set(orderId, updatedOrder);
    
    return { success: true, order: updatedOrder };
  },

  cancelOrder(orderId: string): boolean {
    const order = allOrders.get(orderId);
    if (!order) return false;
    
    if (order.status === "COMPLETED") return false;

    const updatedOrder: Order = {
      ...order,
      status: "CANCELLED",
      cancelledAt: new Date().toISOString(),
    };

    allOrders.set(orderId, updatedOrder);
    return true;
  },

  completeOrder(orderId: string): boolean {
    const order = allOrders.get(orderId);
    if (!order) return false;
    
    if (order.status !== "QR_ACTIVE") return false;

    const updatedOrder: Order = {
      ...order,
      status: "COMPLETED",
      completedAt: new Date().toISOString(),
    };

    allOrders.set(orderId, updatedOrder);
    return true;
  }
};
