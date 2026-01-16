import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchFacilities } from "@/lib/api";
import { useWebSocket } from "./useWebSocket";
import { useCallback } from "react";
import type { Facility } from "@shared/schema";

export function useFacilities() {
  const queryClient = useQueryClient();

  const handleWSUpdate = useCallback(
    (data: { facilities: Facility[]; timestamp: string }) => {
      queryClient.setQueryData(["/api/facilities"], {
        facilities: data.facilities,
        lastUpdate: data.timestamp,
      });
    },
    [queryClient]
  );

  useWebSocket(handleWSUpdate);

  return useQuery({
    queryKey: ["/api/facilities"],
    queryFn: fetchFacilities,
    refetchInterval: 30000,
    staleTime: 10000,
  });
}
