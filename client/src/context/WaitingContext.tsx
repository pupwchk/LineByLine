import { createContext, useContext, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createWaiting, cancelWaiting, fetchWaiting } from "@/lib/api";
import type { Waiting, InsertWaiting, Corner } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface WaitingContextType {
  activeWaiting: Waiting | null;
  isLoading: boolean;
  registerWaiting: (data: InsertWaiting, corner: Corner) => Promise<void>;
  cancelActiveWaiting: () => Promise<void>;
  isCancelling: boolean;
  isRegistering: boolean;
}

const WaitingContext = createContext<WaitingContextType | null>(null);

export function WaitingProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/waiting"],
    queryFn: fetchWaiting,
  });

  const registerMutation = useMutation({
    mutationFn: createWaiting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/waiting"] });
      toast({
        title: "대기 등록 완료",
        description: "대기 등록이 완료되었습니다.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "등록 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelWaiting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/waiting"] });
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      toast({
        title: "대기 취소",
        description: "대기가 취소되었습니다.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "취소 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerWaiting = async (insertData: InsertWaiting, _corner: Corner) => {
    await registerMutation.mutateAsync(insertData);
  };

  const cancelActiveWaiting = async () => {
    await cancelMutation.mutateAsync();
  };

  return (
    <WaitingContext.Provider
      value={{
        activeWaiting: data?.waiting || null,
        isLoading,
        registerWaiting,
        cancelActiveWaiting,
        isCancelling: cancelMutation.isPending,
        isRegistering: registerMutation.isPending,
      }}
    >
      {children}
    </WaitingContext.Provider>
  );
}

export function useWaiting() {
  const context = useContext(WaitingContext);
  if (!context) {
    throw new Error("useWaiting must be used within a WaitingProvider");
  }
  return context;
}
