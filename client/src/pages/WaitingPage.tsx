import { Clock, Loader2 } from "lucide-react";
import { useState } from "react";
import { ActiveWaitingCard } from "@/components/ActiveWaitingCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { WaitingTimeline } from "@/components/WaitingTimeline";
import { useWaiting } from "@/context/WaitingContext";
import { useDocumentTitle, useMetaDescription } from "@/hooks/useDocumentTitle";

export function WaitingPage() {
	useDocumentTitle("내 대기 - 줄없냥");
	useMetaDescription(
		"현재 대기 상태를 확인하세요. 대기 순번, 예상 시간, 알림 설정을 관리할 수 있습니다.",
	);

	const { activeWaiting, cancelActiveWaiting, isLoading, isCancelling } = useWaiting();
	const [notifications, setNotifications] = useState({
		threeBefore: true,
		oneBefore: true,
	});

	if (isLoading) {
		return (
			<div className="pb-20" data-testid="page-waiting-loading">
				<div className="max-w-lg mx-auto px-4 py-4">
					<div className="flex flex-col items-center justify-center h-[60vh]">
						<Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
						<p className="text-muted-foreground">로딩 중...</p>
					</div>
				</div>
			</div>
		);
	}

	if (!activeWaiting) {
		return (
			<div className="pb-20" data-testid="page-waiting-empty">
				<div className="max-w-lg mx-auto px-4 py-4">
					<div className="flex flex-col items-center justify-center h-[60vh]">
						<div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
							<Clock className="w-10 h-10 text-muted-foreground" />
						</div>
						<p className="text-muted-foreground text-center">대기 중인 항목이 없습니다</p>
						<p className="text-sm text-muted-foreground mt-2 text-center">
							홈에서 원하는 시설의 대기 등록을 해보세요
						</p>
					</div>
				</div>
			</div>
		);
	}

	const timelineSteps = [
		{
			label: "등록 완료",
			status: "complete" as const,
		},
		{
			label: "3번 전 알림",
			status: activeWaiting.waitingAhead <= 3 ? ("complete" as const) : ("pending" as const),
		},
		{
			label: "1번 전 알림",
			status: activeWaiting.waitingAhead <= 1 ? ("complete" as const) : ("pending" as const),
		},
		{
			label: "입장 호출",
			status: "pending" as const,
		},
	];

	const handleCancel = async () => {
		await cancelActiveWaiting();
	};

	return (
		<div className="pb-20" data-testid="page-waiting">
			<div className="max-w-lg mx-auto px-4 py-4 space-y-4">
				<ActiveWaitingCard
					waiting={activeWaiting}
					onCancel={handleCancel}
					isCancelling={isCancelling}
				/>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base">대기 진행 상황</CardTitle>
					</CardHeader>
					<CardContent>
						<WaitingTimeline steps={timelineSteps} />
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base">알림 설정</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<Label htmlFor="notif-three" className="cursor-pointer">
								3번 전 알림
							</Label>
							<Switch
								id="notif-three"
								checked={notifications.threeBefore}
								onCheckedChange={(v) => setNotifications({ ...notifications, threeBefore: v })}
								data-testid="switch-three-before"
							/>
						</div>
						<div className="flex items-center justify-between">
							<Label htmlFor="notif-one" className="cursor-pointer">
								1번 전 알림
							</Label>
							<Switch
								id="notif-one"
								checked={notifications.oneBefore}
								onCheckedChange={(v) => setNotifications({ ...notifications, oneBefore: v })}
								data-testid="switch-one-before"
							/>
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Label className="text-muted-foreground">호출 알림</Label>
								<span className="text-xs text-muted-foreground">(필수)</span>
							</div>
							<Switch checked disabled />
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
