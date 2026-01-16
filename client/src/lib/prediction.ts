import { isToday } from "date-fns";
import type { Corner, Facility } from "@shared/schema";

export function calculatePredictedCongestion(
  baseCongestion: number,
  timeSlot: string,
  date: Date
): number {
  const [hour, minute] = timeSlot.split(":").map(Number);
  
  let multiplier = 1;
  
  if (hour >= 12 && hour <= 12 && minute >= 0) {
    multiplier = 1.5;
  } else if (hour >= 11 && hour <= 13) {
    multiplier = 1.3;
  } else if (hour >= 17 && hour <= 19) {
    multiplier = 1.2;
  } else if (hour >= 7 && hour <= 9) {
    multiplier = 0.8;
  } else if (hour >= 14 && hour <= 16) {
    multiplier = 0.7;
  } else {
    multiplier = 0.6;
  }

  if (!isToday(date)) {
    multiplier *= 0.9 + Math.random() * 0.2;
  }

  const predicted = Math.round(baseCongestion * multiplier);
  return Math.min(5, Math.max(1, predicted));
}

export function calculatePredictedWaitTime(
  baseWaitTime: number,
  timeSlot: string,
  date: Date
): number {
  const [hour, minute] = timeSlot.split(":").map(Number);
  
  let multiplier = 1;
  
  if (hour === 12 && minute >= 0 && minute <= 30) {
    multiplier = 1.6;
  } else if (hour >= 11 && hour <= 13) {
    multiplier = 1.4;
  } else if (hour >= 17 && hour <= 19) {
    multiplier = 1.3;
  } else if (hour >= 7 && hour <= 9) {
    multiplier = 0.7;
  } else if (hour >= 14 && hour <= 16) {
    multiplier = 0.6;
  } else {
    multiplier = 0.5;
  }

  if (!isToday(date)) {
    multiplier *= 0.85 + Math.random() * 0.3;
  }

  return Math.max(1, Math.round(baseWaitTime * multiplier));
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
): Facility {
  const isTodayDate = isToday(date);
  const isPrediction = shouldShowPrediction(date, timeSlot);
  
  return {
    ...facility,
    avgCongestion: isPrediction 
      ? calculatePredictedCongestion(facility.avgCongestion, timeSlot, date)
      : facility.avgCongestion,
    corners: facility.corners.map((corner) => ({
      ...corner,
      congestion: isPrediction
        ? calculatePredictedCongestion(corner.congestion, timeSlot, date)
        : corner.congestion,
      waitTime: isPrediction
        ? calculatePredictedWaitTime(corner.waitTime || 5, timeSlot, date)
        : corner.waitTime,
      menu: !isTodayDate && corner.menu 
        ? FUTURE_DATE_MENU_PLACEHOLDER 
        : corner.menu,
    })),
  };
}
