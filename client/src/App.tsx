import type { Order } from "@shared/schema";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import { BottomNav } from "@/components/BottomNav";
import { CartSheet } from "@/components/CartSheet";
import { DateHeader } from "@/components/DateHeader";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { useWaiting, WaitingProvider } from "@/context/WaitingContext";
import { FacilityDetailPage } from "@/pages/FacilityDetailPage";
import { HomePage } from "@/pages/HomePage";
import { MyPage } from "@/pages/MyPage";
import OrdersPage from "@/pages/OrdersPage";
import { WaitingPage } from "@/pages/WaitingPage";
import { queryClient } from "./lib/queryClient";

type NavItem = "home" | "waiting" | "orders" | "mypage";

function AppContent() {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [location, setLocation] = useLocation();
	const { activeWaiting } = useWaiting();
	const { data: ordersData } = useQuery<{ orders: Order[] }>({
		queryKey: ["/api/orders"],
	});

	const activeOrdersCount =
		ordersData?.orders?.filter(
			(o) => o.status === "PAID" || o.status === "QR_ACTIVE" || o.status === "QR_EXPIRED",
		).length || 0;

	const getActiveNav = (): NavItem => {
		if (location === "/waiting") return "waiting";
		if (location === "/orders") return "orders";
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
			case "orders":
				setLocation("/orders");
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
			{!isFacilityDetail && <DateHeader date={currentDate} onDateChange={setCurrentDate} />}

			<main className={isFacilityDetail ? "" : "min-h-[calc(100vh-64px-64px)]"}>
				<Switch>
					<Route path="/">
						<HomePage
							selectedDate={currentDate}
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
					<Route path="/orders">
						<OrdersPage />
					</Route>
					<Route path="/facility/:id">
						{(params) => <FacilityDetailPage facilityId={params.id} />}
					</Route>
					<Route>
						<HomePage
							selectedDate={currentDate}
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
				hasActiveOrders={activeOrdersCount > 0}
			/>

			<CartSheet />
		</div>
	);
}

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<TooltipProvider>
				<ThemeProvider>
					<CartProvider>
						<WaitingProvider>
							<AppContent />
						</WaitingProvider>
					</CartProvider>
				</ThemeProvider>
				<Toaster />
			</TooltipProvider>
		</QueryClientProvider>
	);
}

export default App;
