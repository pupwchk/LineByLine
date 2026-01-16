import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addDays, subDays, isToday } from "date-fns";
import { ko } from "date-fns/locale";

interface DateHeaderProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export function DateHeader({ date, onDateChange }: DateHeaderProps) {
  const formattedDate = format(date, "M월 d일 (E)", { locale: ko });
  const isTodayDate = isToday(date);

  return (
    <header 
      className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border"
      data-testid="date-header"
    >
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDateChange(subDays(date, 1))}
          data-testid="button-prev-date"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-base">{formattedDate}</h1>
          {isTodayDate && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
              오늘
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDateChange(addDays(date, 1))}
          data-testid="button-next-date"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
