import type { Waiting } from "@shared/schema";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Bell, Clock, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface ActiveWaitingCardProps {
	waiting: Waiting;
	onCancel: () => void;
	isCancelling?: boolean;
}

export function ActiveWaitingCard({ waiting, onCancel, isCancelling }: ActiveWaitingCardProps) {
	const registeredTime = format(new Date(waiting.registeredAt), "HH:mm", { locale: ko });

	return (
		<Card className="border-2 border-primary" data-testid="card-active-waiting">
			<CardHeader className="text-center pb-3">
				<div className="flex items-center justify-center gap-2 mb-2">
					<span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
						<Bell className="w-4 h-4 text-primary" />
					</span>
				</div>
				<CardTitle className="text-4xl font-bold text-primary" data-testid="text-waiting-number">
					{waiting.waitingNumber}번
				</CardTitle>
				<CardDescription>내 대기번호</CardDescription>
			</CardHeader>

			<CardContent>
				<div className="space-y-4">
					<div className="text-center bg-muted rounded-lg p-4">
						<p className="text-sm text-muted-foreground mb-1">현재 호출</p>
						<p className="text-3xl font-bold" data-testid="text-current-calling">
							{waiting.currentCalling}번
						</p>
					</div>

					<div className="flex items-center justify-center gap-2 text-foreground">
						<Users className="w-5 h-5 text-muted-foreground" />
						<p className="text-lg">
							<span className="font-semibold" data-testid="text-waiting-ahead">
								{waiting.waitingAhead}명
							</span>{" "}
							앞에 대기 중
						</p>
					</div>

					<div className="flex items-center justify-center gap-2 text-foreground">
						<Clock className="w-5 h-5 text-muted-foreground" />
						<p className="text-lg">
							약{" "}
							<span className="font-semibold" data-testid="text-estimated-time">
								{waiting.estimatedTime}분
							</span>{" "}
							후 입장
						</p>
					</div>

					<div className="text-center pt-2 border-t border-border">
						<p className="text-sm text-muted-foreground" data-testid="text-facility-info">
							{waiting.facilityName} - {waiting.cornerType}
						</p>
						{waiting.menu && (
							<p className="text-sm font-medium mt-1" data-testid="text-menu">
								{waiting.menu}
							</p>
						)}
					</div>

					<p className="text-center text-xs text-muted-foreground" data-testid="text-registered-at">
						{registeredTime} 등록
					</p>
				</div>
			</CardContent>

			<CardFooter className="pt-0">
				<Button
					variant="destructive"
					className="w-full"
					onClick={onCancel}
					disabled={isCancelling}
					data-testid="button-cancel-waiting"
				>
					{isCancelling ? (
						<>
							<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							취소 중...
						</>
					) : (
						"대기 취소"
					)}
				</Button>
			</CardFooter>
		</Card>
	);
}
