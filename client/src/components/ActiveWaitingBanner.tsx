import type { Waiting } from "@shared/schema";
import { ChevronRight, Clock } from "lucide-react";

interface ActiveWaitingBannerProps {
	waiting: Waiting;
	onClick: () => void;
}

export function ActiveWaitingBanner({ waiting, onClick }: ActiveWaitingBannerProps) {
	return (
		<div
			className="bg-primary/10 border-l-4 border-primary p-4 mb-4 cursor-pointer hover:bg-primary/15 transition-colors rounded-r-md"
			onClick={onClick}
			data-testid="banner-active-waiting"
		>
			<div className="flex items-center justify-between gap-2">
				<div className="flex-1 min-w-0">
					<p className="text-sm font-medium truncate">
						{waiting.facilityName} {waiting.cornerType} 코너
					</p>
					<div className="flex items-center gap-2 mt-1">
						<span className="text-2xl font-bold text-primary">{waiting.waitingNumber}번</span>
						<span className="text-muted-foreground">대기 중</span>
					</div>
					<div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
						<Clock className="w-3.5 h-3.5" />
						<span>약 {waiting.estimatedTime}분 후 입장</span>
					</div>
				</div>
				<ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
			</div>
		</div>
	);
}
