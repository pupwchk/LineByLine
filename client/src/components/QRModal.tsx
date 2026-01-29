import type { Order } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Clock, Loader2, MapPin, QrCode } from "lucide-react";
import QRCodeLib from "qrcode";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface QRModalProps {
	open: boolean;
	onClose: () => void;
	order: Order;
}

export function QRModal({ open, onClose, order }: QRModalProps) {
	const [step, setStep] = useState<"location" | "qr" | "expired">("location");
	const [qrDataUrl, setQrDataUrl] = useState<string>("");
	const [remainingSeconds, setRemainingSeconds] = useState(180);
	const [locationError, setLocationError] = useState<string | null>(null);
	const [currentOrder, setCurrentOrder] = useState(order);
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const generateQRCode = useCallback(async (data: string) => {
		try {
			const url = await QRCodeLib.toDataURL(data, {
				width: 256,
				margin: 2,
				color: { dark: "#000000", light: "#ffffff" },
			});
			setQrDataUrl(url);
		} catch (error) {
			console.error("QR generation failed:", error);
		}
	}, []);

	useEffect(() => {
		setCurrentOrder(order);
		if (order.status === "QR_ACTIVE" && order.qrExpiresAt) {
			const expiresAt = new Date(order.qrExpiresAt).getTime();
			const now = Date.now();
			const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
			if (remaining > 0) {
				setRemainingSeconds(remaining);
				setStep("qr");
				generateQRCode(order.qrCode || "");
			} else {
				setStep("expired");
			}
		} else if (order.status === "QR_EXPIRED") {
			setStep("location");
		} else if (order.status === "PAID") {
			setStep("location");
		}
	}, [order, generateQRCode]);

	useEffect(() => {
		if (step !== "qr" || remainingSeconds <= 0) return;

		const timer = setInterval(() => {
			setRemainingSeconds((prev) => {
				if (prev <= 1) {
					setStep("expired");
					queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [step, queryClient, remainingSeconds]);

	const activateMutation = useMutation({
		mutationFn: async (location: { lat: number; lng: number }) => {
			const response = await apiRequest("POST", `/api/orders/${currentOrder.orderId}/activate-qr`, {
				userLocation: location,
			});
			return response.json();
		},
		onSuccess: async (data) => {
			if (data.success && data.order) {
				setCurrentOrder(data.order);
				setRemainingSeconds(180);
				await generateQRCode(data.order.qrCode || "");
				setStep("qr");
				queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
			} else {
				setLocationError(data.message || "QR 활성화에 실패했습니다");
			}
		},
		onError: () => {
			toast({
				title: "오류",
				description: "서버 오류가 발생했습니다",
				variant: "destructive",
			});
		},
	});

	const handleActivate = useCallback(() => {
		setLocationError(null);

		if (!navigator.geolocation) {
			setLocationError("이 브라우저에서는 위치 서비스를 지원하지 않습니다");
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				activateMutation.mutate({
					lat: position.coords.latitude,
					lng: position.coords.longitude,
				});
			},
			(error) => {
				switch (error.code) {
					case error.PERMISSION_DENIED:
						setLocationError("위치 권한이 거부되었습니다. 설정에서 위치 권한을 허용해주세요.");
						break;
					case error.POSITION_UNAVAILABLE:
						setLocationError("위치 정보를 가져올 수 없습니다.");
						break;
					case error.TIMEOUT:
						setLocationError("위치 요청 시간이 초과되었습니다.");
						break;
					default:
						setLocationError("위치 정보를 가져오는 중 오류가 발생했습니다.");
				}
			},
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
		);
	}, [activateMutation]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const handleClose = () => {
		setLocationError(null);
		onClose();
	};

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
			<DialogContent className="max-w-sm mx-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2" data-testid="qr-modal-title">
						<QrCode className="h-5 w-5" />
						{step === "qr" ? "QR 코드" : "QR 활성화"}
					</DialogTitle>
				</DialogHeader>

				{step === "location" && (
					<div className="py-4 space-y-4">
						<div className="p-4 bg-muted rounded-lg space-y-2">
							<p className="font-medium">{currentOrder.items[0]?.menu}</p>
							<p className="text-sm text-muted-foreground flex items-center gap-1">
								<MapPin className="h-3 w-3" />
								{currentOrder.facilityName} {currentOrder.cornerType}코너
							</p>
							<p className="text-sm font-medium text-primary">
								{currentOrder.totalAmount.toLocaleString()}원
							</p>
						</div>

						<div className="text-center space-y-3">
							<div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
								<MapPin className="h-8 w-8 text-primary" />
							</div>
							<div>
								<p className="font-medium">위치 확인이 필요합니다</p>
								<p className="text-sm text-muted-foreground">
									식당에서 50m 이내에서만 QR 활성화가 가능합니다
								</p>
							</div>
						</div>

						{locationError && (
							<div className="p-3 bg-destructive/10 rounded-lg flex items-start gap-2">
								<AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
								<p className="text-sm text-destructive" data-testid="location-error">
									{locationError}
								</p>
							</div>
						)}

						<Button
							className="w-full"
							size="lg"
							onClick={handleActivate}
							disabled={activateMutation.isPending}
							data-testid="btn-check-location"
						>
							{activateMutation.isPending ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									위치 확인 중...
								</>
							) : (
								<>
									<MapPin className="h-4 w-4 mr-2" />
									위치 확인하고 QR 활성화
								</>
							)}
						</Button>
					</div>
				)}

				{step === "qr" && (
					<div className="py-4 space-y-4">
						<div className="text-center">
							<div
								className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
									remainingSeconds <= 30
										? "bg-destructive/10 text-destructive"
										: remainingSeconds <= 60
											? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
											: "bg-green-500/10 text-green-600 dark:text-green-400"
								}`}
							>
								<Clock className="h-4 w-4" />
								<span className="font-mono font-bold text-lg" data-testid="qr-timer">
									{formatTime(remainingSeconds)}
								</span>
							</div>
						</div>

						<div className="bg-white p-4 rounded-xl mx-auto w-fit">
							{qrDataUrl ? (
								<img
									src={qrDataUrl}
									alt="QR Code"
									className="w-56 h-56"
									data-testid="qr-code-image"
								/>
							) : (
								<div className="w-56 h-56 flex items-center justify-center">
									<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
								</div>
							)}
						</div>

						<div className="text-center space-y-1">
							<p className="text-sm text-muted-foreground">주문번호</p>
							<p className="font-mono font-bold text-xl" data-testid="qr-order-number">
								#{currentOrder.orderNumber}
							</p>
						</div>

						<div className="p-3 bg-muted rounded-lg text-center">
							<p className="text-sm">
								키오스크에서 QR 코드를 스캔하면
								<br />
								바로 음식을 수령할 수 있습니다
							</p>
						</div>
					</div>
				)}

				{step === "expired" && (
					<div className="py-8 space-y-4 text-center">
						<div className="w-16 h-16 mx-auto rounded-full bg-yellow-500/10 flex items-center justify-center">
							<AlertCircle className="h-8 w-8 text-yellow-500" />
						</div>
						<div>
							<p className="font-medium text-lg" data-testid="qr-expired-message">
								QR 코드가 만료되었습니다
							</p>
							<p className="text-sm text-muted-foreground mt-1">
								식당 근처에서 다시 활성화해주세요
							</p>
						</div>
						<Button
							className="w-full"
							size="lg"
							onClick={() => setStep("location")}
							data-testid="btn-reactivate"
						>
							다시 활성화하기
						</Button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
