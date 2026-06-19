import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Only retry once in mobile development to conserve network/battery
      refetchOnWindowFocus: false, // Prevents excessive refetches when app loses/gains focus
      staleTime: 1000 * 60 * 5, // Cache queries for 5 minutes by default
    },
  },
});
