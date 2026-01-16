import { isToday } from "date-fns";
import type { Corner, Facility } from "@shared/schema";

export function isMealTime(timeSlot: string): boolean {
  const [hour] = timeSlot.split(":").map(Number);
  
  const isBreakfast = hour >= 7 && hour < 9;
  const isLunch = hour >= 11 && hour < 13;
  const isDinner = hour >= 17 && hour < 19;
  
  return isBreakfast || isLunch || isDinner;
}

export function getMealPeriodName(timeSlot: string): string | null {
  const [hour] = timeSlot.split(":").map(Number);
  
  if (hour >= 7 && hour < 9) return "아침";
  if (hour >= 11 && hour < 13) return "점심";
  if (hour >= 17 && hour < 19) return "저녁";
  
  return null;
}

export function calculatePredictedCongestion(
  baseCongestion: number,
  timeSlot: string,
  date: Date
): number {
  if (!isMealTime(timeSlot)) {
    return 0;
  }
  
  const [hour, minute] = timeSlot.split(":").map(Number);
  const timeInMinutes = hour * 60 + minute;
  
  let multiplier = 1.0;
  
  const BREAKFAST_START = 7 * 60;
  const BREAKFAST_END = 9 * 60;
  
  const LUNCH_START = 11 * 60;
  const LUNCH_PEAK_START = 12 * 60;
  const LUNCH_PEAK_END = 12 * 60 + 30;
  const LUNCH_END = 13 * 60;
  
  const DINNER_START = 17 * 60;
  const DINNER_PEAK_START = 18 * 60;
  const DINNER_PEAK_END = 18 * 60 + 30;
  const DINNER_END = 19 * 60;
  
  if (timeInMinutes >= BREAKFAST_START && timeInMinutes < BREAKFAST_END) {
    multiplier = 0.8;
  } else if (timeInMinutes >= LUNCH_PEAK_START && timeInMinutes < LUNCH_PEAK_END) {
    multiplier = 1.6;
  } else if (timeInMinutes >= LUNCH_START && timeInMinutes < LUNCH_PEAK_START) {
    const progress = (timeInMinutes - LUNCH_START) / (LUNCH_PEAK_START - LUNCH_START);
    multiplier = 1.0 + progress * 0.6;
  } else if (timeInMinutes >= LUNCH_PEAK_END && timeInMinutes < LUNCH_END) {
    const progress = (timeInMinutes - LUNCH_PEAK_END) / (LUNCH_END - LUNCH_PEAK_END);
    multiplier = 1.6 - progress * 0.6;
  } else if (timeInMinutes >= DINNER_PEAK_START && timeInMinutes < DINNER_PEAK_END) {
    multiplier = 1.5;
  } else if (timeInMinutes >= DINNER_START && timeInMinutes < DINNER_PEAK_START) {
    const progress = (timeInMinutes - DINNER_START) / (DINNER_PEAK_START - DINNER_START);
    multiplier = 1.0 + progress * 0.5;
  } else if (timeInMinutes >= DINNER_PEAK_END && timeInMinutes < DINNER_END) {
    const progress = (timeInMinutes - DINNER_PEAK_END) / (DINNER_END - DINNER_PEAK_END);
    multiplier = 1.5 - progress * 0.5;
  }

  if (!isToday(date)) {
    multiplier *= 0.95 + Math.random() * 0.1;
  }

  const predicted = Math.round(baseCongestion * multiplier);
  return Math.min(5, Math.max(1, predicted));
}

export function calculateWaitTimeFromCongestion(congestion: number): number {
  if (congestion === 0) return 0;
  return congestion * 4;
}

export const FUTURE_DATE_MENU_PLACEHOLDER = "[음식메뉴] - 추후구현";

export function shouldShowPrediction(date: Date, timeSlot: string): boolean {
  if (!isToday(date)) return true;
  
  const now = new Date();
  const [hour, minute] = timeSlot.split(":").map(Number);
  const slotDate = new Date();
  slotDate.setHours(hour, minute, 0, 0);
  
  return slotDate.getTime() > now.getTime();
}

export function getPredictedFacility(
  facility: Facility,
  timeSlot: string,
  date: Date
): Facility | null {
  if (!isMealTime(timeSlot)) {
    return null;
  }
  
  const isTodayDate = isToday(date);
  const isPrediction = shouldShowPrediction(date, timeSlot);
  
  const predictedAvgCongestion = isPrediction 
    ? calculatePredictedCongestion(facility.avgCongestion, timeSlot, date)
    : facility.avgCongestion;
  
  return {
    ...facility,
    avgCongestion: predictedAvgCongestion,
    corners: facility.corners.map((corner) => {
      const predictedCongestion = isPrediction
        ? calculatePredictedCongestion(corner.congestion, timeSlot, date)
        : corner.congestion;
      
      return {
        ...corner,
        congestion: predictedCongestion,
        waitTime: calculateWaitTimeFromCongestion(predictedCongestion),
        menu: !isTodayDate && corner.menu 
          ? FUTURE_DATE_MENU_PLACEHOLDER 
          : corner.menu,
      };
    }),
  };
}
