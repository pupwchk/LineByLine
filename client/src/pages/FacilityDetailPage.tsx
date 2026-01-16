import { ChevronLeft, MapPin, Clock, Utensils, BookOpen, Dumbbell, Building, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CongestionBar } from "@/components/CongestionBar";
import { getCongestionText, generateHourlyData, getFacilityLabel } from "@/lib/mock-data";
import { fetchFacility } from "@/lib/api";
import { useDocumentTitle, useMetaDescription } from "@/hooks/useDocumentTitle";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface FacilityDetailPageProps {
  facilityId: string;
  onBack: () => void;
}

const facilityIcons: Record<string, typeof Utensils> = {
  CAFETERIA: Utensils,
  LIBRARY: BookOpen,
  GYM: Dumbbell,
  ETC: Building,
};

export function FacilityDetailPage({ facilityId, onBack }: FacilityDetailPageProps) {
  const { data: facility, isLoading, error } = useQuery({
    queryKey: ["/api/facilities", facilityId],
    queryFn: () => fetchFacility(facilityId),
  });

  useDocumentTitle(facility ? `${facility.name} - 줄없냥` : "시설 상세 - 줄없냥");
  useMetaDescription(facility ? `${facility.name}의 실시간 혼잡도와 대기 현황을 확인하세요.` : "시설 상세 정보를 확인하세요.");

  const hourlyData = generateHourlyData();

  if (isLoading) {
    return (
      <div className="pb-20" data-testid="page-facility-detail-loading">
        <div className="h-48 bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
        <div className="max-w-lg mx-auto px-4 py-4 space-y-4 -mt-6">
          <Card>
            <CardContent className="p-4">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-32 mx-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !facility) {
    return (
      <div className="pb-20" data-testid="page-facility-detail-error">
        <div className="h-48 bg-gradient-to-br from-primary to-primary/70 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 text-white"
            onClick={onBack}
            data-testid="button-back"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </div>
        <div className="max-w-lg mx-auto px-4 py-4 text-center">
          <p className="text-destructive">시설 정보를 불러올 수 없습니다</p>
          <Button variant="link" onClick={onBack} data-testid="button-go-back">
            돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const FacilityIcon = facilityIcons[facility.type] || Building;

  return (
    <div className="pb-20" data-testid="page-facility-detail">
      <div className="relative h-48 bg-gradient-to-br from-primary to-primary/70">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 text-white"
          onClick={onBack}
          data-testid="button-back"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div className="absolute inset-0 flex items-center justify-center">
          <FacilityIcon className="w-20 h-20 text-white/80" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4 -mt-6 relative">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-xl font-bold mb-1" data-testid="text-facility-name">{facility.name}</h1>
                <Badge variant="secondary">{getFacilityLabel(facility.type)}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
              <MapPin className="w-4 h-4 shrink-0" />
              <span data-testid="text-facility-address">{facility.location.address}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">현재 혼잡도</p>
            <div className="flex justify-center mb-3">
              <CongestionBar level={facility.avgCongestion} size="large" />
            </div>
            <p className="text-2xl font-bold" data-testid="text-congestion-status">{getCongestionText(facility.avgCongestion)}</p>
          </CardContent>
        </Card>

        {facility.type === "CAFETERIA" && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Utensils className="w-4 h-4" />
                오늘의 메뉴
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {facility.corners.map((corner) => (
                <div
                  key={corner.id}
                  className="flex justify-between items-center p-3 bg-muted rounded-lg"
                  data-testid={`menu-item-${corner.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <Badge variant="outline" className="mb-1 text-xs">
                      {corner.type}
                    </Badge>
                    <p className="font-semibold truncate">{corner.menu}</p>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className="font-semibold text-primary">
                      {corner.price?.toLocaleString()}원
                    </p>
                    <div className="flex items-center gap-2 mt-1 justify-end">
                      <CongestionBar level={corner.congestion} size="small" />
                      <span className="text-xs text-muted-foreground">{corner.waitTime}분</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {facility.type === "LIBRARY" && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                열람실 현황
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {facility.corners.map((corner) => (
                <div key={corner.id} className="flex justify-between items-center p-3 bg-muted rounded-lg" data-testid={`seat-item-${corner.id}`}>
                  <span className="font-medium">{corner.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">
                      <span className="font-semibold text-primary">{corner.available}</span>
                      /{corner.capacity}석
                    </span>
                    <CongestionBar level={corner.congestion} size="small" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {facility.type === "GYM" && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Dumbbell className="w-4 h-4" />
                시설 현황
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {facility.corners.map((corner) => (
                <div key={corner.id} className="flex justify-between items-center p-3 bg-muted rounded-lg" data-testid={`gym-item-${corner.id}`}>
                  <span className="font-medium">{corner.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">
                      <span className="font-semibold text-primary">{corner.available}</span>
                      /{corner.capacity}명
                    </span>
                    <CongestionBar level={corner.congestion} size="small" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">시간대별 혼잡도</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis 
                  domain={[1, 5]} 
                  ticks={[1, 2, 3, 4, 5]}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickLine={{ stroke: "hsl(var(--border))" }}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Line
                  type="monotone"
                  dataKey="congestion"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              운영시간
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">평일 중식</span>
              <span className="font-medium">11:00 - 14:30</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">평일 석식</span>
              <span className="font-medium">16:00 - 18:00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">토요일</span>
              <span className="font-medium">10:00 - 14:00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">공휴일</span>
              <span className="font-medium text-destructive">운영 없음</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
