import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { format, addMinutes, setHours, setMinutes, isToday } from "date-fns";
import { ko } from "date-fns/locale";

interface TimeSlotSelectorProps {
  selectedDate: Date;
  selectedTime: string;
  onTimeChange: (time: string) => void;
}

export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 6; hour <= 22; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
    slots.push(`${hour.toString().padStart(2, "0")}:30`);
  }
  return slots;
}

export function getCurrentTimeSlot(): string {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const roundedMinute = minute < 30 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${roundedMinute}`;
}

export function TimeSlotSelector({ selectedDate, selectedTime, onTimeChange }: TimeSlotSelectorProps) {
  const isCurrentDate = isToday(selectedDate);
  const slots = generateTimeSlots();
  
  const currentTimeSlot = getCurrentTimeSlot();
  const currentIndex = slots.indexOf(currentTimeSlot);
  
  const visibleSlots = isCurrentDate 
    ? slots.slice(Math.max(0, currentIndex - 2), Math.min(slots.length, currentIndex + 6))
    : slots.filter(slot => {
        const hour = parseInt(slot.split(":")[0]);
        return hour >= 10 && hour <= 19;
      });

  return (
    <div className="mb-4" data-testid="time-slot-selector">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {isCurrentDate ? "시간대별 예측 조회" : "예측 시간대 선택"}
        </span>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
        {visibleSlots.map((slot) => {
          const isCurrentSlot = isCurrentDate && slot === currentTimeSlot;
          const isSelected = slot === selectedTime;
          
          return (
            <Button
              key={slot}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className={`shrink-0 min-w-[60px] text-xs ${isCurrentSlot && !isSelected ? "ring-2 ring-primary ring-offset-1" : ""}`}
              onClick={() => onTimeChange(slot)}
              data-testid={`button-timeslot-${slot.replace(":", "")}`}
            >
              {slot}
              {isCurrentSlot && (
                <span className="ml-1 text-[10px] opacity-70">현재</span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
