import type { Facility, HourlyData, HistoryItem, Waiting } from "@shared/schema";

export const facilities: Facility[] = [
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
      lat: 37.5580,
      lng: 127.0450,
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
      lat: 37.5570,
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

export const generateHourlyData = (): HourlyData[] => {
  const hours = ["9시", "10시", "11시", "12시", "13시", "14시", "15시", "16시", "17시", "18시"];
  const basePattern = [1, 2, 3, 5, 4, 3, 2, 3, 4, 3];
  
  return hours.map((hour, index) => ({
    hour,
    congestion: Math.min(5, Math.max(1, basePattern[index] + Math.floor(Math.random() * 2) - 1)),
  }));
};

export const mockHistory: HistoryItem[] = [
  {
    id: "h1",
    facility: "학생복지관 한식코너",
    date: "2026-01-15 12:30",
    status: "COMPLETED",
    statusText: "이용 완료",
  },
  {
    id: "h2",
    facility: "기숙사 식당 A코너",
    date: "2026-01-14 18:00",
    status: "COMPLETED",
    statusText: "이용 완료",
  },
  {
    id: "h3",
    facility: "학생복지관 양식코너",
    date: "2026-01-13 12:15",
    status: "CANCELLED",
    statusText: "취소됨",
  },
];

export const getCongestionColor = (level: number): string => {
  const colors: Record<number, string> = {
    1: "bg-emerald-500",
    2: "bg-lime-500",
    3: "bg-yellow-500",
    4: "bg-orange-500",
    5: "bg-red-500",
  };
  return colors[level] || "bg-gray-300";
};

export const getCongestionText = (level: number): string => {
  const texts: Record<number, string> = {
    1: "여유",
    2: "보통",
    3: "약간 혼잡",
    4: "혼잡",
    5: "매우 혼잡",
  };
  return texts[level] || "알 수 없음";
};

export const getFacilityIcon = (type: string): string => {
  const icons: Record<string, string> = {
    CAFETERIA: "Utensils",
    LIBRARY: "BookOpen",
    GYM: "Dumbbell",
    ETC: "Building",
  };
  return icons[type] || "Building";
};

export const getFacilityLabel = (type: string): string => {
  const labels: Record<string, string> = {
    CAFETERIA: "식당",
    LIBRARY: "도서관",
    GYM: "헬스장",
    ETC: "기타",
  };
  return labels[type] || "기타";
};
