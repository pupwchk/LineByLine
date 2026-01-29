import type { Corner, Facility } from "@shared/schema";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCongestionText } from "@/lib/mock-data";
import { CongestionBar } from "./CongestionBar";

interface CongestionCardProps {
	corner: Corner;
	facility: Facility;
	onRegister: (corner: Corner, facility: Facility) => void;
	onViewDetail?: (facility: Facility) => void;
	disabled?: boolean;
	isFutureDate?: boolean;
	isPrediction?: boolean;
}

export function CongestionCard({
	corner,
	facility,
	onRegister,
	onViewDetail,
	disabled,
	isFutureDate = false,
	isPrediction = false,
}: CongestionCardProps) {
	const isFull = corner.congestion >= 5;
	const isLibraryOrGym = facility.type === "LIBRARY" || facility.type === "GYM";

	const displayMenu = corner.menu || corner.name;
	const isFutureDateMenu = corner.menu === "[음식메뉴] - 추후구현";

	return (
		<Card
			className="transition-all duration-200 hover:shadow-md cursor-pointer border-card-border"
			onClick={() => onViewDetail?.(facility)}
			data-testid={`card-corner-${corner.id}`}
		>
			<CardContent className="p-4">
				<div className="flex justify-between items-start gap-4 mb-3">
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-1.5 mb-2">
							<Badge variant="outline" className="text-xs">
								{corner.type}
							</Badge>
							{isPrediction && (
								<Badge variant="secondary" className="text-xs gap-0.5 py-0">
									<TrendingUp className="w-2.5 h-2.5" />
									예측
								</Badge>
							)}
						</div>
						{displayMenu ? (
							<>
								<h3
									className="font-semibold text-base mb-1 line-clamp-1"
									data-testid={`text-menu-${corner.id}`}
								>
									{displayMenu}
								</h3>
								{corner.price !== undefined && !isFutureDateMenu && (
									<p className="text-sm text-muted-foreground">{corner.price.toLocaleString()}원</p>
								)}
								{isFutureDateMenu && <p className="text-sm text-muted-foreground">가격 미정</p>}
							</>
						) : (
							<h3 className="font-semibold text-base" data-testid={`text-corner-name-${corner.id}`}>
								{corner.name}
							</h3>
						)}
					</div>

					<div className="flex flex-col items-end shrink-0">
						<CongestionBar level={corner.congestion} />
						<p className="text-xs mt-1.5 font-medium text-muted-foreground">
							{getCongestionText(corner.congestion)}
							{isPrediction && <span className="ml-1 opacity-70">(예상)</span>}
						</p>
					</div>
				</div>

				<div className="flex justify-between items-center gap-2">
					{isLibraryOrGym ? (
						<p className="text-sm text-muted-foreground">
							<span className="font-semibold text-foreground">{corner.available}</span>/
							{corner.capacity}석 {isPrediction ? "예상" : "이용가능"}
						</p>
					) : (
						<p className="text-sm text-muted-foreground">
							{isPrediction ? "예상 대기" : "예상 대기"}:{" "}
							<span className="font-semibold text-foreground">{corner.waitTime}분</span>
						</p>
					)}

					{!isLibraryOrGym && (
						<Button
							size="sm"
							onClick={(e) => {
								e.stopPropagation();
								onRegister(corner, facility);
							}}
							disabled={disabled || isFull}
							data-testid={`button-register-${corner.id}`}
						>
							{isFutureDate ? "예약 불가" : isFull ? "마감" : "대기 등록"}
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
