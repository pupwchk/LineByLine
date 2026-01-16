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
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);
  
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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeftStart(containerRef.current.scrollLeft);
    containerRef.current.style.cursor = "grabbing";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    containerRef.current.scrollLeft = scrollLeftStart - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (containerRef.current) {
      containerRef.current.style.cursor = "grab";
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (containerRef.current) {
        containerRef.current.style.cursor = "grab";
      }
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
          className="flex gap-1.5 overflow-x-auto scrollbar-none flex-1 touch-pan-x select-none"
          style={{ 
            scrollbarWidth: "none", 
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            cursor: "grab"
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {visibleSlots.map((slot) => {
            const isCurrentSlot = isCurrentDate && slot === currentTimeSlot;
            const isSelected = slot === selectedTime;
            
            return (
              <Button
                key={slot}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className={`shrink-0 min-w-[60px] text-xs pointer-events-auto ${isCurrentSlot && !isSelected ? "ring-2 ring-primary ring-offset-1" : ""}`}
                onClick={(e) => {
                  if (!isDragging) {
                    onTimeChange(slot);
                  }
                }}
                onMouseDown={(e) => e.stopPropagation()}
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
