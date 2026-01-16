import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, Clock, CreditCard } from "lucide-react";
import { format, addMinutes } from "date-fns";
import { ko } from "date-fns/locale";
import { PaymentDialog } from "./PaymentDialog";

export function CartSheet() {
  const {
    items,
    isOpen,
    closeCart,
    facilityName,
    updateQuantity,
    removeItem,
    totalAmount,
    totalItems,
  } = useCart();

  const [pickupType, setPickupType] = useState<"now" | "scheduled">("now");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [showPayment, setShowPayment] = useState(false);

  const generateTimeSlots = () => {
    const now = new Date();
    const slots: string[] = [];
    const roundedMinutes = Math.ceil(now.getMinutes() / 10) * 10;
    let startTime = new Date(now);
    startTime.setMinutes(roundedMinutes, 0, 0);

    for (let i = 1; i <= 6; i++) {
      const slotTime = addMinutes(startTime, i * 10);
      if (slotTime.getHours() < 22) {
        slots.push(format(slotTime, "HH:mm"));
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleProceedToPayment = () => {
    if (pickupType === "scheduled" && !selectedTime) return;
    setShowPayment(true);
  };

  const getPickupTime = () => {
    if (pickupType === "now") {
      return format(addMinutes(new Date(), 5), "HH:mm");
    }
    return selectedTime;
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="flex items-center gap-2" data-testid="cart-title">
              {facilityName || "장바구니"} ({totalItems}개)
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4 space-y-3 max-h-[calc(85vh-220px)]">
            {items.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground" data-testid="cart-empty">
                장바구니가 비어있습니다
              </div>
            ) : (
              items.map((item) => (
                <Card key={item.id} className="p-3" data-testid={`cart-item-${item.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.menu}</p>
                      <p className="text-muted-foreground text-xs">{item.cornerType}코너</p>
                      <p className="font-semibold text-primary mt-1">
                        {(item.price * item.quantity).toLocaleString()}원
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        data-testid={`btn-decrease-${item.id}`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= 5}
                        data-testid={`btn-increase-${item.id}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive"
                        onClick={() => removeItem(item.id)}
                        data-testid={`btn-remove-${item.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t pt-4 space-y-4">
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  수령 시간
                </p>
                <div className="flex gap-2 mb-2">
                  <Button
                    size="sm"
                    variant={pickupType === "now" ? "default" : "outline"}
                    onClick={() => setPickupType("now")}
                    data-testid="btn-pickup-now"
                  >
                    바로 수령
                  </Button>
                  <Button
                    size="sm"
                    variant={pickupType === "scheduled" ? "default" : "outline"}
                    onClick={() => setPickupType("scheduled")}
                    data-testid="btn-pickup-scheduled"
                  >
                    예약 수령
                  </Button>
                </div>
                {pickupType === "scheduled" && (
                  <div className="flex gap-2 flex-wrap">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        size="sm"
                        variant={selectedTime === time ? "default" : "outline"}
                        onClick={() => setSelectedTime(time)}
                        data-testid={`btn-time-${time}`}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              <SheetFooter className="flex-col gap-2">
                <div className="flex justify-between items-center w-full">
                  <span className="font-medium">총 결제금액</span>
                  <span className="text-lg font-bold text-primary" data-testid="cart-total">
                    {totalAmount.toLocaleString()}원
                  </span>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleProceedToPayment}
                  disabled={pickupType === "scheduled" && !selectedTime}
                  data-testid="btn-proceed-payment"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  결제하기
                </Button>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <PaymentDialog
        open={showPayment}
        onClose={() => setShowPayment(false)}
        pickupType={pickupType}
        pickupTime={getPickupTime()}
      />
    </>
  );
}
