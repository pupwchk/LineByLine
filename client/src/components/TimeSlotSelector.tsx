import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { isToday } from "date-fns";
import { useRef, useEffect, useState } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const currentTimeSlot = getCurrentTimeSlot();
  const currentIndex = slots.indexOf(currentTimeSlot);
  
  const visibleSlots = isCurrentDate 
    ? slots.slice(Math.max(0, currentIndex - 4))
    : slots;

  const updateScrollButtons = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", updateScrollButtons);
      return () => container.removeEventListener("scroll", updateScrollButtons);
    }
  }, [visibleSlots]);

  useEffect(() => {
    if (containerRef.current && isCurrentDate) {
      const selectedIndex = visibleSlots.indexOf(selectedTime);
      if (selectedIndex > 0) {
        const buttonWidth = 68;
        const scrollPosition = Math.max(0, (selectedIndex - 1) * buttonWidth);
        containerRef.current.scrollTo({ left: scrollPosition, behavior: "auto" });
      }
    }
  }, [selectedDate]);

  const scrollBy = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = 180;
      containerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="mb-4" data-testid="time-slot-selector">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {isCurrentDate ? "시간대별 예측 조회" : "예측 시간대 선택"}
        </span>
      </div>
      <div className="relative flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-8 w-8"
          onClick={() => scrollBy("left")}
          disabled={!canScrollLeft}
          data-testid="button-timeslot-prev"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div 
          ref={containerRef}
          className="flex gap-1.5 overflow-x-auto scrollbar-none flex-1 touch-pan-x"
          style={{ 
            scrollbarWidth: "none", 
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch"
          }}
        >
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

        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-8 w-8"
          onClick={() => scrollBy("right")}
          disabled={!canScrollRight}
          data-testid="button-timeslot-next"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
