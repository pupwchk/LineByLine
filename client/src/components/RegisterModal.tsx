import type { Corner, Facility } from "@shared/schema";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface RegisterModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	corner: Corner | null;
	facility: Facility | null;
	onConfirm: () => void;
	isLoading?: boolean;
}

export function RegisterModal({
	open,
	onOpenChange,
	corner,
	facility,
	onConfirm,
	isLoading,
}: RegisterModalProps) {
	if (!corner || !facility) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[400px]">
				<DialogHeader>
					<DialogTitle>대기 등록 확인</DialogTitle>
					<DialogDescription>선택한 코너에 대기 등록을 하시겠습니까?</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div>
						<p className="font-semibold text-lg">{facility.name}</p>
						<p className="text-sm text-muted-foreground">
							{corner.type} - {corner.menu || corner.name}
						</p>
					</div>

					<Separator />

					<div className="grid grid-cols-2 gap-4">
						<div className="bg-muted rounded-lg p-3 text-center">
							<p className="text-xs text-muted-foreground mb-1">현재 대기</p>
							<p className="font-semibold text-xl">{corner.currentQueue}명</p>
						</div>
						<div className="bg-muted rounded-lg p-3 text-center">
							<p className="text-xs text-muted-foreground mb-1">예상 시간</p>
							<p className="font-semibold text-xl">{corner.waitTime}분</p>
						</div>
					</div>

					<Alert>
						<AlertCircle className="h-4 w-4" />
						<AlertDescription className="text-xs">
							호출 후 5분 내 미응답 시 자동 취소됩니다.
						</AlertDescription>
					</Alert>
				</div>

				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isLoading}
						data-testid="button-modal-cancel"
					>
						취소
					</Button>
					<Button onClick={onConfirm} disabled={isLoading} data-testid="button-modal-confirm">
						{isLoading ? "등록 중..." : "등록 확인"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
