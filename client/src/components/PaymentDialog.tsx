import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { CreditCard, Smartphone, Building2, Check, Loader2 } from "lucide-react";
import type { Order, OrderItem } from "@shared/schema";

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  pickupType: "now" | "scheduled";
  pickupTime: string;
}

const PAYMENT_METHODS = [
  { id: "kakao", name: "카카오페이", icon: Smartphone, color: "bg-amber-400 dark:bg-amber-500" },
  { id: "toss", name: "토스페이", icon: Smartphone, color: "bg-sky-500 dark:bg-sky-600" },
  { id: "card", name: "신용/체크카드", icon: CreditCard, color: "bg-slate-500 dark:bg-slate-600" },
  { id: "bank", name: "계좌이체", icon: Building2, color: "bg-emerald-500 dark:bg-emerald-600" },
];

export function PaymentDialog({ open, onClose, pickupType, pickupTime }: PaymentDialogProps) {
  const { items, facilityId, facilityName, facilityLocation, cornerId, cornerType, totalAmount, clearCart } = useCart();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [step, setStep] = useState<"select" | "processing" | "complete">("select");
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!facilityId || !facilityName || !facilityLocation || !cornerId || !cornerType || !selectedMethod) {
        throw new Error("Missing required data");
      }

      const orderItems: OrderItem[] = items.map(item => ({
        id: item.id,
        menuId: item.menuId,
        menu: item.menu,
        quantity: item.quantity,
        price: item.price,
      }));

      const response = await apiRequest("POST", "/api/orders", {
        facilityId,
        facilityName,
        facilityLocation,
        cornerId,
        cornerType,
        items: orderItems,
        totalAmount,
        pickupType,
        pickupTime,
        paymentMethod: selectedMethod,
      });

      return response.json() as Promise<{ success: boolean; order: Order }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setStep("complete");
    },
    onError: (error) => {
      toast({
        title: "결제 실패",
        description: error instanceof Error ? error.message : "결제 중 오류가 발생했습니다",
        variant: "destructive",
      });
      setStep("select");
    },
  });

  const handlePayment = async () => {
    if (!selectedMethod) return;
    setStep("processing");
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    createOrderMutation.mutate();
  };

  const handleComplete = () => {
    clearCart();
    onClose();
    setStep("select");
    setSelectedMethod(null);
    navigate("/orders");
  };

  const handleClose = () => {
    if (step === "processing") return;
    onClose();
    setStep("select");
    setSelectedMethod(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-md mx-auto">
        {step === "select" && (
          <>
            <DialogHeader>
              <DialogTitle data-testid="payment-title">결제 수단 선택</DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">결제 금액</span>
                  <span className="text-lg font-bold" data-testid="payment-amount">
                    {totalAmount.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-muted-foreground">수령 시간</span>
                  <span className="text-sm font-medium" data-testid="payment-pickup-time">
                    {pickupTime}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {PAYMENT_METHODS.map((method) => (
                  <Card
                    key={method.id}
                    className={`p-3 cursor-pointer transition-all hover-elevate ${
                      selectedMethod === method.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedMethod(method.id)}
                    data-testid={`payment-method-${method.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${method.color} flex items-center justify-center`}>
                        <method.icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium">{method.name}</span>
                      {selectedMethod === method.id && (
                        <Check className="h-5 w-5 text-primary ml-auto" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handlePayment}
              disabled={!selectedMethod}
              data-testid="btn-confirm-payment"
            >
              {totalAmount.toLocaleString()}원 결제하기
            </Button>
          </>
        )}

        {step === "processing" && (
          <div className="py-12 flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium" data-testid="payment-processing">결제 처리 중...</p>
            <p className="text-sm text-muted-foreground">잠시만 기다려주세요</p>
          </div>
        )}

        {step === "complete" && (
          <div className="py-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="h-8 w-8 text-white" />
            </div>
            <p className="text-xl font-bold" data-testid="payment-complete">결제 완료!</p>
            <p className="text-sm text-muted-foreground text-center">
              식당에 도착하면 식권 탭에서
              <br />
              QR 코드를 활성화해주세요
            </p>
            <Button className="w-full mt-4" size="lg" onClick={handleComplete} data-testid="btn-view-orders">
              식권 보관함으로 이동
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
