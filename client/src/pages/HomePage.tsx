import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FacilitySection } from "@/components/FacilitySection";
import { ActiveWaitingBanner } from "@/components/ActiveWaitingBanner";
import { RegisterModal } from "@/components/RegisterModal";
import { TimeSlotSelector, getCurrentTimeSlot } from "@/components/TimeSlotSelector";
import { useWaiting } from "@/context/WaitingContext";
import { useFacilities } from "@/hooks/useFacilities";
import { useDocumentTitle, useMetaDescription } from "@/hooks/useDocumentTitle";
import { getPredictedFacility, shouldShowPrediction, isMealTime, getMealPeriodName } from "@/lib/prediction";
import { format, isToday } from "date-fns";
import { ko } from "date-fns/locale";
import { Utensils, BookOpen, Dumbbell, Building, RefreshCw, TrendingUp } from "lucide-react";
import type { Corner, Facility } from "@shared/schema";

interface HomePageProps {
  selectedDate: Date;
  onNavigateToWaiting: () => void;
  onNavigateToDetail: (facility: Facility) => void;
}

export function HomePage({ selectedDate, onNavigateToWaiting, onNavigateToDetail }: HomePageProps) {
  useDocumentTitle("줄없냥 - 캠퍼스 실시간 혼잡도");
  useMetaDescription("대학교 교내 시설의 실시간 혼잡도를 확인하고 대기 등록을 해보세요. 식당, 도서관, 헬스장 혼잡도를 한눈에.");

  const { activeWaiting, registerWaiting, isRegistering } = useWaiting();
  const { data, isLoading, error, refetch, isFetching } = useFacilities();
  const [activeTab, setActiveTab] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCorner, setSelectedCorner] = useState<Corner | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [selectedTime, setSelectedTime] = useState(getCurrentTimeSlot());

  const isTodayDate = isToday(selectedDate);
  const isPredictionMode = shouldShowPrediction(selectedDate, selectedTime);
  const isCurrentMealTime = isMealTime(selectedTime);
  const currentMealPeriod = getMealPeriodName(selectedTime);

  const facilities = data?.facilities || [];
  const lastUpdate = data?.lastUpdate
    ? format(new Date(data.lastUpdate), "HH:mm:ss", { locale: ko })
    : format(new Date(), "HH:mm:ss", { locale: ko });

  const processedFacilities = facilities
    .map((facility) => getPredictedFacility(facility, selectedTime, selectedDate))
    .filter((f): f is Facility => f !== null);

  const filteredFacilities = activeTab === "all"
    ? processedFacilities
    : processedFacilities.filter((f) => f.type === activeTab.toUpperCase());

  const handleRegister = (corner: Corner, facility: Facility) => {
    if (activeWaiting) return;
    if (!isTodayDate) return;
    setSelectedCorner(corner);
    setSelectedFacility(facility);
    setModalOpen(true);
  };

  const handleConfirmRegistration = async () => {
    if (!selectedCorner || !selectedFacility) return;
    
    try {
      await registerWaiting({
        facilityId: selectedFacility.id,
        facilityName: selectedFacility.name,
        cornerId: selectedCorner.id,
        cornerName: selectedCorner.name,
        cornerType: selectedCorner.type,
        menu: selectedCorner.menu,
      }, selectedCorner);
      
      setModalOpen(false);
      setSelectedCorner(null);
      setSelectedFacility(null);
      onNavigateToWaiting();
    } catch (err) {
      console.error("Failed to register:", err);
    }
  };

  const tabItems = [
    { value: "all", label: "전체", icon: null },
    { value: "cafeteria", label: "식당", icon: Utensils },
    { value: "library", label: "도서관", icon: BookOpen },
    { value: "gym", label: "헬스장", icon: Dumbbell },
    { value: "etc", label: "기타", icon: Building },
  ];

  if (error) {
    return (
      <div className="pb-20" data-testid="page-home-error">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <p className="text-destructive mb-4">데이터를 불러오는데 실패했습니다</p>
            <Button
              variant="outline"
              onClick={() => refetch()}
              data-testid="button-retry"
            >
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20" data-testid="page-home">
      <div className="max-w-lg mx-auto px-4 py-4">
        {activeWaiting && isTodayDate && (
          <ActiveWaitingBanner
            waiting={activeWaiting}
            onClick={onNavigateToWaiting}
          />
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1">
            {tabItems.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-xs py-2 px-1 flex flex-col gap-0.5 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                data-testid={`tab-${tab.value}`}
              >
                {tab.icon && <tab.icon className="w-4 h-4" />}
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <TimeSlotSelector
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onTimeChange={setSelectedTime}
        />

        <div className="text-center text-xs text-muted-foreground mb-4 flex items-center justify-center gap-2 flex-wrap">
          {isPredictionMode ? (
            <>
              <Badge variant="outline" className="text-xs gap-1">
                <TrendingUp className="w-3 h-3" />
                예측
              </Badge>
              <span>{selectedTime} 기준 예측 데이터</span>
            </>
          ) : (
            <>
              <span>데이터 시각: {lastUpdate}</span>
              {isFetching ? (
                <RefreshCw className="w-3 h-3 animate-spin text-primary" />
              ) : (
                <span className="inline-flex items-center">
                  <span className="animate-pulse h-2 w-2 rounded-full bg-emerald-500 mr-1" />
                  실시간
                </span>
              )}
            </>
          )}
        </div>

        {!isTodayDate && (
          <div className="mb-4 p-3 bg-muted rounded-lg text-center" data-testid="notice-future-date">
            <p className="text-sm text-muted-foreground">
              {format(selectedDate, "M월 d일", { locale: ko })} 예측 정보입니다
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              메뉴 정보는 당일에만 표시됩니다
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredFacilities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">해당 유형의 시설이 없습니다.</p>
          </div>
        ) : (
          filteredFacilities.map((facility) => (
            <FacilitySection
              key={facility.id}
              facility={facility}
              onRegister={handleRegister}
              onViewDetail={onNavigateToDetail}
              hasActiveWaiting={!!activeWaiting}
              isFutureDate={!isTodayDate}
              isPrediction={isPredictionMode}
            />
          ))
        )}
      </div>

      <RegisterModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        corner={selectedCorner}
        facility={selectedFacility}
        onConfirm={handleConfirmRegistration}
        isLoading={isRegistering}
      />
    </div>
  );
}
