import { MapPin, Clock, ChevronRight, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CongestionCard } from "./CongestionCard";
import { getFacilityLabel } from "@/lib/mock-data";
import type { Facility, Corner } from "@shared/schema";

interface FacilitySectionProps {
  facility: Facility;
  onRegister: (corner: Corner, facility: Facility) => void;
  onViewDetail: (facility: Facility) => void;
  hasActiveWaiting: boolean;
  isFutureDate?: boolean;
  isPrediction?: boolean;
}

export function FacilitySection({ 
  facility, 
  onRegister, 
  onViewDetail, 
  hasActiveWaiting,
  isFutureDate = false,
  isPrediction = false,
}: FacilitySectionProps) {
  return (
    <section className="mb-6" data-testid={`section-facility-${facility.id}`}>
      <div
        role="button"
        tabIndex={0}
        className="w-full flex items-center justify-between mb-3 py-2 cursor-pointer hover-elevate active-elevate-2 rounded-md -mx-2 px-2"
        onClick={() => onViewDetail(facility)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onViewDetail(facility); }}
        data-testid={`button-view-facility-${facility.id}`}
      >
        <div className="flex items-center gap-2 flex-wrap text-left">
          <h2 className="font-bold text-lg">{facility.name}</h2>
          <Badge variant="secondary" className="text-xs">
            {getFacilityLabel(facility.type)}
          </Badge>
          {isPrediction && (
            <Badge variant="outline" className="text-xs gap-1">
              <TrendingUp className="w-3 h-3" />
              예측
            </Badge>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
      </div>

      <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate max-w-[150px]">{facility.location.address}</span>
        </div>
        <span className="text-border">|</span>
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>운영중</span>
        </div>
      </div>

      <div className="space-y-3">
        {facility.corners.map((corner) => (
          <CongestionCard
            key={corner.id}
            corner={corner}
            facility={facility}
            onRegister={onRegister}
            disabled={hasActiveWaiting || isFutureDate}
            isFutureDate={isFutureDate}
            isPrediction={isPrediction}
          />
        ))}
      </div>
    </section>
  );
}
