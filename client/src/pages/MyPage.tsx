import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Bell, Loader2, Moon, Sun, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/context/ThemeContext";
import { useDocumentTitle, useMetaDescription } from "@/hooks/useDocumentTitle";
import { fetchHistory } from "@/lib/api";

export function MyPage() {
	useDocumentTitle("마이페이지 - 줄없냥");
	useMetaDescription(
		"내 정보와 이용 내역을 확인하세요. 앱 설정, 다크모드, 알림 설정을 관리할 수 있습니다.",
	);

	const { theme, toggleTheme } = useTheme();
	const { data, isLoading } = useQuery({
		queryKey: ["/api/history"],
		queryFn: fetchHistory,
	});

	const history = data?.history || [];

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "COMPLETED":
				return "default";
			case "CANCELLED":
				return "secondary";
			case "NO_SHOW":
				return "destructive";
			default:
				return "outline";
		}
	};

	return (
		<div className="pb-20" data-testid="page-mypage">
			<div className="max-w-lg mx-auto px-4 py-4 space-y-4">
				<Card>
					<CardContent className="p-6 text-center">
						<Avatar className="w-20 h-20 mx-auto mb-3">
							<AvatarFallback className="bg-muted text-muted-foreground text-2xl">
								<User className="w-10 h-10" />
							</AvatarFallback>
						</Avatar>
						<p className="font-semibold text-lg" data-testid="text-username">
							게스트
						</p>
						<p className="text-sm text-muted-foreground mt-1">로그인하여 더 많은 기능 사용</p>
						<Button className="mt-4" variant="outline" size="sm" data-testid="button-sso-login">
							한양대 SSO 로그인
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base flex items-center gap-2">최근 이용 내역</CardTitle>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className="flex items-center justify-center py-4">
								<Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
							</div>
						) : history.length === 0 ? (
							<p className="text-sm text-muted-foreground text-center py-4">이용 내역이 없습니다</p>
						) : (
							<div className="space-y-3">
								{history.map((item) => (
									<div
										key={item.id}
										className="flex justify-between items-center p-3 bg-muted rounded-lg"
										data-testid={`history-item-${item.id}`}
									>
										<div>
											<p className="font-medium text-sm">{item.facility}</p>
											<p className="text-xs text-muted-foreground">{item.date}</p>
										</div>
										<Badge variant={getStatusBadgeVariant(item.status)}>{item.statusText}</Badge>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<AlertCircle className="w-4 h-4" />
							노쇼 패널티
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Alert>
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								현재 패널티 없음
								<br />
								<span className="text-xs text-muted-foreground">
									노쇼 발생 시 10분간 재등록이 제한됩니다.
								</span>
							</AlertDescription>
						</Alert>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base">설정</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Bell className="w-4 h-4 text-muted-foreground" />
								<div>
									<Label htmlFor="push-notif">푸시 알림</Label>
									<p className="text-xs text-muted-foreground">대기 호출 알림 받기</p>
								</div>
							</div>
							<Switch id="push-notif" defaultChecked data-testid="switch-push-notifications" />
						</div>

						<Separator />

						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								{theme === "dark" ? (
									<Moon className="w-4 h-4 text-muted-foreground" />
								) : (
									<Sun className="w-4 h-4 text-muted-foreground" />
								)}
								<div>
									<Label htmlFor="dark-mode">다크모드</Label>
									<p className="text-xs text-muted-foreground">테마 변경</p>
								</div>
							</div>
							<Switch
								id="dark-mode"
								checked={theme === "dark"}
								onCheckedChange={toggleTheme}
								data-testid="switch-dark-mode"
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4 text-center text-sm text-muted-foreground">
						<p className="font-medium">줄없냥 v1.0.0</p>
						<p className="text-xs mt-1">한양대학교 학생들을 위한 서비스</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
