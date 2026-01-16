import type { Facility, Waiting, InsertWaiting, HistoryItem, Corner } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getFacilities(): Promise<Facility[]>;
  getFacility(id: string): Promise<Facility | undefined>;
  getActiveWaiting(sessionId: string): Promise<Waiting | null>;
  createWaiting(sessionId: string, data: InsertWaiting, corner: Corner): Promise<Waiting>;
  cancelWaiting(sessionId: string): Promise<boolean>;
  getWaitingHistory(sessionId: string): Promise<HistoryItem[]>;
  updateCongestion(): void;
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
      },
      {
        id: "gym_cardio",
        name: "유산소 존",
        type: "유산소",
        congestion: 2,
        waitTime: 0,
        currentQueue: 0,
        available: 12,
        capacity: 20,
      },
    ],
  },
];

let waitingCounter = 100;

export class MemStorage implements IStorage {
  private facilities: Facility[];
  private waitings: Map<string, Waiting>;
  private history: Map<string, HistoryItem[]>;

  constructor() {
    this.facilities = JSON.parse(JSON.stringify(mockFacilities));
    this.waitings = new Map();
    this.history = new Map();

    setInterval(() => this.updateCongestion(), 30000);
  }

  async getFacilities(): Promise<Facility[]> {
    return this.facilities;
  }

  async getFacility(id: string): Promise<Facility | undefined> {
    return this.facilities.find((f) => f.id === id);
  }

  async getActiveWaiting(sessionId: string): Promise<Waiting | null> {
    return this.waitings.get(sessionId) || null;
  }

  async createWaiting(sessionId: string, data: InsertWaiting, corner: Corner): Promise<Waiting> {
    waitingCounter++;
    const waiting: Waiting = {
      id: randomUUID(),
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

    this.waitings.set(sessionId, waiting);
    return waiting;
  }

  async cancelWaiting(sessionId: string): Promise<boolean> {
    const waiting = this.waitings.get(sessionId);
    if (!waiting) return false;

    const historyItem: HistoryItem = {
      id: randomUUID(),
      facility: `${waiting.facilityName} ${waiting.cornerType}코너`,
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
      status: "CANCELLED",
      statusText: "취소됨",
    };

    const existingHistory = this.history.get(sessionId) || [];
    this.history.set(sessionId, [historyItem, ...existingHistory].slice(0, 10));
    this.waitings.delete(sessionId);
    return true;
  }

  async getWaitingHistory(sessionId: string): Promise<HistoryItem[]> {
    return this.history.get(sessionId) || [];
  }

  updateCongestion(): void {
    this.facilities = this.facilities.map((facility) => ({
      ...facility,
      corners: facility.corners.map((corner) => ({
        ...corner,
        congestion: Math.min(5, Math.max(1, corner.congestion + Math.floor(Math.random() * 3) - 1)) as 1 | 2 | 3 | 4 | 5,
        waitTime: Math.max(0, corner.waitTime + Math.floor(Math.random() * 5) - 2),
        currentQueue: Math.max(0, corner.currentQueue + Math.floor(Math.random() * 3) - 1),
        available: corner.available !== undefined
          ? Math.max(0, Math.min(corner.capacity || 100, corner.available + Math.floor(Math.random() * 5) - 2))
          : undefined,
      })),
      avgCongestion: Math.min(5, Math.max(1, facility.avgCongestion + Math.floor(Math.random() * 3) - 1)) as 1 | 2 | 3 | 4 | 5,
    }));

    this.waitings.forEach((waiting, sessionId) => {
      if (waiting.waitingAhead > 0) {
        const newWaitingAhead = Math.max(0, waiting.waitingAhead - 1);
        this.waitings.set(sessionId, {
          ...waiting,
          waitingAhead: newWaitingAhead,
          estimatedTime: Math.max(0, waiting.estimatedTime - 3),
          currentCalling: waiting.currentCalling + 1,
        });
      }
    });
  }
}

export const storage = new MemStorage();
