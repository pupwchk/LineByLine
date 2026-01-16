import { useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WaitingProvider, useWaiting } from "@/context/WaitingContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { DateHeader } from "@/components/DateHeader";
import { BottomNav } from "@/components/BottomNav";
import { HomePage } from "@/pages/HomePage";
import { WaitingPage } from "@/pages/WaitingPage";
import { MyPage } from "@/pages/MyPage";
import { FacilityDetailPage } from "@/pages/FacilityDetailPage";

type NavItem = "home" | "waiting" | "mypage";

function AppContent() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [location, setLocation] = useLocation();
  const { activeWaiting } = useWaiting();

  const getActiveNav = (): NavItem => {
    if (location === "/waiting") return "waiting";
    if (location === "/mypage") return "mypage";
    return "home";
  };

  const handleNavChange = (nav: NavItem) => {
    switch (nav) {
      case "home":
        setLocation("/");
        break;
      case "waiting":
        setLocation("/waiting");
        break;
      case "mypage":
        setLocation("/mypage");
        break;
    }
  };

  const handleNavigateToWaiting = () => {
    setLocation("/waiting");
  };

  const handleNavigateToDetail = (facilityId: string) => {
    setLocation(`/facility/${facilityId}`);
  };

  const isFacilityDetail = location.startsWith("/facility/");

  return (
    <div className="min-h-screen bg-background">
      {!isFacilityDetail && (
        <DateHeader date={currentDate} onDateChange={setCurrentDate} />
      )}
      
      <main className={isFacilityDetail ? "" : "min-h-[calc(100vh-64px-64px)]"}>
        <Switch>
          <Route path="/">
            <HomePage
              onNavigateToWaiting={handleNavigateToWaiting}
              onNavigateToDetail={(facility) => handleNavigateToDetail(facility.id)}
            />
          </Route>
          <Route path="/waiting">
            <WaitingPage />
          </Route>
          <Route path="/mypage">
            <MyPage />
          </Route>
          <Route path="/facility/:id">
            {(params) => (
              <FacilityDetailPage
                facilityId={params.id}
                onBack={() => setLocation("/")}
              />
            )}
          </Route>
          <Route>
            <HomePage
              onNavigateToWaiting={handleNavigateToWaiting}
              onNavigateToDetail={(facility) => handleNavigateToDetail(facility.id)}
            />
          </Route>
        </Switch>
      </main>

      <BottomNav
        active={getActiveNav()}
        onChange={handleNavChange}
        hasActiveWaiting={!!activeWaiting}
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <WaitingProvider>
            <AppContent />
          </WaitingProvider>
        </ThemeProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
