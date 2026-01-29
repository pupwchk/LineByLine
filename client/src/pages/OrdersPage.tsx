import type { Order } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { AlertCircle, ChevronRight, Clock, MapPin, QrCode, Ticket } from "lucide-react";
import { useState } from "react";
import { QRModal } from "@/components/QRModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_CONFIG: Record<
	string,
	{ label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
	PAID: { label: "사용 가능", variant: "default" },
	QR_ACTIVE: { label: "QR 활성화됨", variant: "default" },
	QR_EXPIRED: { label: "QR 만료됨", variant: "secondary" },
	COMPLETED: { label: "사용 완료", variant: "outline" },
	CANCELLED: { label: "취소됨", variant: "destructive" },
};

export default function OrdersPage() {
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [showQRModal, setShowQRModal] = useState(false);

	const { data, isLoading } = useQuery<{ orders: Order[] }>({
		queryKey: ["/api/orders"],
		refetchInterval: 5000,
	});

	const orders = data?.orders || [];
	const activeOrders = orders.filter(
		(o) => o.status === "PAID" || o.status === "QR_ACTIVE" || o.status === "QR_EXPIRED",
	);
	const pastOrders = orders.filter((o) => o.status === "COMPLETED" || o.status === "CANCELLED");

	const handleActivateQR = (order: Order) => {
		setSelectedOrder(order);
		setShowQRModal(true);
	};

	if (isLoading) {
		return (
			<div className="p-4 space-y-4">
				<Skeleton className="h-8 w-32" />
				<Skeleton className="h-32 w-full" />
				<Skeleton className="h-32 w-full" />
			</div>
		);
	}

	return (
		<div className="min-h-full pb-24">
			<div className="bg-gradient-to-b from-primary/10 to-background p-4 pt-6">
				<h1 className="text-xl font-bold flex items-center gap-2" data-testid="orders-title">
					<Ticket className="h-5 w-5" />
					식권 보관함
				</h1>
				<p className="text-sm text-muted-foreground mt-1">
					구매한 식권을 확인하고 QR 코드를 활성화하세요
				</p>
			</div>

			<div className="p-4 space-y-6">
				{orders.length === 0 && (
					<Card className="p-8 text-center" data-testid="orders-empty">
						<div className="flex flex-col items-center gap-3">
							<Ticket className="h-12 w-12 text-muted-foreground" />
							<p className="text-muted-foreground">구매한 식권이 없습니다</p>
							<p className="text-sm text-muted-foreground">홈에서 메뉴를 주문해보세요</p>
						</div>
					</Card>
				)}

				{activeOrders.length > 0 && (
					<section>
						<h2 className="text-sm font-medium text-muted-foreground mb-3">
							사용 가능한 식권 ({activeOrders.length})
						</h2>
						<div className="space-y-3">
							{activeOrders.map((order) => (
								<OrderCard
									key={order.orderId}
									order={order}
									onActivate={() => handleActivateQR(order)}
								/>
							))}
						</div>
					</section>
				)}

				{pastOrders.length > 0 && (
					<section>
						<h2 className="text-sm font-medium text-muted-foreground mb-3">
							지난 내역 ({pastOrders.length})
						</h2>
						<div className="space-y-3">
							{pastOrders.map((order) => (
								<OrderCard key={order.orderId} order={order} isPast />
							))}
						</div>
					</section>
				)}
			</div>

			{selectedOrder && (
				<QRModal
					open={showQRModal}
					onClose={() => {
						setShowQRModal(false);
						setSelectedOrder(null);
					}}
					order={selectedOrder}
				/>
			)}
		</div>
	);
}

interface OrderCardProps {
	order: Order;
	onActivate?: () => void;
	isPast?: boolean;
}

function OrderCard({ order, onActivate, isPast }: OrderCardProps) {
	const status = STATUS_CONFIG[order.status] || {
		label: order.status,
		variant: "outline" as const,
	};
	const menuSummary =
		order.items.length > 1
			? `${order.items[0].menu} 외 ${order.items.length - 1}개`
			: order.items[0]?.menu || "메뉴";

	const formattedDate = format(new Date(order.createdAt), "M월 d일 (E) HH:mm", { locale: ko });

	return (
		<Card
			className={`p-4 ${isPast ? "opacity-60" : ""}`}
			data-testid={`order-card-${order.orderId}`}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-1">
						<Badge variant={status.variant} className="text-xs">
							{status.label}
						</Badge>
						<span className="text-xs text-muted-foreground">#{order.orderNumber}</span>
					</div>
					<p className="font-medium truncate">{menuSummary}</p>
					<p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
						<MapPin className="h-3 w-3" />
						{order.facilityName} {order.cornerType}코너
					</p>
					<div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
						<span className="flex items-center gap-1">
							<Clock className="h-3 w-3" />
							{formattedDate}
						</span>
						<span className="font-medium text-foreground">
							{order.totalAmount.toLocaleString()}원
						</span>
					</div>
				</div>

				{!isPast && (
					<Button
						size="sm"
						onClick={onActivate}
						className="shrink-0"
						data-testid={`btn-activate-${order.orderId}`}
					>
						{order.status === "QR_ACTIVE" ? (
							<>QR 보기</>
						) : order.status === "QR_EXPIRED" ? (
							<>재활성화</>
						) : (
							<>
								<QrCode className="h-4 w-4 mr-1" />
								QR 활성화
							</>
						)}
						<ChevronRight className="h-4 w-4 ml-1" />
					</Button>
				)}
			</div>

			{order.status === "QR_EXPIRED" && !isPast && (
				<div className="mt-3 p-2 bg-yellow-500/10 rounded-lg flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
					<AlertCircle className="h-4 w-4" />
					QR 코드가 만료되었습니다. 다시 활성화해주세요.
				</div>
			)}
		</Card>
	);
}
