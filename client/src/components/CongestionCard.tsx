import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CongestionBar } from "./CongestionBar";
import { getCongestionText } from "@/lib/mock-data";
import type { Corner, Facility } from "@shared/schema";

interface CongestionCardProps {
  corner: Corner;
  facility: Facility;
  onRegister: (corner: Corner, facility: Facility) => void;
  disabled?: boolean;
}

export function CongestionCard({ corner, facility, onRegister, disabled }: CongestionCardProps) {
  const isFull = corner.congestion >= 5;
  const isLibraryOrGym = facility.type === "LIBRARY" || facility.type === "GYM";

  return (
    <Card 
      className="transition-all duration-200 hover:shadow-md cursor-pointer border-card-border"
      data-testid={`card-corner-${corner.id}`}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <Badge variant="outline" className="mb-2 text-xs">
              {corner.type}
            </Badge>
            {corner.menu ? (
              <>
                <h3 className="font-semibold text-base mb-1 line-clamp-1" data-testid={`text-menu-${corner.id}`}>
                  {corner.menu}
                </h3>
                {corner.price !== undefined && (
                  <p className="text-sm text-muted-foreground">
                    {corner.price.toLocaleString()}원
                  </p>
                )}
              </>
            ) : (
              <h3 className="font-semibold text-base" data-testid={`text-corner-name-${corner.id}`}>
                {corner.name}
              </h3>
            )}
          </div>

          <div className="flex flex-col items-end shrink-0">
            <CongestionBar level={corner.congestion} />
            <p className="text-xs mt-1.5 font-medium text-muted-foreground">
              {getCongestionText(corner.congestion)}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center gap-2">
          {isLibraryOrGym ? (
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{corner.available}</span>
              /{corner.capacity}석 이용가능
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              예상 대기: <span className="font-semibold text-foreground">{corner.waitTime}분</span>
            </p>
          )}
          
          {!isLibraryOrGym && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRegister(corner, facility);
              }}
              disabled={disabled || isFull}
              data-testid={`button-register-${corner.id}`}
            >
              {isFull ? "마감" : "대기 등록"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
